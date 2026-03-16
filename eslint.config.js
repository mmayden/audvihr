import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window:          'readonly',
        document:        'readonly',
        localStorage:    'readonly',
        sessionStorage:  'readonly',
        fetch:           'readonly',
        console:         'readonly',
        setTimeout:      'readonly',
        clearTimeout:    'readonly',
        Promise:         'readonly',
        Date:            'readonly',
        JSON:            'readonly',
        Math:            'readonly',
        parseInt:        'readonly',
        parseFloat:      'readonly',
        isNaN:           'readonly',
        Array:           'readonly',
        Object:          'readonly',
        String:          'readonly',
        Boolean:         'readonly',
        Number:          'readonly',
        navigator:       'readonly',
        Notification:    'readonly',
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: '18' },
    },
    rules: {
      // React
      ...reactPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',       // not needed with Vite + React 17+
      'react/prop-types': 'off',                // fighter object shape is large & internal — enforced via JSDoc instead

      // Hooks
      ...reactHooks.configs.recommended.rules,

      // Quality
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
    },
  },
  {
    // Test files: add Node/Vitest globals (global, process, etc.)
    files: ['src/**/*.test.{js,jsx}'],
    languageOptions: {
      globals: {
        global:  'readonly',
        process: 'readonly',
      },
    },
  },
  {
    // Ignore test setup and config files
    ignores: ['dist/**', 'node_modules/**', 'src/test/setup.js'],
  },
];
