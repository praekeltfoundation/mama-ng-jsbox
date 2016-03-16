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
                    testing_today: '2015-04-03 06:07:08.999',
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
                        change: {
                            api_token: 'test_token_change',
                            url: "http://localhost:8005/api/v1/"
                        },
                        optout: {
                            api_token: 'test_token_change',
                            url: "http://localhost:8001/api/v1/"
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
                                "2. Hausa",
                                "3. Igbo",
                                "4. Pidgin",
                                "5. Yoruba"
                            ].join('\n')
                        })
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
                            , '5'   // state_language - yoruba
                        )
                        .check.interaction({
                            state: 'state_registered_msisdn',
                            reply: "Please enter the number which is registered to receive messages. For example, 0803304899"
                        })
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
                                "Welcome to Hello Mama. Do you have permission to manage the number [MSISDN]?",
                                "1. Yes",
                                "2. No",
                                "3. Change the number I'd like to manage"
                            ].join('\n')
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
                it("to state_registered_msisdn via state_msisdn_permission", function() {  //st-C
                    return tester
                        .setup.user.addr('05059992222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'  // state_msisdn_permission
                        )
                        .check.interaction({
                            state: 'state_registered_msisdn',
                            reply: "Please enter the number which is registered to receive messages. For example, 0803304899"
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
                            reply: "We do not recognise this number. Please dial from the registered number or sign up with your local Community Health Extension worker."
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
                            , '4'   // state_language - pidgin
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
                            var expected_used = [6, 7];
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

            describe.skip("Change to baby messages", function() {
                it("to state_already_registered_baby", function() {
                    return tester
                        .setup.user.addr('082333')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'   // state_msisdn_permission - yes
                            , '1'   // state_main_menu - start baby messages
                        )
                        .check.interaction({
                            state: 'state_already_registered_baby',
                            reply: [
                                "You are already registered for baby messages.",
                                "1. Back to main menu",
                                "2. Exit"
                            ].join('\n')
                        })
                        .run();
                });
                it("to state_new_registeration_baby", function() {
                    return tester
                        .setup.user.addr('082222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'   // state_msisdn_permission - yes
                            , '1'   // state_main_menu - start baby messages
                        )
                        .check.interaction({
                            state: 'state_new_registeration_baby',
                            reply: "Thank you. You will now receive messages about caring for baby"
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
                                    "Please select what you would like to do:",
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
                                    "We will call twice a week. On what days would the person like to receive messages?",
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
                                    "Thank you. At what time would they like to receive these calls?",
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
                                reply: "Thank you. You will now start receiving voice calls between [time] on [days]."
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
                                    "Please select what you would like to do:",
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
                                    "We will call twice a week. On what days would the person like to receive messages?",
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
                                    "Thank you. At what time would they like to receive these calls?",
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
                                reply: "Thank you. You will now start receiving voice calls between [time] on [days]."
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
                                    "Please select what you would like to do:",
                                    "1. Change the day and time I receive messages",
                                    "2. Change from voice to text messages",
                                    "3. Back to main menu"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [12,13,22,23];
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
                                reply: "Thank you. You will now receive text messages."
                            })
                            .check(function(api) {
                                var expected_used = [12, 13, 22, 23, 24, 29];
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
                            reply: "Please enter the new mobile number you would like to receive weekly messages on. For example, 0803304899"
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
                                "Sorry, this number is already registered. They must opt-out before they can register again.",
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
                            reply: "Please enter the new mobile number you would like to receive weekly messages on. For example, 0803304899"
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
                            var expected_used = [8, 12, 13, 14];
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
                            var expected_used = [6, 7, 8, 15];
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

            describe.skip("Change language", function() {
                it("to state_msg_language", function() {
                    return tester
                        .setup.user.addr('082222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_msisdn_permission - yes
                            , '4'  // state_main_menu - change language
                        )
                        .check.interaction({
                            state: 'state_msg_language',
                            reply: [
                                "What language would this person like to receive these messages in?",
                                "1. English",
                                "2. Hausa",
                                "3. Igbo"
                            ].join('\n')
                        })
                        .run();
                });
                it("to state_msg_language_confirm", function() {
                    return tester
                        .setup.user.addr('082222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_msisdn_permission - yes
                            , '4'  // state_main_menu - change language
                            , '1'  // state_msg_language - english
                        )
                        .check.interaction({
                            state: 'state_msg_language_confirm',
                            reply: "Thank you. You language preference has been updated and you will start to receive messages in this language."
                        })
                        .run();
                });
            });

            describe.only("Change states flows - opt-out", function() {
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
                                    "Please tell us why you no longer want to receive messages so we can help you further.",
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
                                    "We are sorry for your loss. Would you like to receive a small set of free messages from Hello Mama that could help you in this difficult time?",
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
                    it.skip("case 1 > to state_end_loss (miscarriage)", function() {
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
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW"
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
                    // 2 - stillborn
                    it.skip("case 1 > to state_end_loss (stillborn)", function() {
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
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW"
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
                    // 3 - baby death
                    it.skip("case 1 > to state_end_loss (stillborn)", function() {
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
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW"
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
                    // 4 - not useful
                    it.skip("case 1 > to state_end_optout", function() {
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
                    // 5 - other
                    it.skip("case 1 > to state_end_optout", function() {
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
                                    "Please tell us why you no longer want to receive messages so we can help you further.",
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
                                    "We are sorry for your loss. Would you like to receive a small set of free messages from Hello Mama that could help you in this difficult time?",
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
                    it.skip("case 2 > to state_end_loss (miscarriage)", function() {
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
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW"
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
                    // 2 - stillborn
                    it.skip("case 2 > to state_end_loss (stillborn)", function() {
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
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW"
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
                    // 3 - baby death
                    it.skip("case 2 > to state_end_loss (stillborn)", function() {
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
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW"
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
                    // 4 - not useful
                    it.skip("case 2 > to state_optout_receiver", function() {
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
                                    "Who would you like to stop receiving messages?",
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
                    it.skip("case 2 > to state_end_optout", function() {
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
                    // 4, 2 - unsubscribe household
                    it.skip("case 2 > to state_end_optout", function() {
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
                    // 4, 3 - unsubscribe all
                    it.skip("case 2 > to state_end_optout", function() {
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
                    // 5 - other
                    it.skip("case 2 > to state_optout_receiver", function() {
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
                                    "Who would you like to stop receiving messages?",
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
                                    "Please tell us why you no longer want to receive messages so we can help you further.",
                                    "1. Mother miscarried",
                                    "2. Baby stillborn",
                                    "3. Baby passed away",
                                    "4. Messages not useful",
                                    "5. Other"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [12,13];
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
                                    "We are sorry for your loss. Would you like to receive a small set of free messages from Hello Mama that could help you in this difficult time?",
                                    "1. Yes",
                                    "2. No"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [12,13];
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
                                var expected_used = [12,13,34,35];
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
                    it.skip("case 3 > to state_end_loss (miscarriage)", function() {
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
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW"
                            })
                            .check(function(api) {
                                var expected_used = [12];
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
                    it.skip("case 3 > to state_end_loss (stillborn)", function() {
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
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW"
                            })
                            .check(function(api) {
                                var expected_used = [12];
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
                    it.skip("case 3 > to state_end_loss (stillborn)", function() {
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
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW"
                            })
                            .check(function(api) {
                                var expected_used = [12];
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
                    it.skip("case 3 > to state_optout_receiver", function() {
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
                                    "Who would you like to stop receiving messages?",
                                    "1. Mother messages",
                                    "2. Household messages",
                                    "3. All messages"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [12];
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
                    it.skip("case 3 > to state_end_optout", function() {
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
                                var expected_used = [12];
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
                    it.skip("case 3 > to state_end_optout", function() {
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
                                var expected_used = [12];
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
                    it.skip("case 3 > to state_end_optout", function() {
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
                                var expected_used = [12];
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
                    it.skip("case 3 > to state_optout_receiver", function() {
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
                                    "Who would you like to stop receiving messages?",
                                    "1. Mother messages",
                                    "2. Household messages",
                                    "3. All messages"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [12];
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
                                    "Please tell us why you no longer want to receive messages so we can help you further.",
                                    "1. Mother miscarried",
                                    "2. Baby stillborn",
                                    "3. Baby passed away",
                                    "4. Messages not useful",
                                    "5. Other"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [6,7];
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
                                    "We are sorry for your loss. Would you like to receive a small set of free messages from Hello Mama that could help you in this difficult time?",
                                    "1. Yes",
                                    "2. No"
                                ].join('\n')
                            })
                            .check(function(api) {
                                var expected_used = [6,7];
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
                                var expected_used = [6,7,34,35];
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
                    it.skip("case 4 > to state_end_loss (miscarriage)", function() {
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
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW"
                            })
                            .check(function(api) {
                                var expected_used = [6,7];
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
                    it.skip("case 4 > to state_end_loss (stillborn)", function() {
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
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW"
                            })
                            .check(function(api) {
                                var expected_used = [6,7];
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
                    it.skip("case 4 > to state_end_loss (stillborn)", function() {
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
                                reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW"
                            })
                            .check(function(api) {
                                var expected_used = [6,7];
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
                    it.skip("case 4 > to state_end_optout", function() {
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
                                var expected_used = [6,7];
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
                    it.skip("case 4 > to state_end_optout", function() {
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
                                var expected_used = [6,7];
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
                it(" - baby messages, back to main menu", function() {
                    return tester
                        .setup.user.addr('082333')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'   // state_msisdn_permission - yes
                            , '1'   // state_main_menu - start baby messages
                            , '1'   // state_already_registered_baby - back to main menu
                        )
                        .check.interaction({
                            state: 'state_main_menu'
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

            describe("Complete flows", function() {
                it.skip(" - via baby messages to exit", function() {
                    return tester
                        .setup.user.addr('082333')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'   // state_msisdn_permission - yes
                            , '1'   // state_main_menu - start baby messages
                            , '2'   // state_already_registered_baby - exit
                        )
                        .check.interaction({
                            state: 'state_end_exit',
                            reply: "Thank you for using the Hello Mama service"
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

        // TEST VALIDATION

        /*describe("Validation testing", function() {
            it("validate state_auth_code", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , 'aaaaa'  // state_auth_code - invalid personnel code
                    )
                    .check.interaction({
                        state: 'state_auth_code',
                        reply: "That code is not recognised. Please enter your 5 digit personnel code."
                    })
                    .run();
            });
            it("validate state_msg_receiver", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '5'  // state_msg_receiver - invalid choice
                    )
                    .check.interaction({
                        state: 'state_msg_receiver',
                        reply: [
                            "Sorry not a valid input. Please select who will receive the messages on their phone:",
                            "1. Head of the Household",
                            "2. Mother to be",
                            "3. Family member",
                            "4. Trusted friend"
                        ].join('\n')
                    })
                    .run();
            });

        });*/
    });

});
