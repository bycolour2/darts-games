/* eslint-env node */

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    // 'plugin:@typescript-eslint/recommended',
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react-hooks/recommended',
    'plugin:effector/future',
    'plugin:effector/patronum',
    'plugin:effector/react',
    'plugin:effector/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  plugins: [
    'react-refresh',
    'effector',
    '@feature-sliced/eslint-plugin-messages',
    'prettier',
  ],
  processor: '@feature-sliced/messages/fs',
  overrides: [
    {
      files: ['*.ts', '*.tsx'], // Your TypeScript files extension

      // As mentioned in the comments, you should extend TypeScript plugins here,
      // instead of extending them outside the `overrides`.
      // If you don't want to extend any rules, you don't need an `extends` attribute.
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        '@feature-sliced/eslint-config/rules/import-order/experimental',
        '@feature-sliced/eslint-config/rules/public-api/lite',
        '@feature-sliced/eslint-config/rules/layers-slices',
      ],

      parserOptions: {
        project: ['./tsconfig.json'], // Specify it only for TypeScript files
      },
      rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'effector/no-patronum-debug': 'warn',
        'import/no-internal-modules': [
          'error',
          {
            allow: [
              '**/app/*',
              '**/pages/*',
              '**/widgets/*',
              '**/features/*',
              '**/entities/*',
              '**/shared/*/*',
              'source-map-support/*',
            ],
          },
        ],
        // 'no-restricted-imports': [
        //   'error',
        //   {
        //     patterns: [
        //       {
        //         message: 'Private imports are prohibited, use public imports instead',
        //         group: ['~/app/**'],
        //       },
        //       {
        //         message: 'Private imports are prohibited, use public imports instead',
        //         group: ['~/processes/*/**'],
        //       },
        //       {
        //         message: 'Private imports are prohibited, use public imports instead',
        //         group: ['~/pages/*/**'],
        //       },
        //       {
        //         message: 'Private imports are prohibited, use public imports instead',
        //         group: ['~/widgets/*/**'],
        //       },
        //       {
        //         message: 'Private imports are prohibited, use public imports instead',
        //         group: ['~/features/*/**'],
        //       },
        //       {
        //         message: 'Private imports are prohibited, use public imports instead',
        //         group: ['~/entities/*/**'],
        //       },
        //       {
        //         message: 'Private imports are prohibited, use public imports instead',
        //         group: ['~/shared/*/*/**'],
        //       },
        //       {
        //         message:
        //           'Prefer absolute imports instead of relatives (for root modules)',
        //         group: ['../**/app'],
        //       },
        //       {
        //         message:
        //           'Prefer absolute imports instead of relatives (for root modules)',
        //         group: ['../**/processes'],
        //       },
        //       {
        //         message:
        //           'Prefer absolute imports instead of relatives (for root modules)',
        //         group: ['../**/pages'],
        //       },
        //       {
        //         message:
        //           'Prefer absolute imports instead of relatives (for root modules)',
        //         group: ['../**/widgets'],
        //       },
        //       {
        //         message:
        //           'Prefer absolute imports instead of relatives (for root modules)',
        //         group: ['../**/features'],
        //       },
        //       {
        //         message:
        //           'Prefer absolute imports instead of relatives (for root modules)',
        //         group: ['../**/entities'],
        //       },
        //       {
        //         message:
        //           'Prefer absolute imports instead of relatives (for root modules)',
        //         group: ['../**/shared'],
        //       },
        //     ],
        //   },
        // ],
        // 'boundaries/element-types': [
        //   'warn',
        //   {
        //     default: 'disallow',
        //     rules: [
        //       {
        //         from: 'app',
        //         allow: [
        //           'processes',
        //           'pages',
        //           'widgets',
        //           'features',
        //           'entities',
        //           'shared',
        //         ],
        //       },
        //       {
        //         from: 'processes',
        //         allow: ['pages', 'widgets', 'features', 'entities', 'shared'],
        //       },
        //       { from: 'pages', allow: ['widgets', 'features', 'entities', 'shared'] },
        //       { from: 'widgets', allow: ['features', 'entities', 'shared'] },
        //       { from: 'features', allow: ['entities', 'shared'] },
        //       { from: 'entities', allow: ['shared'] },
        //       { from: 'shared', allow: ['shared'] },
        //     ],
        //   },
        // ],
      },
    },
  ],
  ignorePatterns: ['.eslintrc.cjs', 'vite.config.ts'],
  // rules: {
  //   'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  //   '@typescript-eslint/no-non-null-assertion': 'off',
  // },
};
