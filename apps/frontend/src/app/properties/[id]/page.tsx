'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProperty, Property } from '@/lib/hooks/use-properties';
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

const AFA_TYPE_LABELS: Record<string, string> = {
  LINEAR_2: 'Linear 2%',
  LINEAR_2_5: 'Linear 2.5%',
  LINEAR_3: 'Linear 3%',
  LINEAR_4: 'Linear 4%',
  DEGRESSIVE_5: 'Degressive 5%',
  CUSTOM: 'Custom Rate',
};

const AFA_RATES: Record<string, string> = {
  LINEAR_2: '2.0%',
  LINEAR_2_5: '2.5%',
  LINEAR_3: '3.0%',
  LINEAR_4: '4.0%',
  DEGRESSIVE_5: '5.0%',
  CUSTOM: 'Custom',
};

function formatAfaType(afaType: string | undefined): string {
  if (!afaType) return 'Linear 2% (default)';
  return AFA_TYPE_LABELS[afaType] || afaType;
}

function getAfaRate(afaType: string | undefined): string {
  if (!afaType) return '2.0%';
  return AFA_RATES[afaType] || '2.0%';
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {property.address && <DetailItem label="Address" value={property.address} />}
            <DetailItem label="Construction Year" value={property.constructionYear ? String(property.constructionYear) : 'N/A'} />
            <DetailItem label="Number of Rooms" value={property.numberOfRooms ? String(property.numberOfRooms) : 'N/A'} />
            <DetailItem label="Land Value" value={`${(parseFloat(property.landValuePercent as unknown as string) * 100).toFixed(0)}%`} />
          </div>
        </CardContent>
      </Card>

      {/* Rental Details */}
      <Card>
        <CardHeader>
          <CardTitle>Rental Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Rent per m²" value={`€${parseFloat(property.rentalPricePerM2).toFixed(2)}/month`} />
            <DetailItem label="Monthly Rent" value={formatCurrency(parseFloat(property.rentalPricePerM2) * parseFloat(property.propertySize))} />
            <DetailItem label="Parking Income" value={property.parkingRentalIncome ? `€${parseFloat(String(property.parkingRentalIncome)).toFixed(0)}/month` : '€0'} />
            <DetailItem label="Vacancy Rate" value={`${(parseFloat(property.vacancyRate as unknown as string) * 100).toFixed(1)}%`} />
            <DetailItem label="Appreciation" value={`${(parseFloat(property.houseAppreciation as unknown as string) * 100).toFixed(1)}%/year`} />
            <DetailItem label="Rent Increase" value={`${(parseFloat(property.rentIncrementPercent as unknown as string) * 100).toFixed(1)}%`} />
            <DetailItem label="Increase Frequency" value={`Every ${property.rentIncrementFrequencyYears || 1} year(s)`} />
          </div>
        </CardContent>
      </Card>

      {/* Costs & Fees */}
      <Card>
        <CardHeader>
          <CardTitle>Costs & Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Broker Fee" value={`${(parseFloat(property.maklerFeePercent as unknown as string) * 100).toFixed(2)}%`} />
            {property.sourceName ? <DetailItem label="Broker Name" value={String(property.sourceName)} /> : null}
            {property.sourceContact ? <DetailItem label="Broker Contact" value={String(property.sourceContact)} /> : null}
            <DetailItem label="Total Hausgeld" value={`€${parseFloat(property.hausgeldTotal as unknown as string).toFixed(0)}/month`} />
            <DetailItem label="Non-Recoverable Hausgeld" value={`€${parseFloat(property.hausgeldNichtUmlagefaehig as unknown as string).toFixed(0)}/month`} />
            {property.hasParkingSpace ? (
              <>
                <DetailItem label="Parking Price" value={formatCurrency(parseFloat(String(property.parkingPrice || 0)))} />
                <DetailItem label="Parking in Price" value={property.parkingIncludedInPrice ? 'Yes' : 'No'} />
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Depreciation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Depreciation Settings (AfA)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DetailItem 
              label="AfA Type" 
              value={formatAfaType(property.investmentAssumptions?.afaType)} 
            />
            <DetailItem 
              label="AfA Rate" 
              value={getAfaRate(property.investmentAssumptions?.afaType)} 
            />
            {property.investmentAssumptions?.sonderAfaEligible ? (
              <>
                <DetailItem 
                  label="Sonder-AfA" 
                  value={`${(parseFloat(String(property.investmentAssumptions.sonderAfaPercent || 0)) * 100).toFixed(1)}%`} 
                />
                <DetailItem 
                  label="Sonder-AfA Years" 
                  value={`${property.investmentAssumptions.sonderAfaYears || 0} years`} 
                />
              </>
            ) : (
              <DetailItem label="Sonder-AfA" value="Not eligible" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Metrics */}
      <QuickMetrics property={property} />

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

function QuickMetrics({ property }: { property: Property }) {
  const purchasePrice = parseFloat(property.purchasePrice);
  const propertySize = parseFloat(property.propertySize);
  const rentPerM2 = parseFloat(property.rentalPricePerM2);
  const parkingRentalIncome = parseFloat(String(property.parkingRentalIncome || 0));
  const maklerFeePercent = parseFloat(property.maklerFeePercent);
  
  // Calculate metrics
  const monthlyRent = (rentPerM2 * propertySize) + parkingRentalIncome;
  const annualRent = monthlyRent * 12;
  const bruttoRentalYield = (annualRent / purchasePrice) * 100;
  
  // Price per sqm (property only)
  const pricePerSqm = purchasePrice / propertySize;
  
  // Calculate total purchase costs (price + notary ~1.5% + grunderwerbsteuer ~6% + broker)
  // Using approximate values - actual calculation would need state-specific rates
  const notaryFee = purchasePrice * 0.015;
  const grunderwerbsteuer = purchasePrice * 0.06; // Approximate, varies by state
  const brokerFee = purchasePrice * maklerFeePercent;
  const totalPurchaseCost = purchasePrice + notaryFee + grunderwerbsteuer + brokerFee;
  const totalCostPerSqm = totalPurchaseCost / propertySize;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Quick Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center p-4 bg-background rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {bruttoRentalYield.toFixed(2)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Brutto Rental Yield
            </div>
            <div className="text-xs text-muted-foreground">
              (Annual Rent / Price)
            </div>
          </div>
          
          <div className="text-center p-4 bg-background rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyRent)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Rent per Month
            </div>
            <div className="text-xs text-muted-foreground">
              (incl. parking: €{parkingRentalIncome.toFixed(0)})
            </div>
          </div>
          
          <div className="text-center p-4 bg-background rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(pricePerSqm)}/m²
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Price per m²
            </div>
            <div className="text-xs text-muted-foreground">
              (property only)
            </div>
          </div>
          
          <div className="text-center p-4 bg-background rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalCostPerSqm)}/m²
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Total Cost per m²
            </div>
            <div className="text-xs text-muted-foreground">
              (incl. taxes & fees)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
