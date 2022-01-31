const {
    when,
    whenDev,
    whenProd,
    whenTest,
    ESLINT_MODES,
    POSTCSS_MODES,
} = require("@craco/craco");

const webpack = require("webpack");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
    webpack: {
        alias: {},
        plugins: {
            add: [new NodePolyfillPlugin()] /* An array of plugins */,
        },
    },
};
