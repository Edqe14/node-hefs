module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
    jest: true
  },
  extends: ['@chookslint/eslint-config-typescript'],
  plugins: ['prettier'],
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    'prettier/prettier': [
      'error',
      { singleQuote: true, trailingComma: 'all' },
      { usePrettierrc: false }
    ],
    'arrow-parens': ['error', 'always'],
    'complexity': 'off',
    '@typescript-eslint/no-extra-parens': 'off',
    '@typescript-eslint/naming-convention': 'off'
  }
}