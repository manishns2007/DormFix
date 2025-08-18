
'use client';

import { FloorInchargeDashboardClient } from './floor-incharge-dashboard-client';
import { MaintenanceRequest } from '@/lib/types';

interface FloorInchargeDashboardClientLoaderProps {
  requests: MaintenanceRequest[];
}

export default function FloorInchargeDashboardClientLoader({ requests }: FloorInchargeDashboardClientLoaderProps) {
  return <FloorInchargeDashboardClient requests={requests} />;
}
