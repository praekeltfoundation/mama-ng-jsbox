var vumigo = require('vumigo_v02');
// TR02 var fixtures = require('./fixtures_public');
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
                    name: 'train-ussd-public-test',
                    country_code: '234',  // nigeria
                    channel: '*120*8864*0000#',
                    testing_today: '2015-04-03 06:07:08.999',  // testing only
                    testing_message_id: '0170b7bb-978e-4b8a-35d2-662af5b6daee',  // testing only
                    no_timeout_redirects: [
                        'state_start',
                        'state_end_voice',
                        'state_end_sms'
                    ]
                })
                .setup(function(api) {
                    // TR02 don't add any fixtures
                })
                ;
        });

        // TEST CHANGE FLOW

        describe("Flow testing - ", function() {
            describe("Initial states enroute to st-A (state_main_menu)", function() {
                it("to state_language", function() {
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
                        .run();
                });
                it("to state_registered_msisdn", function() { //st-C
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  //dial in
                            , '2'   // state_language - ibo_NG
                        )
                        .check.interaction({
                            state: 'state_registered_msisdn',
                            reply: "Please enter the number which is registered to receive messages. For example, 0803304899"
                        })
                        .check.user.properties({lang: 'ibo_NG'})
                        .run();
                });
                it("to state_main_menu", function() {
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
                        .run();
                });
            });

            describe("Change to baby messages", function() {
                it("to state_new_registration_baby", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '1'  // state_main_menu - start baby messages
                        )
                        .check.interaction({
                            state: 'state_new_registration_baby',
                            reply: "Thank you. You will now receive messages about caring for baby"
                        })
                        .run();
                });
            });

            describe("Change message format and time", function() {
                it("to state_change_menu_sms", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '2'  // state_main_menu - change message preferences
                        )
                        .check.interaction({
                            state: 'state_change_menu_sms',
                            reply: [
                                "Please select what you would like to do:",
                                "1. Change from text to voice messages",
                                "2. Back to main menu"
                            ].join('\n')
                        })
                        .run();
                });
                it("to state_voice_days", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '2'  // state_main_menu - change message preferences
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
                it("to state_voice_times", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '2'  // state_main_menu - change message preferences
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
                it("to state_end_voice_confirm", function() {
                    return tester
                        .setup.user.addr('05059992222')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '2'  // state_main_menu - change message preferences
                            , '1'  // state_change_menu_sms - change from text to voice
                            , '2'  // state_voice_days - tuesday and thursday
                            , '1'  // state_voice_times - 9-11am
                        )
                        .check.interaction({
                            state: 'state_end_voice_confirm',
                            reply: "Thank you. You will now start receiving voice calls between 9am - 11am on Tuesday and Thursday."
                        })
                        .check.reply.ends_session()
                        .run();
                });
                it("back to state_main_menu", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '2'  // state_main_menu - change message preferences
                            , '2'  // state_change_menu_sms - back to main menu
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
                        .run();
                });
            });

            describe("Change number", function() {
                it("to state_new_msisdn", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '3'  // state_main_menu - change number
                        )
                        .check.interaction({
                            state: 'state_new_msisdn',
                            reply: "Please enter the new mobile number you would like to receive weekly messages on. For example, 0803304899"
                        })
                        .run();
                });
                it("to state_end_number_change", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '3'  // state_main_menu - change number
                            , '05059998888' // state_new_msisdn
                        )
                        .check.interaction({
                            state: 'state_end_number_change',
                            reply: "Thank you. The number which receives messages has been updated."
                        })
                        .run();
                });
            });

            describe("Change language", function() {
                it("to state_msg_language", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '4'  // state_main_menu - change language
                        )
                        .check.interaction({
                            state: 'state_msg_language',
                            reply: [
                                "What language would this person like to receive these messages in?",
                                "1. English",
                                "2. Igbo",
                                "3. Pidgin"
                            ].join('\n')
                        })
                        .check.user.properties({lang: 'pcm_NG'})
                        .run();
                });
                it("to state_msg_language_confirm", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '4'  // state_main_menu - change language
                            , '2'  // state_msg_language - igbo
                        )
                        .check.interaction({
                            state: 'state_msg_language_confirm',
                            reply: "Thank you. You language preference has been updated and you will start to receive messages in this language."
                        })
                        .check.user.properties({lang: 'ibo_NG'})
                        .run();
                });
            });

            describe("Change states flows - opt-out", function() {
                // to optout reason menu
                it("to state_optout_reason", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '5'  // state_main_menu - optout
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
                        .run();
                });
                // 1 - miscarriage
                it("to state_loss_subscription", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '5'  // state_main_menu - optout
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
                        .run();
                });
                // 1, 1 - miscarriage, yes
                it("to state_loss_subscription_confirm", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '5'  // state_main_menu - optout
                            , '1'  // state_optout_reason - mother miscarried
                            , '1'  // state_loss_subscription - yes
                        )
                        .check.interaction({
                            state: 'state_end_loss_subscription_confirm',
                            reply: "Thank you. You will now receive messages to support you during this difficult time."
                        })
                        .run();
                });
                // 1, 2 - miscarriage, no
                it("to state_end_loss (miscarriage)", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '5'  // state_main_menu - optout
                            , '1'  // state_optout_reason - mother miscarried
                            , '2'  // state_loss_subscription - no
                        )
                        .check.interaction({
                            state: 'state_end_loss',
                            reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW"
                        })
                        .run();
                });
                // 2 - stillborn
                it("to state_end_loss (stillborn)", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '5'  // state_main_menu - optout
                            , '2'  // state_optout_reason - baby stillborn
                        )
                        .check.interaction({
                            state: 'state_end_loss',
                            reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW"
                        })
                        .run();
                });
                // 3 - baby death
                it("to state_end_loss (baby death)", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '5'  // state_main_menu - optout
                            , '3'  // state_optout_reason - baby death
                        )
                        .check.interaction({
                            state: 'state_end_loss',
                            reply: "We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW"
                        })
                        .run();
                });
                // 4 - not useful
                it("to state_optout_receiver", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '5'  // state_main_menu - optout
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
                        .run();
                });
                // 4, 1 - not useful, mother
                it("to state_end_optout", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '5'  // state_main_menu - optout
                            , '4'  // state_optout_reason - not_useful
                            , '1'  // state_optout_receiver - mother
                        )
                        .check.interaction({
                            state: 'state_end_optout',
                            reply: "Thank you. You will no longer receive messages"
                        })
                        .run();
                });
                // 5 - other
                it("to state_optout_receiver", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '5'  // state_main_menu - optout
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
                        .run();
                });
                // 5, 1 - other, all
                it("to state_end_optout", function() {
                    return tester
                        .setup.user.addr('05059991111')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '3'   // state_language - pidgin
                            , '05059993333'  // state_registered_msisdn
                            , '5'  // state_main_menu - optout
                            , '5'  // state_optout_reason - other
                            , '3'  // state_optout_receiver - all
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
