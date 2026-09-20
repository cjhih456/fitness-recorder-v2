# Page Override: Settings

> Overrides [MASTER.md](../MASTER.md). Entry: header Settings icon (all shell pages).
> Flows: [FLOWS.md](../FLOWS.md) §8

## Intent

App preferences for a local-first PWA. No account.

## Presentation

`max-sm`: bottom sheet (~50–60% height), drag handle, scrim.
`min-md`: optional centered dialog — same content tree.

## Structure

1. Title **설정** + close
2. Rows:
   - **테마** — segmented or switch: 라이트 / 다크 (default 라이트)
   - **언어** — ko / en
   - **앱 버전** — read-only meta (e.g. `1.3.0`)
3. No destructive account actions

## Rules

- Closing sheet returns to previous page without navigation
- Theme tokens: MASTER light/dark
- No onboarding, login, cloud sync

## Out of scope

- 프로필, 알림 권한, 데이터 export (후속)
