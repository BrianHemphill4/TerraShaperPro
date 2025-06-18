import antfu from '@antfu/eslint-config';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default antfu({
  typescript: true,
  lessOpinionated: true,
  isInEditor: false,

  stylistic: {
    semi: true,
  },

  ignores: [
    'dist/**/*',
  ],
}, {
  plugins: {
    'simple-import-sort': simpleImportSort,
  },
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/order': 'off',
    'sort-imports': 'off',
    'style/brace-style': ['error', '1tbs'],
    'ts/consistent-type-definitions': ['error', 'type'],
    'node/prefer-global/process': 'off',
    'no-console': 'error',
  },
});
