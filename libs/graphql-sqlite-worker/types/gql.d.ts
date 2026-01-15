declare module '*.gql' {
  const Query: import('graphql').DocumentNode;
  export default Query;

  export const _queries: Record<string, import('graphql').DocumentNode>;
  export const _fragments: Record<
    string,
    import('graphql').FragmentDefinitionNode
  >;
}

declare type DBBus = {
  sendTransaction: (<T = unknown>(type: 'select', sql: string, params: unknown[]) => Promise<T[]>) & 
  (<T = unknown>(type: 'selects', sql: string, params: unknown[]) => Promise<T[]>) &
  (<T = unknown>(type: 'insert' | 'update' | 'delete', sql: string, params: unknown[]) => Promise<T[]>)
}

declare type GraphqlContext = {
  dbBus: DBBus
}

declare type ResponseResolver<Args, Return> = import('@graphql-tools/utils').IFieldResolver<unknown, GraphqlContext, Args, Return | Promise<Return>>

declare type ResponseBuilder<Args, Return> = (
  context: GraphqlContext,
  args: Args
) => Promise<Return>
