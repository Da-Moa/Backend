# Repository split validation

Date: 2026-11-03 (Asia/Seoul)
Source: Da-Moa/Da-Moa main `e0dd8e7188447232fbabb9c874f972fb363b5d02`
Filtered main history before implementation: 186 commits.
Authors and timestamps retained; commit SHAs change after filtering.
Local old/new SHA mapping: `.git/filter-repo/commit-map`.

Passed tests: unit 115, domain 37, integration 70, scenario 4, transport/worker 10.
`npm run typecheck` and `npm run build` passed independently in both repositories.
The browser suite used independent Frontend and Backend processes and a separate local test database.
PostgreSQL and MinIO were provisioned only for this validation; no production database was used.
Browser checks covered expired JWT refresh through HttpOnly cookies, expense conflict retry,
mutation invalidation, account updates and real WebSocket reconnection through the frontend proxy.
Backend transport checks covered SDK cancellation, shutdown deadlines and job recovery.
Frontend proxy tests covered target validation, preserved Host/Origin/authentication,
query/body forwarding, multiple Set-Cookie headers, redirects and upstream failure responses.

The original repository and runtime code remain in the parent workspace.
Existing issues, PRs, tags and operating deployment were not changed or migrated.
New CI workflows run tests/builds and do not dispatch deployments.

Both standalone Docker images built successfully using Node 22.
Container smoke passed: frontend rendering, proxied PostgreSQL health and unauthenticated API rejection.
