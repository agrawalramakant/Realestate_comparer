'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProperty, useUpdateProperty } from '@/lib/hooks/use-properties';
import { PropertyForm } from '@/components/property/PropertyForm';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { data: property, isLoading, error } = useProperty(id);
  const updateProperty = useUpdateProperty();

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      console.log('Updating property data:', data);
      await updateProperty.mutateAsync({ id, data });
      console.log('Property updated successfully');
      router.push(`/properties/${id}`);
    } catch (error) {
      console.error('Failed to update property:', error);
      alert(`Failed to update property: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Link>
        </Button>
        <div className="p-8 text-center">
          <p className="text-destructive">Property not found</p>
        </div>
      </div>
    );
  }

  // Get investment assumptions and tax profile if they exist
  const investmentAssumptions = property.investmentAssumptions;
  const taxProfile = property.taxProfile as { annualGrossIncome?: string; taxFilingType?: string } | undefined;

  // Convert property data to form format (decimals to percentages)
  const initialData = {
    ...property,
    landValuePercent: String((parseFloat(property.landValuePercent) * 100).toFixed(1)),
    vacancyRate: String((parseFloat(property.vacancyRate) * 100).toFixed(1)),
    houseAppreciation: String((parseFloat(property.houseAppreciation) * 100).toFixed(1)),
    rentIncrementPercent: String((parseFloat(property.rentIncrementPercent) * 100).toFixed(1)),
    maklerFeePercent: String((parseFloat(property.maklerFeePercent) * 100).toFixed(2)),
    propertySize: String(property.propertySize),
    purchasePrice: String(property.purchasePrice),
    rentalPricePerM2: String(property.rentalPricePerM2),
    hausgeldTotal: String(property.hausgeldTotal),
    hausgeldUmlagefaehig: String(property.hausgeldUmlagefaehig || '0'),
    hausgeldNichtUmlagefaehig: String(property.hausgeldNichtUmlagefaehig),
    hausgeldRuecklage: String(property.hausgeldRuecklage || '0'),
    parkingRentalIncome: String(property.parkingRentalIncome || '0'),
    parkingPrice: String(property.parkingPrice || '0'),
    rentIncrementFrequencyYears: String(property.rentIncrementFrequencyYears || '1'),
    // AfA settings from investment assumptions
    afaType: investmentAssumptions?.afaType || 'LINEAR_2',
    sonderAfaEligible: investmentAssumptions?.sonderAfaEligible || false,
    sonderAfaPercent: investmentAssumptions?.sonderAfaPercent 
      ? String((parseFloat(String(investmentAssumptions.sonderAfaPercent)) * 100).toFixed(1)) 
      : '0',
    sonderAfaYears: String(investmentAssumptions?.sonderAfaYears || '0'),
    // Tax profile
    annualGrossIncome: taxProfile?.annualGrossIncome ? String(taxProfile.annualGrossIncome) : '',
    taxFilingType: taxProfile?.taxFilingType || 'SINGLE',
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link href={`/properties/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Property</h1>
        <p className="text-muted-foreground">
          Update {property.name}
        </p>
      </div>

      <PropertyForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={updateProperty.isPending}
      />
    </div>
  );
}
