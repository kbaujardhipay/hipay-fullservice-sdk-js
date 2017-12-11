module.exports = function(grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var configFileCreationNeeded = function() {
        return !grunt.file.exists('test/config.js')
    };

    grunt.initConfig({
        clean: ['dist'],

        pkg: grunt.file.readJSON('package.json'),

        concat: {
            options: {
                separator: grunt.util.linefeed + ';' + grunt.util.linefeed,
            },
            dist1: {
                src: ['node_modules/es2-shim-sham/index.js', 'node_modules/es6-promise/dist/es6-promise.auto.js', 'node_modules/json3/lib/json3.js', 'node_modules/fetch-ie8/fetch.js', 'src/base64.js', 'src/hipay-fullservice-sdk.js'],
                dest: 'example/public/lib/vendor/hipay/hipay-fullservice-sdk-js/hipay-fullservice-sdk-2.js'
            },
            dist2: {
                src: ['node_modules/es2-shim-sham/index.js', 'node_modules/es6-promise/dist/es6-promise.auto.js', 'node_modules/json3/lib/json3.js', 'node_modules/fetch-ie8/fetch.js', 'src/base64.js', 'src/hipay-fullservice-sdk.js'],
                dest: 'dist/hipay-fullservice-sdk-2.js'
            }
            // dist1: {
            //     src: ['node_modules/bluebird/js/browser/bluebird.js','node_modules/json3/lib/json3.js', 'node_modules/fetch-ie8/fetch.js', 'src/base64.js', 'src/hipay-fullservice-sdk.js'],
            //     dest: 'example/public/lib/vendor/hipay/hipay-fullservice-sdk-js/hipay-fullservice-sdk-2.js'
            // },
            // dist2: {
            //     src: ['node_modules/bluebird/js/browser/bluebird.js', 'node_modules/json3/lib/json3.js', 'node_modules/fetch-ie8/fetch.js', 'src/base64.js', 'src/hipay-fullservice-sdk.js'],
            //     dest: 'dist/hipay-fullservice-sdk-2.js'
            // }
            // dist1: {
            //     src: ['node_modules/es6-promise/dist/es6-promise.js', 'node_modules/es6-promise/dist/es6-promise.auto.js', 'node_modules/json3/lib/json3.js', 'node_modules/fetch-ie8/fetch.js', 'src/base64.js', 'src/hipay-fullservice-sdk.js'],
            //     dest: 'example/public/lib/vendor/hipay/hipay-fullservice-sdk-js/hipay-fullservice-sdk-2.js'
            // },
            // dist2: {
            //     src: ['node_modules/es6-promise/dist/es6-promise.js', 'node_modules/es6-promise/dist/es6-promise.auto.js', 'node_modules/json3/lib/json3.js', 'node_modules/fetch-ie8/fetch.js', 'src/base64.js', 'src/hipay-fullservice-sdk.js'],
            //     dest: 'dist/hipay-fullservice-sdk-2.js'
            // }
        },
        uglify: {
            my_target: {
                files: {
                    'dist/hipay-fullservice-sdk-2.min.js': ['dist/hipay-fullservice-sdk-2.js'],
                    'example/public/lib/vendor/hipay/hipay-fullservice-sdk-js/hipay-fullservice-sdk-2.min.js': ['example/public/lib/vendor/hipay/hipay-fullservice-sdk-js/hipay-fullservice-sdk-2.js'],
                }
            }
        },
        casperjs: {
            casper_test:
            {
                options: {
                    async: {
                        parallel: false
                    },
                    silent: false
                },
                files: {
                    src:['tests/casperjs/*.js']
                }
            },
            casper_test_min:
            {

                options: {
                    casperjsOptions: ['--type=min'],
                    async: {
                        parallel: false
                    },
                    silent: false
                },
                files: {
                    src:['tests/casperjs/*.js']
                }
            }

        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: 'dist/',
                    themedir: 'node_modules/yuidoc-lucid-theme',
                    helpers: ["node_modules/yuidoc-lucid-theme/helpers/helpers.js"],
                    outdir: './example/public/docs'
                }
            }
        }, 'gh-pages': {
            options: {
                base: 'docs'
            },
            src: "**"
        }


    });
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-casperjs');

    grunt.registerTask('default', ['sync', 'clean', 'concat', 'uglify']);
    grunt.registerTask('dist', ['concat:dist1']);
    grunt.registerTask('doc', ['default', 'yuidoc']);

    grunt.registerTask('deploy-doc', ['doc', 'gh-pages']);


    grunt.registerTask('test', ['casperjs:casper_test']);

    grunt.registerTask('deploy', ['concat','uglify']);


    // yuidoc . --configfile yuidocs.json


};