import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import pluginJs from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Base JavaScript and browser environment
  {
    files: ['**/*.{js,jsx,ts,tsx,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        // Define browser globals to avoid errors like "document is not defined"
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
      },
    },

    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
      // Configure import resolver for Next.js and node_modules
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
  // Extend Next.js recommended configs
  ...compat.config({
    extends: ['prettier', 'next/core-web-vitals', 'next/typescript'],
    rules: {
      ...pluginJs.configs.recommended.rules,

      '@typescript-eslint/no-this-alias': [
        'error',
        {
          allowDestructuring: true,
          allowedNames: ['self', 'that'],
        },
      ],
      '@typescript-eslint/no-empty-object-type': [
        'error',
        {
          allowObjectTypes: 'always',
        },
      ],
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-useless-escape': 'off',
      'sort-imports': 'off',
      'import/order': 'off',
      // Ensure React is in scope for JSX (required for react-quill-new)
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+
      'no-undef': 'off', // Disable base no-undef
      // '@typescript-eslint/no-undef': 'error',
    },
  }),
];

export default eslintConfig;
