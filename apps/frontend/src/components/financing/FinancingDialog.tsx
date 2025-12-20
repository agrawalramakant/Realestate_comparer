'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useCreateFinancing,
  useUpdateFinancing,
  FinancingScenario,
  CreateFinancingInput,
} from '@/lib/hooks/use-financing';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Form uses percentage values (80 for 80%), API expects decimals (0.8)
interface FormValues {
  scenarioName: string;
  ltvPercent: number; // 80 = 80%
  bankInterestRate: number; // 3.5 = 3.5%
  bankFixedPeriod: number;
  repaymentRate: number; // 2 = 2%
  showKfwLoan: boolean; // UI toggle only, not sent to API
  kfwLoanAmount?: number;
  kfwInterestRate?: number; // 1 = 1%
  kfwFixedPeriod?: number;
  kfwRepaymentRate?: number; // 2 = 2%
  kfwPrincipalFreeYears?: number; // Repayment-free period in years
}

interface FinancingDialogProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  scenario: FinancingScenario | null;
  purchasePrice: number;
}

export function FinancingDialog({
  open,
  onClose,
  propertyId,
  scenario,
  purchasePrice,
}: FinancingDialogProps) {
  const createFinancing = useCreateFinancing(propertyId);
  const updateFinancing = useUpdateFinancing(propertyId);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      scenarioName: '',
      ltvPercent: 80, // 80%
      bankInterestRate: 3.5, // 3.5%
      bankFixedPeriod: 10,
      repaymentRate: 2, // 2%
      showKfwLoan: false,
    },
  });

  const ltvPercent = watch('ltvPercent');
  const showKfwLoan = watch('showKfwLoan');

  // Reset form when dialog opens/closes or scenario changes
  useEffect(() => {
    if (open) {
      setError(null);
      if (scenario) {
        reset({
          scenarioName: scenario.scenarioName,
          ltvPercent: parseFloat(scenario.ltvPercent) * 100,
          bankInterestRate: parseFloat(scenario.bankInterestRate) * 100,
          bankFixedPeriod: scenario.bankFixedPeriod,
          repaymentRate: parseFloat(scenario.repaymentRate) * 100,
          showKfwLoan: !!(scenario.kfwLoanAmount && parseFloat(scenario.kfwLoanAmount) > 0),
          kfwLoanAmount: scenario.kfwLoanAmount ? parseFloat(scenario.kfwLoanAmount) : undefined,
          kfwInterestRate: scenario.kfwInterestRate ? parseFloat(scenario.kfwInterestRate) * 100 : undefined,
          kfwFixedPeriod: scenario.kfwFixedPeriod || undefined,
          kfwRepaymentRate: scenario.kfwRepaymentRate ? parseFloat(scenario.kfwRepaymentRate) * 100 : undefined,
          kfwPrincipalFreeYears: scenario.kfwPrincipalFreeYears || undefined,
        });
      } else {
        reset({
          scenarioName: '',
          ltvPercent: 80,
          bankInterestRate: 3.5,
          bankFixedPeriod: 10,
          repaymentRate: 2,
          showKfwLoan: false,
        });
      }
    }
  }, [open, scenario, reset]);

  const onSubmit = async (formData: FormValues) => {
    setError(null);
    
    // Convert percentages to decimals for API
    const apiData: CreateFinancingInput = {
      scenarioName: formData.scenarioName,
      ltvPercent: formData.ltvPercent / 100,
      bankInterestRate: formData.bankInterestRate / 100,
      bankFixedPeriod: formData.bankFixedPeriod,
      repaymentRate: formData.repaymentRate / 100,
      kfwLoanAmount: formData.showKfwLoan ? formData.kfwLoanAmount : undefined,
      kfwInterestRate: formData.showKfwLoan && formData.kfwInterestRate ? formData.kfwInterestRate / 100 : undefined,
      kfwFixedPeriod: formData.showKfwLoan ? formData.kfwFixedPeriod : undefined,
      kfwRepaymentRate: formData.showKfwLoan && formData.kfwRepaymentRate ? formData.kfwRepaymentRate / 100 : undefined,
      kfwPrincipalFreeYears: formData.showKfwLoan ? formData.kfwPrincipalFreeYears : undefined,
    };

    try {
      if (scenario) {
        await updateFinancing.mutateAsync({ id: scenario.id, data: apiData });
      } else {
        await createFinancing.mutateAsync(apiData);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save financing scenario:', err);
      setError(err instanceof Error ? err.message : 'Failed to save scenario');
    }
  };

  const isLoading = createFinancing.isPending || updateFinancing.isPending;
  const loanAmount = purchasePrice * ((ltvPercent || 0) / 100);
  const equity = purchasePrice - loanAmount;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {scenario ? 'Edit Financing Scenario' : 'New Financing Scenario'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          {/* Scenario Name */}
          <div className="space-y-2">
            <Label htmlFor="scenarioName">Scenario Name *</Label>
            <Input
              id="scenarioName"
              placeholder="e.g., Conservative 80% LTV"
              {...register('scenarioName', { required: 'Name is required' })}
            />
            {errors.scenarioName && (
              <p className="text-sm text-destructive">{errors.scenarioName.message}</p>
            )}
          </div>

          {/* Bank Loan Section */}
          <div className="space-y-4">
            <h3 className="font-semibold border-b pb-2">Bank Loan</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ltvPercent">Loan-to-Value (LTV) % *</Label>
                <div className="relative">
                  <Input
                    id="ltvPercent"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    placeholder="80"
                    className="pr-8"
                    {...register('ltvPercent', {
                      required: 'LTV is required',
                      valueAsNumber: true,
                      min: { value: 0, message: 'Min 0%' },
                      max: { value: 100, message: 'Max 100%' },
                    })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Loan: {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(loanAmount)} | 
                  Equity: {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(equity)}
                </p>
                {errors.ltvPercent && (
                  <p className="text-sm text-destructive">{errors.ltvPercent.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankInterestRate">Interest Rate % *</Label>
                <div className="relative">
                  <Input
                    id="bankInterestRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    placeholder="3.5"
                    className="pr-8"
                    {...register('bankInterestRate', {
                      required: 'Interest rate is required',
                      valueAsNumber: true,
                      min: { value: 0, message: 'Min 0%' },
                      max: { value: 20, message: 'Max 20%' },
                    })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                {errors.bankInterestRate && (
                  <p className="text-sm text-destructive">{errors.bankInterestRate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankFixedPeriod">Fixed Period (years) *</Label>
                <Input
                  id="bankFixedPeriod"
                  type="number"
                  min="1"
                  max="30"
                  placeholder="10"
                  {...register('bankFixedPeriod', {
                    required: 'Fixed period is required',
                    valueAsNumber: true,
                  })}
                />
                {errors.bankFixedPeriod && (
                  <p className="text-sm text-destructive">{errors.bankFixedPeriod.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="repaymentRate">Initial Repayment Rate % *</Label>
                <div className="relative">
                  <Input
                    id="repaymentRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="2"
                    className="pr-8"
                    {...register('repaymentRate', {
                      required: 'Repayment rate is required',
                      valueAsNumber: true,
                      min: { value: 0, message: 'Min 0%' },
                      max: { value: 10, message: 'Max 10%' },
                    })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                {errors.repaymentRate && (
                  <p className="text-sm text-destructive">{errors.repaymentRate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* KfW Loan Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showKfwLoan"
                className="h-4 w-4"
                {...register('showKfwLoan')}
              />
              <Label htmlFor="showKfwLoan" className="font-semibold">
                Include KfW Loan
              </Label>
            </div>

            {showKfwLoan && (
              <div className="grid grid-cols-2 gap-4 pl-6 border-l-2">
                <div className="space-y-2">
                  <Label htmlFor="kfwLoanAmount">KfW Loan Amount (€)</Label>
                  <Input
                    id="kfwLoanAmount"
                    type="number"
                    min="0"
                    placeholder="100000"
                    {...register('kfwLoanAmount', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kfwInterestRate">KfW Interest Rate %</Label>
                  <div className="relative">
                    <Input
                      id="kfwInterestRate"
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      placeholder="1"
                      className="pr-8"
                      {...register('kfwInterestRate', { valueAsNumber: true })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kfwFixedPeriod">KfW Fixed Period (years)</Label>
                  <Input
                    id="kfwFixedPeriod"
                    type="number"
                    min="1"
                    max="30"
                    placeholder="10"
                    {...register('kfwFixedPeriod', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kfwRepaymentRate">KfW Repayment Rate %</Label>
                  <div className="relative">
                    <Input
                      id="kfwRepaymentRate"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="2"
                      className="pr-8"
                      {...register('kfwRepaymentRate', { valueAsNumber: true })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kfwPrincipalFreeYears">Repayment-Free Period (years)</Label>
                  <Input
                    id="kfwPrincipalFreeYears"
                    type="number"
                    min="0"
                    max="5"
                    placeholder="5"
                    {...register('kfwPrincipalFreeYears', { valueAsNumber: true })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Years with interest-only payments (no principal)
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : scenario ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
