var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
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
                    channel: '*120*8864*0000#',
                    testing_today: '2015-04-03 06:07:08.999',
                    services: {
                        identities: {
                            api_token: 'test_token_identities',
                            url: "http://localhost:8000/api/v1/identities/"
                        },
                        subscriptions: {
                            api_token: 'test_token_subscriptions',
                            url: "http://localhost:8000/api/v1/subscriptions/"
                        },
                        outbound: {
                            api_token: 'test_token_outbound',
                            url: "http://localhost:8000/api/v1/outbound/"
                        }
                    },
                    endpoints: {
                        "sms": {"delivery_class": "sms"}
                    },
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
                            "2. No, start new registration"
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
                        reply: "Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345"
                    })
                    .run();
            });
            it("to state_msg_receiver", function() {
                return tester
                    .setup.user.addr('08080070007')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                    )
                    .check.interaction({
                        state: 'state_msg_receiver',
                        reply: [
                            "Please select who will receive the messages on their phone:",
                            "1. The Mother & Father",
                            "2. The Mother only",
                            "3. The Father only",
                            "4. A family member",
                            "5. A trusted friend"
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
                        , '4'       // state_msg_receiver - family member
                    )
                    .check.interaction({
                        state: 'state_msisdn',
                        reply: "Please enter the mobile number of the person who will receive the weekly messages. For example, 08033048990"
                    })
                    .run();
            });
            it("to state_msisdn_father", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'       // state_msg_receiver - mother & father
                    )
                    .check.interaction({
                        state: 'state_msisdn_father',
                        reply: "Please enter the mobile number of the FATHER. For example, 08033048990"
                    })
                    .run();
            });
            it("to state_msisdn_mother", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'       // state_msg_receiver - mother & father
                        , '08033048990' // state_msisdn_father
                    )
                    .check.interaction({
                        state: 'state_msisdn_mother',
                        reply: "Please enter the mobile number of the MOTHER. For example, 08033048990"
                    })
                    .run();
            });
            it("to state_pregnancy_status", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '2' // state_msg_receiver - mother only
                        , '08033048990'  // state_msisdn
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
                        , '5' // state_msg_receiver - trusted friend
                        , '08033048990'  // state_msisdn
                        , '1'  // state_msg_pregnancy_status - pregnant
                    )
                    .check.interaction({
                        state: 'state_last_period_month',
                        reply: [
                            "Please select the month the woman had her last period:",
                            "1. April 15",
                            "2. March 15",
                            "3. February 15",
                            "4. January 15",
                            "5. December 14",
                            "6. November 14",
                            "7. October 14",
                            "8. September 14",
                            "9. More"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_last_period_month - after selecting 'More'", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '5' // state_msg_receiver - trusted friend
                        , '08033048990'  // state_msisdn
                        , '1'  // state_msg_pregnancy_status - pregnant
                        , '9'   // state_last_period_month - More
                    )
                    .check.interaction({
                        state: 'state_last_period_month',
                        reply: [
                            "Please select the month the woman had her last period:",
                            "1. August 14",
                            "2. Back"
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
                        , '5' // state_msg_receiver - trusted friend
                        , '08033048990'  // state_msisdn
                        , '1'  // state_msg_pregnancy_status - pregnant
                        , '9'   // state_last_period_month - More
                        , '2'   // state_last_period_month - Back
                    )
                    .check.interaction({
                        state: 'state_last_period_month',
                        reply: [
                            "Please select the month the woman had her last period:",
                            "1. April 15",
                            "2. March 15",
                            "3. February 15",
                            "4. January 15",
                            "5. December 14",
                            "6. November 14",
                            "7. October 14",
                            "8. September 14",
                            "9. More"
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
                        , '5' // state_msg_receiver - trusted friend
                        , '08033048990'  // state_msisdn
                        , '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                    )
                    .check.interaction({
                        state: 'state_last_period_day',
                        reply: "What day of the month did the woman start her last period? For example, 12."
                    })
                    .run();
            });
            it("to state_msg_language", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                      {session_event: 'new'}  // dial in
                      , '12345'   // state_auth_code - personnel code
                      , '5' // state_msg_receiver - trusted friend
                      , '08033048990'  // state_msisdn
                      , '1'  // state_msg_pregnant - mother
                      , '3'  // state_last_period_month - May 15
                      , '12'  // state_last_period_day
                    )
                    .check.interaction({
                        state: 'state_msg_language',
                        reply: [
                            "Which language would this person like to receive these messages in?",
                            "1. English",
                            "2. Hausa",
                            "3. Igbo"
                        ].join('\n')
                    })
                    .run();
            });
            // mother has baby
            it("to state_baby_birth_month_year", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '5' // state_msg_receiver - trusted friend
                        , '08033048990'  // state_msisdn
                        , '2'  // state_msg_pregnancy_status - baby
                    )
                    .check.interaction({
                        state: 'state_baby_birth_month_year',
                        reply: [
                            "Select the month & year the baby was born:",
                            "1. April 15",
                            "2. March 15",
                            "3. February 15",
                            "4. January 15",
                            "5. December 14",
                            "6. November 14",
                            "7. October 14",
                            "8. September 14",
                            "9. August 14",
                            "10. More"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_baby_birth_month_year - after selecting 'More'", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '5' // state_msg_receiver - trusted friend
                        , '08033048990'  // state_msisdn
                        , '2'  // state_msg_pregnancy_status - baby
                        , '10' // state_baby_birth_month_year - More
                    )
                    .check.interaction({
                        state: 'state_baby_birth_month_year',
                        reply: [
                            "Select the month & year the baby was born:",
                            "1. July 14",
                            "2. June 14",
                            "3. May 14",
                            "4. Back"
                        ].join('\n')
                    })
                    .run();
            });

            it("to state_baby_birth_day", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '5' // state_msg_receiver - trusted friend
                        , '08033048990'  // state_msisdn
                        , '2'  // state_msg_pregnancy_status - baby
                        , '3'  // state_baby_birth_month_year - May 15
                    )
                    .check.interaction({
                        state: 'state_baby_birth_day',
                        reply: "What day of the month was the baby born? For example, 12."
                    })
                    .run();
            });
            it("to state_msg_language", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                      {session_event: 'new'}  // dial in
                      , '12345'   // state_auth_code - personnel code
                      , '5' // state_msg_receiver - trusted friend
                      , '08033048990'  // state_msisdn
                      , '2'  // state_msg_pregnancy_status - baby
                      , '3'  // state_baby_birth_month_year - May 15
                      , '12'  // state_baby_birth_day
                    )
                    .check.interaction({
                        state: 'state_msg_language',
                    })
                    .run();
            });
            it("to state_msg_type", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '5' // state_msg_receiver - trusted friend
                        , '08033048990'  // state_msisdn
                        , '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '1'  // state_msg_language - english
                    )
                    .check.interaction({
                        state: 'state_msg_type',
                        reply: [
                            "How would this person like to get messages?",
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
                        , '5' // state_msg_receiver - trusted friend
                        , '08033048990'  // state_msisdn
                        , '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '1'  // state_msg_language - english
                        , '1'   // state_msg_type - voice calls
                    )
                    .check.interaction({
                        state: 'state_voice_days',
                        reply: [
                            "We will call them twice a week. On what days would the person like to receive these calls?",
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
                        , '5' // state_msg_receiver - trusted friend
                        , '08033048990'  // state_msisdn
                        , '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '1'  // state_msg_language - english
                        , '1'   // state_msg_type - voice calls
                        , '2'   // state_voice_days - tuesdays and thursdays
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
            it("to state_end_voice", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '5' // state_msg_receiver - trusted friend
                        , '08033048990'  // state_msisdn
                        , '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '1'  // state_msg_language - english
                        , '1'   // state_msg_type - voice calls
                        , '2'   // state_voice_days - tuesdays and thursdays
                        , '2'   // state_voice_times - between 2-5pm
                    )
                    .check.interaction({
                        state: 'state_end_voice',
                        reply: "Thank you. The person will now start receiving calls on Tuesday and Thursday between 2pm - 5pm."
                    })
                    .check.reply.ends_session()
                    .run();
            });
            //user wants text sms's
            it("to state_end_sms", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '5' // state_msg_receiver - trusted friend
                        , '08033048990'  // state_msisdn
                        , '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '2'  // state_msg_language - hausa
                        , '2'   // state_msg_type - text smss
                    )
                    .check.interaction({
                        state: 'state_end_sms',
                        reply: "Thank you. The person will now start receiving messages three times a week."
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
                        , '5' // state_msg_receiver - trusted friend
                        , '08033048990'  // state_msisdn
                        , '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '1'  // state_msg_language - english
                        , '1'   // state_msg_type - voice calls
                        , '2'   // state_voice_days - tuesdays and thursdays
                        , '2'   // state_voice_times - between 2-5pm
                    )
                    .check.interaction({
                        state: 'state_end_voice',
                    })
                    .run();
            });
            it("complete flow 2 - receiver: mother & father; mother pregnant, voice", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '1' // state_msg_receiver - trusted friend
                        , '08033048990'  // state_msisdn_father
                        , '08033048991'  // state_msiddn_mother
                        , '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '1'  // state_msg_language - english
                        , '1'   // state_msg_type - voice calls
                        , '2'   // state_voice_days - tuesdays and thursdays
                        , '2'   // state_voice_times - between 2-5pm
                    )
                    .check.interaction({
                        state: 'state_end_voice',
                    })
                    .run();
            });
            it("complete flow 3 - receiver: father only; mother baby, sms", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '3' // state_msg_receiver - father only
                        , '08033048990'  // state_msisdn
                        , '2'  // state_msg_pregnant - baby
                        , '4'  // state_baby_birth_month_year - May 15
                        , '12' // state_baby_birth_day - 12
                        , '3'  // state_msg_language - igbo
                        , '2'   // state_msg_type - sms
                    )
                    .check.interaction({
                        state: 'state_end_sms',
                    })
                    .run();
            });
        });

        // TEST VALIDATION

        describe("Validation testing", function() {
            it("validate state_auth_code", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , 'aaaaa'  // state_auth_code - invalid personnel code
                    )
                    .check.interaction({
                        state: 'state_auth_code',
                        reply: "Sorry, that is not a valid number. Please enter your unique personnel code. For example, 12345"
                    })
                    .run();
            });
            it("validate state_msisdn", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '2'       // state_msg_receiver - mother only
                        , 'aaaaaa'  // state_msisdn - mobile number
                    )
                    .check.interaction({
                        state: 'state_msisdn',
                        reply: "Sorry, that is not a valid number. Please enter the mobile number of the person who will receive the weekly messages. For example, 08033048990"
                    })
                    .run();
            });
            it("validate state_msisdn_father", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'       // state_msg_receiver - mother & father
                        , 'aaaaaa'  // state_msisdn - mobile number
                    )
                    .check.interaction({
                        state: 'state_msisdn_father',
                        reply: "Sorry, that is not a valid number. Please enter the mobile number of the FATHER. For example, 08033048990"
                    })
                    .run();
            });
            it("validate state_msisdn_mother", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '1'       // state_msg_receiver - mother & father
                        , '08033048990' // state_msisdn_father
                        , 'aaaaaa'  // state_msisdn_mother - mobile number
                    )
                    .check.interaction({
                        state: 'state_msisdn_mother',
                        reply: "Sorry, that is not a valid number. Please enter the mobile number of the MOTHER. For example, 08033048990"
                    })
                    .run();
            });
            it("validate state_last_period_day", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '4'  // state_msg_receiver - family member
                        , '08033048990' // state_msisdn - mobile number
                        , '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '32' // state_last_period_day
                    )
                    .check.interaction({
                        state: 'state_last_period_day',
                        reply: "Sorry, that is not a valid number. What day of the month did the woman start her last period? For example, 12."
                    })
                    .run();
            });
            it("validate state_baby_birth_day", function() {
                return tester
                    .setup.user.addr('08080020002')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '5'  // state_msg_receiver - trusted friend
                        , '0803304899' // state_msisdn - mobile number
                        , '2'  // state_msg_pregnancy_status - baby
                        , '3'  // state_baby_birth_month_year - May 15
                        , 'a'  // state_baby_birth_day
                    )
                    .check.interaction({
                        state: 'state_baby_birth_day',
                        reply: "Sorry, that is not a valid number. What day of the month was the baby born? For example, 12."
                    })
                    .run();
            });
            describe("Validate overall date", function() {
                it("reaches state_invalid_date - via st-06/19", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '12345'   // state_auth_code - personnel code
                            , '2'  // state_msg_receiver - mother
                            , '0803304899' // state_msisdn - mobile number
                            , '1'  // state_msg_pregnancy_status - pregnant
                            , '3'  // state_last_period_month - Feb 15
                            , '31'  // state_last_period_day - 31 (invalid day)
                        )
                        .check.interaction({
                            state: 'state_invalid_date',
                            reply: [
                                "The date you entered (20150231) is not a real date. Please try again.",
                                "1. Continue"
                            ].join('\n')
                        })
                        .run();
                });
                it("validate state_last_period_month - via st-06/19 looping back to st-05", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '12345'   // state_auth_code - personnel code
                            , '2'  // state_msg_receiver - mother
                            , '0803304899' // state_msisdn - mobile number
                            , '1'  // state_msg_pregnancy_status - pregnant
                            , '3'  // state_last_period_month - Feb 15
                            , '31'  // state_last_period_day - 31 (invalid day)
                            , '1'  // state_invalid_date - continue
                        )
                        .check.interaction({
                            state: 'state_last_period_month'
                        })
                        .run();
                });
                it("reaches state_invalid_date - via st-14/18", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '12345'   // state_auth_code - personnel code
                            , '2'  // state_msg_receiver - mother
                            , '0803304899' // state_msisdn - mobile number
                            , '2'  // state_msg_pregnancy_status - baby
                            , '3'  // state_baby_birth_month_year - Feb 15
                            , '31'  // state_baby_birth_day - 30 (invalid day)
                        )
                        .check.interaction({
                            state: 'state_invalid_date',
                            reply: [
                                "The date you entered (20150231) is not a real date. Please try again.",
                                "1. Continue"
                            ].join('\n')
                        })
                        .run();
                });
                it("validate state_baby_birth_month_year - via st-14/18 looping back to st-12", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '12345'   // state_auth_code - personnel code
                            , '2'  // state_msg_receiver - mother
                            , '0803304899' // state_msisdn - mobile number
                            , '2'  // state_msg_pregnancy_status - baby
                            , '3'  // state_baby_birth_month_year - Feb 15
                            , '31'  // state_baby_birth_day - 30 (invalid day)
                            , '1'   // state_invalid_date - continue
                        )
                        .check.interaction({
                            state: 'state_baby_birth_month_year'
                        })
                        .run();
                });
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
                    var expectedChoiceArray = go.utils.make_month_choices($, testDate, limit, increment);

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
                    var expectedChoiceArray = go.utils.make_month_choices($, testDate, limit, increment);

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
                    var expectedChoiceArray = go.utils.make_month_choices($, testDate, limit, increment);

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
                    var expectedChoiceArray = go.utils.make_month_choices($, testDate, limit, increment);

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
                    var expectedChoiceArray = go.utils.make_month_choices($, testDate, limit, increment);

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
                        '0803304899012'      // 13 chars in length
                    ];

                    // function call
                    var resultsArray = [];
                    for (var i=0; i<testDataArray.length; i++) {
                        resultsArray.push(go.utils.is_valid_msisdn(testDataArray[i]));
                    }

                    // expected results
                    assert.equal(resultsArray.length, 9);
                    assert.equal(resultsArray[0], false);
                    assert.equal(resultsArray[1], false);
                    assert.equal(resultsArray[2], false);
                    assert.equal(resultsArray[3], false);
                    assert.equal(resultsArray[4], true);
                    assert.equal(resultsArray[5], true);
                    assert.equal(resultsArray[6], false);
                    assert.equal(resultsArray[7], false);
                    assert.equal(resultsArray[8], true);
                });
            });

        });
    });
});
