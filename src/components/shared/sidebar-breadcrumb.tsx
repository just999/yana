'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui';
import { getBreadcrumbTrailFromPath } from '@/lib/utils';
import { usePathname } from 'next/navigation';

type SidebarBreadcrumbProps = unknown;

const SidebarBreadcrumb = () => {
  const pathname = usePathname();
  const breadcrumbTrail = getBreadcrumbTrailFromPath(pathname);
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbTrail.map((item, idx) => {
          const isLast = idx === breadcrumbTrail.length - 1;
          return (
            <span key={item.url} className='flex items-center'>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.url}>{item.title}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </span>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default SidebarBreadcrumb;
