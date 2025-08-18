
'use client';

import { DashboardClient } from './dashboard-client';
import { MaintenanceRequest } from '@/lib/types';

interface DashboardClientLoaderProps {
  requests: MaintenanceRequest[];
}

export default function DashboardClientLoader({ requests }: DashboardClientLoaderProps) {
  return <DashboardClient requests={requests} />;
}
