'use client';

import { Session } from 'next-auth';

type MainNavProps = React.HTMLAttributes<HTMLElement> & {
  className?: string;
  type?: 'mobile' | 'desktop';
  session?: Session;
};

const MainNav = ({ className, type, session, ...props }: MainNavProps) => {
  return <nav>MainNav</nav>;
};

export default MainNav;
