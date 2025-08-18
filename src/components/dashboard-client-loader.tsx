
'use client';

import { MaintenanceRequest } from '@/lib/types';
import dynamic from 'next/dynamic';

const DashboardClient = dynamic(() => import('./dashboard-client').then(mod => mod.DashboardClient), { ssr: false });

interface DashboardClientLoaderProps {
  requests: MaintenanceRequest[];
}

export default function DashboardClientLoader({ requests }: DashboardClientLoaderProps) {
  return <DashboardClient requests={requests} />;
}
