'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from 'lucide-react';
import { YearlyCashflow } from '@/lib/hooks/use-calculation';
import { formatCurrency } from '@/lib/utils';

interface MonthlyCashflowTableProps {
  cashflows: YearlyCashflow[];
  viewMode: 'monthly' | 'yearly';
  setViewMode: (mode: 'monthly' | 'yearly') => void;
}

export function MonthlyCashflowTable({ cashflows, viewMode, setViewMode }: MonthlyCashflowTableProps) {

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
            <Calendar className="h-5 w-5" />
            Cashflow Overview (10 Years)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tax refunds are received in the following year. {viewMode === 'monthly' ? 'Monthly' : 'Yearly'} values shown.
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
                <TableHead className="text-right">Mortgage (Out)</TableHead>
                <TableHead className="text-right">Maintenance (Out)</TableHead>
                <TableHead className="text-right">Rental Income (In)</TableHead>
                <TableHead className="text-right">Tax Refund (In)</TableHead>
                <TableHead className="text-right">Net Cashflow</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayYears.map((cf) => {
                const mortgage = parseFloat(cf.mortgagePayment) / divisor;
                const kfw = parseFloat(cf.kfwPayment) / divisor;
                // Maintenance includes both administrative costs (tax-deductible) and reserve fund (non-deductible)
                const hausgeldAdmin = parseFloat(cf.hausgeldNichtUmlagefaehig) / divisor;
                const hausgeldReserve = parseFloat(cf.hausgeldRuecklage || '0') / divisor;
                const maintenance = hausgeldAdmin + hausgeldReserve;
                const rentalIncome = parseFloat(cf.rentalIncome) / divisor;
                const parkingIncome = parseFloat(cf.parkingIncome) / divisor;
                const taxRefund = parseFloat(cf.taxRefund) / divisor;
                
                const totalMortgage = mortgage + kfw;
                const totalIncome = rentalIncome + parkingIncome;
                const netCashflow = parseFloat(cf.netCashflowAfterTax) / divisor;

                return (
                  <TableRow key={cf.year}>
                    <TableCell className="font-medium">
                      {cf.year}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({cf.calendarYear})
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -{formatCurrency(totalMortgage)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -{formatCurrency(maintenance)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(totalIncome)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {taxRefund > 0 ? formatCurrency(taxRefund) : '€0'}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      netCashflow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(netCashflow)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 p-3 bg-muted rounded-md text-sm">
          <p className="font-semibold mb-1">Important Notes:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Year 1:</strong> No tax refund received (€0) - you file taxes at end of year</li>
            <li><strong>Year 2+:</strong> Tax refund includes previous year's deductions (AfA, interest, Hausgeld)</li>
            <li><strong>Mortgage:</strong> Includes both bank loan and KfW payments if applicable</li>
            <li><strong>Rental Income:</strong> Includes apartment rent and parking income</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
