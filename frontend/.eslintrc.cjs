module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: '18.2' },
  },
  rules: {
    // React 17+ JSX transform: React does not need to be in scope.
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
}
