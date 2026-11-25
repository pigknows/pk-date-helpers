module.exports = {
  rootDir: '..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/formatMisdetection.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['babel-jest', {
      babelrc: false,
      configFile: false,
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-typescript', { allExtensions: true, isTSX: false }],
      ],
    }],
  },
};
