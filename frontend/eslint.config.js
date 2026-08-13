import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  {
    ignores: [
      'android/**',
      'asset/**',
      'dist*/**',
      'scripts/**',
      'node_modules/**',
      'vite.config.js.timestamp-*'
    ]
  },
  {
    files: ['*.{js,jsx}', 'src/**/*.{js,jsx}'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node }
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      // Existing data-loading effects intentionally set loading state before async work.
      'react-hooks/set-state-in-effect': 'off',
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^(React|_)$'
      }]
    }
  }
]
