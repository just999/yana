// hooks/use-password-validation.ts
import { useState } from 'react';

export function usePasswordValidation() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (value: string, isConfirm = false) => {
    const newErrors: string[] = [];

    if (!isConfirm) {
      if (value.length < 8) {
        newErrors.push('Password must be at least 8 characters');
      }
      if (!/[A-Z]/.test(value)) {
        newErrors.push('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(value)) {
        newErrors.push('Password must contain at least one lowercase letter');
      }
      if (!/[0-9]/.test(value)) {
        newErrors.push('Password must contain at least one number');
      }
      if (!/[^A-Za-z0-9]/.test(value)) {
        newErrors.push('Password must contain at least one special character');
      }
    } else if (value !== password) {
      newErrors.push('Passwords do not match');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    errors,
    validate,
  };
}
