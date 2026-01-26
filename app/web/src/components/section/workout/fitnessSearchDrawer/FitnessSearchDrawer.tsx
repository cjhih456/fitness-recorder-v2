import type { Fitness } from "@fitness-recoder/structure";
import { hooks } from "@fitness-recoder/graphql-sqlite-worker";
import { Button, Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, Input, Spinner } from "@fitness-recoder/ui";
import { useVirtualizer } from "@tanstack/react-virtual";
import { X, Search } from "lucide-react";
import { useCallback, useRef, useState, useEffect } from "react";
import FitnessItem from "./FitnessItem";

interface FitnessSearchDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (fitness: Fitness) => void;
}
export default function FitnessSearchDrawer({
  open,
  onOpenChange,
  onSelect,
}: FitnessSearchDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  // TODO: Graphql 조회 후 데이터 바인딩
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = hooks.useFitnessListByKeywordsQuery({
    name: searchQuery,
  });
  

  useEffect(() => {
    if(!open) return;
    setSearchQuery('')
    refetch()
  }, [open, refetch])

  const fitnessList = open ? data?.pages.flat() ?? [] : []
  const { getVirtualItems, getTotalSize } = useVirtualizer({
    count: fitnessList.length ?? 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 68,
    gap: 8,
    useScrollendEvent: true
  });
  useEffect(() => {
    const virtualItems = getVirtualItems()
    if (!virtualItems.length) return
    const lastVirtualItem = virtualItems[virtualItems.length - 1]
    if (lastVirtualItem.index === fitnessList.length - 1 && hasNextPage) {
      fetchNextPage()
    }
  }, [
    getVirtualItems,
    hasNextPage,
    fetchNextPage
  ])
  const handleOnSelect = useCallback((fitness: Fitness) => {
    onSelect?.(fitness);
    onOpenChange?.(false);
  }, [onSelect, onOpenChange])
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex justify-between items-center">
            <DrawerTitle>운동 선택</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon-sm" className="p-2">
                <X size={20} />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <Input
              type="text"
              placeholder="운동 이름을 검색하세요..."
              className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div ref={scrollRef} className="overflow-y-auto space-y-2 max-h-[60vh] pr-1">
            <div className="relative" style={{ height: `${getTotalSize() + 56}px` }}>
              {getVirtualItems().map((virtualItem) => (
                <FitnessItem
                  key={virtualItem.key}
                  fitness={fitnessList[virtualItem.index]}
                  onClick={handleOnSelect}
                  className="absolute top-0 left-0 w-full"
                  style={{ height: `${virtualItem.size}px`, transform: `translateY(${virtualItem.start}px)` }}
                />
              ))}
              {isLoading ? (
                <Spinner className="absolute bottom-0 left-1/2 -translate-x-1/2" />
              ) : null}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}