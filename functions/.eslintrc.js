module.exports = {
  env: {
    es6: true,
    node: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", {"allowTemplateLiterals": true}],
<<<<<<< HEAD
    "linebreak-style": 0, // Disabled for Windows compatibility
=======
    "linebreak-style": 0,
>>>>>>> dc43d9005eadfc665dee902509676fa6e79b112f
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
