# Backend 프로젝트 구조

[README](../README.md) · [Install](INSTALL.md) · [Stack](STACK.md)

```text
Backend/
├── nest-cli.json              # Nest CLI 설정
├── webpack.config.cjs         # ESM 백엔드 빌드
├── .env.example               # 인증·DB·스토리지·포트 예시
├── compose.yaml               # 로컬 PostgreSQL·MinIO
├── compose.apps.yaml          # 독립 프론트·백엔드 이미지 실행 예시
├── compose.mock-test.yaml     # 테스트 전용 PostgreSQL
├── compose.ci.yaml            # 격리 PostgreSQL·MinIO 검증
├── .github/                   # 설치·스택·구조·CI
├── docs/                      # 로고·분리 검증 기록
├── prisma/                    # DB 스키마·Prisma 생성 설정
├── scripts/                   # 환경 로더·마이그레이션·시드·테스트·계약 타입 추출
├── perf/                      # 성능 점검 도구와 로컬 결과
└── src/
    ├── backend/
    │   ├── main.ts            # 환경 설정 후 API 서버 시작
    │   ├── domain/            # group·health·settle·user 모듈
    │   ├── global/            # 인증·DB·요청 제한·실시간·스토리지·런타임
    │   ├── generated/         # Git에서 제외되는 Prisma 생성 코드
    │   └── test/              # 단위·도메인·통합·시나리오·실제 전송 검사
    └── shared/                # 순수 타입·계좌·금액·정산 규칙
```

## 책임

- Controller·DTO·Guard: HTTP 경로·입력·인증·Origin 검증
- Service: 모임·회차·지출·정산·계정 유스케이스
- Repository·DAO: Prisma와 기존 PostgreSQL SQL 계약
- Runtime: API 요청 제한·메트릭·HTTP 종료·DB 연결·워커 수명 관리
- WebSocket: 권한이 있는 사용자에게 커밋된 변경 알림 전달
- ReceiptWorker: PostgreSQL 영속 큐에서 영수증을 MinIO에 저장하고 상태·알림 갱신

## 저장소 경계

화면과 Next.js 서버는 [Frontend](https://github.com/Da-Moa/Frontend)에서 실행합니다.
Backend 기본 포트는 3001이고, 프론트가 브라우저의 API·카카오 콜백·WebSocket을 중계합니다.
공유 규칙은 각 저장소의 독립 사본으로 유지하고, 프론트 계약 타입은 `contracts:export`로 추출합니다.
현재 구조에는 Spring 구현이 포함되어 있지 않습니다.
기존 CDP 도구 `perf/browserCheck.mjs`는 DB fixture를 직접 만드는 이전 점검 코드이며,
현재 브라우저 회귀의 진입점은 Frontend의 Playwright 테스트입니다.

## 검증 기록

저장소 분리 당시의 검사 범위와 결과는 [분리 검증 기록](../docs/split-validation.md)을 참고하세요.
