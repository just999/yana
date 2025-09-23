import { useMemo, useState } from 'react';

// export const useFormatCurrency = (amount: number) => {
//   const [prefix, setPrefix] = useState('');
//   const [value, setValue] = useState('');
//   const formatCurrency = (amount: number) =>
//     new Intl.NumberFormat('id-ID', {
//       style: 'currency',
//       currency: 'IDR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount);

//   useMemo(() => {
//     const formatted = formatCurrency(amount);
//     const match = formatted.match(/^(\D+)([\d.,]+)/);
//     const prefix = match?.[1] ?? '';
//     const value = match?.[2] ?? '';

//     prefix && setPrefix(prefix);
//     value && setValue(value);
//   }, [amount]);

//   return { prefix, value };
// };

export const useFormatCurrency = (amount: number) => {
  const [prefix, setPrefix] = useState('');
  const [value, setValue] = useState('');

  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0;
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));

    return isNegative ? `-${formatted}` : formatted;
  };

  useMemo(() => {
    const formatted = formatCurrency(amount);
    // Updated regex to capture negative sign
    const match = formatted.match(/^(-?\D*)([\d.,]+)/);
    const prefixPart = match?.[1] ?? '';
    const valuePart = match?.[2] ?? '';

    if (prefixPart) setPrefix(prefixPart);
    if (valuePart) setValue(valuePart);
  }, [amount]);

  return { prefix, value };
};

// Option 1: Just return the full formatted string
export const formatCurrency = (amount: number | null | undefined) => {
  return useMemo(() => {
    const numericAmount = Number(amount) || 0;

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  }, [amount]);
};

// Option 2: Create separate utility functions
export const useEvenSimplerFormatCurrency = (
  amount: number | null | undefined
): string => {
  const numericAmount = Number(amount) || 0;

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
};

export const useFormatCurrencyParts = (amount: number | null | undefined) => {
  const formatted = formatCurrency(amount);
  const match = formatted.match(/^(\D+)([\d.,]+)/);

  return {
    prefix: match?.[1]?.trim() ?? 'Rp',
    value: match?.[2] ?? '0',
    full: formatted,
  };
};
