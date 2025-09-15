import { useMemo, useState } from 'react';

export const useFormatCurrency = (amount: number) => {
  const [prefix, setPrefix] = useState('');
  const [value, setValue] = useState('');
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  useMemo(() => {
    const formatted = formatCurrency(amount);
    const match = formatted.match(/^(\D+)([\d.,]+)/);
    const prefix = match?.[1] ?? '';
    const value = match?.[2] ?? '';

    prefix && setPrefix(prefix);
    value && setValue(value);
  }, [amount]);

  return { prefix, value };
};
