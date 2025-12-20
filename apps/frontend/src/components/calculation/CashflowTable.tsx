'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronUp, TableIcon } from 'lucide-react';
import { YearlyCashflow } from '@/lib/hooks/use-calculation';
import { formatCurrency } from '@/lib/utils';

interface CashflowTableProps {
  cashflows: YearlyCashflow[];
}

export function CashflowTable({ cashflows }: CashflowTableProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAllColumns, setShowAllColumns] = useState(false);
  
  const displayedCashflows = expanded ? cashflows : cashflows.slice(0, 10);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TableIcon className="h-5 w-5" />
          Yearly Cashflow Projection
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllColumns(!showAllColumns)}
          >
            {showAllColumns ? 'Simple View' : 'Detailed View'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Year</TableHead>
                <TableHead className="text-right">Rental Income</TableHead>
                {showAllColumns && (
                  <>
                    <TableHead className="text-right">Parking</TableHead>
                    <TableHead className="text-right">Total Income</TableHead>
                  </>
                )}
                <TableHead className="text-right">Mortgage</TableHead>
                {showAllColumns && (
                  <>
                    <TableHead className="text-right">KfW</TableHead>
                    <TableHead className="text-right">Interest</TableHead>
                    <TableHead className="text-right">Principal</TableHead>
                    <TableHead className="text-right">Hausgeld</TableHead>
                  </>
                )}
                <TableHead className="text-right">Total Expenses</TableHead>
                {showAllColumns && (
                  <>
                    <TableHead className="text-right">Depreciation</TableHead>
                    <TableHead className="text-right">Tax Refund</TableHead>
                  </>
                )}
                <TableHead className="text-right">Net Cashflow</TableHead>
                <TableHead className="text-right">Cumulative</TableHead>
                {showAllColumns && (
                  <>
                    <TableHead className="text-right">Bank Loan</TableHead>
                    <TableHead className="text-right">KfW Loan</TableHead>
                    <TableHead className="text-right">Property Value</TableHead>
                  </>
                )}
                <TableHead className="text-right">Equity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedCashflows.map((cf) => (
                <TableRow key={cf.year}>
                  <TableCell className="font-medium">
                    {cf.year}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({cf.calendarYear})
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(parseFloat(cf.rentalIncome))}
                  </TableCell>
                  {showAllColumns && (
                    <>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(cf.parkingIncome))}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(parseFloat(cf.totalIncome))}
                      </TableCell>
                    </>
                  )}
                  <TableCell className="text-right text-red-600">
                    -{formatCurrency(parseFloat(cf.mortgagePayment))}
                  </TableCell>
                  {showAllColumns && (
                    <>
                      <TableCell className="text-right text-red-600">
                        -{formatCurrency(parseFloat(cf.kfwPayment))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(cf.interestPortion))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(cf.principalPortion))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(cf.hausgeldNichtUmlagefaehig))}
                      </TableCell>
                    </>
                  )}
                  <TableCell className="text-right text-red-600 font-medium">
                    -{formatCurrency(parseFloat(cf.totalExpenses))}
                  </TableCell>
                  {showAllColumns && (
                    <>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(cf.depreciationAmount))}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(parseFloat(cf.taxRefund))}
                      </TableCell>
                    </>
                  )}
                  <TableCell className={`text-right font-medium ${
                    parseFloat(cf.netCashflowAfterTax) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(parseFloat(cf.netCashflowAfterTax))}
                  </TableCell>
                  <TableCell className={`text-right ${
                    parseFloat(cf.cumulativeCashflow) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(parseFloat(cf.cumulativeCashflow))}
                  </TableCell>
                  {showAllColumns && (
                    <>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(cf.remainingBankLoan))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(cf.remainingKfwLoan))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(parseFloat(cf.propertyValue))}
                      </TableCell>
                    </>
                  )}
                  <TableCell className="text-right font-medium text-blue-600">
                    {formatCurrency(parseFloat(cf.equity))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {cashflows.length > 10 && (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show All {cashflows.length} Years
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
