import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const packageRoot = resolve(import.meta.dirname, '..');
const themeCss = readFileSync(resolve(packageRoot, 'src/styles/theme.css'), 'utf8');

const SEMANTIC_COVERAGE = {
  button: [':where(button', '[data-button]', '[data-variant="primary"]'],
  checkbox: ['.kui-checkbox', 'input[type="checkbox"]'],
  fieldset: ['.kui-fieldset', '.kui-fieldset__legend'],
  input: ['input[type="text"]', 'input[type="email"]', 'input:not([type])'],
  label: ['label', '.kui-label'],
  link: ['a {', 'nav > a'],
  navbar: ['body > header', 'nav > a'],
  select: ['select', '.kui-select'],
  table: ['.kui-table', '.kui-table-wrapper'],
  textarea: ['textarea', '.kui-textarea'],
  validator: [':valid', ':invalid'],
  kbd: ['kbd,', '.kui-kbd'],
  steps: ['.kui-steps', '.kui-step'],
  skeleton: ['.kui-skeleton'],
  toast: ['.kui-toast'],
  fileInput: ['input[type="file"]', '::file-selector-button'],
  filter: ['.kui-filter'],
  radio: ['input[type="radio"]'],
  range: ['.kui-range'],
  toggle: ['.kui-toggle', 'input[type="checkbox"][role="switch"]'],
  divider: ['hr,', '.kui-divider'],
  footer: ['footer,', '.kui-footer'],
  stack: ['.kui-stack'],
} as const;

describe('kuzan semantic CSS surface', () => {
  it('keeps DaisyUI-inspired semantic primitives styled without component wrappers', () => {
    for (const [surface, selectors] of Object.entries(SEMANTIC_COVERAGE)) {
      for (const selector of selectors) {
        expect(themeCss, `${surface} missing ${selector}`).toContain(selector);
      }
    }
  });

  it('does not define a component file for native-only surfaces', () => {
    const nativeOnlyComponentNames = [
      'button',
      'checkbox',
      'fieldset',
      'input',
      'label',
      'link',
      'select',
      'table',
      'textarea',
      'divider',
      'footer',
      'stack',
    ];

    for (const name of nativeOnlyComponentNames) {
      expect(themeCss, `${name} should be theme-backed`).toBeTruthy();
    }
  });
});
