import { useRef, useEffect } from 'react';
import { useTrackEvent } from '@/hooks/useHomepageCMS';
import { useAuth } from '@/contexts/AuthContext';

interface HomepageTelemetryProps {
  itemId: string;
  itemType: string;
  children: React.ReactNode;
  onItemClick?: () => void;
}

export function HomepageTelemetry({ 
  itemId, 
  itemType, 
  children, 
  onItemClick 
}: HomepageTelemetryProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const trackEvent = useTrackEvent();
  const impressionTracked = useRef(false);

  // Track impression when element enters viewport
  useEffect(() => {
    const element = elementRef.current;
    if (!element || impressionTracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !impressionTracked.current) {
            impressionTracked.current = true;
            trackEvent.mutate({
              user_id: user?.id,
              type: 'impression',
              entity: 'homepage_item',
              entity_id: itemId,
              meta: {
                item_type: itemType,
                timestamp: Date.now(),
                viewport_height: window.innerHeight,
                viewport_width: window.innerWidth
              }
            });
          }
        });
      },
      {
        threshold: 0.5, // Track when 50% of the element is visible
        rootMargin: '10px'
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [itemId, itemType, user?.id, trackEvent]);

  const handleClick = () => {
    // Track click event
    trackEvent.mutate({
      user_id: user?.id,
      type: 'click',
      entity: 'homepage_item',
      entity_id: itemId,
      meta: {
        item_type: itemType,
        timestamp: Date.now(),
        clicked_at: new Date().toISOString()
      }
    });

    // Execute the actual click handler
    onItemClick?.();
  };

  return (
    <div ref={elementRef} onClick={handleClick}>
      {children}
    </div>
  );
}