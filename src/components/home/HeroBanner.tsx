import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBanners } from '@/hooks/useData';
import { Skeleton } from '@/components/ui/skeleton';

const HeroBanner = () => {
  const { data: banners, isLoading, error } = useBanners('hero');
  const heroBanners = useMemo(() => banners?.filter((b) => b.position === 'hero') || [], [banners]);

  const scrollRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  // Advanced, ultra-smooth auto-scroll loop
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || heroBanners.length === 0) return;

    let animationId;
    let exactPosition = el.scrollLeft; 
    
    // Set to 1.5 to match the exact smooth, continuous pace of the video
    const scrollSpeed = 1.5; 

    const scroll = () => {
      if (!isDragging) {
        exactPosition += scrollSpeed;
        
        // Seamless infinite loop reset based on exact pixel width
        if (exactPosition >= el.scrollWidth / 2) {
          exactPosition -= el.scrollWidth / 2;
        }
        
        el.scrollLeft = exactPosition;
      } else {
        // Keeps the tracker in sync so it doesn't snap when you let go of the drag
        exactPosition = el.scrollLeft;
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [heroBanners.length, isDragging]);

  // --- Desktop Drag Logic ---
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragDistance(0);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
    setDragDistance(Math.abs(walk));
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleLinkClick = (e) => {
    // If they dragged more than 10px, treat it as a swipe, not a click
    if (dragDistance > 10) {
      e.preventDefault(); 
    }
  };

  if (isLoading) return (
    // Removed all top/bottom padding to make it flush
    <section className="w-full overflow-hidden flex px-2">
      <Skeleton className="w-[85vw] md:w-[50vw] h-[60vh] md:h-[80vh] flex-shrink-0 pr-2" />
      <Skeleton className="w-[85vw] md:w-[50vw] h-[60vh] md:h-[80vh] flex-shrink-0 pr-2" />
    </section>
  );

  if (error) return <div className="text-center py-20 text-red-500">Failed to load banners.</div>;
  if (!heroBanners.length) return null;

  // Duplicate the array to create the seamless infinite scroll track
  const infiniteBanners = [...heroBanners, ...heroBanners];

  return (
    // Completely removed the `py-4` margin here so it touches the header
    <section className="relative w-full overflow-hidden">
      <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>
      
      <div
        ref={scrollRef}
        className={`hide-scroll flex overflow-x-auto snap-y md:snap-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
      >
        {infiniteBanners.map((banner, index) => (
          <Link
            key={`${banner.id}-${index}`}
            to={banner.link || '#'} 
            onClick={handleLinkClick}
            // Increased height: h-[60vh] on mobile, h-[80vh] on desktop
            className="w-[85vw] md:w-[50vw] h-[50vh] md:h-[70vh] flex-shrink-0 relative overflow-hidden block snap-center pr-1 md:pr-2"
            draggable="false" 
          >
            <img 
              src={banner.image_url} 
              alt="Banner" 
              className="w-full h-full object-cover object-center pointer-events-none" 
              loading={index < 2 ? "eager" : "lazy"} 
              draggable="false"
            />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;