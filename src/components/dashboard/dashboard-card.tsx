import { Card, CardContent } from '@/components/ui';
import { LucideIcon } from 'lucide-react';

type DashboardCardProps = {
  title: string;
  count: number;
  icon: React.ReactElement<LucideIcon>;
};

const DashboardCard = ({ title, count, icon }: DashboardCardProps) => {
  return (
    <Card className='bg-slate-100 p-4 pb-2 backdrop-blur-sm dark:bg-white/10'>
      <CardContent>
        <h3 className='mb-4 text-center text-3xl font-bold text-slate-500 dark:text-slate-200'>
          {title}
        </h3>
        <div className='flex items-center justify-center gap-5'>
          {icon}
          <h3 className='text-2xl font-semibold text-slate-500 dark:text-slate-200'>
            {count}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
