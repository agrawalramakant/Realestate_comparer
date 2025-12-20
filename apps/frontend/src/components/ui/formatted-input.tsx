'use client';

import * as React from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface FormattedNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number;
  onChange: (value: string) => void;
  formatOptions?: Intl.NumberFormatOptions;
  suffix?: string;
  prefix?: string;
}

/**
 * Format a number with thousand separators (German locale)
 */
function formatNumber(value: string | number, options?: Intl.NumberFormatOptions): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  if (isNaN(num)) return '';
  
  return new Intl.NumberFormat('de-DE', {
    maximumFractionDigits: 2,
    ...options,
  }).format(num);
}

/**
 * Parse a formatted number string back to a plain number string
 */
function parseFormattedNumber(value: string): string {
  // Remove thousand separators (.) and convert decimal comma to dot
  const cleaned = value.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? '' : num.toString();
}

export function FormattedNumberInput({
  value,
  onChange,
  formatOptions,
  suffix,
  prefix,
  className,
  onFocus,
  onBlur,
  ...props
}: FormattedNumberInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [displayValue, setDisplayValue] = React.useState('');

  // Update display value when value prop changes (and not focused)
  React.useEffect(() => {
    if (!isFocused) {
      const formatted = value ? formatNumber(value, formatOptions) : '';
      setDisplayValue(formatted);
    }
  }, [value, isFocused, formatOptions]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Show raw number when focused for easier editing
    const rawValue = typeof value === 'number' ? value.toString() : value;
    setDisplayValue(rawValue);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    // Format the number on blur
    const formatted = displayValue ? formatNumber(displayValue, formatOptions) : '';
    setDisplayValue(formatted);
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    // Parse and send the raw number value
    const parsed = parseFormattedNumber(inputValue);
    onChange(parsed || inputValue);
  };

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          {prefix}
        </span>
      )}
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          prefix && 'pl-7',
          suffix && 'pr-8',
          className
        )}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          {suffix}
        </span>
      )}
    </div>
  );
}
