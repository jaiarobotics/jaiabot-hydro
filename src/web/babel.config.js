module.exports = {
    presets: [
        ["@babel/preset-env", { modules: "auto", targets: "defaults" }],
        "@babel/preset-react",
    ],
    plugins: [
        "@babel/plugin-transform-class-properties",
        [
            "transform-react-remove-prop-types",
            {
                mode: "remove",
                _disabled_ignoreFilenames: ["node_modules"],
            },
        ],
        "@babel/plugin-transform-nullish-coalescing-operator",
        "@babel/plugin-transform-private-methods",
        "@babel/plugin-transform-optional-chaining",
    ],
};
