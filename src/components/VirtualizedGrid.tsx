// VirtualizedGrid.tsx - Virtualized grid for rendering large lists efficiently

import React, { useRef, useCallback, useEffect } from 'react';
import {
  FixedSizeGrid as Grid,
  GridChildComponentProps,
  FixedSizeList as List,
} from 'react-window';

interface VirtualizedGridProps<T = unknown> {
  items: T[];
  columnCount: number;
  rowHeight: number;
  columnWidth: number | ((containerWidth: number) => number);
  renderItem: (item: T, style: React.CSSProperties) => React.ReactNode;
  overscanRowCount?: number;
  className?: string;
  onItemsRendered?: (visibleStartIndex: number, visibleEndIndex: number) => void;
}

// Auto-calculate column count based on container width
const getDefaultColumnCount = (containerWidth: number, columnWidth: number): number => {
  if (typeof columnWidth === 'number') {
    return Math.max(1, Math.floor(containerWidth / columnWidth));
  }
  return 2; // Default to 2 columns
};

export const VirtualizedGrid = <T = unknown,>({
  items,
  columnCount,
  rowHeight,
  columnWidth,
  renderItem,
  overscanRowCount = 2,
  className = '',
  onItemsRendered
}: VirtualizedGridProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(600);
  const [containerHeight, setContainerHeight] = React.useState(400);

  // Measure container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
        setContainerHeight(entry.contentRect.height || 400);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Calculate dimensions
  const rowCount = Math.ceil(items.length / columnCount);
  const calculatedColumnWidth = typeof columnWidth === 'function' 
    ? columnWidth(containerWidth) 
    : columnWidth;

  // Handle items rendered callback
  const handleItemsRendered = useCallback(({ visibleRowStartIndex, visibleRowStopIndex }: { visibleRowStartIndex: number; visibleRowStopIndex: number }) => {
    if (onItemsRendered) {
      const visibleStartIndex = visibleRowStartIndex * columnCount;
      const visibleEndIndex = visibleRowStopIndex * columnCount + columnCount;
      onItemsRendered(visibleStartIndex, Math.min(visibleEndIndex, items.length));
    }
  }, [onItemsRendered, columnCount, items.length]);

  // Cell renderer
  const Cell = useCallback(({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= items.length) return null;

    const item = items[index];
    return renderItem(item, style);
  }, [items, columnCount, renderItem]);

  return (
    <div 
      ref={containerRef} 
      className={`virtualized-grid-container ${className}`}
      style={{ width: '100%', height: '100%', minHeight: containerHeight }}
    >
      <Grid
        columnCount={columnCount}
        columnWidth={calculatedColumnWidth}
        height={Math.min(containerHeight, rowCount * rowHeight + 100)}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={containerWidth}
        overscanRowCount={overscanRowCount}
        onItemsRendered={handleItemsRendered}
      >
        {Cell}
      </Grid>
    </div>
  );
};

// Simple virtualized list for single-column layouts
interface VirtualizedListProps<T = unknown> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  overscanCount?: number;
  className?: string;
  onItemsRendered?: (visibleStartIndex: number, visibleEndIndex: number) => void;
}

export const VirtualizedList = <T = unknown,>({
  items,
  height,
  itemHeight,
  renderItem,
  overscanCount = 3,
  className = '',
  onItemsRendered
}: VirtualizedListProps<T>) => {
  const handleItemsRendered = useCallback(({ visibleStartIndex, visibleStopIndex }: { visibleStartIndex: number; visibleStopIndex: number }) => {
    if (onItemsRendered) {
      onItemsRendered(visibleStartIndex, visibleStopIndex);
    }
  }, [onItemsRendered]);

  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      width="100%"
      overscanCount={overscanCount}
      onItemsRendered={handleItemsRendered}
      className={className}
    >
      {({ index, style }) => renderItem(items[index], index, style)}
    </List>
  );
};