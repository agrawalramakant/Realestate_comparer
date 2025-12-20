'use client';

import { useState } from 'react';
import {
  useFinancingScenarios,
  useDeleteFinancing,
  FinancingScenario,
} from '@/lib/hooks/use-financing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, Edit, TrendingUp } from 'lucide-react';
import { FinancingDialog } from './FinancingDialog';

interface FinancingScenariosProps {
  propertyId: string;
  purchasePrice: number;
}

function formatPercent(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `${(num * 100).toFixed(2)}%`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function FinancingScenarios({ propertyId, purchasePrice }: FinancingScenariosProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<FinancingScenario | null>(null);

  const { data: scenarios, isLoading } = useFinancingScenarios(propertyId);
  const deleteFinancing = useDeleteFinancing(propertyId);

  const handleEdit = (scenario: FinancingScenario) => {
    setEditingScenario(scenario);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingScenario(null);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingScenario(null);
  };

  if (isLoading) {
    return <FinancingScenariosSkeleton />;
  }

  const scenarioList = scenarios || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Financing Scenarios
        </CardTitle>
        <Button size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Scenario
        </Button>
      </CardHeader>
      <CardContent>
        {scenarioList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No financing scenarios yet. Add one to compare different loan options.
            </p>
            <Button variant="outline" onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Scenario
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {scenarioList.map((scenario, index) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                purchasePrice={purchasePrice}
                index={index}
                onEdit={() => handleEdit(scenario)}
                onDelete={() => {
                  if (confirm('Delete this scenario?')) {
                    deleteFinancing.mutate(scenario.id);
                  }
                }}
              />
            ))}
          </div>
        )}
      </CardContent>

      <FinancingDialog
        open={dialogOpen}
        onClose={handleClose}
        propertyId={propertyId}
        scenario={editingScenario}
        purchasePrice={purchasePrice}
      />
    </Card>
  );
}

interface ScenarioCardProps {
  scenario: FinancingScenario;
  purchasePrice: number;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

function ScenarioCard({ scenario, purchasePrice, index, onEdit, onDelete }: ScenarioCardProps) {
  const ltvPercent = parseFloat(scenario.ltvPercent);
  const loanAmount = purchasePrice * ltvPercent;
  const equity = purchasePrice - loanAmount;

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline">#{index + 1}</Badge>
          <h4 className="font-semibold">{scenario.scenarioName}</h4>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">LTV</p>
          <p className="font-medium">{formatPercent(scenario.ltvPercent)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Loan Amount</p>
          <p className="font-medium">{formatCurrency(loanAmount)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Equity Required</p>
          <p className="font-medium">{formatCurrency(equity)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Interest Rate</p>
          <p className="font-medium">{formatPercent(scenario.bankInterestRate)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Fixed Period</p>
          <p className="font-medium">{scenario.bankFixedPeriod} years</p>
        </div>
        <div>
          <p className="text-muted-foreground">Repayment Rate</p>
          <p className="font-medium">{formatPercent(scenario.repaymentRate)}</p>
        </div>
        {scenario.kfwLoanAmount && parseFloat(scenario.kfwLoanAmount) > 0 && (
          <>
            <div>
              <p className="text-muted-foreground">KfW Loan</p>
              <p className="font-medium">{formatCurrency(parseFloat(scenario.kfwLoanAmount))}</p>
            </div>
            <div>
              <p className="text-muted-foreground">KfW Rate</p>
              <p className="font-medium">{formatPercent(scenario.kfwInterestRate || '0')}</p>
            </div>
            {scenario.kfwPrincipalFreeYears && scenario.kfwPrincipalFreeYears > 0 && (
              <div>
                <p className="text-muted-foreground">Principal-Free Period</p>
                <p className="font-medium">{scenario.kfwPrincipalFreeYears} years</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FinancingScenariosSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-9 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j}>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
