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
      <div className="min-h-screen flex w-full bg-background">
        <FeedSidebar />
        <main className="flex-1 overflow-auto transition-all duration-300">
          <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b px-4 py-3 flex items-center gap-2">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          </div>
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

const FeedSidebar = () => {
  const { open } = useSidebar();
  
  return (
    <Sidebar
      className={`border-r bg-background transition-all duration-300 ${open ? 'w-[380px]' : 'w-0'}`}
      collapsible="offcanvas"
    >
      <SidebarHeader className="border-b p-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📱</span>
            <h2 className="text-lg font-semibold text-foreground">Open Feed</h2>
          </div>
          <SidebarTrigger className="hover:bg-muted" />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-0 overflow-hidden">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <Feed compact />
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
