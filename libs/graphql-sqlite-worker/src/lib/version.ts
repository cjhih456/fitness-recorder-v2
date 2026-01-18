import sort from 'version-sort';

/**
 * 현재 버전이 타겟 버전보다 낮은지 확인합니다.
 * @param current 현재 버전 (없으면 '0.1.0'으로 가정)
 * @param target 타겟 버전
 * @returns 현재 버전이 타겟 버전보다 낮으면 true
 */
export function isNewVersion(current: string | undefined = '0.1.0', target: string): boolean {
  if (!current) {
    return true; // 버전이 없으면 새 버전으로 간주
  }
  const result = sort([current, target]);
  return result[0] === current;
}

/**
 * 버전 문자열을 비교합니다.
 * @param v1 버전 1
 * @param v2 버전 2
 * @returns v1이 v2보다 낮으면 -1, 같으면 0, 높으면 1
 */
export function compareVersions(v1: string, v2: string): number {
  const sorted = sort([v1, v2]);
  if (sorted[0] === v1 && sorted[1] === v2) {
    return -1;
  }
  if (sorted[0] === v2 && sorted[1] === v1) {
    return 1;
  }
  return 0;
}
