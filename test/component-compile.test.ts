import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { parseFile } from '../../koze/src/compiler/parser.js';
import { generateRenderFunction } from '../../koze/src/compiler/template.js';

import { DAISYUI_PARITY_COMPONENTS } from './fixtures/daisyui-parity/manifest.js';

const packageRoot = resolve(import.meta.dirname, '..');
const libRoot = resolve(packageRoot, 'src/lib');

function collectKuratchiFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return collectKuratchiFiles(path);
    return entry.isFile() && entry.name.endsWith('.koze') ? [path] : [];
  });
}

describe('kuzan component compiler coverage', () => {
  it('parses and syntax-checks every shipped .koze component render function', () => {
    const files = collectKuratchiFiles(libRoot);

    expect(files.length).toBeGreaterThanOrEqual(50);

    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      const parsed = parseFile(source, { filename: relative(packageRoot, file) });
      const renderSource = generateRenderFunction(parsed.template, parsed.dataVars);

      expect(() => new Function(`${renderSource}; return render;`), relative(packageRoot, file)).not.toThrow();
    }
  });

  it('backs every component-pass DaisyUI item with at least one component file', () => {
    const componentPassItems = DAISYUI_PARITY_COMPONENTS.filter((component) => component.status === 'component-pass');

    expect(componentPassItems.length).toBeGreaterThan(0);

    for (const component of componentPassItems) {
      expect(
        component.localEvidence?.some((evidence) => evidence.startsWith('src/lib/') && evidence.endsWith('.koze')),
        `${component.id} needs component evidence`,
      ).toBe(true);
    }
  });
});
