var vumigo = require('vumigo_v02');
var fixtures_IdentityStoreDynamic = require('./fixtures_identity_store_dynamic');
var fixtures_RegistrationDynamic = require('./fixtures_registration_dynamic');
var fixtures_StageBasedMessagingDynamic = require('./fixtures_stage_based_messaging_dynamic');
var AppTester = vumigo.AppTester;
var assert = require('assert');

var utils = require('seed-jsbox-utils').utils;

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
                    metric_store: 'test_metric_store',
                    default_day: 'tue',
                    default_time: '6_8',
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
                    api.http.fixtures.add(
                        fixtures_RegistrationDynamic().add_voice_file_check());
                });
        });


        // TEST ANSWER RESET

        describe("When you go back to the main menu", function() {
            it("should reset the user answers", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080070007',
                                search_value: '12345',
                                identity: 'cb245673-aa41-4302-ac47-00000000007',
                                search_param: 'details__corp_code',
                            }));
                    })
                    .setup.user.addr('07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '12345'  // state_corp_auth
                        , '0'  // restart
                    )
                    .check.interaction({
                        state: 'state_msg_receiver'
                    })
                    .check.user.answers({
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "state_corp_auth": "12345"
                    })
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
                        .check(function(api) {
                            utils.check_fixtures_used(api, [0]);
                        })
                        .check(function(api) {
                            var metrics = api.metrics.stores.test_metric_store;
                            assert.deepEqual(metrics, undefined);
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));
                        })
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
                        .check(function(api) {
                            var metrics = api.metrics.stores.test_metric_store;
                            assert.deepEqual(metrics['test.voice_registration_test.registrations_started'].values, [1]);
                            assert.deepEqual(metrics['test.voice_registration_test.registrations_completed'], undefined);
                            assert.deepEqual(metrics['test.voice_registration_test.time_to_register'], undefined);
                        })
                        .run();
                });
            });

            describe("if corp code does not validate", function() {
                it("should retry", function() {
                    return tester
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    search_value: 'aaaaa',
                                    search_param: 'details__corp_code',
                                    empty: true,
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    search_value: 'aaaaa',
                                    search_param: 'details__corp_code',
                                    empty: true,
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    search_value: 'aaaaa',
                                    search_param: 'details__corp_code',
                                    empty: true,
                                }));
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    search_value: '0',
                                    search_param: 'details__corp_code',
                                    empty: true,
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    search_value: 'aaaaa',
                                    search_param: 'details__corp_code',
                                    empty: true,
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));
                        })
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
                it("to state_msisdn_already_registered (from state_msisdn_mother)", function() {
                    return tester
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2347070050005',
                                    identity: 'cb245673-aa41-4302-ac47-00000000005',
                                    extra_details: {
                                        "receiver_role": "mother",
                                        "linked_to": null,
                                        "preferred_msg_type": "text",
                                        "preferred_language": "ibo_NG"
                                    }
                                }));

                            api.http.fixtures.add(
                                fixtures_StageBasedMessagingDynamic().messageset({
                                    id: 0,
                                    short_name: 'public.mother.1'
                                }));

                            api.http.fixtures.add(
                                fixtures_StageBasedMessagingDynamic().active_subscriptions({
                                    identity: 'cb245673-aa41-4302-ac47-00000000005',
                                    messagesets: [0]
                                }));
                        })
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_corp_auth
                            , '1'            // state_msg_receiver - mother_father
                            , '07070050005'  // state_msisdn_mother
                        )
                        .check.interaction({
                            state: 'state_msisdn_already_registered'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msisdn_already_registered_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
                it("to state_msisdn_mother (from state_msisdn_already_registered)", function() {
                    return tester
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2347070050005',
                                    identity: 'cb245673-aa41-4302-ac47-00000000005',
                                    extra_details: {
                                        "receiver_role": "mother",
                                        "linked_to": null,
                                        "preferred_msg_type": "text",
                                        "preferred_language": "ibo_NG"
                                    }
                                }));

                            api.http.fixtures.add(
                                fixtures_StageBasedMessagingDynamic().messageset({
                                    id: 0,
                                    short_name: 'public.mother.1'
                                }));

                            api.http.fixtures.add(
                                fixtures_StageBasedMessagingDynamic().active_subscriptions({
                                    identity: 'cb245673-aa41-4302-ac47-00000000005',
                                    messagesets: [0]
                                }));
                        })
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_corp_auth
                            , '1'            // state_msg_receiver - mother_father
                            , '07070050005'  // state_msisdn_mother
                            , '1'            // state_msisdn_already_registered
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
                it("to state_msisdn_household (father message receiver)", function() {
                    return tester
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2349094444444',
                                    empty: true,
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2349094444444',
                                    empty: true,
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2349094444444',
                                    empty: true,
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2349094444444',
                                    empty: true,
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2349094444444',
                                    empty: true,
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2349095555555',
                                    empty: true,
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().create_identity({
                                    identity: 'cb245673-aa41-4302-ac47-9094444444',
                                    msisdn: '+2349094444444',
                                    default_addr_type: 'msisdn',
                                    operator: 'cb245673-aa41-4302-ac47-00000000007',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().create_identity({
                                    identity: 'cb245673-aa41-4302-ac47-9095555555',
                                    msisdn: '+2349095555555',
                                    default_addr_type: 'msisdn',
                                    operator: 'cb245673-aa41-4302-ac47-00000000007',
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2349092222222',
                                    empty: true,
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().create_identity({
                                    identity: 'cb245673-aa41-4302-ac47-9092222222',
                                    msisdn: '+2349092222222',
                                    default_addr_type: 'msisdn',
                                    operator: 'cb245673-aa41-4302-ac47-00000000007',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().create_identity({
                                    communicate_through: 'cb245673-aa41-4302-ac47-9092222222',
                                    identity: 'cb245673-aa41-4302-ac47-1234567890',
                                    operator: 'cb245673-aa41-4302-ac47-00000000007',
                                    default_addr_type: null,
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2349092222222',
                                    empty: true,
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().create_identity({
                                    identity: 'cb245673-aa41-4302-ac47-9092222222',
                                    msisdn: '+2349092222222',
                                    default_addr_type: 'msisdn',
                                    operator: 'cb245673-aa41-4302-ac47-00000000007',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().create_identity({
                                    communicate_through: 'cb245673-aa41-4302-ac47-9092222222',
                                    identity: 'cb245673-aa41-4302-ac47-1234567890',
                                    operator: 'cb245673-aa41-4302-ac47-00000000007',
                                    default_addr_type: null,
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2349097777777',
                                    identity: '3f7c8851-5204-43f7-af7f-009097777777',
                                    extra_details: {
                                        "receiver_role": "mother",
                                        "linked_to": null,
                                        "preferred_msg_type": "text",
                                        "preferred_language": "ibo_NG",
                                    }
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().create_identity({
                                    communicate_through: '3f7c8851-5204-43f7-af7f-009097777777',
                                    identity: 'cb245673-aa41-4302-ac47-1234567890',
                                    operator: 'cb245673-aa41-4302-ac47-00000000007',
                                    default_addr_type: null,
                                }));

                        })
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
                it("to state_msisdn_already_registered", function() {
                    return tester
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2349097777777',
                                    identity: '3f7c8851-5204-43f7-af7f-009097777777',
                                    extra_details: {
                                        "receiver_role": "mother",
                                        "linked_to": null,
                                        "preferred_msg_type": "text",
                                        "preferred_language": "ibo_NG",
                                    }
                                }));

                            api.http.fixtures.add(
                                fixtures_StageBasedMessagingDynamic().messageset({
                                    id: 0,
                                    short_name: 'public.mother.1'
                                }));

                            api.http.fixtures.add(
                                fixtures_StageBasedMessagingDynamic().active_subscriptions({
                                    identity: '3f7c8851-5204-43f7-af7f-009097777777',
                                    messagesets: [0]
                                }));
                        })
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_corp_auth
                            , '2'            // state_msg_receiver - mother_only
                            , '09097777777'  // state_msisdn
                        )
                        .check.interaction({
                            state: 'state_msisdn_already_registered'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_msisdn_already_registered_1.mp3'],
                                    wait_for: '#',
                                    barge_in: true
                                }
                            }
                        })
                        .run();
                });
                it("to state_msisdn (from state_msisdn_already_registered)", function() {
                    return tester
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2349097777777',
                                    identity: '3f7c8851-5204-43f7-af7f-009097777777',
                                    extra_details: {
                                        "receiver_role": "mother",
                                        "linked_to": null,
                                        "preferred_msg_type": "text",
                                        "preferred_language": "ibo_NG",
                                    }
                                }));

                            api.http.fixtures.add(
                                fixtures_StageBasedMessagingDynamic().messageset({
                                    id: 0,
                                    short_name: 'public.mother.1'
                                }));

                            api.http.fixtures.add(
                                fixtures_StageBasedMessagingDynamic().active_subscriptions({
                                    identity: '3f7c8851-5204-43f7-af7f-009097777777',
                                    messagesets: [0]
                                }));
                        })
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_corp_auth
                            , '2'            // state_msg_receiver - mother_only
                            , '09097777777'  // state_msisdn
                            , '1'  // state_msisdn_already_registered - register a diff num
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
                it("to state_msg_receiver (from state_msisdn_already_registered)", function() {
                    return tester
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2349097777777',
                                    identity: '3f7c8851-5204-43f7-af7f-009097777777',
                                    extra_details: {
                                        "receiver_role": "mother",
                                        "linked_to": null,
                                        "preferred_msg_type": "text",
                                        "preferred_language": "ibo_NG",
                                    }
                                }));

                            api.http.fixtures.add(
                                fixtures_StageBasedMessagingDynamic().messageset({
                                    id: 0,
                                    short_name: 'public.mother.1'
                                }));

                            api.http.fixtures.add(
                                fixtures_StageBasedMessagingDynamic().active_subscriptions({
                                    identity: '3f7c8851-5204-43f7-af7f-009097777777',
                                    messagesets: [0]
                                }));
                        })
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_corp_auth
                            , '2'            // state_msg_receiver - mother_only
                            , '09097777777'  // state_msisdn
                            , '2'  // state_msisdn_already_registered - choose diff receiver
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
                it("to state_end_msisdn (from state_msisdn_already_registered)", function() {
                    return tester
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2349097777777',
                                    identity: '3f7c8851-5204-43f7-af7f-009097777777',
                                    extra_details: {
                                        "receiver_role": "mother",
                                        "linked_to": null,
                                        "preferred_msg_type": "text",
                                        "preferred_language": "ibo_NG",
                                    }
                                }));

                            api.http.fixtures.add(
                                fixtures_StageBasedMessagingDynamic().messageset({
                                    id: 0,
                                    short_name: 'public.mother.1'
                                }));

                            api.http.fixtures.add(
                                fixtures_StageBasedMessagingDynamic().active_subscriptions({
                                    identity: '3f7c8851-5204-43f7-af7f-009097777777',
                                    messagesets: [0]
                                }));
                        })
                        .setup.user.addr('07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '12345'        // state_corp_auth
                            , '2'            // state_msg_receiver - mother_only
                            , '09097777777'  // state_msisdn
                            , '3'  // state_msisdn_already_registered - exit
                        )
                        .check.interaction({
                            state: 'state_end_msisdn'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: ['http://localhost:8004/api/v1/eng_NG/state_end_msisdn_1.mp3'],
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

        describe("When a msisdn exists but is opted out", function() {
            it("should navigate to state_msg_language", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080070007',
                                search_value: '12345',
                                identity: 'cb245673-aa41-4302-ac47-00000000007',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2347030010009',
                                identity: 'cb245673-aa41-4302-ac47-00000000009',
                                opted_out: true,
                                extra_details: {
                                    "receiver_role": "mother",
                                },
                            }));

                        api.http.fixtures.add(
                            fixtures_StageBasedMessagingDynamic().active_subscriptions({
                                identity: 'cb245673-aa41-4302-ac47-00000000009',
                                messagesets: []
                            }));

                    })
                    .setup.user.addr('07030010009')
                    .inputs(
                        {session_event: 'new'}
                        , '12345'       // state_corp_auth
                        , '2'           // state_msg_receiver - friend_only
                        , '07030010009' // state_msisdn
                    )
                    .check.interaction({
                        state: 'state_msg_language'
                    })
                    .run();
            });
            it("should update to remove the optedout flag", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080070007',
                                search_value: '12345',
                                identity: 'cb245673-aa41-4302-ac47-00000000007',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2347030010009',
                                identity: 'cb245673-aa41-4302-ac47-00000000009',
                                opted_out: true,
                                extra_details: {
                                    "receiver_role": "mother",
                                },
                            }));

                        api.http.fixtures.add(
                            fixtures_StageBasedMessagingDynamic().active_subscriptions({
                                identity: 'cb245673-aa41-4302-ac47-00000000009',
                                messagesets: []
                            }));

                        api.http.fixtures.add(
                            fixtures_RegistrationDynamic().create_registration({
                                identity: 'cb245673-aa41-4302-ac47-00000000009',
                                operator: 'cb245673-aa41-4302-ac47-00000000007',
                                receiver: 'cb245673-aa41-4302-ac47-00000000009',
                                language: 'ibo_NG',
                                msg_type: 'text',
                                msg_receiver: 'mother_only'
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2347030010009',
                                identity: 'cb245673-aa41-4302-ac47-00000000009',
                                opted_out: true,
                                extra_details: {
                                    "receiver_role": "mother",
                                },
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().patch_identity({
                                msisdn: '+2347030010009',
                                identity: 'cb245673-aa41-4302-ac47-00000000009',
                                extra_details: {
                                    "receiver_role": "mother",
                                    "preferred_language": "ibo_NG",
                                    "preferred_msg_type": "text",
                                    "linked_to": null,
                                    "default_addr_type": "msisdn",
                                }
                            }));

                    })
                    .setup.user.addr('07030010009')
                    .inputs(
                        {session_event: 'new'}
                        , '12345'       // state_corp_auth
                        , '2'           // state_msg_receiver - mother_only
                        , '07030010009' // state_msisdn
                        , '2'           // state_msg_language - igbo
                        , '2'           // state_msg_type - sms
                    )
                    .check.interaction({
                        state: 'state_end_sms_corp'
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [0, 1, 2, 3, 4, 5, 6]);
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });

        describe("When you enter a choice state_msg_receiver", function() {
            describe("if it is a valid choice", function() {
                it("should navigate to state_msg_language", function() {
                    return tester
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2349094444444',
                                    empty: true,
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2349095555555',
                                    empty: true,
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().create_identity({
                                    identity: 'cb245673-aa41-4302-ac47-9094444444',
                                    msisdn: '+2349094444444',
                                    default_addr_type: 'msisdn',
                                    operator: 'cb245673-aa41-4302-ac47-00000000007',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().create_identity({
                                    identity: 'cb245673-aa41-4302-ac47-9095555555',
                                    msisdn: '+2349095555555',
                                    default_addr_type: 'msisdn',
                                    operator: 'cb245673-aa41-4302-ac47-00000000007',
                                }));

                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));
                        })
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
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080070007',
                                search_value: '12345',
                                identity: 'cb245673-aa41-4302-ac47-00000000007',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2349092222222',
                                empty: true,
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().create_identity({
                                identity: 'cb245673-aa41-4302-ac47-9092222222',
                                msisdn: '+2349092222222',
                                default_addr_type: 'msisdn',
                                operator: 'cb245673-aa41-4302-ac47-00000000007',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().create_identity({
                                communicate_through: 'cb245673-aa41-4302-ac47-9092222222',
                                identity: 'cb245673-aa41-4302-ac47-1234567890',
                                operator: 'cb245673-aa41-4302-ac47-00000000007',
                                default_addr_type: null,
                            }));
                    })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2349092222222',
                                    empty: true,
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().create_identity({
                                    identity: 'cb245673-aa41-4302-ac47-9092222222',
                                    msisdn: '+2349092222222',
                                    default_addr_type: 'msisdn',
                                    operator: 'cb245673-aa41-4302-ac47-00000000007',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().create_identity({
                                    communicate_through: 'cb245673-aa41-4302-ac47-9092222222',
                                    identity: 'cb245673-aa41-4302-ac47-1234567890',
                                    operator: 'cb245673-aa41-4302-ac47-00000000007',
                                    default_addr_type: null,
                                }));

                            api.http.fixtures.add(
                                fixtures_RegistrationDynamic().create_registration({
                                    identity: 'cb245673-aa41-4302-ac47-1234567890',
                                    operator: 'cb245673-aa41-4302-ac47-00000000007',
                                    receiver: 'cb245673-aa41-4302-ac47-9092222222',
                                    language: 'ibo_NG',
                                    msg_type: 'text',
                                    msg_receiver: 'friend_only'
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().get_identity({
                                    identity: 'cb245673-aa41-4302-ac47-1234567890',
                                    extra_details: {
                                        "communicate_through": "3f7c8851-5204-43f7-af7f-009097777777",
                                        "operator": "cb245673-aa41-4302-ac47-00000000007"
                                    },
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().get_identity({
                                    identity: 'cb245673-aa41-4302-ac47-9092222222',
                                    msisdn: '+2349092222222',
                                    extra_details: {
                                        "operator": "cb245673-aa41-4302-ac47-00000000007"
                                    },
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().patch_identity({
                                    msisdn: '+2348080020002',
                                    identity: 'cb245673-aa41-4302-ac47-1234567890',
                                    extra_details: {
                                        "receiver_role": "mother",
                                        "linked_to":"cb245673-aa41-4302-ac47-9092222222",
                                        "preferred_language": "ibo_NG",
                                        "communicate_through":"3f7c8851-5204-43f7-af7f-009097777777",
                                        "operator": "cb245673-aa41-4302-ac47-00000000007"
                                    }
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().patch_identity({
                                    msisdn: '+2349092222222',
                                    identity: 'cb245673-aa41-4302-ac47-9092222222',
                                    extra_details: {
                                        "receiver_role": "friend",
                                        "linked_to": "cb245673-aa41-4302-ac47-1234567890",
                                        "preferred_language": "ibo_NG",
                                        "preferred_msg_type": "text",
                                        "operator": "cb245673-aa41-4302-ac47-00000000007"
                                    }
                                }));
                        })
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
                        .check(function(api) {
                            utils.check_fixtures_used(api, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
                        })
                        .check(function(api) {
                            var metrics = api.metrics.stores.test_metric_store;
                            assert.deepEqual(metrics['test.voice_registration_test.registrations_started'].values, [1]);
                            assert.deepEqual(metrics['test.voice_registration_test.registrations_completed'].values, [1]);
                            assert.deepEqual(metrics['test.voice_registration_test.time_to_register'].values[0] > 0, true);
                        })
                        .check.reply.ends_session()
                        .run();
                });
            });

            describe("if you choose voice", function() {
                it("should navigate to state_end_voice_corp", function() {
                    return tester
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2349092222222',
                                    empty: true,
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().create_identity({
                                    identity: 'cb245673-aa41-4302-ac47-9092222222',
                                    msisdn: '+2349092222222',
                                    default_addr_type: 'msisdn',
                                    operator: 'cb245673-aa41-4302-ac47-00000000007',
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().create_identity({
                                    communicate_through: 'cb245673-aa41-4302-ac47-9092222222',
                                    identity: 'cb245673-aa41-4302-ac47-1234567890',
                                    operator: 'cb245673-aa41-4302-ac47-00000000007',
                                    default_addr_type: null,
                                }));

                            api.http.fixtures.add(
                                fixtures_RegistrationDynamic().create_registration({
                                    identity: 'cb245673-aa41-4302-ac47-1234567890',
                                    operator: 'cb245673-aa41-4302-ac47-00000000007',
                                    receiver: 'cb245673-aa41-4302-ac47-9092222222',
                                    language: 'ibo_NG',
                                    msg_type: 'audio',
                                    msg_receiver: 'friend_only'
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().get_identity({
                                    identity: 'cb245673-aa41-4302-ac47-1234567890',
                                    extra_details: {
                                        "communicate_through": "3f7c8851-5204-43f7-af7f-009097777777",
                                        "operator": "cb245673-aa41-4302-ac47-00000000007"
                                    },
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().get_identity({
                                    identity: 'cb245673-aa41-4302-ac47-9092222222',
                                    msisdn: '+2349092222222',
                                    extra_details: {
                                        "operator": "cb245673-aa41-4302-ac47-00000000007"
                                    },
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().patch_identity({
                                    msisdn: '+2348080020002',
                                    identity: 'cb245673-aa41-4302-ac47-1234567890',
                                    extra_details: {
                                        "receiver_role": "mother",
                                        "linked_to":"cb245673-aa41-4302-ac47-9092222222",
                                        "preferred_language": "ibo_NG",
                                        "communicate_through":"3f7c8851-5204-43f7-af7f-009097777777",
                                        "operator": "cb245673-aa41-4302-ac47-00000000007"
                                    }
                                }));

                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().patch_identity({
                                    msisdn: '+2349092222222',
                                    identity: 'cb245673-aa41-4302-ac47-9092222222',
                                    extra_details: {
                                        "receiver_role": "friend",
                                        "linked_to": "cb245673-aa41-4302-ac47-1234567890",
                                        "preferred_language": "ibo_NG",
                                        "preferred_msg_type": "audio",
                                        "operator": "cb245673-aa41-4302-ac47-00000000007",
                                        "preferred_msg_days": "tue",
                                        "preferred_msg_times": "6_8",
                                    }
                                }));
                        })
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
                        .check(function(api) {
                            utils.check_fixtures_used(api, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
                        })
                        .check(function(api) {
                            var metrics = api.metrics.stores.test_metric_store;
                            assert.deepEqual(metrics['test.voice_registration_test.registrations_started'].values, [1]);
                            assert.deepEqual(metrics['test.voice_registration_test.registrations_completed'].values, [1]);
                            assert.deepEqual(metrics['test.voice_registration_test.time_to_register'].values[0] > 0, true);
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));
                        })
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
                        .setup(function(api) {
                            api.http.fixtures.add(
                                fixtures_IdentityStoreDynamic().identity_search({
                                    msisdn: '+2348080070007',
                                    search_value: '12345',
                                    identity: 'cb245673-aa41-4302-ac47-00000000007',
                                    search_param: 'details__corp_code',
                                }));
                        })
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
