'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt } from 'lucide-react';
import { YearlyCashflow } from '@/lib/hooks/use-calculation';
import { formatCurrency } from '@/lib/utils';

interface TaxBreakdownTableProps {
  cashflows: YearlyCashflow[];
}

export function TaxBreakdownTable({ cashflows }: TaxBreakdownTableProps) {
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

  if (!cashflows || cashflows.length === 0) {
    return null;
  }

  // Display first 10 years
  const displayYears = cashflows.slice(0, 10);
  const divisor = viewMode === 'monthly' ? 12 : 1;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Tax Breakdown & Savings (10 Years)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {viewMode === 'monthly' ? 'Monthly' : 'Yearly'} breakdown of rental income, deductions, and tax calculations
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode(viewMode === 'monthly' ? 'yearly' : 'monthly')}
        >
          {viewMode === 'monthly' ? 'Show Yearly' : 'Show Monthly'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Year</TableHead>
                <TableHead className="text-right">Rental Income</TableHead>
                <TableHead className="text-right">Interest (Deductible)</TableHead>
                <TableHead className="text-right">Hausgeld (Deductible)</TableHead>
                <TableHead className="text-right">AfA Depreciation</TableHead>
                <TableHead className="text-right">Taxable Income</TableHead>
                <TableHead className="text-right">Tax Rate</TableHead>
                <TableHead className="text-right">Tax Refund/Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayYears.map((cf) => {
                // Use divisor to switch between monthly (12) and yearly (1)
                const rentalIncome = parseFloat(cf.totalIncome) / divisor;
                const interest = parseFloat(cf.interestPortion) / divisor;
                const hausgeld = parseFloat(cf.hausgeldNichtUmlagefaehig) / divisor;
                const depreciation = parseFloat(cf.depreciationAmount) / divisor;
                const taxableIncome = parseFloat(cf.taxableIncome) / divisor;
                const taxRate = parseFloat(cf.marginalTaxRate);
                const taxRefund = parseFloat(cf.taxRefund) / divisor;

                return (
                  <TableRow key={cf.year}>
                    <TableCell className="font-medium">
                      {cf.year}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({cf.calendarYear})
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(rentalIncome)}
                    </TableCell>
                    <TableCell className="text-right text-blue-600">
                      -{formatCurrency(interest)}
                    </TableCell>
                    <TableCell className="text-right text-blue-600">
                      -{formatCurrency(hausgeld)}
                    </TableCell>
                    <TableCell className="text-right text-blue-600">
                      -{formatCurrency(depreciation)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      taxableIncome < 0 ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {formatCurrency(taxableIncome)}
                    </TableCell>
                    <TableCell className="text-right">
                      {(taxRate * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className={`text-right font-bold ${
                      taxRefund > 0 ? 'text-green-600' : taxRefund < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {taxRefund > 0 ? '+' : ''}{formatCurrency(taxRefund)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 p-3 bg-muted rounded-md text-sm">
          <p className="font-semibold mb-2">How Tax Calculation Works:</p>
          <div className="space-y-2 text-muted-foreground">
            <p><strong>Taxable Income</strong> = Rental Income - Interest - Hausgeld - AfA Depreciation</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Negative Taxable Income:</strong> You get a tax refund (shown in green)</li>
              <li><strong>Positive Taxable Income:</strong> You pay tax (shown in red)</li>
              <li><strong>Tax Refund/Payment:</strong> Calculated as |Taxable Income| × Tax Rate</li>
            </ul>
            <p className="mt-2 text-xs italic">
              Note: Tax refund from Year 1 is received in Year 2 (timing reflected in Monthly Cashflow table)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
