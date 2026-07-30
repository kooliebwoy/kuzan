import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const packageRoot = resolve(import.meta.dirname, '..');
function readPackageJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(resolve(path, 'package.json'), 'utf8')) as Record<string, unknown>;
}

describe('kuzan package identity', () => {
  it('uses the Kuzan package name and keeps source export subpaths stable', () => {
    const packageJson = readPackageJson(packageRoot);

    expect(packageJson.name).toBe('@kuratchi/kuzan');
    expect(packageJson.exports).toMatchObject({
      './styles/theme.css': './src/styles/theme.css',
      './styles/*': './src/styles/*',
      './adapter': './adapter.ts',
      './*': './src/lib/*',
    });
    expect(packageJson.files).toContain('src/lib/**/*.koze');
  });
});
