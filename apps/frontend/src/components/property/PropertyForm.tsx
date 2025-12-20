'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GERMAN_STATES = [
  { value: 'BADEN_WUERTTEMBERG', label: 'Baden-Württemberg' },
  { value: 'BAYERN', label: 'Bayern' },
  { value: 'BERLIN', label: 'Berlin' },
  { value: 'BRANDENBURG', label: 'Brandenburg' },
  { value: 'BREMEN', label: 'Bremen' },
  { value: 'HAMBURG', label: 'Hamburg' },
  { value: 'HESSEN', label: 'Hessen' },
  { value: 'MECKLENBURG_VORPOMMERN', label: 'Mecklenburg-Vorpommern' },
  { value: 'NIEDERSACHSEN', label: 'Niedersachsen' },
  { value: 'NORDRHEIN_WESTFALEN', label: 'Nordrhein-Westfalen' },
  { value: 'RHEINLAND_PFALZ', label: 'Rheinland-Pfalz' },
  { value: 'SAARLAND', label: 'Saarland' },
  { value: 'SACHSEN', label: 'Sachsen' },
  { value: 'SACHSEN_ANHALT', label: 'Sachsen-Anhalt' },
  { value: 'SCHLESWIG_HOLSTEIN', label: 'Schleswig-Holstein' },
  { value: 'THUERINGEN', label: 'Thüringen' },
];

interface PropertyFormProps {
  initialData?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  isLoading?: boolean;
}

export function PropertyForm({ initialData, onSubmit, isLoading }: PropertyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      city: '',
      state: 'BERLIN',
      propertySize: '',
      purchasePrice: '',
      landValuePercent: '0.2',
      rentalPricePerM2: '',
      ...initialData,
    },
  });

  const onFormSubmit = (data: Record<string, unknown>) => {
    // Convert string numbers to actual numbers
    const processed = {
      ...data,
      propertySize: parseFloat(data.propertySize as string),
      purchasePrice: parseFloat(data.purchasePrice as string),
      landValuePercent: parseFloat(data.landValuePercent as string),
      rentalPricePerM2: parseFloat(data.rentalPricePerM2 as string),
    };
    onSubmit(processed);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Property Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Berlin Mitte Apartment"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="e.g., Berlin"
              {...register('city', { required: 'City is required' })}
            />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <select
              id="state"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('state', { required: 'State is required' })}
            >
              {GERMAN_STATES.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="propertySize">Size (m²) *</Label>
            <Input
              id="propertySize"
              type="number"
              step="0.01"
              placeholder="e.g., 75"
              {...register('propertySize', {
                required: 'Size is required',
                min: { value: 1, message: 'Size must be positive' },
              })}
            />
            {errors.propertySize && (
              <p className="text-sm text-destructive">{errors.propertySize.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Purchase Price (€) *</Label>
            <Input
              id="purchasePrice"
              type="number"
              step="1"
              placeholder="e.g., 350000"
              {...register('purchasePrice', {
                required: 'Price is required',
                min: { value: 1, message: 'Price must be positive' },
              })}
            />
            {errors.purchasePrice && (
              <p className="text-sm text-destructive">{errors.purchasePrice.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="landValuePercent">Land Value %</Label>
            <Input
              id="landValuePercent"
              type="number"
              step="0.01"
              min="0"
              max="1"
              placeholder="e.g., 0.2"
              {...register('landValuePercent')}
            />
            <p className="text-xs text-muted-foreground">
              Typically 15-25% for apartments
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rentalPricePerM2">Rent per m² (€) *</Label>
            <Input
              id="rentalPricePerM2"
              type="number"
              step="0.01"
              placeholder="e.g., 12.50"
              {...register('rentalPricePerM2', {
                required: 'Rent is required',
                min: { value: 0, message: 'Rent must be positive' },
              })}
            />
            {errors.rentalPricePerM2 && (
              <p className="text-sm text-destructive">{errors.rentalPricePerM2.message as string}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Property'}
        </Button>
      </div>
    </form>
  );
}
