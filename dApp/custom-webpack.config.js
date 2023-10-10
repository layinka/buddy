const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
// const NormalModuleReplacementPlugin = require('webpack/lib/NormalModuleReplacementPlugin');
const webpack = require('webpack');

module.exports = {
    // Other rules...
    plugins: [
        new NodePolyfillPlugin(),
        new webpack.NormalModuleReplacementPlugin(
            /^node:/,
            (resource) => {
              resource.request = resource.request.replace(/^node:/, '');
            },
        )
    ]
}