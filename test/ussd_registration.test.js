var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures_registration');
var moment = require('moment');
var assert = require('assert');
var AppTester = vumigo.AppTester;
var App = vumigo.App;
App.call(App);
var $ = App.$;

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
                    name: 'ussd-registration-test',
                    country_code: '234',  // nigeria
                    channel: '*120*8864*0000#',
                    testing_today: '2015-04-03 06:07:08.999',
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

        // TEST TIMEOUTS

        describe("Timeout testing", function() {
            it("should ask about continuing", function() {
                return tester
                    .setup.user.addr('08080020002')
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
                    .setup.user.addr('08080020002')
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
                    .check(function(api) {
                        var fixt1 = api.http.fixtures.fixtures[1];
                        assert.equal(fixt1.uses, 2);
                    })
                    .run();
            });
            it("should send a dialback sms on first timeout", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , {session_event: 'close'}
                    )
                    .check(function(api) {
                        var fixt1 = api.http.fixtures.fixtures[30];
                        assert.equal(fixt1.uses, 1);
                    })
                    .run();
            });
            it("should not send a dialback sms on second timeout", function() {
                return tester
                    .setup.user.addr('08080040004')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , {session_event: 'close'}
                    )
                    .check(function(api) {
                        var fixt1 = api.http.fixtures.fixtures[32];
                        assert.equal(fixt1.uses, 1);
                    })
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
                    .check.user.answers({
                        "user_id": "cb245673-aa41-4302-ac47-00000000002"})
                    .run();
            });
        });

        // TEST HCP RECOGNISED USER

        describe("HCP recognised user", function() {
            it("should not be asked for personnel code", function() {
                return tester
                    .setup.user.addr('08080070007')
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.interaction({
                        state: 'state_msg_receiver'
                    })
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
                        reply: "Please enter your Hello Mama code."
                    })
                    .run();
            });
            it("to state_msg_receiver", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
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
            it("to state_msisdn", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '7'       // state_msg_receiver - family_only
                    )
                    .check.interaction({
                        state: 'state_msisdn',
                        reply: "Please enter the mobile number of the family member. They must consent to receiving messages."
                    })
                    .run();
            });
            it("to state_msisdn_mother", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
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
                        , '12345'  // state_auth_code - personnel code
                        , '1'       // state_msg_receiver - mother_father
                        , '08033048990' // state_msisdn_mother
                    )
                    .check.interaction({
                        state: 'state_msisdn_household',
                        reply: "Please enter the mobile number of the father. They must consent to receiving messages."
                    })
                    .run();
            });
            it("to state_msisdn_already_registered", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '2' // state_msg_receiver - mother_only
                        , '09097777777'  // state_msisdn
                    )
                    .check.interaction({
                        state: 'state_msisdn_already_registered',
                        reply: [
                            "Sorry, this number is already registered. They must opt-out before continuing.",
                            "1. Try a different number",
                            "2. Choose a different receiver",
                            "3. Exit"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_end_msisdn", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '2' // state_msg_receiver - mother_only
                        , '09097777777'  // state_msisdn
                        , '3' // state_end_msisdn - exit
                    )
                    .check.interaction({
                        state: 'state_end_msisdn',
                        reply: "Thank you for using the Hello Mama service."
                    })
                    .check.reply.ends_session()
                    .run();
            });
            it("to state_msisdn (from state_msisdn_already_registered)", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '2' // state_msg_receiver - mother_only
                        , '09097777777'  // state_msisdn
                        , '1' // state_end_msisdn - try different number
                    )
                    .check.interaction({
                        state: 'state_msisdn',
                        reply: "Please enter the mobile number of the mother. They must consent to receiving messages."
                    })
                    .run();
            });
            it("to state_msg_receiver (from state_msisdn_already_registered)", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '2' // state_msg_receiver - mother_only
                        , '09097777777'  // state_msisdn
                        , '2' // state_end_msisdn - choose different receiver
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
            // bypass postbirth flow
            it.skip("to state_pregnancy_status", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '2' // state_msg_receiver - mother_only
                        , '09091111111'  // state_msisdn
                    )
                    .check.interaction({
                        state: 'state_pregnancy_status',
                        reply: [
                            "Please select one of the following:",
                            "1. The mother is pregnant",
                            "2. The mother has a baby under 1 year old"
                        ].join('\n')
                    })
                    .run();
            });
            // mother is pregnant
            it("to state_last_period_month", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '6' // state_msg_receiver - friend_only
                        , '09092222222'  // state_msisdn
                        //, '1'  // state_msg_pregnancy_status - pregnant  // bypass postbirth flow
                    )
                    .check.interaction({
                        state: 'state_last_period_month',
                        reply: [
                            "Please select the month the woman started her last period:",
                            "1. April 2015",
                            "2. March 2015",
                            "3. February 2015",
                            "4. January 2015",
                            "5. December 2014",
                            "6. More"
                        ].join('\n')
                    })
                    .check(function(api) {
                        var fixt37 = api.http.fixtures.fixtures[37];
                        assert.equal(fixt37.uses, 1);
                        var fixt38 = api.http.fixtures.fixtures[38];
                        assert.equal(fixt38.uses, 1);
                    })
                    .run();
            });
            it("to state_last_period_month - after selecting 'More'", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '6' // state_msg_receiver - friend_only
                        , '09092222222'  // state_msisdn
                        //, '1'  // state_msg_pregnancy_status - pregnant  // bypass postbirth flow
                        , '6'   // state_last_period_month - More
                    )
                    .check.interaction({
                        state: 'state_last_period_month',
                        reply: [
                            "Please select the month the woman started her last period:",
                            "1. November 2014",
                            "2. October 2014",
                            "3. September 2014",
                            "4. August 2014",
                            "5. July 2014",
                            "6. Back"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_last_period_month - after selecting 'More' and 'Back'", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '6' // state_msg_receiver - friend_only
                        , '09092222222'  // state_msisdn
                        //, '1'  // state_msg_pregnancy_status - pregnant  // bypass postbirth flow
                        , '6'   // state_last_period_month - More
                        , '6'   // state_last_period_month - Back
                    )
                    .check.interaction({
                        state: 'state_last_period_month',
                        reply: [
                            "Please select the month the woman started her last period:",
                            "1. April 2015",
                            "2. March 2015",
                            "3. February 2015",
                            "4. January 2015",
                            "5. December 2014",
                            "6. More"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_last_period_day", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '6' // state_msg_receiver - friend_only
                        , '09092222222'  // state_msisdn
                        //, '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                    )
                    .check.interaction({
                        state: 'state_last_period_day',
                        reply: "What date of the month did the woman start her last period?"
                    })
                    .run();
            });
            it("to state_gravida", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                      {session_event: 'new'}  // dial in
                      , '12345'   // state_auth_code - personnel code
                      , '6' // state_msg_receiver - friend_only
                      , '09092222222'  // state_msisdn
                      //, '1'  // state_msg_pregnant - mother
                      , '3'  // state_last_period_month - May 15
                      , '12'  // state_last_period_day
                    )
                    .check.interaction({
                        state: 'state_gravida',
                        reply: "Please enter the total number of times the woman has been pregnant. This includes any pregnancies she may not have carried to term."
                    })
                    .run();
            });
            it("to state_gravida - day < 10", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                      {session_event: 'new'}  // dial in
                      , '12345'   // state_auth_code - personnel code
                      , '6' // state_msg_receiver - friend_only
                      , '09092222222'  // state_msisdn
                      //, '1'  // state_msg_pregnant - mother
                      , '3'  // state_last_period_month - May 15
                      , '4'  // state_last_period_day
                    )
                    .check.interaction({
                        state: 'state_gravida',
                        reply: "Please enter the total number of times the woman has been pregnant. This includes any pregnancies she may not have carried to term."
                    })
                    .run();
            });
            it("to state_msg_language", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                      {session_event: 'new'}  // dial in
                      , '12345'   // state_auth_code - personnel code
                      , '1' // state_msg_receiver - mother and father
                      , '09092222222'  // state_msisdn_mother
                      , '09091111111'  // state_msisdn_household
                      //, '1'  // state_msg_pregnant - mother
                      , '3'  // state_last_period_month - May 15
                      , '12'  // state_last_period_day
                      , '2'  // state_gravida
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
            // mother has baby
            // bypass postbirth flow
            it.skip("to state_baby_birth_month_year", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '6' // state_msg_receiver - friend_only
                        , '09092222222'  // state_msisdn
                        , '2'  // state_msg_pregnancy_status - baby
                    )
                    .check.interaction({
                        state: 'state_baby_birth_month_year',
                        reply: [
                            "Select the month and year the baby was born:",
                            "1. April 2015",
                            "2. March 2015",
                            "3. February 2015",
                            "4. January 2015",
                            "5. December 2014",
                            "6. November 2014",
                            "7. October 2014",
                            "8. September 2014",
                            "9. August 2014",
                            "10. More"
                        ].join('\n')
                    })
                    .run();
            });
            // bypass postbirth flow
            it.skip("to state_baby_birth_month_year - after selecting 'More'", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '6' // state_msg_receiver - friend_only
                        , '09092222222'  // state_msisdn
                        , '2'  // state_msg_pregnancy_status - baby
                        , '10' // state_baby_birth_month_year - More
                    )
                    .check.interaction({
                        state: 'state_baby_birth_month_year',
                        reply: [
                            "Select the month and year the baby was born:",
                            "1. July 2014",
                            "2. June 2014",
                            "3. May 2014",
                            "4. Back"
                        ].join('\n')
                    })
                    .run();
            });
            // bypass postbirth flow
            it.skip("to state_baby_birth_day", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '6' // state_msg_receiver - friend_only
                        , '09092222222'  // state_msisdn
                        , '2'  // state_msg_pregnancy_status - baby
                        , '3'  // state_baby_birth_month_year - May 15
                    )
                    .check.interaction({
                        state: 'state_baby_birth_day',
                        reply: "What date of the month was the baby born?"
                    })
                    .run();
            });
            // bypass postbirth flow
            it.skip("to state_gravida", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                      {session_event: 'new'}  // dial in
                      , '12345'   // state_auth_code - personnel code
                      , '6' // state_msg_receiver - friend_only
                      , '09092222222'  // state_msisdn
                      , '2'  // state_msg_pregnancy_status - baby
                      , '3'  // state_baby_birth_month_year - May 15
                      , '12'  // state_baby_birth_day
                    )
                    .check.interaction({
                        state: 'state_gravida',
                        reply: "Please enter the total number of times the woman has been pregnant. This includes any pregnancies she may not have carried to term."
                    })
                    .run();
            });
            it("to state_msg_type", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '6' // state_msg_receiver - friend_only
                        , '09092222222'  // state_msisdn
                        //, '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '3'  // state_gravida
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
            // user wants voice calls
            it("to state_voice_days", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '6' // state_msg_receiver - friend_only
                        , '09092222222'  // state_msisdn
                        //, '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '3'  // state_gravida
                        , '1'  // state_msg_language - english
                        , '1'   // state_msg_type - voice calls
                    )
                    .check.interaction({
                        state: 'state_voice_days',
                        reply: [
                            "On what days would they like to receive these calls?",
                            "1. Monday and Wednesday",
                            "2. Tuesday and Thursday"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_voice_times", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '6' // state_msg_receiver - friend_only
                        , '09092222222'  // state_msisdn
                        //, '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '3'  // state_gravida
                        , '3'  // state_msg_language - pidgin
                        , '1'   // state_msg_type - voice calls
                        , '2'   // state_voice_days - tuesdays and thursdays
                    )
                    .check.interaction({
                        state: 'state_voice_times',
                        reply: [
                            "At what time would they like to receive these calls on Tuesdays and Thursdays?",
                            "1. Between 9-11am",
                            "2. Between 2-5pm"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_end_voice", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '6' // state_msg_receiver - friend_only
                        , '09092222222'  // state_msisdn
                        //, '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '3'  // state_gravida
                        , '1'  // state_msg_language - english
                        , '1'   // state_msg_type - voice calls
                        , '2'   // state_voice_days - tuesdays and thursdays
                        , '2'   // state_voice_times - between 2-5pm
                    )
                    .check.interaction({
                        state: 'state_end_voice',
                        reply: "Thank you. They will now start receiving calls on Tuesday and Thursday between 2pm-5pm."
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
                        , '12345'   // state_auth_code - personnel code
                        , '6' // state_msg_receiver - friend_only
                        , '09092222222'  // state_msisdn
                        //, '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '3' // state_gravida
                        , '2'  // state_msg_language - igbo
                        , '2'   // state_msg_type - text smss
                    )
                    .check.interaction({
                        state: 'state_end_sms',
                        reply: "Thank you. They will now start receiving text messages three times a week on Monday, Wednesday and Friday."
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });

        describe("Flow testing - complete flows", function() {
            it("complete flow 1 - receiver: trusted friend; mother pregnant, voice", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '6' // state_msg_receiver - friend_only
                        , '09092222222'  // state_msisdn
                        //, '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '3'  // state_gravida
                        , '1'  // state_msg_language - english
                        , '1'   // state_msg_type - voice calls
                        , '2'   // state_voice_days - tuesdays and thursdays
                        , '2'   // state_voice_times - between 2-5pm
                    )
                    .check.interaction({
                        state: 'state_end_voice',
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [1,6,36,37,38,48,54,59,62,63]);
                    })
                    .run();
            });
            it("complete flow 2 - receiver: mother & father; mother pregnant, voice", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '1' // state_msg_receiver - mother_father
                        , '09094444444'  // state_msiddn_mother
                        , '09095555555'  // state_msisdn_household
                        //, '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '3'  // state_gravida
                        , '1'  // state_msg_language - english
                        , '1'   // state_msg_type - voice calls
                        , '2'   // state_voice_days - tuesdays and thursdays
                        , '2'   // state_voice_times - between 2-5pm
                    )
                    .check.interaction({
                        state: 'state_end_voice',
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [1,6,42,43,44,45,49,64,65,66,67]);
                    })
                    .run();
            });

            // bypass postbirth flow
            it.skip("complete flow 3 - receiver: father only; mother baby, sms", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '3' // state_msg_receiver - father only
                        , '09093333333'  // state_msisdn
                        , '2'  // state_msg_pregnant - baby
                        , '4'  // state_baby_birth_month_year - May 15
                        , '12' // state_baby_birth_day - 12
                        , '2'  // state_gravida
                        , '2'  // state_msg_language - igbo
                        , '2'   // state_msg_type - sms
                    )
                    .check.interaction({
                        state: 'state_end_sms',
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [1,6,39,40,41,47,54,56,57,58]);
                    })
                    .run();
            });
            it("complete flow 4 - receiver: mother & father; mother pregnant, voice", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '1' // state_msg_receiver - mother_father
                        , '09093333333'  // state_msisdn_household
                        , '09093333333'  // state_msiddn_mother
                        //, '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '2'  // state_gravida
                        , '1'  // state_msg_language - english
                        , '1'   // state_msg_type - voice calls
                        , '2'   // state_voice_days - tuesdays and thursdays
                        , '2'   // state_voice_times - between 2-5pm
                    )
                    .check.interaction({
                        state: 'state_end_voice',
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [1,6,39,40,41,50,54,56,68,76]);
                    })
                    .run();
            });
            it("complete flow 5 - receiver: mother_only; mother pregnant, voice", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '2' // state_msg_receiver - mother_only
                        , '09096666666'  // state_msiddn
                        //, '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '2'  // state_gravida
                        , '1'  // state_msg_language - english
                        , '1'   // state_msg_type - voice calls
                        , '2'   // state_voice_days - tuesdays and thursdays
                        , '2'   // state_voice_times - between 2-5pm
                    )
                    .check.interaction({
                        state: 'state_end_voice',
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [1,6,71,72,73,74,75]);
                    })
                    .run();
            });
        });

        describe("When a msisdn exists but is opted out", function() {
            it("should navigate to state_last_period_year", function() {
                return tester
                    .setup.user.addr('07030010009')
                    .inputs(
                        {session_event: 'new'}
                        , '12345'       // state_personnel_auth
                        , '2'           // state_msg_receiver - friend_only
                        , '07030010009' // state_msisdn
                    )
                    .check.interaction({
                        state: 'state_last_period_month'
                    })
                    .run();
            });
            it("should update to remove the optedout flag", function() {
                return tester
                    .setup.user.addr('07030010009')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '2' // state_msg_receiver - mother_only
                        , '07030010009'  // state_msiddn
                        , '5'  // state_last_period_month - dec 2014
                        , '13' // state_last_period_day - 13
                        , '2'  // state_gravida
                        , '2'  // state_msg_language - igbo
                        , '2'   // state_msg_type - sms
                    )
                    .check.interaction({
                        state: 'state_end_sms'
                    })
                    .check(function(api) {
                        // Important fixture here is 86, where the identity is
                        // patched to remove optout
                        var expected_used = [6, 83, 85, 86, 87];
                        var fixts = api.http.fixtures.fixtures;
                        var fixts_used = [];
                        fixts.forEach(function(f, i) {
                            f.uses > 0 ? fixts_used.push(i) : null;
                            f.uses > 0 ? console.log(i + f): null;
                        });
                        assert.deepEqual(fixts_used, expected_used);
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });
        // TEST VALIDATION

        describe("Validation testing", function() {
            it("validate state_auth_code", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .setup.user.state('state_auth_code')
                    .input(
                        'aaaaa'  // state_auth_code - invalid personnel code
                    )
                    .check.interaction({
                        state: 'state_auth_code',
                        reply: "Sorry, invalid number. Please enter your Hello Mama code."
                    })
                    .run();
            });
            it("validate state_msg_receiver", function() {
                return tester
                    .setup.user.addr('08080020002')
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
                    .setup.user.addr('08080020002')
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
                    .setup.user.addr('08080020002')
                    .setup.user.state('state_msisdn_already_registered')
                    .input(
                        '4' // state_msisdn_already_registered - invalid option
                    )
                    .check.interaction({
                        state: 'state_msisdn_already_registered',
                        reply: [
                            "Sorry, invalid option. Sorry, this number is already registered. They must opt-out before continuing.",
                            "1. Try a different number",
                            "2. Choose a different receiver",
                            "3. Exit"
                        ].join('\n')
                    })
                    .run();
            });
            it("validate state_msisdn_mother", function() {
                return tester
                    .setup.user.addr('08080020002')
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
                    .setup.user.addr('08080020002')
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
            it("validate state_last_period_month", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .setup.user.state('state_last_period_month')
                    .input(
                        '10'  // state_last_period_month - May 15
                    )
                    .check.interaction({
                        state: 'state_last_period_month',
                        reply: [
                            'Sorry, invalid date. Please select the month the woman started her last period:',
                            '1. April 2015',
                            '2. March 2015',
                            '3. February 2015',
                            '4. January 2015',
                            '5. December 2014',
                            '6. More'
                        ].join('\n')
                    })
                    .run();
            });
            it("validate state_last_period_day", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .setup.user.state('state_last_period_day')
                    .input(
                        '32' // state_last_period_day
                    )
                    .check.interaction({
                        state: 'state_last_period_day',
                        reply: "Sorry, invalid date. What date of the month did the woman start her last period?"
                    })
                    .run();
            });
            // bypass postbirth flow
            it.skip("validate state_baby_birth_day", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .setup.user.state('state_baby_birth_day')
                    .input(
                        'a'  // state_baby_birth_day
                    )
                    .check.interaction({
                        state: 'state_baby_birth_day',
                        reply: "Sorry, invalid number. What date of the month was the baby born? For example, 12."
                    })
                    .run();
            });
            describe("Validate overall date", function() {
                it("reaches state_invalid_date - via st-06/19", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .setup.user.state('state_last_period_month')
                        .inputs(
                            '3'  // state_last_period_month - Feb 15
                            , '31'  // state_last_period_day - 31 (invalid day)
                        )
                        .check.interaction({
                            state: 'state_invalid_date',
                            reply: [
                                "The date you entered (20150231) is incorrect. Please try again.",
                                "1. Continue",
                                "2. Exit"
                            ].join('\n')
                        })
                        .run();
                });
                it("validate state_last_period_month - via st-06/19 looping back to st-05", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .setup.user.state('state_last_period_month')
                        .inputs(
                            '3'  // state_last_period_month - Feb 15
                            , '31'  // state_last_period_day - 31 (invalid day)
                            , '1'  // state_invalid_date - continue
                        )
                        .check.interaction({
                            state: 'state_last_period_month'
                        })
                        .run();
                });
                // bypass postbirth flow
                it.skip("reaches state_invalid_date - via st-14/18", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .setup.user.state('state_baby_birth_month_year')
                        .inputs(
                            '3'  // state_baby_birth_month_year - Feb 15
                            , '31'  // state_baby_birth_day - 30 (invalid day)
                        )
                        .check.interaction({
                            state: 'state_invalid_date',
                            reply: [
                                "The date you entered (20150231) is incorrect. Please try again.",
                                "1. Continue",
                                "2. Exit"
                            ].join('\n')
                        })
                        .run();
                });
                // bypass postbirth flow
                it.skip("validate state_baby_birth_month_year - via st-14/18 looping back to st-12", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .setup.user.state('state_baby_birth_month_year')
                        .inputs(
                            '3'  // state_baby_birth_month_year - Feb 15
                            , '31'  // state_baby_birth_day - 30 (invalid day)
                            , '1'   // state_invalid_date - continue
                        )
                        .check.interaction({
                            state: 'state_baby_birth_month_year'
                        })
                        .run();
                });
            });
            it("validate state_invalid_date", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .setup.user.state('state_invalid_date')
                    .input('3')
                    .check.interaction({
                        reply: [
                            "Sorry, invalid option. The date you entered (20150231) is incorrect. Please try again.",
                            "1. Continue",
                            "2. Exit"
                        ].join('\n')
                    });

            });
            it("validate state_gravida", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .setup.user.state('state_gravida')
                    .input(
                        'a'  // state_gravida
                    )
                    .check.interaction({
                        state: 'state_gravida',
                        reply: 'Sorry, invalid number. Please enter the total number of times the woman has been pregnant. This includes any pregnancies she may not have carried to term.'
                    })
                    .run();
            });
            it("validate state_gravida limits to 10", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .setup.user.state('state_gravida')
                    .input(
                        '11'  // state_gravida
                    )
                    .check.interaction({
                        state: 'state_gravida',
                        reply: 'Sorry, invalid number. Please enter the total number of times the woman has been pregnant. This includes any pregnancies she may not have carried to term.'
                    })
                    .run();
            });            it("validate state_msg_language", function() {
                return tester
                    .setup.user.addr('08080020002')
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
                    .setup.user.addr('08080020002')
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
            it("validate state_voice_days", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .setup.user.state('state_voice_days')
                    .input(
                        '3'  // state_voice_days
                    )
                    .check.interaction({
                        state: 'state_voice_days',
                        reply: [
                            "Sorry, invalid option. On what days would they like to receive these calls?",
                            "1. Monday and Wednesday",
                            "2. Tuesday and Thursday"
                        ].join('\n')
                    })
                    .run();
            });
            it("validate state_voice_times", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .setup.user.state('state_voice_times')
                    .setup.user.answers({
                        'state_voice_days': 'tue_thu'
                    })
                    .input(
                        '3'  // state_voice_times
                    )
                    .check.interaction({
                        state: 'state_voice_times',
                        reply: [
                            "Sorry, invalid option. At what time would they like to receive these calls on Tuesdays and Thursdays?",
                            "1. Between 9-11am",
                            "2. Between 2-5pm"
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("utils function testing", function() {
            describe("make_month_choices", function() {
                it('should return a Choice array of correct size - forward in same year', function() {
                    // test data
                    var testDate = moment("2015-04-26");
                    var limit = 6;     // should determine the size of the returned array
                    var increment = 1; // should determine subsequent direction of array elements

                    // function call
                    var expectedChoiceArray = go.utils
                        .make_month_choices($, testDate, limit, increment, "YYYYMM", "MMMM YY");

                    // expected results
                    assert.equal(expectedChoiceArray.length, limit);
                    assert.equal(expectedChoiceArray[0].value, "201504");
                    assert.equal(expectedChoiceArray[1].value, "201505");
                    assert.equal(expectedChoiceArray[2].value, "201506");
                    assert.equal(expectedChoiceArray[3].value, "201507");
                    assert.equal(expectedChoiceArray[4].value, "201508");
                    assert.equal(expectedChoiceArray[5].value, "201509");
                });
                it('should return a Choice array of correct size - backwards in same year', function() {
                    // test data
                    var testDate = moment("2015-07-26");
                    var limit = 7;     // should determine the size of the returned array
                    var increment = -1; // should determine subsequent direction of array elements

                    // function call
                    var expectedChoiceArray = go.utils
                        .make_month_choices($, testDate, limit, increment, "YYYYMM", "MMMM YY");

                    // expected results
                    assert.equal(expectedChoiceArray.length, limit);
                    assert.equal(expectedChoiceArray[0].value, "201507");
                    assert.equal(expectedChoiceArray[1].value, "201506");
                    assert.equal(expectedChoiceArray[2].value, "201505");
                    assert.equal(expectedChoiceArray[3].value, "201504");
                    assert.equal(expectedChoiceArray[4].value, "201503");
                    assert.equal(expectedChoiceArray[5].value, "201502");
                    assert.equal(expectedChoiceArray[6].value, "201501");
                });
                it('should return a Choice array of correct size - forward across years', function() {
                    // test data
                    var testDate = moment("2015-12-26");
                    var limit = 4;     // should determine the size of the returned array
                    var increment = 1; // should determine subsequent direction of array elements

                    // function call
                    var expectedChoiceArray = go.utils
                        .make_month_choices($, testDate, limit, increment, "YYYYMM", "MMMM YY");

                    // expected results
                    assert.equal(expectedChoiceArray.length, limit);
                    assert.equal(expectedChoiceArray[0].value, "201512");
                    assert.equal(expectedChoiceArray[1].value, "201601");
                    assert.equal(expectedChoiceArray[2].value, "201602");
                    assert.equal(expectedChoiceArray[3].value, "201603");
                });
                it('should return an array of choices - backwards across years', function() {
                    // test data
                    var testDate = moment("2015-01-26");
                    var limit = 3;     // should determine the size of the returned array
                    var increment = -1; // should determine subsequent direction of array elements

                    // function call
                    var expectedChoiceArray = go.utils
                        .make_month_choices($, testDate, limit, increment, "YYYYMM", "MMMM YY");

                    // expected results
                    assert.equal(expectedChoiceArray.length, limit);
                    assert.equal(expectedChoiceArray[0].value, "201501");
                    assert.equal(expectedChoiceArray[1].value, "201412");
                    assert.equal(expectedChoiceArray[2].value, "201411");
                });
                it('should return an array of choices - forwards, with elements separated by 3 months', function() {
                    // test data
                    var testDate = moment("2015-01-26");
                    var limit = 3;     // should determine the size of the returned array
                    var increment = 3; // should determine subsequent direction of array elements

                    // function call
                    var expectedChoiceArray = go.utils
                        .make_month_choices($, testDate, limit, increment, "YYYYMM", "MMMM YY");

                    // expected results
                    assert.equal(expectedChoiceArray.length, limit);
                    assert.equal(expectedChoiceArray[0].value, "201501");
                    assert.equal(expectedChoiceArray[1].value, "201504");
                    assert.equal(expectedChoiceArray[2].value, "201507");
                });
            });

            describe("is_valid_msisdn", function() {
                it('should return true/false if the msisdn is valid', function() {
                    // test data
                        // needs to start with 0 and be 10 - 13 characters in length to Validate
                    var testDataArray = [
                        '12345',
                        'abcde',
                        '082123',
                        '12345678910',
                        '01987654321',
                        '08033048990',
                        '080330ab990',
                        '08033048990123',    // 14 chars in length
                        '0803304899012',     // 13 chars in length
                        '0803304899',        // 10 chars in length
                    ];

                    // function call
                    var resultsArray = [];
                    for (var i=0; i<testDataArray.length; i++) {
                        resultsArray.push(go.utils.is_valid_msisdn(testDataArray[i]));
                    }

                    // expected results
                    assert.equal(resultsArray.length, 10);
                    assert.equal(resultsArray[0], false);
                    assert.equal(resultsArray[1], false);
                    assert.equal(resultsArray[2], false);
                    assert.equal(resultsArray[3], false);
                    assert.equal(resultsArray[4], true);
                    assert.equal(resultsArray[5], true);
                    assert.equal(resultsArray[6], false);
                    assert.equal(resultsArray[7], false);
                    assert.equal(resultsArray[8], false);
                    assert.equal(resultsArray[9], false);
                });
            });

        });
    });
});
