module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        paths: {
            src: {
                app: {
                    voice_registration: 'src/voice_registration.js',
                    voice_public: 'src/voice_public.js',
                    ussd_public: 'src/ussd_public.js',
                    ussd_registration: 'src/ussd_registration.js',
                    sms_inbound: 'src/sms_inbound.js'
                },
                voice_registration: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.voice_registration %>',
                    'src/init.js'
                ],
                voice_public: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.voice_public %>',
                    'src/init.js'
                ],
                ussd_registration: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.ussd_registration %>',
                    'src/init.js'
                ],
                sms_inbound: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.sms_inbound %>',
                    'src/init.js'
                ],
                ussd_public: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.ussd_public %>',
                    'src/init.js'
                ],
                all: [
                    'src/**/*.js'
                ]
            },
            dest: {
                voice_registration: 'go-voice_registration.js',
                voice_public: 'go-voice_public.js',
                sms_inbound: 'go-sms_inbound.js',
                ussd_public: 'go-ussd_public.js',
                ussd_registration: 'go-ussd_registration.js'
            },
            test: {
                voice_registration: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.voice_registration %>',
                    'test/voice_registration.test.js'
                ],
                voice_public: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.voice_public %>',
                    'test/voice_public.test.js'
                ],
                ussd_registration: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.ussd_registration %>',
                    'test/ussd_registration.test.js'
                ],
                sms_inbound: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.sms_inbound %>',
                    'test/sms_inbound.test.js'
                ],
                ussd_public: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.ussd_public %>',
                    'test/ussd_public.test.js'
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
            voice_registration: {
                src: ['<%= paths.src.voice_registration %>'],
                dest: '<%= paths.dest.voice_registration %>'
            },
            voice_public: {
                src: ['<%= paths.src.voice_public %>'],
                dest: '<%= paths.dest.voice_public %>'
            },
            ussd_registration: {
                src: ['<%= paths.src.ussd_registration %>'],
                dest: '<%= paths.dest.ussd_registration %>'
            },
            sms_inbound: {
                src: ['<%= paths.src.sms_inbound %>'],
                dest: '<%= paths.dest.sms_inbound %>'
            },
            ussd_public: {
                src: ['<%= paths.src.ussd_public %>'],
                dest: '<%= paths.dest.ussd_public %>'
            }

        },

        mochaTest: {
            options: {
                reporter: 'spec'
            },
            test_ussd_registration: {
                src: ['<%= paths.test.ussd_registration %>']
            },
            test_voice_registration: {
                src: ['<%= paths.test.voice_registration %>']
            },
            test_ussd_public: {
                src: ['<%= paths.test.ussd_public %>']
            },
            test_voice_public: {
                src: ['<%= paths.test.voice_public %>']
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
