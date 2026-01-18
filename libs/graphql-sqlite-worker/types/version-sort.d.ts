declare module 'version-sort' {
  interface VersionSortOptions {
    ignore_stages: boolean,
    nested: false | string
  }
  export default function sort<T>(versions: T[], options?: VersionSortOptions): T[]
}
