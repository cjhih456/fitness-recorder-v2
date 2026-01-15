import { QueryKey, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import type { ErrorType } from "./ErrorType";

export type CustomQueryOptions<TQueryKey extends QueryKey, TResult, TSelected = TResult> = Omit<
  UseQueryOptions<TResult, ErrorType, TSelected, TQueryKey>,
  'queryKey' | 'queryFn'
> & {
  queryKey: TQueryKey;
};

export type CustomMutationOptions<TVariables, TResult> = UseMutationOptions<TResult, ErrorType, TVariables>;
