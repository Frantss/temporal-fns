import { Given, registerScenario, Then, When } from './bindings.js';
import {
  checkDeclaration,
  declarationCase,
  permitted,
  type DeclarationCase,
} from './declaration-compiler.js';
import type { ExampleRows } from './example-types.js';

registerScenario<ExampleRows['TS-001']>('TS-001', () => {
  let example!: DeclarationCase;
  let diagnostics!: ReturnType<typeof checkDeclaration>;
  return {
    steps: [
      Given('a TypeScript caller with <inputs>', (r) => {
        example = declarationCase('TS-001', r);
      }),
      When('the caller assigns the result of <function> to <type>', () => {
        diagnostics = checkDeclaration(example);
      }),
      Then('the assignment is permitted without a cast', () => {
        permitted(diagnostics);
      }),
    ],
  };
});

registerScenario<ExampleRows['TS-002']>('TS-002', () => {
  let example!: DeclarationCase;
  let diagnostics!: ReturnType<typeof checkDeclaration>;
  return {
    steps: [
      Given('a TypeScript caller with <inputs>', (r) => {
        example = declarationCase('TS-002', r);
      }),
      When('the caller calls <function> with omitted required timeZone', () => {
        diagnostics = checkDeclaration(example);
      }),
      Then('the call is rejected by its public declaration', () => {
        permitted(diagnostics);
      }),
    ],
  };
});

registerScenario<ExampleRows['TS-003']>('TS-003', () => {
  let example!: DeclarationCase;
  let diagnostics!: ReturnType<typeof checkDeclaration>;
  return {
    steps: [
      Given('a TypeScript caller using <inputs>', (r) => {
        example = declarationCase('TS-003', r);
      }),
      When('the caller calls <function>', () => {
        diagnostics = checkDeclaration(example);
      }),
      Then('the call is rejected by its public declaration', () => {
        permitted(diagnostics);
      }),
    ],
  };
});

registerScenario<ExampleRows['TS-004']>('TS-004', () => {
  let example!: DeclarationCase;
  let diagnostics!: ReturnType<typeof checkDeclaration>;
  return {
    steps: [
      Given('a TypeScript caller receives <tuple> from <function>', (r) => {
        example = declarationCase('TS-004', r);
      }),
      When('the caller narrows its error element to null', () => {
        diagnostics = checkDeclaration(example);
      }),
      Then('its result element has type <result> without null', () => {
        permitted(diagnostics);
      }),
      When('the caller instead narrows the error element to non-null', () => {
        diagnostics = checkDeclaration(example);
      }),
      Then('its error has type RangeError and its result has type null', () => {
        permitted(diagnostics);
      }),
    ],
  };
});

registerScenario<ExampleRows['TS-005']>('TS-005', () => {
  let example!: DeclarationCase;
  let diagnostics!: ReturnType<typeof checkDeclaration>;
  return {
    steps: [
      Given('a TypeScript caller using <inputs>', (r) => {
        example = declarationCase('TS-005', r);
      }),
      When('the caller calls <function>', () => {
        diagnostics = checkDeclaration(example);
      }),
      Then('the call is rejected by its public declaration', () => {
        permitted(diagnostics);
      }),
    ],
  };
});

registerScenario<ExampleRows['TS-006']>('TS-006', () => {
  let example!: DeclarationCase;
  let diagnostics!: ReturnType<typeof checkDeclaration>;
  return {
    steps: [
      Given('a TypeScript caller with text "2026-10-23" and pattern "yyyy-MM-dd"', (r) => {
        example = declarationCase('TS-006', r);
      }),
      When('the caller calls <function> without a reference argument', () => {
        diagnostics = checkDeclaration(example);
      }),
      Then('its public declaration rejects the call', () => {
        permitted(diagnostics);
      }),
    ],
  };
});

registerScenario<ExampleRows['TS-007']>('TS-007', () => {
  let example!: DeclarationCase;
  let diagnostics!: ReturnType<typeof checkDeclaration>;
  return {
    steps: [
      Given('a TypeScript caller receives the declared result tuple from <function>', (r) => {
        example = declarationCase('TS-007', r);
      }),
      When('the caller assigns a different value to either tuple element', () => {
        diagnostics = checkDeclaration(example);
      }),
      Then('its public tuple type rejects the assignment', () => {
        permitted(diagnostics);
      }),
      Then('this does not require freezing the returned array at runtime', () => {
        permitted(diagnostics);
      }),
    ],
  };
});

registerScenario<ExampleRows['TS-008']>('TS-008', () => {
  let example!: DeclarationCase;
  let diagnostics!: ReturnType<typeof checkDeclaration>;
  return {
    steps: [
      Given(
        'a TypeScript caller with a readonly PlainDate array and a PlainDate target where needed',
        (r) => {
          example = declarationCase('TS-008', r);
        },
      ),
      When('the caller calls <function> with that array', () => {
        diagnostics = checkDeclaration(example);
      }),
      Then('its public declaration permits the call without copying or casting the array', () => {
        permitted(diagnostics);
      }),
    ],
  };
});
