import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
export function loadEnv(directory = process.cwd()) {
  const mode = process.env.NODE_ENV || 'development';
  for (const name of [`.env.${mode}.local`, ...(mode === 'test' ? [] : ['.env.local']), `.env.${mode}`, '.env']) {
    let values;
    try { values = parseEnv(readFileSync(`${directory}/${name}`, 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    for (const [key, value] of Object.entries(values)) if (process.env[key] === undefined) process.env[key] = value;
  }
}
