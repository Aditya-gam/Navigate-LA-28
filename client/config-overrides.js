const path = require('path');

module.exports = function override(config, env) {
  // Configure webpack to support path aliases
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, 'src'),
    '@/components': path.resolve(__dirname, 'src/components'),
    '@/services': path.resolve(__dirname, 'src/services'),
    '@/hooks': path.resolve(__dirname, 'src/hooks'),
    '@/utils': path.resolve(__dirname, 'src/utils'),
    '@/types': path.resolve(__dirname, 'src/types'),
    '@/constants': path.resolve(__dirname, 'src/constants'),
    '@/assets': path.resolve(__dirname, 'src/assets'),
    '@/styles': path.resolve(__dirname, 'src/styles'),
    '@/slices': path.resolve(__dirname, 'src/slices'),
  };

  // Configure polyfills for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "path": require.resolve("path-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "fs": false,
    "net": false,
    "tls": false,
  };

  return config;
};

// Jest configuration for react-app-rewired
module.exports.jest = function override(config) {
  // Add TypeScript support
  config.preset = 'ts-jest';
  config.testEnvironment = 'jsdom';
  
  // Configure module name mapping
  config.moduleNameMapper = {
    ...config.moduleNameMapper,
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@/assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@/styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@/slices/(.*)$': '<rootDir>/src/slices/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  };

  // Configure transforms
  config.transform = {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  };

  // Configure transform ignore patterns for ES modules
  config.transformIgnorePatterns = [
    'node_modules/(?!(axios|chart.js|react-chartjs-2)/)',
  ];

  // Configure module file extensions
  config.moduleFileExtensions = ['ts', 'tsx', 'js', 'jsx', 'json', 'node'];

  // Configure ts-jest globals
  config.globals = {
    ...config.globals,
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  };

  return config;
}; 