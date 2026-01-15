import { create, windowedFiniteBatchScheduler, keyResolver } from "@yornaath/batshit";
import { SetData } from "@fitness-recoder/structure";
import { Set } from '../fragment';
import { gql, GraphQLClient } from "graphql-request";
import { useState } from "react";

export interface SetBatcherOptions {
  windowMs?: number;
  maxBatchSize?: number;
}

const query = gql`
  query getSetByIds($ids: [Int!]) {
    getSetByIds(ids: $ids) {
      ...Set
    }
  }
  ${Set}
`

export const useSetQueryBatcher = (
  graphqlClient: GraphQLClient,
  options: SetBatcherOptions = {}
) => {
  const { windowMs = 50, maxBatchSize = 20 } = options;
  const [setBatcher] = useState(() => create({
    name: 'set',
    fetcher: async (ids: number[]) => {
      const response = await graphqlClient.request<{ getSetByIds: SetData[] }>(query, { ids })
      return response.getSetByIds
    },
    resolver: keyResolver<SetData[], number>('id', { indexed: true}),
    scheduler: windowedFiniteBatchScheduler({
      windowMs,
      maxBatchSize,
    }),
  }))
  return setBatcher
}
