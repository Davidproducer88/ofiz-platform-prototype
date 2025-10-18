import { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Feed } from '@/components/Feed';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  userType?: 'client' | 'master' | 'admin' | 'business';
}

export const DashboardLayout = ({ children, userType }: DashboardLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <FeedSidebar />
        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-50 bg-background border-b px-4 py-2 flex items-center gap-2">
            <SidebarTrigger />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

const FeedSidebar = () => {
  const { open } = useSidebar();
  
  return (
    <Sidebar
      className={`border-r bg-background ${open ? 'w-[380px]' : 'w-0'}`}
      collapsible="offcanvas"
    >
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Open Feed</h2>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-0">
        <div className="h-full overflow-y-auto">
          <Feed compact />
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
