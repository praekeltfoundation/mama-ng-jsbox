var vumigo = require('vumigo_v02');
// TR02 var fixtures = require('./fixtures_public');
var assert = require('assert');
var AppTester = vumigo.AppTester;


describe("Mama Nigeria App", function() {
    describe("Voice Public", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();
            tester = new AppTester(app);

            tester
                .setup.config.app({
                    testing_today: '2015-07-22',
                    testing_message_id: '0170b7bb-978e-4b8a-35d2-662af5b6daee',  // testing only
                    name: 'train-ivr-public-test',
                    country_code: '234',  // nigeria
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


        // TEST RESTART

        describe("Restart('0') and replay('*') testing", function() {
            it("'0' should restart to main_menu", function() {
                return tester
                    .setup.user.addr('+2345059991111')
                    .inputs(
                        {session_event: 'new'}
                        , '05059992222' // state_msg_receiver_msisdn
                        , '1'  // state_main_menu - baby
                        , '0'  // state_baby_confirm_subscription - restart
                    )
                    .check.interaction({
                        state: 'state_main_menu',
                        reply: [
                            'Choose:',
                            '1. baby',
                            '2. preferences',
                            '3. number',
                            '4. language',
                            '5. optout'
                        ].join('\n')
                    })
                    .run();
            });
            it("'*' should repeat message", function() {
                return tester
                    .setup.user.addr('+2345059991111')
                    .inputs(
                        {session_event: 'new'}
                        , '05059992222' // state_msg_receiver_msisdn
                        , '1'  // state_main_menu - baby
                        , '*'  // state_baby_confirm_subscription - repeat
                    )
                    .check.interaction({
                        state: 'state_baby_confirm_subscription',
                        reply: [
                            'Confirm baby?',
                            '1. To confirm press 1. To go back to main menu, 0 then #'
                        ].join('\n')
                    })
                    .run();
            });
        });

        // TEST START ROUTING

        describe("Start of session", function() {
            it("to state_msg_receiver_msisdn", function() {
                return tester
                    .setup.user.addr('+2345059991111')
                    .inputs(
                        {session_event: 'new'}
                    )
                    .check.interaction({
                        state: 'state_msg_receiver_msisdn',
                        reply: 'Welcome, Number'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_msg_receiver_msisdn_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
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
                        , '5551234'  // msg_receiver_msisdn
                    )
                    .check.interaction({
                        state: 'state_msg_receiver_msisdn',
                        reply: "Retry. Welcome, Number"
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_msg_receiver_msisdn_1_retry.mp3',
                                wait_for: '#',
                                barge_in: false
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
                        , '5551234'  // state_msg_receiver_msisdn
                        , '0'  // state_msg_receiver_msisdn - restart
                    )
                    .check.interaction({
                        state: 'state_msg_receiver_msisdn',
                        reply: "Retry. Welcome, Number"
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_msg_receiver_msisdn_1_retry.mp3',
                                wait_for: '#',
                                barge_in: false
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
                        , '5551234'  // state_msg_receiver_msisdn
                        , '*'   // state_msg_receiver_msisdn - repeat
                    )
                    .check.interaction({
                        state: 'state_msg_receiver_msisdn',
                        reply: "Retry. Welcome, Number"
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_msg_receiver_msisdn_1_retry.mp3',
                                wait_for: '#',
                                barge_in: false
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
                        , '05059992222'  // msg_receiver_msisdn
                    )
                    .check.interaction({
                        state: 'state_main_menu',
                        reply: [
                        'Choose:',
                        '1. baby',
                        '2. preferences',
                        '3. number',
                        '4. language',
                        '5. optout'
                        ].join('\n')
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_main_menu_1.mp3',
                                wait_for: '#',
                                barge_in: false
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
                    , '05059992222'  // msg_receiver_msisdn
                    , '1'  // main_menu - baby
                )
                .check.interaction({
                    state: 'state_baby_confirm_subscription',
                    reply: [
                        'Confirm baby?',
                        '1. To confirm press 1. To go back to main menu, 0 then #'
                    ].join('\n')
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_baby_confirm_subscription_1.mp3',
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
                    , '05059992222'  // msg_receiver_msisdn
                    , '1'  // main_menu - baby
                    , '1'  // state_baby_confirm_subscription
                )
                .check.interaction({
                    state: 'state_end_baby',
                    reply: 'Thank you - baby'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_baby_1.mp3',
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
                        , '05059992222'  // msg_receiver_msisdn
                        , '2'  // main_menu - msg_pref
                    )
                    .check.interaction({
                        state: 'state_change_menu_sms',
                        reply: [
                            'Please select what you would like to do:',
                            '1. Change from text to voice'
                        ].join('\n')
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_change_menu_sms_1.mp3',
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
            });
            it("to state_voice_days", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '05059992222'  // msg_receiver_msisdn
                    , '2'  // main_menu - msg_pref
                    , '1'  // state_change_menu_sms - change text to voice
                )
                .check.interaction({
                    state: 'state_voice_days',
                    reply: [
                        'Message days?',
                        '1. Monday and Wednesday',
                        '2. Tuesday and Thursday'
                    ].join('\n')
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_voice_days_1.mp3',
                            wait_for: '#',
                            barge_in: true
                        }
                    }
                })
                .run();
            });
            it("to state_voice_times", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '05059992222'  // msg_receiver_msisdn
                    , '2'  // main_menu - msg_pref
                    , '1'  // state_change_menu_sms - change text to voice
                    , '1'  // state_voice_days - Mon & Wed
                )
                .check.interaction({
                    state: 'state_voice_times',
                    reply: [
                        'Message times?',
                        '1. 9-11am',
                        '2. 2-5pm'
                    ].join('\n')
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_voice_times_1.mp3',
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
                    , '05059992222'  // msg_receiver_msisdn
                    , '2'  // main_menu - msg_pref
                    , '1'  // state_change_menu_sms - change text to voice
                    , '2'  // state_voice_days - Tue & Thu
                    , '1'  // state_voice_times - 9-11am
                )
                .check.interaction({
                    state: 'state_end_voice_confirm',
                    reply: 'Thank you! Time: 9_11. Days: tue_thu.'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_voice_confirm_2.mp3',
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
                    , '05059992222' // state_msg_receiver_msisdn
                    , '3'           // state_main_menu - number
                )
                .check.interaction({
                    state: 'state_new_msisdn',
                    reply: 'Please enter new mobile number'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_new_msisdn_1.mp3',
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
                    , '05059992222' // state_msg_receiver_msisdn
                    , '3'           // state_main_menu - number
                    , '54321'       // state_new_msisdn
                )
                .check.interaction({
                    state: 'state_new_msisdn',
                    reply: 'Invalid number. Try again. Please enter new mobile number'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_new_msisdn_1_retry.mp3',
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
                    , '05059992222' // state_msg_receiver_msisdn
                    , '3'           // state_main_menu - number
                    , '05059998888'  // state_new_msisdn
                )
                .check.interaction({
                    state: 'state_end_new_msisdn',
                    reply: 'Thank you. Mobile number changed.'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_new_msisdn_1.mp3',
                            wait_for: '#',
                            barge_in: true
                        }
                    }
                })
                .run();
            });
        });

        describe.only("Flow from main menu - change language", function() {
            it("should navigate to state_msg_language", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '05059992222' // state_msg_receiver_msisdn
                    , '4'           // state_main_menu - language
                )
                .check.interaction({
                    state: 'state_msg_language',
                    reply: [
                        'Language?',
                        '1. English',
                        '2. Hausa',
                        '3. Igbo',
                        '4. Pidgin',
                        '5. Yoruba'
                    ].join('\n')
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_msg_language_1.mp3',
                            wait_for: '#',
                            barge_in: true
                        }
                    }
                })
                .run();
            });
            it("to state_end_msg_language", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '05059992222' // state_msg_receiver_msisdn
                    , '4'           // state_main_menu - language
                    , '4'   // state_msg_language - pidgin
                )
                .check.interaction({
                    state: 'state_end_msg_language_confirm',
                    reply: 'Thank you. Language preference updated.'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_msg_language_confirm_1.mp3',
                            wait_for: '#',
                            barge_in: false
                        }
                    }
                })
                .run();
            });
        });

        describe("Flow from main menu - optout", function() {
            // to optout menu
            describe("case 1", function() {
                it("to state_optout_reason", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059992222'  // msg_receiver_msisdn
                        , '5'  // state_main_menu - optout
                    )
                    .check.interaction({
                        state: 'state_optout_reason',
                        reply: [
                            'Optout reason?',
                            '1. Mother miscarried',
                            '2. Baby stillborn',
                            '3. Baby passed away',
                            '4. Messages not useful',
                            '5. Other'
                        ].join('\n')
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_optout_reason_1.mp3',
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
                });
                it("miscarriage; to state_loss_subscription", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059992222'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '1'  // optout_reason - miscarriage
                    )
                    .check.interaction({
                        state: 'state_loss_subscription',
                        reply: [
                        'Receive loss messages?',
                        '1. Yes',
                        '2. No'
                        ].join('\n')
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_loss_subscription_1.mp3',
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
                        , '05059992222'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '1'  // optout_reason - miscarriage
                        , '1'  // loss_opt_in - confirm opt in
                    )
                    .check.interaction({
                        state: 'state_end_loss_subscription_confirm',
                        reply: 'Thank you. You will now receive messages to support you during this difficult time.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_loss_subscription_confirm_1.mp3',
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
                        , '05059992222'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '1'  // optout_reason - miscarriage
                        , '2'  // state_loss_subscription - no
                    )
                    .check.interaction({
                        state: 'state_end_loss',
                        reply: 'We are sorry for your loss. You will no longer receive messages.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_loss_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check.reply.ends_session()
                    .run();
                });
                // stillborn
                it("to state_end_loss (stillborn)", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059992222'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '2'  // optout_reason - stillborn
                    )
                    .check.interaction({
                        state: 'state_end_loss',
                        reply: 'We are sorry for your loss. You will no longer receive messages.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_loss_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // baby passed away
                it("to state_end_loss (baby death)", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059992222'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '3'  // optout_reason - baby_died
                    )
                    .check.interaction({
                        state: 'state_end_loss',
                        reply: 'We are sorry for your loss. You will no longer receive messages.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_loss_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // not useful
                it("to state_end_optout", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059992222'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '4'  // optout_reason - not_useful
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: 'Thank you - optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_optout_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // other
                it("to state_end_optout", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059992222'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '5'  // optout_reason - other
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: 'Thank you - optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_optout_1.mp3',
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
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_main_menu_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
            });
            describe("case 2", function() {
                it("to state_optout_reason", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059993333'  // msg_receiver_msisdn
                        , '5'  // state_main_menu - optout
                    )
                    .check.interaction({
                        state: 'state_optout_reason',
                        reply: [
                            'Optout reason?',
                            '1. Mother miscarried',
                            '2. Baby stillborn',
                            '3. Baby passed away',
                            '4. Messages not useful',
                            '5. Other'
                        ].join('\n')
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_optout_reason_1.mp3',
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
                });
                it("to state_loss_subscription (miscarriage)", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059993333'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '1'  // optout_reason - miscarriage
                    )
                    .check.interaction({
                        state: 'state_loss_subscription',
                        reply: [
                        'Receive loss messages?',
                        '1. Yes',
                        '2. No'
                        ].join('\n')
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_loss_subscription_1.mp3',
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
                });
                // 1, 1 - miscarriage, yes
                it("loss messages opt-in; to state_end_loss_subscription_confirm", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059993333'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '1'  // optout_reason - miscarriage
                        , '1'  // state_end_loss_subscription_confirm - confirm opt in
                    )
                    .check.interaction({
                        state: 'state_end_loss_subscription_confirm',
                        reply: 'Thank you. You will now receive messages to support you during this difficult time.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_loss_subscription_confirm_1.mp3',
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
                        , '05059993333'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '1'  // optout_reason - miscarriage
                        , '2'  // state_loss_subscription - no
                    )
                    .check.interaction({
                        state: 'state_end_loss',
                        reply: 'We are sorry for your loss. You will no longer receive messages.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_loss_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check.reply.ends_session()
                    .run();
                });
                // stillborn
                it("to state_end_loss (stillborn)", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059993333'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '2'  // optout_reason - stillborn
                    )
                    .check.interaction({
                        state: 'state_end_loss',
                        reply: 'We are sorry for your loss. You will no longer receive messages.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_loss_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // baby passed away
                it("to state_end_loss (baby death)", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059993333'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '3'  // optout_reason - baby_died
                    )
                    .check.interaction({
                        state: 'state_end_loss',
                        reply: 'We are sorry for your loss. You will no longer receive messages.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_loss_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // not useful
                it("to state_optout_receiver", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059993333'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '4'  // optout_reason - not_useful
                    )
                    .check.interaction({
                        state: 'state_optout_receiver',
                        reply: [
                            'Which messages to opt-out on?',
                            '1. Mother messages',
                            '2. Household messages',
                            '3. All messages'
                        ].join('\n')
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_optout_receiver_1.mp3',
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
                });
                // 4, 1 - unsubscribe mother
                it("to state_end_optout", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059993333'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '4'  // optout_reason - not_useful
                        , '1'  // state_optout_receiver - mother messages
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Thank you - optout"
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_optout_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // 4, 2 - unsubscribe household
                it("to state_end_optout", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059993333'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '4'  // optout_reason - not_useful
                        , '2'  // state_optout_receiver - household messages
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Thank you - optout"
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_optout_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // 4, 3 - unsubscribe all
                it("to state_end_optout", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059993333'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '4'  // optout_reason - not_useful
                        , '3'  // state_optout_receiver - all messages
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Thank you - optout"
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_optout_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // other
                it("to state_optout_receiver", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059993333'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '5'  // optout_reason - other
                    )
                    .check.interaction({
                        state: 'state_optout_receiver',
                        reply: [
                            'Which messages to opt-out on?',
                            '1. Mother messages',
                            '2. Household messages',
                            '3. All messages'
                        ].join('\n')
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_optout_receiver_1.mp3',
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
                });
                // 5, 1 - unsubscribe mother
                it("to state_end_optout", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059993333'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '5'  // optout_reason - not_useful
                        , '1'  // state_optout_receiver - mother messages
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Thank you - optout"
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_optout_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // 5, 2 - unsubscribe household
                it("to state_end_optout", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059993333'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '5'  // optout_reason - not_useful
                        , '2'  // state_optout_receiver - household messages
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Thank you - optout"
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_optout_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // 5, 3 - unsubscribe all
                it("to state_end_optout", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059993333'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '5'  // optout_reason - not_useful
                        , '3'  // state_optout_receiver - all messages
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Thank you - optout"
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_optout_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
            });

            describe("case 3", function() {
                it("to state_optout_reason", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059996666'  // msg_receiver_msisdn
                        , '5'  // state_main_menu - optout
                    )
                    .check.interaction({
                        state: 'state_optout_reason',
                        reply: [
                            'Optout reason?',
                            '1. Mother miscarried',
                            '2. Baby stillborn',
                            '3. Baby passed away',
                            '4. Messages not useful',
                            '5. Other'
                        ].join('\n')
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_optout_reason_1.mp3',
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
                });
                it("to state_loss_subscription (miscarriage)", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059996666'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '1'  // optout_reason - miscarriage
                    )
                    .check.interaction({
                        state: 'state_loss_subscription',
                        reply: [
                        'Receive loss messages?',
                        '1. Yes',
                        '2. No'
                        ].join('\n')
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_loss_subscription_1.mp3',
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
                });
                // 1, 1 - miscarriage, yes
                it("loss messages opt-in; to state_end_loss_subscription_confirm", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059996666'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '1'  // optout_reason - miscarriage
                        , '1'  // state_end_loss_subscription_confirm - confirm opt in
                    )
                    .check.interaction({
                        state: 'state_end_loss_subscription_confirm',
                        reply: 'Thank you. You will now receive messages to support you during this difficult time.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_loss_subscription_confirm_1.mp3',
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
                        , '05059996666'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '1'  // optout_reason - miscarriage
                        , '2'  // state_loss_subscription - no
                    )
                    .check.interaction({
                        state: 'state_end_loss',
                        reply: 'We are sorry for your loss. You will no longer receive messages.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_loss_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check.reply.ends_session()
                    .run();
                });
                // stillborn
                it("to state_end_loss (stillborn)", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059996666'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '2'  // optout_reason - stillborn
                    )
                    .check.interaction({
                        state: 'state_end_loss',
                        reply: 'We are sorry for your loss. You will no longer receive messages.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_loss_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // baby passed away
                it("to state_end_loss (baby death)", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059996666'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '3'  // optout_reason - baby_died
                    )
                    .check.interaction({
                        state: 'state_end_loss',
                        reply: 'We are sorry for your loss. You will no longer receive messages.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_loss_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // not useful
                it("to state_optout_receiver", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059996666'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '4'  // optout_reason - not_useful
                    )
                    .check.interaction({
                        state: 'state_optout_receiver',
                        reply: [
                            'Which messages to opt-out on?',
                            '1. Mother messages',
                            '2. Household messages',
                            '3. All messages'
                        ].join('\n')
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_optout_receiver_1.mp3',
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
                });
                // 4, 1 - unsubscribe mother
                it("to state_end_optout", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059996666'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '4'  // optout_reason - not_useful
                        , '1'  // state_optout_receiver - mother messages
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Thank you - optout"
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_optout_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // 4, 2 - unsubscribe household
                it("to state_end_optout", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059996666'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '4'  // optout_reason - not_useful
                        , '2'  // state_optout_receiver - household messages
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Thank you - optout"
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_optout_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // 4, 3 - unsubscribe all
                it("to state_end_optout", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059996666'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '4'  // optout_reason - not_useful
                        , '3'  // state_optout_receiver - all messages
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Thank you - optout"
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_optout_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // other
                it("to state_optout_receiver", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059996666'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '5'  // optout_reason - other
                    )
                    .check.interaction({
                        state: 'state_optout_receiver',
                        reply: [
                            'Which messages to opt-out on?',
                            '1. Mother messages',
                            '2. Household messages',
                            '3. All messages'
                        ].join('\n')
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_optout_receiver_1.mp3',
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
                });
                // 5, 1 - unsubscribe mother
                it("to state_end_optout", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059996666'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '5'  // optout_reason - not_useful
                        , '1'  // state_optout_receiver - mother messages
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Thank you - optout"
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_optout_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // 5, 2 - unsubscribe household
                it("to state_end_optout", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059996666'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '5'  // optout_reason - not_useful
                        , '2'  // state_optout_receiver - household messages
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Thank you - optout"
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_optout_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // 5, 3 - unsubscribe all
                it("to state_end_optout", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059996666'  // msg_receiver_msisdn
                        , '5'  // main_menu - optout
                        , '5'  // optout_reason - not_useful
                        , '3'  // state_optout_receiver - all messages
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Thank you - optout"
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_optout_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
            });

            describe("case 4", function() {
                it("to state_optout_reason", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059997777'  // msg_receiver_msisdn
                        , '4'  // state_main_menu_household - optout
                    )
                    .check.interaction({
                        state: 'state_optout_reason',
                        reply: [
                            'Optout reason?',
                            '1. Mother miscarried',
                            '2. Baby stillborn',
                            '3. Baby passed away',
                            '4. Messages not useful',
                            '5. Other'
                        ].join('\n')
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_optout_reason_1.mp3',
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .run();
                });
                it("miscarriage; to state_loss_subscription", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059997777'  // msg_receiver_msisdn
                        , '4'  // main_menu_household - optout
                        , '1'  // optout_reason - miscarriage
                    )
                    .check.interaction({
                        state: 'state_loss_subscription',
                        reply: [
                        'Receive loss messages?',
                        '1. Yes',
                        '2. No'
                        ].join('\n')
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_loss_subscription_1.mp3',
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
                        , '05059997777'  // msg_receiver_msisdn
                        , '4'  // main_menu_household - optout
                        , '1'  // optout_reason - miscarriage
                        , '1'  // loss_opt_in - confirm opt in
                    )
                    .check.interaction({
                        state: 'state_end_loss_subscription_confirm',
                        reply: 'Thank you. You will now receive messages to support you during this difficult time.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_loss_subscription_confirm_1.mp3',
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
                        , '05059997777'  // msg_receiver_msisdn
                        , '4'  // main_menu_household - optout
                        , '1'  // optout_reason - miscarriage
                        , '2'  // state_loss_subscription - no
                    )
                    .check.interaction({
                        state: 'state_end_loss',
                        reply: 'We are sorry for your loss. You will no longer receive messages.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_loss_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check.reply.ends_session()
                    .run();
                });
                // stillborn
                it("to state_end_loss (stillborn)", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059997777'  // msg_receiver_msisdn
                        , '4'  // main_menu_household - optout
                        , '2'  // optout_reason - stillborn
                    )
                    .check.interaction({
                        state: 'state_end_loss',
                        reply: 'We are sorry for your loss. You will no longer receive messages.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_loss_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // baby passed away
                it("to state_end_loss (baby death)", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059997777'  // msg_receiver_msisdn
                        , '4'  // main_menu_household - optout
                        , '3'  // optout_reason - baby_died
                    )
                    .check.interaction({
                        state: 'state_end_loss',
                        reply: 'We are sorry for your loss. You will no longer receive messages.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_loss_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // not useful
                it("to state_end_optout", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059997777'  // msg_receiver_msisdn
                        , '4'  // main_menu_household - optout
                        , '4'  // optout_reason - not_useful
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: 'Thank you - optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_optout_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
                // other
                it("to state_end_optout", function() {
                    return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '05059997777'  // msg_receiver_msisdn
                        , '4'  // main_menu_household - optout
                        , '5'  // optout_reason - other
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: 'Thank you - optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_optout_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .run();
                });
            });
        });
    });
});
