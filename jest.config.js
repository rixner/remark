module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/jest-setup.js'],
  testMatch: ['<rootDir>/test/**/*_test.js'],
  moduleNameMapper: {
    '^marked$': '<rootDir>/node_modules/marked/lib/marked.umd.js',
    '^sinon$': '<rootDir>/node_modules/sinon/lib/sinon.js',
    '^utils$': '<rootDir>/src/remark/utils.js', // This one might be simple enough to keep or refactor
    '\\.less$': '<rootDir>/test/jest-file-mock.js'
  },
  transform: {
    '\\.html$': '<rootDir>/test/file-transformer.js'
  }
  // Jest might default to treating .js as ESM if type:module is set, but this project seems CJS.
  // We need to ensure it processes the test files correctly.
};
