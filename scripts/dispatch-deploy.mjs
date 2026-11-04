import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function deploymentPayload(component, env) {
  const repository = { frontend: 'Da-Moa/Frontend', backend: 'Da-Moa/Backend' }[component];
  if (!repository) throw new Error('Unknown deployment component');
  if (env.GITHUB_REF !== 'refs/heads/main' || !['push', 'workflow_dispatch'].includes(env.GITHUB_EVENT_NAME))
    throw new Error('Deployment is allowed only from main push or manual main runs');
  if (env.GITHUB_REPOSITORY !== repository) throw new Error('Deployment repository mismatch');
  if (!/^[a-f0-9]{40}$/.test(env.GITHUB_SHA || '')) throw new Error('Invalid deployment revision');
  if (!new RegExp(`^ghcr\\.io/da-moa/${component}@sha256:[a-f0-9]{64}$`).test(env.DEPLOY_IMAGE || ''))
    throw new Error('Deployment requires the component immutable image digest');
  return { event_type: 'component-image-published', client_payload: {
    component, app_sha: env.GITHUB_SHA, image: env.DEPLOY_IMAGE,
  } };
}

export async function dispatchDeployment(component, env = process.env, request = fetch) {
  const payload = deploymentPayload(component, env);
  if (!env.DEPLOY_DISPATCH_TOKEN) throw new Error('Register DEPLOY_DISPATCH_TOKEN for Da-Moa/Deploy Contents write access');
  const response = await request('https://api.github.com/repos/Da-Moa/Deploy/dispatches', {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15_000),
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${env.DEPLOY_DISPATCH_TOKEN}`,
      'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
    body: JSON.stringify(payload),
  });
  if (response.status !== 204) throw new Error(`Deployment dispatch failed (HTTP ${response.status})`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await dispatchDeployment(process.argv[2]);
  console.log(`Deployment requested for ${process.argv[2]}`);
}
