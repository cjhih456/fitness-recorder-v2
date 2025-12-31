# fitness-recoder-v2

## 프로젝트 소개

fitness-recoder-v2는 Nx 모노레포 기반의 피트니스 기록 관리 애플리케이션입니다. 
현대적인 웹 기술 스택을 활용하여 확장 가능하고 유지보수가 용이한 구조로 설계되었습니다.

### 주요 특징

- **모노레포 구조**: Nx를 활용한 효율적인 코드 공유 및 관리
- **현대적인 기술 스택**: Vite, React, TypeScript를 기반으로 한 빠른 개발 환경
- **재사용 가능한 라이브러리**: 공통 기능을 라이브러리로 분리하여 재사용성 극대화
- **타입 안정성**: TypeScript를 통한 강력한 타입 체크
- **개발 도구**: ESLint, Prettier, Vitest, Storybook을 통한 품질 관리

## 시작하기

### 필수 요구사항

- **Node.js**: 20.x 이상
- **Yarn**: 4.9.2 이상 (프로젝트에서 사용 중인 버전)
- **Git**: 버전 관리

### 설치

```bash
# 의존성 설치
yarn install
```

### 개발 서버 실행

```bash
# 웹 애플리케이션 개발 서버 시작
yarn nx serve web

# 또는
yarn nx dev web
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## 사용 가능한 명령어

### 애플리케이션 명령어

```bash
# 개발 서버 실행
yarn nx serve web
yarn nx dev web

# 프로덕션 빌드
yarn nx build web

# 빌드 미리보기
yarn nx preview web

# 테스트 실행
yarn nx test web

# 테스트 (CI 모드)
yarn nx test-ci web

# 린트 검사
yarn nx lint web

# 타입 체크
yarn nx typecheck web

# Storybook 실행
yarn nx storybook web

# Storybook 빌드
yarn nx build-storybook web
```

### 라이브러리 명령어

```bash
# 라이브러리 빌드
yarn nx build <library-name>

# 예시
yarn nx build structure
yarn nx build sqlite-worker

# 라이브러리 린트
yarn nx lint <library-name>

# 라이브러리 타입 체크
yarn nx typecheck <library-name>
```

### 유용한 Nx 명령어

```bash
# 프로젝트 정보 확인
yarn nx show project web

# 모든 프로젝트 빌드
yarn nx run-many -t build --all

# 모든 프로젝트 테스트
yarn nx run-many -t test --all

# 모든 프로젝트 린트
yarn nx run-many -t lint --all

# 의존성 그래프 시각화
yarn nx graph
```

## 개발 가이드

### 새 라이브러리 생성

```bash
# TypeScript 라이브러리 생성
yarn nx g @nx/js:lib <library-name> \
  --directory=libs/<library-name> \
  --bundler=vite \
  --unitTestRunner=none \
  --linter=eslint \
  --publishable=false \
  --importPath=@fitness-recoder/<library-name>
```

### 새 React 컴포넌트 생성

```bash
# 컴포넌트 생성
yarn nx g @nx/react:component <component-name> --project=web --directory=src/app
```

### 코드 스타일

이 프로젝트는 다음 도구들을 사용하여 코드 스타일을 관리합니다:

- **ESLint**: 코드 품질 및 스타일 검사
- **Prettier**: 코드 포맷팅
- **TypeScript**: 타입 안정성

```bash
# 코드 포맷팅
yarn prettier --write .

# 린트 자동 수정
yarn nx lint web --fix
```

## 프로젝트 구조

```
fitness-recoder-v2/
├── app/
│   └── web/                    # 웹 애플리케이션 (Vite + React + TypeScript)
│       ├── src/
│       │   ├── app/
│       │   ├── assets/
│       │   ├── vite-plugins/
│       │   │   └── i18next-language-package/ # i18next 언어 패키지 로더 플러그인
│       │   ├── main.tsx
│       │   └── styles.css
│       ├── public/
│       ├── index.html
│       ├── vite.config.mts
│       └── project.json
├── libs/
│   ├── structure/                                     # 구조 관련 라이브러리
│   └── sqlite-worker/                                # SQLite 워커 라이브러리
├── nx.json
├── package.json
├── tsconfig.base.json
└── vitest.workspace.ts
```

## 기술 스택

### 앱
- **app/web**: Vite + React + TypeScript + ESLint + Vitest + Storybook

### 라이브러리
모든 라이브러리는 다음 기술 스택을 사용합니다:
- Vite
- TypeScript
- ESLint
- vite-plugin-dts (타입 정의 파일 생성)

## 라이브러리 상세 설명

### i18next-language-package

i18next를 위한 언어 패키지 로더 Vite 플러그인입니다. 다국어 지원을 위한 언어 파일을 동적으로 로드하는 기능을 제공합니다.
액셀 파일을 활용하여 언어 파일을 자동 생성합니다.

**사용 예시:**
```typescript

// vite.config.mts
export default defineConfig({
  plugins: [
    i18nextLanguagePackageLoader({
      // 플러그인 옵션
    })
  ]
});
```

### structure

프로젝트 전반에서 사용되는 공통 구조 및 타입 정의를 제공하는 라이브러리입니다.

**사용 예시:**
```typescript
import { SomeType, SomeFunction } from '@fitness-recoder/structure';
```

### sqlite-worker

SQLite 데이터베이스를 웹 워커에서 사용하기 위한 유틸리티 라이브러리입니다. 메인 스레드를 블로킹하지 않고 데이터베이스 작업을 수행할 수 있도록 지원합니다.

**사용 예시:**
```typescript
import { createSqliteWorker } from '@fitness-recoder/sqlite-worker';

const worker = createSqliteWorker({
  // 워커 설정
});
```

## 테스트

### 단위 테스트 실행

```bash
# 웹 애플리케이션 테스트
yarn nx test web

# 특정 라이브러리 테스트 (테스트가 설정된 경우)
yarn nx test <library-name>

# 테스트 커버리지 확인
yarn nx test web --coverage

# 테스트 UI 모드
yarn nx test web --ui
```

### 테스트 작성

테스트는 Vitest를 사용하며, `*.spec.ts` 또는 `*.spec.tsx` 파일에 작성합니다.

**예시:**
```typescript
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('should render correctly', () => {
    // 테스트 코드
  });
});
```

## 빌드 및 배포

### 프로덕션 빌드

```bash
# 웹 애플리케이션 빌드
yarn nx build web

# 빌드 결과물은 dist/app/web 디렉토리에 생성됩니다
```

### 빌드 최적화

프로덕션 빌드는 자동으로 최적화됩니다:
- 코드 압축 및 최소화
- Tree-shaking을 통한 불필요한 코드 제거
- 에셋 최적화

### 배포

빌드된 파일은 `dist/app/web` 디렉토리에 생성되며, 이를 정적 호스팅 서비스(Vercel, Netlify, AWS S3 등)에 배포할 수 있습니다.

## 참고 자료

### 공식 문서

- [Nx 공식 문서](https://nx.dev)
- [Vite 공식 문서](https://vite.dev)
- [React 공식 문서](https://react.dev)
- [TypeScript 공식 문서](https://www.typescriptlang.org)
- [Vitest 공식 문서](https://vitest.dev)
- [Storybook 공식 문서](https://storybook.js.org)

### 유용한 링크

- [Nx 플러그인](https://nx.dev/plugin-registry)
- [Nx 레시피](https://nx.dev/recipes)
- [React Best Practices](https://react.dev/learn)
