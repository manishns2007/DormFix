
import {
  CircleUser,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cookies } from "next/headers";
import { getRequests } from "@/lib/data";
import { LogoutButton } from "@/components/logout-button";
import dynamic from "next/dynamic";

const FloorInchargeDashboardClientLoader = dynamic(() => import('@/components/floor-incharge-dashboard-client-loader'), { ssr: false });


export default async function FloorInchargeDashboardPage() {
  const sessionCookie = cookies().get('session');
  const session = sessionCookie ? JSON.parse(sessionCookie.value) : null;
  const userEmail = session?.email || 'My Account';
  const userRole = session?.role || 'Floor In-Charge';
  const userHostel = session?.hostelName;
  const userFloor = session?.floor;

  const requests = await getRequests({ hostelName: userHostel, floor: userFloor });
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <a
            href="#"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Wrench className="h-6 w-6" />
            <span className="sr-only">DormFix</span>
          </a>
          <a
            href="#"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Floor In-Charge Dashboard
          </a>
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <h1 className="flex-1 text-lg font-semibold md:text-2xl">
              {userHostel} - Floor {userFloor}
            </h1>
          <div className="ml-auto flex-initial">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <CircleUser className="h-5 w-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                    <div>{userEmail}</div>
                    <div className="font-normal text-xs text-muted-foreground">{userRole}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <FloorInchargeDashboardClientLoader requests={requests} />
      </main>
    </div>
  );
}
