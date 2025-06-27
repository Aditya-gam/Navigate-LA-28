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