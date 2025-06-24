'use client';

import { Download, ExternalLink, FileText } from 'lucide-react';

import { Badge } from '../badge';
import { Button } from '../button';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table';

export interface Invoice {
  id: string;
  invoice_number?: string | null;
  stripe_invoice_id: string;
  created_at: string;
  amount_due: number;
  currency: string;
  status: 'paid' | 'open' | 'draft' | 'void' | 'uncollectible';
  stripe_hosted_invoice_url?: string | null;
  stripe_invoice_pdf?: string | null;
}

export interface InvoiceListProps {
  invoices: Invoice[];
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onViewInvoice?: (invoice: Invoice) => void;
  onDownloadInvoice?: (invoice: Invoice) => void;
  formatDate?: (date: string) => string;
}

const statusColors: Record<string, string> = {
  paid: 'bg-green-500',
  open: 'bg-blue-500',
  draft: 'bg-gray-500',
  void: 'bg-gray-400',
  uncollectible: 'bg-red-500',
};

export function InvoiceList({
  invoices,
  total = 0,
  page = 0,
  pageSize = 10,
  onPageChange,
  onViewInvoice,
  onDownloadInvoice,
  formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
}: InvoiceListProps) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 size-5" />
          Invoices
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No invoices yet</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_number || invoice.stripe_invoice_id}
                    </TableCell>
                    <TableCell>{formatDate(invoice.created_at)}</TableCell>
                    <TableCell>
                      ${invoice.amount_due.toFixed(2)} {invoice.currency.toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[invoice.status]}>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {invoice.stripe_hosted_invoice_url && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onViewInvoice?.(invoice)}
                          >
                            <ExternalLink className="size-4" />
                          </Button>
                        )}
                        {invoice.stripe_invoice_pdf && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDownloadInvoice?.(invoice)}
                          >
                            <Download className="size-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(page - 1)}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}