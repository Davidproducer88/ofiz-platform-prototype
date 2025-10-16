import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Video, Wrench, PaintBucket, Zap, Droplets, Hammer } from 'lucide-react';

interface Story {
  id: string;
  name: string;
  avatar: string;
  category: string;
  isLive?: boolean;
  viewed?: boolean;
}

const stories: Story[] = [
  {
    id: '1',
    name: 'Carlos',
    avatar: '/avatars/master-electrician-1.jpg',
    category: 'Electricidad',
    isLive: true,
    viewed: false
  },
  {
    id: '2',
    name: 'María',
    avatar: '/avatars/master-carpenter-1.jpg',
    category: 'Carpintería',
    viewed: false
  },
  {
    id: '3',
    name: 'Juan',
    avatar: '/avatars/master-painter-1.jpg',
    category: 'Pintura',
    viewed: true
  },
  {
    id: '4',
    name: 'Eléctrico',
    avatar: '/avatars/master-electrician-1.jpg',
    category: 'Electricidad',
    viewed: true
  },
  {
    id: '5',
    name: 'Pintor',
    avatar: '/avatars/master-painter-1.jpg',
    category: 'Pintura',
    viewed: false
  },
  {
    id: '6',
    name: 'Plomería',
    avatar: '/avatars/master-plumber-1.jpg',
    category: 'Plomería',
    viewed: true
  },
  {
    id: '7',
    name: 'Albañil',
    avatar: '/avatars/master-carpenter-1.jpg',
    category: 'Construcción',
    viewed: false
  }
];

const getCategoryIcon = (category: string) => {
  const icons: Record<string, any> = {
    'Electricidad': Zap,
    'Carpintería': Hammer,
    'Pintura': PaintBucket,
    'Plomería': Droplets,
    'Construcción': Wrench
  };
  const Icon = icons[category] || Wrench;
  return <Icon className="h-3 w-3" />;
};

export const StoriesCarousel = () => {
  const [viewedStories, setViewedStories] = useState<Set<string>>(
    new Set(stories.filter(s => s.viewed).map(s => s.id))
  );

  const handleStoryClick = (storyId: string) => {
    setViewedStories(prev => new Set([...prev, storyId]));
  };

  return (
    <div className="w-full bg-card border-b border-border py-4">
      <ScrollArea className="w-full">
        <div className="flex gap-4 px-4">
          {stories.map((story) => {
            const isViewed = viewedStories.has(story.id);
            return (
              <button
                key={story.id}
                onClick={() => handleStoryClick(story.id)}
                className="flex flex-col items-center gap-2 min-w-[64px] group"
                aria-label={`Ver historia de ${story.name}`}
              >
                <div className="relative">
                  {/* Story ring */}
                  <div className={`rounded-full p-[2px] ${
                    story.isLive 
                      ? 'bg-gradient-to-tr from-red-500 to-pink-500 animate-pulse' 
                      : isViewed
                        ? 'bg-border'
                        : 'bg-gradient-to-tr from-primary via-accent to-primary'
                  }`}>
                    <div className="bg-card rounded-full p-[2px]">
                      <Avatar className="h-14 w-14 transition-transform group-hover:scale-105">
                        <AvatarImage src={story.avatar} alt={story.name} />
                        <AvatarFallback>{story.name[0]}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  
                  {/* Live badge */}
                  {story.isLive && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-5 px-1.5 text-[10px] font-bold animate-pulse"
                    >
                      <Video className="h-2.5 w-2.5 mr-0.5" />
                      LIVE
                    </Badge>
                  )}
                  
                  {/* Category badge */}
                  {!story.isLive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full p-1">
                      {getCategoryIcon(story.category)}
                    </div>
                  )}
                </div>
                
                <span className="text-xs font-medium text-foreground truncate w-full text-center">
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
};
