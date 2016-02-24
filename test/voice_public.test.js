var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
// var assert = require('assert');
var AppTester = vumigo.AppTester;


describe("Mama Nigeria App", function() {
    describe("Voice Change", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();
            tester = new AppTester(app);

            tester
                .setup.config.app({
                    testing_today: '2015-07-22',
                    name: 'voice-change-test',
                    country_code: '234',  // nigeria
                    services: {
                        identities: {
                            api_token: 'test_token_identities',
                            url: "http://localhost:8001/api/v1/"
                        },
                        subscriptions: {
                            api_token: 'test_token_subscriptions',
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
                // +08080030003 is an unregistered identity
                // +07070050005 is a registered identity
                ;
        });


        // TEST RESTART

        describe("When you use * to restart", function() {
            it("should reset the user answers", function() {
                return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
                        , '1'  // c01_main_menu - baby
                        , '*'  // c03_baby_confirm - restart
                    )
                    .check.interaction({
                        state: 'state_c12_number',
                        reply: "Welcome, Number"
                    })
                    .check.user.answers({})
                    .run();
            });
        });

        // TEST START ROUTING

        describe("When you start the app", function() {
            it("should navigate to state_c12_number", function() {
                return tester
                    .setup.user.addr('+08080030003')
                    .inputs(
                        {session_event: 'new'}
                    )
                    .check.interaction({
                        state: 'state_c12_number',
                        reply: 'Welcome, Number'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c12_number_1.mp3',
                                wait_for: '#'
                            }
                        }
                    })
                    .run();
            });
        });


        // TEST CHANGE FLOW

        describe("When you enter a number c12_number", function() {
            describe("if you enter a crummy number", function() {
                it("should navigate to c13_number_retry", function() {
                    return tester
                        .setup.user.addr('+07070050005')
                        .inputs(
                            {session_event: 'new'}
                            , '5551234'  // c12_number
                        )
                        .check.interaction({
                            state: 'state_c13_retry_number',
                            reply: "Retry number"
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c13_retry_number_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if you enter a registered user number", function() {
                it("should navigate to c01_main_menu", function() {
                    return tester
                        .setup.user.addr('+07070050005')
                        .inputs(
                            {session_event: 'new'}
                            , '07070050005'  // c12_number
                        )
                        .check.interaction({
                            state: 'state_c01_main_menu',
                            reply: [
                                'Baby / Message time / Optout?',
                                '1. baby',
                                '2. msg_time',
                                '3. optout'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c01_main_menu_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if you enter an unregistered number", function() {
                it.skip("should navigate to c02_not_registered", function() {
                    return tester
                        .setup.user.addr('+07070050005')
                        .inputs(
                            {session_event: 'new'}
                            , '08080030003'  // c12_number
                        )
                        .check.interaction({
                            state: 'state_c02_not_registered',
                            reply: 'Unrecognised number'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c02_not_registered_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if you enter a registered number without an active subscription", function() {
                it("should navigate to c14_end_not_active", function() {
                    return tester
                        .setup.user.addr('+07070050005')
                        .inputs(
                            {session_event: 'new'}
                            , '07070060006'  // c12_number
                        )
                        .check.interaction({
                            state: 'state_c14_end_not_active',
                            reply: 'No active subscriptions'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c14_end_not_active_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });
        });

        describe("When you enter a choice c01_main_menu", function() {
            describe("if you choose baby", function() {
                it("should navigate to state_c03_baby_confirm", function() {
                    return tester
                        .setup.user.addr('+07070050005')
                        .inputs(
                            {session_event: 'new'}
                            , '07070050005'  // c12_number
                            , '1'  // c01_main_menu - baby
                        )
                        .check.interaction({
                            state: 'state_c03_baby_confirm',
                            reply: [
                                'Confirm baby?',
                                '1. confirm'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c03_baby_confirm_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if you choose msg_time", function() {
                it("should navigate to state_c04_voice_days", function() {
                    return tester
                        .setup.user.addr('+07070050005')
                        .inputs(
                            {session_event: 'new'}
                            , '07070050005'  // c12_number
                            , '2'  // c01_main_menu - msg_time
                        )
                        .check.interaction({
                            state: 'state_c04_voice_days',
                            reply: [
                                'Message days?',
                                '1. mon_wed',
                                '2. tue_thu'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c04_voice_days_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if you choose optout", function() {
                it("should navigate to state_c05_optout_reason", function() {
                    return tester
                        .setup.user.addr('+07070050005')
                        .inputs(
                            {session_event: 'new'}
                            , '07070050005'  // c12_number
                            , '3'  // c01_main_menu - optout
                        )
                        .check.interaction({
                            state: 'state_c05_optout_reason',
                            reply: [
                                'Optout reason?',
                                '1. miscarriage',
                                '2. stillborn',
                                '3. baby_died',
                                '4. not_useful',
                                '5. other'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c05_optout_reason_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });
        });

        describe("When you enter confirm baby c03_baby_confirm", function() {
            it("should navigate to state_c08_end_baby", function() {
                return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
                        , '07070050005'  // c12_number
                        , '1'  // c01_main_menu - baby
                        , '1'  // c03_baby_confirm - confirm
                    )
                    .check.interaction({
                        state: 'state_c08_end_baby',
                        reply: 'Thank you - baby'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c08_end_baby_1.mp3',
                                wait_for: '#'
                            }
                        }
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });

        describe("When you choose a day c04_voice_days", function() {
            it("should navigate to state_c06_voice_times", function() {
                return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
                        , '07070050005'  // c12_number
                        , '2'  // c01_main_menu - msg_time
                        , '2'  // c04_voice_days - tue_thu
                    )
                    .check.interaction({
                        state: 'state_c06_voice_times',
                        reply: [
                            'Message times?',
                            '1. 9_11',
                            '2. 2_5'
                        ].join('\n')
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c06_voice_times_2.mp3',
                                wait_for: '#'
                            }
                        }
                    })
                    .run();
            });
        });

        describe("When you choose a time c06_voice_times", function() {
            it("should navigate to state_c09_end_msg_times", function() {
                return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
                        , '07070050005'  // c12_number
                        , '2'  // c01_main_menu - msg_time
                        , '2'  // c04_voice_days - tue_thu
                        , '1'  // c06_voice_times - 9-11
                    )
                    .check.interaction({
                        state: 'state_c09_end_msg_times',
                        reply: 'Thank you! Time: 9_11. Days: tue_thu.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c09_end_msg_times_2.mp3',
                                wait_for: '#'
                            }
                        }
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });

        describe("When you choose optout reason c05_optout_reason", function() {
            describe("if you choose miscarriage", function() {
                it("should navigate to state_c07_loss_opt_in", function() {
                    return tester
                        .setup.user.addr('+07070050005')
                        .inputs(
                            {session_event: 'new'}
                            , '07070050005'  // c12_number
                            , '3'  // c01_main_menu - optout
                            , '1'  // c05_optout_reason - miscarriage
                        )
                        .check.interaction({
                            state: 'state_c07_loss_opt_in',
                            reply: [
                                'Receive loss messages?',
                                '1. opt_in_confirm',
                                '2. opt_in_deny'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c07_loss_opt_in_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if you choose stillborn", function() {
                it("should navigate to state_c07_loss_opt_in", function() {
                    return tester
                        .setup.user.addr('+07070050005')
                        .inputs(
                            {session_event: 'new'}
                            , '07070050005'  // c12_number
                            , '3'  // c01_main_menu - optout
                            , '2'  // c05_optout_reason - stillborn
                        )
                        .check.interaction({
                            state: 'state_c07_loss_opt_in',
                            reply: [
                                'Receive loss messages?',
                                '1. opt_in_confirm',
                                '2. opt_in_deny'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c07_loss_opt_in_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if you choose baby_died", function() {
                it("should navigate to state_c07_loss_opt_in", function() {
                    return tester
                        .setup.user.addr('+07070050005')
                        .inputs(
                            {session_event: 'new'}
                            , '07070050005'  // c12_number
                            , '3'  // c01_main_menu - optout
                            , '3'  // c05_optout_reason - baby_died
                        )
                        .check.interaction({
                            state: 'state_c07_loss_opt_in',
                            reply: [
                                'Receive loss messages?',
                                '1. opt_in_confirm',
                                '2. opt_in_deny'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c07_loss_opt_in_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if you choose not_useful", function() {
                it("should navigate to state_c11_end_optout", function() {
                    return tester
                        .setup.user.addr('+07070050005')
                        .inputs(
                            {session_event: 'new'}
                            , '07070050005'  // c12_number
                            , '3'  // c01_main_menu - optout
                            , '4'  // c05_optout_reason - not_useful
                        )
                        .check.interaction({
                            state: 'state_c11_end_optout',
                            reply: 'Thank you - optout'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c11_end_optout_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .check.reply.ends_session()
                        .run();
                });
            });

            describe("if you choose other", function() {
                it("should navigate to state_c11_end_optout", function() {
                    return tester
                        .setup.user.addr('+07070050005')
                        .inputs(
                            {session_event: 'new'}
                            , '07070050005'  // c12_number
                            , '3'  // c01_main_menu - optout
                            , '5'  // c05_optout_reason - other
                        )
                        .check.interaction({
                            state: 'state_c11_end_optout',
                            reply: 'Thank you - optout'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c11_end_optout_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .check.reply.ends_session()
                        .run();
                });
            });
        });

        describe("When you enter a choice c07_loss_opt_in", function() {
            describe("if you choose loss messages", function() {
                it("should navigate to state_c10_end_loss_opt_in", function() {
                    return tester
                        .setup.user.addr('+07070050005')
                        .inputs(
                            {session_event: 'new'}
                            , '07070050005'  // c12_number
                            , '3'  // c01_main_menu - optout
                            , '1'  // c05_optout_reason - miscarriage
                            , '1'  // c07_loss_opt_in - confirm opt in
                        )
                        .check.interaction({
                            state: 'state_c10_end_loss_opt_in',
                            reply: 'Thank you - loss opt in'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c10_end_loss_opt_in_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .check.reply.ends_session()
                        .run();
                });
            });

            describe("if you choose no loss messages", function() {
                it("should navigate to state_c11_end_optout", function() {
                    return tester
                        .setup.user.addr('+07070050005')
                        .inputs(
                            {session_event: 'new'}
                            , '07070050005'  // c12_number
                            , '3'  // c01_main_menu - optout
                            , '1'  // c05_optout_reason - miscarriage
                            , '2'  // c07_loss_opt_in - deny opt in
                        )
                        .check.interaction({
                            state: 'state_c11_end_optout',
                            reply: 'Thank you - optout'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c11_end_optout_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .check.reply.ends_session()
                        .run();
                });
            });

            describe("if you choose * to restart", function() {
                it("should not restart", function() {
                    return tester
                        .setup.user.addr('+07070050005')
                        .inputs(
                            {session_event: 'new'}
                            , '07070050005'  // c12_number
                            , '3'  // c01_main_menu - optout
                            , '1'  // c05_optout_reason - miscarriage
                            , '*'  // c07_loss_opt_in - restart attempt
                        )
                        .check.interaction({
                            state: 'state_c07_loss_opt_in'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8004/api/v1/eng_NG/state_c07_loss_opt_in_1.mp3',
                                    wait_for: '#'
                                }
                            }
                        })
                        .run();
                });
            });
        });

    });
});
