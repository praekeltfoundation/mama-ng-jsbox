var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures_public');
var assert = require('assert');
var AppTester = vumigo.AppTester;

describe("Hello Mama app", function() {
    describe("for public ussd use", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();
            tester = new AppTester(app);

            tester
                .setup.char_limit(182)
                .setup.config.app({
                    name: 'ussd-public-test',
                    country_code: '234',  // nigeria
                    channel: '*120*8864*0000#',
                    testing_today: '2015-04-03 06:07:08.999',  // testing only
                    testing_message_id: '0170b7bb-978e-4b8a-35d2-662af5b6daee',  // testing only
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
                    },
                    no_timeout_redirects: [
                        'state_start',
                        'state_end_voice',
                        'state_end_sms'
                    ]
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                })
                ;
        });

        // TEST CHANGE FLOW

        describe("Flow testing - ", function() {
            describe("Initial states enroute to st-A (state_main_menu)", function() {
                it("to state_language", function() {  //st-D
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                        )
                        .check.interaction({
                            state: 'state_language',
                            reply: [
                                "Welcome to Hello Mama. Please choose your language",
                                "1. English",
                                "2. Igbo",
                                "3. Pidgin"
                            ].join('\n')
                        })
                        .check.user.properties({lang: null})
                        .check(function(api) {
                            var expected_used = [0, 1];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("to state_registered_msisdn via state_language", function() { //st-C
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  //dial in
                            , '2'   // state_language - igbo
                        )
                        .check.interaction({
                            state: 'state_registered_msisdn',
                            reply: "Please enter the number which is registered to receive messages."
                        })
                        .check.user.properties({lang: 'ibo_NG'})
                        .check(function(api) {
                            var expected_used = [0, 1];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("to state_msisdn_permission", function() {  //st-B
                    return tester
                        .setup.user.addr('05059992222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                        )
                        .check.interaction({
                            state: 'state_msisdn_permission',
                            reply: [
                                "Welcome to Hello Mama. Do you have permission to manage the number 05059992222?",
                                "1. Yes",
                                "2. No",
                                "3. Change the number I'd like to manage"
                            ].join('\n')
                        })
                        .check.user.properties({lang: 'ibo_NG'})
                        .check(function(api) {
                            var expected_used = [2];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("to state_registered_msisdn via state_msisdn_permission", function() {  //st-C
                    return tester
                        .setup.user.addr('05059992222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'  // state_msisdn_permission
                        )
                        .check.interaction({
                            state: 'state_registered_msisdn',
                            reply: "Please enter the number which is registered to receive messages."
                        })
                        .check(function(api) {
                            var expected_used = [2];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("to state_msisdn_not_recognised", function() {  //st-F
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '2'   // state_language - hausa
                            , '05059994444'  // state_registered_msisdn
                        )
                        .check.interaction({
                            state: 'state_msisdn_not_recognised',
                            reply: "We do not recognise this number. Please dial from the registered number or sign up with the Local Community Health Extension Worker."
                        })
                        .check(function(api) {
                            var expected_used = [0, 1, 3];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("to state_main_menu (receives for mother)", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                        )
                        .check.interaction({
                            state: 'state_main_menu',
                            reply: [
                                "Select:",
                                "1. Start Baby messages",
                                "2. Change message preferences",
                                "3. Change my number",
                                "4. Change language",
                                "5. Stop receiving messages"
                            ].join('\n')
                        })
                        .check(function(api) {
                            var expected_used = [0, 1, 4, 5];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("to state_main_menu (mother)", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'   // state_msisdn_permission - yes
                        )
                        .check.interaction({
                            state: 'state_main_menu',
                            reply: [
                                "Select:",
                                "1. Start Baby messages",
                                "2. Change message preferences",
                                "3. Change my number",
                                "4. Change language",
                                "5. Stop receiving messages"
                            ].join('\n')
                        })
                        .check(function(api) {
                            var expected_used = [2,9];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("to state_main_menu_household", function() {
                    return tester
                        .setup.user.addr('05059997777')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'   // state_msisdn_permission - yes
                        )
                        .check.interaction({
                            state: 'state_main_menu_household',
                            reply: [
                                "Select:",
                                "1. Start Baby messages",
                                "2. Change my number",
                                "3. Change language",
                                "4. Stop receiving messages"
                            ].join('\n')
                        })
                        .check(function(api) {
                            var expected_used = [6,7,13];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("to state_msisdn_no_permission", function() {  // via st-B
                    return tester
                        .setup.user.addr('05059992222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '2'   // state_msisdn_permission - no
                        )
                        .check.interaction({
                            state: 'state_msisdn_no_permission',
                            reply: "We're sorry, you do not have permission to update the preferences for this subscriber."
                        })
                        .run();
                });
            });

            describe("Change to baby messages", function() {
                it("to state_already_registered_baby", function() {
                    return tester
                        .setup.user.addr('05059999999')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'   // state_msisdn_permission - yes
                            , '1'   // state_main_menu - start baby messages
                        )
                        .check.interaction({
                            state: 'state_already_registered_baby',
                            reply: "You are already registered for baby messages."
                        })
                        .check(function(api) {
                            var expected_used = [70,71,72,73];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("case 1 > to state_new_registration_baby", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'   // state_msisdn_permission - yes
                            , '1'   // state_main_menu - start baby messages
                        )
                        .check.interaction({
                            state: 'state_new_registration_baby',
                            reply: "Thank you. You will now receive messages about caring for the baby"
                        })
                        .check(function(api) {
                            var expected_used = [2,9,16,17,74];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("case 2 > to state_new_registration_baby", function() {
                    return tester
                        .setup.user.addr('05059993333')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'   // state_msisdn_permission - yes
                            , '1'   // state_main_menu - start baby messages
                        )
                        .check.interaction({
                            state: 'state_new_registration_baby',
                            reply: "Thank you. You will now receive messages about caring for the baby"
                        })
                        .check(function(api) {
                            var expected_used = [4,5,19,20,75];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("case 3 > to state_new_registration_baby", function() {
                    return tester
                        .setup.user.addr('05059996666')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'   // state_msisdn_permission - yes
                            , '1'   // state_main_menu - start baby messages
                        )
                        .check.interaction({
                            state: 'state_new_registration_baby',
                            reply: "Thank you. You will now receive messages about caring for the baby"
                        })
                        .check(function(api) {
                            var expected_used = [7,12,13,22,23,76];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("case 4 > to state_new_registration_baby", function() {
                    return tester
                        .setup.user.addr('05059997777')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'   // state_msisdn_permission - yes
                            , '1'   // state_main_menu - start baby messages
                        )
                        .check.interaction({
                            state: 'state_new_registration_baby',
                            reply: "Thank you. You will now receive messages about caring for the baby"
                        })
                        .check(function(api) {
                            var expected_used = [6,7,13,22,23,76];
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

            describe("Change message format and time", function() {
                describe("Change from SMS to Voice messages", function() {
                    it("case 1 > to state_change_menu_sms", function() {
                        return tester
                            .setup.user.addr('05059992222')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '2'  // state_main_menu - change message preferences - registered for text
                            )
                            .check.interaction({
                                state: 'state_change_menu_sms',
                                reply: [
                                    "Please select an option:",
                                    "1. Change from text to voice messages",
                                    "2. Back to main menu"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [2,9,16,17];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    it("case 1 > to state_voice_days", function() {
                        return tester
                            .setup.user.addr('05059992222')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '2'  // state_main_menu - change message preferences - registered for text
                                , '1'  // state_change_menu_sms - change from text to voice
                            )
                            .check.interaction({
                                state: 'state_voice_days',
                                reply: [
                                    "We will call twice a week. On what days would you like to receive messages?",
                                    "1. Monday and Wednesday",
                                    "2. Tuesday and Thursday"
                                ].join('\n')
                            })
                            .run();
                    });
                    it("case 1 > to state_voice_times", function() {
                        return tester
                            .setup.user.addr('05059992222')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '2'  // state_main_menu - change message preferences - registered for text
                                , '1'  // state_change_menu_sms - change from text to voice
                                , '2'  // state_voice_days - tuesday and thursday
                            )
                            .check.interaction({
                                state: 'state_voice_times',
                                reply: [
                                    "At what time would you like to receive these calls?",
                                    "1. Between 9-11am",
                                    "2. Between 2-5pm"
                                ].join('\n')
                            })
                            .run();
                    });
                    it("case 1 > to state_end_voice_confirm", function() {
                        return tester
                            .setup.user.addr('05059992222')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '2'  // state_main_menu - change message preferences - registered for text
                                , '1'  // state_change_menu_sms - change from text to voice
                                , '2'  // state_voice_days - tuesday and thursday
                                , '1'  // state_voice_times - 9-11am
                            )
                            .check.interaction({
                                state: 'state_end_voice_confirm',
                                reply: "Thank you. You will now start receiving voice calls between 9am - 11am on Tuesday and Thursday."
                            })
                            .check(function(api) {
                                var expected_used = [2, 9, 16, 17, 18, 26];
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
                describe("Change Voice message days and times", function() {
                    it("case 2 > to state_change_menu_voice", function() {
                        return tester
                            .setup.user.addr('05059993333')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '2'  // state_main_menu - change message preferences - registered for voice
                            )
                            .check.interaction({
                                state: 'state_change_menu_voice',
                                reply: [
                                    "Please select an option:",
                                    "1. Change the day and time I receive messages",
                                    "2. Change from voice to text messages",
                                    "3. Back to main menu"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [4, 5, 19, 20];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    it("case 2 > to state_voice_days", function() {
                        return tester
                            .setup.user.addr('05059993333')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '2'  // state_main_menu - change message preferences - registered for voice
                                , '1'  // state_change_menu_voice - change message day & time
                            )
                            .check.interaction({
                                state: 'state_voice_days',
                                reply: [
                                    "We will call twice a week. On what days would you like to receive messages?",
                                    "1. Monday and Wednesday",
                                    "2. Tuesday and Thursday"
                                ].join('\n')
                            })
                            .run();
                    });
                    it("case 2 > to state_voice_times", function() {
                        return tester
                            .setup.user.addr('05059993333')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '2'  // state_main_menu - change message preferences - registered for voice
                                , '1'  // state_change_menu_voice - change message day & time
                                , '1'  // state_voice_days - monday and wednesday
                            )
                            .check.interaction({
                                state: 'state_voice_times',
                                reply: [
                                    "At what time would you like to receive these calls?",
                                    "1. Between 9-11am",
                                    "2. Between 2-5pm"
                                ].join('\n')
                            })
                            .run();
                    });
                    it("case 2 > to state_end_voice_confirm", function() {
                        return tester
                            .setup.user.addr('05059993333')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '2'  // state_main_menu - change message preferences - registered for voice
                                , '1'  // state_change_menu_voice - change message day & time
                                , '1'  // state_voice_days - monday and wednesday
                                , '2'  // state_voice_times - 2-5pm
                            )
                            .check.interaction({
                                state: 'state_end_voice_confirm',
                                reply: "Thank you. You will now start receiving voice calls between 2pm - 5pm on Monday and Wednesday."
                            })
                            .check(function(api) {
                                var expected_used = [4, 5, 19, 20, 21, 28, 30];
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
                describe("Change from Voice to SMS messages", function() {
                    it("case 3 > to state_change_menu_voice", function() {
                        return tester
                            .setup.user.addr('05059996666')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '2'  // state_main_menu - change message preferences - registered for voice
                            )
                            .check.interaction({
                                state: 'state_change_menu_voice',
                                reply: [
                                    "Please select an option:",
                                    "1. Change the day and time I receive messages",
                                    "2. Change from voice to text messages",
                                    "3. Back to main menu"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [7,12,13,22,23];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    it("case 3 > to state_end_sms_confirm", function() {
                        return tester
                            .setup.user.addr('05059996666')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '2'  // state_main_menu - change message preferences - registered for voice
                                , '2'  // state_change_menu_voice - change to text
                            )
                            .check.interaction({
                                state: 'state_end_sms_confirm',
                                reply: "Thank you. You will now receive text messages"
                            })
                            .check(function(api) {
                                var expected_used = [7,12,13,22,23,24,29];
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
            });

            describe("Change number", function() {
                it("case 1 > to state_new_msisdn", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_msisdn_permission - yes
                            , '3'  // state_main_menu - change number
                        )
                        .check.interaction({
                            state: 'state_new_msisdn',
                            reply: "Please enter the new mobile number you would like to receive messages on."
                        })
                        .check(function(api) {
                            var expected_used = [2,9];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("case 1 > to state_number_in_use", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_msisdn_permission - yes
                            , '3'  // state_main_menu - change number
                            , '05059993333' // state_new_msisdn
                        )
                        .check.interaction({
                            state: 'state_number_in_use',
                            reply: [
                                "Sorry this number is already registered. You must opt-out before registering again.",
                                "1. Try a different number",
                                "2. Exit"
                            ].join('\n')
                        })
                        .check(function(api) {
                            var expected_used = [2,4,9];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("case 1 > to state_new_msisdn - via state_number_in_use", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_msisdn_permission - yes
                            , '3'  // state_main_menu - change number
                            , '05059993333' // state_new_msisdn
                            , '1'  // state_number_in_use - different number
                        )
                        .check.interaction({
                            state: 'state_new_msisdn',
                            reply: "Please enter the new mobile number you would like to receive messages on."
                        })
                        .check(function(api) {
                            var expected_used = [2,4,9];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("case 1 > to state_end_exit", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_msisdn_permission - yes
                            , '3'  // state_main_menu - change number
                            , '05059993333' // state_new_msisdn
                            , '2'  // state_number_in_use - exit
                        )
                        .check.interaction({
                            state: 'state_end_exit',
                            reply: "Thank you for using the Hello Mama service"
                        })
                        .check(function(api) {
                            var expected_used = [2,4,9];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("case 1 > to state_end_number_change", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_msisdn_permission - yes
                            , '3'  // state_main_menu - change number
                            , '05059998888' // state_new_msisdn
                        )
                        .check.interaction({
                            state: 'state_end_number_change',
                            reply: "Thank you. The number which receives messages has been updated."
                        })
                        .check(function(api) {
                            var expected_used = [2, 8, 9, 10];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("case 2 > to state_end_number_change", function() {
                    return tester
                        .setup.user.addr('05059993333')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_msisdn_permission - yes
                            , '3'  // state_main_menu - change number
                            , '05059998888' // state_new_msisdn
                        )
                        .check.interaction({
                            state: 'state_end_number_change',
                            reply: "Thank you. The number which receives messages has been updated."
                        })
                        .check(function(api) {
                            var expected_used = [4, 5, 8, 11];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("case 3 > to state_end_number_change", function() {
                    return tester
                        .setup.user.addr('05059996666')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_msisdn_permission - yes
                            , '3'  // state_main_menu - change number
                            , '05059998888' // state_new_msisdn
                        )
                        .check.interaction({
                            state: 'state_end_number_change',
                            reply: "Thank you. The number which receives messages has been updated."
                        })
                        .check(function(api) {
                            var expected_used = [7,8,12,13,14];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("case 4 > to state_end_number_change", function() {
                    return tester
                        .setup.user.addr('05059997777')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_msisdn_permission - yes
                            , '2'  // state_main_menu_household - change number
                            , '05059998888' // state_new_msisdn
                        )
                        .check.interaction({
                            state: 'state_end_number_change',
                            reply: "Thank you. The number which receives messages has been updated."
                        })
                        .check(function(api) {
                            var expected_used = [6,7,8,13,15];
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

            describe("Change language", function() {
                it("to state_msg_language", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_msisdn_permission - yes
                            , '4'  // state_main_menu - change language
                        )
                        .check.interaction({
                            state: 'state_msg_language',
                            reply: [
                                "What language would you like to receive these messages in?",
                                "1. English",
                                "2. Igbo",
                                "3. Pidgin"
                            ].join('\n')
                        })
                        .check.user.properties({lang: 'ibo_NG'})
                        .run();
                });
                it("case 1 > to state_msg_language_confirm", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_msisdn_permission - yes
                            , '4'  // state_main_menu - change language
                            , '3'  // state_msg_language - pidgin
                        )
                        .check.interaction({
                            state: 'state_msg_language_confirm',
                            reply: "Thank you. Your language has been updated and you will start to receive messages in this language."
                        })
                        .check.user.properties({lang: 'pcm_NG'})
                        .check(function(api) {
                            var expected_used = [2,9,62,63];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("case 2 > to state_msg_language_confirm", function() {
                    return tester
                        .setup.user.addr('05059993333')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_msisdn_permission - yes
                            , '4'  // state_main_menu - change language
                            , '3'  // state_msg_language - pidgin
                        )
                        .check.interaction({
                            state: 'state_msg_language_confirm',
                            reply: "Thank you. Your language has been updated and you will start to receive messages in this language."
                        })
                        .check(function(api) {
                            var expected_used = [4,5,30,64,65,66];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("case 3 > to state_msg_language_confirm", function() {
                    return tester
                        .setup.user.addr('05059996666')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_msisdn_permission - yes
                            , '4'  // state_main_menu - change language
                            , '3'  // state_msg_language - pidgin
                        )
                        .check.interaction({
                            state: 'state_msg_language_confirm',
                            reply: "Thank you. Your language has been updated and you will start to receive messages in this language."
                        })
                        .check(function(api) {
                            var expected_used = [7,12,13,67,68,69];
                            var fixts = api.http.fixtures.fixtures;
                            var fixts_used = [];
                            fixts.forEach(function(f, i) {
                                f.uses > 0 ? fixts_used.push(i) : null;
                            });
                            assert.deepEqual(fixts_used, expected_used);
                        })
                        .run();
                });
                it("case 4 > to state_msg_language_confirm", function() {
                    return tester
                        .setup.user.addr('05059997777')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_msisdn_permission - yes
                            , '3'  // state_main_menu_household - change language
                            , '3'  // state_msg_language - pidgin
                        )
                        .check.interaction({
                            state: 'state_msg_language_confirm',
                            reply: "Thank you. Your language has been updated and you will start to receive messages in this language."
                        })
                        .check(function(api) {
                            var expected_used = [6,7,13,67,68,69];
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

            describe("Change states flows - opt-out", function() {
                describe("case 1", function() {
                    // to optout reason menu
                    it("case 1 > to state_optout_reason", function() {
                        return tester
                            .setup.user.addr('05059992222')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                            )
                            .check.interaction({
                                state: 'state_optout_reason',
                                reply: [
                                    "Please tell us why you no longer want to receive messages so we can help you further",
                                    "1. Mother miscarried",
                                    "2. Baby stillborn",
                                    "3. Baby passed away",
                                    "4. Messages not useful",
                                    "5. Other"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [2,9];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 1 - miscarriage
                    it("case 1 > to state_loss_subscription", function() {
                        return tester
                            .setup.user.addr('05059992222')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '1'  // state_optout_reason - mother miscarried
                            )
                            .check.interaction({
                                state: 'state_loss_subscription',
                                reply: [
                                    "We are sorry for your loss. Would you like to receive a small set of free messages from Hello Mama that could help during this difficult time?",
                                    "1. Yes",
                                    "2. No"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [2,9];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 1, 1 - miscarriage, yes
                    it("case 1 > to state_loss_subscription_confirm", function() {
                        return tester
                            .setup.user.addr('05059992222')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '1'  // state_optout_reason - mother miscarried
                                , '1'  // state_loss_subscription - yes
                            )
                            .check.interaction({
                                state: 'state_end_loss_subscription_confirm',
                                reply: "Thank you. You will now receive messages to support you during this difficult time."
                            })
                            .check(function(api) {
                                var expected_used = [2,9,31];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 1, 2 - miscarriage, no
                    it("case 1 > to state_end_loss (miscarriage)", function() {
                        return tester
                            .setup.user.addr('05059992222')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '1'  // state_optout_reason - mother miscarried
                                , '2'  // state_loss_subscription - no
                            )
                            .check.interaction({
                                state: 'state_end_loss',
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW."
                            })
                            .check(function(api) {
                                var expected_used = [2,9,36];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 2 - stillborn
                    it("case 1 > to state_end_loss (stillborn)", function() {
                        return tester
                            .setup.user.addr('05059992222')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '2'  // state_optout_reason - baby stillborn
                            )
                            .check.interaction({
                                state: 'state_end_loss',
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW."
                            })
                            .check(function(api) {
                                var expected_used = [2,9,41];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 3 - baby death
                    it("case 1 > to state_end_loss (baby death)", function() {
                        return tester
                            .setup.user.addr('05059992222')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '3'  // state_optout_reason - baby death
                            )
                            .check.interaction({
                                state: 'state_end_loss',
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW."
                            })
                            .check(function(api) {
                                var expected_used = [2,9,46];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 4 - not useful
                    it("case 1 > to state_end_optout", function() {
                        return tester
                            .setup.user.addr('05059992222')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '4'  // state_optout_reason - not_useful
                            )
                            .check.interaction({
                                state: 'state_end_optout',
                                reply: "Thank you. You will no longer receive messages"
                            })
                            .check(function(api) {
                                var expected_used = [2,9,51];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 5 - other
                    it("case 1 > to state_end_optout", function() {
                        return tester
                            .setup.user.addr('05059992222')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '5'  // state_optout_reason - other
                            )
                            .check.interaction({
                                state: 'state_end_optout',
                                reply: "Thank you. You will no longer receive messages"
                            })
                            .check(function(api) {
                                var expected_used = [2,9,56];
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

                describe("case 2", function() {
                    // to optout reason menu
                    it("case 2 > to state_optout_reason", function() {
                        return tester
                            .setup.user.addr('05059993333')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                            )
                            .check.interaction({
                                state: 'state_optout_reason',
                                reply: [
                                    "Please tell us why you no longer want to receive messages so we can help you further",
                                    "1. Mother miscarried",
                                    "2. Baby stillborn",
                                    "3. Baby passed away",
                                    "4. Messages not useful",
                                    "5. Other"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [4,5];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 1 - miscarriage
                    it("case 2 > to state_loss_subscription", function() {
                        return tester
                            .setup.user.addr('05059993333')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '1'  // state_optout_reason - mother miscarried
                            )
                            .check.interaction({
                                state: 'state_loss_subscription',
                                reply: [
                                    "We are sorry for your loss. Would you like to receive a small set of free messages from Hello Mama that could help during this difficult time?",
                                    "1. Yes",
                                    "2. No"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [4,5];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 1, 1 - miscarriage, yes
                    it("case 2 > to state_loss_subscription_confirm", function() {
                        return tester
                            .setup.user.addr('05059993333')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '1'  // state_optout_reason - mother miscarried
                                , '1'  // state_loss_subscription - yes
                            )
                            .check.interaction({
                                state: 'state_end_loss_subscription_confirm',
                                reply: "Thank you. You will now receive messages to support you during this difficult time."
                            })
                            .check(function(api) {
                                var expected_used = [4,5,32,33];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 1, 2 - miscarriage, no
                    it("case 2 > to state_end_loss (miscarriage)", function() {
                        return tester
                            .setup.user.addr('05059993333')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '1'  // state_optout_reason - mother miscarried
                                , '2'  // state_loss_subscription - no
                            )
                            .check.interaction({
                                state: 'state_end_loss',
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW."
                            })
                            .check(function(api) {
                                var expected_used = [4,5,38];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 2 - stillborn
                    it("case 2 > to state_end_loss (stillborn)", function() {
                        return tester
                            .setup.user.addr('05059993333')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '2'  // state_optout_reason - baby stillborn
                            )
                            .check.interaction({
                                state: 'state_end_loss',
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW."
                            })
                            .check(function(api) {
                                var expected_used = [4,5,43];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 3 - baby death
                    it("case 2 > to state_end_loss (baby death)", function() {
                        return tester
                            .setup.user.addr('05059993333')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '3'  // state_optout_reason - baby death
                            )
                            .check.interaction({
                                state: 'state_end_loss',
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW."
                            })
                            .check(function(api) {
                                var expected_used = [4,5,48];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 4 - not useful
                    it("case 2 > to state_optout_receiver", function() {
                        return tester
                            .setup.user.addr('05059993333')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '4'  // state_optout_reason - not_useful
                            )
                            .check.interaction({
                                state: 'state_optout_receiver',
                                reply: [
                                    "Which messages would you like to stop receiving?",
                                    "1. Mother messages",
                                    "2. Household messages",
                                    "3. All messages"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [4,5];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 4, 1 - unsubscribe mother
                    it("case 2 > to state_end_optout", function() {
                        return tester
                            .setup.user.addr('05059993333')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '4'  // state_optout_reason - not_useful
                                , '1'  // state_optout_receiver - unsubscribe mother
                            )
                            .check.interaction({
                                state: 'state_end_optout',
                                reply: "Thank you. You will no longer receive messages"
                            })
                            .check(function(api) {
                                var expected_used = [4,5,52];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 4, 2 - unsubscribe household
                    it("case 2 > to state_end_optout", function() {
                        return tester
                            .setup.user.addr('05059993333')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '4'  // state_optout_reason - not_useful
                                , '2'  // state_optout_receiver - unsubscribe household
                            )
                            .check.interaction({
                                state: 'state_end_optout',
                                reply: "Thank you. You will no longer receive messages"
                            })
                            .check(function(api) {
                                var expected_used = [4,5,60];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 4, 3 - unsubscribe all
                    it("case 2 > to state_end_optout", function() {
                        return tester
                            .setup.user.addr('05059993333')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '4'  // state_optout_reason - not_useful
                                , '3'  // state_optout_receiver - unsubscribe all
                            )
                            .check.interaction({
                                state: 'state_end_optout',
                                reply: "Thank you. You will no longer receive messages"
                            })
                            .check(function(api) {
                                var expected_used = [4,5,52,53];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 5 - other
                    it("case 2 > to state_optout_receiver", function() {
                        return tester
                            .setup.user.addr('05059993333')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '5'  // state_optout_reason - other
                            )
                            .check.interaction({
                                state: 'state_optout_receiver',
                                reply: [
                                    "Which messages would you like to stop receiving?",
                                    "1. Mother messages",
                                    "2. Household messages",
                                    "3. All messages"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [4,5];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 5, 1 - unsubscribe mother
                    it("case 2 > to state_end_optout", function() {
                        return tester
                            .setup.user.addr('05059993333')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '5'  // state_optout_reason - not_useful
                                , '1'  // state_optout_receiver - unsubscribe mother
                            )
                            .check.interaction({
                                state: 'state_end_optout',
                                reply: "Thank you. You will no longer receive messages"
                            })
                            .check(function(api) {
                                var expected_used = [4,5,57];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 5, 2 - unsubscribe household
                    it("case 2 > to state_end_optout", function() {
                        return tester
                            .setup.user.addr('05059993333')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '5'  // state_optout_reason - not_useful
                                , '2'  // state_optout_receiver - unsubscribe household
                            )
                            .check.interaction({
                                state: 'state_end_optout',
                                reply: "Thank you. You will no longer receive messages"
                            })
                            .check(function(api) {
                                var expected_used = [4,5,61];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 5, 3 - unsubscribe all
                    it("case 2 > to state_end_optout", function() {
                        return tester
                            .setup.user.addr('05059993333')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '5'  // state_optout_reason - not_useful
                                , '3'  // state_optout_receiver - unsubscribe all
                            )
                            .check.interaction({
                                state: 'state_end_optout',
                                reply: "Thank you. You will no longer receive messages"
                            })
                            .check(function(api) {
                                var expected_used = [4,5,57,58];
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

                describe("case 3", function() {
                    // to optout reason menu
                    it("case 3 > to state_optout_reason", function() {
                        return tester
                            .setup.user.addr('05059996666')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                            )
                            .check.interaction({
                                state: 'state_optout_reason',
                                reply: [
                                    "Please tell us why you no longer want to receive messages so we can help you further",
                                    "1. Mother miscarried",
                                    "2. Baby stillborn",
                                    "3. Baby passed away",
                                    "4. Messages not useful",
                                    "5. Other"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [7,12,13];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 1 - miscarriage
                    it("case 3 > to state_loss_subscription", function() {
                        return tester
                            .setup.user.addr('05059996666')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '1'  // state_optout_reason - mother miscarried
                            )
                            .check.interaction({
                                state: 'state_loss_subscription',
                                reply: [
                                    "We are sorry for your loss. Would you like to receive a small set of free messages from Hello Mama that could help during this difficult time?",
                                    "1. Yes",
                                    "2. No"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [7,12,13];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 1, 1 - miscarriage, yes
                    it("case 3 > to state_loss_subscription_confirm", function() {
                        return tester
                            .setup.user.addr('05059996666')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '1'  // state_optout_reason - mother miscarried
                                , '1'  // state_loss_subscription - yes
                            )
                            .check.interaction({
                                state: 'state_end_loss_subscription_confirm',
                                reply: "Thank you. You will now receive messages to support you during this difficult time."
                            })
                            .check(function(api) {
                                var expected_used = [7,12,13,34,35];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 1, 2 - miscarriage, no
                    it("case 3 > to state_end_loss (miscarriage)", function() {
                        return tester
                            .setup.user.addr('05059996666')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '1'  // state_optout_reason - mother miscarried
                                , '2'  // state_loss_subscription - no
                            )
                            .check.interaction({
                                state: 'state_end_loss',
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW."
                            })
                            .check(function(api) {
                                var expected_used = [7,12,13,35,39];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 2 - stillborn
                    it("case 3 > to state_end_loss (stillborn)", function() {
                        return tester
                            .setup.user.addr('05059996666')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '2'  // state_optout_reason - baby stillborn
                            )
                            .check.interaction({
                                state: 'state_end_loss',
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW."
                            })
                            .check(function(api) {
                                var expected_used = [7,12,13,40,44];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 3 - baby death
                    it("case 3 > to state_end_loss (baby death)", function() {
                        return tester
                            .setup.user.addr('05059996666')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '3'  // state_optout_reason - baby death
                            )
                            .check.interaction({
                                state: 'state_end_loss',
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW."
                            })
                            .check(function(api) {
                                var expected_used = [7,12,13,45,49];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 4 - not useful
                    it("case 3 > to state_optout_receiver", function() {
                        return tester
                            .setup.user.addr('05059996666')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '4'  // state_optout_reason - not_useful
                            )
                            .check.interaction({
                                state: 'state_optout_receiver',
                                reply: [
                                    "Which messages would you like to stop receiving?",
                                    "1. Mother messages",
                                    "2. Household messages",
                                    "3. All messages"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [7,12,13];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 4, 1 - unsubscribe mother
                    it("case 3 > to state_end_optout", function() {
                        return tester
                            .setup.user.addr('05059996666')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '4'  // state_optout_reason - not_useful
                                , '1'  // state_optout_receiver - unsubscribe mother
                            )
                            .check.interaction({
                                state: 'state_end_optout',
                                reply: "Thank you. You will no longer receive messages"
                            })
                            .check(function(api) {
                                var expected_used = [7,12,13,54];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 4, 2 - unsubscribe household
                    it("case 3 > to state_end_optout", function() {
                        return tester
                            .setup.user.addr('05059996666')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '4'  // state_optout_reason - not_useful
                                , '2'  // state_optout_receiver - unsubscribe household
                            )
                            .check.interaction({
                                state: 'state_end_optout',
                                reply: "Thank you. You will no longer receive messages"
                            })
                            .check(function(api) {
                                var expected_used = [7,12,13,50];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 4, 3 - unsubscribe all
                    it("case 3 > to state_end_optout", function() {
                        return tester
                            .setup.user.addr('05059996666')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '4'  // state_optout_reason - not_useful
                                , '3'  // state_optout_receiver - unsubscribe all
                            )
                            .check.interaction({
                                state: 'state_end_optout',
                                reply: "Thank you. You will no longer receive messages"
                            })
                            .check(function(api) {
                                var expected_used = [7,12,13,50,54];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 5 - other
                    it("case 3 > to state_optout_receiver", function() {
                        return tester
                            .setup.user.addr('05059996666')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '5'  // state_optout_reason - other
                            )
                            .check.interaction({
                                state: 'state_optout_receiver',
                                reply: [
                                    "Which messages would you like to stop receiving?",
                                    "1. Mother messages",
                                    "2. Household messages",
                                    "3. All messages"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [7,12,13];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 5, 1 - unsubscribe mother
                    it("case 3 > to state_end_optout", function() {
                        return tester
                            .setup.user.addr('05059996666')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '5'  // state_optout_reason - other
                                , '1'  // state_optout_receiver - unsubscribe mother
                            )
                            .check.interaction({
                                state: 'state_end_optout',
                                reply: "Thank you. You will no longer receive messages"
                            })
                            .check(function(api) {
                                var expected_used = [7,12,13,59];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 5, 2 - unsubscribe household
                    it("case 3 > to state_end_optout", function() {
                        return tester
                            .setup.user.addr('05059996666')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '5'  // state_optout_reason - not_useful
                                , '2'  // state_optout_receiver - unsubscribe household
                            )
                            .check.interaction({
                                state: 'state_end_optout',
                                reply: "Thank you. You will no longer receive messages"
                            })
                            .check(function(api) {
                                var expected_used = [7,12,13,55];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 5, 3 - unsubscribe all
                    it("case 3 > to state_end_optout", function() {
                        return tester
                            .setup.user.addr('05059996666')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '5'  // state_main_menu - stop receiving messages
                                , '5'  // state_optout_reason - not_useful
                                , '3'  // state_optout_receiver - unsubscribe all
                            )
                            .check.interaction({
                                state: 'state_end_optout',
                                reply: "Thank you. You will no longer receive messages"
                            })
                            .check(function(api) {
                                var expected_used = [7,12,13,55,59];
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

                describe("case 4", function() {
                    // to optout reason menu
                    it("case 4 > to state_optout_reason", function() {
                        return tester
                            .setup.user.addr('05059997777')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '4'  // state_main_menu_household - stop receiving messages
                            )
                            .check.interaction({
                                state: 'state_optout_reason',
                                reply: [
                                    "Please tell us why you no longer want to receive messages so we can help you further",
                                    "1. Mother miscarried",
                                    "2. Baby stillborn",
                                    "3. Baby passed away",
                                    "4. Messages not useful",
                                    "5. Other"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [6,7,13];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 1 - miscarriage
                    it("case 4 > to state_loss_subscription", function() {
                        return tester
                            .setup.user.addr('05059997777')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '4'  // state_main_menu_household - stop receiving messages
                                , '1'  // state_optout_reason - mother miscarried
                            )
                            .check.interaction({
                                state: 'state_loss_subscription',
                                reply: [
                                    "We are sorry for your loss. Would you like to receive a small set of free messages from Hello Mama that could help during this difficult time?",
                                    "1. Yes",
                                    "2. No"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [6,7,13];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 1, 1 - miscarriage, yes
                    it("case 4 > to state_loss_subscription_confirm", function() {
                        return tester
                            .setup.user.addr('05059997777')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '4'  // state_main_menu_household - stop receiving messages
                                , '1'  // state_optout_reason - mother miscarried
                                , '1'  // state_loss_subscription - yes
                            )
                            .check.interaction({
                                state: 'state_end_loss_subscription_confirm',
                                reply: "Thank you. You will now receive messages to support you during this difficult time."
                            })
                            .check(function(api) {
                                var expected_used = [6,7,13,34,35];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 1, 2 - miscarriage, no
                    it("case 4 > to state_end_loss (miscarriage)", function() {
                        return tester
                            .setup.user.addr('05059997777')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '4'  // state_main_menu_household - stop receiving messages
                                , '1'  // state_optout_reason - mother miscarried
                                , '2'  // state_loss_subscription - no
                            )
                            .check.interaction({
                                state: 'state_end_loss',
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW."
                            })
                            .check(function(api) {
                                var expected_used = [6,7,13,35,39];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 2 - stillborn
                    it("case 4 > to state_end_loss (stillborn)", function() {
                        return tester
                            .setup.user.addr('05059997777')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '4'  // state_main_menu_household - stop receiving messages
                                , '2'  // state_optout_reason - baby stillborn
                            )
                            .check.interaction({
                                state: 'state_end_loss',
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW."
                            })
                            .check(function(api) {
                                var expected_used = [6,7,13,40,44];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 3 - baby death
                    it("case 4 > to state_end_loss (baby death)", function() {
                        return tester
                            .setup.user.addr('05059997777')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '4'  // state_main_menu_household - stop receiving messages
                                , '3'  // state_optout_reason - baby death
                            )
                            .check.interaction({
                                state: 'state_end_loss',
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW."
                            })
                            .check(function(api) {
                                var expected_used = [6,7,13,45,49];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 4 - not useful
                    it("case 4 > to state_end_optout (not_useful)", function() {
                        return tester
                            .setup.user.addr('05059997777')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '4'  // state_main_menu_household - stop receiving messages
                                , '4'  // state_optout_reason - not_useful
                            )
                            .check.interaction({
                                state: 'state_end_optout',
                                reply: "Thank you. You will no longer receive messages"
                            })
                            .check(function(api) {
                                var expected_used = [6,7,13,50];
                                var fixts = api.http.fixtures.fixtures;
                                var fixts_used = [];
                                fixts.forEach(function(f, i) {
                                    f.uses > 0 ? fixts_used.push(i) : null;
                                });
                                assert.deepEqual(fixts_used, expected_used);
                            })
                            .run();
                    });
                    // 5 - other
                    it("case 4 > to state_end_optout", function() {
                        return tester
                            .setup.user.addr('05059997777')
                            .inputs(
                                {session_event: 'new'}  // dial in
                                , '1'  // state_msisdn_permission - yes
                                , '4'  // state_main_menu_household - stop receiving messages
                                , '5'  // state_optout_reason - other
                            )
                            .check.interaction({
                                state: 'state_end_optout',
                                reply: "Thank you. You will no longer receive messages"
                            })
                            .check(function(api) {
                                var expected_used = [6,7,13,55];
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
            });

            describe.skip("Change state navigation flows looping back to main menu", function() {
                it(" - baby messages, back to state_already_registered_baby", function() {
                    return tester
                        .setup.user.addr('082333')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'   // state_msisdn_permission - yes
                            , '1'   // state_main_menu - start baby messages
                        )
                        .check.interaction({
                            state: 'state_already_registered_baby',
                            reply: "You are already registered for baby messages."
                        })
                        .run();
                });
                it(" - changing message format and time, back to main menu", function() {
                    return tester
                        .setup.user.addr('082444')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'   // state_msisdn_permission - yes
                            , '2'   // state_main_menu - change message preferences
                            , '2'   // state_change_menu_sms - back to main menu (via text)
                        )
                        .check.interaction({
                            state: 'state_main_menu'
                        })
                        .run();
                });
                it(" - changing message format and time, back to main menu", function() {
                    return tester
                        .setup.user.addr('082222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'   // state_msisdn_permission - yes
                            , '2'   // state_main_menu - change message preferences
                            , '3'   // state_change_menu_voice - back to main menu (via voice)
                        )
                        .check.interaction({
                            state: 'state_main_menu'
                        })
                        .run();
                });
            });

            describe("Validation testing", function() {
                it("validate state_msisdn_permission", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .inputs(
                            {session_event: 'new'}
                            , '4'  // state_msisdn_permission - invalid option
                        )
                        .check.interaction({
                            state: 'state_msisdn_permission',
                            reply: [
                                "Sorry, invalid option. Welcome to Hello Mama. Do you have permission to manage the number 05059992222?",
                                "1. Yes",
                                "2. No",
                                "3. Change the number I'd like to manage"
                            ].join('\n')
                        })
                        .run();
                });
                it("validate state_language", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .setup.user.state('state_language')
                        .input('5')  // state_language - invalid option
                        .check.interaction({
                            state: 'state_language',
                            reply: [
                                "Sorry, invalid option. Welcome to Hello Mama. Please choose your language",
                                "1. English",
                                "2. Igbo",
                                "3. Pidgin"
                            ].join('\n')
                        })
                        .run();
                });
                it("validate state_registered_msisdn", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .setup.user.state('state_registered_msisdn')
                        .input('abc$g')  // state_registered_msisdn
                        .check.interaction({
                            state: 'state_registered_msisdn',
                            reply: "Sorry, invalid number. Please enter the number which is registered to receive messages."
                        })
                        .run();
                });
                it("validate state_main_menu", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .setup.user.state('state_main_menu')
                        .input('8') // state_main_menu - invalid option
                        .check.interaction({
                            state: 'state_main_menu',
                            reply: [
                                "Sorry, invalid option. Select:",
                                "1. Start Baby messages",
                                "2. Change message preferences",
                                "3. Change my number",
                                "4. Change language",
                                "5. Stop receiving messages"
                            ].join('\n')
                        })
                        .run();
                });
                it("validate state_main_menu_household", function() {
                    return tester
                        .setup.user.addr('05059997777')
                        .setup.user.state('state_main_menu_household')
                        .input('6') // state_main_menu_household - invalid option
                        .check.interaction({
                            state: 'state_main_menu_household',
                            reply: [
                                "Sorry, invalid option. Select:",
                                "1. Start Baby messages",
                                "2. Change my number",
                                "3. Change language",
                                "4. Stop receiving messages"
                            ].join('\n')
                        })
                        .run();
                });
                it("validate state_change_menu_sms", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .setup.user.state('state_change_menu_sms')
                        .input('3') // state_change_menu_sms - invalid option
                        .check.interaction({
                            state: 'state_change_menu_sms',
                            reply: [
                                "Sorry, invalid option. Please select an option:",
                                "1. Change from text to voice messages",
                                "2. Back to main menu"
                            ].join('\n')
                        })
                        .run();
                });
                it("validate state_voice_days", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .setup.user.state('state_voice_days')
                        .input('4') // state_voice_days - invalid option
                        .check.interaction({
                            state: 'state_voice_days',
                            reply: [
                                "Sorry, invalid option. We will call twice a week. On what days would you like to receive messages?",
                                "1. Monday and Wednesday",
                                "2. Tuesday and Thursday"
                            ].join('\n')
                        })
                        .run();
                });
                it("validate state_voice_times", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .setup.user.state('state_voice_times')
                        .input('3') // state_voice_times - invalid option
                        .check.interaction({
                            state: 'state_voice_times',
                            reply: [
                                "Sorry, invalid option. At what time would you like to receive these calls?",
                                "1. Between 9-11am",
                                "2. Between 2-5pm"
                            ].join('\n')
                        })
                        .run();
                });
                it("validate state_change_menu_voice", function() {
                    return tester
                        .setup.user.addr('05059993333')
                        .setup.user.state('state_change_menu_voice')
                        .input('4') // state_change_menu_voice - invalid option
                        .check.interaction({
                            state: 'state_change_menu_voice',
                            reply: [
                                "Sorry, invalid option. Please select an option:",
                                "1. Change the day and time I receive messages",
                                "2. Change from voice to text messages",
                                "3. Back to main menu"
                            ].join('\n')
                        })
                        .run();
                });
                it("validate state_new_msisdn", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .setup.user.state('state_new_msisdn')
                        .input('abc') // state_new_msisdn - invalid option
                        .check.interaction({
                            state: 'state_new_msisdn',
                            reply: "Sorry, invalid number. Please enter the new mobile number you would like to receive messages on."
                        })
                        .run();
                });
                it("validate state_number_in_use", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .setup.user.state('state_number_in_use')
                        .input('3') // state_number_in_use - invalid option
                        .check.interaction({
                            state: 'state_number_in_use',
                            reply: [
                                "Sorry, invalid option. Sorry this number is already registered. You must opt-out before registering again.",
                                "1. Try a different number",
                                "2. Exit"
                            ].join('\n')
                        })
                        .run();
                });
                it("validate state_msg_language", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .setup.user.state('state_msg_language')
                        .input('4') // state_msg_language - invalid option
                        .check.interaction({
                            state: 'state_msg_language',
                            reply: [
                                "Sorry, invalid option. What language would you like to receive these messages in?",
                                "1. English",
                                "2. Igbo",
                                "3. Pidgin"
                            ].join('\n')
                        })
                        .run();
                });
                it.skip("validate state_optout_reason", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .setup.user.state('state_optout_reason')
                        .input('6') // state_optout_reason - invalid option
                        .check.interaction({
                            state: 'state_optout_reason',
                            reply: [
                                "Sorry, invalid option. Please tell us why you no longer want to receive messages so we can help you further",
                                "1. Mother miscarried",
                                "2. Baby stillborn",
                                "3. Baby passed away",
                                "4. Messages not useful",
                                "5. Other"
                            ].join('\n')
                        })
                        .run();
                });
                it("validate state_loss_subscription", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .setup.user.state('state_loss_subscription')
                        .input('3') // state_loss_subscription - invalid option
                        .check.interaction({
                            state: 'state_loss_subscription',
                            reply: [
                                "Sorry, invalid option. We are sorry for your loss. Would you like to receive a small set of free messages from Hello Mama that could help during this difficult time?",
                                "1. Yes",
                                "2. No"
                            ].join('\n')
                        })
                        .run();
                });
                it("validate state_optout_receiver", function() {
                    return tester
                        .setup.user.addr('05059993333')
                        .setup.user.state('state_optout_receiver')
                        .input('4') // state_optout_receiver - invalid option
                        .check.interaction({
                            state: 'state_optout_receiver',
                            reply: [
                                "Sorry, invalid option. Which messages would you like to stop receiving?",
                                "1. Mother messages",
                                "2. Household messages",
                                "3. All messages"
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("Complete flows", function() {
                it.skip(" - via baby messages to state_already_registered_baby", function() {
                    return tester
                        .setup.user.addr('082333')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'   // state_msisdn_permission - yes
                            , '1'   // state_main_menu - start baby messages
                        )
                        .check.interaction({
                            state: 'state_already_registered_baby',
                            reply: "You are already registered for baby messages."
                        })
                        .run();
                });
                it.skip(" - via opt-out, loss-subscription, to end of the line", function() {
                    return tester
                        .setup.user.addr('082222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_msisdn_permission - yes
                            , '5'  // state_main_menu - stop receiving messages
                            , '2'  // state_optout_reason - baby stillborn
                            , '2'  // state_loss_subscription - no
                        )
                        .check.interaction({
                            state: 'state_end_optout',
                            reply: "Thank you. You will no longer receive messages"
                        })
                        .run();
                });
                it.skip(" - via opt-out, state_optout_receiver, to end of the line", function() {
                    return tester
                        .setup.user.addr('082222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_msisdn_permission - yes
                            , '5'  // state_main_menu - stop receiving messages
                            , '4'  // state_optout_reason - baby stillborn
                            , '2'  // state_optout_receiver - father
                        )
                        .check.interaction({
                            state: 'state_end_optout',
                            reply: "Thank you. You will no longer receive messages"
                        })
                        .run();
                });
            });
        });
    });
});
