import baselinePlugin from 'eslint-plugin-baseline-compatibility';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.js', '**/*.jsx'],
    plugins: {
      'baseline-compatibility': baselinePlugin.default
    },
    rules: {
      'baseline-compatibility/check-baseline': 'warn'
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'baseline-compatibility': baselinePlugin.default
    },
    rules: {
      'baseline-compatibility/check-baseline': 'warn'
    },
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2022,
      sourceType: 'module'
    }
  }
];
