module.exports = {
    extends: 'airbnb-base',
    env: {
        browser: false,
        node: true,
        mocha: true
    },
    plugins: ['node'],
    rules: {
        indent: 0,
        'no-plusplus': 0,
        'no-mixed-operators': 0,
        'no-prototype-builtins': 0,
        'no-confusing-arrow': 0,
        'no-param-reassign': 0,
        'comma-dangle': ['error', 'never'],
        'import/newline-after-import': 0,
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        'space-before-function-paren': ['error', 'never'],
        'no-underscore-dangle': 0,
        'func-names': 0,
        'prefer-arrow-callback': 0,
        'no-console': 0,
        'global-require': 0,
        'arrow-parens': 0,
        'arrow-body-style': 0,
        'no-restricted-syntax': 0,
        'max-len': 0,
        'no-script-url': 0,
        quotes: ['error', 'single', { allowTemplateLiterals: true }]
    }
};
