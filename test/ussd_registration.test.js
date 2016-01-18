var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var AppTester = vumigo.AppTester;
var _ = require('lodash');
var assert = require('assert');

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
                    // hcp recognised user 082222
                    api.contacts.add({
                        msisdn: '+082222',
                        extra: {},
                        key: "contact_key_082222",
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
                            "2. Start new registration"
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
                        state: 'state_msisdn'
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

        // TEST HCP RECOGNISED USER

        describe("HCP recognised user", function() {
            it("should not be asked for personnel code", function() {
                return tester
                    .setup.user.addr('082222')
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.interaction({
                        state: 'state_msisdn'
                    })
                    .run();
            });
        });

        // TEST REGISTRATION

        // flow testing case 1 - mother is pregnant and opts for voice calls
        describe("Flow testing - mother pregnant, voice calls", function() {
            it("to state_auth_code", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.interaction({
                        state: 'state_auth_code',
                        reply: "Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345"
                    })
                    .run();
            });
            it("to state_msisdn", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                    )
                    .check.interaction({
                        state: 'state_msisdn',
                        reply: "Please enter the mobile number of the person who will receive the weekly messages.  For example 0803304899"
                    })
                    .run();
            });
            it("to state_msg_receiver", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '0803304899' // state_msisdn - mobile number
                    )
                    .check.interaction({
                        state: 'state_msg_receiver',
                        reply: [
                            "Please select who will receive the messages on their phone:",
                            "1. The Mother",
                            "2. The Father",
                            "3. Family member",
                            "4. Trusted friend"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_pregnancy_status", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '0803304899' // state_msisdn - mobile number
                        , '1'  // state_msg_receiver - mother
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
            it("to state_last_period_month", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '0803304899' // state_msisdn - mobile number
                        , '1'  // state_msg_receiver - mother
                        , '1'  // state_msg_pregnant - mother
                    )
                    .check.interaction({
                        state: 'state_last_period_month',
                        reply: [
                            "Please select the month the woman had her last period:",
                            "1. July 15",
                            "2. June 15",
                            "3. May 15",
                            "4. Apr 15",
                            "5. Mar 15",
                            "6. Feb 15",
                            "7. Jan 15",
                            "8. Dec 14",
                            "9. More"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_last_period_day", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '0803304899' // state_msisdn - mobile number
                        , '1'  // state_msg_receiver - mother
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
                    .setup.user.addr('082111')
                    .inputs(
                      {session_event: 'new'}  // dial in
                      , '12345'   // state_auth_code - personnel code
                      , '0803304899' // state_msisdn - mobile number
                      , '1'  // state_msg_receiver - mother
                      , '1'  // state_msg_pregnant - mother
                      , '3'  // state_last_period_month - May 15
                      , '12'
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
            it("state_msg_call_or_text", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '0803304899' // state_msisdn - mobile number
                        , '1'  // state_msg_receiver - mother
                        , '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '1'  // state_msg_language - english
                    )
                    .check.interaction({
                        state: 'state_msg_call_or_text',
                        reply: [
                            "How would this person like to get messages?",
                            "1. Voice calls",
                            "2. Text SMSs"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_receive_calls_days", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '0803304899' // state_msisdn - mobile number
                        , '1'  // state_msg_receiver - mother
                        , '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '1'  // state_msg_language - english
                        , '1'   // state_msg_call_or_text - voice calls
                    )
                    .check.interaction({
                        state: 'state_receive_calls_days',
                        reply: [
                            "We will call them twice a week. On what days would the person like to receive these calls?",
                            "1. Monday and Wednesday",
                            "2. Tuesday and Thursday"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_receive_calls_time", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '0803304899' // state_msisdn - mobile number
                        , '1'  // state_msg_receiver - mother
                        , '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '1'  // state_msg_language - english
                        , '1'   // state_msg_call_or_text - voice calls
                        , '2'   // state_receive_calls_days - tuesdays and thursdays
                    )
                    .check.interaction({
                        state: 'state_receive_calls_time',
                        reply: [
                            "Thank you. At what time would they like to receive these calls?",
                            "1. Between 9-11am",
                            "2. Between 2-5pm"
                        ].join('\n')
                    })
                    .run();
            });
            it("complete flow - mother pregnant, voice calls", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '0803304899' // state_msisdn - mobile number
                        , '1'  // state_msg_receiver - mother
                        , '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '1'  // state_msg_language - english
                        , '1'   // state_msg_call_or_text - voice calls
                        , '2'   // state_receive_calls_days - tuesdays and thursdays
                        , '2'   // state_receive_calls_time - between 2-5pm
                    )
                    .check.interaction({
                        state: 'state_end_thank_you_calls',
                        reply: "Thank you. The person will now start receiving calls on [day and day] between [time - time]."
                    })
                    .run();
            });
        });

        // flow testing case 2 - mother has baby and opts for text sms's
        describe("Flow testing - mother with baby, text sms's", function() {
            it("to state_auth_code", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                    )
                    .check.interaction({
                        state: 'state_auth_code',
                        reply: "Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345"
                    })
                    .run();
            });
            it("to state_msisdn", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                    )
                    .check.interaction({
                        state: 'state_msisdn',
                        reply: "Please enter the mobile number of the person who will receive the weekly messages.  For example 0803304899"
                    })
                    .run();
            });
            it("to state_msg_receiver", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'  // state_auth_code - personnel code
                        , '0803304899' // state_msisdn - mobile number
                    )
                    .check.interaction({
                        state: 'state_msg_receiver',
                        reply: [
                            "Please select who will receive the messages on their phone:",
                            "1. The Mother",
                            "2. The Father",
                            "3. Family member",
                            "4. Trusted friend"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_pregnancy_status", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '0803304899' // state_msisdn - mobile number
                        , '1'  // state_msg_receiver - mother
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
            it("to state_last_period_month", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '0803304899' // state_msisdn - mobile number
                        , '1'  // state_msg_receiver - mother
                        , '1'  // state_msg_pregnant - mother
                    )
                    .check.interaction({
                        state: 'state_last_period_month',
                        reply: [
                            "Please select the month the woman had her last period:",
                            "1. July 15",
                            "2. June 15",
                            "3. May 15",
                            "4. Apr 15",
                            "5. Mar 15",
                            "6. Feb 15",
                            "7. Jan 15",
                            "8. Dec 14",
                            "9. More"
                        ].join('\n')
                    })
                    .run();
            });
            it("to state_last_period_day", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '0803304899' // state_msisdn - mobile number
                        , '1'  // state_msg_receiver - mother
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
                    .setup.user.addr('082111')
                    .inputs(
                      {session_event: 'new'}  // dial in
                      , '12345'   // state_auth_code - personnel code
                      , '0803304899' // state_msisdn - mobile number
                      , '1'  // state_msg_receiver - mother
                      , '1'  // state_msg_pregnant - mother
                      , '3'  // state_last_period_month - May 15
                      , '12'
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
            it("state_msg_call_or_text", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '0803304899' // state_msisdn - mobile number
                        , '1'  // state_msg_receiver - mother
                        , '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '1'  // state_msg_language - english
                    )
                    .check.interaction({
                        state: 'state_msg_call_or_text',
                        reply: [
                            "How would this person like to get messages?",
                            "1. Voice calls",
                            "2. Text SMSs"
                        ].join('\n')
                    })
                    .run();
            });
            it("complete flow - mother with baby, text sms's", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , '12345'   // state_auth_code - personnel code
                        , '0803304899' // state_msisdn - mobile number
                        , '1'  // state_msg_receiver - mother
                        , '1'  // state_msg_pregnant - mother
                        , '3'  // state_last_period_month - May 15
                        , '12' // state_last_period_day - 12
                        , '1'  // state_msg_language - english
                        , '2'   // state_msg_call_or_text - text smss
                    )
                    .check.interaction({
                        state: 'state_end_thank_you_texts',
                        reply: "Thank you. The person will now start receiving messages three times a week."
                    })
                    .run();
            });
        });

        // TEST VALIDATION

        describe("Validation testing", function() {
            it("validate state_auth_code", function() {
                return tester
                    .setup.user.addr('082111')
                    .inputs(
                        {session_event: 'new'}  // dial in
                        , 'aaaaa'  // state_auth_code - invalid personnel code
                    )
                    .check.interaction({
                        state: 'state_auth_code',
                        reply: "Sorry, that is not a valid number. Please enter your unique personnel code. For example, 12345."
                    })
                    .run();
            });
          /*  it("validate state_msg_receiver", function() {
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
            });*/

        });
    });

});
