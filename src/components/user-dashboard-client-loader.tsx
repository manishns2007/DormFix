
'use client';

import dynamic from 'next/dynamic';
import { MaintenanceRequest } from '@/lib/types';

// Dynamically import the UserDashboardClient component with SSR turned off.
// This ensures that the component, which uses client-side state and hooks,
// is only rendered on the client, preventing hydration errors.
const UserDashboardClient = dynamic(() => import('@/components/user-dashboard-client').then(mod => mod.UserDashboardClient), {
  ssr: false,
});

interface UserDashboardClientLoaderProps {
    requests: MaintenanceRequest[];
}

export default function UserDashboardClientLoader({ requests }: UserDashboardClientLoaderProps) {
  return <UserDashboardClient requests={requests} />;
}
