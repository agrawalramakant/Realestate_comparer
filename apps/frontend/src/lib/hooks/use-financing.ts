import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface FinancingScenario {
  id: string;
  propertyId: string;
  scenarioName: string;
  scenarioOrder: number;
  ltvPercent: string;
  bankInterestRate: string;
  bankFixedPeriod: number;
  repaymentRate: string;
  bankAcquisitionCost: string;
  disburseBankLoanFirst: boolean;
  kfwLoanAmount: string | null;
  kfwInterestRate: string | null;
  kfwFixedPeriod: number | null;
  kfwRepaymentRate: string | null;
  kfwPrincipalFreeYears: number | null;
  kfwAcquisitionCost: string | null;
  bankInterestRateAfterFixed: string | null;
  kfwInterestRateAfterFixed: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFinancingInput {
  scenarioName: string;
  ltvPercent: number;
  bankInterestRate: number;
  bankFixedPeriod: number;
  repaymentRate: number;
  bankAcquisitionCost?: number;
  kfwLoanAmount?: number;
  kfwInterestRate?: number;
  kfwFixedPeriod?: number;
  kfwRepaymentRate?: number;
  kfwPrincipalFreeYears?: number;
}

export function useFinancingScenarios(propertyId: string) {
  return useQuery({
    queryKey: ['financing', propertyId],
    queryFn: () => api.get<FinancingScenario[]>(`/properties/${propertyId}/scenarios`),
    enabled: !!propertyId,
  });
}

export function useCreateFinancing(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFinancingInput) =>
      api.post<FinancingScenario>(`/properties/${propertyId}/scenarios`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financing', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
    },
  });
}

export function useUpdateFinancing(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFinancingInput> }) =>
      api.patch<FinancingScenario>(`/properties/${propertyId}/scenarios/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financing', propertyId] });
    },
  });
}

export function useDeleteFinancing(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/properties/${propertyId}/scenarios/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financing', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
    },
  });
}
