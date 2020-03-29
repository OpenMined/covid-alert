module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
  },
  extends: [
    'eslint:recommended',
    '@react-native-community',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
};
