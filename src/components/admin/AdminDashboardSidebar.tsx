import { useState } from 'react';
import {
  Home,
  Users,
  UserCheck,
  Shield,
  Calendar,
  Star,
  CreditCard,
  Megaphone,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Lock,
  Settings,
  Crown,
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

interface AdminDashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'feed', label: 'Feed', icon: Home },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'masters', label: 'Maestros', icon: UserCheck },
  { id: 'verification', label: 'Verificaciones', icon: Shield },
  { id: 'bookings', label: 'Reservas', icon: Calendar },
  { id: 'reviews', label: 'Reseñas', icon: Star },
  { id: 'subscriptions', label: 'Suscripciones', icon: CreditCard },
  { id: 'ads', label: 'Anuncios', icon: Megaphone },
  { id: 'disputes', label: 'Disputas', icon: AlertTriangle },
  { id: 'transactions', label: 'Transacciones', icon: DollarSign },
  { id: 'rankings', label: 'Rankings', icon: BarChart3 },
  { id: 'financial', label: 'Financiero', icon: DollarSign },
  { id: 'security', label: 'Seguridad', icon: Lock },
  { id: 'config', label: 'Configuración', icon: Settings },
  { id: 'executives', label: 'C-Level', icon: Crown },
];

export const AdminDashboardSidebar = ({
  activeTab,
  onTabChange,
}: AdminDashboardSidebarProps) => {
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
    <>
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
              <h2 className="font-semibold text-lg">Menú Admin</h2>
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
    </>
  );
};
