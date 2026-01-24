import { useState, createContext, useContext } from 'react';
import {
  Home,
  ShoppingBag,
  Search,
  FileText,
  ClipboardList,
  Heart,
  MessageSquare,
  User,
  Award,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface ClientDashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Context for sidebar state
const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}>({
  collapsed: false,
  setCollapsed: () => {},
});

export const useClientSidebar = () => useContext(SidebarContext);

const menuItems = [
  { id: 'feed', label: 'Feed', icon: Home },
  { id: 'marketplace', label: 'Mercado', icon: ShoppingBag },
  { id: 'services', label: 'Servicios', icon: Search },
  { id: 'requests', label: 'Solicitudes', icon: FileText },
  { id: 'bookings', label: 'Reservas', icon: ClipboardList },
  { id: 'favorites', label: 'Favoritos', icon: Heart },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'achievements', label: 'Logros', icon: Award },
];

export const ClientDashboardSidebar = ({
  activeTab,
  onTabChange,
}: ClientDashboardSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <TooltipProvider delayDuration={0}>
      <ScrollArea className="h-full">
        <div className="space-y-1 p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            const button = (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  'w-full h-11 font-medium transition-colors',
                  collapsed ? 'justify-center px-2' : 'justify-start gap-3 px-3',
                  isActive
                    ? 'bg-primary/10 text-primary hover:bg-primary/15'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
                onClick={() => {
                  onTabChange(item.id);
                  onItemClick?.();
                }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Button>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    {button}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return button;
          })}
        </div>
      </ScrollArea>
    </TooltipProvider>
  );

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {/* Mobile: Sheet/Drawer */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed left-4 top-20 z-50 h-10 w-10 rounded-full shadow-lg bg-background"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">Menú</h2>
            </div>
            <SidebarContent onItemClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Fixed Sidebar */}
      <aside
        className={cn(
          'hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r shadow-sm transition-all duration-300 z-30',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-muted"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>

        {/* Menu Items */}
        <div className="pt-4">
          <SidebarContent />
        </div>
      </aside>
    </SidebarContext.Provider>
  );
};

// Export collapsed width for layout calculations
export const SIDEBAR_WIDTH = 224; // 14rem = 56 * 4 = 224px (w-56)
export const SIDEBAR_COLLAPSED_WIDTH = 64; // 4rem = 16 * 4 = 64px (w-16)
