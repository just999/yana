'use client';

import { useState } from 'react';

import { removeExpense } from '@/actions/expense-actions';
import { Button } from '@/components/ui';
import { X } from 'lucide-react';

type TransactionItemRemoveButtonProps = {
  id: string;
  onRemoved: () => void;
};

const TransactionItemRemoveButton = ({
  id,
  onRemoved,
}: TransactionItemRemoveButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleClick = async () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    try {
      setLoading(true);
      await removeExpense(id);
      onRemoved();
    } finally {
      setLoading(false);
    }
  };

  return <Button>{!loading && <X className='h-4 w-4' />}</Button>;
};

export default TransactionItemRemoveButton;
