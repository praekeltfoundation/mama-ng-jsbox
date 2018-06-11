module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        paths: {
            src: {
                app: {
                    ussd_registration: 'src/ussd_registration.js',
                    voice_registration: 'src/voice_registration.js',
                    ussd_community: 'src/ussd_community.js',
                    voice_community: 'src/voice_community.js',
                    ussd_public: 'src/ussd_public.js',
                    voice_public: 'src/voice_public.js',
                    voice_missed_call_service: 'src/voice_missed_call_service.js',
                    sms_inbound: 'src/sms_inbound.js',
                    train_ussd: 'src/train_ussd.js',
                    train_voice: 'src/train_voice.js',
                    train_ussd_community: 'src/train_ussd_community.js',
                    train_voice_community: 'src/train_voice_community.js',
                },
                ussd_registration: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.ussd_registration %>',
                    'src/init.js'
                ],
                voice_registration: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.voice_registration %>',
                    'src/init.js'
                ],
                ussd_community: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.ussd_community %>',
                    'src/init.js'
                ],
                voice_community: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.voice_community %>',
                    'src/init.js'
                ],
                ussd_public: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.ussd_public %>',
                    'src/init.js'
                ],
                voice_public: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.voice_public %>',
                    'src/init.js'
                ],
                voice_missed_call_service:[
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.voice_missed_call_service %>',
                    'src/init.js'
                ],
                sms_inbound: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.sms_inbound %>',
                    'src/init.js'
                ],
                train_voice: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.train_voice %>',
                    'src/init.js'
                ],
                train_ussd: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.train_ussd %>',
                    'src/init.js'
                ],
                train_ussd_community: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.train_ussd_community %>',
                    'src/init.js'
                ],
                train_voice_community: [
                    'src/index.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.train_voice_community %>',
                    'src/init.js'
                ],
                all: [
                    'src/**/*.js',
                    'test/**/*.js',
                ]
            },
            dest: {
                ussd_registration: 'go-ussd_registration.js',
                voice_registration: 'go-voice_registration.js',
                ussd_community: 'go-ussd_community.js',
                voice_community: 'go-voice_community.js',
                ussd_public: 'go-ussd_public.js',
                voice_public: 'go-voice_public.js',
                voice_missed_call_service: 'go-voice_missed_call_service.js',
                sms_inbound: 'go-sms_inbound.js',
                train_voice: 'go-train_voice.js',
                train_ussd: 'go-train_ussd.js',
                train_ussd_community: 'go-train_ussd_community.js',
                train_voice_community: 'go-train_voice_community.js'
            },
            test: {
                ussd_registration: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.ussd_registration %>',
                    'test/ussd_registration.test.js'
                ],
                voice_registration: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.voice_registration %>',
                    'test/voice_registration.test.js'
                ],
                ussd_public: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.ussd_public %>',
                    'test/ussd_public.test.js'
                ],
                voice_public: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.voice_public %>',
                    'test/voice_public.test.js'
                ],
                ussd_community: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.ussd_community %>',
                    'test/ussd_community.test.js'
                ],
                voice_community: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.voice_community %>',
                    'test/voice_community.test.js'
                ],
                voice_missed_call_service:[
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.voice_missed_call_service %>',
                    'test/voice_missed_call_service.test.js'
                ],
                sms_inbound: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.sms_inbound %>',
                    'test/sms_inbound.test.js'
                ],
                train_voice: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.train_voice %>',
                    'test/train_voice.test.js'
                ],
                train_ussd: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.train_ussd %>',
                    'test/train_ussd.test.js'
                ],
                train_ussd_community: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.train_ussd_community %>',
                    'test/train_ussd_community.test.js'
                ],
                train_voice_community: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    '<%= paths.src.app.train_voice_community %>',
                    'test/train_voice_community.test.js'
                ],
                utils_project: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/utils_project.js',
                    'test/utils_project.test.js',
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
            voice_community: {
                src: ['<%= paths.src.voice_community %>'],
                dest: '<%= paths.dest.voice_community %>'
            },
            voice_missed_call_service: {
                src: ['<%= paths.src.voice_missed_call_service %>'],
                dest: '<%= paths.dest.voice_missed_call_service %>'
            },
            ussd_registration: {
                src: ['<%= paths.src.ussd_registration %>'],
                dest: '<%= paths.dest.ussd_registration %>'
            },
            ussd_public: {
                src: ['<%= paths.src.ussd_public %>'],
                dest: '<%= paths.dest.ussd_public %>'
            },
            ussd_community: {
                src: ['<%= paths.src.ussd_community %>'],
                dest: '<%= paths.dest.ussd_community %>'
            },
            sms_inbound: {
                src: ['<%= paths.src.sms_inbound %>'],
                dest: '<%= paths.dest.sms_inbound %>'
            },
            train_voice: {
                src: ['<%= paths.src.train_voice %>'],
                dest: '<%= paths.dest.train_voice %>'
            },
            train_ussd: {
                src: ['<%= paths.src.train_ussd %>'],
                dest: '<%= paths.dest.train_ussd %>'
            },
            train_ussd_community: {
                src: ['<%= paths.src.train_ussd_community %>'],
                dest: '<%= paths.dest.train_ussd_community %>'
            },
            train_voice_community: {
                src: ['<%= paths.src.train_voice_community %>'],
                dest: '<%= paths.dest.train_voice_community %>'
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
            test_ussd_community: {
                src: ['<%= paths.test.ussd_community %>']
            },
            test_voice_community: {
                src: ['<%= paths.test.voice_community %>']
            },
            test_voice_missed_call_service:{
                src: ['<%= paths.test.voice_missed_call_service %>']
            },
            test_sms_inbound: {
                 src: ['<%= paths.test.sms_inbound %>']
            },
            test_train_voice: {
                src: ['<%= paths.test.train_voice %>']
            },
            test_train_ussd: {
                src: ['<%= paths.test.train_ussd %>']
            },
            test_train_ussd_community: {
                src: ['<%= paths.test.train_ussd_community %>']
            },
            test_train_voice_community: {
               src: ['<%= paths.test.train_voice_community %>']
            },
            test_utils_project: {
                src: ['<%= paths.test.utils_project %>']
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
