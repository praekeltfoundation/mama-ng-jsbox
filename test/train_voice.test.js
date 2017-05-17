var vumigo = require('vumigo_v02');
var moment = require('moment');
var assert = require('assert');
// TR02 var fixtures = require('./fixtures_registration');
var AppTester = vumigo.AppTester;


describe("Mama Nigeria App", function() {
    describe("Voice Registration / Change", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();
            tester = new AppTester(app);

            tester
                .setup.config.app({
                    testing_today: '2017-07-22',
                    testing_message_id: '0170b7bb-978e-4b8a-35d2-662af5b6daee',  // testing only
                    name: 'train-voice-test',
                    country_code: '234',  // nigeria
                    default_language: 'eng_NG',
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
                })
                ;
        });


        describe("REGISTRATION", function() {
            // TEST ANSWER RESET

            describe("When you go back to the main menu", function() {
                it("should reset the user answers", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            ,'1'  // state_training_intro - register
                            ,'12345'  // state_personnel_auth
                            ,'0'  // restart
                        )
                        .check.interaction({
                            state: 'state_msg_receiver'
                        })
                        .check.user.answers({
                            "state_training_intro": "register",
                            "state_personnel_auth": "12345"
                        })
                        .run();
                });
            });

            // TEST REGISTRATION FLOW

            describe("When you start the app", function() {
                it("should navigate to state_personnel_auth", function() {
                    return tester
                        .setup.user.addr('08080070007')
                        .inputs(
                            {session_event: 'new'}
                            ,'1' // state_training_intro - register
                        )
                        .check.interaction({
                            state: 'state_personnel_auth'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_personnel_auth_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
                it("'*' should repeat state_personnel_auth", function() {
                    return tester
                        .setup.user.addr('08080070007')
                        .inputs(
                            {session_event: 'new'}
                            ,'1' // state_training_intro - register
                            ,'*'  // state_personnel_auth
                        )
                        .check.interaction({
                            state: 'state_personnel_auth'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_personnel_auth_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
            });

            describe("Entering a personnel (chew) code", function() {
                describe("if code validates", function() {
                    it("should navigate to state_msg_receiver", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                ,'1' // state_training_intro - register
                                ,'12345'  // state_personnel_auth
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

                describe("if personnel code does not validate", function() {
                    it("should retry", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                ,'1' // state_training_intro - register
                                ,'aaaaa'  // state_personnel_auth
                            )
                            .check.interaction({
                                state: 'state_personnel_auth'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: [
                                            'http://localhost:8004/api/v1/eng_NG/state_error_invalid_number.mp3',
                                            'http://localhost:8004/api/v1/eng_NG/state_personnel_auth_1.mp3'
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
                                ,'1' // state_training_intro - register
                                ,'aaaaa'  // state_personnel_auth
                                ,'aaaaa'  // state_personnel_auth
                            )
                            .check.interaction({
                                state: 'state_personnel_auth'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: [
                                            'http://localhost:8004/api/v1/eng_NG/state_error_invalid_number.mp3',
                                            'http://localhost:8004/api/v1/eng_NG/state_personnel_auth_1.mp3'
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
                                ,'1' // state_training_intro - register
                                ,'aaaaa'  // state_personnel_auth
                                ,'0'      // state_personnel_auth
                            )
                            .check.interaction({
                                state: 'state_personnel_auth'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: [
                                            'http://localhost:8004/api/v1/eng_NG/state_error_invalid_number.mp3',
                                            'http://localhost:8004/api/v1/eng_NG/state_personnel_auth_1.mp3'
                                        ],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                });

                describe("if the retried personnel code validates", function() {
                    it("should navigate to state_msg_receiver", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                ,'1' // state_training_intro - register
                                ,'aaaaa'  // state_personnel_auth
                                ,'12345'  // state_personnel_auth
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
                                ,'1' // state_training_intro - register
                                , '12345'  // state_personnel_auth
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
                                ,'1' // state_training_intro - register
                                , '12345'   // state_personnel_auth
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
                                , '1' // state_training_intro - register
                                , '12345'        // state_personnel_auth
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
                                , '1' // state_training_intro - register
                                , '12345'        // state_personnel_auth
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
                                , '1' // state_training_intro - register
                                , '12345'        // state_personnel_auth
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
                                , '1' // state_training_intro - register
                                , '12345'        // state_personnel_auth
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
                    it("to state_last_period_year", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'        // state_personnel_auth
                                , '1'            // state_msg_receiver - mother & father
                                , '09094444444'  // state_msisdn_mother
                                , '09095555555'  // state_msisdn_household
                            )
                            .check.interaction({
                                state: 'state_last_period_year'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_last_period_year_1.mp3'],
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
                                , '1' // state_training_intro - register
                                , '12345'  // state_personnel_auth
                                , '7'      // state_msg_receiver - family member
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
                    it("to state_msisdn - retry", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'     // state_personnel_auth
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
                                            'http://localhost:8004/api/v1/eng_NG/state_msisdn_1.mp3'
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
                                , '1' // state_training_intro - register
                                , '12345'     // state_personnel_auth
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
                                            'http://localhost:8004/api/v1/eng_NG/state_msisdn_1.mp3'
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
                                , '1' // state_training_intro - register
                                , '12345'     // state_personnel_auth
                                , '7'         // state_msg_receiver - family member
                                , '08567898'  // state_msisdn
                                , '0' // restart
                            )
                            .check.interaction({
                                state: 'state_msg_receiver'
                            })
                            .run();
                    });
                    it("to state_last_period_year (via st-03)", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'        // state_personnel_auth
                                , '7'            // state_msg_receiver - family member
                                , '09092222222'  // state_msisdn
                            )
                            .check.interaction({
                                state: 'state_last_period_year'
                            })
                            .run();
                    });
                    it("to state_last_period_year (via retry state st-03 retry)", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'        // state_personnel_auth
                                , '7'            // state_msg_receiver - family member
                                , 'a45521'       // state_msisdn
                                , '09092222222'  // state_msisdn
                            )
                            .check.interaction({
                                state: 'state_last_period_year'
                            })
                            .run();
                    });
                });
            });

            describe("When you enter a choice state_msg_receiver", function() {
                describe("if it is a valid choice", function() {
                    it("should navigate to state_last_period_year", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'        // state_personnel_auth
                                , '1'            // state_msg_receiver - mother&father
                                , '09094444444'  // state_msisdn_mother
                                , '09095555555'  // state_msisdn_household
                            )
                            .check.interaction({
                                state: 'state_last_period_year'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_last_period_year_1.mp3'],
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
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'  // state_personnel_auth
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
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                ,'12345'
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

            describe("When you enter a choice state_pregnancy_status", function() {
                describe("if you choose pregnant", function() {
                    it("should navigate to state_last_period_year", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'        // state_personnel_auth
                                , '1'            // state_msg_receiver - mother&father
                                , '09094444444'  // state_msisdn_mother
                                , '09095555555'  // state_msisdn_household
                                // , '1'            // state_pregnancy_status
                            )
                            .check.interaction({
                                state: 'state_last_period_year'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_last_period_year_1.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                });
                // bypass postbirth flow
                describe.skip("if you choose baby", function() {
                    it("should navigate to state_baby_birth_year", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'        // state_personnel_auth
                                , '1'            // state_msg_receiver - mother&father
                                , '09094444444'  // state_msisdn_mother
                                , '09095555555'  // state_msisdn_household
                                // , '2'            // state_pregnancy_status - baby
                            )
                            .check.interaction({
                                state: 'state_baby_birth_year'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_baby_birth_year_1.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                });
            });

            // pregnant
            describe("when you enter a last period year", function() {
                describe("if 'this year' is chosen", function() {
                    it("should navigate to state_last_period_month", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'        // state_personnel_auth
                                , '1'            // state_msg_receiver - mother&father
                                , '09094444444'  // state_msisdn_mother
                                , '09095555555'  // state_msisdn_household
                                // , '1'            // state_pregnancy_status - pregnant  // bypass postbirth flow
                                , '1'            // state_last_period_year
                            )
                            .check.interaction({
                                state: 'state_last_period_month'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_last_period_month_1.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                        });

                        it("should navigate back to state_last_period_month", function() {
                            return tester
                                .setup.user.addr('07030010001')
                                .inputs(
                                    {session_event: 'new'}
                                    , '1' // state_training_intro - register
                                    , '12345'           // state_personnel_auth
                                    , '1'               // state_msg_receiver - mother&father
                                    , '09095555555'     // state_msisdn_household
                                    , '09094444444'     // state_msisdn_mother
                                    // , '1'               // state_pregnancy_status - pregnant  // bypass postbirth flow
                                    , '1'               // state_last_period_year
                                    , '12'              // state_last_period_month
                                )
                                .check.interaction({
                                    state: 'state_last_period_month'
                                })
                                .check.reply.properties({
                                    helper_metadata: {
                                        voice: {
                                            speech_url: [
                                                'http://localhost:8004/api/v1/eng_NG/state_error_invalid_date.mp3',
                                                'http://localhost:8004/api/v1/eng_NG/state_last_period_month_1.mp3'
                                            ],
                                            wait_for: '#',
                                            barge_in: true
                                        }
                                    }
                                })
                                .run();
                            });
                });

                describe("if 'last year' is chosen", function() {
                    it("should navigate to state_last_period_month", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'        // state_personnel_auth
                                , '1'            // state_msg_receiver - mother&father
                                , '09094444444'  // state_msisdn_mother
                                , '09095555555'  // state_msisdn_household
                                // , '1'            // state_pregnancy_status - pregnant  // bypass postbirth flow
                                , '2'            // state_last_period_year - last year
                            )
                            .check.interaction({
                                state: 'state_last_period_month'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_last_period_month_2.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                    it("should navigate back to state_last_period_month", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'           // state_personnel_auth
                                , '1'               // state_msg_receiver - mother&father
                                , '09095555555'     // state_msisdn_household
                                , '09094444444'     // state_msisdn_mother
                                // , '1'               // state_pregnancy_status - pregnant  // bypass postbirth flow
                                , '2'               // state_last_period_year - last year
                                , '1'               // state_last_period_month - jan
                            )
                            .check.interaction({
                                state: 'state_last_period_month'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: [
                                            'http://localhost:8004/api/v1/eng_NG/state_error_invalid_date.mp3',
                                            'http://localhost:8004/api/v1/eng_NG/state_last_period_month_2.mp3'
                                        ],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                });
            });

            // baby
            // bypass postbirth flow
            describe.skip("When you enter a baby_birth year", function() {
                describe("if 'this year' chosen", function() {
                    it("should navigate to state_baby_birth_month", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'        // state_personnel_auth
                                , '1'            // state_msg_receiver - mother&father
                                , '09094444444'  // state_msisdn_mother
                                , '09095555555'  // state_msisdn_household
                                , '2'            // state_pregnancy_status - baby
                                , '1'            // state_baby_birth_year - this year
                            )
                            .check.interaction({
                                state: 'state_baby_birth_month'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_baby_birth_month_1.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                    it("should navigate back to state_baby_birth_month", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'        // state_personnel_auth
                                , '1'            // state_msg_receiver - mother&father
                                , '09094444444'  // state_msisdn_mother
                                , '09095555555'  // state_msisdn_household
                                , '2'            // state_pregnancy_status - baby
                                , '1'            // state_baby_birth_year - this year
                                , '11'           // state_baby_birth_month - nov
                            )
                            .check.interaction({
                                state: 'state_baby_birth_month'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_baby_birth_month_1.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                });

                describe("if 'last year' chosen", function() {
                    it("should navigate to state_baby_birth_month", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'        // state_personnel_auth
                                , '1'            // state_msg_receiver - mother&father
                                , '09094444444'  // state_msisdn_mother
                                , '09095555555'  // state_msisdn_household
                                , '2'            // state_pregnancy_status
                                , '2'            // state_baby_birth_year
                            )
                            .check.interaction({
                                state: 'state_baby_birth_month'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_baby_birth_month_2.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                    it("should navigate back to state_baby_birth_month", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'        // state_personnel_auth
                                , '1'            // state_msg_receiver - mother&father
                                , '09094444444'  // state_msisdn_mother
                                , '09095555555'  // state_msisdn_household
                                , '2'            // state_pregnancy_status
                                , '2'            // state_baby_birth_year
                                , '1'            // state_baby_birth_month
                            )
                            .check.interaction({
                                state: 'state_baby_birth_month'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_baby_birth_month_2.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                });
            });

            // pregnant
            describe("When you enter a last period month", function() {
                describe("if the month choice is not in valid range for this year", function() {
                    it("should navigate back to state_last_period_month", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'        // state_personnel_auth
                                , '1'            // state_msg_receiver - mother&father
                                , '09094444444'  // state_msisdn_mother
                                , '09095555555'  // state_msisdn_household
                                // , '1'            // state_pregnancy_status - pregnant  // bypass postbirth flow
                                , '1'            // state_last_period_year - this year
                                , '9'            // state_last_period_month - sep
                            )
                            .check.interaction({
                                state: 'state_last_period_month'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: [
                                            'http://localhost:8004/api/v1/eng_NG/state_error_invalid_date.mp3',
                                            'http://localhost:8004/api/v1/eng_NG/state_last_period_month_1.mp3'
                                        ],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                });
                describe("if the month choice is not in valid range for last year", function() {
                    it("should navigate back to state_last_period_month", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'        // state_personnel_auth
                                , '1'            // state_msg_receiver - mother&father
                                , '09094444444'  // state_msisdn_mother
                                , '09095555555'  // state_msisdn_household
                                // , '1'            // state_pregnancy_status - pregnant  // bypass postbirth flow
                                , '2'            // state_last_period_year - last year
                                , '3'            // state_last_period_month - mar
                            )
                            .check.interaction({
                                state: 'state_last_period_month'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: [
                                            'http://localhost:8004/api/v1/eng_NG/state_error_invalid_date.mp3',
                                            'http://localhost:8004/api/v1/eng_NG/state_last_period_month_2.mp3'
                                        ],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                });

                describe("if the month choice is valid", function() {
                    it("should navigate to state_last_period_day", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'       // state_personnel_auth
                                , '1'           // state_msg_receiver - mother&father
                                , '09094444444' // state_msisdn_mother
                                , '09095555555' // state_msisdn_household
                                // , '1'           // state_pregnancy_status - pregnant  // bypass postbirth flow
                                , '2'           // state_last_period_year - last year
                                , '12'          // state_last_period_month - dec
                            )
                            .check.interaction({
                                state: 'state_last_period_day'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_last_period_day_12.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                    it("should navigate back to state_last_period_day", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'       // state_personnel_auth
                                , '1'           // state_msg_receiver - mother&father
                                , '09094444444' // state_msisdn_mother
                                , '09095555555' // state_msisdn_household
                                // , '1'           // state_pregnancy_status - pregnant  // bypass postbirth flow
                                , '2'           // state_last_period_year - last year
                                , '10'           // state_last_period_month - oct
                                , '32'          // state_last_period_day
                            )
                            .check.interaction({
                                state: 'state_last_period_day'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: [
                                            'http://localhost:8004/api/v1/eng_NG/state_error_invalid_date.mp3',
                                            'http://localhost:8004/api/v1/eng_NG/state_last_period_day_10.mp3'
                                        ],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                    it("should navigate to state_invalid_date", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'       // state_personnel_auth
                                , '1'           // state_msg_receiver - mother&father
                                , '09094444444' // state_msisdn_mother
                                , '09095555555' // state_msisdn_household
                                // , '1'           // state_pregnancy_status - pregnant  // bypass postbirth flow
                                , '2'           // state_last_period_year - last year
                                , '11'           // state_last_period_month - nov
                                , '32'          // state_last_period_day
                                , '31'          // state_last_period_day
                            )
                            .check.interaction({
                                state: 'state_invalid_date'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_invalid_date_1.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                });
            });

            // baby
            // bypass postbirth flow
            describe.skip("When you enter a baby_birth_month", function() {
                describe("if the month choice is not in valid range for this year", function() {
                    it("should navigate back to state_baby_birth_month", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'           // state_personnel_auth
                                , '1'               // state_msg_receiver - mother&father
                                , '09094444444'     // state_msisdn_mother
                                , '09095555555'     // state_msisdn_household
                                , '2'               // state_pregnancy_status - baby
                                , '1'               // state_baby_birth_year - this year
                                , '8'               // state_baby_birth_month - aug
                            )
                            .check.interaction({
                                state: 'state_baby_birth_month'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_baby_birth_month_1.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                });

                describe("if the month choice is not in valid range for last year", function() {
                    it("should navigate back to state_baby_birth_month", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'           // state_personnel_auth
                                , '1'               // state_msg_receiver - mother&father
                                , '09094444444'     // state_msisdn_mother
                                , '09095555555'     // state_msisdn_household
                                , '2'               // state_pregnancy_status - baby
                                , '2'               // state_baby_birth_year - last year
                                , '3'               // state_baby_birth_month - mar
                            )
                            .check.interaction({
                                state: 'state_baby_birth_month'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_baby_birth_month_2.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                });

                describe("if the month choice is valid", function() {
                    it("should navigate to state_baby_birth_day", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'       // state_personnel_auth
                                , '6'           // state_msg_receiver - friend_only
                                , '09092222222' // state_msisdn
                                , '2'           // state_pregnancy_status - baby
                                , '2'           // state_baby_birth_year - last year
                                , '9'           // state_baby_birth_month - sep
                            )
                            .check.interaction({
                                state: 'state_baby_birth_day'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_baby_birth_day_9.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                    it("should navigate back to state_baby_birth_day", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'       // state_personnel_auth
                                , '6'           // state_msg_receiver - friend_only
                                , '09092222222' // state_msisdn
                                , '2'           // state_pregnancy_status - baby
                                , '2'           // state_baby_birth_year - last year
                                , '9'           // state_baby_birth_month - sep
                                , '35'          // state_baby_birth_day
                            )
                            .check.interaction({
                                state: 'state_baby_birth_day'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_baby_birth_day_9.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                    it("should navigate to state_invalid_date", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'       // state_personnel_auth
                                , '6'           // state_msg_receiver - friend_only
                                , '09092222222' // state_msisdn
                                , '2'           // state_pregnancy_status - baby
                                , '2'           // state_baby_birth_year - last year
                                , '9'           // state_baby_birth_month - sep
                                , '35'          // state_baby_birth_day
                                , '31'          // state_baby_birth_day
                            )
                            .check.interaction({
                                state: 'state_invalid_date'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_invalid_date_1.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                });
            });

            describe('capture gravida', function () {
                it('should be a valid integer', function () {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '1' // state_training_intro - register
                            , '12345'       // state_personnel_auth
                            , '6'           // state_msg_receiver - friend_only
                            , '09092222222' // state_msisdn
                            , '2'           // state_last_period_year - last year
                            , '12'           // state_last_period_month - dec
                            , '13'          // state_last_period_day
                            , 'XX'           // state_gravida - invalid
                        )
                        .check.interaction({
                            state: 'state_gravida'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: [
                                        'http://localhost:8004/api/v1/eng_NG/state_error_invalid_number.mp3',
                                        'http://localhost:8004/api/v1/eng_NG/state_gravida_1.mp3',
                                    ],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
            });

            // pregnant
            describe("when you enter a last period day", function() {
                describe("if it is an invalid day", function() {
                    it("should navigate to state_last_period_day", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'       // state_personnel_auth
                                , '6'           // state_msg_receiver - friend_only
                                , '09092222222' // state_msisdn
                                // , '1'           // state_pregnancy_status - pregnant  // bypass postbirth flow
                                , '2'           // state_last_period_year - last year
                                , '10'          // state_last_period_month - oct
                                , '32'          // state_last_period_day
                            )
                            .check.interaction({
                                state: 'state_last_period_day'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: [
                                            'http://localhost:8004/api/v1/eng_NG/state_error_invalid_date.mp3',
                                            'http://localhost:8004/api/v1/eng_NG/state_last_period_day_10.mp3'
                                        ],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                });

                describe("if it is a valid day", function() {
                    it("should navigate to state_gravida", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'       // state_personnel_auth
                                , '6'           // state_msg_receiver - friend_only
                                , '09092222222' // state_msisdn
                                // , '1'           // state_pregnancy_status - pregnant  // bypass postbirth flow
                                , '2'           // state_last_period_year - last year
                                , '10'          // state_last_period_month - oct
                                , '22'          // state_last_period_day
                            )
                            .check.interaction({
                                state: 'state_gravida'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_gravida_1.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                });

                describe("if it is a valid single-digit day", function() {
                    it("should navigate to state_gravida", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'       // state_personnel_auth
                                , '6'           // state_msg_receiver - friend_only
                                , '09092222222' // state_msisdn
                                // , '1'           // state_pregnancy_status - pregnant  // bypass postbirth flow
                                , '2'           // state_last_period_year - last year
                                , '10'          // state_last_period_month - oct
                                , '2'          // state_last_period_day
                            )
                            .check.interaction({
                                state: 'state_gravida'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_gravida_1.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                });
            });

            // bypass postbirth flow
            describe.skip("when you enter a baby birth day", function() {
                describe("if it is an invalid day", function() {
                    it("should navigate back to state_baby_birth_day", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'       // state_personnel_auth
                                , '6'           // state_msg_receiver - friend_only
                                , '09092222222' // state_msisdn
                                , '2'           // state_pregnancy_status - baby
                                , '2'           // state_baby_birth_year - last year
                                , '11'          // state_baby_birth_month - nov
                                , '32'          // state_baby_birth_day
                            )
                            .check.interaction({
                                state: 'state_baby_birth_day'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_baby_birth_day_11.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                });

                describe("if it is a valid day", function() {
                    it("should navigate to state_msg_language", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'       // state_personnel_auth
                                , '6'           // state_msg_receiver - friend_only
                                , '09092222222' // state_msisdn
                                , '2'           // state_pregnancy_status - baby
                                , '2'           // state_baby_birth_year - last year
                                , '11'          // state_baby_birth_month - nov
                                , '12'          // state_baby_birth_day
                                , '3'           // state_gravida
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
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'       // state_personnel_auth
                                , '6'           // state_msg_receiver - friend_only
                                , '09092222222' // state_msisdn
                                , '2'           // state_pregnancy_status - baby
                                , '2'           // state_baby_birth_year - last year
                                , '11'          // state_baby_birth_month - nov
                                , '0'           // state_baby_birth_day
                            )
                            .check.interaction({
                                state: 'state_msg_receiver'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_personnel_auth_1.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                            .run();
                    });
                });
            });

            describe("when you enter a gravida number", function() {
                it("3 - should navigate to state_msg_language", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '1' // state_training_intro - register
                            , '12345'       // state_personnel_auth
                            , '6'           // state_msg_receiver - friend_only
                            , '09092222222' // state_msisdn
                            // , '1'           // state_pregnancy_status - pregnant  // bypass postbirth flow
                            , '2'           // state_last_period_year - last year
                            , '10'          // state_last_period_month - oct
                            , '22'          // state_last_period_day
                            , '3'           // state_gravida
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
                it("0 - should navigate to state_personnel_auth (restart)", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '1' // state_training_intro - register
                            , '12345'       // state_personnel_auth
                            , '6'           // state_msg_receiver - friend_only
                            , '09092222222' // state_msisdn
                            // , '1'           // state_pregnancy_status - pregnant  // bypass postbirth flow
                            , '2'           // state_last_period_year - last year
                            , '10'          // state_last_period_month - oct
                            , '22'          // state_last_period_day
                            , '0'           // state_gravida
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

            describe("When you choose a language state_msg_language", function() {
                it("should navigate to state state_msg_type", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '1' // state_training_intro - register
                            , '12345'       // state_personnel_auth
                            , '6'           // state_msg_receiver - friend_only
                            , '09092222222' // state_msisdn
                            , '2'           // state_pregnancy_status - baby
                            , '2'           // state_baby_birth_year - last year
                            , '11'          // state_baby_birth_month - nov
                            , '13'          // state_baby_birth_day
                            , '2'           // state_gravida
                            , '3'           // state_msg-language - pidgin
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
                    it("should navigate to state_end_sms", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'       // state_personnel_auth
                                , '6'           // state_msg_receiver - friend_only
                                , '09092222222' // state_msisdn
                                // , '2'           // state_pregnancy_status - baby
                                // , '2'           // state_baby_birth_year - last year
                                // , '7'           // state_baby_birth_month - july
                                // , '13'          // state_baby_birth_day
                                , '2'           // state_last_period_year - last year
                                , '12'           // state_last_period_month - dec
                                , '13'          // state_last_period_day

                                , '2'           // state_gravida
                                , '3'           // state_msg_language - igbo
                                , '2'           // state_msg_type - sms
                            )
                            .check.interaction({
                                state: 'state_end_sms'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_end_sms_1.mp3'],
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
                    it("should navigate to state_voice_days", function() {
                        return tester
                            .setup.user.addr('07030010001')
                            .inputs(
                                {session_event: 'new'}
                                , '1' // state_training_intro - register
                                , '12345'       // state_personnel_auth
                                , '6'           // state_msg_receiver - friend_only
                                , '09092222222' // state_msisdn
                                // , '2'           // state_pregnancy_status - baby
                                // , '2'           // state_baby_birth_year - last year
                                // , '11'          // state_baby_birth_month - nov
                                // , '13'          // state_baby_birth_day
                                , '2'           // state_last_period_year - last year
                                , '11'          // state_last_period_month - nov
                                , '13'          // state_last_period_day

                                , '2'           // state_gravida
                                , '3'           // state_msg_language - igbo
                                , '1'           // state_msg_type - voice
                            )
                            .check.interaction({
                                state: 'state_voice_days'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_voice_days_1.mp3'],
                                        wait_for: '#',
                                        barge_in: true
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
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '1' // state_training_intro - register
                            , '12345'       // state_personnel_auth
                            , '6'           // state_msg_receiver - friend_only
                            , '09092222222' // state_msisdn
                            // , '2'           // state_pregnancy_status - baby
                            // , '2'           // state_baby_birth_year - last year
                            // , '11'          // state_baby_birth_month - nov
                            // , '13'          // state_baby_birth_day
                            , '2'           // state_last_period_year - last year
                            , '11'          // state_last_period_month - nov
                            , '13'          // state_last_period_day

                            , '2'           // state_gravida
                            , '3'           // state_msg-language - pidgin
                            , '1'           // state_msg_type - voice
                            , '1'           // state_voice_days - monday and wednesday
                        )
                        .check.interaction({
                            state: 'state_voice_times'
                        })
                        .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: ['http://localhost:8004/api/v1/eng_NG/state_voice_times_1.mp3'],
                                        wait_for: '#',
                                        barge_in: true
                                    }
                                }
                            })
                        .run();
                });
            });

            describe("When you choose a time state_voice_times", function() {
                it("should navigate to state_end_voice", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '1' // state_training_intro - register
                            , '12345'       // state_personnel_auth
                            , '6'           // state_msg_receiver - friend_only
                            , '09092222222' // state_msisdn
                            // , '2'           // state_pregnancy_status - baby
                            // , '2'           // state_baby_birth_year - last year
                            // , '9'           // state_baby_birth_month - sep
                            // , '13'          // state_baby_birth_day
                            , '2'           // state_last_period_year - last year
                            , '12'           // state_last_period_month - dec
                            , '13'          // state_last_period_day

                            , '2'           // state_gravida
                            , '3'           // state_msg_language - igbo
                            , '1'           // state_msg_type - voice
                            , '1'           // state_voice_days - mon_wed
                            , '2'           // state_voice_times - 2_5
                        )
                        .check.interaction({
                            state: 'state_end_voice'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_end_voice_3.mp3'],
                                    wait_for: '#',
                                    barge_in: false
                                }
                            }
                        })
                        .check.reply.ends_session()
                        .run();
                });

                it("should navigate to state_end_voice", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '1' // state_training_intro - register
                            , '12345'       // state_personnel_auth
                            , '6'           // state_msg_receiver - friend_only
                            , '09092222222' // state_msisdn
                            // , '2'           // state_pregnancy_status - baby
                            // , '2'           // state_baby_birth_year - last year
                            // , '9'           // state_baby_birth_month - sep
                            // , '13'          // state_baby_birth_day
                            , '2'           // state_last_period_year - last year
                            , '12'           // state_last_period_month - dec
                            , '13'          // state_last_period_day

                            , '2'           // state_gravida
                            , '3'           // state_msg_language - igbo
                            , '1'           // state_msg_type - voice
                            , '1'           // state_voice_days - mon_wed
                            , '3'           // state_voice_times - 2_5
                        )
                        .check.interaction({
                            state: 'state_end_voice'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_end_voice_5.mp3'],
                                    wait_for: '#',
                                    barge_in: false
                                }
                            }
                        })
                        .check.reply.ends_session()
                        .run();
                });
            });

            describe("Testing month validation function (is_valid_month)", function() {
                it("should return true/false if valid", function() {
                    // test data
                    var today = moment("2017-05-01");

                    var choiceMonths = [
                    // a year's range of month choices to represent user choice
                        'jan',
                        'feb',
                        'mar',
                        'apr',
                        'may',
                        'jun',
                        'jul',
                        'aug',
                        'sep',
                        'oct',
                        'nov',
                        'dec'
                    ];

                    // function call
                    var resultsForThisYearPeriod = [];
                    var resultsForLastYearPeriod = [];
                    var resultsForThisYearBaby = [];
                    var resultsForLastYearBaby = [];

                    var todayLastYear = today.clone();
                    todayLastYear.subtract('year', 1);

                    for (var i=0; i<choiceMonths.length; i++) {
                        resultsForThisYearPeriod.push(go.utils_project.is_valid_month(today, today.year(), (i+1).toString(), 10));
                        resultsForLastYearPeriod.push(go.utils_project.is_valid_month(today, todayLastYear.year(), (i+1).toString(), 10));
                        resultsForThisYearBaby.push(go.utils_project.is_valid_month(today, today.year(), (i+1).toString(), 13));
                        resultsForLastYearBaby.push(go.utils_project.is_valid_month(today, todayLastYear.year(), (i+1).toString(), 13));
                    }

                    // expected results
                    assert.equal(resultsForThisYearPeriod.length, 12);
                    assert.equal(resultsForThisYearPeriod[0], true);      // jan
                    assert.equal(resultsForThisYearPeriod[1], true);      // feb
                    assert.equal(resultsForThisYearPeriod[2], true);      // mar
                    assert.equal(resultsForThisYearPeriod[3], true);      // apr
                    assert.equal(resultsForThisYearPeriod[4], true);      // may
                    assert.equal(resultsForThisYearPeriod[5], false);     // jun
                    assert.equal(resultsForThisYearPeriod[6], false);     // jul
                    assert.equal(resultsForThisYearPeriod[7], false);     // aug
                    assert.equal(resultsForThisYearPeriod[8], false);     // sep
                    assert.equal(resultsForThisYearPeriod[9], false);     // oct
                    assert.equal(resultsForThisYearPeriod[10], false);    // nov
                    assert.equal(resultsForThisYearPeriod[11], false);    // dec

                    assert.equal(resultsForLastYearPeriod.length, 12);
                    assert.equal(resultsForLastYearPeriod[0], false);     // jan
                    assert.equal(resultsForLastYearPeriod[1], false);     // feb
                    assert.equal(resultsForLastYearPeriod[2], false);     // mar
                    assert.equal(resultsForLastYearPeriod[3], false);     // apr
                    assert.equal(resultsForLastYearPeriod[4], false);     // may
                    assert.equal(resultsForLastYearPeriod[5], false);     // jun
                    assert.equal(resultsForLastYearPeriod[6], false);      // jul
                    assert.equal(resultsForLastYearPeriod[7], true);      // aug
                    assert.equal(resultsForLastYearPeriod[8], true);      // sep
                    assert.equal(resultsForLastYearPeriod[9], true);      // oct
                    assert.equal(resultsForLastYearPeriod[10], true);     // nov
                    assert.equal(resultsForLastYearPeriod[11], true);     // dec

                    assert.equal(resultsForThisYearBaby.length, 12);
                    assert.equal(resultsForThisYearBaby[0], true);      // jan
                    assert.equal(resultsForThisYearBaby[1], true);      // feb
                    assert.equal(resultsForThisYearBaby[2], true);      // mar
                    assert.equal(resultsForThisYearBaby[3], true);      // apr
                    assert.equal(resultsForThisYearBaby[4], true);      // may
                    assert.equal(resultsForThisYearBaby[5], false);     // jun
                    assert.equal(resultsForThisYearBaby[6], false);     // jul
                    assert.equal(resultsForThisYearBaby[7], false);     // aug
                    assert.equal(resultsForThisYearBaby[8], false);     // sep
                    assert.equal(resultsForThisYearBaby[9], false);     // oct
                    assert.equal(resultsForThisYearBaby[10], false);    // nov
                    assert.equal(resultsForThisYearBaby[11], false);    // dec

                    assert.equal(resultsForLastYearBaby.length, 12);
                    assert.equal(resultsForLastYearBaby[0], false);     // jan
                    assert.equal(resultsForLastYearBaby[1], false);     // feb
                    assert.equal(resultsForLastYearBaby[2], false);     // mar
                    assert.equal(resultsForLastYearBaby[3], false);      // apr
                    assert.equal(resultsForLastYearBaby[4], true);      // may
                    assert.equal(resultsForLastYearBaby[5], true);      // jun
                    assert.equal(resultsForLastYearBaby[6], true);      // jul
                    assert.equal(resultsForLastYearBaby[7], true);      // aug
                    assert.equal(resultsForLastYearBaby[8], true);      // sep
                    assert.equal(resultsForLastYearBaby[9], true);      // oct
                    assert.equal(resultsForLastYearBaby[10], true);     // nov
                    assert.equal(resultsForLastYearBaby[11], true);     // dec

                });
                it("should return true/false if valid - for month of december as boundary case", function() {
                    // test data
                    var today = moment("2017-12-01");

                    var choiceMonths = [
                    // a year's range of month choices to represent user choice
                        'jan',
                        'feb',
                        'mar',
                        'apr',
                        'may',
                        'jun',
                        'jul',
                        'aug',
                        'sep',
                        'oct',
                        'nov',
                        'dec'
                    ];

                    // function call
                    var resultsForThisYearPeriod = [];
                    var resultsForLastYearPeriod = [];
                    var resultsForThisYearBaby = [];
                    var resultsForLastYearBaby = [];

                    var todayLastYear = today.clone();
                    todayLastYear.subtract('year', 1);

                    for (var i=0; i<choiceMonths.length; i++) {
                        resultsForThisYearPeriod.push(go.utils_project.is_valid_month(today, today.year(), (i+1).toString(), 10));
                        resultsForLastYearPeriod.push(go.utils_project.is_valid_month(today, todayLastYear.year(), (i+1).toString(), 10));
                        resultsForThisYearBaby.push(go.utils_project.is_valid_month(today, today.year(), (i+1).toString(), 13));
                        resultsForLastYearBaby.push(go.utils_project.is_valid_month(today, todayLastYear.year(), (i+1).toString(), 13));
                    }

                    // expected results
                    assert.equal(resultsForThisYearPeriod.length, 12);
                    assert.equal(resultsForThisYearPeriod[0], false);    // jan
                    assert.equal(resultsForThisYearPeriod[1], false);     // feb
                    assert.equal(resultsForThisYearPeriod[2], true);     // mar
                    assert.equal(resultsForThisYearPeriod[3], true);     // apr
                    assert.equal(resultsForThisYearPeriod[4], true);     // may
                    assert.equal(resultsForThisYearPeriod[5], true);     // jun
                    assert.equal(resultsForThisYearPeriod[6], true);     // jul
                    assert.equal(resultsForThisYearPeriod[7], true);     // aug
                    assert.equal(resultsForThisYearPeriod[8], true);     // sep
                    assert.equal(resultsForThisYearPeriod[9], true);     // oct
                    assert.equal(resultsForThisYearPeriod[10], true);    // nov
                    assert.equal(resultsForThisYearPeriod[11], true);    // dec

                    assert.equal(resultsForLastYearPeriod.length, 12);
                    assert.equal(resultsForLastYearPeriod[0], false);     // jan
                    assert.equal(resultsForLastYearPeriod[1], false);     // feb
                    assert.equal(resultsForLastYearPeriod[2], false);     // mar
                    assert.equal(resultsForLastYearPeriod[3], false);     // apr
                    assert.equal(resultsForLastYearPeriod[4], false);     // may
                    assert.equal(resultsForLastYearPeriod[5], false);     // jun
                    assert.equal(resultsForLastYearPeriod[6], false);     // jul
                    assert.equal(resultsForLastYearPeriod[7], false);     // aug
                    assert.equal(resultsForLastYearPeriod[8], false);     // sep
                    assert.equal(resultsForLastYearPeriod[9], false);     // oct
                    assert.equal(resultsForLastYearPeriod[10], false);    // nov
                    assert.equal(resultsForLastYearPeriod[11], false);    // dec

                    assert.equal(resultsForThisYearBaby.length, 12);
                    assert.equal(resultsForThisYearBaby[0], true);     // jan
                    assert.equal(resultsForThisYearBaby[1], true);     // feb
                    assert.equal(resultsForThisYearBaby[2], true);     // mar
                    assert.equal(resultsForThisYearBaby[3], true);     // apr
                    assert.equal(resultsForThisYearBaby[4], true);     // may
                    assert.equal(resultsForThisYearBaby[5], true);     // jun
                    assert.equal(resultsForThisYearBaby[6], true);     // jul
                    assert.equal(resultsForThisYearBaby[7], true);     // aug
                    assert.equal(resultsForThisYearBaby[8], true);     // sep
                    assert.equal(resultsForThisYearBaby[9], true);     // oct
                    assert.equal(resultsForThisYearBaby[10], true);    // nov
                    assert.equal(resultsForThisYearBaby[11], true);    // dec

                    assert.equal(resultsForLastYearBaby.length, 12);
                    assert.equal(resultsForLastYearBaby[0], false);     // jan
                    assert.equal(resultsForLastYearBaby[1], false);     // feb
                    assert.equal(resultsForLastYearBaby[2], false);     // mar
                    assert.equal(resultsForLastYearBaby[3], false);     // apr
                    assert.equal(resultsForLastYearBaby[4], false);     // may
                    assert.equal(resultsForLastYearBaby[5], false);     // jun
                    assert.equal(resultsForLastYearBaby[6], false);     // jul
                    assert.equal(resultsForLastYearBaby[7], false);     // aug
                    assert.equal(resultsForLastYearBaby[8], false);     // sep
                    assert.equal(resultsForLastYearBaby[9], false);     // oct
                    assert.equal(resultsForLastYearBaby[10], false);     // nov
                    assert.equal(resultsForLastYearBaby[11], true);     // dec

                });
            });
        });

        describe("CHANGE", function() {
            // TEST RESTART

            describe("Restart('0') and replay('*') testing", function() {
                it("'0' should restart to main_menu", function() {
                    return tester
                        .setup.user.addr('+2345059991111')
                        .inputs(
                            {session_event: 'new'}
                            , '2'  // state_training_intro - change
                            , '1'  // state_set_language - english
                            , '05059992222' // state_msg_receiver_msisdn
                            , '1'  // state_main_menu - baby
                            , '0'  // state_baby_confirm_subscription - restart
                        )
                        .check.interaction({
                            state: 'state_main_menu'
                        })
                        .run();
                });
                it("'*' should repeat message", function() {
                    return tester
                        .setup.user.addr('+2345059991111')
                        .inputs(
                            {session_event: 'new'}
                            , '2'  // state_training_intro - change
                            , '1'  // state_set_language - english
                            , '05059992222' // state_msg_receiver_msisdn
                            , '1'  // state_main_menu - baby
                            , '*'  // state_baby_confirm_subscription - repeat
                        )
                        .check.interaction({
                            state: 'state_baby_confirm_subscription'
                        })
                        .run();
                });
            });

            // TEST START ROUTING

            describe("Start of session", function() {
                it("to state_set_language", function() {
                    return tester
                        .setup.user.addr('+2345059991111')
                        .inputs(
                            {session_event: 'new'}
                            , '2'  // state_training_intro - change
                        )
                        .check.interaction({
                            state: 'state_set_language'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_set_language_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .check.user.properties({lang: 'eng_NG'})
                        .check(function(api) {
                            go.utils.check_fixtures_used(api, [0]);
                        })
                        .run();
                });
            });


            // TEST CHANGE FLOW

            describe("Flow to main menu", function() {
                it("to state_msg_receiver_msisdn (retry) when crummy number", function() {
                    return tester
                        .setup.user.addr('+2345059992222')
                        .inputs(
                            {session_event: 'new'}
                            , '2'  // state_training_intro - change
                            , '2'  // state_set_language - igbo
                            , '5551234'  // msg_receiver_msisdn
                        )
                        .check.interaction({
                            state: 'state_msg_receiver_msisdn'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: [
                                        'http://localhost:8004/api/v1/ibo_NG/state_error_invalid_number.mp3',
                                        'http://localhost:8004/api/v1/ibo_NG/state_msg_receiver_msisdn_1.mp3'
                                    ],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
                it("should not restart, preventing skipping ahead to main_menu state", function() {
                    // state_msg_receiver_msisdn is a no-restart state (listed in
                    // the no_restart_states in utils function should_restart)
                    return tester
                        .setup.user.addr('+2345059992222')
                        .inputs(
                            {session_event: 'new'}
                            , '2'  // state_training_intro - change
                            , '2'  // state_set_language - igbo
                            , '5551234'  // state_msg_receiver_msisdn
                            , '0'  // state_msg_receiver_msisdn - restart
                        )
                        .check.interaction({
                            state: 'state_msg_receiver_msisdn'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: [
                                        'http://localhost:8004/api/v1/ibo_NG/state_error_invalid_number.mp3',
                                        'http://localhost:8004/api/v1/ibo_NG/state_msg_receiver_msisdn_1.mp3'
                                    ],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
                it("should repeat state_msg_receiver_msisdn (not in retry state)", function() {
                    return tester
                        .setup.user.addr('+2345059992222')
                        .inputs(
                            {session_event: 'new'}
                            , '2'  // state_training_intro - change
                            , '2'  // state_set_language - igbo
                            , '5551234'  // state_msg_receiver_msisdn
                            , '*'   // state_msg_receiver_msisdn - repeat
                        )
                        .check.interaction({
                            state: 'state_msg_receiver_msisdn'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: [
                                        'http://localhost:8004/api/v1/ibo_NG/state_error_invalid_number.mp3',
                                        'http://localhost:8004/api/v1/ibo_NG/state_msg_receiver_msisdn_1.mp3'
                                    ],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
                it("should navigate to main_menu (registered user)", function() {
                    return tester
                        .setup.user.addr('+2345059991111')
                        .inputs(
                            {session_event: 'new'}
                            , '2'  // state_training_intro - change
                            , '2'  // state_set_language - igbo
                            , '05059992222'  // msg_receiver_msisdn
                        )
                        .check.interaction({
                            state: 'state_main_menu'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_main_menu_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
            });

            describe("Flow from main menu - baby messages", function() {
                it("to state_baby_confirm_subscription", function() {
                    return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '3'  // state_set_language - pidgin
                        , '05059992222'  // msg_receiver_msisdn
                        , '1'  // main_menu - baby
                    )
                    .check.interaction({
                        state: 'state_baby_confirm_subscription'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_baby_confirm_subscription_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
                });
                it("to state_end_baby", function() {
                    return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '3'  // state_set_language - pidgin
                        , '05059992222'  // msg_receiver_msisdn
                        , '1'  // main_menu - baby
                        , '1'  // state_baby_confirm_subscription
                    )
                    .check.interaction({
                        state: 'state_end_baby'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_end_baby_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
            });

            describe("Flow from main menu - message preferences", function() {
                it("to state_change_menu_sms", function() {
                    return tester
                        .setup.user.addr('+07070050005')
                        .inputs(
                            {session_event: 'new'}
                            , '2'  // state_training_intro - change
                            , '3'  // state_set_language - pidgin
                            , '05059992222'  // msg_receiver_msisdn
                            , '2'  // main_menu - msg_pref
                        )
                        .check.interaction({
                            state: 'state_change_menu_sms'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_change_menu_sms_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
                it("to state_change_voice_days", function() {
                    return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '3'  // state_set_language - pidgin
                        , '05059992222'  // msg_receiver_msisdn
                        , '2'  // main_menu - msg_pref
                        , '1'  // state_change_menu_sms - change text to voice
                    )
                    .check.interaction({
                        state: 'state_change_voice_days'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_change_voice_days_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
                });
                it("to state_change_voice_times", function() {
                    return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '3'  // state_set_language - pidgin
                        , '05059992222'  // msg_receiver_msisdn
                        , '2'  // main_menu - msg_pref
                        , '1'  // state_change_menu_sms - change text to voice
                        , '1'  // state_change_voice_days - Mon & Wed
                    )
                    .check.interaction({
                        state: 'state_change_voice_times'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_change_voice_times_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
                });
                it("to state_end_voice_confirm", function() {
                    return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '3'  // state_set_language - pidgin
                        , '05059992222'  // msg_receiver_msisdn
                        , '2'  // main_menu - msg_pref
                        , '1'  // state_change_menu_sms - change text to voice
                        , '2'  // state_voice_days - Tue & Thu
                        , '1'  // state_change_voice_times - 9-11am
                    )
                    .check.interaction({
                        state: 'state_end_voice_confirm'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_end_voice_confirm_2.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
            });

            describe("Flow from main menu - change number", function() {
                it("to state_new_msisdn", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '1'  // state_set_language - english
                        , '05059992222' // state_msg_receiver_msisdn
                        , '3'           // state_main_menu - number
                    )
                    .check.interaction({
                        state: 'state_new_msisdn'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/eng_NG/state_new_msisdn_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
                });
                it("case 1 > to state_new_msisdn (invalid number)", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '1'  // state_set_language - english
                        , '05059992222' // state_msg_receiver_msisdn
                        , '3'           // state_main_menu - number
                        , '54321'       // state_new_msisdn
                    )
                    .check.interaction({
                        state: 'state_new_msisdn'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: [
                                    'http://localhost:8004/api/v1/eng_NG/state_error_invalid_number.mp3',
                                    'http://localhost:8004/api/v1/eng_NG/state_new_msisdn_1.mp3'
                                ],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
                });
                it("case 1 > to state_end_new_msisdn", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '1'  // state_set_language - english
                        , '05059992222' // state_msg_receiver_msisdn
                        , '3'           // state_main_menu - number
                        , '05059998888'  // state_new_msisdn
                    )
                    .check.interaction({
                        state: 'state_end_new_msisdn'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/eng_NG/state_end_new_msisdn_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
            });

            describe("Flow from main menu - change language", function() {
                it("should navigate to state_change_msg_language", function() {
                    return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '1'  // state_set_language - english
                        , '05059992222' // state_msg_receiver_msisdn
                        , '4'           // state_main_menu - language
                    )
                    .check.interaction({
                        state: 'state_change_msg_language'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/eng_NG/state_change_msg_language_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check.user.properties({lang: 'eng_NG'})
                    .run();
                });
                it("to state_end_msg_language", function() {
                    return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '1'  // state_set_language - english
                        , '05059992222' // state_msg_receiver_msisdn
                        , '4'           // state_main_menu - language
                        , '3'   // state_change_msg_language - pidgin
                    )
                    .check.interaction({
                        state: 'state_end_msg_language_confirm'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_end_msg_language_confirm_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check.user.properties({lang: 'pcm_NG'})
                    .run();
                });
            });

            describe("Flow from main menu - optout", function() {
                // to optout menu
                it("to state_optout_reason", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '1'  // state_set_language - english
                        , '05059992222'  // msg_receiver_msisdn
                        , '5'  // state_main_menu - optout
                    )
                    .check.interaction({
                        state: 'state_optout_reason'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/eng_NG/state_optout_reason_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
                });
                // 1 - miscarriage
                it("miscarriage; to state_loss_subscription", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '1'  // state_set_language - english
                        , '05059992222'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '1'  // optout_reason - miscarriage
                    )
                    .check.interaction({
                        state: 'state_loss_subscription'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/eng_NG/state_loss_subscription_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
                });
                // 1, 1 - miscarriage, yes
                it("loss messagages opt-in; to state_end_loss_subscription_confirm", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '1'  // state_set_language - english
                        , '05059992222'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '1'  // optout_reason - miscarriage
                        , '1'  // loss_opt_in - confirm opt in
                    )
                    .check.interaction({
                        state: 'state_end_loss_subscription_confirm'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/eng_NG/state_end_loss_subscription_confirm_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check.reply.ends_session()
                    .run();
                });
                // 1, 2 - miscarriage, no
                it("loss messages opt-out; to state_end_loss (miscarriage)", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '1'  // state_set_language - english
                        , '05059992222'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '1'  // optout_reason - miscarriage
                        , '2'  // state_loss_subscription - no
                    )
                    .check.interaction({
                        state: 'state_end_loss'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/eng_NG/state_end_loss_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check.reply.ends_session()
                    .run();
                });
                // 2 - stillborn
                it("to state_end_loss (stillborn)", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '1'  // state_set_language - english
                        , '05059992222'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '2'  // optout_reason - stillborn
                    )
                    .check.interaction({
                        state: 'state_end_loss'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/eng_NG/state_end_loss_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // 3 - baby passed away
                it("to state_end_loss (baby death)", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '1'  // state_set_language - english
                        , '05059992222'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '3'  // optout_reason - baby_died
                    )
                    .check.interaction({
                        state: 'state_end_loss'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/eng_NG/state_end_loss_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // 4 - not useful
                it("to state_optout_receiver", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '1'  // state_set_language - english
                        , '05059992222'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '4'  // optout_reason - not_useful
                    )
                    .check.interaction({
                        state: 'state_optout_receiver'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/eng_NG/state_optout_receiver_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
                });
                // 4, 1 - not useful, mother
                it("to state_end_optout", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '1'  // state_set_language - english
                        , '05059992222'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '4'  // optout_reason - not_useful
                        , '1'  // state_optout_receiver - mother
                    )
                    .check.interaction({
                        state: 'state_end_optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/eng_NG/state_end_optout_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });

                it("0 should restart", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '2'  // state_training_intro - change
                        , '1'  // state_set_language - english
                        , '05059992222'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '1'  // optout_reason - miscarriage
                        , '0'  // loss_opt_in - restart attempt
                    )
                    .check.interaction({
                        state: 'state_main_menu'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/eng_NG/state_main_menu_1.mp3'],
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
