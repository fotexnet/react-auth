/** @type {import('jest').Config} */
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/templates'],
  moduleNameMapper: {
    // axios: './node_modules/axios/dist/node/axios.cjs',
    '.(css|less|scss)$': 'identity-obj-proxy',
  },
};
