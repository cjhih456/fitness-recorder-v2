import type { InfiniteData } from '@tanstack/react-query';
import { useEffect } from 'react';

export const DEFAULT_LIST_PAGE_SIZE = 20;

export const getNextOffsetPageParam =
  (pageSize: number) =>
  <T>(lastPage: T[], _allPages: T[][], lastPageParam: number) =>
    lastPage.length < pageSize ? undefined : lastPageParam + pageSize;

export const flattenInfinitePages = <T>(data: InfiniteData<T[], number>): T[] =>
  data.pages.flat();

export const useFetchRemainingPages = ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
}) => {
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
};
