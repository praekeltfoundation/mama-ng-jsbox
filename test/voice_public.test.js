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
                    name: 'voice-public-test',
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
                        messagesets: {
                            api_token: 'test_token_messagesets',
                            url: "http://localhost:8003/api/v1/"
                        },
                        voice_content: {
                            api_token: "test_token_voice_content",
                            url: "http://localhost:8004/api/v1/"
                        },
                        change: {
                            api_token: 'test_token_change',
                            url: "http://localhost:8005/api/v1/"
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
            it("should navigate to state_msg_receiver_msisdn", function() {
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
                        var expected_used = [25];
                        var fixts = api.http.fixtures.fixtures;
                        var fixts_used = [];
                        fixts.forEach(function(f, i) {
                            f.uses > 0 ? fixts_used.push(i) : null;
                        });
                        assert.deepEqual(fixts_used, expected_used);
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
                    .check(function(api) {
                        var expected_used = [25];
                        var fixts = api.http.fixtures.fixtures;
                        var fixts_used = [];
                        fixts.forEach(function(f, i) {
                        f.uses > 0 ? fixts_used.push(i) : null;
                        });
                        assert.deepEqual(fixts_used, expected_used);
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
                    .check(function(api) {
                        var expected_used = [25];
                        var fixts = api.http.fixtures.fixtures;
                        var fixts_used = [];
                        fixts.forEach(function(f, i) {
                        f.uses > 0 ? fixts_used.push(i) : null;
                        });
                        assert.deepEqual(fixts_used, expected_used);
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
                    .check(function(api) {
                        var expected_used = [25];
                        var fixts = api.http.fixtures.fixtures;
                        var fixts_used = [];
                        fixts.forEach(function(f, i) {
                            f.uses > 0 ? fixts_used.push(i) : null;
                        });
                        assert.deepEqual(fixts_used, expected_used);
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
                    .check(function(api) {
                        var expected_used = [2,25];
                        var fixts = api.http.fixtures.fixtures;
                        var fixts_used = [];
                        fixts.forEach(function(f, i) {
                            f.uses > 0 ? fixts_used.push(i) : null;
                        });
                        assert.deepEqual(fixts_used, expected_used);
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
                        state: 'state_msisdn_not_recognised',
                        reply: [
                        'Number not recognised.',
                        '1. If you entered the incorrect number, press 1',
                        '2. to exit, press 2'
                        ].join('\n')
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_msisdn_not_recognised_1.mp3',
                                wait_for: '#',
                                barge_in: true
                            }
                        }
                    })
                    .check(function(api) {
                        var expected_used = [0,25];
                        var fixts = api.http.fixtures.fixtures;
                        var fixts_used = [];
                        fixts.forEach(function(f, i) {
                            f.uses > 0 ? fixts_used.push(i) : null;
                        });
                        assert.deepEqual(fixts_used, expected_used);
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
                        var expected_used = [0,25];
                        var fixts = api.http.fixtures.fixtures;
                        var fixts_used = [];
                        fixts.forEach(function(f, i) {
                            f.uses > 0 ? fixts_used.push(i) : null;
                        });
                        assert.deepEqual(fixts_used, expected_used);
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
                        state: 'state_end_exit',
                        reply: 'Thank you for using the Hello Mama service. Goodbye.'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_exit_1.mp3',
                                wait_for: '#',
                                barge_in: false
                            }
                        }
                    })
                    .check(function(api) {
                        var expected_used = [0,25];
                        var fixts = api.http.fixtures.fixtures;
                        var fixts_used = [];
                        fixts.forEach(function(f, i) {
                            f.uses > 0 ? fixts_used.push(i) : null;
                        });
                        assert.deepEqual(fixts_used, expected_used);
                    })
                    .run();
            });
        });

        describe.skip("Flow from main menu - baby messages", function() {
            it("should navigate to state_baby_already_subscribed", function() {
                return tester
                .setup.user.addr('082333')
                .inputs(
                    {session_event: 'new'}
                    , '05059992222'  // msg_receiver_msisdn
                    , '1'  // main_menu - baby
                )
                .check.interaction({
                    state: 'state_baby_already_subscribed',
                    reply: 'You are already subscribed. To go back to main menu, 0 then #'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_baby_already_subscribed_1.mp3',
                            wait_for: '#',
                            barge_in: true
                        }
                    }
                })
                .run();
            });
            it("should navigate to state_baby_confirm_subscription", function() {
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
            it("should navigate to state_end_baby", function() {
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
            it("should navigate to state_change_menu_sms if registered for sms", function() {
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
                .check(function(api) {
                    var expected_used = [2,16,17,25];
                    var fixts = api.http.fixtures.fixtures;
                    var fixts_used = [];
                    fixts.forEach(function(f, i) {
                        f.uses > 0 ? fixts_used.push(i) : null;
                    });
                    assert.deepEqual(fixts_used, expected_used);
                })
                .run();
            });
            it("should navigate to state_voice_days", function() {
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
                .check(function(api) {
                    var expected_used = [2,16,17,25];
                    var fixts = api.http.fixtures.fixtures;
                    var fixts_used = [];
                    fixts.forEach(function(f, i) {
                        f.uses > 0 ? fixts_used.push(i) : null;
                    });
                    assert.deepEqual(fixts_used, expected_used);
                })
                .run();
            });
            it("should navigate to state_voice_times", function() {
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
                .check(function(api) {
                    var expected_used = [2,16,17,25];
                    var fixts = api.http.fixtures.fixtures;
                    var fixts_used = [];
                    fixts.forEach(function(f, i) {
                        f.uses > 0 ? fixts_used.push(i) : null;
                    });
                    assert.deepEqual(fixts_used, expected_used);
                })
                .run();
            });
            it("should navigate to state_end_voice_confirm", function() {
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
                .check(function(api) {
                    var expected_used = [2,9,16,17,18,25,26];
                    var fixts = api.http.fixtures.fixtures;
                    var fixts_used = [];
                    fixts.forEach(function(f, i) {
                        f.uses > 0 ? fixts_used.push(i) : null;
                    });
                    assert.deepEqual(fixts_used, expected_used);
                })
                .run();
            });
            it("should navigate to state_change_menu_voice if registered for voice", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '05059996666'  // msg_receiver_msisdn
                    , '2'  // main_menu - msg_pref
                )
                .check.interaction({
                    state: 'state_change_menu_voice',
                    reply: [
                        'Please select what you would like to do:',
                        '1. Change times',
                        '2. Change mother message from voice to text'
                    ].join('\n')
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_change_menu_voice_1.mp3',
                            wait_for: '#',
                            barge_in: true
                        }
                    }
                })
                .check(function(api) {
                    var expected_used = [12,22,23,25];
                    var fixts = api.http.fixtures.fixtures;
                    var fixts_used = [];
                    fixts.forEach(function(f, i) {
                        f.uses > 0 ? fixts_used.push(i) : null;
                    });
                    assert.deepEqual(fixts_used, expected_used);
                })
                .run();
            });
            it("should navigate to state_voice_days", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '05059996666'  // msg_receiver_msisdn
                    , '2'  // state_main_menu - msg_pref
                    , '1'  // state_change_menu_voice
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
                .check(function(api) {
                    var expected_used = [12,22,23,25];
                    var fixts = api.http.fixtures.fixtures;
                    var fixts_used = [];
                    fixts.forEach(function(f, i) {
                        f.uses > 0 ? fixts_used.push(i) : null;
                    });
                    assert.deepEqual(fixts_used, expected_used);
                })
                .run();
            });
            it("should navigate to state_end_sms_confirm", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '05059996666'  // msg_receiver_msisdn
                    , '2'  // state_main_menu - msg_pref
                    , '2'  // state_change_menu_voice
                )
                .check.interaction({
                    state: 'state_end_sms_confirm',
                    reply: 'Thank you. You will now receive text messages.'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_sms_confirm_1.mp3',
                            wait_for: '#',
                            barge_in: true
                        }
                    }
                })
                .check(function(api) {
                    var expected_used = [12,22,23,25];
                    var fixts = api.http.fixtures.fixtures;
                    var fixts_used = [];
                    fixts.forEach(function(f, i) {
                        f.uses > 0 ? fixts_used.push(i) : null;
                    });
                    assert.deepEqual(fixts_used, expected_used);
                })
                .run();
            });
        });

        describe("Flow from main menu - change number", function() {
            it("should navigate to state_new_msisdn", function() {
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
            it("should navigate to state_new_msisdn (invalid number)", function() {
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
            it("should navigate to state_number_in_use", function() {
                return tester
                .setup.user.addr('+2345059992222')
                .inputs(
                    {session_event: 'new'}
                    , '05059992222' // state_msg_receiver_msisdn
                    , '3'           // state_main_menu - number
                    , '05059993333'  // state_new_msisdn
                )
                .check.interaction({
                    state: 'state_number_in_use',
                    reply: [
                        'Sorry, this number is already registered',
                        '1. To try a different number, press 1',
                        '2. To exit, press 2'
                    ].join('\n')
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_number_in_use_1.mp3',
                            wait_for: '#',
                            barge_in: true
                        }
                    }
                })
                .run();
            });
            it("should navigate to state_new_msisdn (via state_number_in_use)", function() {
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
            it("should navigate to state_end_exit", function() {
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
                    state: 'state_end_exit',
                    reply: 'Thank you for using the Hello Mama service. Goodbye.'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_exit_1.mp3',
                            wait_for: '#',
                            barge_in: false
                        }
                    }
                })
                .run();
            });
            it("should navigate to state_end_new_msisdn", function() {
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

        describe.skip("Flow from main menu - change language", function() {
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
            it("should navigate to state_end_msg_language", function() {
                return tester
                .setup.user.addr('+07070050005')
                .inputs(
                    {session_event: 'new'}
                    , '05059992222' // state_msg_receiver_msisdn
                    , '4'           // state_main_menu - language
                    , '3'   // state_msg_language - igbo
                )
                .check.interaction({
                    state: 'state_end_msg_language',
                    reply: 'Thank you. Language preference updated.'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_msg_language_1.mp3',
                            wait_for: '#',
                            barge_in: true
                        }
                    }
                })
                .run();
            });
        });

        describe("Flow from main menu - optout", function() {
            it("should navigate to state_optout_reason", function() {
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
                .check(function(api) {
                    var expected_used = [4,5,25];
                    var fixts = api.http.fixtures.fixtures;
                    var fixts_used = [];
                    fixts.forEach(function(f, i) {
                        f.uses > 0 ? fixts_used.push(i) : null;
                    });
                    assert.deepEqual(fixts_used, expected_used);
                })
                .run();
            });
            it("miscarriage; should navigate to state_loss_opt_in", function() {
                return tester
                .setup.user.addr('+2345059992222')
                .inputs(
                    {session_event: 'new'}
                    , '05059993333'  // msg_receiver_msisdn
                    , '5'  // main_menu - optout
                    , '1'  // optout_reason - miscarriage
                )
                .check.interaction({
                    state: 'state_loss_opt_in',
                    reply: [
                    'Receive loss messages?',
                    '1. opt_in_confirm',
                    '2. opt_in_deny'
                    ].join('\n')
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_loss_opt_in_1.mp3',
                            wait_for: '#',
                            barge_in: true
                        }
                    }
                })
                .check(function(api) {
                    var expected_used = [4,5,25];
                    var fixts = api.http.fixtures.fixtures;
                    var fixts_used = [];
                    fixts.forEach(function(f, i) {
                        f.uses > 0 ? fixts_used.push(i) : null;
                    });
                    assert.deepEqual(fixts_used, expected_used);
                })
                .run();
            });
            it("stillborn; should navigate to state_end_loss", function() {
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
                            barge_in: true
                        }
                    }
                })
                .check(function(api) {
                    var expected_used = [4,5,25];
                    var fixts = api.http.fixtures.fixtures;
                    var fixts_used = [];
                    fixts.forEach(function(f, i) {
                        f.uses > 0 ? fixts_used.push(i) : null;
                    });
                    assert.deepEqual(fixts_used, expected_used);
                })
                .run();
            });
            it("baby passed away; should navigate to state_end_loss", function() {
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
                            barge_in: true
                        }
                    }
                })
                .check(function(api) {
                    var expected_used = [4,5,25];
                    var fixts = api.http.fixtures.fixtures;
                    var fixts_used = [];
                    fixts.forEach(function(f, i) {
                    f.uses > 0 ? fixts_used.push(i) : null;
                    });
                    assert.deepEqual(fixts_used, expected_used);
                })
                .run();
            });
            it("not useful; should navigate to state_optout_receiver", function() {
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
                .check(function(api) {
                    var expected_used = [4,5,25];
                    var fixts = api.http.fixtures.fixtures;
                    var fixts_used = [];
                    fixts.forEach(function(f, i) {
                    f.uses > 0 ? fixts_used.push(i) : null;
                    });
                    assert.deepEqual(fixts_used, expected_used);
                })
                .run();
            });
            it("should navigate to state_end_optout", function() {
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
                    reply: 'Thank you - optout'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_optout_1.mp3',
                            wait_for: '#',
                            barge_in: true
                        }
                    }
                })
                .check(function(api) {
                    var expected_used = [4,5,25];
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
            it("other; should navigate to state_end_optout", function() {
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
                .check(function(api) {
                    var expected_used = [4,5,25];
                    var fixts = api.http.fixtures.fixtures;
                    var fixts_used = [];
                    fixts.forEach(function(f, i) {
                    f.uses > 0 ? fixts_used.push(i) : null;
                    });
                    assert.deepEqual(fixts_used, expected_used);
                })
                .run();
            });
            it("should navigate to state_end_optout", function() {
                return tester
                .setup.user.addr('+2345059992222')
                .inputs(
                    {session_event: 'new'}
                    , '05059993333'  // msg_receiver_msisdn
                    , '5'  // main_menu - optout
                    , '4'  // optout_reason - not_useful
                    , '2'  // state_optout_receiver - household messsages
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
                            barge_in: true
                        }
                    }
                })
                .check(function(api) {
                    var expected_used = [4,5,25];
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
            it("loss messagages opt-in; should navigate to state_end_loss_opt_in", function() {
                return tester
                .setup.user.addr('+2345059992222')
                .inputs(
                    {session_event: 'new'}
                    , '05059993333'  // msg_receiver_msisdn
                    , '5'  // main_menu - optout
                    , '1'  // optout_reason - miscarriage
                    , '1'  // loss_opt_in - confirm opt in
                )
                .check.interaction({
                    state: 'state_end_loss_opt_in',
                    reply: 'Thank you - loss opt in'
                })
                .check.reply.properties({
                    helper_metadata: {
                        voice: {
                            speech_url: 'http://localhost:8004/api/v1/eng_NG/state_end_loss_opt_in_1.mp3',
                            wait_for: '#',
                            barge_in: true
                        }
                    }
                })
                .check(function(api) {
                    var expected_used = [2,4,5,25,27];
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

            it("loss messages opt-out; should navigate to state_end_optout", function() {
                return tester
                .setup.user.addr('+2345059992222')
                .inputs(
                    {session_event: 'new'}
                    , '05059993333'  // msg_receiver_msisdn
                    , '5'  // main_menu - optout
                    , '1'  // optout_reason - miscarriage
                    , '2'  // loss_opt_in - deny opt in
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
                            barge_in: true
                        }
                    }
                })
                .check(function(api) {
                    var expected_used = [2,4,5,25,27];
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
            it("0 should restart", function() {
                return tester
                .setup.user.addr('+2345059992222')
                .inputs(
                    {session_event: 'new'}
                    , '05059993333'  // msg_receiver_msisdn
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
    });
});
