'use client';

import { sLAtom } from '@/lib/jotai/atoms';
import { useAtom } from 'jotai';

type AreaProps = unknown;

const Area = () => {
  const [sl, setSl] = useAtom(sLAtom);

  return (
    <div className='flex items-center gap-5'>
      <div>
        Area (square) ({sl} x {sl} )
      </div>
      <div className='text-3xl text-amber-600 underline'>{sl * sl}</div>
    </div>
  );
};

export default Area;
