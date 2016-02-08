var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var AppTester = vumigo.AppTester;


describe("Mama Nigeria App", function() {
    describe("Voice Registration", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();
            tester = new AppTester(app);

            tester
                .setup.config.app({
                    testing_today: '2017-07-22',
                    name: 'voice-registration-test',
                    control: {
                        url: "http://localhost:8000/api/v1/",
                        api_key: "control_test_key"
                    },
                    voice_content: {
                        url: "http://localhost:8001/api/v1/",
                        api_key: "voice_test_key"
                    },
                    reg_complete_sms:
                        "You have been registered on Hello Mama. Welcome! " +
                        "To change the day & time you receive calls, stop " +
                        "them, or tell us you've had the baby, please call " +
                        "{{ voice_change_num }}.",
                    vumi_http: {
                        url: "https://localhost/api/v1/go/http_api_nostream/conversation_key/messages.json",
                        account_key: "acc_key",
                        conversation_token: "conv_token"
                    }
                })
                .setup(function(api) {
                    fixtures().forEach(function(d) {
                        d.repeatable = true;
                        api.http.fixtures.add(d);
                    });
                })
                ;
        });


        // TEST ANSWER RESET

        describe("When you go back to the main menu", function() {
            it("should reset the user answers", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '12345',        // state_personnel_auth
                        '*'
                    )
                    .check.interaction({
                        state: 'state_personnel_auth',
                        reply: 'Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345'
                    })
                    .check.user.answers({})
                    .run();
            });
        });

        // TEST REGISTRATION FLOW

        describe("When you start the app", function() {
            it("should navigate to state_personnel_auth", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'}
                    )
                    .check.interaction({
                        state: 'state_personnel_auth',
                        reply: 'Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8001/api/v1/eng_NG/state_personnel_auth_1.mp3',
                                wait_for: '#'
                            }
                        }
                    })
                    .run();
            });
        });

        describe("Initial personnel code authorization", function() {
            describe("if code validates", function() {
                it("should navigate to state_msg_receiver", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '12345'
                        )
                        .check.interaction({
                            state: 'state_msg_receiver',
                            reply: [
                                'Choose message receiver',
                                '1. Mother & Father',
                                '2. Only Mother',
                                '3. Only Father',
                                '4. Family member',
                                '5. Trusted friend'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_msg_receiver_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });

                /*it("should set the user answer mama_id to the mama's id", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '12345'
                        )
                        .check.user.answer('mama_id',
                            'cb245673-aa41-4302-ac47-00000000002')
                        .run();
                });

                it("should create the contact if it doesn't exist", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '12345'
                        )
                        .check.user.answer('mama_id',
                            'cb245673-aa41-4302-ac47-00000000003')
                        .run();
                });*/
            });

            describe("if personnel code does not validate", function() {
                it("should retry", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '+08080020002'
                        )
                        .check.interaction({
                            state: 'state_retry_personnel_auth',
                            reply: 'Sorry, that is not a valid number. Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_retry_personnel_auth_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if the retried code does not validate", function() {
                it("should retry again", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            ,'12346'        // state_personnel_auth
                            ,'12346'         // state_retry_personnel_auth

                        )
                        .check.interaction({
                            state: 'state_retry_personnel_auth',
                            reply: 'Sorry, that is not a valid number. Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_retry_personnel_auth_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if the user tries to restart with *", function() {
                it("should not restart", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            ,'12346'         // state_personnel_auth
                            ,'*'             // state_retry_personnel_auth
                        )
                        .check.interaction({
                            state: 'state_retry_personnel_auth',
                            reply: 'Sorry, that is not a valid number. Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_retry_personnel_auth_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if the retried personnel code validates", function() {
                it("should navigate to state_msg_receiver", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            ,'12456'        // state_personnel_auth
                            ,'12345'        // state_retry_personnel_auth
                        )
                        .check.interaction({
                            state: 'state_msg_receiver',
                            reply: [
                                'Choose message receiver',
                                '1. Mother & Father',
                                '2. Only Mother',
                                '3. Only Father',
                                '4. Family member',
                                '5. Trusted friend'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_msg_receiver_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });

                it("should set the user answer mama_id to the mama's id", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '12346',
                            '12347'
                        )
                        .check.user.answers({
                            mama_id: 'cb245673-aa41-4302-ac47-00000000002',
                            mama_num: '08080020002',
                            state_personnel_auth: '12346',
                            state_retry_personnel_auth: '12347'
                        })
                        .run();
                });
            });
        });

        describe("Flows from chosen message receiver options", function() {
            describe("(option 1 - Mother & Father as receivers)", function() {
                it("to state_father_msisdn", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_personnel_auth
                            , '1'           // state_msg_receiver - mother & father
                        )
                        .check.interaction({
                            state: 'state_father_msisdn',
                            reply: 'Please enter number (Father)'
                        })
                        .run();
                });
                it("to state_mother_msisdn", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_personnel_auth
                            , '1'           // state_msg_receiver - mother & father
                            , '08080020002' // state_father_msisdn
                        )
                        .check.interaction({
                            state: 'state_mother_msisdn',
                            reply: 'Please enter number (Mother)'
                        })
                        .run();
                });
                it("to state_pregnancy_status", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_personnel_auth
                            , '1'           // state_msg_receiver - mother & father
                            , '08080020002' // state_father_msisdn
                            , '08080020003' // state_mother_msisdn
                        )
                        .check.interaction({
                            state: 'state_pregnancy_status',
                            reply: [
                                'Pregnant or baby',
                                '1. Pregnant',
                                '2. Baby'
                            ].join('\n')
                        })
                        .run();
                });
            });
            describe("(option 2,4,5 - Mother or others)", function() {
                it("to state_receiver_msisdn", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '12345'   // state_personnel_auth
                            , '4'           // state_msg_receiver - family member
                        )
                        .check.interaction({
                            state: 'state_receiver_msisdn',
                            reply: 'Please enter number'
                        })
                        .run();
                });
                it("to state_pregnancy_status", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_personnel_auth
                            , '4'           // state_msg_receiver - family member
                            , '08080020002' // state_receiver_msisdn
                        )
                        .check.interaction({
                            state: 'state_pregnancy_status',
                            reply: [
                                'Pregnant or baby',
                                '1. Pregnant',
                                '2. Baby'
                            ].join('\n')
                        })
                        .run();
                });
            });
        });

        describe("When you enter a choice state_msg_receiver", function() {
            describe("if it is a valid choice", function() {
                it("should navigate to state state_pregnancy_status", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'           // state_personnel_auth
                            , '1'               // state_msg_receiver - mother&father
                            , '08080020002'     // state_father_msisdn
                            , '08080020003'     // state_mother_msisdn
                        )
                        .check.interaction({
                            state: 'state_pregnancy_status',
                            reply: [
                                'Pregnant or baby',
                                '1. Pregnant',
                                '2. Baby'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_pregnancy_status_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if it is *", function() {
                it("should restart", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '12345'     // state_personnel_auth
                            , '*'       // state_msg_receiver - restart
                        )
                        .check.interaction({
                            state: 'state_personnel_auth',
                            reply: 'Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_personnel_auth_1.mp3',
                                    wait_for: '#'
                                }
                            }
                    })
                        .run();
                });
            });

            describe("if it is an invalid choice", function() {
                it("should replay state_msg_receiver", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '12345'
                            , '7'  // state_msg_receiver - invalid choice
                        )
                        .check.interaction({
                            state: 'state_msg_receiver',
                            reply: [
                                'Choose message receiver',
                                '1. Mother & Father',
                                '2. Only Mother',
                                '3. Only Father',
                                '4. Family member',
                                '5. Trusted friend'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_msg_receiver_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });
        });

        describe("When you enter a choice state_pregnancy_status", function() {
            describe("if you choose pregnant", function() {
                it("should navigate to state_last_period_year", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'           // state_personnel_auth
                            , '1'               // state_msg_receiver - mother&father
                            , '08080020002'     // state_father_msisdn
                            , '08080020003'     // state_mother_msisdn
                            , '1'               // state_pregnancy_status
                        )
                        .check.interaction({
                            state: 'state_last_period_year',
                            reply: [
                                'Last period?',
                                '1. This year',
                                '2. Last year'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_last_period_year_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if you choose baby", function() {
                it("should navigate to state_baby_birth_year", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'           // state_personnel_auth
                            , '1'               // state_msg_receiver - mother&father
                            , '08080020002'     // state_father_msisdn
                            , '08080020003'     // state_mother_msisdn
                            , '2'               // state_pregnancy_status
                        )
                        .check.interaction({
                            state: 'state_baby_birth_year',
                            reply: [
                                'Baby born?',
                                '1. this year',
                                '2. last year'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_baby_birth_year_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });
        });

        describe("When you enter a choice baby_birth_year", function() {
            describe("if 'this year' chosen", function() {
                it("should navigate to state_12A_baby_birth_month", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'           // state_personnel_auth
                            , '1'               // state_msg_receiver - mother&father
                            , '08080020002'     // state_father_msisdn
                            , '08080020003'     // state_mother_msisdn
                            , '2'               // state_pregnancy_status
                            , '1'               // state_baby_birth_year
                        )
                        .check.interaction({
                            state: 'state_12A_baby_birth_month',
                            reply: [
                                'Baby month?',
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_12A_baby_birth_month_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if 'last year' chosen", function() {
                it("should navigate to state_12B_baby_birth_month", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'           // state_personnel_auth
                            , '1'               // state_msg_receiver - mother&father
                            , '08080020002'     // state_father_msisdn
                            , '08080020003'     // state_mother_msisdn
                            , '2'               // state_pregnancy_status
                            , '2'               // state_baby_birth_year
                        )
                        .check.interaction({
                            state: 'state_12B_baby_birth_month',
                            reply: [
                                'Baby month?'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_12B_baby_birth_month_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });

            it("should converge at state_baby_birth_day", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'}
                        , '12345'       // state_personnel_auth
                        , '5'           // state_msg_receiver - trusted friend
                        , '08080020002' // state_receiver_msisdn
                        , '2'           // state_pregnancy_status - baby
                        , '2'           // state_baby_birth_year
                        , '4'           // state_12B_baby_birth_month -
                    )
                    .check.interaction({
                        state: 'state_baby_birth_day',
                        reply: 'Birth day in '
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8001/api/v1/eng_NG/state_baby_birth_day_1.mp3',
                                wait_for: '#'
                            }
                        }
                    })
                    .run();
            });
        });

        describe("when you enter a last period day", function() {
            describe("if it is an invalid day", function() {
                it("should navigate to state_retry_last_period_day", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_personnel_auth
                            , '5'           // state_msg_receiver - trusted friend
                            , '08080020002' // state_receiver_msisdn
                            , '1'           // state_pregnancy_status - pregnant
                            , '2'           // state_last_period_year - last year
                            , '2'           // state_last_period_month
                            , '32'          // state_last_period_day
                        )
                        .check.interaction({
                            state: 'state_retry_last_period_day',
                            reply: 'Retry period day'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_retry_baby_birth_day_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if it is a valid day", function() {
                it("should navigate to state_msg_language", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_personnel_auth
                            , '5'           // state_msg_receiver - trusted friend
                            , '08080020002' // state_receiver_msisdn
                            , '1'           // state_pregnancy_status - pregnant
                            , '2'           // state_last_period_year - last year
                            , '2'           // state_last_period_month
                            , '22'          // state_last_period_day
                        )
                        .check.interaction({
                            state: 'state_msg_language',
                            reply: [
                                'Language?',
                                '1. english',
                                '2. hausa',
                                '3. igbo'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_msg_language_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });
        });

        describe("when you enter a baby birth day", function() {
            describe("if it is an invalid day", function() {
                it("should navigate to state_retry_baby_birth_day", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_personnel_auth
                            , '5'           // state_msg_receiver - trusted friend
                            , '08080020002' // state_receiver_msisdn
                            , '2'           // state_pregnancy_status - baby
                            , '2'           // state_baby_birth_year - last year
                            , '2'           // state_12B_baby_birth_month -
                            , '32'          // state_baby_birth_day
                        )
                        .check.interaction({
                            state: 'state_retry_baby_birth_day',
                            reply: 'Retry birth day'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_retry_baby_birth_day_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if it is a valid day", function() {
                it("should navigate to state_msg_language", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_personnel_auth
                            , '5'           // state_msg_receiver - trusted friend
                            , '08080020002' // state_receiver_msisdn
                            , '2'           // state_pregnancy_status - baby
                            , '2'           // state_baby_birth_year - last year
                            , '2'           // state_12B_baby_birth_month -
                            , '12'          // state_baby_birth_day
                        )
                        .check.interaction({
                            state: 'state_msg_language',
                            reply: [
                                'Language?',
                                '1. english',
                                '2. hausa',
                                '3. igbo'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_msg_language_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if it is *", function() {
                it("should restart", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_personnel_auth
                            , '5'           // state_msg_receiver - trusted friend
                            , '08080020002' // state_receiver_msisdn
                            , '2'           // state_pregnancy_status - baby
                            , '2'           // state_pregnancy_status - babyk
                            , '2'           // state_baby_birth_year - last year
                            , '2'           // state_12B_baby_birth_month -
                            , '*'          // state_baby_birth_day
                        )
                        .check.interaction({
                            state: 'state_personnel_auth'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_personnel_auth_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });
        });



        describe("When you choose a language state_msg_language", function() {
            it("should navigate to state state_msg_type", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'}
                        , '12345'       // state_personnel_auth
                        , '5'           // state_msg_receiver - trusted friend
                        , '08080020002' // state_receiver_msisdn
                        , '2'           // state_pregnancy_status - baby
                        , '2'           // state_baby_birth_year - last year
                        , '2'           // state_12B_baby_birth_month -
                        , '13'          // state_baby_birth_day
                        , '3'           // state_msg-language - igbo
                    )
                    .check.interaction({
                        state: 'state_msg_type',
                        reply: [
                            'Channel?',
                            '1. sms',
                            '2. voice'
                        ].join('\n')
                    })
                    .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_msg_type_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                    .run();
            });
        });

        describe("When you choose a channel state_msg_type", function() {
            describe("if you choose sms", function() {
                it("should navigate to state_end_sms", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_personnel_auth
                            , '5'           // state_msg_receiver - trusted friend
                            , '08080020002' // state_receiver_msisdn
                            , '2'           // state_pregnancy_status - baby
                            , '2'           // state_baby_birth_year - last year
                            , '7'           // state_12B_baby_birth_month -
                            , '13'          // state_baby_birth_day
                            , '3'           // state_msg_language - igbo
                            , '2'           // state_msg_type - sms
                        )
                        .check.interaction({
                            state: 'state_end_sms',
                            reply: 'Thank you!'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_r13_end_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .check.reply.ends_session()
                        .run();
                });
            });

            describe("if you choose voice", function() {
                it("should navigate to state_voice_days", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_personnel_auth
                            , '5'           // state_msg_receiver - trusted friend
                            , '08080020002' // state_receiver_msisdn
                            , '2'           // state_pregnancy_status - baby
                            , '2'           // state_baby_birth_year - last year
                            , '2'           // state_12B_baby_birth_month -
                            , '13'          // state_baby_birth_day
                            , '3'           // state_msg-language - igbo
                            , '1'           // state_msg_type - voice
                        )
                        .check.interaction({
                            state: 'state_voice_days',
                            reply: [
                                'Message days?',
                                '1. mon_wed',
                                '2. tue_thu'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_voice_days_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });
        });

        describe("When you choose a day state_voice_days", function() {
            it("should navigate to state_voice_times", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        {session_event: 'new'}
                        , '12345'       // state_personnel_auth
                        , '5'           // state_msg_receiver - trusted friend
                        , '08080020002' // state_receiver_msisdn
                        , '2'           // state_pregnancy_status - baby
                        , '2'           // state_baby_birth_year - last year
                        , '2'           // state_12B_baby_birth_month -
                        , '13'          // state_baby_birth_day
                        , '3'           // state_msg-language - igbo
                        , '1'           // state_msg_type - voice
                        , '1'           // state_voice_days - monday and wednesday
                    )
                    .check.interaction({
                        state: 'state_voice_times',
                        reply: [
                            'Message time?',
                            '1. 9_11',
                            '2. 2_5'
                        ].join('\n')
                    })
                    .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_voice_times_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                    .run();
            });
        });

        describe("When you choose a time state_voice_times", function() {
            it("should navigate to state_voice_end", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'}
                        , '12345'       // state_personnel_auth
                        , '5'           // state_msg_receiver - trusted friend
                        , '08080020002' // state_receiver_msisdn
                        , '2'           // state_pregnancy_status - baby
                        , '2'           // state_baby_birth_year - last year
                        , '2'           // state_12B_baby_birth_month -
                        , '13'          // state_baby_birth_day
                        , '3'           // state_msg-language - igbo
                        , '1'           // state_msg_type - sms
                        , '1'           // state_voice_days - mon_wed
                        , '2'           // state_voice_times - 2_5
                    )
                    .check.interaction({
                        state: 'state_voice_end',
                        reply: 'Thank you! Time: 2_5. Days: mon_wed.'
                    })
                    .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8001/api/v1/eng_NG/state_r13_end_4.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                    .check.reply.ends_session()
                    .run();
            });

            it("should have the correct answers set", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'}
                        ,'12345'        // state_personnel_auth
                        , '2'           // state_msg_receiver - mother
                        , '08080020002' // state_receiver_msisdn
                        , '2'           // state_pregnancy_status - baby
                        , '2'           // state_last_period_year - this year
                        , '5'           // state_5B_period_month -
                        , '18'          // state_last_period_day - 18
                        , '1'           // state_msg_language - english
                        , '2'           // state_msg_type - voice
                        , '1'           // state_voice_days - mon_wed
                        , '2'           // state_voice_times - 2_5
                    )
                    .check.user.answers({
                        mama_id: "cb245673-aa41-4302-ac47-00000000002",
                        mama_num: "08080020002",
                        birth_date: '2015-12-21',
                        state_personnel_auth: "12345",
                        state_msg_receiver: "mother",
                        state_receiver_msisdn: "08080020002",
                        state_pregnancy_status: "baby",
                        state_last_period_year: "this_year",
                        state_5B_period_month: "5",
                        state_last_period_day: "18",
                        state_msg_language: "english",
                        state_msg_type: "voice",
                        state_voice_days: "mon_wed",
                        state_voice_times: "2_5"
                    })
                    .run();
            });
        });

    });
});
