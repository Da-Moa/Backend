import { loadEnv } from '../../scripts/loadEnv.mjs';

loadEnv();
const { bootstrap } = await import('./global/runtime/bootstrap');
await bootstrap();
