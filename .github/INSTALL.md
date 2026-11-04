# Backend 설치 및 실행

[README](../README.md) · [Stack](STACK.md) · [Structure](STRUCTURE.md)

## 준비

- Node.js **22.18 이상**, npm
- Docker Desktop 또는 Docker Engine·Compose
- 화면은 별도 [Frontend](https://github.com/Da-Moa/Frontend) 저장소에서 실행

## 로컬 실행

```sh
cd /Users/user/da-moa/Backend
npm ci
cp -n .env.example .env.local
```

기존 `.env.local`이 있으면 유지합니다. 새 설정이라면 다음 값을 먼저 채웁니다.

| 변수 | 설정 |
| --- | --- |
| `AUTH_JWT_SECRET` | 32바이트 이상 임의 값. `openssl rand -base64 48`로 생성 가능 |
| `KAKAO_REST_API_KEY` | 카카오 REST API 키 |
| `KAKAO_CLIENT_SECRET` | 카카오 앱에서 Client Secret을 사용한다면 해당 값 |
| `KAKAO_REDIRECT_URI` | 프론트 공개 주소의 `/auth/v1/kakao` |
| `DATABASE_URL` | 기본 로컬 DB 주소는 `.env.example` 참고 |
| `MINIO_ENDPOINT`, `MINIO_BUCKET`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` | 영수증 저장소. 로컬 Compose용 값은 `.env.example` 참고 |
| `PORT`, `HOST` | 기본값 `3001`, `127.0.0.1` |

Docker를 켠 뒤 다음 순서로 실행합니다.

```sh
npm run db:local:up
npm run db:migrate
npm run dev
```

API는 **http://127.0.0.1:3001**, 화면은 **http://localhost:3000**입니다.
`db:local:up`은 PostgreSQL·MinIO와 로컬 영수증 버킷을 준비합니다.

## DB 이름 확인

기본 Compose는 `da_moa_dev` DB를 생성합니다.
기존 `.env.local`에서 DB 이름을 `da_moa_dev_test` 등으로 바꿨다면 해당 DB를 별도로 만들어야 합니다.
예를 들어 로컬 테스트 계정을 사용하는 개발 DB를 준비하려면 `.env.local`의 DB 이름을
`da_moa_dev_test`로 설정하고, 없는 경우에만 다음 명령으로 생성합니다.

```sh
docker compose exec -T postgres createdb -U da_moa -O da_moa da_moa_dev_test
npm run db:migrate
npm run db:seed:test-accounts
```

테스트 계정 시드는 로컬 DB 이름에 `test`가 포함되어야 합니다.
기존 DB·볼륨을 삭제해서 이름 불일치를 해결하지 않습니다.

## 카카오 로그인

카카오 콘솔과 `.env.local`에 **프론트 주소**의 콜백을 동일하게 등록합니다.

```env
KAKAO_REDIRECT_URI=http://localhost:3000/auth/v1/kakao
```

여러 접속 주소는 쉼표로 구분합니다. LAN 접속 시 실제 프론트 IP 주소의 콜백도 등록합니다.
브라우저의 3000번 프론트가 콜백을 3001번 백엔드로 중계합니다.
설정 변경 후 백엔드를 재시작합니다. 요청 주소와 콜백 주소가 맞지 않으면 `error=configuration`이 발생합니다.
`.env.local`, `.env.production` 등 비밀 설정 파일은 Git에서 제외됩니다.
프로세스에 주입한 환경변수가 파일보다 우선합니다.

## 프로덕션 실행

```sh
npm run build
npm start
```

이미지를 만들려면 `docker build -t da-moa-backend:local .`을 실행합니다.
`compose.apps.yaml`은 독립 Frontend 이미지와 함께 앱을 실행하는 선택적 구성입니다.
`FRONTEND_IMAGE`, `BACKEND_IMAGE`와 인증·스토리지·DB 설정을 준비한 뒤 사용합니다.

## 검사

```sh
npm test
npm run typecheck
npm run build
npm run test:all
```

`test:all`은 실행 전용 PostgreSQL을 준비해 단위·도메인·통합·시나리오 검사를 수행하고,
종료 후 해당 실행에서 생성한 리소스만 정리합니다.
명시적인 `TEST_DATABASE_URL`을 쓰는 경우 localhost이며 DB 이름에 `test`가 포함되어야 합니다.

```sh
npm run test:domain
npm run test:integration
npm run test:scenario
npm run test:transport
```

전송 테스트에는 격리된 테스트 MinIO와 버킷·접속 설정도 필요합니다.
실제 SDK 취소·워커 종료·작업 복구 테스트가 포함되어 1분 이상 걸릴 수 있습니다.
브라우저 회귀는 [Frontend Install](https://github.com/Da-Moa/Frontend/blob/main/.github/INSTALL.md)을 참고하세요.

## 계약 타입 내보내기

```sh
npm run contracts:export -- /Users/user/da-moa/Frontend/src/shared/domain
```

DTO에서 Nest·Swagger 의존성이 없는 타입을 추출합니다.
각 저장소는 독립 사본을 사용하므로 계약 변경 시 프론트 타입 검사와 API 검증을 함께 수행합니다.
