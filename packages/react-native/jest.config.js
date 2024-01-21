module.exports = {
  // preset: 'react-native-web',
  preset: 'react-native',
  testMatch: ['**/*.test.ts?(x)', '**/*.test.js?(x)'],
  setupFiles: ['./__tests__/jestSetupFile.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@react-navigation|ky)',
  ],
};
