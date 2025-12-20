'use client';

import { useForm } from 'react-hook-form';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormattedNumberInput } from '@/components/ui/formatted-input';
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
    control,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: '',
      city: '',
      state: 'BERLIN',
      propertySize: '',
      purchasePrice: '',
      landValuePercent: '20', // Now in percentage (20 = 20%)
      landValueAbsolute: '', // Calculated field
      rentalPricePerM2: '',
      ...initialData,
    },
  });

  // Watch purchase price and land value fields
  const purchasePrice = watch('purchasePrice');
  const landValuePercent = watch('landValuePercent');
  const landValueAbsolute = watch('landValueAbsolute');

  // Track which field is being edited to prevent sync loops
  const editingFieldRef = useRef<'percent' | 'absolute' | null>(null);

  // Sync land value absolute when percentage changes (only if user is editing percent)
  useEffect(() => {
    if (editingFieldRef.current === 'absolute') return; // Don't sync if user is editing absolute
    
    const price = parseFloat(purchasePrice as string) || 0;
    const percent = parseFloat(landValuePercent as string) || 0;
    if (price > 0 && percent >= 0) {
      const absoluteValue = (price * percent / 100).toFixed(0);
      setValue('landValueAbsolute', absoluteValue, { shouldValidate: false });
    }
  }, [purchasePrice, landValuePercent, setValue]);


  const onFormSubmit = (data: Record<string, unknown>) => {
    // Convert string numbers to actual numbers
    // Convert percentage (e.g., 20) to decimal (e.g., 0.2) for API
    const { landValueAbsolute, ...rest } = data;
    const processed = {
      ...rest,
      propertySize: parseFloat(data.propertySize as string),
      purchasePrice: parseFloat(data.purchasePrice as string),
      landValuePercent: parseFloat(data.landValuePercent as string) / 100,
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
            <Label htmlFor="purchasePrice">Purchase Price *</Label>
            <FormattedNumberInput
              id="purchasePrice"
              placeholder="e.g., 350.000"
              suffix="€"
              value={purchasePrice as string}
              onChange={(val) => setValue('purchasePrice', val)}
              formatOptions={{ maximumFractionDigits: 0 }}
            />
            {errors.purchasePrice && (
              <p className="text-sm text-destructive">{errors.purchasePrice.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="landValuePercent">Land Value (%)</Label>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <Input
                  id="landValuePercent"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g., 20"
                  {...register('landValuePercent')}
                  onFocus={() => { editingFieldRef.current = 'percent'; }}
                  onBlur={() => { editingFieldRef.current = null; }}
                />
              </div>
              <span className="text-muted-foreground text-sm">%</span>
              <span className="text-muted-foreground">=</span>
              <div className="flex-1">
                <FormattedNumberInput
                  id="landValueAbsolute"
                  placeholder="€ value"
                  suffix="€"
                  value={landValueAbsolute as string || ''}
                  onChange={(val) => {
                    editingFieldRef.current = 'absolute';
                    const absoluteValue = parseFloat(val) || 0;
                    const price = parseFloat(purchasePrice as string) || 0;
                    if (price > 0 && absoluteValue > 0) {
                      const percent = ((absoluteValue / price) * 100).toFixed(1);
                      setValue('landValuePercent', percent, { shouldValidate: false });
                    }
                    setValue('landValueAbsolute', val);
                    setTimeout(() => { editingFieldRef.current = null; }, 100);
                  }}
                  onFocus={() => { editingFieldRef.current = 'absolute'; }}
                  onBlur={() => { editingFieldRef.current = null; }}
                  formatOptions={{ maximumFractionDigits: 0 }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Typically 15-25% for apartments. Both fields stay in sync.
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
