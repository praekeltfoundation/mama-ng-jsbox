var vumigo = require('vumigo_v02');
var moment = require('moment');
var assert = require('assert');
var fixtures = require('./fixtures_registration');
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
                    services: {
                        identities: {
                            api_token: 'test_token_identities',
                            url: "http://localhost:8001/api/v1/"
                        },
                        registrations: {
                            api_token: 'test_token_registrations',
                            url: "http://localhost:8002/api/v1/"
                        },
                        voice_content: {
                            api_token: "test_token_voice_content",
                            url: "http://localhost:8004/api/v1/"
                        },
                    }
                })
                .setup(function(api) {
                    fixtures().forEach(function(d) {
                        api.http.fixtures.add(d);
                    });
                })
                ;
        });


        // TEST ANSWER RESET

        describe("When you go back to the main menu", function() {
            it("should reset the user answers", function() {
                return tester
                    .setup.user.addr('07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '12345',        // state_personnel_auth
                        '*'
                    )
                    .check.interaction({
                        state: 'state_personnel_auth',
                        reply: 'Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345'
                    })
                    .check.user.answers(
                        {"user_id": "cb245673-aa41-4302-ac47-00000000001"})
                    .run();
            });
        });

        // TEST REGISTRATION FLOW

        describe("When you start the app", function() {
            describe("if the user is a registered healthworker (has personnel code)", function() {
                it("should navigate to state_msg_receiver", function() {
                    return tester
                        .setup.user.addr('08080070007')
                        .inputs(
                            {session_event: 'new'}
                        )
                        .check.interaction({
                            state: 'state_msg_receiver',
                            reply: [
                                'Choose message receiver',
                                "1. Mother & Father",
                                "2. Mother",
                                "3. Father",
                                "4. Mother & family member",
                                "5. Mother & friend",
                                "6. Friend",
                                "7. Family member"
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_msg_receiver_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });
            describe("if the user is not a registered healthworker", function() {
                it("should navigate to state_personnel_auth", function() {
                    return tester
                        .setup.user.addr('07030010001')
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
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_personnel_auth_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });
        });

        describe("Entering a personnel (chew) code", function() {
            describe("if code validates", function() {
                it("should navigate to state_msg_receiver", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '12345'  // state_personnel_auth
                        )
                        .check.interaction({
                            state: 'state_msg_receiver',
                            reply: [
                                'Choose message receiver',
                                "1. Mother & Father",
                                "2. Mother",
                                "3. Father",
                                "4. Mother & family member",
                                "5. Mother & friend",
                                "6. Friend",
                                "7. Family member"
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_msg_receiver_1.mp3',
                                    wait_for: '#'
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
                            , 'aaaaa'  // state_personnel_auth
                        )
                        .check.interaction({
                            state: 'state_personnel_auth',
                            reply: 'Sorry, that is not a valid number. Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_personnel_auth_1_retry.mp3',
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
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            ,'aaaaa'  // state_personnel_auth
                            ,'aaaaa'  // state_personnel_auth
                        )
                        .check.interaction({
                            state: 'state_personnel_auth',
                            reply: 'Sorry, that is not a valid number. Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_personnel_auth_1_retry.mp3',
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
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            ,'aaaaa'  // state_personnel_auth
                            ,'*'      // state_personnel_auth
                        )
                        .check.interaction({
                            state: 'state_personnel_auth',
                            reply: 'Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_personnel_auth_1.mp3',
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
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            ,'aaaaa'  // state_personnel_auth
                            ,'12345'  // state_personnel_auth
                        )
                        .check.interaction({
                            state: 'state_msg_receiver',
                            reply: [
                                'Choose message receiver',
                                "1. Mother & Father",
                                "2. Mother",
                                "3. Father",
                                "4. Mother & family member",
                                "5. Mother & friend",
                                "6. Friend",
                                "7. Family member"
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_msg_receiver_1.mp3',
                                    wait_for: '#'
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
                            , '12345'  // state_personnel_auth
                            , '1'      // state_msg_receiver - mother & father
                        )
                        .check.interaction({
                            state: 'state_msisdn_mother',
                            reply: 'Please enter number (Mother)'
                        })
                        .run();
                });
                it("to state_msisdn_mother", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'   // state_personnel_auth
                            , '1'       // state_msg_receiver - mother & father
                            , '12345'   // state_msisdn_mother
                        )
                        .check.interaction({
                            state: 'state_msisdn_mother',
                            reply: 'Sorry, invalid input. Please enter number (Mother)'
                        })
                        .run();
                });
                it("to state_msisdn_household (father message receiver)", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_personnel_auth
                            , '1'            // state_msg_receiver - mother & father
                            , '09094444444'  // state_msisdn_mother
                        )
                        .check.interaction({
                            state: 'state_msisdn_household',
                            reply: "Please enter the father's number"
                        })
                        .run();
                });
                it("to state_msisdn_household (family member message receiver)", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_personnel_auth
                            , '4'            // state_msg_receiver - mother & family member
                            , '09094444444'  // state_msisdn_mother
                        )
                        .check.interaction({
                            state: 'state_msisdn_household',
                            reply: "Please enter the family member's number"
                        })
                        .run();
                });
                it("to state_msisdn_household (friend message receiver)", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_personnel_auth
                            , '5'            // state_msg_receiver - mother & friend
                            , '09094444444'  // state_msisdn_mother
                        )
                        .check.interaction({
                            state: 'state_msisdn_household',
                            reply: "Please enter the friend's number"
                        })
                        .run();
                });
                it("to state_msisdn_household", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_personnel_auth
                            , '1'            // state_msg_receiver - mother & father
                            , '09094444444'  // state_msisdn_mother
                            , '08020002'     // state_msisdn_household
                        )
                        .check.interaction({
                            state: 'state_msisdn_household',
                            reply: "Sorry, invalid input. Please enter the father's number"
                        })
                        .run();
                });
                it("to state_pregnancy_status", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_personnel_auth
                            , '1'            // state_msg_receiver - mother & father
                            , '09094444444'  // state_msisdn_mother
                            , '09095555555'  // state_msisdn_household
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
                it("to state_msisdn", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'  // state_personnel_auth
                            , '7'      // state_msg_receiver - family member
                        )
                        .check.interaction({
                            state: 'state_msisdn',
                            reply: 'Please enter number'
                        })
                        .run();
                });
                it("to state_msisdn", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'     // state_personnel_auth
                            , '7'         // state_msg_receiver - family member
                            , '08567898'  // state_msisdn
                        )
                        .check.interaction({
                            state: 'state_msisdn',
                            reply: 'Sorry, invalid input. Please enter number'
                        })
                        .run();
                });
                it("to state_pregnancy_status (via st-03)", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_personnel_auth
                            , '7'            // state_msg_receiver - family member
                            , '09092222222'  // state_msisdn
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
                it("to state_pregnancy_status (via retry state st-16)", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_personnel_auth
                            , '7'            // state_msg_receiver - family member
                            , 'a45521'       // state_msisdn
                            , '09092222222'  // state_msisdn
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
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_personnel_auth
                            , '1'            // state_msg_receiver - mother&father
                            , '09094444444'  // state_msisdn_mother
                            , '09095555555'  // state_msisdn_household
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
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_pregnancy_status_1.mp3',
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
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '12345'  // state_personnel_auth
                            , '*'    // state_msg_receiver - restart
                        )
                        .check.interaction({
                            state: 'state_personnel_auth',
                            reply: 'Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_personnel_auth_1.mp3',
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
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '12345'
                            , '8'  // state_msg_receiver - invalid choice
                        )
                        .check.interaction({
                            state: 'state_msg_receiver',
                            reply: [
                                'Choose message receiver',
                                "1. Mother & Father",
                                "2. Mother",
                                "3. Father",
                                "4. Mother & family member",
                                "5. Mother & friend",
                                "6. Friend",
                                "7. Family member"
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_msg_receiver_1.mp3',
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
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_personnel_auth
                            , '1'            // state_msg_receiver - mother&father
                            , '09094444444'  // state_msisdn_mother
                            , '09095555555'  // state_msisdn_household
                            , '1'            // state_pregnancy_status
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
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_last_period_year_1.mp3',
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
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_personnel_auth
                            , '1'            // state_msg_receiver - mother&father
                            , '09094444444'  // state_msisdn_mother
                            , '09095555555'  // state_msisdn_household
                            , '2'            // state_pregnancy_status - baby
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
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_baby_birth_year_1.mp3',
                                    wait_for: '#'
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
                            , '12345'        // state_personnel_auth
                            , '1'            // state_msg_receiver - mother&father
                            , '09094444444'  // state_msisdn_mother
                            , '09095555555'  // state_msisdn_household
                            , '1'            // state_pregnancy_status - pregnant
                            , '1'            // state_last_period_year
                        )
                        .check.interaction({
                            state: 'state_last_period_month',
                            reply: [
                                'Period month this/last year?',
                                '1. January',
                                '2. February',
                                '3. March',
                                '4. April',
                                '5. May',
                                '6. June',
                                '7. July',
                                '8. August',
                                '9. September',
                                '10. October',
                                '11. November',
                                '12. December'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_last_period_month_1.mp3',
                                    wait_for: '#'
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
                                , '12345'           // state_personnel_auth
                                , '1'               // state_msg_receiver - mother&father
                                , '09095555555'     // state_msisdn_household
                                , '09094444444'     // state_msisdn_mother
                                , '1'               // state_pregnancy_status - pregnant
                                , '1'               // state_last_period_year
                                , '12'              // state_last_period_month
                            )
                            .check.interaction({
                                state: 'state_last_period_month',
                                reply: [
                                    'Retry. Period month this/last year?',
                                    '1. January',
                                    '2. February',
                                    '3. March',
                                    '4. April',
                                    '5. May',
                                    '6. June',
                                    '7. July',
                                    '8. August',
                                    '9. September',
                                    '10. October',
                                    '11. November',
                                    '12. December'
                                ].join('\n')
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: 'http://localhost:8004/api/v1/eng_NG/state_last_period_month_1_retry.mp3',
                                        wait_for: '#'
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
                            , '12345'        // state_personnel_auth
                            , '1'            // state_msg_receiver - mother&father
                            , '09094444444'  // state_msisdn_mother
                            , '09095555555'  // state_msisdn_household
                            , '1'            // state_pregnancy_status - pregnant
                            , '2'            // state_last_period_year - last year
                        )
                        .check.interaction({
                            state: 'state_last_period_month',
                            reply: [
                                'Period month this/last year?',
                                '1. January',
                                '2. February',
                                '3. March',
                                '4. April',
                                '5. May',
                                '6. June',
                                '7. July',
                                '8. August',
                                '9. September',
                                '10. October',
                                '11. November',
                                '12. December'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_last_period_month_2.mp3',
                                    wait_for: '#'
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
                            , '12345'           // state_personnel_auth
                            , '1'               // state_msg_receiver - mother&father
                            , '09095555555'     // state_msisdn_household
                            , '09094444444'     // state_msisdn_mother
                            , '1'               // state_pregnancy_status - pregnant
                            , '2'               // state_last_period_year - last year
                            , '1'               // state_last_period_month - jan
                        )
                        .check.interaction({
                            state: 'state_last_period_month',
                            reply: [
                                'Retry. Period month this/last year?',
                                '1. January',
                                '2. February',
                                '3. March',
                                '4. April',
                                '5. May',
                                '6. June',
                                '7. July',
                                '8. August',
                                '9. September',
                                '10. October',
                                '11. November',
                                '12. December'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_last_period_month_2_retry.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });
        });

        // baby
        describe("When you enter a baby_birth year", function() {
            describe("if 'this year' chosen", function() {
                it("should navigate to state_baby_birth_month", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_personnel_auth
                            , '1'            // state_msg_receiver - mother&father
                            , '09094444444'  // state_msisdn_mother
                            , '09095555555'  // state_msisdn_household
                            , '2'            // state_pregnancy_status - baby
                            , '1'            // state_baby_birth_year - this year
                        )
                        .check.interaction({
                            state: 'state_baby_birth_month',
                            reply: [
                                'Birth month this/last year?',
                                '1. January',
                                '2. February',
                                '3. March',
                                '4. April',
                                '5. May',
                                '6. June',
                                '7. July',
                                '8. August',
                                '9. September',
                                '10. October',
                                '11. November',
                                '12. December'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_baby_birth_month_1.mp3',
                                    wait_for: '#'
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
                            , '12345'        // state_personnel_auth
                            , '1'            // state_msg_receiver - mother&father
                            , '09094444444'  // state_msisdn_mother
                            , '09095555555'  // state_msisdn_household
                            , '2'            // state_pregnancy_status - baby
                            , '1'            // state_baby_birth_year - this year
                            , '11'           // state_baby_birth_month - nov
                        )
                        .check.interaction({
                            state: 'state_baby_birth_month',
                            reply: [
                                'Retry. Birth month this/last year?',
                                '1. January',
                                '2. February',
                                '3. March',
                                '4. April',
                                '5. May',
                                '6. June',
                                '7. July',
                                '8. August',
                                '9. September',
                                '10. October',
                                '11. November',
                                '12. December'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_baby_birth_month_1_retry.mp3',
                                    wait_for: '#'
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
                            , '12345'        // state_personnel_auth
                            , '1'            // state_msg_receiver - mother&father
                            , '09094444444'  // state_msisdn_mother
                            , '09095555555'  // state_msisdn_household
                            , '2'            // state_pregnancy_status
                            , '2'            // state_baby_birth_year
                        )
                        .check.interaction({
                            state: 'state_baby_birth_month',
                            reply: [
                                'Birth month this/last year?',
                                '1. January',
                                '2. February',
                                '3. March',
                                '4. April',
                                '5. May',
                                '6. June',
                                '7. July',
                                '8. August',
                                '9. September',
                                '10. October',
                                '11. November',
                                '12. December'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_baby_birth_month_2.mp3',
                                    wait_for: '#'
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
                            , '12345'        // state_personnel_auth
                            , '1'            // state_msg_receiver - mother&father
                            , '09094444444'  // state_msisdn_mother
                            , '09095555555'  // state_msisdn_household
                            , '2'            // state_pregnancy_status
                            , '2'            // state_baby_birth_year
                            , '1'            // state_baby_birth_month
                        )
                        .check.interaction({
                            state: 'state_baby_birth_month',
                            reply: [
                                'Retry. Birth month this/last year?',
                                '1. January',
                                '2. February',
                                '3. March',
                                '4. April',
                                '5. May',
                                '6. June',
                                '7. July',
                                '8. August',
                                '9. September',
                                '10. October',
                                '11. November',
                                '12. December'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_baby_birth_month_2_retry.mp3',
                                    wait_for: '#'
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
                            , '12345'        // state_personnel_auth
                            , '1'            // state_msg_receiver - mother&father
                            , '09094444444'  // state_msisdn_mother
                            , '09095555555'  // state_msisdn_household
                            , '1'            // state_pregnancy_status - pregnant
                            , '1'            // state_last_period_year - this year
                            , '9'            // state_last_period_month - sep
                        )
                        .check.interaction({
                            state: 'state_last_period_month',
                            reply: [
                                'Retry. Period month this/last year?',
                                '1. January',
                                '2. February',
                                '3. March',
                                '4. April',
                                '5. May',
                                '6. June',
                                '7. July',
                                '8. August',
                                '9. September',
                                '10. October',
                                '11. November',
                                '12. December'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_last_period_month_1_retry.mp3',
                                    wait_for: '#'
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
                            , '12345'        // state_personnel_auth
                            , '1'            // state_msg_receiver - mother&father
                            , '09094444444'  // state_msisdn_mother
                            , '09095555555'  // state_msisdn_household
                            , '1'            // state_pregnancy_status - pregnant
                            , '2'            // state_last_period_year - last year
                            , '3'            // state_last_period_month - mar
                        )
                        .check.interaction({
                            state: 'state_last_period_month',
                            reply: [
                                'Retry. Period month this/last year?',
                                '1. January',
                                '2. February',
                                '3. March',
                                '4. April',
                                '5. May',
                                '6. June',
                                '7. July',
                                '8. August',
                                '9. September',
                                '10. October',
                                '11. November',
                                '12. December'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_last_period_month_2_retry.mp3',
                                    wait_for: '#'
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
                            , '12345'       // state_personnel_auth
                            , '1'           // state_msg_receiver - mother&father
                            , '09094444444' // state_msisdn_mother
                            , '09095555555' // state_msisdn_household
                            , '1'           // state_pregnancy_status - pregnant
                            , '2'           // state_last_period_year - last year
                            , '12'          // state_last_period_month - dec
                        )
                        .check.interaction({
                            state: 'state_last_period_day',
                            reply: 'Last period day 12 2016'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_last_period_day_12.mp3',
                                    wait_for: '#'
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
                            , '12345'       // state_personnel_auth
                            , '1'           // state_msg_receiver - mother&father
                            , '09094444444' // state_msisdn_mother
                            , '09095555555' // state_msisdn_household
                            , '1'           // state_pregnancy_status - pregnant
                            , '2'           // state_last_period_year - last year
                            , '10'           // state_last_period_month - oct
                            , '32'          // state_last_period_day
                        )
                        .check.interaction({
                            state: 'state_last_period_day',
                            reply: 'Retry last period day 10 2016'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_last_period_day_10_retry.mp3',
                                    wait_for: '#'
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
                            , '12345'       // state_personnel_auth
                            , '1'           // state_msg_receiver - mother&father
                            , '09094444444' // state_msisdn_mother
                            , '09095555555' // state_msisdn_household
                            , '1'           // state_pregnancy_status - pregnant
                            , '2'           // state_last_period_year - last year
                            , '11'           // state_last_period_month - nov
                            , '32'          // state_last_period_day
                            , '31'          // state_last_period_day
                        )
                        .check.interaction({
                            state: 'state_invalid_date',
                            reply: [
                                'The date you entered is not a real date. Please try again.',
                                '1. Continue'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_invalid_date_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });
        });

        // baby
        describe("When you enter a baby_birth_month", function() {
            describe("if the month choice is not in valid range for this year", function() {
                it("should navigate back to state_baby_birth_month", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'           // state_personnel_auth
                            , '1'               // state_msg_receiver - mother&father
                            , '09094444444'     // state_msisdn_mother
                            , '09095555555'     // state_msisdn_household
                            , '2'               // state_pregnancy_status - baby
                            , '1'               // state_baby_birth_year - this year
                            , '8'               // state_baby_birth_month - aug
                        )
                        .check.interaction({
                            state: 'state_baby_birth_month',
                            reply: [
                                'Retry. Birth month this/last year?',
                                '1. January',
                                '2. February',
                                '3. March',
                                '4. April',
                                '5. May',
                                '6. June',
                                '7. July',
                                '8. August',
                                '9. September',
                                '10. October',
                                '11. November',
                                '12. December'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_baby_birth_month_1_retry.mp3',
                                    wait_for: '#'
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
                            , '12345'           // state_personnel_auth
                            , '1'               // state_msg_receiver - mother&father
                            , '09094444444'     // state_msisdn_mother
                            , '09095555555'     // state_msisdn_household
                            , '2'               // state_pregnancy_status - baby
                            , '2'               // state_baby_birth_year - last year
                            , '3'               // state_baby_birth_month - mar
                        )
                        .check.interaction({
                            state: 'state_baby_birth_month',
                            reply: [
                                'Retry. Birth month this/last year?',
                                '1. January',
                                '2. February',
                                '3. March',
                                '4. April',
                                '5. May',
                                '6. June',
                                '7. July',
                                '8. August',
                                '9. September',
                                '10. October',
                                '11. November',
                                '12. December'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_baby_birth_month_2_retry.mp3',
                                    wait_for: '#'
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
                            , '12345'       // state_personnel_auth
                            , '6'           // state_msg_receiver - friend_only
                            , '09092222222' // state_msisdn
                            , '2'           // state_pregnancy_status - baby
                            , '2'           // state_baby_birth_year - last year
                            , '9'           // state_baby_birth_month - sep
                        )
                        .check.interaction({
                            state: 'state_baby_birth_day',
                            reply: 'Birth day in 09 2016'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_baby_birth_day_9.mp3',
                                    wait_for: '#'
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
                            , '12345'       // state_personnel_auth
                            , '6'           // state_msg_receiver - friend_only
                            , '09092222222' // state_msisdn
                            , '2'           // state_pregnancy_status - baby
                            , '2'           // state_baby_birth_year - last year
                            , '9'           // state_baby_birth_month - sep
                            , '35'          // state_baby_birth_day
                        )
                        .check.interaction({
                            state: 'state_baby_birth_day',
                            reply: 'Retry birth day 09 2016'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_baby_birth_day_9_retry.mp3',
                                    wait_for: '#'
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
                            state: 'state_invalid_date',
                            reply: [
                                'The date you entered is not a real date. Please try again.',
                                '1. Continue'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_invalid_date_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
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
                            , '12345'       // state_personnel_auth
                            , '6'           // state_msg_receiver - friend_only
                            , '09092222222' // state_msisdn
                            , '1'           // state_pregnancy_status - pregnant
                            , '2'           // state_last_period_year - last year
                            , '10'          // state_last_period_month - oct
                            , '32'          // state_last_period_day
                        )
                        .check.interaction({
                            state: 'state_last_period_day',
                            reply: 'Retry last period day 10 2016'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_last_period_day_10_retry.mp3',
                                    wait_for: '#'
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
                            , '12345'       // state_personnel_auth
                            , '6'           // state_msg_receiver - friend_only
                            , '09092222222' // state_msisdn
                            , '1'           // state_pregnancy_status - pregnant
                            , '2'           // state_last_period_year - last year
                            , '10'          // state_last_period_month - oct
                            , '22'          // state_last_period_day
                        )
                        .check.interaction({
                            state: 'state_gravida',
                            reply: "Please enter the number of times the woman has been pregnant before. This includes any pregnancies she may not have carried to term."
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_gravida_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
                it("should navigate to state_msg_language", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_personnel_auth
                            , '6'           // state_msg_receiver - friend_only
                            , '09092222222' // state_msisdn
                            , '1'           // state_pregnancy_status - pregnant
                            , '2'           // state_last_period_year - last year
                            , '10'          // state_last_period_month - oct
                            , '22'          // state_last_period_day
                            , '3'           // state_gravida
                        )
                        .check.interaction({
                            state: 'state_msg_language',
                            reply: [
                                'Language?',
                                '1. english',
                                '2. hausa',
                                '3. igbo',
                                '4. pidgin',
                                '5. yoruba'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_msg_language_1.mp3',
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
                it("should navigate back to state_baby_birth_day", function() {
                    return tester
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_personnel_auth
                            , '6'           // state_msg_receiver - friend_only
                            , '09092222222' // state_msisdn
                            , '2'           // state_pregnancy_status - baby
                            , '2'           // state_baby_birth_year - last year
                            , '11'          // state_baby_birth_month - nov
                            , '32'          // state_baby_birth_day
                        )
                        .check.interaction({
                            state: 'state_baby_birth_day',
                            reply: 'Retry birth day 11 2016'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_baby_birth_day_11_retry.mp3',
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
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
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
                            state: 'state_msg_language',
                            reply: [
                                'Language?',
                                '1. english',
                                '2. hausa',
                                '3. igbo',
                                '4. pidgin',
                                '5. yoruba'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_msg_language_1.mp3',
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
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_personnel_auth
                            , '6'           // state_msg_receiver - friend_only
                            , '09092222222' // state_msisdn
                            , '2'           // state_pregnancy_status - baby
                            , '2'           // state_pregnancy_status - babyk
                            , '2'           // state_baby_birth_year - last year
                            , '11'          // state_baby_birth_month - nov
                            , '*'           // state_baby_birth_day
                        )
                        .check.interaction({
                            state: 'state_personnel_auth'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_personnel_auth_1.mp3',
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
                    .setup.user.addr('07030010001')
                    .inputs(
                        {session_event: 'new'}
                        , '12345'       // state_personnel_auth
                        , '6'           // state_msg_receiver - friend_only
                        , '09092222222' // state_msisdn
                        , '2'           // state_pregnancy_status - baby
                        , '2'           // state_baby_birth_year - last year
                        , '11'          // state_baby_birth_month - nov
                        , '13'          // state_baby_birth_day
                        , '2'           // state_gravida
                        , '5'           // state_msg-language - yoruba
                    )
                    .check.interaction({
                        state: 'state_msg_type',
                        reply: [
                            'Channel?',
                            '1. voice',
                            '2. sms'
                        ].join('\n')
                    })
                    .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_msg_type_1.mp3',
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
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'       // state_personnel_auth
                            , '6'           // state_msg_receiver - friend_only
                            , '09092222222' // state_msisdn
                            , '2'           // state_pregnancy_status - baby
                            , '2'           // state_baby_birth_year - last year
                            , '7'           // state_baby_birth_month - july
                            , '13'          // state_baby_birth_day
                            , '2'           // state_gravida
                            , '3'           // state_msg_language - igbo
                            , '2'           // state_msg_type - sms
                        )
                        .check.interaction({
                            state: 'state_end_sms',
                            reply: 'Thank you! three times a week.'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_sms_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .check(function(api) {
                            var expected_used = [2,6,36,37,38,52,54,59,69,77];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
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
                            , '12345'       // state_personnel_auth
                            , '6'           // state_msg_receiver - friend_only
                            , '09092222222' // state_msisdn
                            , '2'           // state_pregnancy_status - baby
                            , '2'           // state_baby_birth_year - last year
                            , '11'          // state_baby_birth_month - nov
                            , '13'          // state_baby_birth_day
                            , '2'           // state_gravida
                            , '3'           // state_msg_language - igbo
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
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_voice_days_1.mp3',
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
                    .setup.user.addr('07030010001')
                    .inputs(
                        {session_event: 'new'}
                        , '12345'       // state_personnel_auth
                        , '6'           // state_msg_receiver - friend_only
                        , '09092222222' // state_msisdn
                        , '2'           // state_pregnancy_status - baby
                        , '2'           // state_baby_birth_year - last year
                        , '11'          // state_baby_birth_month - nov
                        , '13'          // state_baby_birth_day
                        , '2'           // state_gravida
                        , '4'           // state_msg-language - pidgin
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
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_voice_times_1.mp3',
                                    wait_for: '#'
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
                        , '12345'       // state_personnel_auth
                        , '6'           // state_msg_receiver - friend_only
                        , '09092222222' // state_msisdn
                        , '2'           // state_pregnancy_status - baby
                        , '2'           // state_baby_birth_year - last year
                        , '9'           // state_baby_birth_month - sep
                        , '13'          // state_baby_birth_day
                        , '2'           // state_gravida
                        , '3'           // state_msg_language - igbo
                        , '1'           // state_msg_type - voice
                        , '1'           // state_voice_days - mon_wed
                        , '2'           // state_voice_times - 2_5
                    )
                    .check.interaction({
                        state: 'state_end_voice',
                        reply: 'Thank you! Time: 2_5. Days: mon_wed.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_voice_3.mp3',
                                wait_for: '#'
                            }
                        }
                    })
                    .check(function(api) {
                        var expected_used = [2,6,36,37,38,53,54,59,70,77];
                        var fixts = api.http.fixtures.fixtures;
                        var fixts_used = [];
                        fixts.forEach(function(f, i) {
                            f.uses > 0 ? fixts_used.push(i) : null;
                        });
                        assert.deepEqual(fixts_used, expected_used);
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
});
