module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        arrowParens: 'always',
        trailingComma: 'es5',
      },
    ],
  },
};
