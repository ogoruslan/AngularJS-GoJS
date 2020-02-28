var webpack = require('webpack');
var path = require('path');
var config = require('./webpack.config');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

config.output = {
    filename: '[name].bundle.js',
    publicPath: '',
    path: path.resolve(__dirname, 'dist')
};

config.plugins = config.plugins.concat([
    
    new HtmlWebpackPlugin({
        template: 'client/index.html',
        inject: 'body',
        hash: true
    }),

    // Reduces bundles total size
    new webpack.optimize.UglifyJsPlugin({
        mangle: {
            
            // You can specify all variables that should not be mangled.
            // For example if your vendor dependency doesn't use modules
            // and relies on global variables. Most of angular modules relies on
            // angular global variable, so we should keep it unchanged
            except: ['$super', '$', 'exports', 'require', 'angular']
        }
    }),
    new CopyWebpackPlugin([
        {from: 'client/assets/strategical-planning-assets', to: 'assets/strategical-planning-assets'},
        {from: 'client/gojs-license', to: 'gojs-license'}
    ])
]);

module.exports = config;
