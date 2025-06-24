import type { Stripe } from 'stripe';
export declare class CustomerService {
    /**
     * Create a new Stripe customer for an organization
     */
    createCustomer(params: {
        organizationId: string;
        email: string;
        name?: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe.Customer>;
    /**
     * Retrieve a customer by Stripe customer ID
     */
    getCustomer(customerId: string): Promise<Stripe.Customer | null>;
    /**
     * Update customer details
     */
    updateCustomer(customerId: string, params: {
        email?: string;
        name?: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe.Customer>;
    /**
     * Delete a customer (soft delete in Stripe)
     */
    deleteCustomer(customerId: string): Promise<Stripe.DeletedCustomer>;
    /**
     * List all payment methods for a customer
     */
    listPaymentMethods(customerId: string, type?: 'card' | 'us_bank_account'): Promise<Stripe.PaymentMethod[]>;
    /**
     * Get the default payment method for a customer
     */
    getDefaultPaymentMethod(customerId: string): Promise<Stripe.PaymentMethod | null>;
    /**
     * Set default payment method for a customer
     */
    setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<Stripe.Customer>;
    /**
     * Attach a payment method to a customer
     */
    attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<Stripe.PaymentMethod>;
    /**
     * Detach a payment method from a customer
     */
    detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod>;
}
