module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import', 'jest', 'promise'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/typescript',
    'plugin:jest/recommended',
    'plugin:jest-dom/recommended',
    'plugin:promise/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'app.*.ts', 'main.ts', 'src/migration/*'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': ['error'],
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'block-scoped-var': 'error',
    curly: 'error',

    // es2015
    'no-duplicate-imports': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-rename': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-destructuring': ['warn', { object: true, array: false }],
    'prefer-numeric-literals': 'warn',

    // override @typescript-eslint/eslint-recommended
    'no-unused-vars': 'off',
    'no-array-constructor': 'off',
    'no-extra-semi': 'off',
    'prefer-rest-params': 'warn',
    'prefer-spread': 'warn',

    // @typescript-eslint
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': ['error'],

    // import
    // 'import/extensions': ['error', 'never', { json: 'always', md: 'always' }],
    'import/first': 'error',
    // 'import/newline-after-import': 'error',
    'import/no-absolute-path': 'error',
    // 'import/no-amd': 'error',
    'import/no-deprecated': 'error',
    'import/no-duplicates': 'error',
    'import/no-dynamic-require': 'error',
    'import/no-extraneous-dependencies': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-named-as-default': 'error',
    'import/no-named-as-default-member': 'error',
    'import/no-named-default': 'error',
    'import/no-webpack-loader-syntax': 'error',
    'import/no-useless-path-segments': ['error', { noUselessIndex: true }],

    // promise
    'promise/catch-or-return': ['warn', { allowThen: true }],
    'promise/no-return-wrap': ['error', { allowReject: true }],
    'promise/always-return': 'off',
    'promise/avoid-new': 'off',


    // not in recomended
  },
  settings: {
    'import/ignore': ['node_modules'],
  },
};
