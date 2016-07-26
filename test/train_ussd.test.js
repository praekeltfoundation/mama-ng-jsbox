var vumigo = require('vumigo_v02');
// TR02 var fixtures = require('./fixtures_registration');
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
                    name: 'train-ussd-test',
                    country_code: '234',  // nigeria
                    channel: '*120*8864*0000#',
                    testing_today: '2015-04-03 06:07:08.999',
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


        describe("RECOGNISED - Registering a pregnancy", function() {
            // TEST TIMEOUTS

            describe("Timeout testing", function() {
                it("should ask about continuing", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
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
                            , '1'  // state_training_intro - register
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
                            , {session_event: 'close'}
                            , {session_event: 'new'}
                            , '2'  // state_timed_out - restart
                        )
                        .check.interaction({
                            state: 'state_training_intro'
                        })
                        .run();
                });
                it("should send a dialback sms on first timeout", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , {session_event: 'close'}
                        )
                        .run();
                });
                it("should not send a dialback sms on second timeout", function() {
                    return tester
                        .setup.user.addr('08080040004')
                        .inputs(
                            {session_event: 'new'}  // dial in
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
                            state_msg_receiver: 'mother_only',
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
                it("to state_training_intro", function() {
                    return tester
                        .setup.user.addr('08080070007')
                        .inputs(
                            {session_event: 'new'}  // dial in
                        )
                        .check.interaction({
                            state: 'state_training_intro',
                            reply: [
                                "Select an option to practise:",
                                "1. Registering a pregnancy",
                                "2. Registering a pregnancy with your Hello Mama code",
                                "3. Changing patient details"
                            ].join('\n')
                        })
                        .run();
                });
                it("to state_msg_receiver", function() {
                    return tester
                        .setup.user.addr('08080070007')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_training_intro - register
                        )
                        .check.interaction({
                            state: 'state_msg_receiver',
                            reply: [
                                "Who will receive messages?",
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
                            , '1'  // state_training_intro - register
                            , '7'  // state_msg_receiver - family_only
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
                            , '1'  // state_training_intro - register
                            , '1'  // state_msg_receiver - mother_father
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
                            , '1'  // state_training_intro - register
                            , '1'       // state_msg_receiver - mother_father
                            , '08033048990' // state_msisdn_mother
                        )
                        .check.interaction({
                            state: 'state_msisdn_household',
                            reply: "Please enter the mobile number of the father. They must consent to receiving messages."
                        })
                        .run();
                });
                // bypass postbirth flow
                it.skip("to state_pregnancy_status", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_training_intro - register
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
                            , '1'  // state_training_intro - register
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
                        .run();
                });
                it("to state_last_period_month - after selecting 'More'", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_training_intro - register
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
                                "5. Back"
                            ].join('\n')
                        })
                        .run();
                });
                it("to state_last_period_month - after selecting 'More' and 'Back'", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_training_intro - register
                            , '6' // state_msg_receiver - friend_only
                            , '09092222222'  // state_msisdn
                            //, '1'  // state_msg_pregnancy_status - pregnant  // bypass postbirth flow
                            , '6'   // state_last_period_month - More
                            , '5'   // state_last_period_month - Back
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
                            , '1'  // state_training_intro - register
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
                          , '1'  // state_training_intro - register
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
                          , '1'  // state_training_intro - register
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
                          , '1'  // state_training_intro - register
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
                            , '6' // state_msg_receiver - friend_only
                            , '09092222222'  // state_msisdn
                            , '2'  // state_msg_pregnancy_status - baby
                            , '3'  // state_baby_birth_month_year - May 15
                        )
                        .check.interaction({
                            state: 'state_baby_birth_day',
                            reply: "On what date of the month was the baby born?"
                        })
                        .run();
                });
                // bypass postbirth flow
                it.skip("to state_gravida", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                          {session_event: 'new'}  // dial in
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
                            , '1'  // state_training_intro - register
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
                            , '1'  // state_training_intro - register
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
                            , '1'  // state_training_intro - register
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
                            , '1'  // state_training_intro - register
                            , '6' // state_msg_receiver - friend_only
                            , '09092222222'  // state_msisdn
                            //, '1'  // state_msg_pregnant - mother
                            , '3'  // state_last_period_month - May 15
                            , '12' // state_last_period_day - 12
                            , '3'  // state_gravida
                            , '1'  // state_msg_language - yoruba
                            , '1'   // state_msg_type - voice calls
                            , '2'   // state_voice_days - tuesdays and thursdays
                            , '2'   // state_voice_times - between 2-5pm
                        )
                        .check.interaction({
                            state: 'state_end_voice',
                            reply: "Thank you. They will now start receiving calls on Tuesday and Thursday between 2pm - 5pm."
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
                            , '1'  // state_training_intro - register
                            , '6' // state_msg_receiver - friend_only
                            , '09092222222'  // state_msisdn
                            //, '1'  // state_msg_pregnant - mother
                            , '3'  // state_last_period_month - May 15
                            , '12' // state_last_period_day - 12
                            , '3' // state_gravida
                            , '2'  // state_msg_language - hausa
                            , '2'   // state_msg_type - text smss
                        )
                        .check.interaction({
                            state: 'state_end_sms',
                            reply: "Thank you. They will now start receiving messages three times a week on Monday, Wednesday and Friday."
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
                            , '1'  // state_training_intro - register
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
                        .run();
                });
                it("complete flow 2 - receiver: mother & father; mother pregnant, voice", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_training_intro - register
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
                        .run();
                });

                // bypass postbirth flow
                it.skip("complete flow 3 - receiver: father only; mother baby, sms", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_training_intro - register
                            , '3' // state_msg_receiver - father only
                            , '09093333333'  // state_msisdn
                            , '2'  // state_msg_pregnant - baby
                            , '4'  // state_baby_birth_month_year - May 15
                            , '12' // state_baby_birth_day - 12
                            , '2'  // state_gravida
                            , '3'  // state_msg_language - igbo
                            , '2'   // state_msg_type - sms
                        )
                        .check.interaction({
                            state: 'state_end_sms',
                        })
                        .run();
                });
                it("complete flow 4 - receiver: mother & father; mother pregnant, voice", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_training_intro - register
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
                        .run();
                });
                it("complete flow 5 - receiver: mother_only; mother pregnant, voice", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '1'  // state_training_intro - register
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
                        .run();
                });
            });

            // TEST VALIDATION

            describe("Validation testing", function() {
                it("validate state_msg_receiver", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .setup.user.state('state_msg_receiver')
                        .input('8')
                        .check.interaction({
                            state: 'state_msg_receiver',
                            reply: [
                                "Sorry, invalid option. Who will receive messages?",
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
                        })

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
                it("validate state_msg_language", function() {
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

        });

        describe("UNRECOGNISED - Registering a pregnancy with Hello Mama code", function() {
            // TEST TIMEOUTS

            describe("Timeout testing", function() {
                it("should ask about continuing", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '2'  // state_training_intro - register with code
                            , '12345'  // state_personnel_auth - personnel code
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
                            , '2'  // state_training_intro - register with code
                            , '12345'  // state_personnel_auth - personnel code
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
                            , '2'  // state_training_intro - register with code
                            , '12345'  // state_personnel_auth - personnel code
                            , {session_event: 'close'}
                            , {session_event: 'new'}
                            , '2'  // state_timed_out - restart
                        )
                        .check.interaction({
                            state: 'state_training_intro'
                        })
                        .run();
                });
                it("should send a dialback sms on first timeout", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '2'  // state_training_intro - register with code
                            , '12345'  // state_personnel_auth - personnel code
                            , {session_event: 'close'}
                        )
                        .run();
                });
                it("should not send a dialback sms on second timeout", function() {
                    return tester
                        .setup.user.addr('08080040004')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '2'  // state_training_intro - register with code
                            , '12345'  // state_personnel_auth - personnel code
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
                            state_personnel_auth: '12345',
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
                it("to state_personnel_auth", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                        )
                        .check.interaction({
                            state: 'state_training_intro',
                            reply: [
                                "Select an option to practise:",
                                "1. Registering a pregnancy",
                                "2. Registering a pregnancy with your Hello Mama code",
                                "3. Changing patient details"
                            ].join('\n')
                        })
                        .run();
                });
                it("to state_msg_receiver", function() {
                    return tester
                        .setup.user.addr('08080070007')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '2'  // state_training_intro - register with code
                            , '12345'  // state_personnel_auth - personnel code
                        )
                        .check.interaction({
                            state: 'state_msg_receiver',
                            reply: [
                                "Who will receive messages?",
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
                            , '2'  // state_training_intro - register with code
                            , '12345'  // state_personnel_auth - personnel code
                            , '7'  // state_msg_receiver - family_only
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
                            , '2'  // state_training_intro - register with code
                            , '12345'  // state_personnel_auth - personnel code
                            , '1'  // state_msg_receiver - mother_father
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
                            , '2'  // state_training_intro - register with code
                            , '12345'  // state_personnel_auth - personnel code
                            , '1'       // state_msg_receiver - mother_father
                            , '08033048990' // state_msisdn_mother
                        )
                        .check.interaction({
                            state: 'state_msisdn_household',
                            reply: "Please enter the mobile number of the father. They must consent to receiving messages."
                        })
                        .run();
                });
                // bypass postbirth flow
                it.skip("to state_pregnancy_status", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '12345'   // state_personnel_auth - personnel code
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
                it.skip("to state_last_period_month", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '12345'   // state_personnel_auth - personnel code
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
                        .run();
                });
                it("to state_last_period_month - after selecting 'More'", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '2'  // state_training_intro - register with code
                            , '12345'   // state_personnel_auth - personnel code
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
                                "5. Back"
                            ].join('\n')
                        })
                        .run();
                });
                it("to state_last_period_month - after selecting 'More' and 'Back'", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '2'  // state_training_intro - register with code
                            , '12345'   // state_personnel_auth - personnel code
                            , '6' // state_msg_receiver - friend_only
                            , '09092222222'  // state_msisdn
                            //, '1'  // state_msg_pregnancy_status - pregnant  // bypass postbirth flow
                            , '6'   // state_last_period_month - More
                            , '5'   // state_last_period_month - Back
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
                            , '2'  // state_training_intro - register with code
                            , '12345'   // state_personnel_auth - personnel code
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
                          , '2'  // state_training_intro - register with code
                          , '12345'   // state_personnel_auth - personnel code
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
                          , '2'  // state_training_intro - register with code
                          , '12345'   // state_personnel_auth - personnel code
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
                          , '2'  // state_training_intro - register with code
                          , '12345'   // state_personnel_auth - personnel code
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
                            , '12345'   // state_personnel_auth - personnel code
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
                            , '12345'   // state_personnel_auth - personnel code
                            , '6' // state_msg_receiver - friend_only
                            , '09092222222'  // state_msisdn
                            , '2'  // state_msg_pregnancy_status - baby
                            , '10' // state_baby_birth_month_year - More
                        )
                        .check.interaction({
                            state: 'state_baby_birth_month_year',
                            reply: [
                                "Select the month & year the baby was born:",
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
                            , '12345'   // state_personnel_auth - personnel code
                            , '6' // state_msg_receiver - friend_only
                            , '09092222222'  // state_msisdn
                            , '2'  // state_msg_pregnancy_status - baby
                            , '3'  // state_baby_birth_month_year - May 15
                        )
                        .check.interaction({
                            state: 'state_baby_birth_day',
                            reply: "On what date of the month was the baby born?"
                        })
                        .run();
                });
                // bypass postbirth flow
                it.skip("to state_gravida", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                          {session_event: 'new'}  // dial in
                          , '12345'   // state_personnel_auth - personnel code
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
                            , '2'  // state_training_intro - register with code
                            , '12345'   // state_personnel_auth - personnel code
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
                            , '2'  // state_training_intro - register with code
                            , '12345'   // state_personnel_auth - personnel code
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
                            , '2'  // state_training_intro - register with code
                            , '12345'   // state_personnel_auth - personnel code
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
                            , '2'  // state_training_intro - register with code
                            , '12345'   // state_personnel_auth - personnel code
                            , '6' // state_msg_receiver - friend_only
                            , '09092222222'  // state_msisdn
                            //, '1'  // state_msg_pregnant - mother
                            , '3'  // state_last_period_month - May 15
                            , '12' // state_last_period_day - 12
                            , '3'  // state_gravida
                            , '1'  // state_msg_language - yoruba
                            , '1'   // state_msg_type - voice calls
                            , '2'   // state_voice_days - tuesdays and thursdays
                            , '2'   // state_voice_times - between 2-5pm
                        )
                        .check.interaction({
                            state: 'state_end_voice',
                            reply: "Thank you. They will now start receiving calls on Tuesday and Thursday between 2pm - 5pm."
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
                            , '2'  // state_training_intro - register with code
                            , '12345'   // state_personnel_auth - personnel code
                            , '6' // state_msg_receiver - friend_only
                            , '09092222222'  // state_msisdn
                            //, '1'  // state_msg_pregnant - mother
                            , '3'  // state_last_period_month - May 15
                            , '12' // state_last_period_day - 12
                            , '3' // state_gravida
                            , '2'  // state_msg_language - hausa
                            , '2'   // state_msg_type - text smss
                        )
                        .check.interaction({
                            state: 'state_end_sms',
                            reply: "Thank you. They will now start receiving messages three times a week on Monday, Wednesday and Friday."
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
                            , '2'  // state_training_intro - register with code
                            , '12345'   // state_personnel_auth - personnel code
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
                        .run();
                });
                it("complete flow 2 - receiver: mother & father; mother pregnant, voice", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '2'  // state_training_intro - register with code
                            , '12345'   // state_personnel_auth - personnel code
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
                        .run();
                });

                // bypass postbirth flow
                it.skip("complete flow 3 - receiver: father only; mother baby, sms", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '12345'   // state_personnel_auth - personnel code
                            , '3' // state_msg_receiver - father only
                            , '09093333333'  // state_msisdn
                            , '2'  // state_msg_pregnant - baby
                            , '4'  // state_baby_birth_month_year - May 15
                            , '12' // state_baby_birth_day - 12
                            , '2'  // state_gravida
                            , '3'  // state_msg_language - igbo
                            , '2'   // state_msg_type - sms
                        )
                        .check.interaction({
                            state: 'state_end_sms',
                        })
                        .run();
                });
                it("complete flow 4 - receiver: mother & father; mother pregnant, voice", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '2'  // state_training_intro - register with code
                            , '12345'   // state_personnel_auth - personnel code
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
                        .run();
                });
                it("complete flow 5 - receiver: mother_only; mother pregnant, voice", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .inputs(
                            {session_event: 'new'}  // dial in
                            , '2'  // state_training_intro - register with code
                            , '12345'   // state_personnel_auth - personnel code
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
                        .run();
                });
            });

            // TEST VALIDATION

            describe("Validation testing", function() {
                it("validate state_personnel_auth", function() {
                    return tester
                        .setup.user.addr('08080020002')
                        .setup.user.state('state_personnel_auth')
                        .input(
                            'aaaaa'  // state_personnel_auth - invalid personnel code
                        )
                        .check.interaction({
                            state: 'state_personnel_auth',
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
                                "Sorry, invalid option. Who will receive messages?",
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
                        })

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
                it("validate state_msg_language", function() {
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
        });

    });
});
