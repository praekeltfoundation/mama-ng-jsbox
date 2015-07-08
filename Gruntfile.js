module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        paths: {
            src: {
                app: {
                    app1: 'src/app1.js',
                    app2: 'src/app2.js'
                },
                app1: [
                    'src/index.js',
                    'src/utils.js',
                    '<%= paths.src.app.app1 %>',
                    'src/init.js'
                ],
                app2: [
                    'src/index.js',
                    'src/utils.js',
                    '<%= paths.src.app.app2 %>',
                    'src/init.js'
                ],
                all: [
                    'src/**/*.js'
                ]
            },
            dest: {
                app1: 'go-app1.js',
                app2: 'go-app2.js'
            },
            test: {
                app1: [
                    'test/setup.js',
                    'src/utils.js',
                    '<%= paths.src.app.app1 %>',
                    'test/app1.test.js'
                ],
                app2: [
                    'test/setup.js',
                    'src/utils.js',
                    '<%= paths.src.app.app2 %>',
                    'test/app2.test.js'
                ]
            }
        },

        jshint: {
            options: {jshintrc: '.jshintrc'},
            all: [
                'Gruntfile.js',
                '<%= paths.src.all %>'
            ]
        },

        watch: {
            src: {
                files: [
                    '<%= paths.src.all %>'
                ],
                tasks: ['default'],
                options: {
                    atBegin: true
                }
            }
        },

        concat: {
            options: {
                banner: [
                    '// WARNING: This is a generated file.',
                    '//          If you edit it you will be sad.',
                    '//          Edit src/app.js instead.',
                    '\n' // Newline between banner and content.
                ].join('\n')
            },

            app1: {
                src: ['<%= paths.src.app1 %>'],
                dest: '<%= paths.dest.app1 %>'
            },

            app2: {
                src: ['<%= paths.src.app2 %>'],
                dest: '<%= paths.dest.app2 %>'
            },

        },

        mochaTest: {
            options: {
                reporter: 'spec'
            },
            test_app1: {
                src: ['<%= paths.test.app1 %>']
            },
            test_app2: {
                src: ['<%= paths.test.app2 %>']
            }
        }
    });

    grunt.registerTask('test', [
        'jshint',
        'build',
        'mochaTest'
    ]);

    grunt.registerTask('build', [
        'concat',
    ]);

    grunt.registerTask('default', [
        'build',
        'test'
    ]);
};
