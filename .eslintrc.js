module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        ecmaVersion: 2017,
        ecmaFeatures: {
            "jsx": true
        },
    },
    plugins: ["react"],
    extends: [
        'plugin:@typescript-eslint/recommended',
        "eslint:recommended",
        "plugin:react/recommended",
        "airbnb-base",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript"
    ],
    root: true,
    env: {
        browser: true,
        node: true,
        es6: true,
        jest: true
    },
    ignorePatterns: ['.eslintrc.js'],
    rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'import/no-import-module-exports': 'off',
        "linebreak-style": "off",
        "padded-blocks": "off",
        "lines-between-class-members": "off",
        "object-curly-newline": "off",
        "arrow-body-style": "off",
        "no-continue": "off",
        "no-param-reassign": "off",
        "no-useless-constructor": "off",
        "class-methods-use-this": "off",
        "no-multi-str": "off",
        "vars-on-top": "off",
        "no-await-in-loop": "off",
        "radix": 0,
        "no-plusplus": "off",
        "no-bitwise": "off",
        "no-undef": [ "error" ],
        "prefer-destructuring": [ "error", { "array": false, "object": false }, { "enforceForRenamedProperties": false } ],
        "max-len": [ "error", { "code": 1000 } ],
        "indent": [ "error", 4, { "SwitchCase": 1 } ],
        "semi": "off",
        "no-unused-vars": "off",
        "no-console": [ "warn", { "allow": [ "log", "warn", "error" ] } ],
        "no-empty": [ "error", { "allowEmptyCatch": true } ],
        "no-fallthrough": "warn",
        "quotes": [ "warn", "single" ],
        "one-var": "off",
        "one-var-declaration-per-line": "off",
        "nonblock-statement-body-position": "off",
        "no-extend-native": "off",
        "import/no-extraneous-dependencies": "off",
        "import/no-useless-path-segments": "off",
        "prefer-rest-params": "off",
        "no-use-before-define": "off",
        "quote-props": "off",
        "import/order": "off",
        "arrow-parens": [2, "always"],
        "no-multi-assign": "off",
        "dot-notation": "off",
        "newline-per-chained-call": "off",
        "no-empty-funciton": "off",
        "import/extensions": [ "error", "ignorePackages", {
            "js": "never",
            "jsx": "never",
            "ts": "never",
            "tsx": "never"
        } ],
        "import/prefer-default-export": "off",
        "max-classes-per-file": "off",
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": ["error"]
    },
    "settings": {
        "import/resolver": {
            "node": {
                "extensions": [
                    ".js",
                    ".jsx",
                    ".ts",
                    ".tsx",
                    ".css",
                    ".json",
                    ".svg"
                ]
            }
        }
    }
};
