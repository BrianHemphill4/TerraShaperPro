import type { Stripe } from 'stripe';
export declare class InvoiceService {
    /**
     * Retrieve an invoice
     */
    getInvoice(invoiceId: string): Promise<Stripe.Invoice | null>;
    /**
     * List invoices for a customer
     */
    listInvoices(customerId: string, params?: {
        status?: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
        limit?: number;
        starting_after?: string;
    }): Promise<Stripe.Invoice[]>;
    /**
     * Create a manual invoice
     */
    createInvoice(params: {
        customerId: string;
        description?: string;
        metadata?: Record<string, string>;
        auto_advance?: boolean;
    }): Promise<Stripe.Invoice>;
    /**
     * Add line items to an invoice
     */
    addInvoiceItem(params: {
        customerId: string;
        invoiceId?: string;
        amount: number;
        currency?: string;
        description: string;
        metadata?: Record<string, string>;
    }): Promise<Stripe.InvoiceItem>;
    /**
     * Finalize an invoice (make it ready for payment)
     */
    finalizeInvoice(invoiceId: string, params?: {
        auto_advance?: boolean;
    }): Promise<Stripe.Invoice>;
    /**
     * Send an invoice to the customer
     */
    sendInvoice(invoiceId: string): Promise<Stripe.Invoice>;
    /**
     * Pay an invoice manually
     */
    payInvoice(invoiceId: string, params?: {
        paymentMethodId?: string;
        source?: string;
    }): Promise<Stripe.Invoice>;
    /**
     * Void an invoice
     */
    voidInvoice(invoiceId: string): Promise<Stripe.Invoice>;
    /**
     * Mark an invoice as uncollectible
     */
    markUncollectible(invoiceId: string): Promise<Stripe.Invoice>;
    /**
     * Retrieve upcoming invoice (preview next invoice)
     */
    getUpcomingInvoice(customerId: string, params?: {
        subscriptionId?: string;
    }): Promise<Stripe.UpcomingInvoice | null>;
    /**
     * Download invoice PDF
     */
    getInvoicePdfUrl(invoiceId: string): Promise<string | null>;
}
