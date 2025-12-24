'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from 'lucide-react';
import { YearlyCashflow } from '@/lib/hooks/use-calculation';
import { formatCurrency } from '@/lib/utils';

interface MonthlyCashflowTableProps {
  cashflows: YearlyCashflow[];
}

export function MonthlyCashflowTable({ cashflows }: MonthlyCashflowTableProps) {
  if (!cashflows || cashflows.length === 0) {
    return null;
  }

  // Display first 10 years
  const displayYears = cashflows.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Monthly Cashflow Overview (10 Years)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tax refunds are received in the following year. All values shown as monthly averages.
        </p>
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
                <TableHead className="text-right">Monthly Cashflow</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayYears.map((cf) => {
                const monthlyMortgage = parseFloat(cf.mortgagePayment) / 12;
                const monthlyKfw = parseFloat(cf.kfwPayment) / 12;
                const monthlyMaintenance = parseFloat(cf.hausgeldNichtUmlagefaehig) / 12;
                const monthlyRentalIncome = parseFloat(cf.rentalIncome) / 12;
                const monthlyParkingIncome = parseFloat(cf.parkingIncome) / 12;
                const monthlyTaxRefund = parseFloat(cf.taxRefund) / 12;
                
                const totalMonthlyMortgage = monthlyMortgage + monthlyKfw;
                const totalMonthlyIncome = monthlyRentalIncome + monthlyParkingIncome;
                const monthlyCashflow = parseFloat(cf.netCashflowAfterTax) / 12;

                return (
                  <TableRow key={cf.year}>
                    <TableCell className="font-medium">
                      {cf.year}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({cf.calendarYear})
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -{formatCurrency(totalMonthlyMortgage)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -{formatCurrency(monthlyMaintenance)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(totalMonthlyIncome)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {monthlyTaxRefund > 0 ? formatCurrency(monthlyTaxRefund) : '€0'}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      monthlyCashflow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(monthlyCashflow)}
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
