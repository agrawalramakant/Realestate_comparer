'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProperty } from '@/lib/hooks/use-properties';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, MapPin } from 'lucide-react';
import { FinancingScenarios } from '@/components/financing/FinancingScenarios';
import { ScenarioAnalysis } from '@/components/calculation/ScenarioAnalysis';
import { useFinancingScenarios } from '@/lib/hooks/use-financing';

const STATUS_LABELS: Record<string, string> = {
  INITIAL_INPUT: 'Initial Input',
  APPOINTMENT_SCHEDULED: 'Appointment Scheduled',
  VISITED: 'Visited',
  OFFER_MADE: 'Offer Made',
  REJECTED: 'Rejected',
  PURCHASED: 'Purchased',
};

function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(num);
}

export default function PropertyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: property, isLoading, error } = useProperty(id);

  if (isLoading) {
    return <PropertyDetailSkeleton />;
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
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive">Property not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pricePerSqm = parseFloat(property.purchasePrice) / parseFloat(property.propertySize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="-ml-2" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{property.name}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {property.city}, {property.state.replace(/_/g, ' ')}
            </span>
            <Badge variant="secondary" className="ml-2">
              {STATUS_LABELS[property.propertyStatus] || property.propertyStatus}
            </Badge>
          </div>
        </div>
        <Button asChild>
          <Link href={`/properties/${id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Purchase Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(property.purchasePrice)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parseFloat(property.propertySize).toFixed(0)} m²
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Price per m²
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pricePerSqm)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Rent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                parseFloat(property.rentalPricePerM2) * parseFloat(property.propertySize)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Rent per m²" value={`€${parseFloat(property.rentalPricePerM2).toFixed(2)}`} />
            <DetailItem label="Land Value %" value={`${(parseFloat(property.landValuePercent as unknown as string) * 100).toFixed(0)}%`} />
            <DetailItem label="Vacancy Rate" value={`${(parseFloat(property.vacancyRate as unknown as string) * 100).toFixed(1)}%`} />
            <DetailItem label="Appreciation" value={`${(parseFloat(property.houseAppreciation as unknown as string) * 100).toFixed(1)}%`} />
          </div>
        </CardContent>
      </Card>

      {/* Financing Scenarios */}
      <FinancingScenarios
        propertyId={id}
        purchasePrice={parseFloat(property.purchasePrice)}
      />

      {/* Scenario Analysis */}
      <ScenarioAnalysisSection propertyId={id} />
    </div>
  );
}

function ScenarioAnalysisSection({ propertyId }: { propertyId: string }) {
  const { data: scenarios, isLoading } = useFinancingScenarios(propertyId);

  if (isLoading || !scenarios || scenarios.length === 0) {
    return null;
  }

  return <ScenarioAnalysis propertyId={propertyId} scenarios={scenarios} />;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

function PropertyDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
