import { defineConfig } from 'prisma/config';
import { loadEnv } from './scripts/loadEnv.mjs';
loadEnv();
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: { url: process.env.DATABASE_URL || process.env.POSTGRES_URL },
});
