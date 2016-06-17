var vumigo = require('vumigo_v02');
// TR02 var fixtures = require('./fixtures_public');
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
                    name: 'train-voice-public-test',
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


        // TEST RESTART

        describe("Restart('0') and replay('*') testing", function() {
            it("'0' should restart to main_menu", function() {
                return tester
                    .setup.user.addr('+2345059991111')
                    .inputs(
                        {session_event: 'new'}
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
            it("to state_voice_days", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '3'  // state_set_language - pidgin
                    , '05059992222'  // msg_receiver_msisdn
                    , '2'  // main_menu - msg_pref
                    , '1'  // state_change_menu_sms - change text to voice
                )
                .check.interaction({
                    state: 'state_voice_days'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_voice_days_1.mp3'],
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
                    , '3'  // state_set_language - pidgin
                    , '05059992222'  // msg_receiver_msisdn
                    , '2'  // main_menu - msg_pref
                    , '1'  // state_change_menu_sms - change text to voice
                    , '1'  // state_voice_days - Mon & Wed
                )
                .check.interaction({
                    state: 'state_voice_times'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_voice_times_1.mp3'],
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
                    , '3'  // state_set_language - pidgin
                    , '05059992222'  // msg_receiver_msisdn
                    , '2'  // main_menu - msg_pref
                    , '1'  // state_change_menu_sms - change text to voice
                    , '2'  // state_voice_days - Tue & Thu
                    , '1'  // state_voice_times - 9-11am
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
            it("should navigate to state_msg_language", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '1'  // state_set_language - english
                    , '05059992222' // state_msg_receiver_msisdn
                    , '4'           // state_main_menu - language
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
                .check.user.properties({lang: 'eng_NG'})
                .run();
            });
            it("to state_end_msg_language", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '1'  // state_set_language - english
                    , '05059992222' // state_msg_receiver_msisdn
                    , '4'           // state_main_menu - language
                    , '3'   // state_msg_language - pidgin
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
