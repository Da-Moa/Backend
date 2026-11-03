# 다모아 Backend

독립 Nest.js API 서버. 현재 Spring 구현은 포함하지 않으며 나중에 같은 API 계약으로 추가할 수 있습니다.
Next.js·React 실행 의존성을 제거했습니다. Node Graphile Worker와 기존 PostgreSQL 계약은 유지합니다.

```sh
npm ci
cp .env.example .env.local
# .env.local의 AUTH_JWT_SECRET에 32바이트 이상 값을 설정
npm run db:local:up
npm run db:migrate
npm run dev
```

기본 백엔드 주소는 http://127.0.0.1:3001 입니다.
프론트는 별도 저장소에서 3000번으로 실행하고 `BACKEND_URL=http://127.0.0.1:3001`로 연결합니다.
`KAKAO_REDIRECT_URI`는 프론트의 공개 주소로 설정합니다(예: `http://localhost:3000/auth/v1/kakao`).
여러 공개 주소를 지원하려면 기존 방식대로 쉼표로 구분해 등록합니다.
`.env.local`과 `.env.production`은 Git에서 제외되며 프론트에 인증·DB·스토리지 비밀을 넣지 않습니다.
개발·운영 환경 파일은 Node 기본 파서로 읽고, 프로세스에 주입한 환경변수를 우선합니다.

```sh
npm test
npm run typecheck
npm run build
npm run test:all
# 아래 전송 계층 검증에는 테스트 MinIO도 필요
npm run test:transport
npm start
```

`test:all`은 실행마다 테스트 전용 PostgreSQL을 만들고 종료 후 해당 리소스만 정리합니다.
명시적인 `TEST_DATABASE_URL`은 localhost이며 DB 이름에 test가 포함되어야 합니다.
개발·운영 DB로 테스트하지 않습니다.
브라우저 회귀 테스트는 [Frontend](https://github.com/Da-Moa/Frontend)에서 실행합니다.

## 소속과 실행

- `src/backend`: Nest API·인증·WebSocket·메트릭·Node 영수증 워커와 테스트
- `prisma`, `scripts/migrations`: 기존 DB 스키마와 마이그레이션
- `src/shared`: 프론트와 계약을 맞추는 순수 타입·규칙 사본
- `perf`: 성능 측정 도구. 생성된 결과는 `perf/results`에 보관하고 커밋하지 않습니다.
- `compose.yaml`: 로컬 PostgreSQL·MinIO
- `compose.apps.yaml`: 독립 이미지 두 개로 앱을 실행하는 선택적 구성
- `.github/workflows/ci.yml`: 검증만 실행하며 운영 배포를 호출하지 않습니다.

`compose.apps.yaml`에서 `FRONTEND_IMAGE`, `BACKEND_IMAGE`를 지정하고
`BACKEND_URL`, `DATABASE_URL`, `MINIO_ENDPOINT`를 실행 환경에 맞게 주입합니다.
예시 Compose는 실제 운영 배포를 변경하지 않습니다.

## 성능 비교

Nest와 Spring의 지연·처리량을 비교할 때는 각 백엔드 포트로 직접 요청하고,
프론트 프록시를 포함한 사용자 흐름은 별도로 측정합니다.
동일 DB 스냅샷·리소스 제한·API 계약·워커 조건을 유지합니다.
공유 파일은 저장소마다 독립 사본이며 계약 변경 시 두 저장소를 함께 검증해야 합니다.
`npm run contracts:export -- <Frontend의-src/shared/domain-경로>`로 순수 DTO 타입을 다시 내보낼 수 있습니다.

기존 CDP 도구 `perf/browserCheck.mjs`는 DB fixture를 만드는 이전 점검 코드입니다.
원본을 보존하기 위한 것으로 이번 분리 검증에는 사용하지 않았습니다.
브라우저 회귀의 현재 진입점은 Frontend의 Playwright 테스트입니다.

이 저장소는 `Da-Moa/Da-Moa` main에서 관련 경로의 커밋·작성자·시각을 보존해 추출했습니다.
히스토리를 필터링했기 때문에 SHA는 변경됩니다. 기존 통합 저장소와 운영 배포는 보존합니다.
라이선스: AGPL-3.0-only.
