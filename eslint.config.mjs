import * as ava from 'eslint-config-canonical/ava';
import auto from 'eslint-config-canonical/auto';
import * as node from 'eslint-config-canonical/node';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(
  globalIgnores(['dist', 'package-lock.json']),
  auto,
  node.recommended,
  // `canonical/ava` only targets `*.test.ts`, whereas this project keeps its
  // AVA tests under `test/`, so the ruleset is re-pointed at that directory.
  [ava.recommended].flat().map((config) => ({
    ...config,
    files: ['test/**/*.ts'],
  })),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 0,
      'id-length': 0,
      'unicorn/prevent-abbreviations': 0,
    },
  },
);
