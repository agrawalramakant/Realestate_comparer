'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalculationKPIs } from './CalculationKPIs';
import { CashflowTable } from './CashflowTable';
import { useCalculationResult } from '@/lib/hooks/use-calculation';
import { FinancingScenario } from '@/lib/hooks/use-financing';

interface ScenarioAnalysisProps {
  propertyId: string;
  scenarios: FinancingScenario[];
}

export function ScenarioAnalysis({ propertyId, scenarios }: ScenarioAnalysisProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    scenarios[0]?.id || ''
  );

  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId);
  const { data: calculationResult } = useCalculationResult(propertyId, selectedScenarioId);

  if (scenarios.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Scenario Tabs */}
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

            {/* Cashflow Table */}
            {calculationResult && calculationResult.yearlyCashflows && (
              <CashflowTable cashflows={calculationResult.yearlyCashflows} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
