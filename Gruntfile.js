module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        paths: {
            src: {
                app: {
                    voice_reg_change: 'src/voice_reg_change.js',
                    sms_inbound: 'src/sms_inbound.js'
                },
                voice_reg_change: [
                    'src/index.js',
                    'src/utils.js',
                    '<%= paths.src.app.voice_reg_change %>',
                    'src/init.js'
                ],
                sms_inbound: [
                    'src/index.js',
                    'src/utils.js',
                    '<%= paths.src.app.sms_inbound %>',
                    'src/init.js'
                ],
                all: [
                    'src/**/*.js'
                ]
            },
            dest: {
                voice_reg_change: 'go-voice_reg_change.js',
                sms_inbound: 'go-sms_inbound.js'
            },
            test: {
                voice_reg_change: [
                    'test/setup.js',
                    'src/utils.js',
                    '<%= paths.src.app.voice_reg_change %>',
                    'test/voice_reg_change.test.js'
                ],
                sms_inbound: [
                    'test/setup.js',
                    'src/utils.js',
                    '<%= paths.src.app.sms_inbound %>',
                    'test/sms_inbound.test.js'
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

            voice_reg_change: {
                src: ['<%= paths.src.voice_reg_change %>'],
                dest: '<%= paths.dest.voice_reg_change %>'
            },

            sms_inbound: {
                src: ['<%= paths.src.sms_inbound %>'],
                dest: '<%= paths.dest.sms_inbound %>'
            },

        },

        mochaTest: {
            options: {
                reporter: 'spec'
            },
            test_voice_reg_change: {
                src: ['<%= paths.test.voice_reg_change %>']
            },
            test_sms_inbound: {
                src: ['<%= paths.test.sms_inbound %>']
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
