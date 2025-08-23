import { getAllBlogsData } from '@/actions/blog-actions';
import { getAllUsers } from '@/actions/user-actions';
import {
  Badge,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';

import { CardAction } from './ui/card';

interface OverviewCardData {
  id: string;
  title: string;
  value: string | number;
  description: string;
  trend: {
    value: string;
    isPositive: boolean;
    icon: LucideIcon;
  };
  footer: {
    primary: string;
    secondary: string;
  };
  href?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

interface OverviewCardProps {
  data: OverviewCardData;
  className?: string;
}

interface SectionCardsProps {
  className?: string;
}

const OverviewCard = ({ data, className = '' }: OverviewCardProps) => {
  const TrendIcon = data.trend.icon;
  const cardVariant = data.variant || 'default';

  const cardContent = (
    <Card className={cn(`@container/card h-48`, className)}>
      <CardHeader>
        <CardDescription>{data.title}</CardDescription>
        <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
          {data.value}
        </CardTitle>
        <CardAction>
          <Badge
            variant='outline'
            className={
              data.trend.isPositive
                ? 'border-green-200 bg-green-50 text-green-600 dark:border-green-800 dark:bg-green-950 dark:text-green-400'
                : 'border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400'
            }
          >
            <TrendIcon className='mr-1 h-3 w-3' />
            {data.trend.value}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className='flex-col items-start gap-1.5 text-sm'>
        <div className='line-clamp-1 flex gap-2 font-medium'>
          {data.footer.primary} <TrendIcon className='size-4' />
        </div>
        <div className='text-muted-foreground'>{data.footer.secondary}</div>
      </CardFooter>
    </Card>
  );

  if (data.href) {
    return (
      <Link
        href={data.href}
        className='block transition-transform hover:scale-[1.02]'
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

const SectionCards = async ({ className = 'h-48' }: SectionCardsProps) => {
  const blogs = (await getAllBlogsData()).data;
  const users = (await getAllUsers()).data;

  const today = new Date();
  const isSameDay = (date: Date) =>
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const newUsersToday = users?.filter((user) => {
    const createdAt = new Date(user.createdAt);
    return isSameDay(createdAt);
  });

  const totalUsers = users?.length || 0;
  const totalBlogs = blogs?.length || 0;
  const growthRate = 4.5;

  const cardsData: OverviewCardData[] = [
    {
      id: 'total-posts',
      title: 'Total Posts',
      value: totalBlogs,
      description: 'All published blog posts',
      trend: {
        value: '+12.5%',
        isPositive: true,
        icon: TrendingUp,
      },
      footer: {
        primary: 'Trending up this month',
        secondary: 'Visitors for the last 6 months',
      },
      href: '/dashboard/blogs',
      variant: 'success',
    },
    {
      id: 'new-users',
      title: 'New Users Today',
      value: newUsersToday?.length || 0,
      description: 'Users registered today',
      trend: {
        value: '-20%',
        isPositive: false,
        icon: TrendingDown,
      },
      footer: {
        primary: 'Down 20% this period',
        secondary: 'Acquisition needs attention',
      },
      variant: 'warning',
    },
    {
      id: 'active-users',
      title: 'Total Users',
      value: totalUsers,
      description: 'All registered users',
      trend: {
        value: '+12.5%',
        isPositive: true,
        icon: TrendingUp,
      },
      footer: {
        primary: 'Strong user retention',
        secondary: 'Engagement exceeds targets',
      },
      href: '/dashboard/users',
      variant: 'success',
    },
    {
      id: 'growth-rate',
      title: 'Growth Rate',
      value: `${growthRate}%`,
      description: 'Monthly growth percentage',
      trend: {
        value: `+${growthRate}%`,
        isPositive: true,
        icon: TrendingUp,
      },
      footer: {
        primary: 'Steady performance increase',
        secondary: 'Meets growth projections',
      },
      variant: 'default',
    },
  ];

  return (
    <div
      className={`*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 ${className} `}
    >
      {cardsData.map((cardData) => (
        <OverviewCard key={cardData.id} data={cardData} />
      ))}
    </div>
  );
};

export const CustomSectionCards = ({
  cardsData,
  className = '',
}: {
  cardsData: OverviewCardData[];
  className?: string;
}) => {
  return (
    <div
      className={`*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 ${className} `}
    >
      {cardsData.map((cardData) => (
        <OverviewCard key={cardData.id} data={cardData} />
      ))}
    </div>
  );
};

export const useOverviewCards = () => {
  const createCardData = (
    id: string,
    title: string,
    value: string | number,
    trendValue: string,
    isPositive: boolean = true,
    footerPrimary: string = '',
    footerSecondary: string = '',
    href?: string
  ): OverviewCardData => ({
    id,
    title,
    value,
    description: title,
    trend: {
      value: trendValue,
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown,
    },
    footer: {
      primary: footerPrimary,
      secondary: footerSecondary,
    },
    href,
  });

  return { createCardData };
};

export const ExampleUsage = () => {
  const { createCardData } = useOverviewCards();

  const customCards: OverviewCardData[] = [
    createCardData(
      'revenue',
      'Monthly Revenue',
      '$12,345',
      '+15.3%',
      true,
      'Revenue increased this month',
      'Target exceeded by 15%',
      '/dashboard/revenue'
    ),
    createCardData(
      'orders',
      'Total Orders',
      1234,
      '-5.2%',
      false,
      'Orders decreased this week',
      'Need marketing boost'
    ),
  ];

  return <CustomSectionCards cardsData={customCards} />;
};

export default SectionCards;
export { OverviewCard };
export type { OverviewCardData, OverviewCardProps };
