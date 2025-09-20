'use client';

import { useState } from 'react';

import { Button, InputCustom } from '@/components/ui';
import { priceAtom, sLAtom } from '@/lib/jotai/atoms';
import { useAtom } from 'jotai';

const InputForm = () => {
  const [sl, setSl] = useAtom(sLAtom);
  const [price, setPrice] = useAtom(priceAtom);
  const [value, setValue] = useState({ sl: 0, price: 0 });

  const handleChange = (e: { target: { value: string; name: string } }) => {
    const { name, value } = e.target;
    setValue((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const setPriceAndLength = () => {
    setSl(Number(value.sl));
    setPrice(Number(value.price));
  };
  return (
    <div className='flex flex-col'>
      <InputCustom
        type='number'
        value={value.sl}
        name='sl'
        onChange={handleChange}
        placeholder='side'
        className='p-4'
      />
      <InputCustom
        type='number'
        value={value.price}
        name='price'
        onChange={handleChange}
        placeholder='price'
        className='p-4'
      />

      <Button onClick={() => setPriceAndLength()} className='w-fit'>
        Set Side Length
      </Button>
    </div>
  );
};

export default InputForm;
