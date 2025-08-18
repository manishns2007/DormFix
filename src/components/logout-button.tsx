
'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { logout } from '@/app/login/actions';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.refresh(); // Refresh the page to reflect the logged-out state
  };

  return (
    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
      <LogOut className="mr-2 h-4 w-4" />
      <span>Logout</span>
    </DropdownMenuItem>
  );
}
