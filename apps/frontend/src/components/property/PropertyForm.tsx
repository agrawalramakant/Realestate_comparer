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
      // Basic Info
      name: '',
      address: '',
      city: '',
      state: 'BERLIN',
      
      // Property Details
      propertySize: '',
      numberOfRooms: '',
      purchasePrice: '',
      landValuePercent: '20', // Percentage (20 = 20%)
      landValueAbsolute: '', // Calculated field
      constructionYear: '',
      
      // Rental Details
      rentalPricePerM2: '',
      parkingRentalIncome: '0',
      vacancyRate: '2', // Percentage
      houseAppreciation: '2', // Percentage
      rentIncrementPercent: '2', // Percentage
      rentIncrementFrequencyYears: '1',
      
      // Parking
      hasParkingSpace: false,
      parkingPrice: '0',
      parkingIncludedInPrice: true,
      
      // Costs
      maklerFeePercent: '0', // Percentage
      sourceName: '', // Broker/Source name
      sourceContact: '', // Broker/Source contact
      hausgeldTotal: '0',
      hausgeldNichtUmlagefaehig: '0',
      
      // Depreciation (AfA)
      afaType: 'LINEAR_2',
      customAfaRate: '', // For Restnutzungsdauer gutachten
      sonderAfaEligible: false, // §7b EStG
      sonderAfaPercent: '5',
      sonderAfaYears: '4',
      
      // Tax Profile
      annualGrossIncome: '',
      taxFilingType: 'SINGLE',
      
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


  // Watch for conditional fields
  const hasParkingSpace = watch('hasParkingSpace');
  const sonderAfaEligible = watch('sonderAfaEligible');
  const maklerFeePercent = watch('maklerFeePercent');
  const afaType = watch('afaType');
  const annualGrossIncome = watch('annualGrossIncome');

  const onFormSubmit = (data: Record<string, unknown>) => {
    // Convert string numbers to actual numbers
    // Convert percentages (e.g., 20) to decimals (e.g., 0.2) for API
    // Remove fields that don't belong in the API payload
    const { 
      landValueAbsolute, 
      // Remove read-only fields that come from initialData during edit
      id,
      createdAt,
      updatedAt,
      propertyStatus,
      financingScenarios,
      investmentAssumptions,
      calculationResults,
      taxProfile,
      // Remove any other potential relation fields
      _count,
      ...rest 
    } = data;
    
    const processed = {
      ...rest,
      propertySize: parseFloat(data.propertySize as string) || 0,
      numberOfRooms: data.numberOfRooms ? parseFloat(data.numberOfRooms as string) : null,
      purchasePrice: parseFloat(data.purchasePrice as string) || 0,
      landValuePercent: (parseFloat(data.landValuePercent as string) || 0) / 100,
      constructionYear: data.constructionYear ? parseInt(data.constructionYear as string) : null,
      rentalPricePerM2: parseFloat(data.rentalPricePerM2 as string) || 0,
      parkingRentalIncome: parseFloat(data.parkingRentalIncome as string) || 0,
      vacancyRate: (parseFloat(data.vacancyRate as string) || 0) / 100,
      houseAppreciation: (parseFloat(data.houseAppreciation as string) || 0) / 100,
      rentIncrementPercent: (parseFloat(data.rentIncrementPercent as string) || 0) / 100,
      rentIncrementFrequencyYears: parseInt(data.rentIncrementFrequencyYears as string) || 1,
      parkingPrice: parseFloat(data.parkingPrice as string) || 0,
      maklerFeePercent: (parseFloat(data.maklerFeePercent as string) || 0) / 100,
      hausgeldTotal: parseFloat(data.hausgeldTotal as string) || 0,
      hausgeldNichtUmlagefaehig: parseFloat(data.hausgeldNichtUmlagefaehig as string) || 0,
      // Include AfA settings for InvestmentAssumptions
      afaType: data.afaType as string,
      customAfaRate: data.customAfaRate ? (parseFloat(data.customAfaRate as string) || 0) / 100 : undefined,
      sonderAfaEligible: data.sonderAfaEligible as boolean,
      sonderAfaPercent: data.sonderAfaPercent ? (parseFloat(data.sonderAfaPercent as string) || 0) / 100 : 0,
      sonderAfaYears: data.sonderAfaYears ? parseInt(data.sonderAfaYears as string) : 0,
      // Tax Profile
      annualGrossIncome: data.annualGrossIncome ? parseFloat(data.annualGrossIncome as string) : null,
      taxFilingType: data.taxFilingType as string || 'SINGLE',
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
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="e.g., Friedrichstraße 123"
              {...register('address')}
            />
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
            <Label htmlFor="constructionYear">Construction Year</Label>
            <Input
              id="constructionYear"
              type="number"
              min="1800"
              max="2030"
              placeholder="e.g., 2020"
              {...register('constructionYear')}
            />
            <p className="text-xs text-muted-foreground">
              Affects depreciation rate (pre-1925: 2.5%, post-1925: 2%)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rental Details */}
      <Card>
        <CardHeader>
          <CardTitle>Rental Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="rentalPricePerM2">Rent per m² (€/month) *</Label>
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

          <div className="space-y-2">
            <Label htmlFor="parkingRentalIncome">Parking Rental Income (€/month)</Label>
            <Input
              id="parkingRentalIncome"
              type="number"
              step="1"
              placeholder="e.g., 80"
              {...register('parkingRentalIncome')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vacancyRate">Vacancy Rate (%)</Label>
            <Input
              id="vacancyRate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="e.g., 2"
              {...register('vacancyRate')}
            />
            <p className="text-xs text-muted-foreground">Expected vacancy, typically 2-5%</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="houseAppreciation">Annual Appreciation (%)</Label>
            <Input
              id="houseAppreciation"
              type="number"
              step="0.1"
              min="0"
              max="20"
              placeholder="e.g., 2"
              {...register('houseAppreciation')}
            />
            <p className="text-xs text-muted-foreground">Expected yearly property value increase</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rentIncrementPercent">Rent Increase (%)</Label>
            <Input
              id="rentIncrementPercent"
              type="number"
              step="0.1"
              min="0"
              max="20"
              placeholder="e.g., 2"
              {...register('rentIncrementPercent')}
            />
            <p className="text-xs text-muted-foreground">Periodic rent increase percentage</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rentIncrementFrequencyYears">Increase Every (Years)</Label>
            <select
              id="rentIncrementFrequencyYears"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('rentIncrementFrequencyYears')}
            >
              <option value="1">Every 1 year</option>
              <option value="2">Every 2 years</option>
              <option value="3">Every 3 years</option>
              <option value="4">Every 4 years</option>
              <option value="5">Every 5 years</option>
            </select>
            <p className="text-xs text-muted-foreground">How often rent is increased</p>
          </div>
        </CardContent>
      </Card>

      {/* Costs */}
      <Card>
        <CardHeader>
          <CardTitle>Costs & Fees</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="maklerFeePercent">Broker Fee (%)</Label>
            <Input
              id="maklerFeePercent"
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="e.g., 3.57"
              {...register('maklerFeePercent')}
            />
            <p className="text-xs text-muted-foreground">Makler commission (0 if no broker)</p>
          </div>

          {parseFloat(maklerFeePercent as string) > 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="sourceName">Broker Name</Label>
                <Input
                  id="sourceName"
                  placeholder="e.g., Immobilien Schmidt GmbH"
                  {...register('sourceName')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceContact">Broker Contact</Label>
                <Input
                  id="sourceContact"
                  placeholder="e.g., +49 30 12345678 or email"
                  {...register('sourceContact')}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="hausgeldTotal">Total Hausgeld (€/month)</Label>
            <Input
              id="hausgeldTotal"
              type="number"
              step="1"
              min="0"
              placeholder="e.g., 250"
              {...register('hausgeldTotal')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hausgeldNichtUmlagefaehig">Non-Recoverable Hausgeld (€/month)</Label>
            <Input
              id="hausgeldNichtUmlagefaehig"
              type="number"
              step="1"
              min="0"
              placeholder="e.g., 100"
              {...register('hausgeldNichtUmlagefaehig')}
            />
            <p className="text-xs text-muted-foreground">Portion not passed to tenant</p>
          </div>

          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasParkingSpace"
                className="h-4 w-4"
                {...register('hasParkingSpace')}
              />
              <Label htmlFor="hasParkingSpace">Has Parking Space</Label>
            </div>
          </div>

          {hasParkingSpace && (
            <>
              <div className="space-y-2">
                <Label htmlFor="parkingPrice">Parking Price (€)</Label>
                <Input
                  id="parkingPrice"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="e.g., 15000"
                  {...register('parkingPrice')}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="parkingIncludedInPrice"
                    className="h-4 w-4"
                    {...register('parkingIncludedInPrice')}
                  />
                  <Label htmlFor="parkingIncludedInPrice">Parking included in purchase price</Label>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tax Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="annualGrossIncome">Annual Gross Income (€)</Label>
            <FormattedNumberInput
              id="annualGrossIncome"
              placeholder="e.g., 80.000"
              suffix="€"
              value={annualGrossIncome as string}
              onChange={(val) => setValue('annualGrossIncome', val)}
              formatOptions={{ maximumFractionDigits: 0 }}
            />
            <p className="text-xs text-muted-foreground">
              Your total annual income (for marginal tax rate calculation)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxFilingType">Tax Filing Type</Label>
            <select
              id="taxFilingType"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('taxFilingType')}
            >
              <option value="SINGLE">Single (Einzelveranlagung)</option>
              <option value="JOINT">Joint / Married (Zusammenveranlagung)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Joint filing uses Ehegattensplitting (lower tax rate)
            </p>
          </div>

          {annualGrossIncome && parseFloat(annualGrossIncome as string) > 0 && (
            <div className="md:col-span-2 p-3 bg-muted rounded-md">
              <p className="text-sm">
                <strong>Estimated Marginal Tax Rate:</strong>{' '}
                {(() => {
                  const income = parseFloat(annualGrossIncome as string) || 0;
                  const filingType = watch('taxFilingType');
                  const incomeForBracket = filingType === 'JOINT' ? income / 2 : income;
                  
                  let rate: number;
                  if (incomeForBracket <= 11604) rate = 0;
                  else if (incomeForBracket <= 17005) rate = 0.14 + ((incomeForBracket - 11604) / 10000) * 0.10;
                  else if (incomeForBracket <= 66760) rate = 0.24 + ((incomeForBracket - 17005) / (66760 - 17005)) * 0.18;
                  else if (incomeForBracket <= 277825) rate = 0.42;
                  else rate = 0.45;
                  
                  return `${(rate * 100).toFixed(1)}%`;
                })()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Depreciation (AfA) */}
      <Card>
        <CardHeader>
          <CardTitle>Depreciation (AfA)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="afaType">Depreciation Type</Label>
            <select
              id="afaType"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('afaType')}
            >
              <option value="LINEAR_2">Linear 2% (50 years, standard)</option>
              <option value="LINEAR_2_5">Linear 2.5% (40 years, pre-1925)</option>
              <option value="LINEAR_3">Linear 3% (33 years, new build)</option>
              <option value="LINEAR_4">Linear 4% (25 years)</option>
              <option value="DEGRESSIVE_5">Degressive 5% (new builds 2023+)</option>
              <option value="CUSTOM">Custom (Restnutzungsdauer Gutachten)</option>
            </select>
          </div>

          {afaType === 'CUSTOM' && (
            <div className="space-y-2">
              <Label htmlFor="customAfaRate">Custom AfA Rate (%)</Label>
              <Input
                id="customAfaRate"
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="e.g., 3.5"
                {...register('customAfaRate')}
              />
              <p className="text-xs text-muted-foreground">
                Based on Restnutzungsdauer assessment (e.g., 28 years = 3.57%)
              </p>
            </div>
          )}

          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sonderAfaEligible"
                className="h-4 w-4"
                {...register('sonderAfaEligible')}
              />
              <Label htmlFor="sonderAfaEligible">Eligible for §7b EStG (Sonder-AfA)</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Special depreciation for affordable housing (max 5% for 4 years, building cost ≤ €4,800/m²)
            </p>
          </div>

          {sonderAfaEligible && (
            <>
              <div className="space-y-2">
                <Label htmlFor="sonderAfaPercent">Sonder-AfA Rate (%)</Label>
                <Input
                  id="sonderAfaPercent"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="5"
                  {...register('sonderAfaPercent')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sonderAfaYears">Sonder-AfA Years</Label>
                <Input
                  id="sonderAfaYears"
                  type="number"
                  min="1"
                  max="4"
                  placeholder="4"
                  {...register('sonderAfaYears')}
                />
              </div>
            </>
          )}
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
