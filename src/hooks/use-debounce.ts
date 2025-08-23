import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay?: number): T {
  const [deValue, setDeValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDeValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return deValue;
}
