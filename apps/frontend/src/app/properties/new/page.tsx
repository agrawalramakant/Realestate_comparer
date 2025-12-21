'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateProperty } from '@/lib/hooks/use-properties';
import { PropertyForm } from '@/components/property/PropertyForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewPropertyPage() {
  const router = useRouter();
  const createProperty = useCreateProperty();

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      console.log('Submitting property data:', data);
      const property = await createProperty.mutateAsync(data);
      console.log('Property created:', property);
      router.push(`/properties/${property.id}`);
    } catch (error) {
      console.error('Failed to create property:', error);
      // Show error to user
      alert(`Failed to create property: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">New Property</h1>
        <p className="text-muted-foreground">
          Add a new property to analyze
        </p>
      </div>

      <PropertyForm
        onSubmit={handleSubmit}
        isLoading={createProperty.isPending}
      />
    </div>
  );
}
