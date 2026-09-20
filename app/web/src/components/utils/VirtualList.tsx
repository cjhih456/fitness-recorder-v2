import { useVirtualizer, useWindowVirtualizer, type VirtualItem } from '@tanstack/react-virtual';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export interface VirtualListProps<T> {
  items: T[];
  estimateSize: number;
  getItemKey: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
  scroll?: 'element' | 'window';
  className?: string;
  overscan?: number;
  gap?: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  renderLoader?: () => ReactNode;
}

const INITIAL_RECT = { width: 400, height: 800 };

function useLoadMoreOnEnd(options: {
  virtualItems: VirtualItem[];
  itemCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore?: () => void;
}) {
  const {
    virtualItems,
    itemCount,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
  } = options;

  useEffect(() => {
    const lastItem = virtualItems.at(-1);
    if (!lastItem || !onLoadMore) return;
    if (lastItem.index < itemCount - 1) return;
    if (!hasNextPage || isFetchingNextPage) return;
    onLoadMore();
  }, [
    hasNextPage,
    isFetchingNextPage,
    itemCount,
    onLoadMore,
    virtualItems,
  ]);
}

function VirtualRows<T>({
  items,
  getItemKey,
  renderItem,
  renderLoader,
  virtualItems,
  totalSize,
  scrollMargin,
  measureElement,
  gap,
}: {
  items: T[];
  getItemKey: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
  renderLoader?: () => ReactNode;
  virtualItems: VirtualItem[];
  totalSize: number;
  scrollMargin: number;
  measureElement: (node: Element | null) => void;
  gap: number;
}) {
  return (
    <div
      className="relative w-full"
      style={{ height: totalSize }}
    >
      {virtualItems.map((virtualItem) => {
        const isLoader = virtualItem.index >= items.length;
        const item = items[virtualItem.index];
        return (
          <div
            key={isLoader ? 'virtual-loader' : getItemKey(item, virtualItem.index)}
            data-index={virtualItem.index}
            ref={measureElement}
            className="absolute top-0 left-0 w-full"
            style={{
              transform: `translateY(${virtualItem.start - scrollMargin}px)`,
              paddingBottom: isLoader ? 0 : gap,
            }}
          >
            {isLoader ? renderLoader?.() : renderItem(item, virtualItem.index)}
          </div>
        );
      })}
    </div>
  );
}

function ElementVirtualList<T>({
  items,
  estimateSize,
  getItemKey,
  renderItem,
  className,
  overscan = 6,
  gap = 16,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  renderLoader,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const showLoader = hasNextPage || isFetchingNextPage;
  const count = items.length + (showLoader ? 1 : 0);

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize + gap,
    overscan,
    initialRect: INITIAL_RECT,
  });

  useLoadMoreOnEnd({
    virtualItems: virtualizer.getVirtualItems(),
    itemCount: items.length,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
  });

  return (
    <div ref={parentRef} className={className}>
      <VirtualRows
        items={items}
        getItemKey={getItemKey}
        renderItem={renderItem}
        renderLoader={renderLoader}
        virtualItems={virtualizer.getVirtualItems()}
        totalSize={virtualizer.getTotalSize()}
        scrollMargin={0}
        measureElement={virtualizer.measureElement}
        gap={gap}
      />
    </div>
  );
}

function WindowVirtualList<T>({
  items,
  estimateSize,
  getItemKey,
  renderItem,
  className,
  overscan = 6,
  gap = 16,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  renderLoader,
}: VirtualListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const showLoader = hasNextPage || isFetchingNextPage;
  const count = items.length + (showLoader ? 1 : 0);

  useLayoutEffect(() => {
    const node = listRef.current;
    if (!node) return;
    const update = () => {
      setScrollMargin(node.getBoundingClientRect().top + window.scrollY);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [items.length]);

  const virtualizer = useWindowVirtualizer({
    count,
    estimateSize: () => estimateSize + gap,
    overscan,
    scrollMargin,
    initialRect: INITIAL_RECT,
  });

  useLoadMoreOnEnd({
    virtualItems: virtualizer.getVirtualItems(),
    itemCount: items.length,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
  });

  return (
    <div ref={listRef} className={className}>
      <VirtualRows
        items={items}
        getItemKey={getItemKey}
        renderItem={renderItem}
        renderLoader={renderLoader}
        virtualItems={virtualizer.getVirtualItems()}
        totalSize={virtualizer.getTotalSize()}
        scrollMargin={virtualizer.options.scrollMargin}
        measureElement={virtualizer.measureElement}
        gap={gap}
      />
    </div>
  );
}

export default function VirtualList<T>(props: VirtualListProps<T>) {
  if (props.scroll === 'window') {
    return <WindowVirtualList {...props} />;
  }
  return <ElementVirtualList {...props} />;
}
