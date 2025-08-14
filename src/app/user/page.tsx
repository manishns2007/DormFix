import {
  CircleUser,
  Wrench,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "../login/actions";
import { UserDashboardClient } from "@/components/user-dashboard-client";
import { redirect } from 'next/navigation';


export default async function UserDashboardPage() {
  
  const handleLogout = async () => {
    'use server';
    await logout();
    redirect('/login');
  }
  
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
            User Dashboard
          </a>
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <h1 className="flex-1 text-lg font-semibold md:text-2xl">My Requests</h1>
          <div className="ml-auto flex-initial">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <CircleUser className="h-5 w-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <form action={handleLogout}>
                    <Button type="submit" variant="ghost" className="w-full justify-start">
                        <LogOut className="mr-2 h-4 w-4"/>
                        Logout
                    </Button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <UserDashboardClient />
      </main>
    </div>
  );
}
