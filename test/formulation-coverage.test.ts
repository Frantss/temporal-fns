import { expect, it } from 'vite-plus/test';
import { readFileSync, readdirSync } from 'node:fs';
import { Parser, AstBuilder, GherkinClassicTokenMatcher, compile } from '@cucumber/gherkin';
import { IdGenerator } from '@cucumber/messages';

it('retains all 247 scenarios, 1621 expanded cases, and 560 API/type combinations', () => {
  const id = IdGenerator.incrementing();
  const parser = new Parser(new AstBuilder(id), new GherkinClassicTokenMatcher());
  const folder = new URL('./features/', import.meta.url);
  const files = readdirSync(folder).filter((f) => f.endsWith('.feature'));
  const documents = files.map((file) => ({
    file,
    doc: parser.parse(readFileSync(new URL(file, folder), 'utf8')),
  }));
  expect(files).toHaveLength(16);
  const scenarios = documents.flatMap(({ doc }) =>
    doc.feature!.children.flatMap((c) => (c.scenario ? [c.scenario] : [])),
  );
  const ids = scenarios.map((s) => s.tags.filter((t) => t.name.startsWith('@case-')));
  ids.forEach((tags) => expect(tags).toHaveLength(1));
  expect(scenarios).toHaveLength(247);
  expect(new Set(ids.map((tags) => tags[0]!.name)).size).toBe(247);
  const pickles = documents.flatMap(({ file, doc }) => compile(doc, file, id));
  expect(pickles).toHaveLength(1621);
  const matrix = pickles.filter((p) => p.tags.some((t) => t.name.startsWith('@case-TYPE-')));
  expect(matrix).toHaveLength(560);
  const inputs = matrix.map(
    (p) => p.steps.find((s) => s.text.startsWith('the representative '))!.text,
  );
  expect(new Set(inputs).size).toBe(560);
  expect(new Set(inputs.map((s) => s.split('for ')[1])).size).toBe(56);
});
