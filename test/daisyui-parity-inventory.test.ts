import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DAISYUI_PARITY_COMPONENTS,
  DAISYUI_PARITY_SOURCE,
  DAISYUI_PARITY_TOTALS,
  getDaisyUiParityComponents,
  type DaisyUiParityItem,
  type DaisyUiParityStatus,
} from './fixtures/daisyui-parity/manifest.js';

const VALID_STATUSES = new Set<DaisyUiParityStatus>([
  'semantic-pass',
  'component-pass',
  'partially-covered',
  'intentional-divergence',
  'not-native',
  'gap',
]);

const SEMANTIC_ONLY_IDS = new Set([
  'button',
  'checkbox',
  'fieldset',
  'input',
  'label',
  'link',
  'navbar',
  'select',
  'table',
  'textarea',
  'validator',
]);

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function assertClassified(component: DaisyUiParityItem): void {
  expect(component.id).toBeTruthy();
  expect(component.daisyUiName).toBeTruthy();
  expect(component.upstreamPath).toMatch(/^components\//);
  expect(VALID_STATUSES.has(component.status)).toBe(true);
  expect(component.nativePrimitive.trim().length).toBeGreaterThan(2);
  expect(component.notes.trim().length).toBeGreaterThan(20);

  if (component.status === 'gap') {
    expect(component.nextAction, `${component.id} gap needs a next action`).toBeTruthy();
  }

  if (component.status === 'partially-covered') {
    expect(component.localEvidence?.length, `${component.id} partial coverage needs local evidence`).toBeGreaterThan(0);
    expect(component.nextAction, `${component.id} partial coverage needs a next action`).toBeTruthy();
  }

  if (component.status === 'semantic-pass') {
    expect(component.localEvidence?.length, `${component.id} semantic pass needs local evidence`).toBeGreaterThan(0);
  }
}

describe('DaisyUI-inspired UI coverage inventory', () => {
  it('records the DaisyUI source snapshot explicitly', () => {
    expect(DAISYUI_PARITY_SOURCE.repository).toBe('saadeghi/daisyui');
    expect(DAISYUI_PARITY_SOURCE.version).toBe('5.5.19');
    expect(DAISYUI_PARITY_SOURCE.capturedAt).toBe('2026-05-09');
    expect(DAISYUI_PARITY_SOURCE.focus).toContain('native HTML');
  });

  it('classifies every DaisyUI component without claiming clone compatibility', () => {
    expect(DAISYUI_PARITY_COMPONENTS).toHaveLength(DAISYUI_PARITY_TOTALS.components);
    expect(new Set(DAISYUI_PARITY_COMPONENTS.map((component) => component.id)).size).toBe(
      DAISYUI_PARITY_COMPONENTS.length,
    );

    for (const component of DAISYUI_PARITY_COMPONENTS) {
      assertClassified(component);
    }
  });

  it('keeps local evidence backed by real files', () => {
    for (const component of DAISYUI_PARITY_COMPONENTS) {
      for (const evidence of component.localEvidence ?? []) {
        expect(existsSync(resolve(packageRoot, evidence)), `${component.id} evidence missing: ${evidence}`).toBe(true);
      }
    }
  });

  it('keeps semantic HTML coverage distinct from wrapper components', () => {
    const semanticIds = new Set(getDaisyUiParityComponents('semantic-pass').map((component) => component.id));

    for (const id of SEMANTIC_ONLY_IDS) {
      expect(semanticIds.has(id), `${id} should stay semantic`).toBe(true);
    }

    expect(getDaisyUiParityComponents('component-pass').map((component) => component.id)).not.toContain('button');
  });

  it('keeps all feasible DaisyUI coverage out of backlog statuses', () => {
    expect(getDaisyUiParityComponents('gap')).toHaveLength(0);
    expect(getDaisyUiParityComponents('partially-covered')).toHaveLength(0);
    expect(getDaisyUiParityComponents('not-native').length).toBeGreaterThan(0);
    expect(getDaisyUiParityComponents('intentional-divergence').length).toBeGreaterThan(0);
  });

  it('treats skipped DaisyUI patterns as final scope decisions, not hidden backlog', () => {
    const skipped = [
      ...getDaisyUiParityComponents('not-native'),
      ...getDaisyUiParityComponents('intentional-divergence'),
    ];

    expect(skipped.length).toBeGreaterThan(0);

    for (const component of skipped) {
      expect(component.nextAction, `${component.id} should not have follow-up work`).toBeUndefined();
    }
  });
});
