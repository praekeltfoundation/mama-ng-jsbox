var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures_public');
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
                    name: 'voice-public-test',
                    country_code: '234',  // nigeria
                    default_language: 'eng_NG',
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
                        subscriptions: {
                            api_token: 'test_token_subscriptions',
                            url: "http://localhost:8005/api/v1/"
                        },
                        message_sender: {
                            api_token: 'test_token_message_sender',
                            url: "http://localhost:8006/api/v1/"
                        }
                    }
                })
                .setup(function(api) {
                    fixtures().forEach(function(d) {
                        api.http.fixtures.add(d);
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
                        , '0'  // state_end_baby - restart
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
                        , '05059992222' // state_msg_receiver_msisdn
                        , '3'  // state_main_menu - number
                        , '*'  // state_end_baby - repeat
                    )
                    .check.interaction({
                        state: 'state_new_msisdn'
                    })
                    .run();
            });
        });

        // TEST START ROUTING

        describe("Start of session", function() {
            it("should navigate to state_msg_receiver_msisdn", function() {
                return tester
                    .setup.user.addr('+2345059991111')
                    .inputs(
                        {session_event: 'new'}
                    )
                    .check.interaction({
                        state: 'state_msg_receiver_msisdn'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msg_receiver_msisdn_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check.user.properties({lang: 'eng_NG'})
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [25]);
                    })
                    .run();
            });
        });


        // TEST CHANGE FLOW

        describe("Flow to main menu", function() {
            it("should navigate to state_msg_receiver_msisdn (retry) when crummy number", function() {
                return tester
                    .setup.user.addr('+2345059992222')
                    .inputs(
                        {session_event: 'new'}
                        , '5551234'  // msg_receiver_msisdn
                    )
                    .check.interaction({
                        state: 'state_msg_receiver_msisdn'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: [
                                    'http://localhost:8004/api/v1/eng_NG/state_error_invalid_number.mp3',
                                    'http://localhost:8004/api/v1/eng_NG/state_msg_receiver_msisdn_1.mp3'
                                ],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [25]);
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
                        state: 'state_msg_receiver_msisdn'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: [
                                    'http://localhost:8004/api/v1/eng_NG/state_error_invalid_number.mp3',
                                    'http://localhost:8004/api/v1/eng_NG/state_msg_receiver_msisdn_1.mp3'
                                ],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [25]);
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
                        state: 'state_msg_receiver_msisdn'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: [
                                    'http://localhost:8004/api/v1/eng_NG/state_error_invalid_number.mp3',
                                    'http://localhost:8004/api/v1/eng_NG/state_msg_receiver_msisdn_1.mp3'
                                ],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [25]);
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
                    .check.user.properties({lang: 'ibo_NG'})
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,9,25]);
                    })
                    .run();
            });

            it("should navigate to state_not_recognised_msg_receiver_msisdn (unregistered user)", function() {
                return tester
                    .setup.user.addr('+2345059991111')
                    .inputs(
                        {session_event: 'new'}
                        , '05059991111'  // msg_receiver_msisdn
                    )
                    .check.interaction({
                        state: 'state_msisdn_not_recognised'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msisdn_not_recognised_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,25]);
                    })
                    .run();
            });
            it("should navigate to state_msg_receiver_msisdn", function() {
                return tester
                    .setup.user.addr('+2345059991111')
                    .inputs(
                        {session_event: 'new'}
                        , '05059991111'  // msg_receiver_msisdn
                        , '1'  // state_msisdn_not_recognised - incorrect number
                    )
                    .check.interaction({
                        state: 'state_msg_receiver_msisdn'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msg_receiver_msisdn_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,25]);
                    })
                    .run();
            });
            it("should navigate to state_end_exit", function() {
                return tester
                    .setup.user.addr('+2345059991111')
                    .inputs(
                        {session_event: 'new'}
                        , '05059991111'  // msg_receiver_msisdn
                        , '2'  // state_msisdn_not_recognised - exit
                    )
                    .check.interaction({
                        state: 'state_end_exit'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/eng_NG/state_end_exit_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0,25]);
                    })
                    .run();
            });
        });

        describe("Flow from main menu - baby messages", function() {
            it("should navigate to state_already_registered_baby", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '05059999999'  // msg_receiver_msisdn
                    , '1'  // main_menu - baby
                )
                .check.interaction({
                    state: 'state_already_registered_baby'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_already_registered_baby_1.mp3'],
                            wait_for: '#',
                            barge_in: true
                        }
                    }
                })
                .check(function(api) {
                    go.utils.check_fixtures_used(api, [25,70,71,72,73]);
                })
                .run();
            });
            it("case 1 > state_end_baby", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '05059992222'  // msg_receiver_msisdn
                    , '1'  // main_menu - baby
                )
                .check.interaction({
                    state: 'state_end_baby'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_end_baby_1.mp3'],
                            wait_for: '#',
                            barge_in: false
                        }
                    }
                })
                .check(function(api) {
                    go.utils.check_fixtures_used(api, [2,9,16,17,25]);
                })
                .run();
            });

            it("case 2 > state_end_baby", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '05059993333'  // msg_receiver_msisdn
                    , '1'  // main_menu - baby
                )
                .check.interaction({
                    state: 'state_end_baby'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_baby_1.mp3'],
                            wait_for: '#',
                            barge_in: false
                        }
                    }
                })
                .check(function(api) {
                    go.utils.check_fixtures_used(api, [4,5,19,20,25]);
                })
                .run();
            });
            it("case 3 > state_end_baby", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '05059996666'  // msg_receiver_msisdn
                    , '1'  // main_menu - baby
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
                .check(function(api) {
                    go.utils.check_fixtures_used(api, [7,12,13,22,23,25]);
                })
                .run();
            });
            it("case 4 > state_end_baby", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '05059997777'  // msg_receiver_msisdn
                    , '1'  // main_menu - baby
                )
                .check.interaction({
                    state: 'state_end_baby'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_baby_1.mp3'],
                            wait_for: '#',
                            barge_in: false
                        }
                    }
                })
                .check(function(api) {
                    go.utils.check_fixtures_used(api, [6,7,13,22,23,25]);
                })
                .run();
            });
        });

        describe("Flow from main menu - message preferences", function() {
            describe("Change from SMS to Voice messages", function() {
                it("case 1 > to state_change_menu_sms if registered for sms", function() {
                    return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
                        , '05059992222'  // msg_receiver_msisdn
                        , '2'  // main_menu - msg_pref
                    )
                    .check.interaction({
                        state: 'state_change_menu_sms'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_change_menu_sms_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,9,16,17,25]);
                    })
                    .run();
                });
                it("case 1 > to state_voice_days", function() {
                    return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
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
                                speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_voice_days_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,9,16,17,25]);
                    })
                    .run();
                });
                it("case 1 > to state_voice_times", function() {
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
                        state: 'state_voice_times'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_voice_times_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,9,16,17,25]);
                    })
                    .run();
                });
                it("case 1 > to state_end_voice_confirm", function() {
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
                        state: 'state_end_voice_confirm'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_end_voice_confirm_2.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,9,16,17,18,25,26]);
                    })
                    .run();
                });
            });
            describe("Change Voice message days and times", function() {
                it("case 2 > to state_voice_days", function() {
                    return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
                        , '05059993333'  // msg_receiver_msisdn
                        , '2'  // state_main_menu - msg_pref
                        , '1'  // state_change_menu_voice - change times
                    )
                    .check.interaction({
                        state: 'state_voice_days'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_voice_days_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [4,5,19,20,25]);
                    })
                    .run();
                });
                it("case 2 > to state_voice_days", function() {
                    return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
                        , '05059993333'  // msg_receiver_msisdn
                        , '2'  // main_menu - msg_pref
                        , '1'  // state_change_menu_sms - change text to voice
                    )
                    .check.interaction({
                        state: 'state_voice_days'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_voice_days_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [4,5,19,20,25]);
                    })
                    .run();
                });
                it("case 2 > to state_voice_times", function() {
                    return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
                        , '05059993333'  // msg_receiver_msisdn
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
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_voice_times_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [4,5,19,20,25]);
                    })
                    .run();
                });
                it("case 2 > to state_end_voice_confirm", function() {
                    return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
                        , '05059993333'  // msg_receiver_msisdn
                        , '2'  // main_menu - msg_pref
                        , '1'  // state_change_menu_sms - change text to voice
                        , '1'  // state_voice_days - Mon & Wed
                        , '2'  // state_voice_times - 2-5pm
                    )
                    .check.interaction({
                        state: 'state_end_voice_confirm'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_voice_confirm_3.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [4,5,19,20,21,25,28,30]);
                    })
                    .run();
                });
            });
            describe("Change from Voice to SMS messages", function() {
                it("case 3 > to state_change_menu_voice if registered for voice", function() {
                    return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
                        , '05059996666'  // msg_receiver_msisdn
                        , '2'  // main_menu - msg_pref
                    )
                    .check.interaction({
                        state: 'state_change_menu_voice'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_change_menu_voice_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [7,12,13,22,23,25]);
                    })
                    .run();
                });
                it("case 3 > to state_end_sms_confirm", function() {
                    return tester
                    .setup.user.addr('+07070050005')
                    .inputs(
                        {session_event: 'new'}
                        , '05059996666'  // msg_receiver_msisdn
                        , '2'  // state_main_menu - msg_pref
                        , '2'  // state_change_menu_voice - voice to text
                    )
                    .check.interaction({
                        state: 'state_end_sms_confirm'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_end_sms_confirm_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [7,12,13,22,23,24,25,29]);
                    })
                    .run();
                });
            });
        });

        describe("Flow from main menu - change number", function() {
            it("case 1 > to state_new_msisdn", function() {
                return tester
                .setup.user.addr('+2345059992222')
                .inputs(
                    {session_event: 'new'}
                    , '05059992222' // state_msg_receiver_msisdn
                    , '3'           // state_main_menu - number
                )
                .check.interaction({
                    state: 'state_new_msisdn'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_new_msisdn_1.mp3'],
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
                    state: 'state_new_msisdn'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: [
                                'http://localhost:8004/api/v1/ibo_NG/state_error_invalid_number.mp3',
                                'http://localhost:8004/api/v1/ibo_NG/state_new_msisdn_1.mp3'
                            ],
                            wait_for: '#',
                            barge_in: true
                        }
                    }
                })
                .run();
            });
            it("case 1 > to state_number_in_use", function() {
                return tester
                .setup.user.addr('+2345059992222')
                .inputs(
                    {session_event: 'new'}
                    , '05059992222' // state_msg_receiver_msisdn
                    , '3'           // state_main_menu - number
                    , '05059993333'  // state_new_msisdn
                )
                .check.interaction({
                    state: 'state_number_in_use'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_number_in_use_1.mp3'],
                            wait_for: '#',
                            barge_in: true
                        }
                    }
                })
                .run();
            });
            it("case 1 > to state_new_msisdn (via state_number_in_use)", function() {
                return tester
                .setup.user.addr('+2345059992222')
                .inputs(
                    {session_event: 'new'}
                    , '05059992222' // state_msg_receiver_msisdn
                    , '3'           // state_main_menu - number
                    , '05059993333'       // state_new_msisdn
                    , '1'  // state_number_in_use - try a different number
                )
                .check.interaction({
                    state: 'state_new_msisdn'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_new_msisdn_1.mp3'],
                            wait_for: '#',
                            barge_in: true
                        }
                    }
                })
                .run();
            });
            it("case 1 > to state_end_exit", function() {
                return tester
                .setup.user.addr('+2345059992222')
                .inputs(
                    {session_event: 'new'}
                    , '05059992222' // state_msg_receiver_msisdn
                    , '3'           // state_main_menu - number
                    , '05059993333'  // state_new_msisdn
                    , '2'  // state_number_in_use - exit

                )
                .check.interaction({
                    state: 'state_end_exit'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_end_exit_1.mp3'],
                            wait_for: '#',
                            barge_in: false
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
                    state: 'state_end_new_msisdn'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_end_new_msisdn_1.mp3'],
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
                    , '05059992222' // state_msg_receiver_msisdn
                    , '4'           // state_main_menu - language
                )
                .check.interaction({
                    state: 'state_msg_language'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_msg_language_1.mp3'],
                            wait_for: '#',
                            barge_in: true
                        }
                    }
                })
                .check.user.properties({lang: 'ibo_NG'})
                .run();
            });

            it("case 1 > to state_end_msg_language", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
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
            it("case 2 > to state_end_msg_language_confirm", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '05059993333' // state_msg_receiver_msisdn
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
                .run();
            });
            it("case 3 > to state_end_msg_language_confirm", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '05059996666' // state_msg_receiver_msisdn
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
                .run();
            });
            it("case 4 > to state_end_msg_language_confirm", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '05059997777' // state_msg_receiver_msisdn
                    , '3'           // state_main_menu_household - language
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
                        state: 'state_optout_reason'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_optout_reason_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,9,25]);
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
                        state: 'state_loss_subscription'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_loss_subscription_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,9,25]);
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
                        state: 'state_end_loss_subscription_confirm'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_end_loss_subscription_confirm_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,9,25,31]);
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
                        state: 'state_end_loss'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_end_loss_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,9,25,77]);
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
                        state: 'state_end_loss'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_end_loss_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,9,25,78]);
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
                        state: 'state_end_loss'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_end_loss_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,9,25,79]);
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
                        state: 'state_end_optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_end_optout_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,9,25,80]);
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
                        state: 'state_end_optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_end_optout_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [2,9,25,81]);
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
                                speech_url: ['http://localhost:8004/api/v1/ibo_NG/state_main_menu_1.mp3'],
                                wait_for: '#',
                                barge_in: true
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
                        state: 'state_optout_reason'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_optout_reason_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [4,5,25]);
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
                        state: 'state_loss_subscription'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_loss_subscription_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [4,5,25]);
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
                        state: 'state_end_loss_subscription_confirm'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_loss_subscription_confirm_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [4,5,25,32,33]);
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
                        state: 'state_end_loss'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_loss_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [4,5,25,82]);
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
                        state: 'state_end_loss'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_loss_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [4,5,25,83]);
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
                        state: 'state_end_loss'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_loss_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [4,5,25,84]);
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
                        state: 'state_optout_receiver'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_optout_receiver_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [4,5,25]);
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
                        state: 'state_end_optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_optout_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [4,5,25,52]);
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
                        state: 'state_end_optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_optout_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [4,5,25,60]);
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
                        state: 'state_end_optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_optout_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [4,5,25,52,85]);
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
                        state: 'state_optout_receiver'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_optout_receiver_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [4,5,25]);
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
                        state: 'state_end_optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_optout_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [4,5,25,57]);
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
                        state: 'state_end_optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_optout_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [4,5,25,61]);
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
                        state: 'state_end_optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_optout_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [4,5,25,57,86]);
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
                        state: 'state_optout_reason'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_optout_reason_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [7,12,13,25]);
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
                        state: 'state_loss_subscription'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_loss_subscription_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [7,12,13,25]);
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
                        state: 'state_end_loss_subscription_confirm'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_end_loss_subscription_confirm_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [7,12,13,25,34,92]);
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
                        state: 'state_end_loss'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_end_loss_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [7,12,13,25,87,92]);
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
                        state: 'state_end_loss'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_end_loss_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [7,12,13,25,88,93]);
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
                        state: 'state_end_loss'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_end_loss_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [7,12,13,25,89,94]);
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
                        state: 'state_optout_receiver'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_optout_receiver_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [7,12,13,25]);
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
                        state: 'state_end_optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_end_optout_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [7,12,13,25,90]);
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
                        state: 'state_end_optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_end_optout_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [7,12,13,25,95]);
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
                        state: 'state_end_optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_end_optout_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [7,12,13,25,90,95]);
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
                        state: 'state_optout_receiver'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_optout_receiver_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [7,12,13,25]);
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
                        state: 'state_end_optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_end_optout_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [7,12,13,25,91]);
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
                        state: 'state_end_optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_end_optout_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [7,12,13,25,96]);
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
                        state: 'state_end_optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/pcm_NG/state_end_optout_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [7,12,13,25,91,96]);
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
                        state: 'state_optout_reason'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_optout_reason_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [6,7,13,25]);
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
                        state: 'state_loss_subscription'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_loss_subscription_1.mp3'],
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [6,7,13,25]);
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
                        state: 'state_end_loss_subscription_confirm'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_loss_subscription_confirm_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [6,7,13,25,34,92]);
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
                        state: 'state_end_loss'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_loss_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [6,7,13,25,87,92]);
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
                        state: 'state_end_loss'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_loss_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [6,7,13,25,88,93]);
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
                        state: 'state_end_loss'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_loss_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [6,7,13,25,89,94]);
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
                        state: 'state_end_optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_optout_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [6,7,13,25,95]);
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
                        state: 'state_end_optout'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: ['http://localhost:8004/api/v1/hau_NG/state_end_optout_1.mp3'],
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [6,7,13,25,96]);
                    })
                    .run();
                });
            });
        });
    });
});
