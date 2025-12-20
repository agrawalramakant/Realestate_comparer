'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calculator, TrendingUp, Wallet, PiggyBank, RefreshCw } from 'lucide-react';
import { useCalculationResult, useRunCalculation, CalculationResult } from '@/lib/hooks/use-calculation';
import { formatCurrency, formatPercent } from '@/lib/utils';

interface CalculationKPIsProps {
  propertyId: string;
  scenarioId: string;
  scenarioName: string;
}

export function CalculationKPIs({ propertyId, scenarioId, scenarioName }: CalculationKPIsProps) {
  const { data: result, isLoading, error } = useCalculationResult(propertyId, scenarioId);
  const runCalculation = useRunCalculation(propertyId, scenarioId);

  const handleCalculate = () => {
    runCalculation.mutate();
  };

  if (isLoading) {
    return <CalculationKPIsSkeleton />;
  }

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {scenarioName} - Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No calculation results yet. Run the analysis to see KPIs.
            </p>
            <Button onClick={handleCalculate} disabled={runCalculation.isPending}>
              {runCalculation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Run Calculation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {scenarioName} - Analysis
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCalculate}
          disabled={runCalculation.isPending}
        >
          {runCalculation.isPending ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* IRR */}
          <KPICard
            icon={<TrendingUp className="h-4 w-4 text-green-600" />}
            label="IRR (10 Year)"
            value={formatPercent(result.irr10Year)}
            highlight
          />
          <KPICard
            icon={<TrendingUp className="h-4 w-4 text-green-600" />}
            label="IRR (15 Year)"
            value={formatPercent(result.irr15Year)}
          />
          <KPICard
            icon={<TrendingUp className="h-4 w-4 text-green-600" />}
            label="IRR (30 Year)"
            value={formatPercent(result.irr30Year)}
          />
          
          {/* Yields */}
          <KPICard
            icon={<PiggyBank className="h-4 w-4 text-blue-600" />}
            label="Gross Yield"
            value={formatPercent(result.grossYield)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPICard
            icon={<PiggyBank className="h-4 w-4 text-blue-600" />}
            label="Net Yield"
            value={formatPercent(result.netYield)}
          />
          <KPICard
            icon={<Wallet className="h-4 w-4 text-purple-600" />}
            label="Cash-on-Cash"
            value={formatPercent(result.cashOnCashReturn)}
          />
          <KPICard
            icon={<Wallet className="h-4 w-4 text-purple-600" />}
            label="Monthly Cashflow (Y1)"
            value={formatCurrency(parseFloat(result.monthlyNetCashflowYear1))}
            valueClass={parseFloat(result.monthlyNetCashflowYear1) >= 0 ? 'text-green-600' : 'text-red-600'}
          />
          <KPICard
            icon={<Wallet className="h-4 w-4 text-purple-600" />}
            label="Upfront Investment"
            value={formatCurrency(parseFloat(result.upfrontInvestment))}
          />
        </div>

        {/* Profit Breakdown */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3">Profit Breakdown (30 Year Exit)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard
              label="Total Profit"
              value={formatCurrency(parseFloat(result.totalProfitAtExit))}
              valueClass="text-green-600 font-bold"
            />
            <KPICard
              label="From Appreciation"
              value={formatCurrency(parseFloat(result.profitFromAppreciation))}
            />
            <KPICard
              label="From Operations"
              value={formatCurrency(parseFloat(result.profitFromOperating))}
            />
            <KPICard
              label="Tax Savings (AfA)"
              value={formatCurrency(parseFloat(result.totalTaxSavingsFromAfa))}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Last calculated: {new Date(result.calculatedAt).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

interface KPICardProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  valueClass?: string;
}

function KPICard({ icon, label, value, highlight, valueClass }: KPICardProps) {
  return (
    <div className={`p-3 rounded-lg ${highlight ? 'bg-green-50 border border-green-200' : 'bg-muted/50'}`}>
      <div className="flex items-center gap-1 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-lg font-semibold ${valueClass || ''}`}>{value}</p>
    </div>
  );
}

function CalculationKPIsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
