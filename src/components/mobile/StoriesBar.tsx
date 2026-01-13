import { useState } from 'react';
import { Plus, Zap, Hammer, PaintBucket, Droplets, Wrench, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Story {
  id: string;
  name: string;
  avatar: string;
  category?: string;
  isLive?: boolean;
  viewed?: boolean;
  isAddStory?: boolean;
}

interface StoriesBarProps {
  stories?: Story[];
  userAvatar?: string;
  onStoryClick?: (storyId: string) => void;
  onAddStory?: () => void;
  className?: string;
}

const defaultStories: Story[] = [
  { id: '1', name: 'Carlos', avatar: '/avatars/master-electrician-1.jpg', category: 'Electricidad', isLive: true },
  { id: '2', name: 'María', avatar: '/avatars/master-carpenter-1.jpg', category: 'Carpintería' },
  { id: '3', name: 'Juan', avatar: '/avatars/master-painter-1.jpg', category: 'Pintura', viewed: true },
  { id: '4', name: 'Pedro', avatar: '/avatars/master-plumber-1.jpg', category: 'Plomería' },
  { id: '5', name: 'Ana', avatar: '/avatars/master-cleaning-1.jpg', category: 'Limpieza' },
  { id: '6', name: 'Luis', avatar: '/avatars/master-gardener-1.jpg', category: 'Jardinería', viewed: true },
];

const getCategoryIcon = (category?: string) => {
  const icons: Record<string, any> = {
    'Electricidad': Zap,
    'Carpintería': Hammer,
    'Pintura': PaintBucket,
    'Plomería': Droplets,
    'Limpieza': Sparkles,
    'Jardinería': Wrench,
  };
  const Icon = category ? icons[category] || Wrench : Wrench;
  return <Icon className="h-3 w-3" />;
};

export function StoriesBar({ 
  stories = defaultStories, 
  userAvatar,
  onStoryClick,
  onAddStory,
  className 
}: StoriesBarProps) {
  const [viewedStories, setViewedStories] = useState<Set<string>>(
    new Set(stories.filter(s => s.viewed).map(s => s.id))
  );

  const handleStoryClick = (storyId: string) => {
    setViewedStories(prev => new Set([...prev, storyId]));
    onStoryClick?.(storyId);
  };

  return (
    <div className={cn("w-full py-3 bg-card/50", className)}>
      <ScrollArea className="w-full">
        <div className="flex gap-3 px-4">
          {/* Add Story Button */}
          <button
            onClick={onAddStory}
            className="flex flex-col items-center gap-1.5 min-w-[68px] ios-press"
          >
            <div className="relative">
              <Avatar className="h-16 w-16 ring-2 ring-border">
                <AvatarImage src={userAvatar} />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  Tu
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 h-6 w-6 bg-primary rounded-full flex items-center justify-center ring-2 ring-card">
                <Plus className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            </div>
            <span className="text-[11px] font-medium text-foreground">Tu historia</span>
          </button>

          {/* Stories */}
          {stories.map((story) => {
            const isViewed = viewedStories.has(story.id);
            
            return (
              <button
                key={story.id}
                onClick={() => handleStoryClick(story.id)}
                className="flex flex-col items-center gap-1.5 min-w-[68px] ios-press"
              >
                <div className="relative">
                  {/* Story Ring */}
                  <div className={cn(
                    "rounded-full p-[2.5px]",
                    story.isLive 
                      ? "bg-gradient-to-tr from-red-500 via-pink-500 to-orange-400" 
                      : isViewed
                        ? "bg-muted"
                        : "story-ring"
                  )}>
                    <div className="bg-card rounded-full p-[2px]">
                      <Avatar className="h-[60px] w-[60px]">
                        <AvatarImage src={story.avatar} alt={story.name} />
                        <AvatarFallback className="bg-muted">{story.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  
                  {/* Live indicator */}
                  {story.isLive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-red-500 text-[9px] font-bold text-white rounded uppercase tracking-wide">
                      En vivo
                    </div>
                  )}
                  
                  {/* Category badge */}
                  {!story.isLive && story.category && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center ring-2 ring-card">
                      {getCategoryIcon(story.category)}
                    </div>
                  )}
                </div>
                
                <span className={cn(
                  "text-[11px] font-medium truncate w-full text-center",
                  isViewed ? "text-muted-foreground" : "text-foreground"
                )}>
                  {story.name}
                </span>
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}