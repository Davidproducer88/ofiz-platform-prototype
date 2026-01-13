import { Bell, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  title?: string;
  userName?: string;
  avatarUrl?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  unreadCount?: number;
  onSearchClick?: () => void;
  onNotificationClick?: () => void;
  onAvatarClick?: () => void;
  className?: string;
}

export function AppHeader({
  title,
  userName = 'Usuario',
  avatarUrl,
  showSearch = true,
  showNotifications = true,
  unreadCount = 0,
  onSearchClick,
  onNotificationClick,
  onAvatarClick,
  className
}: AppHeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-40 glass-ios border-b border-border/50",
      className
    )}>
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Avatar & Greeting */}
        <button 
          onClick={onAvatarClick}
          className="flex items-center gap-3 ios-press"
        >
          <Avatar className="h-9 w-9 ring-2 ring-primary/20">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-bold">
              {userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            {title ? (
              <h1 className="font-semibold text-foreground text-lg">{title}</h1>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">¡Hola!</p>
                <p className="font-semibold text-foreground text-sm leading-tight">{userName}</p>
              </>
            )}
          </div>
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <button
              onClick={onSearchClick}
              className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center ios-press"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
          
          {showNotifications && (
            <button
              onClick={onNotificationClick}
              className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center ios-press relative"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-0.5 -right-0.5 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}