module.exports = {
  root: true,
  extends: [
    'react-app',
    'react-app/jest',
  ],
  rules: {
    // General Rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    
    // Code Quality Rules
    'prefer-const': 'error',
    'no-var': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
  },
}; 