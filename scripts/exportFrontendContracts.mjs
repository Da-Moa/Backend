import ts from 'typescript';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Export structural DTO types without Nest/Swagger/validator runtime dependencies.
const root = fileURLToPath(new URL('../', import.meta.url));
const destination = process.argv[2];
if (!destination) throw new Error('Pass the destination src/shared/domain directory');
for (const domain of ['group', 'settle', 'user']) {
  const output = ['// Generated from Backend DTOs by scripts/exportFrontendContracts.mjs.'];
  if (domain === 'settle') output.push("import type { Currency } from './money';");
  for (const area of ['req', 'res']) {
    const file = resolve(root, `src/backend/domain/${domain}/dto/${area}/${domain}.${area === 'req' ? 'request' : 'response'}.dto.ts`);
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    for (const node of source.statements) {
      if (ts.isClassDeclaration(node) && node.name && !node.name.text.endsWith('QueryDTO')) {
        const heritage = node.heritageClauses?.map(clause => clause.getText(source)).join(' ') || '';
        const fields = node.members.filter(ts.isPropertyDeclaration).map(member => {
          if (!member.type) throw new Error(`Missing DTO property type: ${file}`);
          return `  ${member.name.getText(source)}${member.questionToken ? '?' : ''}: ${member.type.getText(source)};`;
        });
        output.push(`export interface ${node.name.text}${heritage ? ` ${heritage}` : ''} {\n${fields.join('\n')}\n}`);
      } else if (ts.isTypeAliasDeclaration(node)) {
        output.push(node.name.text === 'RoundStatus'
          ? "export type RoundStatus = 'RECORDING' | 'CONFIRMED' | 'LOCKED' | 'COMPLETED';"
          : node.getText(source));
      }
    }
  }
  const directory = resolve(destination, domain);
  mkdirSync(directory, { recursive: true });
  writeFileSync(resolve(directory, 'contracts.ts'), output.join('\n\n') + '\n');
}
