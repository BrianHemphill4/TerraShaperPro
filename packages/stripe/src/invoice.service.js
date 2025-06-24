"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const stripe_client_1 = require("./stripe-client");
class InvoiceService {
    /**
     * Retrieve an invoice
     */
    async getInvoice(invoiceId) {
        try {
            const invoice = await stripe_client_1.stripe.invoices.retrieve(invoiceId);
            return invoice;
        }
        catch (error) {
            console.error('Error retrieving invoice:', error);
            return null;
        }
    }
    /**
     * List invoices for a customer
     */
    async listInvoices(customerId, params = {}) {
        const invoices = await stripe_client_1.stripe.invoices.list({
            customer: customerId,
            status: params.status,
            limit: params.limit || 10,
            starting_after: params.starting_after,
        });
        return invoices.data;
    }
    /**
     * Create a manual invoice
     */
    async createInvoice(params) {
        const invoice = await stripe_client_1.stripe.invoices.create({
            customer: params.customerId,
            description: params.description,
            metadata: params.metadata,
            auto_advance: params.auto_advance ?? true,
        });
        return invoice;
    }
    /**
     * Add line items to an invoice
     */
    async addInvoiceItem(params) {
        const item = await stripe_client_1.stripe.invoiceItems.create({
            customer: params.customerId,
            invoice: params.invoiceId,
            amount: params.amount,
            currency: params.currency || 'usd',
            description: params.description,
            metadata: params.metadata,
        });
        return item;
    }
    /**
     * Finalize an invoice (make it ready for payment)
     */
    async finalizeInvoice(invoiceId, params = {}) {
        const invoice = await stripe_client_1.stripe.invoices.finalizeInvoice(invoiceId, {
            auto_advance: params.auto_advance ?? true,
        });
        return invoice;
    }
    /**
     * Send an invoice to the customer
     */
    async sendInvoice(invoiceId) {
        const invoice = await stripe_client_1.stripe.invoices.sendInvoice(invoiceId);
        return invoice;
    }
    /**
     * Pay an invoice manually
     */
    async payInvoice(invoiceId, params = {}) {
        const invoice = await stripe_client_1.stripe.invoices.pay(invoiceId, {
            payment_method: params.paymentMethodId,
            source: params.source,
        });
        return invoice;
    }
    /**
     * Void an invoice
     */
    async voidInvoice(invoiceId) {
        const invoice = await stripe_client_1.stripe.invoices.voidInvoice(invoiceId);
        return invoice;
    }
    /**
     * Mark an invoice as uncollectible
     */
    async markUncollectible(invoiceId) {
        const invoice = await stripe_client_1.stripe.invoices.markUncollectible(invoiceId);
        return invoice;
    }
    /**
     * Retrieve upcoming invoice (preview next invoice)
     */
    async getUpcomingInvoice(customerId, params = {}) {
        try {
            const invoice = await stripe_client_1.stripe.invoices.retrieveUpcoming({
                customer: customerId,
                subscription: params.subscriptionId,
            });
            return invoice;
        }
        catch (error) {
            console.error('Error retrieving upcoming invoice:', error);
            return null;
        }
    }
    /**
     * Download invoice PDF
     */
    async getInvoicePdfUrl(invoiceId) {
        const invoice = await this.getInvoice(invoiceId);
        return invoice?.invoice_pdf || null;
    }
}
exports.InvoiceService = InvoiceService;
