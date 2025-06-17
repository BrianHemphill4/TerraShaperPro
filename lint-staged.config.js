module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix --no-warn-ignored', 'prettier --write'],
  '*.{json,css,md}': ['prettier --write'],
  '**/*.ts?(x)': () => 'npm run check-types',
};
