import {
  CircleUser,
  LayoutDashboard,
  Wrench,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { getRequests } from "@/lib/data";
import { detectDuplicateRequests } from "@/ai/flows/detect-duplicate-requests";
import { DashboardClient } from "@/components/dashboard-client";
import { format } from "date-fns";

export default async function DashboardPage() {
  const requests = await getRequests();

  const aiInput = {
    requests: requests.map((r) => ({
      roomNumber: r.roomNumber,
      category: r.category,
      priority: r.priority,
      description: r.description,
      status: r.status,
      createdDate: format(r.createdDate, "yyyy-MM-dd"),
    })),
  };

  const { duplicateGroups } = await detectDuplicateRequests(aiInput);
  const allDuplicateIndices = new Set(duplicateGroups.flat());
  const requestsWithDuplicates = requests.map((req, index) => ({
    ...req,
    isDuplicate: allDuplicateIndices.has(index),
  }));
  
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground">
                <Wrench className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-sidebar-foreground">DormFix</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Dashboard" isActive>
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <div className="w-full flex-1">
              <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
            </div>
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
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <DashboardClient requests={requestsWithDuplicates} />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
