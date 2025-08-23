'use client';

import { sLAtom } from '@/lib/jotai/atoms';
import { useAtom } from 'jotai';

type PerimeterProps = unknown;

const Perimeter = () => {
  const [sl, setSl] = useAtom(sLAtom);

  return (
    <div className='flex items-center gap-5'>
      <div>Area (square)( {sl} x 4)</div>
      <div className='text-3xl text-amber-600 underline'>{4 * sl}</div>
    </div>
  );
};

export default Perimeter;
