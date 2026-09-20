import type { ErrorType } from "./ErrorType";
import {
  QueryKey,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";

export type CustomQueryOptions<TQueryKey extends QueryKey, TResult, TSelected = TResult> = Omit<
  UseQueryOptions<TResult, ErrorType, TSelected, TQueryKey>,
  'queryKey' | 'queryFn'
> & {
  queryKey: TQueryKey;
};

export type CustomInfiniteQueryOptions<
  TQueryKey extends QueryKey,
  TPage,
  TSelected = TPage,
> = Omit<
  UseInfiniteQueryOptions<TPage, ErrorType, TSelected, TQueryKey, number>,
  'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'select'
>;

export type CustomMutationOptions<TVariables, TResult> = UseMutationOptions<TResult, ErrorType, TVariables>;
