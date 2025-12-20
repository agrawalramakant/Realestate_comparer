'use client';

import Link from 'next/link';
import { useProperties, useDeleteProperty } from '@/lib/hooks/use-properties';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Eye, Trash2, Home } from 'lucide-react';

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  INITIAL_INPUT: 'secondary',
  APPOINTMENT_SCHEDULED: 'warning',
  VISITED: 'default',
  OFFER_MADE: 'warning',
  REJECTED: 'destructive',
  PURCHASED: 'success',
};

const STATUS_LABELS: Record<string, string> = {
  INITIAL_INPUT: 'Initial',
  APPOINTMENT_SCHEDULED: 'Scheduled',
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

function formatNumber(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('de-DE').format(num);
}

export function PropertyList() {
  const { data, isLoading, error } = useProperties();
  const deleteProperty = useDeleteProperty();

  if (isLoading) {
    return <PropertyListSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive">Error loading properties</p>
        </CardContent>
      </Card>
    );
  }

  const properties = data?.data || [];

  if (properties.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="text-muted-foreground">
            {data?.total} {data?.total === 1 ? 'property' : 'properties'} found
          </p>
        </div>
        <Button asChild>
          <Link href="/properties/new">
            <Plus className="h-4 w-4 mr-2" />
            New Property
          </Link>
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Size (m²)</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">€/m²</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/properties/${property.id}`}
                    className="hover:underline"
                  >
                    {property.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {property.city}, {property.state.replace(/_/g, ' ')}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_COLORS[property.propertyStatus] || 'default'}>
                    {STATUS_LABELS[property.propertyStatus] || property.propertyStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(property.propertySize)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(property.purchasePrice)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                    parseFloat(property.purchasePrice) / parseFloat(property.propertySize)
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/properties/${property.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Delete this property?')) {
                          deleteProperty.mutate(property.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Properties</h1>
      </div>
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Home className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No properties yet</h2>
          <p className="text-muted-foreground mb-6">
            Start by adding your first property to analyze
          </p>
          <Button asChild>
            <Link href="/properties/new">
              <Plus className="h-4 w-4 mr-2" />
              Add First Property
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PropertyListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-16 ml-auto" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
