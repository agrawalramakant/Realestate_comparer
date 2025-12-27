'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalculationKPIs } from './CalculationKPIs';
import { CashflowTable } from './CashflowTable';
import { MonthlyCashflowTable } from './MonthlyCashflowTable';
import { TaxBreakdownTable } from './TaxBreakdownTable';
import { DepreciationTable } from './DepreciationTable';
import { FinancingScenarios } from '@/components/financing/FinancingScenarios';
import { useCalculationResult } from '@/lib/hooks/use-calculation';
import { FinancingScenario } from '@/lib/hooks/use-financing';

interface ScenarioAnalysisProps {
  propertyId: string;
  scenarios: FinancingScenario[];
  purchasePrice: number;
}

export function ScenarioAnalysis({ propertyId, scenarios, purchasePrice }: ScenarioAnalysisProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    scenarios[0]?.id || ''
  );
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId);
  const { data: calculationResult } = useCalculationResult(propertyId, selectedScenarioId);

  // Always show FinancingScenarios so user can add scenarios even when none exist
  if (scenarios.length === 0) {
    return (
      <div className="space-y-6">
        <FinancingScenarios propertyId={propertyId} purchasePrice={purchasePrice} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Depreciation & Tax Savings Table - Independent of financing */}
      {calculationResult && calculationResult.yearlyCashflows && (
        <DepreciationTable 
          cashflows={calculationResult.yearlyCashflows}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      )}

      {/* Financing Scenarios Management */}
      <FinancingScenarios propertyId={propertyId} purchasePrice={purchasePrice} />

      {/* Scenario Tabs - Below Financing Scenarios */}
      <Tabs value={selectedScenarioId} onValueChange={setSelectedScenarioId}>
        <TabsList>
          {scenarios.map((scenario) => (
            <TabsTrigger key={scenario.id} value={scenario.id}>
              {scenario.scenarioName}
            </TabsTrigger>
          ))}
        </TabsList>

        {scenarios.map((scenario) => (
          <TabsContent key={scenario.id} value={scenario.id} className="space-y-6">
            {/* KPIs */}
            <CalculationKPIs
              propertyId={propertyId}
              scenarioId={scenario.id}
              scenarioName={scenario.scenarioName}
            />

            {/* Tax Breakdown Table */}
            {calculationResult && calculationResult.yearlyCashflows && (
              <TaxBreakdownTable 
                cashflows={calculationResult.yearlyCashflows}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            )}

            {/* Monthly Cashflow Table */}
            {calculationResult && calculationResult.yearlyCashflows && (
              <MonthlyCashflowTable 
                cashflows={calculationResult.yearlyCashflows}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            )}

            {/* Yearly Cashflow Table */}
            {calculationResult && calculationResult.yearlyCashflows && (
              <CashflowTable 
                cashflows={calculationResult.yearlyCashflows}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
