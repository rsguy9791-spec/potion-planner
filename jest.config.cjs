/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    // Force Node export conditions so @vue/test-utils uses its Node build,
    // not the browser bundle (which expects a global `Vue`)
    customExportConditions: ['node', 'node-addons'],
  },
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.[jt]s$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'vue', 'json'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock CSS imports so Jest doesn't choke on them
    'vuetify/styles': '<rootDir>/__mocks__/styleMock.cjs',
    '@mdi/font/css/materialdesignicons\\.css': '<rootDir>/__mocks__/styleMock.cjs',
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.cjs',
  },
  // Vuetify ships ESM-only; tell Jest to transform it
  transformIgnorePatterns: [
    'node_modules/(?!(vuetify)/)',
  ],
  testMatch: ['**/__tests__/**/*.test.ts'],
}
