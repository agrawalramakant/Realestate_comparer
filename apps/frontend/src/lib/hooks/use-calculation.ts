import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

// Types matching backend response
export interface YearlyCashflow {
  id: string;
  year: number;
  calendarYear: number;
  rentalIncome: string;
  parkingIncome: string;
  totalIncome: string;
  mortgagePayment: string;
  kfwPayment: string;
  interestPortion: string;
  principalPortion: string;
  hausgeldNichtUmlagefaehig: string;
  otherCosts: string;
  totalExpenses: string;
  depreciationAmount: string;
  taxableIncome: string;
  taxRefund: string;
  netCashflowBeforeTax: string;
  netCashflowAfterTax: string;
  cumulativeCashflow: string;
  remainingBankLoan: string;
  remainingKfwLoan: string;
  propertyValue: string;
  equity: string;
}

export interface CalculationResult {
  id: string;
  propertyId: string;
  financingScenarioId: string;
  calculatedAt: string;
  inputSnapshot: Record<string, unknown>;
  
  // Summary KPIs
  irr10Year: string;
  irr15Year: string;
  irr30Year: string;
  totalProfitAtExit: string;
  upfrontInvestment: string;
  monthlyNetCashflowYear1: string;
  grossYield: string;
  netYield: string;
  cashOnCashReturn: string;
  
  // Profit breakdown
  profitFromAppreciation: string;
  profitFromOperating: string;
  profitFromTaxSavings: string;
  totalTaxSavingsFromAfa: string;
  remainingLoanAtYear30: string;
  
  // Yearly data
  yearlyCashflows: YearlyCashflow[];
}

/**
 * Hook to trigger calculation for a financing scenario
 */
export function useRunCalculation(propertyId: string, scenarioId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<CalculationResult>(
        `/properties/${propertyId}/scenarios/${scenarioId}/calculate`
      );
      return response;
    },
    onSuccess: () => {
      // Invalidate calculation queries
      queryClient.invalidateQueries({ 
        queryKey: ['calculation', propertyId, scenarioId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['calculations', propertyId] 
      });
    },
  });
}

/**
 * Hook to get calculation result for a scenario
 */
export function useCalculationResult(propertyId: string, scenarioId: string) {
  return useQuery({
    queryKey: ['calculation', propertyId, scenarioId],
    queryFn: async () => {
      const response = await api.get<CalculationResult | null>(
        `/properties/${propertyId}/scenarios/${scenarioId}/calculate`
      );
      return response;
    },
    enabled: !!propertyId && !!scenarioId,
  });
}

/**
 * Hook to get all calculations for a property
 */
export function usePropertyCalculations(propertyId: string) {
  return useQuery({
    queryKey: ['calculations', propertyId],
    queryFn: async () => {
      const response = await api.get<CalculationResult[]>(
        `/properties/${propertyId}/calculations`
      );
      return response;
    },
    enabled: !!propertyId,
  });
}
