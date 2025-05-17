'use client';
import * as React from 'react';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { usePathname, useParams } from 'next/navigation';
import { PageContainer } from '@toolpad/core/PageContainer';
import Copyright from '../components/Copyright';
import SidebarFooterAccount from './SidebarFooterAccount';

export default function Layout(props: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const [employeeId] = params.segments ?? [];

  return (
    <DashboardLayout
      slots={{
        sidebarFooter: SidebarFooterAccount,
      }} 
    >
      <PageContainer title={""}>
        {props.children}
        <Copyright sx={{ my: 4 }} />
      </PageContainer>
    </DashboardLayout>
  );
}
