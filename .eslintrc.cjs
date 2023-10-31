const warn = 'warn';
const ON = 1;
const OFF = 0;

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['standard-with-typescript', 'prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': OFF,
    '@typescript-eslint/prefer-readonly': OFF,
    '@typescript-eslint/no-confusing-void-expression': OFF,
    '@typescript-eslint/no-unused-vars': warn,
    '@typescript-eslint/no-unused-expressions': OFF,
    '@typescript-eslint/strict-boolean-expressions': OFF,
    '@typescript-eslint/no-dynamic-delete': OFF,
    yoda: OFF,
    '@typescript-eslint/no-unnecessary-type-constraint': OFF,
    '@typescript-eslint/method-signature-style': OFF,
    '@typescript-eslint/array-type': OFF,
    'no-useless-return': OFF,
  },
};
