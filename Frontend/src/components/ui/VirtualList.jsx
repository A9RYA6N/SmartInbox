import React, { useState, useEffect, useRef, useMemo } from 'react';

/**
 * Lightweight VirtualList component for high-performance rendering.
 * @param {Array} items - Full list of data items.
 * @param {Function} renderItem - Render function for each item.
 * @param {number} itemHeight - Fixed height of each row.
 * @param {number} containerHeight - Height of the scroll viewport.
 */
export const VirtualList = ({ items = [], renderItem, itemHeight = 64, containerHeight = 500 }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const onScroll = (e) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const { visibleItems, startIndex, totalHeight } = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 5); // Buffer of 5
    const endIndex = Math.min(items.length, Math.floor((scrollTop + containerHeight) / itemHeight) + 5);
    
    return {
      visibleItems: items.slice(startIndex, endIndex),
      startIndex,
      totalHeight
    };
  }, [items, scrollTop, itemHeight, containerHeight]);

  return (
    <div 
      ref={containerRef}
      onScroll={onScroll}
      className="overflow-y-auto relative no-scrollbar"
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, width: '100%' }}>
        <div 
          className="absolute top-0 left-0 w-full"
          style={{ transform: `translateY(${startIndex * itemHeight}px)` }}
        >
          {visibleItems.map((item, index) => renderItem(item, startIndex + index))}
        </div>
      </div>
    </div>
  );
};
