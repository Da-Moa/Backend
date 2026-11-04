# Backend 기술 스택

[README](../README.md) · [Install](INSTALL.md) · [Structure](STRUCTURE.md)

버전은 현재 저장소의 `package-lock.json`과 Compose 설정 기준입니다.

| 영역 | 기술 |
| --- | --- |
| 런타임 | Node.js 22.18 이상 · TypeScript 6.0.3 |
| 프레임워크 | Nest.js 11.2.7 · Express |
| DB | PostgreSQL 17 · Prisma 7.9.1 · pg |
| 동시성 | PostgreSQL 트랜잭션·행 잠금·advisory lock·멱등성 기록 |
| 인증 | Kakao OIDC · openid-client · jose · Access/Refresh JWT |
| API 문서 | @nestjs/swagger · OpenAPI · Swagger UI |
| 실시간 | ws 기반 WebSocket · 사용자별 변경 알림 |
| 영수증 저장 | MinIO · S3 호환 AWS SDK |
| 영수증 큐 | Node 기반 Graphile Worker 0.18.0 · PostgreSQL 영속 큐 |
| 모니터링 | HTTP·DB 지표 · 별도 메트릭 서버 · 상태 API |
| 테스트 | Node test runner · 모의 Nest 요청 · 격리 PostgreSQL·MinIO · 실제 전송 테스트 |
| CI | GitHub Actions · 단위·DB 테스트·타입 검사·ARM64 이미지 검증·GHCR 게시·컴포넌트 배포 요청 |

현재 구현은 Nest.js이며 Spring 구현은 추후 추가할 수 있습니다.
프론트는 [Frontend](https://github.com/Da-Moa/Frontend) 저장소에서 독립 실행합니다.
두 백엔드의 성능을 비교할 때는 API 계약·DB 스냅샷·리소스·워커 조건을 맞추고,
프론트 중계를 포함한 사용자 흐름과 백엔드 직접 요청을 나누어 측정합니다.

## 이미지·글꼴 출처

README의 로고는 다모아 프로젝트 로고이며 [로컬 사본](../docs/assets/da-moa-trans.png)을 사용합니다.
화면용 은행·국기 아이콘과 글꼴은 Frontend에서 관리합니다.
해당 자료의 위치와 라이선스는 [Frontend Stack](https://github.com/Da-Moa/Frontend/blob/main/.github/STACK.md#이미지글꼴-출처)을 참고하세요.

프로젝트 자체의 라이선스는 [AGPL-3.0-only](../LICENSE)이며,
외부 라이브러리에는 각 패키지의 기존 라이선스가 적용됩니다.
