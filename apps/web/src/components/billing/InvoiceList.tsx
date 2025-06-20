'use client';

import { useState } from 'react';
import { api } from '~/utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Skeleton } from '~/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { format } from 'date-fns';
import { Download, ExternalLink, FileText } from 'lucide-react';
import type { Invoice } from '@terrashaper/shared';

const statusColors: Record<string, string> = {
  paid: 'bg-green-500',
  open: 'bg-blue-500',
  draft: 'bg-gray-500',
  void: 'bg-gray-400',
  uncollectible: 'bg-red-500',
};

export function InvoiceList() {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { data, isLoading } = api.billing.getInvoices.useQuery({
    limit: pageSize,
    offset: page * pageSize,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const invoices = data?.invoices || [];
  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Invoices
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8">
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
                {invoices.map((invoice: Invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_number || invoice.stripe_invoice_id}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      ${(invoice.amount_due).toFixed(2)} {invoice.currency.toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[invoice.status]}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {invoice.stripe_hosted_invoice_url && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(invoice.stripe_hosted_invoice_url!, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        {invoice.stripe_invoice_pdf && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(invoice.stripe_invoice_pdf!, '_blank')}
                          >
                            <Download className="h-4 w-4" />
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
                  onClick={() => setPage(page - 1)}
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
                  onClick={() => setPage(page + 1)}
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