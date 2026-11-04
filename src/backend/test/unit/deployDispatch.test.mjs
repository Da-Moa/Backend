import assert from 'node:assert/strict';
import test from 'node:test';
import { deploymentPayload, dispatchDeployment } from '../../../../scripts/dispatch-deploy.mjs';
const component = 'backend';
const env = { GITHUB_REF: 'refs/heads/main', GITHUB_EVENT_NAME: 'push',
  GITHUB_REPOSITORY: 'Da-Moa/Backend', GITHUB_SHA: 'a'.repeat(40),
  DEPLOY_IMAGE: `ghcr.io/da-moa/${component}@sha256:${'b'.repeat(64)}`, DEPLOY_DISPATCH_TOKEN: 'test-only-token' };

test('main 검증 이미지의 digest와 컴포넌트만 배포 저장소로 전달한다', async () => {
  let seen;
  await dispatchDeployment(component, env, async (url, options) => {
    seen = { url, options }; return { status: 204 };
  });
  assert.equal(seen.url, 'https://api.github.com/repos/Da-Moa/Deploy/dispatches');
  assert.deepEqual(JSON.parse(seen.options.body), deploymentPayload(component, env));
  assert.equal(seen.options.redirect, 'error');
  assert.equal(seen.options.headers.Authorization, 'Bearer test-only-token');
});

test('작업 브랜치·PR·다른 저장소·변조된 digest는 HTTP 요청 전에 차단한다', async () => {
  for (const change of [
    { GITHUB_REF: 'refs/heads/feat/#1-independent-container-deployment' },
    { GITHUB_EVENT_NAME: 'pull_request' }, { GITHUB_REPOSITORY: 'untrusted/project' },
    { GITHUB_SHA: 'not-a-sha' }, { DEPLOY_IMAGE: `ghcr.io/da-moa/${component}:latest` },
    { DEPLOY_IMAGE: `ghcr.io/da-moa/wrong@sha256:${'b'.repeat(64)}` },
    { DEPLOY_IMAGE: `ghcrXio/da-moa/${component}@sha256:${'b'.repeat(64)}` },
    { DEPLOY_DISPATCH_TOKEN: '' },
  ]) {
    let called = false;
    await assert.rejects(dispatchDeployment(component, { ...env, ...change }, async () => { called = true; }));
    assert.equal(called, false);
  }
});

test('배포 요청 실패에서 토큰과 응답 본문을 로그에 노출하지 않는다', async () => {
  await assert.rejects(dispatchDeployment(component, env, async () => ({ status: 403 })), /HTTP 403/);
});
