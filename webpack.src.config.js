var webpack = require('webpack');
var path = require('path');
var config = require('./webpack.config');
var CopyWebpackPlugin = require('copy-webpack-plugin');

config.output = {
    filename: '[name].min.js',
    publicPath: '',
    path: path.resolve(__dirname, 'src')
};

config.plugins = config.plugins.concat([
    
    // Reduces bundles total size
    new webpack.optimize.UglifyJsPlugin({
        sourceMap:false,
        mangle: {

            // You can specify all variables that should not be mangled.
            // For example if your vendor dependency doesn't use modules
            // and relies on global variables. Most of angular modules relies on
            // angular global variable, so we should keep it unchanged
            except: ['$super', '$', 'exports', 'require', 'angular'],
        },
        compress:{
            warnings:false
        }
    }),
    new CopyWebpackPlugin([
        {from: 'client/assets/strategical-planning-assets', to: 'assets/strategical-planning-assets'},
        {from: 'package.json', to: 'package.json'},
        {from: 'index-component.js', to: 'index.js'}
    ])
]);

module.exports = config;
