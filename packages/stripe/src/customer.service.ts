import { stripe } from './stripe-client';
import type { Stripe } from 'stripe';

export class CustomerService {
  /**
   * Create a new Stripe customer for an organization
   */
  async createCustomer(params: {
    organizationId: string;
    email: string;
    name?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: {
        organizationId: params.organizationId,
        ...params.metadata,
      },
    });

    return customer;
  }

  /**
   * Retrieve a customer by Stripe customer ID
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        return null;
      }
      return customer as Stripe.Customer;
    } catch (error) {
      console.error('Error retrieving customer:', error);
      return null;
    }
  }

  /**
   * Update customer details
   */
  async updateCustomer(
    customerId: string,
    params: {
      email?: string;
      name?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<Stripe.Customer> {
    const customer = await stripe.customers.update(customerId, params);
    return customer;
  }

  /**
   * Delete a customer (soft delete in Stripe)
   */
  async deleteCustomer(customerId: string): Promise<Stripe.DeletedCustomer> {
    const deleted = await stripe.customers.del(customerId);
    return deleted;
  }

  /**
   * List all payment methods for a customer
   */
  async listPaymentMethods(
    customerId: string,
    type: 'card' | 'us_bank_account' = 'card'
  ): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type,
    });

    return paymentMethods.data;
  }

  /**
   * Get the default payment method for a customer
   */
  async getDefaultPaymentMethod(customerId: string): Promise<Stripe.PaymentMethod | null> {
    const customer = await this.getCustomer(customerId);
    if (!customer || !customer.invoice_settings.default_payment_method) {
      return null;
    }

    const paymentMethodId = customer.invoice_settings.default_payment_method;
    if (typeof paymentMethodId === 'string') {
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      return paymentMethod;
    }

    return null;
  }

  /**
   * Set default payment method for a customer
   */
  async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<Stripe.Customer> {
    const customer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return customer;
  }

  /**
   * Attach a payment method to a customer
   */
  async attachPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<Stripe.PaymentMethod> {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    return paymentMethod;
  }

  /**
   * Detach a payment method from a customer
   */
  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    return paymentMethod;
  }
}