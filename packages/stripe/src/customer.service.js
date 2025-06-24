"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const stripe_client_1 = require("./stripe-client");
class CustomerService {
    /**
     * Create a new Stripe customer for an organization
     */
    async createCustomer(params) {
        const customer = await stripe_client_1.stripe.customers.create({
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
    async getCustomer(customerId) {
        try {
            const customer = await stripe_client_1.stripe.customers.retrieve(customerId);
            if (customer.deleted) {
                return null;
            }
            return customer;
        }
        catch (error) {
            console.error('Error retrieving customer:', error);
            return null;
        }
    }
    /**
     * Update customer details
     */
    async updateCustomer(customerId, params) {
        const customer = await stripe_client_1.stripe.customers.update(customerId, params);
        return customer;
    }
    /**
     * Delete a customer (soft delete in Stripe)
     */
    async deleteCustomer(customerId) {
        const deleted = await stripe_client_1.stripe.customers.del(customerId);
        return deleted;
    }
    /**
     * List all payment methods for a customer
     */
    async listPaymentMethods(customerId, type = 'card') {
        const paymentMethods = await stripe_client_1.stripe.paymentMethods.list({
            customer: customerId,
            type,
        });
        return paymentMethods.data;
    }
    /**
     * Get the default payment method for a customer
     */
    async getDefaultPaymentMethod(customerId) {
        const customer = await this.getCustomer(customerId);
        if (!customer || !customer.invoice_settings.default_payment_method) {
            return null;
        }
        const paymentMethodId = customer.invoice_settings.default_payment_method;
        if (typeof paymentMethodId === 'string') {
            const paymentMethod = await stripe_client_1.stripe.paymentMethods.retrieve(paymentMethodId);
            return paymentMethod;
        }
        return null;
    }
    /**
     * Set default payment method for a customer
     */
    async setDefaultPaymentMethod(customerId, paymentMethodId) {
        const customer = await stripe_client_1.stripe.customers.update(customerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });
        return customer;
    }
    /**
     * Attach a payment method to a customer
     */
    async attachPaymentMethod(customerId, paymentMethodId) {
        const paymentMethod = await stripe_client_1.stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });
        return paymentMethod;
    }
    /**
     * Detach a payment method from a customer
     */
    async detachPaymentMethod(paymentMethodId) {
        const paymentMethod = await stripe_client_1.stripe.paymentMethods.detach(paymentMethodId);
        return paymentMethod;
    }
}
exports.CustomerService = CustomerService;
