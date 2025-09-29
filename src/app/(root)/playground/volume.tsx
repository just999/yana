'use client';

import { sLAtom } from '@/lib/jotai/atoms';
import { useAtom } from 'jotai';

type VolumeProps = unknown;

const Volume = () => {
  const [sl, setSl] = useAtom(sLAtom);
  return (
    <div className='flex items-center gap-5'>
      <div>
        Volume (cube) ({sl} x {sl} x {sl}){' '}
      </div>
      <div className='text-3xl text-amber-600 underline'>{sl * sl * sl}</div>
    </div>
  );
};

export default Volume;
