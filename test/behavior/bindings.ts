import { After, Before, BeforeStep, defineStep, type DataTable } from '@cucumber/cucumber';
import { expect } from 'vitest';

export type Observation = { value?: unknown; error?: unknown; succeeded: boolean };
export function observe(action: () => unknown): Observation {
  try {
    return { value: action(), succeeded: true };
  } catch (error) {
    return { error, succeeded: false };
  }
}
export function returned(observation: Observation): unknown {
  if (!observation.succeeded) throw observation.error;
  return observation.value;
}
export function failed(observation: Observation, errorType?: typeof Error): void {
  expect(observation.succeeded).toBe(false);
  expect(observation.error).toBeInstanceOf(errorType ?? Error);
}

type Row = Record<string, string>;
type Binding<R> = { text: string; run: (row: R, table: DataTable) => void | Promise<void> };
type Plan<R> = { steps: Binding<R>[]; after?: () => void };
const plans = new Map<string, () => Plan<Row>>();
export const Given = <R>(text: string, run: Binding<R>['run']): Binding<R> => ({ text, run });
export const When = Given;
export const Then = Given;
export function registerScenario<R>(id: string, create: () => Plan<R>): void {
  if (plans.has(id)) throw new Error(`Duplicate scenario binding: ${id}`);
  plans.set(id, create as () => Plan<Row>);
}
function pattern(text: string): RegExp {
  return new RegExp(
    '^' +
      text
        .split(/(<[^>]+>)/)
        .map((part) =>
          /^<[^>]+>$/.test(part) ? '(.*?)' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        )
        .join('') +
      '$',
  );
}
interface ScenarioWorld {
  plan: Plan<Row>;
  row: Row;
  index: number;
  stepText: string;
}

// Cucumber owns parsing and execution. Scope the bindings to their case tag because
// formulations reuse phrases such as "the result is false" for different actions.
export function installBindings(): void {
  Before(function (this: ScenarioWorld, { pickle }) {
    const id = pickle.tags.find((tag) => tag.name.startsWith('@case-'))?.name.slice(6);
    const create = id && plans.get(id);
    if (!create) throw new Error(`No bindings for ${id ?? pickle.name}`);
    this.plan = create();
    this.row = {};
    this.index = 0;
    const texts = pickle.steps.map((s) => s.text);
    if (texts.length !== this.plan.steps.length)
      throw new Error(
        `${id}: expected ${texts.length} step bindings, received ${this.plan.steps.length}`,
      );
    this.plan.steps.forEach((binding, index) => {
      const matches = pattern(binding.text).exec(texts[index]!);
      if (!matches) throw new Error(`${id}: unbound step ${texts[index]}`);
      const names = [...binding.text.matchAll(/<([^>]+)>/g)].map((m) => m[1]!);
      names.forEach((name, offset) => {
        const value = matches[offset + 1]!;
        if (name in this.row && this.row[name] !== value)
          throw new Error(`${id}: inconsistent Example variable ${name}`);
        this.row[name] = value;
      });
    });
  });
  BeforeStep(function (this: ScenarioWorld, { pickleStep }) {
    this.stepText = pickleStep.text;
  });
  const definitions = [...plans.values()].flatMap((create) => create().steps);
  const execute = async (world: ScenarioWorld, text: string, table?: DataTable) => {
    const binding = world.plan.steps[world.index++];
    if (!binding || !pattern(binding.text).test(text))
      throw new Error(`Unbound step: ${world.stepText}`);
    await binding.run(world.row, table!);
  };
  const tablePattern = [
    ...new Set(
      definitions
        .filter((s) => s.run.length === 2)
        .map((s) => pattern(s.text).source.slice(1, -1).replaceAll('(.*?)', '(?:.*?)')),
    ),
  ].join('|');
  for (const table of [false, true]) {
    const patterns = [
      ...new Set(definitions.filter((s) => (s.run.length === 2) === table).map((s) => s.text)),
    ];
    const expression = new RegExp(
      '^' +
        (table ? '' : '(?!(?:' + tablePattern + ')$)') +
        '(' +
        patterns
          .map((text) => pattern(text).source.slice(1, -1).replaceAll('(.*?)', '(?:.*?)'))
          .join('|') +
        ')$',
    );
    if (table)
      defineStep(
        expression,
        { timeout: 30000 },
        async function (this: ScenarioWorld, text: string, data: DataTable) {
          await execute(this, text, data);
        },
      );
    else
      defineStep(
        expression,
        { timeout: 30000 },
        async function (this: ScenarioWorld, text: string) {
          await execute(this, text);
        },
      );
  }
  After(function (this: ScenarioWorld) {
    this.plan?.after?.();
  });
}
