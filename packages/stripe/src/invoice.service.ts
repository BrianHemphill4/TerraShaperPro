import { stripe } from './stripe-client';
import type { Stripe } from 'stripe';

export class InvoiceService {
  /**
   * Retrieve an invoice
   */
  async getInvoice(invoiceId: string): Promise<Stripe.Invoice | null> {
    try {
      const invoice = await stripe.invoices.retrieve(invoiceId);
      return invoice;
    } catch (error) {
      console.error('Error retrieving invoice:', error);
      return null;
    }
  }

  /**
   * List invoices for a customer
   */
  async listInvoices(
    customerId: string,
    params: {
      status?: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
      limit?: number;
      starting_after?: string;
    } = {}
  ): Promise<Stripe.Invoice[]> {
    const invoices = await stripe.invoices.list({
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
  async createInvoice(params: {
    customerId: string;
    description?: string;
    metadata?: Record<string, string>;
    auto_advance?: boolean;
  }): Promise<Stripe.Invoice> {
    const invoice = await stripe.invoices.create({
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
  async addInvoiceItem(params: {
    customerId: string;
    invoiceId?: string;
    amount: number;
    currency?: string;
    description: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.InvoiceItem> {
    const item = await stripe.invoiceItems.create({
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
  async finalizeInvoice(
    invoiceId: string,
    params: {
      auto_advance?: boolean;
    } = {}
  ): Promise<Stripe.Invoice> {
    const invoice = await stripe.invoices.finalizeInvoice(invoiceId, {
      auto_advance: params.auto_advance ?? true,
    });

    return invoice;
  }

  /**
   * Send an invoice to the customer
   */
  async sendInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    const invoice = await stripe.invoices.sendInvoice(invoiceId);
    return invoice;
  }

  /**
   * Pay an invoice manually
   */
  async payInvoice(
    invoiceId: string,
    params: {
      paymentMethodId?: string;
      source?: string;
    } = {}
  ): Promise<Stripe.Invoice> {
    const invoice = await stripe.invoices.pay(invoiceId, {
      payment_method: params.paymentMethodId,
      source: params.source,
    });

    return invoice;
  }

  /**
   * Void an invoice
   */
  async voidInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    const invoice = await stripe.invoices.voidInvoice(invoiceId);
    return invoice;
  }

  /**
   * Mark an invoice as uncollectible
   */
  async markUncollectible(invoiceId: string): Promise<Stripe.Invoice> {
    const invoice = await stripe.invoices.markUncollectible(invoiceId);
    return invoice;
  }

  /**
   * Retrieve upcoming invoice (preview next invoice)
   */
  async getUpcomingInvoice(
    customerId: string,
    params: {
      subscriptionId?: string;
    } = {}
  ): Promise<Stripe.UpcomingInvoice | null> {
    try {
      const invoice = await stripe.invoices.retrieveUpcoming({
        customer: customerId,
        subscription: params.subscriptionId,
      });
      return invoice;
    } catch (error) {
      console.error('Error retrieving upcoming invoice:', error);
      return null;
    }
  }

  /**
   * Download invoice PDF
   */
  async getInvoicePdfUrl(invoiceId: string): Promise<string | null> {
    const invoice = await this.getInvoice(invoiceId);
    return invoice?.invoice_pdf || null;
  }
}
