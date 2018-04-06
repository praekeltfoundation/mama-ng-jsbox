var vumigo = require('vumigo_v02');
var AppTester = vumigo.AppTester;
var App = vumigo.App;
App.call(App);

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
                    testing_today: '2015-04-03 06:07:08.999',
                    default_day: 'tue',
                    default_time: '6_8',
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
                    .run();
            });
            it("should continue", function() {
                return tester
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
                    .run();
            });
            it("should restart", function() {
                return tester
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
                    .run();
            });
            it("should send a dialback sms on first timeout", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - corp code
                        , {session_event: 'close'}
                    )
                    .run();
            });
            it("should not send a dialback sms on second timeout", function() {
                return tester
                    .setup.user.addr('08080040004')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - corp code
                        , {session_event: 'close'}
                    )
                    .run();
            });
        });

        // TEST START OF SESSION ACTIONS
        describe("Start of session", function() {
            it("should reset user answers", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .setup.user.answers({       // set up answers to be reset
                        state_auth_code: '12345',
                        state_msisdn: '08033046899'
                    })
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.user.answers({})
                    .run();
            });
        });

        // TEST REGISTRATION

        describe("Flow testing - registration", function() {
            it("to state_auth_code", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.interaction({
                        state: 'state_auth_code',
                        reply: "Welcome to Hello MAMA! Please enter your unique Community Resource Persons code."
                    })
                    .run();
            });
            it("to state_msg_receiver", function() {
                return tester
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
                    .run();
            });
            it("to state_msisdn (from state_msg_receiver)", function() {
                return tester
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
                    .run();
            });

            it("to state_msisdn_mother (from state_msg_receiver)", function() {
                return tester
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
                    .run();
            });

            it("to state_msisdn_household", function() {
                return tester
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
                    .run();
            });

            it("to state_msg_language", function() {
                return tester
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
                    .run();
            });

            it("to state_msg_type", function() {
                return tester
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
                    .run();
            });

            it("to state_end_voice", function() {
                return tester
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
                    .check.reply.ends_session()
                    .run();
            });
            // user wants text sms's
            it("to state_end_sms", function() {
                return tester
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
                    .check.reply.ends_session()
                    .run();
            });
        });

        describe("Flow testing - complete flows", function() {

            it("complete flow 2 - receiver: mother & father; voice", function() {
                return tester
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
                    .run();
            });

            it("complete flow 4 - receiver: mother & father; voice", function() {
                return tester
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
                    .run();
            });
            it("complete flow 5 - receiver: mother_only, voice", function() {
                return tester
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
                    .run();
            });
        });

        describe("Validation testing", function() {
            it("validate state_auth_code", function() {
                return tester
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
