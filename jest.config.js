/** @type {import('jest').Config} */
module.exports = {
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/templates'],
  moduleNameMapper: {
    axios: 'axios/dist/node/axios.cjs',
  },
};
