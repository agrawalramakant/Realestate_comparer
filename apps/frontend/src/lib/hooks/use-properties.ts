import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface InvestmentAssumptions {
  id: string;
  propertyId: string;
  afaType: string;
  sonderAfaEligible: boolean;
  sonderAfaPercent: string;
  sonderAfaYears: number;
  denkmalschutzEligible: boolean;
  denkmalschutzOldValue: string;
  denkmalschutzRenovationCost: string;
}

export interface Property {
  id: string;
  name: string;
  address: string | null;
  city: string;
  state: string;
  propertyStatus: string;
  propertySize: string;
  purchasePrice: string;
  landValuePercent: string;
  rentalPricePerM2: string;
  houseAppreciation: string;
  vacancyRate: string;
  rentIncrementPercent: string;
  hausgeldTotal: string;
  hausgeldUmlagefaehig: string;
  hausgeldNichtUmlagefaehig: string;
  hausgeldRuecklage: string;
  maklerFeePercent: string;
  createdAt: string;
  updatedAt: string;
  investmentAssumptions?: InvestmentAssumptions | null;
  // Allow additional fields from API
  [key: string]: unknown;
}

export interface PropertyListResponse {
  data: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PropertyQueryParams {
  page?: number;
  limit?: number;
  city?: string;
  state?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useProperties(params: PropertyQueryParams = {}) {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => api.get<PropertyListResponse>('/properties', params as Record<string, string | number | undefined>),
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => api.get<Property>(`/properties/${id}`),
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Property>) => api.post<Property>('/properties', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Property> }) =>
      api.patch<Property>(`/properties/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', id] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/properties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
