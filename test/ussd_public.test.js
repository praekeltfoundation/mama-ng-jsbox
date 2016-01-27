var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var AppTester = vumigo.AppTester;

describe("hello mama public app", function() {
    describe("for public ussd use", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoFC();
            tester = new AppTester(app);

            tester
                .setup.char_limit(182)
                .setup.config.app({
                    name: 'ussd_public_test',  //?  name ok..?
                    channel: '*120*8864*0000#',
                    testing_today: '2015-04-03 06:07:08.999',
                    //metric_store: 'mama_ng_test',  // _env at the end  ? hello mama
                    control: {
                        url: "http://localhost:8000/api/v1/",
                        api_key: "control_test_key"
                    },
                    endpoints: {
                        "sms": {"delivery_class": "sms"}
                    },
                    vumi_http: {
                        url: "https://localhost/api/v1/go/http_api_nostream/conversation_key/messages.json",
                        account_key: "acc_key",
                        conversation_token: "conv_token"
                    }
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                })
                /*.setup(function(api) {
                    api.metrics.stores = {'mama_ng_test': {}};  // hello mama
                })*/
                .setup(function(api) {
                    // new user 082111
                    api.contacts.add({
                        msisdn: '+082111',
                        extra: {},
                        key: "contact_key_082111",
                        user_account: "contact_user_account"
                    });
                })
                .setup(function(api) {
                    // registered user 082222
                    api.contacts.add({
                        msisdn: '+082222',
                        extra: {},
                        key: "contact_key_082222",
                        user_account: "contact_user_account"
                    });
                })
                .setup(function(api) {
                    // registered user 082333, registered for baby messages
                    api.contacts.add({
                        msisdn: '+082333',
                        extra: {},
                        key: "contact_key_082333",
                        user_account: "contact_user_account"
                    });
                })
                .setup(function(api) {
                    // registered user 082444, registered for sms
                    api.contacts.add({
                        msisdn: '+082444',
                        extra: {},
                        key: "contact_key_082444",
                        user_account: "contact_user_account"
                    });
                })
                .setup(function(api) {
                    // registered user 082555, registered for voice
                    api.contacts.add({
                        msisdn: '+082555',
                        extra: {},
                        key: "contact_key_082555",
                        user_account: "contact_user_account"
                    });
                })
                ;
        });

        // TEST TIMEOUTS

        /*describe("Timeout testing", function() {
            it("should ask about continuing", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , {session_event: 'close'}
                        , {session_event: 'new'}
                    )
                    .check.interaction({
                        state: 'state_timed_out',
                        reply: [
                            "You have an incomplete registration. Would you like to continue with this registration?",
                            "1. Yes",
                            "2. No, start new registration"
                        ].join('\n')
                    })
                    .run();
            });
            it("should continue", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , {session_event: 'close'}
                        , {session_event: 'new'}
                        , '1'  // state_timed_out - continue
                    )
                    .check.interaction({
                        state: 'state_msg_receiver'
                    })
                    .run();
            });
            it("should restart", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , {session_event: 'close'}
                        , {session_event: 'new'}
                        , '2'  // state_timed_out - restart
                    )
                    .check.interaction({
                        state: 'state_auth_code'
                    })
                    .run();
            });
        });*/

        // TEST START ROUTING

        /*describe("When you start the app", function() {
            it("should navigate to either state_msisdn_permission or state_language via state_check_msisdn", function() {
                tester.setup.user.addr('08080020002')
                console.log(tester.setup.user.addr)
                return tester
                    .setup.user.addr('08080020002')  //user not registered; registered user = 07070050005; not = 08080020002
                    .inputs(
                        {session_event: 'new'}
                    )
                    .check.interaction({
                        state: (tester.setup.user.addr === '08080020002'
                                ? 'state_msisdn_permission'   //via state_check_msisdn
                                : 'state_language') */ //via state_check_msisdn
                        //reply: 'Welcome, Number'
                    //})
                    /*.check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8001/api/v1/eng_NG/state_c12_number_1.mp3',
                                wait_for: '#'
                            }
                        }
                    })*/
                //    .run();
        //    });
        //});

        // TEST CHANGE FLOW

        describe("Flow testing - ", function() {
            it("to state_language", function() {  //state D
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.interaction({
                        state: 'state_language',
                        reply: [
                            "Welcome to Hello Mama. Please choose your language",
                            "1. English",
                            "2. Hausa",
                            "3. Igbo"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_msg_registered_msisdn", function() { //state C
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  //dial in
                        , '2'   // state_language - Hausa
                    )
                    .check.interaction({
                        state: 'state_msg_registered_msisdn',
                        reply: "Please enter the number which is registered to receive messages. For example, 0803304899"
                    })
                    .run();
            });
            // assuming flow via registered user...
            it("to state_msisdn_permission", function() {  //state B
                return tester
                    .setup.user.addr('082222')
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
                    .run();
            });
            // assuming flow via unregistered user...
            it("to state_msisdn_not_recognised", function() {  //state F
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '3'   // state_language - igbo
                        , '0803304111'  // state_msg_registered_msisdn
                    )
                    .check.interaction({
                        state: 'state_msisdn_not_recognised',
                        reply: "We do not recognise this number. Please dial from the registered number or sign up with your local Community Health Extension worker."
                    })
                    .run();
            });
            // assuming flow via unregistered/registered user...
            it("to state_main_menu (via state C)", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '2'   // state_language - hausa
                        , '0803304899'  // state_msg_registered_msisdn
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
            // registered user with permission to manage number
            it("to state_main_menu (via state B)", function() {
                return tester
                    .setup.user.addr('082222')
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
                    .run();
            });
            it("to state_msisdn_no_permission", function() {  // via state B
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '2'   // state_msisdn_permission - yes
                    )
                    .check.interaction({
                        state: 'state_msisdn_no_permission',
                        reply: "We're sorry, you do not have permission to update the preferences for this subscriber."
                    })
                    .run();
            });
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
            it("to state_change_menu_sms", function() {
                return tester
                    .setup.user.addr('082444')
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
                    .run();
            });
            it("to state_voice_days", function() {
                return tester
                    .setup.user.addr('082444')
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
            it("to state_voice_times", function() {
                return tester
                    .setup.user.addr('082444')
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
            it("to state_voice_confirm", function() {
                return tester
                    .setup.user.addr('082444')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_msisdn_permission - yes
                        , '2'  // state_main_menu - change message preferences - registered for text
                        , '1'  // state_change_menu_sms - change from text to voice
                        , '2'  // state_voice_days - tuesday and thursday
                        , '1'  // state_voice_times - 9-11am
                    )
                    .check.interaction({
                        state: 'state_voice_confirm',
                        reply: "Thank you. You will now start receiving voice calls between [time] on [days]."
                    })
                    .run();
            });
            it("to state_msg_new_msisdn", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_msisdn_permission - yes
                        , '3'  // state_main_menu - change number
                    )
                    .check.interaction({
                        state: 'state_msg_new_msisdn',
                        reply: "Please enter the new mobile number you would like to receive weekly messages on. For example, 0803304899"
                    })
                    .run();
            });
            it("to state_msg_receiver", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_msisdn_permission - yes
                        , '3'  // state_main_menu - change number
                        , '0803304899' // state_msg_new_msisdn
                    )
                    .check.interaction({
                        state: 'state_msg_receiver',
                        reply: [
                            "Who will receive these messages?",
                            "1. The Mother",
                            "2. The Father",
                            "3. Family member",
                            "4. Trusted friend"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_msg_receiver_confirm", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_msisdn_permission - yes
                        , '3'  // state_main_menu - change number
                        , '0803304899' // state_msg_new_msisdn
                        , '4'  // state_msg_receiver - trusted friend
                    )
                    .check.interaction({
                        state: 'state_msg_receiver_confirm',
                        reply: "Thank you. The number which receives messages has been updated."
                    })
                    .run();
            });
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
            it("to state_optout_reason", function() {
                return tester
                    .setup.user.addr('082222')
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
                    .run();
            });
            it("to state_loss_subscription", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_msisdn_permission - yes
                        , '5'  // state_main_menu - stop receiving messages
                        , '2'  // state_optout_reason - baby stillborn
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
            it("to state_loss_subscription_confirm", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_msisdn_permission - yes
                        , '5'  // state_main_menu - stop receiving messages
                        , '3'  // state_optout_reason - baby passed away
                        , '1'  // state_loss_subscription - yes
                    )
                    .check.interaction({
                        state: 'state_loss_subscription_confirm',
                        reply: "Thank you. You will now receive messages to support you during this difficult time."
                    })
                    .run();
            });
            it("to state_end_optout", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_msisdn_permission - yes
                        , '5'  // state_main_menu - stop receiving messages
                        , '4'  // state_optout_reason - messages not useful
                    )
                    .check.interaction({
                        state: 'state_end_optout',
                        reply: "Thank you. You will no longer receive messages"
                    })
                    .run();
            });

            describe("navigation loop flows", function() {
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
                        .setup.user.addr('082555')
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

            describe("complete flows", function() {
                it(" - via baby messages", function() {
                    return tester
                        .setup.user.addr('082333')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'   // state_msisdn_permission - yes
                            , '1'   // state_main_menu - start baby messages
                            , '2'   // state_already_registered_baby - exit
                        )
                        .check.interaction({
                            state: 'state_end',
                            reply: "Thank you for using the Hello Mama service"
                        })
                        .run();
                });
                it(" - via changing messages preferences", function() {
                    return tester
                        .setup.user.addr('082555')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_msisdn_permission - yes
                            , '2'  // state_main_menu - change message preferences (registered for voice)
                            , '1'  // state_change_menu_voice - change date/time to receive messages
                            , '1'  // state_voice_days - monday & wednesday
                            , '2'  // state_voice_time - 2-5pm
                        )
                        .check.interaction({
                            state: 'state_voice_confirm',
                            reply: "Thank you. You will now start receiving voice calls between [time] on [days]."
                        })
                        .run();
                });
                it("- via opt-out", function() {
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
