'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronUp, Receipt } from 'lucide-react';
import { YearlyCashflow } from '@/lib/hooks/use-calculation';
import { formatCurrency } from '@/lib/utils';

interface DepreciationTableProps {
  cashflows: YearlyCashflow[];
  viewMode: 'monthly' | 'yearly';
  setViewMode: (mode: 'monthly' | 'yearly') => void;
}

export function DepreciationTable({ cashflows, viewMode, setViewMode }: DepreciationTableProps) {
  const [expanded, setExpanded] = useState(false);
  
  const displayedCashflows = expanded ? cashflows : cashflows.slice(0, 10);
  const divisor = viewMode === 'monthly' ? 12 : 1;

  // Helper to safely parse numbers
  const safeParseFloat = (value: string | undefined | null): number => {
    if (value === undefined || value === null) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Calculate totals
  const totals = cashflows.reduce(
    (acc, cf) => ({
      normalDepreciation: acc.normalDepreciation + safeParseFloat(cf.normalDepreciation),
      specialDepreciation: acc.specialDepreciation + safeParseFloat(cf.specialDepreciation),
      totalDepreciation: acc.totalDepreciation + safeParseFloat(cf.depreciationAmount),
      taxSaving: acc.taxSaving + safeParseFloat(cf.taxSavingOnDepreciation),
    }),
    { normalDepreciation: 0, specialDepreciation: 0, totalDepreciation: 0, taxSaving: 0 }
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Depreciation & Tax Savings (AfA)
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode(viewMode === 'monthly' ? 'yearly' : 'monthly')}
        >
          {viewMode === 'monthly' ? 'Show Yearly' : 'Show Monthly'}
        </Button>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-2xl font-bold">{formatCurrency(totals.normalDepreciation / divisor)}</div>
            <div className="text-sm text-muted-foreground">{viewMode === 'monthly' ? 'Monthly' : 'Total'} Normal AfA</div>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-2xl font-bold">{formatCurrency(totals.specialDepreciation / divisor)}</div>
            <div className="text-sm text-muted-foreground">{viewMode === 'monthly' ? 'Monthly' : 'Total'} Sonder-AfA</div>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="text-2xl font-bold">{formatCurrency(totals.totalDepreciation / divisor)}</div>
            <div className="text-sm text-muted-foreground">{viewMode === 'monthly' ? 'Monthly' : 'Total'} Depreciation</div>
          </div>
          <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.taxSaving / divisor)}</div>
            <div className="text-sm text-muted-foreground">{viewMode === 'monthly' ? 'Monthly' : 'Total'} Tax Savings</div>
          </div>
        </div>

        {/* Yearly Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Year</TableHead>
                <TableHead className="text-right">Normal AfA</TableHead>
                <TableHead className="text-right">Sonder-AfA</TableHead>
                <TableHead className="text-right">Total AfA</TableHead>
                <TableHead className="text-right">Marginal Tax Rate</TableHead>
                <TableHead className="text-right">Tax Saving</TableHead>
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
                    {formatCurrency(safeParseFloat(cf.normalDepreciation) / divisor)}
                  </TableCell>
                  <TableCell className="text-right">
                    {safeParseFloat(cf.specialDepreciation) > 0 ? (
                      <span className="text-blue-600 font-medium">
                        {formatCurrency(safeParseFloat(cf.specialDepreciation) / divisor)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(safeParseFloat(cf.depreciationAmount) / divisor)}
                  </TableCell>
                  <TableCell className="text-right">
                    {(safeParseFloat(cf.marginalTaxRate) * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right text-green-600 font-medium">
                    {formatCurrency(safeParseFloat(cf.taxSavingOnDepreciation) / divisor)}
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
