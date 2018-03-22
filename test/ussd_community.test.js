var vumigo = require('vumigo_v02');
// var fixtures = require('./fixtures_registration');
var fixtures_IdentityStoreDynamic = require('./fixtures_identity_store_dynamic');
var fixtures_MessageSenderDynamic = require('./fixtures_message_sender_dynamic');
var fixtures_RegistrationDynamic = require('./fixtures_registration_dynamic');
var fixtures_StageBasedMessagingDynamic = require('./fixtures_stage_based_messaging_dynamic');
var assert = require('assert');
var AppTester = vumigo.AppTester;
var App = vumigo.App;
App.call(App);

var utils = require('seed-jsbox-utils').utils;

describe("Mama Nigeria App", function() {
    describe("USSD Registration", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();
            tester = new AppTester(app);

            tester
                .setup.char_limit(182)
                .setup.config.app({
                    name: 'ussd-community-test',
                    country_code: '234',  // nigeria
                    channel: '*120*8864*0000#',
                    env: 'test',
                    metric_store: 'test_metric_store',
                    testing_today: '2015-04-03 06:07:08.999',
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
                        subscriptions: {
                            api_token: 'test_token_subscriptions',
                            url: "http://localhost:8005/api/v1/"
                        },
                        message_sender: {
                            api_token: 'test_token_message_sender',
                            url: "http://localhost:8006/api/v1/"
                        }
                    },
                    no_timeout_redirects: [
                        'state_start',
                        'state_end_voice',
                        'state_end_sms'
                    ]
                });
        });

        // TEST TIMEOUTS

        describe("Timeout testing", function() {
            it("should ask about continuing", function() {
                return tester
                .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'identity-uuid-1002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_MessageSenderDynamic().create_outbound({
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().patch_identity({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                                extra_details: {
                                    "dialback_sent": true
                                }
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - corp code
                        , {session_event: 'close'}
                        , {session_event: 'new'}
                    )
                    .check.interaction({
                        state: 'state_timed_out',
                        reply: [
                            "You have an incomplete registration. Would you like to continue with this registration?",
                            "1. Yes",
                            "2. No, start a new registration"
                        ].join('\n')
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [0, 1, 2, 3, 4]);
                    })
                    .run();
            });
            it("should continue", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'identity-uuid-1002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_MessageSenderDynamic().create_outbound({
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().patch_identity({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                                extra_details: {
                                    "dialback_sent": true
                                }
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - corp code
                        , {session_event: 'close'}
                        , {session_event: 'new'}
                        , '1'  // state_timed_out - continue
                    )
                    .check.interaction({
                        state: 'state_msg_receiver'
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [0, 1, 2, 3, 4]);
                    })
                    .run();
            });
            it("should restart", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'identity-uuid-1002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_MessageSenderDynamic().create_outbound({
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().patch_identity({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                                extra_details: {
                                    "dialback_sent": true
                                }
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - corp code
                        , {session_event: 'close'}
                        , {session_event: 'new'}
                        , '2'  // state_timed_out - restart
                    )
                    .check.interaction({
                        state: 'state_auth_code'
                    })
                    .check(function(api) {
                        utils.check_fixtures_used(api, [0, 1, 2, 3, 4]);
                    })
                    .run();
            });
            it("should send a dialback sms on first timeout", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'identity-uuid-1002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_MessageSenderDynamic().create_outbound({
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().patch_identity({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                                extra_details: {
                                    "dialback_sent": true
                                }
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - corp code
                        , {session_event: 'close'}
                    )
                    .check(function(api) {
                        utils.check_fixtures_used(api, [0, 1, 2, 3, 4]);
                    })
                    .run();
            });
            it("should not send a dialback sms on second timeout", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080040004',
                                search_value: '12345',
                                identity: 'identity-uuid-1004',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080040004',
                                identity: 'identity-uuid-1004',
                                extra_details: {
                                    "dialback_sent": true
                                }
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2348080040004',
                                identity: 'identity-uuid-1004',
                                extra_details: {
                                    "dialback_sent": true
                                }
                            }));
                    })
                    .setup.user.addr('08080040004')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - corp code
                        , {session_event: 'close'}
                    )
                    .check(function(api) {
                        utils.check_fixtures_used(api, [0, 1, 2]);
                    })
                    .run();
            });
        });

        describe("test avg.sessions_to_register metric", function() {
            it("should increment metric according to number of sessions", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'identity-uuid-1002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2349092222222',
                                identity: 'identity-uuid-2222',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_MessageSenderDynamic().create_outbound({
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().patch_identity({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                                extra_details: {
                                    "dialback_sent": true
                                }
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().create_identity({
                                communicate_through: 'identity-uuid-2222',
                                identity: 'identity-uuid-1003',
                                operator: 'identity-uuid-1002',
                            }));


                        api.http.fixtures.add(
                            fixtures_RegistrationDynamic().create_registration({
                                identity: 'identity-uuid-1003',
                                operator: 'identity-uuid-1002',
                                receiver: 'identity-uuid-2222',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1003',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2349092222222',
                                identity: 'identity-uuid-2222',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().patch_identity({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1003',
                                extra_details: {
                                    "receiver_role": "mother",
                                    "linked_to": "identity-uuid-2222",
                                    "preferred_language": "ibo_NG",
                                    // "preferred_msg_type": "text",
                                }
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().patch_identity({
                                msisdn: '+2349092222222',
                                identity: 'identity-uuid-2222',
                                extra_details: {
                                    "receiver_role": "friend",
                                    "linked_to": "identity-uuid-1003",
                                    "preferred_language": "ibo_NG",
                                    "preferred_msg_type": "text",
                                }
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - corp code
                        , '6' // state_msg_receiver - friend_only
                        , '09092222222'  // state_msisdn
                        , {session_event: 'close'}  // timeout
                        , {session_event: 'new'}  // dial in
                        , '1'  // state_timed_out - yes (continue)
                        , '2'  // state_msg_language - igbo
                        , '2'   // state_msg_type - text smss
                    )
                    .check.interaction({
                        state: 'state_end_sms',
                        reply: "Thank you. The person will now start receiving messages once per week for 4 weeks."
                    })
                    .check(function(api) {
                        var metrics = api.metrics.stores.test_metric_store;
                        assert.deepEqual(metrics['test.ussd_community_test.avg.sessions_to_register'].values, [2]);
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });

        // TEST START OF SESSION ACTIONS
        describe("Start of session", function() {
            it("should reset user answers", function() {
                return tester
                    .setup(function(api) {api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .setup.user.answers({       // set up answers to be reset
                        state_auth_code: '12345',
                        state_msisdn: '08033046899'
                    })
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.user.answers({
                        "user_id": "cb245673-aa41-4302-ac47-00000000002"})
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0]);
                    })
                    .run();
            });
        });

        // TEST HCP RECOGNISED USER

        describe("HCP recognised user", function() {
            it("should not be asked for corp code", function() {
                return tester
                    .setup(function(api) {api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080070007',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                                extra_details: {
                                    "corp_code": "12345"
                                }
                            }));
                    })
                    .setup.user.addr('08080070007')
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.interaction({
                        state: 'state_msg_receiver'
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0]);
                    })
                    .run();
            });
        });

        // TEST REGISTRATION

        describe("Flow testing - registration", function() {
            it("to state_auth_code", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.interaction({
                        state: 'state_auth_code',
                        reply: "Welcome to Hello MAMA! Please enter your unique Community Resource Persons code."
                    })
                    .check(function(api) {
                        var metrics = api.metrics.stores.test_metric_store;
                        assert.deepEqual(metrics, undefined);
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0]);
                    })
                    .run();
            });
            it("to state_msg_receiver", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - corp code
                    )
                    .check.interaction({
                        state: 'state_msg_receiver',
                        reply: [
                            "Welcome to Hello Mama. Who will receive the messages on their phone?",
                            "1. Mother, Father",
                            "2. Mother",
                            "3. Father",
                            "4. Mother, family member",
                            "5. Mother, friend",
                            "6. Friend",
                            "7. Family member"
                        ].join('\n')
                    })
                    .check(function(api) {
                        var metrics = api.metrics.stores.test_metric_store;
                        assert.deepEqual(metrics['test.ussd_community_test.registrations_started'].values, [1]);
                        assert.deepEqual(metrics['test.ussd_community_test.registrations_completed'], undefined);
                        assert.deepEqual(metrics['test.ussd_community_test.avg.sessions_to_register'], undefined);
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1]);
                    })
                    .run();
            });
            it("to state_msisdn (from state_msg_receiver)", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - corp code
                        , '7'       // state_msg_receiver - family_only
                    )
                    .check.interaction({
                        state: 'state_msisdn',
                        reply: "Please enter the mobile number of the family member. They must consent to receiving messages."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1]);
                    })
                    .run();
            });
            it("to state_msisdn_already_registered (from state_msisdn)", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2349097777777',
                                identity: '3f7c8851-5204-43f7-af7f-009097777777',
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
                                identity: '3f7c8851-5204-43f7-af7f-009097777777',
                                messagesets: [0]
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - corp code
                        , '2' // state_msg_receiver - mother_only
                        , '09097777777'  // state_msisdn
                    )
                    .check.interaction({
                        state: 'state_msisdn_already_registered',
                        reply: [
                            "Sorry, this number is already registered for messages. They must opt-out before continuing.",
                            "1. Try a different number",
                            "2. Choose a different receiver",
                            "3. Exit"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1, 2, 3, 4]);
                    })
                    .run();
            });
            it("to state_msisdn (from state_msisdn_already_registered)", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2349097777777',
                                identity: '3f7c8851-5204-43f7-af7f-009097777777',
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
                                identity: '3f7c8851-5204-43f7-af7f-009097777777',
                                messagesets: [0]
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - corp code
                        , '2' // state_msg_receiver - mother_only
                        , '09097777777'  // state_msisdn
                        , '1' // state_msisdn - try different number
                    )
                    .check.interaction({
                        state: 'state_msisdn',
                        reply: "Please enter the mobile number of the mother. They must consent to receiving messages."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1, 2, 3, 4]);
                    })
                    .run();
            });
            it("to state_end_msisdn (from state_msisdn_already_registered)", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2349097777777',
                                identity: '3f7c8851-5204-43f7-af7f-009097777777',
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
                                identity: '3f7c8851-5204-43f7-af7f-009097777777',
                                messagesets: [0]
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - corp code
                        , '2' // state_msg_receiver - mother_only
                        , '09097777777'  // state_msisdn
                        , '3' // state_end_msisdn - exit
                    )
                    .check.interaction({
                        state: 'state_end_msisdn',
                        reply: "Thank you for using the Hello Mama service."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1, 2, 3, 4]);
                    })
                    .check.reply.ends_session()
                    .run();
            });
            it("to state_msg_receiver (from state_msisdn_already_registered)", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2349097777777',
                                identity: '3f7c8851-5204-43f7-af7f-009097777777',
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
                                identity: '3f7c8851-5204-43f7-af7f-009097777777',
                                messagesets: [0]
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - corp code
                        , '2' // state_msg_receiver - mother_only
                        , '09097777777'  // state_msisdn
                        , '2' // state_msg_receiver - choose different receiver
                    )
                    .check.interaction({
                        state: 'state_msg_receiver',
                        reply: [
                            "Welcome to Hello Mama. Who will receive the messages on their phone?",
                            "1. Mother, Father",
                            "2. Mother",
                            "3. Father",
                            "4. Mother, family member",
                            "5. Mother, friend",
                            "6. Friend",
                            "7. Family member"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1, 2, 3, 4]);
                    })
                    .run();
            });
            it("to state_msisdn_mother (from state_msg_receiver)", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - corp code
                        , '1'       // state_msg_receiver - mother_father
                    )
                    .check.interaction({
                        state: 'state_msisdn_mother',
                        reply: "Please enter the mobile number of the mother. They must consent to receiving messages."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1]);
                    })
                    .run();
            });
            it("to state_msisdn_already_registered (from state_msisdn_mother)", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
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
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - corp code
                        , '1'       // state_msg_receiver - mother_father
                        , '07070050005' // state_msisdn_mother
                    )
                    .check.interaction({
                        state: 'state_msisdn_already_registered',
                        reply: [
                            "Sorry, this number is already registered for messages. They must opt-out before continuing.",
                            "1. Try a different number",
                            "2. Choose a different receiver",
                            "3. Exit"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1, 2, 3, 4]);
                    })
                    .run();
            });
            it("to state_msisdn_mother (from state_msisdn_already_registered)", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
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
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - corp code
                        , '1' // state_msg_receiver - mother_father
                        , '07070050005'  // state_msisdn_mother
                        , '1' // state_msisdn_mother - try different number
                    )
                    .check.interaction({
                        state: 'state_msisdn_mother',
                        reply: "Please enter the mobile number of the mother. They must consent to receiving messages."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1, 2, 3, 4]);
                    })
                    .run();
            });
            it("to state_msisdn_household", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080030003',
                                empty: true
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - corp code
                        , '1'       // state_msg_receiver - mother_father
                        , '08080030003' // state_msisdn_mother
                    )
                    .check.interaction({
                        state: 'state_msisdn_household',
                        reply: "Please enter the mobile number of the father. They must consent to receiving messages."
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1, 2]);
                    })
                    .run();
            });

            it("to state_msg_language", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2349092222222',
                                empty: true
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2349091111111',
                                empty: true
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().create_identity({
                                msisdn: '+2349091111111',
                                default_addr_type: 'msisdn'
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().create_identity({
                                msisdn: '+2349092222222',
                                default_addr_type: 'msisdn'
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                      {session_event: 'new'}  // dial in
                      , '12345'   // state_auth_code - corp code
                      , '1' // state_msg_receiver - mother and father
                      , '09092222222'  // state_msisdn_mother
                      , '09091111111'  // state_msisdn_household
                    )
                    .check.interaction({
                        state: 'state_msg_language',
                        reply: [
                            "What language would they like to receive the messages in?",
                            "1. English",
                            "2. Igbo",
                            "3. Pidgin"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1, 2, 3, 4, 5]);
                    })
                    .run();
            });

            it("to state_msg_type", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'cb245673-aa41-4302-ac47-00000000002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2349092222222',
                                identity: 'identity-uuid-2222'
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().create_identity({
                                communicate_through: 'identity-uuid-2222',
                                identity: 'identity-uuid-1003',
                                operator: 'identity-uuid-1002',
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - corp code
                        , '6' // state_msg_receiver - friend_only
                        , '09092222222'  // state_msisdn
                        , '1'  // state_msg_language - english
                    )
                    .check.interaction({
                        state: 'state_msg_type',
                        reply: [
                            "How would they like to receive the messages?",
                            "1. Voice calls",
                            "2. Text SMSs"
                        ].join('\n')
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1, 2, 3]);
                    })
                    .run();
            });

            it("to state_end_voice", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'identity-uuid-1002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2349092222222',
                                identity: 'identity-uuid-2222',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().create_identity({
                                communicate_through: 'identity-uuid-2222',
                                identity: 'identity-uuid-1003',
                                operator: 'identity-uuid-1002',
                            }));


                        api.http.fixtures.add(
                            fixtures_RegistrationDynamic().create_registration({
                                identity: 'identity-uuid-1003',
                                operator: 'identity-uuid-1002',
                                receiver: 'identity-uuid-2222',
                                language: 'eng_NG',
                                msg_type: 'audio',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1003',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2349092222222',
                                identity: 'identity-uuid-2222',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().patch_identity({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1003',
                                extra_details: {
                                    "receiver_role": "mother",
                                    "linked_to": "identity-uuid-2222",
                                    "preferred_language": "eng_NG",
                                }
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().patch_identity({
                                msisdn: '+2349092222222',
                                identity: 'identity-uuid-2222',
                                extra_details: {
                                    "receiver_role": "friend",
                                    "linked_to": "identity-uuid-1003",
                                    "preferred_language": "eng_NG",
                                    "preferred_msg_type": "audio",
                                    "preferred_msg_days": "tue",
                                    "preferred_msg_times": "6_8",
                                }
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - corp code
                        , '6' // state_msg_receiver - friend_only
                        , '09092222222'  // state_msisdn
                        , '1'  // state_msg_language - english
                        , '1'   // state_msg_type - voice calls
                    )
                    .check.interaction({
                        state: 'state_end_voice',
                        reply: "Thank you. The person will now start receiving calls on Tuesday between 6pm and 8pm for 4 weeks."
                    })
                    .check(function(api) {
                        var metrics = api.metrics.stores.test_metric_store;
                        assert.deepEqual(metrics['test.ussd_community_test.registrations_started'].values, [1]);
                        assert.deepEqual(metrics['test.ussd_community_test.registrations_completed'].values, [1]);
                        assert.deepEqual(metrics['test.ussd_community_test.avg.sessions_to_register'].values, [1]);
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
                    })
                    .check.reply.ends_session()
                    .run();
            });
            // user wants text sms's
            it("to state_end_sms", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'identity-uuid-1002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2349092222222',
                                identity: 'identity-uuid-2222',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().create_identity({
                                communicate_through: 'identity-uuid-2222',
                                identity: 'identity-uuid-1003',
                                operator: 'identity-uuid-1002',
                            }));


                        api.http.fixtures.add(
                            fixtures_RegistrationDynamic().create_registration({
                                identity: 'identity-uuid-1003',
                                operator: 'identity-uuid-1002',
                                receiver: 'identity-uuid-2222',
                                language: 'ibo_NG',
                                msg_type: 'text',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1003',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2349092222222',
                                identity: 'identity-uuid-2222',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().patch_identity({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1003',
                                extra_details: {
                                    "receiver_role": "mother",
                                    "linked_to": "identity-uuid-2222",
                                    "preferred_language": "ibo_NG",
                                }
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().patch_identity({
                                msisdn: '+2349092222222',
                                identity: 'identity-uuid-2222',
                                extra_details: {
                                    "receiver_role": "friend",
                                    "linked_to": "identity-uuid-1003",
                                    "preferred_language": "ibo_NG",
                                    "preferred_msg_type": "text",
                                }
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - corp code
                        , '6' // state_msg_receiver - friend_only
                        , '09092222222'  // state_msisdn
                        , '2'  // state_msg_language - igbo
                        , '2'   // state_msg_type - text smss
                    )
                    .check.interaction({
                        state: 'state_end_sms',
                        reply: "Thank you. The person will now start receiving messages once per week for 4 weeks."
                    })
                    .check(function(api) {
                        var metrics = api.metrics.stores.test_metric_store;
                        assert.deepEqual(metrics['test.ussd_community_test.registrations_started'].values, [1]);
                        assert.deepEqual(metrics['test.ussd_community_test.registrations_completed'].values, [1]);
                        assert.deepEqual(metrics['test.ussd_community_test.avg.sessions_to_register'].values, [1]);
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });

        describe("Flow testing - complete flows", function() {

            it("complete flow 2 - receiver: mother & father; voice", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'identity-uuid-1002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2349094444444',
                                identity: 'identity-uuid-4444',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2349095555555',
                                identity: 'identity-uuid-5555',
                            }));

                        api.http.fixtures.add(
                            fixtures_StageBasedMessagingDynamic().active_subscriptions({
                                identity: 'identity-uuid-4444',
                                messagesets: []
                            }));


                        api.http.fixtures.add(
                            fixtures_RegistrationDynamic().create_registration({
                                identity: 'identity-uuid-4444',
                                operator: 'identity-uuid-1002',
                                receiver: 'identity-uuid-5555',
                                language: 'eng_NG',
                                msg_type: 'audio',
                                msg_receiver: 'mother_father'
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2349095555555',
                                identity: 'identity-uuid-5555',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2349094444444',
                                identity: 'identity-uuid-4444',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().patch_identity({
                                msisdn: '+2349095555555',
                                identity: 'identity-uuid-5555',
                                extra_details: {
                                    "receiver_role": "father",
                                    "linked_to": "identity-uuid-4444",
                                    "preferred_language": "eng_NG",
                                    "preferred_msg_type": "audio",
                                    "preferred_msg_days": "tue",
                                    "preferred_msg_times": "6_8",
                                    "household_msgs_only": true,
                                }
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().patch_identity({
                                msisdn: '+2349094444444',
                                identity: 'identity-uuid-4444',
                                extra_details: {
                                    "receiver_role": "mother",
                                    "linked_to": "identity-uuid-5555",
                                    "preferred_language": "eng_NG",
                                    "preferred_msg_type": "audio",
                                    "preferred_msg_days": "tue",
                                    "preferred_msg_times": "6_8",
                                }
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - corp code
                        , '1' // state_msg_receiver - mother_father
                        , '09094444444'  // state_msiddn_mother
                        , '09095555555'  // state_msisdn_household
                        , '1'  // state_msg_language - english
                        , '1'   // state_msg_type - voice calls
                    )
                    .check.interaction({
                        state: 'state_end_voice',
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    })
                    .run();
            });

            it("complete flow 4 - receiver: mother & father; voice", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'identity-uuid-1002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2349093333333',
                                empty: true,
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().create_identity({
                                identity: 'identity-uuid-3333',
                                msisdn: '+2349093333333',
                                default_addr_type: 'msisdn'
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().create_identity({
                                identity: 'identity-uuid-4444',
                                communicate_through: 'identity-uuid-3333',
                            }));

                        api.http.fixtures.add(
                            fixtures_RegistrationDynamic().create_registration({
                                identity: 'identity-uuid-4444',
                                operator: 'identity-uuid-1002',
                                receiver: 'identity-uuid-3333',
                                language: 'eng_NG',
                                msg_type: 'audio',
                                msg_receiver: 'father_only'
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2349093333333',
                                identity: 'identity-uuid-4444',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2349093333333',
                                identity: 'identity-uuid-3333',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().patch_identity({
                                msisdn: '+2349093333333',
                                identity: 'identity-uuid-4444',
                                extra_details: {
                                    "receiver_role": "mother",
                                    "linked_to": "identity-uuid-3333",
                                    "preferred_language": "eng_NG",
                                    "default_addr_type": "msisdn"
                                }
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().patch_identity({
                                msisdn: '+2349093333333',
                                identity: 'identity-uuid-3333',
                                extra_details: {
                                    "receiver_role": "father",
                                    "linked_to": "identity-uuid-4444",
                                    "preferred_language": "eng_NG",
                                    "preferred_msg_type": "audio",
                                    "preferred_msg_days": "tue",
                                    "preferred_msg_times": "6_8",
                                }
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - corp code
                        , '1' // state_msg_receiver - mother_father
                        , '09093333333'  // state_msisdn_household
                        , '09093333333'  // state_msiddn_mother
                        , '1'  // state_msg_language - english
                        , '1'   // state_msg_type - voice calls
                    )
                    .check.interaction({
                        state: 'state_end_voice',
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    })
                    .run();
            });
            it("complete flow 5 - receiver: mother_only, voice", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                identity: 'identity-uuid-1002',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'identity-uuid-1002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2349096666666',
                                empty: true,
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().create_identity({
                                identity: 'identity-uuid-6666',
                                msisdn: '+2349096666666',
                                default_addr_type: 'msisdn'
                            }));

                        api.http.fixtures.add(
                            fixtures_RegistrationDynamic().create_registration({
                                identity: 'identity-uuid-6666',
                                operator: 'identity-uuid-1002',
                                receiver: 'identity-uuid-6666',
                                language: 'eng_NG',
                                msg_type: 'audio',
                                msg_receiver: 'mother_only'
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2349096666666',
                                identity: 'identity-uuid-6666',
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().patch_identity({
                                msisdn: '+2349096666666',
                                identity: 'identity-uuid-6666',
                                extra_details: {
                                    "receiver_role": "mother",
                                    "preferred_language": "eng_NG",
                                    "preferred_msg_type": "audio",
                                    "preferred_msg_days": "tue",
                                    "preferred_msg_times": "6_8",
                                    "linked_to": null,
                                }
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - corp code
                        , '2' // state_msg_receiver - mother_only
                        , '09096666666'  // state_msiddn
                        , '1'  // state_msg_language - english
                        , '1'   // state_msg_type - voice calls
                    )
                    .check.interaction({
                        state: 'state_end_voice',
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1, 2, 3, 4, 5, 6]);
                    })
                    .run();
            });
        });

        describe("When a msisdn exists but is opted out", function() {
            it("should navigate to state_msg_language", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2347030010009',
                                identity: 'identity-uuid-1009',
                                opted_out: true
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'identity-uuid-1002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_StageBasedMessagingDynamic().active_subscriptions({
                                identity: 'identity-uuid-1009',
                                messagesets: []
                            }));
                    })
                    .setup.user.addr('07030010009')
                    .inputs(
                        {session_event: 'new'}
                        , '12345'       // state_auth_code - corp code
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
                                msisdn: '+2347030010009',
                                identity: 'identity-uuid-1009',
                                opted_out: true
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                msisdn: '+2348080020002',
                                search_value: '12345',
                                identity: 'identity-uuid-1002',
                                search_param: 'details__corp_code',
                            }));

                        api.http.fixtures.add(
                            fixtures_StageBasedMessagingDynamic().active_subscriptions({
                                identity: 'identity-uuid-1009',
                                messagesets: []
                            }));

                        api.http.fixtures.add(
                            fixtures_RegistrationDynamic().create_registration({
                                identity: 'identity-uuid-1009',
                                operator: 'identity-uuid-1009',
                                receiver: 'identity-uuid-1009',
                                language: 'ibo_NG',
                                msg_type: 'text',
                                msg_receiver: 'mother_only'
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().get_identity({
                                msisdn: '+2347030010009',
                                identity: 'identity-uuid-1009',
                                opted_out: true
                            }));

                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().patch_identity({
                                msisdn: '+2347030010009',
                                identity: 'identity-uuid-1009',
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
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - corp code
                        , '2' // state_msg_receiver - mother_only
                        , '07030010009'  // state_msiddn
                        , '2'  // state_msg_language - igbo
                        , '2'   // state_msg_type - sms
                    )
                    .check.interaction({
                        state: 'state_end_sms'
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1, 2, 3, 4, 5]);
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });
        // TEST VALIDATION

        describe("Validation testing", function() {
            it("validate state_auth_code", function() {
                return tester
                    .setup(function(api) {
                        api.http.fixtures.add(
                            fixtures_IdentityStoreDynamic().identity_search({
                                search_value: 'aaaaa',
                                search_param: 'details__corp_code',
                                empty: true,
                            }));
                    })
                    .setup.user.addr('08080020002')
                    .setup.user.state('state_auth_code')
                    .input(
                        'aaaaa'  // state_auth_code - invalid corp code
                    )
                    .check.interaction({
                        state: 'state_auth_code',
                        reply: "Sorry, invalid number. Please enter your unique Community Resource Persons code."
                    })
                    .run();
            });
            it("validate state_msg_receiver", function() {
                return tester
                    .setup.user.state('state_msg_receiver')
                    .input('8')
                    .check.interaction({
                        state: 'state_msg_receiver',
                        reply: [
                            "Sorry, invalid option. Who will receive the messages on their phone?",
                            "1. Mother, Father",
                            "2. Mother",
                            "3. Father",
                            "4. Mother, family member",
                            "5. Mother, friend",
                            "6. Friend",
                            "7. Family member"
                        ].join('\n')
                    })
                    .run();
            });
            it("validate state_msisdn", function() {
                return tester
                    .setup.user.state('state_msisdn')
                    .setup.user.answers({
                        'state_msg_receiver': 'father_only'
                    })
                    .input(
                        'aaaaaa'  // state_msisdn - mobile number
                    )
                    .check.interaction({
                        state: 'state_msisdn',
                        reply: "Sorry, invalid number. Please enter the mobile number of the father. They must consent to receiving messages."
                    })
                    .run();
            });
            it("to state_msisdn_already_registered (invalid option selected)", function() {
                return tester
                    .setup.user.state('state_msisdn_already_registered')
                    .input(
                        '4' // state_msisdn_already_registered - invalid option
                    )
                    .check.interaction({
                        state: 'state_msisdn_already_registered',
                        reply: [
                            "Sorry, invalid option. Sorry, this number is already registered for messages. They must opt-out before continuing.",
                            "1. Try a different number",
                            "2. Choose a different receiver",
                            "3. Exit"
                        ].join('\n')
                    })
                    .run();
            });
            it("validate state_msisdn_mother", function() {
                return tester
                    .setup.user.state('state_msisdn_mother')
                    .input(
                        'aaaaaa'  // state_msisdn - mobile number
                    )
                    .check.interaction({
                        state: 'state_msisdn_mother',
                        reply: "Sorry, invalid number. Please enter the mobile number of the mother. They must consent to receiving messages."
                    })
                    .run();
            });
            it("validate state_msisdn_household", function() {
                return tester
                    .setup.user.state('state_msisdn_household')
                    .setup.user.answers({
                        'state_msg_receiver': 'mother_father'
                    })
                    .input(
                        'aaaaaa'  // state_msisdn_household - mobile number
                    )
                    .check.interaction({
                        state: 'state_msisdn_household',
                        reply: "Sorry, invalid number. Please enter the mobile number of the father. They must consent to receiving messages."
                    })
                    .run();
            });

            it("validate state_msg_language", function() {
                return tester
                    .setup.user.state('state_msg_language')
                    .input(
                        '4'  // state_language
                    )
                    .check.interaction({
                        state: 'state_msg_language',
                        reply: [
                            "Sorry, invalid option. What language would they like to receive the messages in?",
                            "1. English",
                            "2. Igbo",
                            "3. Pidgin"
                        ].join('\n')
                    })
                    .run();
            });
            it("validate state_msg_type", function() {
                return tester
                    .setup.user.state('state_msg_type')
                    .input(
                        '3'  // state_msg_type
                    )
                    .check.interaction({
                        state: 'state_msg_type',
                        reply: [
                            "Sorry, invalid option. How would they like to receive the messages?",
                            "1. Voice calls",
                            "2. Text SMSs"
                        ].join('\n')
                    })
                    .run();
            });

        });


    });
});
