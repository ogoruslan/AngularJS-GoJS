'use strict';

import gulp     from 'gulp';
import webpack  from 'webpack';
import path     from 'path';
import sync     from 'run-sequence';
import rename   from 'gulp-rename';
import template from 'gulp-template';
import fs       from 'fs';
import yargs    from 'yargs';
import lodash   from 'lodash';
import gutil    from 'gulp-util';
import serve    from 'browser-sync';
import del      from 'del';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import colorsSupported      from 'supports-color';
import historyApiFallback   from 'connect-history-api-fallback';

let root = 'client';

// helper method for resolving paths
let resolveToApp = (glob = '') => {
    return path.join(root, 'app', glob); // app/{glob}
};

let resolveToComponents = (glob = '') => {
    return path.join(root, 'app/components', glob); // app/components/{glob}
};

// map of all paths
let paths = {
    js: resolveToComponents('**/*!(.spec.js).js'), // exclude spec files
    scss: resolveToApp('**/*.scss'), // stylesheets
    html: [
        resolveToApp('**/*.html'),
        path.join(root, 'index.html')
    ],
    entry: [
        path.join(__dirname, root, 'app/app.js')
    ],
    componentEntry: [
        path.join(__dirname, root, 'app/pages/cm-strategical-planning/cm-strategical-planning.js')
    ],
    output: root,
    blankTemplates: path.join(__dirname, 'generator', 'component/**/*.**'),
    destDist: path.join(__dirname, 'dist'),
    destSrc: [
        path.join(__dirname, 'src') + '/**',
        '!' + path.join(__dirname, 'src'),
        '!' + path.join(__dirname, 'src') + '/.git',
        '!' + path.join(__dirname, 'src') + '/.gitignore'
    ]
};

// use webpack.config.js to build modules
gulp.task('webpack-component', ['clean-src'], (cb) => {
    const config = require('./webpack.src.config');
    config.entry['strategical-planning'] = paths.componentEntry;
    
    webpack(config, (err, stats) => {
        if (err) {
            throw new gutil.PluginError("webpack", err);
        }
        
        gutil.log("[webpack]", stats.toString({
            colors: colorsSupported,
            chunks: false,
            errorDetails: true
        }));
        
        cb();
    });
});

gulp.task('webpack', ['clean-dist'], (cb) => {
    const config = require('./webpack.dist.config');
    config.entry.app = paths.entry;
    
    webpack(config, (err, stats) => {
        if (err) {
            throw new gutil.PluginError("webpack", err);
        }
        
        gutil.log("[webpack]", stats.toString({
            colors: colorsSupported,
            chunks: false,
            errorDetails: true
        }));
        
        cb();
    });
});

gulp.task('serve', () => {
    const config = require('./webpack.dev.config');
    config.entry.app = [
        // this modules required to make HRM working
        // it responsible for all this webpack magic
        'webpack-hot-middleware/client?reload=true',
        // application entry point
    ].concat(paths.entry);
    
    var compiler = webpack(config);
    
    serve({
        port: process.env.PORT || 3000,
        open: false,
        server: {baseDir: root},
        middleware: [
            historyApiFallback(),
            webpackDevMiddleware(compiler, {
                lazy: false,
                watchOptions: {
                    aggregateTimeout: 300,
                    poll: true
                },
                stats: {
                    colors: colorsSupported,
                    chunks: false,
                    modules: false
                },
                publicPath: config.output.publicPath
            }),
            webpackHotMiddleware(compiler)
        ]
    });
});

gulp.task('watch', ['serve']);

gulp.task('component', () => {
    const hookForMPProject = (val) => {
        return val.replace(/^Cm/, 'CM').replace(/^Oc/, 'OC').replace(/^Bp/, 'BP').replace(/^Pm/, 'PM');
    };
    const cap = (val) => {
        return hookForMPProject(val.charAt(0).toUpperCase() + val.slice(1));
    };
    const toCamelCase = (val) => {
        if (typeof val !== 'string') return val;
        let str = val;
        let matchResult = null;
        let findDashReg = /\-./;
        while (matchResult = str.match(findDashReg)) {
            str = str.replace(findDashReg, str.charAt(matchResult.index + 1).toUpperCase());
        }
        return str;
    };
    const name = yargs.argv.name + '';
    const camalCaseName = toCamelCase(name);
    const parentPath = yargs.argv.parent || '';
    const destPath = path.join(resolveToComponents(), parentPath, name);
    
    return gulp.src(paths.blankTemplates)
    .pipe(template({
        name: name,
        camalCaseName: camalCaseName,
        upCaseName: cap(camalCaseName)
    }))
    .pipe(rename((path) => {
        path.basename = path.basename.replace('temp', name);
    }))
    .pipe(gulp.dest(destPath));
});

gulp.task('clean-dist', (cb) => {
    del([paths.destDist]).then(function (paths) {
        gutil.log("[clean]", paths);
        cb();
    })
});

gulp.task('clean-src', (cb) => {
    del(paths.destSrc).then(function (paths) {
        gutil.log("[clean]", paths);
        cb();
    })
});

gulp.task('default', ['watch']);
