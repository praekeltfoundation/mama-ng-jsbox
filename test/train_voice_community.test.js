var vumigo = require('vumigo_v02');
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
                    country_code: '234',  // nigeria
                    env: 'test',
                    default_day: 'tue',
                    default_time: '6_8',
                    services: {
                        voice_content: {
                            api_token: "test_token_voice_content",
                            url: "http://localhost:8004/api/v1/"
                        },
                    }
                })
                .setup(function(api) {
                    // TR03 add logging fixture
                    api.http.fixtures.add({
                        'repeatable': true,
                        'request': {
                            'method': 'HEAD',
                            'params': {},
                            'headers': {
                                'Connection': ['close']
                            },
                            'url': new RegExp('^http:\/\/localhost:8004\/api\/v1\/.*\.mp3$'),
                        },
                        'response': {
                            "code": 200,
                            "data": {}
                        }
                    });
                });
        });


        // TEST ANSWER RESET

        describe("When you go back to the main menu", function() {
            it("should reset the user answers", function() {
                return tester
                    .setup.user.addr('07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '12345'  // state_corp_auth
                        , '0'  // restart
                    )
                    .check.interaction({
                        state: 'state_msg_receiver'
                    })
                    .check.user.answers({"state_corp_auth": "12345"})
                    .run();
            });
        });

        // TEST REGISTRATION FLOW

        describe("When you start the app", function() {
            describe("if the user is a registered corp (has corp code)", function() {
                it("should navigate to state_corp_auth", function() {
                    // we cannot rely on the user being identified via caller id,
                    // so the corp code should always be gathered first
                    return tester
                        .setup.user.addr('08080070007')
                        .inputs(
                            {session_event: 'new'}
                        )
                        .check.interaction({
                            state: 'state_corp_auth'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_corp_auth_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
            });
            describe("if the user is not a registered corp", function() {
                it("should navigate to state_corp_auth", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                        )
                        .check.interaction({
                            state: 'state_corp_auth'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_corp_auth_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
                it("should repeat state_corp_auth", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '*' // state_corp_auth
                        )
                        .check.interaction({
                            state: 'state_corp_auth'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_corp_auth_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
            });
        });

        describe("Entering a corp (chew) code", function() {
            describe("if code validates", function() {
                it("should navigate to state_msg_receiver", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '12345'  // state_corp_auth
                        )
                        .check.interaction({
                            state: 'state_msg_receiver'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msg_receiver_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if corp code does not validate", function() {
                it("should retry", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , 'aaaaa'  // state_corp_auth
                        )
                        .check.interaction({
                            state: 'state_corp_auth'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: [
                                        'http://localhost:8004/api/v1/eng_NG/state_error_invalid_number.mp3',
                                        'http://localhost:8004/api/v1/eng_NG/state_corp_auth_1.mp3'
                                    ],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if the retried code does not validate", function() {
                it("should retry again", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            ,'aaaaa'  // state_corp_auth
                            ,'aaaaa'  // state_corp_auth
                        )
                        .check.interaction({
                            state: 'state_corp_auth'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: [
                                        'http://localhost:8004/api/v1/eng_NG/state_error_invalid_number.mp3',
                                        'http://localhost:8004/api/v1/eng_NG/state_corp_auth_1.mp3'
                                    ],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if the user tries to restart with 0", function() {
                it("should not restart", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , 'aaaaa'  // state_corp_auth
                            , '0'      // state_corp_auth
                        )
                        .check.interaction({
                            state: 'state_corp_auth'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: [
                                        'http://localhost:8004/api/v1/eng_NG/state_error_invalid_number.mp3',
                                        'http://localhost:8004/api/v1/eng_NG/state_corp_auth_1.mp3'
                                    ],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if the retried corp code validates", function() {
                it("should navigate to state_msg_receiver", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            ,'aaaaa'  // state_corp_auth
                            ,'12345'  // state_corp_auth
                        )
                        .check.interaction({
                            state: 'state_msg_receiver'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msg_receiver_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
            });
        });

        describe("Flows from chosen message receiver options", function() {
            describe("(option 1 - Mother & Father as receivers)", function() {
                it("to state_msisdn_mother", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'  // state_corp_auth
                            , '1'      // state_msg_receiver - mother & father
                        )
                        .check.interaction({
                            state: 'state_msisdn_mother'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msisdn_mother_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
                it("to state_msisdn_mother", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'   // state_corp_auth
                            , '1'       // state_msg_receiver - mother & father
                            , '12345'   // state_msisdn_mother
                        )
                        .check.interaction({
                            state: 'state_msisdn_mother'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: [
                                        'http://localhost:8004/api/v1/eng_NG/state_error_invalid_number.mp3',
                                        'http://localhost:8004/api/v1/eng_NG/state_msisdn_mother_1.mp3'
                                    ],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
                it("to state_msisdn_household (father message receiver)", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_corp_auth
                            , '1'            // state_msg_receiver - mother & father
                            , '09094444444'  // state_msisdn_mother
                        )
                        .check.interaction({
                            state: 'state_msisdn_household'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msisdn_household_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
                it("to state_msisdn_household (family member message receiver)", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_corp_auth
                            , '4'            // state_msg_receiver - mother & family member
                            , '09094444444'  // state_msisdn_mother
                        )
                        .check.interaction({
                            state: 'state_msisdn_household'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msisdn_household_2.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
                it("to state_msisdn_household (friend message receiver)", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_corp_auth
                            , '5'            // state_msg_receiver - mother & friend
                            , '09094444444'  // state_msisdn_mother
                        )
                        .check.interaction({
                            state: 'state_msisdn_household'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msisdn_household_3.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
                it("to state_msisdn_household", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_corp_auth
                            , '1'            // state_msg_receiver - mother & father
                            , '09094444444'  // state_msisdn_mother
                            , '08020002'     // state_msisdn_household
                        )
                        .check.interaction({
                            state: 'state_msisdn_household'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: [
                                        'http://localhost:8004/api/v1/eng_NG/state_error_invalid_number.mp3',
                                        'http://localhost:8004/api/v1/eng_NG/state_msisdn_household_1.mp3'
                                    ],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
                it("to state_msg_language", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_corp_auth
                            , '1'            // state_msg_receiver - mother & father
                            , '09094444444'  // state_msisdn_mother
                            , '09095555555'  // state_msisdn_household
                        )
                        .check.interaction({
                            state: 'state_msg_language'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msg_language_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
            });
            describe("(option 2,4,5 - Mother or others)", function() {
                it("to state_msisdn", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'  // state_corp_auth
                            , '7'      // state_msg_receiver - family member
                        )
                        .check.interaction({
                            state: 'state_msisdn'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msisdn_2.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
                it("to state_msisdn - retry", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'     // state_corp_auth
                            , '7'         // state_msg_receiver - family member
                            , '08567898'  // state_msisdn
                        )
                        .check.interaction({
                            state: 'state_msisdn'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: [
                                        'http://localhost:8004/api/v1/eng_NG/state_error_invalid_number.mp3',
                                        'http://localhost:8004/api/v1/eng_NG/state_msisdn_2.mp3'
                                    ],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
                it("repeat state_msisdn - retry", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'     // state_corp_auth
                            , '7'         // state_msg_receiver - family member
                            , '08567898'  // state_msisdn
                            , '*'  // repeat
                        )
                        .check.interaction({
                            state: 'state_msisdn'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: [
                                        'http://localhost:8004/api/v1/eng_NG/state_error_invalid_number.mp3',
                                        'http://localhost:8004/api/v1/eng_NG/state_msisdn_2.mp3'
                                    ],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
                it("restart from state_msisdn", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'     // state_corp_auth
                            , '7'         // state_msg_receiver - family member
                            , '08567898'  // state_msisdn
                            , '0' // restart
                        )
                        .check.interaction({
                            state: 'state_msg_receiver'
                        })
                        .run();
                });
                it("to state_msg_language", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_corp_auth
                            , '7'            // state_msg_receiver - family member
                            , '09092222222'  // state_msisdn
                        )
                        .check.interaction({
                            state: 'state_msg_language'
                        })
                        .run();
                });
                it("to state_msg_language", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_corp_auth
                            , '7'            // state_msg_receiver - family member
                            , 'a45521'       // state_msisdn
                            , '09092222222'  // state_msisdn
                        )
                        .check.interaction({
                            state: 'state_msg_language'
                        })
                        .run();
                });
                it("to state_msg_language (because it's family_only)", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_corp_auth
                            , '7'            // state_msg_receiver - family member
                            , '09097777777'  // state_msisdn
                        )
                        .check.interaction({
                            state: 'state_msg_language'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msg_language_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
            });
        });

        describe("When you enter a choice state_msg_receiver", function() {
            describe("if it is a valid choice", function() {
                it("should navigate to state_msg_language", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_corp_auth
                            , '1'            // state_msg_receiver - mother&father
                            , '09094444444'  // state_msisdn_mother
                            , '09095555555'  // state_msisdn_household
                        )
                        .check.interaction({
                            state: 'state_msg_language'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msg_language_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if it is 0", function() {
                it("should restart", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '12345'  // state_corp_auth
                            , '0'    // state_msg_receiver - restart
                        )
                        .check.interaction({
                            state: 'state_msg_receiver'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msg_receiver_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                    })
                    .run();
                });
            });

            describe("if it is an invalid choice", function() {
                it("should replay state_msg_receiver", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '12345'
                            , '8'  // state_msg_receiver - invalid choice
                        )
                        .check.interaction({
                            state: 'state_msg_receiver'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msg_receiver_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
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
                    .setup.user.addr('07030010001')
                    .inputs(
                        {session_event: 'new'}
                        , '12345'       // state_corp_auth
                        , '6'           // state_msg_receiver - friend_only
                        , '09092222222' // state_msisdn
                        , '1'           // state_msg-language - english
                    )
                    .check.interaction({
                        state: 'state_msg_type'
                    })
                    .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msg_type_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                    .run();
            });
        });

        describe("When you choose a channel state_msg_type", function() {
            describe("if you choose sms", function() {
                it("should navigate to state_end_sms_corp", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_corp_auth
                            , '6'           // state_msg_receiver - friend_only
                            , '09092222222' // state_msisdn
                            , '2'           // state_msg_language - igbo
                            , '2'           // state_msg_type - sms
                        )
                        .check.interaction({
                            state: 'state_end_sms_corp'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_end_sms_corp_1.mp3'],
                                    wait_for: '#',
                                    barge_in: false
                                }
                            }
                        })
                        .check.reply.ends_session()
                        .run();
                });
            });

            describe("if you choose voice", function() {
                it("should navigate to state_end_voice_corp", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_corp_auth
                            , '6'           // state_msg_receiver - friend_only
                            , '09092222222' // state_msisdn
                            , '2'           // state_msg_language - igbo
                            , '1'           // state_msg_type - voice
                        )
                        .check.interaction({
                            state: 'state_end_voice_corp'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_end_voice_corp_1.mp3'],
                                    wait_for: '#',
                                    barge_in: false
                                }
                            }
                        })
                        .check.reply.ends_session()
                        .run();
                });
            });
        });

        // TEST CORRECT MSISDN PROMPT

        describe("When you select different receivers *_only", function() {

            describe("when you select mother only", function() {
                it("should use state_msisdn_1", function() {
                    return tester
                        .setup.user.addr('07030010009')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_corp_auth
                            , '2'           // state_msg_receiver - mother_only
                        )
                        .check.interaction({
                            state: 'state_msisdn'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msisdn_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
            });

            describe("when you select family only", function() {
                it("should use state_msisdn_2", function() {
                    return tester
                        .setup.user.addr('07030010009')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_corp_auth
                            , '7'           // state_msg_receiver - family_only
                        )
                        .check.interaction({
                            state: 'state_msisdn'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msisdn_2.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
            });

            describe("when you select friend only", function() {
                it("should use state_msisdn_3", function() {
                    return tester
                        .setup.user.addr('07030010009')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_corp_auth
                            , '6'           // state_msg_receiver - friend_only
                        )
                        .check.interaction({
                            state: 'state_msisdn'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msisdn_3.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
            });

            describe("when you select father only", function() {
                it("should use state_msisdn_4", function() {
                    return tester
                        .setup.user.addr('07030010009')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_corp_auth
                            , '3'           // state_msg_receiver - father_only
                        )
                        .check.interaction({
                            state: 'state_msisdn'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msisdn_4.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
            });
        });
    });
});
