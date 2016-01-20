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
                        , '082111'      // mobile number
                        , '2'   // state_language - Hausa
                    )
                    .check.interaction({
                        state: 'state_msg_registered_msisdn',
                        reply: "Please enter the number which is registered to receive messages. For example, 0803304899"
                    })
                    .run();
            });

            // assuming flow via recognised user...
            it("to state_msisdn_permission", function() {  //state B
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '082111'      // mobile number
                        , '2'   // state_language - Hausa
                        , '0803304899'  // state_msg_registered_msisdn
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
            it("to state_main_menu", function() {  //state A  via state C
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '082111'      // mobile number
                        , '2'   // state_language - Hausa
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
            it("to state_msg_already_registered_baby", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '082111'      // mobile number
                        , '2'   // state_language - Hausa
                        , '0803304899'  // state_msg_registered_msisdn
                        , '1'   // state_main_menu - start baby messages
                    )
                    .check.interaction({
                        state: 'state_msg_already_registered_baby',
                        reply: "You are already registered for baby messages."
                    })
                    .run();
            });
            it("to state_msg_new_registeration_baby", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '082111'      // mobile number
                        , '2'   // state_language - Hausa
                        , '0803304899'  // state_msg_registered_msisdn
                        , '1'   // state_main_menu - start baby messages
                    )
                    .check.interaction({
                        state: 'state_msg_new_registeration_baby',
                        reply: "Thank you. You will now receive messages about caring for baby"
                    })
                    .run();
            });
            it("to state_change_menu_text_smss", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_msisdn_permission - yes
                        , '2'  // state_main_menu - change message preferences - registered for text
                    )
                    .check.interaction({
                        state: 'state_change_menu_text_smss',
                        reply: "Please select what you would like to do:"
                    })
                    .run();
            });
            it("to state_voice_days", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_msisdn_permission - yes
                        , '2'  // state_main_menu - change message preferences - registered for text
                        , '1'  // state_change_menu_text_smss - change from text to voice
                    )
                    .check.interaction({
                        state: 'state_voice_days',
                        reply: "We will call twice a week. On what days would the person like to receive messages?"
                    })
                    .run();
            });
            it("to state_voice_times", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '1'  // state_msisdn_permission - yes
                        , '2'  // state_main_menu - change message preferences - registered for text
                        , '1'  // state_change_menu_text_smss - change from text to voice
                        , '2'  // state_voice_times - tuesday and thursday
                    )
                    .check.interaction({
                        state: 'state_voice_times',
                        reply: "Thank you. At what time would they like to receive these calls?"
                    })
                    .run();
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
