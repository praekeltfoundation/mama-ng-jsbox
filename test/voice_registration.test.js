var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var assert = require('assert');
var AppTester = vumigo.AppTester;


describe("Shared Utils", function() {
    describe("go.utils.return_true", function() {
        it("should return true", function(done) {
            assert.equal(go.utils.return_true(), true);
            done();
        });
    });
    describe("go.utils.return_false", function() {
        it("should return false", function(done) {
            assert.equal(go.utils.return_false(), false);
            done();
        });
    });
});


describe("Mama Nigeria App", function() {
    describe("App1", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();
            tester = new AppTester(app);

            tester
                .setup.config.app({
                    name: 'app1',
                    control: {
                        url: "http://localhost:8000/api/v1/",
                        api_key: "test_key"
                    }
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                })
                ;
        });


        // TEST REGISTRATION FLOW

        describe("When you start the app", function() {
            it("should navigate to state r01_number", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'}
                    )
                    .check.interaction({
                        state: 'state_r01_number',
                        reply: 'Welcome, Number'
                    })
                    .run();
            });
        });

        describe("When you enter a phone number r01_number", function() {
            describe("if the number validates", function() {
                it("should navigate to state r03_receiver", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                        )
                        .check.interaction({
                            state: 'state_r03_receiver',
                            reply: [
                                'Choose receiver',
                                '1. Mother',
                                '2. Other'
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("if the number does not validate", function() {
                it("should navigate to state r02_retry_number", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '+08080020002'
                        )
                        .check.interaction({
                            state: 'state_r02_retry_number',
                            reply: 'Retry number'
                        })
                        .run();
                });
            });

            describe("if the retried number does not validate", function() {
                it("should navigate to state r02_retry_number again", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '+08080020002',
                            '+08080020002'
                        )
                        .check.interaction({
                            state: 'state_r02_retry_number',
                            reply: 'Retry number'
                        })
                        .run();
                });
            });

            describe("if the retried number validates", function() {
                it("should navigate to state r03_receiver", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '+08080020002',
                            '08080020002'
                        )
                        .check.interaction({
                            state: 'state_r03_receiver',
                            reply: [
                                'Choose receiver',
                                '1. Mother',
                                '2. Other'
                            ].join('\n')
                        })
                        .run();
                });
            });
        });

        describe("When you enter a choice r03_receiver", function() {
            describe("if it is a valid choice", function() {
                it("should navigate to state r04_mom_state", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                        )
                        .check.interaction({
                            state: 'state_r04_mom_state',
                            reply: [
                                'Pregnant or baby',
                                '1. Pregnant',
                                '2. Baby'
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("if it is an invalid choice", function() {
                it("should replay r03_receiver", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '7'  // r03_receiver - invalid choice
                        )
                        .check.interaction({
                            state: 'state_r03_receiver',
                            reply: [
                                'Choose receiver',
                                '1. Mother',
                                '2. Other'
                            ].join('\n')
                        })
                        .run();
                });
            });
        });

        describe("When you enter a choice r04_mom_state", function() {
            describe("if you choose pregnant", function() {
                it("should navigate to state r05_pregnant_year", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                            , '1'  // r04_mom_state - pregnant
                        )
                        .check.interaction({
                            state: 'state_r05_pregnant_year',
                            reply: [
                                'DOB?',
                                '1. This year',
                                '2. Next year'
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("if you choose baby", function() {
                it("should navigate to state r06_baby_year", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                            , '2'  // r04_mom_state - baby
                        )
                        .check.interaction({
                            state: 'state_r06_baby_year',
                            reply: [
                                'DOB?',
                                '1. Last year',
                                '2. This year'
                            ].join('\n')
                        })
                        .run();
                });
            });
        });

        describe("When you enter a choice r05_pregnant_year", function() {
            describe("if you choose this year", function() {
                it("should navigate to state r07_pregnant_thisyear_month", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                            , '1'  // r04_mom_state - pregnant
                            , '1'  // r05_pregnant_year - this year
                        )
                        .check.interaction({
                            state: 'state_r07_pregnant_thisyear_month',
                            reply: [
                                'Which month?',
                                '1. july',
                                '2. august',
                                '3. september',
                                '4. october',
                                '5. november',
                                '6. december'
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("if you choose next year", function() {
                it("should navigate to state r08_pregnant_nextyear_month", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                            , '1'  // r04_mom_state - pregnant
                            , '2'  // r05_pregnant_year - next year
                        )
                        .check.interaction({
                            state: 'state_r08_pregnant_nextyear_month',
                            reply: [
                                'Which month?',
                                '1. january',
                                '2. february',
                                '3. march',
                                '4. april',
                                '5. may'
                            ].join('\n')
                        })
                        .run();
                });
            });
        });

        describe("When you enter a choice r06_baby_year", function() {
            describe("if you choose last year", function() {
                it("should navigate to state r09_baby_lastyear_month", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                            , '2'  // r04_mom_state - baby
                            , '1'  // r06_baby_year - last year
                        )
                        .check.interaction({
                            state: 'state_r09_baby_lastyear_month',
                            reply: [
                                'Which month?',
                                '1. july',
                                '2. august',
                                '3. september',
                                '4. october',
                                '5. november',
                                '6. december'
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("if you choose this year", function() {
                it("should navigate to state r10_baby_thisyear_month", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                            , '2'  // r04_mom_state - baby
                            , '2'  // r06_baby_year - this year
                        )
                        .check.interaction({
                            state: 'state_r10_baby_thisyear_month',
                            reply: [
                                'Which month?',
                                '1. january',
                                '2. february',
                                '3. march',
                                '4. april',
                                '5. may',
                                '6. june',
                                '7. july'
                            ].join('\n')
                        })
                        .run();
                });
            });
        });

        describe("When you enter a month choice r07_pregnant_thisyear_month", function() {
            it("should navigate to state r11_pregnant_day", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002'
                        , '1'  // r03_receiver - mother
                        , '1'  // r04_mom_state - pregnant
                        , '1'  // r05_pregnant_year - this year
                        , '2'  // r07_pregnant_thisyear_month - august
                    )
                    .check.interaction({
                        state: 'state_r11_pregnant_day',
                        reply: 'Which day of august?'
                    })
                    .run();
            });
        });

        describe("When you enter a month choice r08_pregnant_nextyear_month", function() {
            it("should navigate to state r11_pregnant_day", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002'
                        , '1'  // r03_receiver - mother
                        , '1'  // r04_mom_state - pregnant
                        , '2'  // r05_pregnant_year - next year
                        , '2'  // r08_pregnant_nextyear_month - february
                    )
                    .check.interaction({
                        state: 'state_r11_pregnant_day',
                        reply: 'Which day of february?'
                    })
                    .run();
            });
        });

        describe("When you enter a month choice r09_baby_lastyear_month", function() {
            it("should navigate to state r12_baby_day", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002'
                        , '1'  // r03_receiver - mother
                        , '2'  // r04_mom_state - baby
                        , '1'  // r06_baby_year - last year
                        , '3'  // r09_baby_lastyear_month - september
                    )
                    .check.interaction({
                        state: 'state_r12_baby_day',
                        reply: 'Which day of september?'
                    })
                    .run();
            });
        });

        describe("When you enter a month choice r10_baby_thisyear_month", function() {
            it("should navigate to state r12_baby_day", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002'
                        , '1'  // r03_receiver - mother
                        , '2'  // r04_mom_state - baby
                        , '2'  // r06_baby_year - this year
                        , '1'  // r10_baby_thisyear_month - january
                    )
                    .check.interaction({
                        state: 'state_r12_baby_day',
                        reply: 'Which day of january?'
                    })
                    .run();
            });
        });

        describe("When you've entered a day choice", function() {
            describe("on state r11_pregnant_day", function() {
                it("should navigate to state r13_language", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                            , '1'  // r04_mom_state - baby
                            , '1'  // r05_pregnant_year - this year
                            , '2'  // r07_pregnant_thisyear_month - august
                            , '11'  // r11_pregnant_day - 11
                        )
                        .check.interaction({
                            state: 'state_r13_language',
                            reply: [
                                'Language?',
                                '1. english',
                                '2. hausa',
                                '3. igbo'
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("on state r12_baby_day", function() {
                it("should navigate to state r13_language", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                            .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                            , '2'  // r04_mom_state - baby
                            , '2'  // r06_baby_year - this year
                            , '1'  // r10_baby_thisyear_month - january
                            , '12'  // r12_baby_day - 12
                        )
                        .check.interaction({
                            state: 'state_r13_language',
                            reply: [
                                'Language?',
                                '1. english',
                                '2. hausa',
                                '3. igbo'
                            ].join('\n')
                        })
                        .run();
                });
            });
        });

        describe("When you choose a language r13_language", function() {
            it("should navigate to state r14_message_type", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002'
                        , '1'  // r03_receiver - mother
                        , '1'  // r04_mom_state - pregnant
                        , '1'  // r05_pregnant_year - this year
                        , '2'  // r07_pregnant_thisyear_month - august
                        , '11'  // r11_pregnant_day - 11
                        , '1'  // r13_language - english
                    )
                    .check.interaction({
                        state: 'state_r14_message_type',
                        reply: [
                            'Channel?',
                            '1. sms',
                            '2. voice'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("When you choose a channel r14_message_type", function() {
            describe("if you choose sms", function() {
                it("should navigate to state r15_voice_days", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                            , '1'  // r04_mom_state - pregnant
                            , '1'  // r05_pregnant_year - this year
                            , '2'  // r07_pregnant_thisyear_month - august
                            , '11'  // r11_pregnant_day - 11
                            , '1'  // r13_language - english
                            , '1'  // r14_message_type - sms
                        )
                        .check.interaction({
                            state: 'state_r15_voice_days',
                            reply: [
                                'Message days?',
                                '1. mon_wed',
                                '2. tue_thu'
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("if you choose voice", function() {
                it("should navigate to state r18_end_sms, end session", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                            , '1'  // r04_mom_state - pregnant
                            , '1'  // r05_pregnant_year - this year
                            , '2'  // r07_pregnant_thisyear_month - august
                            , '11'  // r11_pregnant_day - 11
                            , '1'  // r13_language - english
                            , '2'  // r14_message_type - voice
                        )
                        .check.interaction({
                            state: 'state_r18_end_sms',
                            reply: 'Thank you!'
                        })
                        .check.reply.ends_session()
                        .run();
                });
            });
        });

        describe("When you choose a day r15_voice_days", function() {
            it("should navigate to state r16_voice_times", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002'
                        , '1'  // r03_receiver - mother
                        , '1'  // r04_mom_state - pregnant
                        , '1'  // r05_pregnant_year - this year
                        , '2'  // r07_pregnant_thisyear_month - august
                        , '11'  // r11_pregnant_day - 11
                        , '1'  // r13_language - english
                        , '1'  // r14_message_type - sms
                        , '1'  // r15_voice_days - mon_wed
                    )
                    .check.interaction({
                        state: 'state_r16_voice_times',
                        reply: [
                            'Message time?',
                            '1. 9_11',
                            '2. 2_5'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("When you choose a time r16_voice_times", function() {
            it("should navigate to state r17_end_voice", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002'
                        , '1'  // r03_receiver - mother
                        , '1'  // r04_mom_state - pregnant
                        , '1'  // r05_pregnant_year - this year
                        , '2'  // r07_pregnant_thisyear_month - august
                        , '11'  // r11_pregnant_day - 11
                        , '1'  // r13_language - english
                        , '1'  // r14_message_type - sms
                        , '1'  // r15_voice_days - mon_wed
                        , '2'  // r16_voice_times - 2_5
                    )
                    .check.interaction({
                        state: 'state_r17_end_voice',
                        reply: 'Thank you! Time: 2_5. Days: mon_wed.'
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });

    });
});
