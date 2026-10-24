import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-compiler';
import { expect } from 'vitest';

const path = fileURLToPath(new URL('../declarations.test-d.ts', import.meta.url));
const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
export interface DeclarationCase {
  id: string;
  row: Record<string, string>;
  start: number;
  end: number;
}
const cases: DeclarationCase[] = [];
function visit(node: ts.Node, id = ''): void {
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
    const title = node.arguments[0];
    if (title && ts.isStringLiteral(title)) {
      if (node.expression.text === 'describe') id = title.text.match(/^(TS-\d+):/)?.[1] ?? id;
      if (node.expression.text === 'it' && id) {
        const json = title.text.slice(title.text.indexOf('{'));
        cases.push({ id, row: JSON.parse(json), start: node.getFullStart(), end: node.end });
      }
    }
  }
  node.forEachChild((child) => visit(child, id));
}
visit(source);
let diagnostics: readonly ts.Diagnostic[] | undefined;
export function declarationCase(id: string, row: Record<string, string>): DeclarationCase {
  const selected = cases.filter(
    (c) => c.id === id && Object.entries(c.row).every(([key, value]) => row[key] === value),
  );
  expect(selected, `${id}: declaration example ${JSON.stringify(row)}`).toHaveLength(1);
  return selected[0]!;
}
export function checkDeclaration(example: DeclarationCase): readonly ts.Diagnostic[] {
  if (!diagnostics) {
    const configPath = fileURLToPath(new URL('../../tsconfig.test.json', import.meta.url));
    const config = ts.readConfigFile(configPath, (file) => ts.sys.readFile(file));
    if (config.error)
      throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
    const parsed = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      fileURLToPath(new URL('../../', import.meta.url)),
    );
    const program = ts.createProgram([path], parsed.options);
    diagnostics = ts.getPreEmitDiagnostics(program);
  }
  return diagnostics.filter((diagnostic) => {
    if (diagnostic.file?.fileName !== path || diagnostic.start === undefined) return true;
    const owner = cases.find(
      (candidate) => diagnostic.start! >= candidate.start && diagnostic.start! < candidate.end,
    );
    return owner === undefined || owner === example;
  });
}
export function permitted(diagnostics: readonly ts.Diagnostic[]): void {
  expect(diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))).toEqual([]);
}
