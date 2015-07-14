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


        // TEST START ROUTING

        describe("When you start the app", function() {
            describe("if you are a new user", function() {
                it("should navigate to state r01", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                        )
                        .check.interaction({
                            state: 'state_r01',
                            reply: 'Welcome, Number'
                        })
                        .run();
                });
            });
        });


        // TEST REGISTRATION FLOW

        describe("When you enter a phone number r01", function() {
            describe("if the number validates", function() {
                it("should navigate to state r03", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                        )
                        .check.interaction({
                            state: 'state_r03',
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
                it("should navigate to state r02", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '+08080020002'
                        )
                        .check.interaction({
                            state: 'state_r02',
                            reply: 'Retry number'
                        })
                        .run();
                });
            });

            describe("if the retried number does not validate", function() {
                it("should navigate to state r02 again", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '+08080020002',
                            '+08080020002'
                        )
                        .check.interaction({
                            state: 'state_r02',
                            reply: 'Retry number'
                        })
                        .run();
                });
            });

            describe("if the retried number validates", function() {
                it("should navigate to state r03", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '+08080020002',
                            '08080020002'
                        )
                        .check.interaction({
                            state: 'state_r03',
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

        describe("When you enter a choice r03", function() {
            describe("if it is a valid choice", function() {
                it("should navigate to state r04", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03 - mother
                        )
                        .check.interaction({
                            state: 'state_r04',
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
                it("should replay r03", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '7'  // r03 - invalid choice
                        )
                        .check.interaction({
                            state: 'state_r03',
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

        describe("When you enter a choice r04", function() {
            describe("if you choose pregnant", function() {
                it("should navigate to state r05", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03 - mother
                            , '1'  // r04 - pregnant
                        )
                        .check.interaction({
                            state: 'state_r05',
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
                it("should navigate to state r06", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03 - mother
                            , '2'  // r04 - baby
                        )
                        .check.interaction({
                            state: 'state_r06',
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

        describe("When you enter a choice r05", function() {
            describe("if you choose this year", function() {
                it("should navigate to state r07", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03 - mother
                            , '1'  // r04 - pregnant
                            , '1'  // r05 - this year
                        )
                        .check.interaction({
                            state: 'state_r07',
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
                it("should navigate to state r08", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03 - mother
                            , '1'  // r04 - pregnant
                            , '2'  // r05 - next year
                        )
                        .check.interaction({
                            state: 'state_r08',
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

        describe("When you enter a choice r06", function() {
            describe("if you choose last year", function() {
                it("should navigate to state r09", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03 - mother
                            , '2'  // r04 - baby
                            , '1'  // r06 - last year
                        )
                        .check.interaction({
                            state: 'state_r09',
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
                it("should navigate to state r10", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03 - mother
                            , '2'  // r04 - baby
                            , '2'  // r06 - this year
                        )
                        .check.interaction({
                            state: 'state_r10',
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

        describe("When you enter a month choice r07", function() {
            it("should navigate to state r11", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002'
                        , '1'  // r03 - mother
                        , '1'  // r04 - pregnant
                        , '1'  // r05 - this year
                        , '2'  // r07 - august
                    )
                    .check.interaction({
                        state: 'state_r11',
                        reply: 'Which day of august?'
                    })
                    .run();
            });
        });

        describe("When you enter a month choice r08", function() {
            it("should navigate to state r11", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002'
                        , '1'  // r03 - mother
                        , '1'  // r04 - pregnant
                        , '2'  // r05 - next year
                        , '2'  // r08 - february
                    )
                    .check.interaction({
                        state: 'state_r11',
                        reply: 'Which day of february?'
                    })
                    .run();
            });
        });

        describe("When you enter a month choice r09", function() {
            it("should navigate to state r12", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002'
                        , '1'  // r03 - mother
                        , '2'  // r04 - baby
                        , '1'  // r06 - last year
                        , '3'  // r09 - september
                    )
                    .check.interaction({
                        state: 'state_r12',
                        reply: 'Which day of september?'
                    })
                    .run();
            });
        });

        describe("When you enter a month choice r10", function() {
            it("should navigate to state r12", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002'
                        , '1'  // r03 - mother
                        , '2'  // r04 - baby
                        , '2'  // r06 - this year
                        , '1'  // r10 - january
                    )
                    .check.interaction({
                        state: 'state_r12',
                        reply: 'Which day of january?'
                    })
                    .run();
            });
        });

        describe("When you've entered a day choice", function() {
            describe("on state r11", function() {
                it("should navigate to state r13", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03 - mother
                            , '1'  // r04 - baby
                            , '1'  // r05 - this year
                            , '2'  // r07 - august
                            , '11'  // r11 - 11
                        )
                        .check.interaction({
                            state: 'state_r13',
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

            describe("on state r12", function() {
                it("should navigate to state r13", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                            .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03 - mother
                            , '2'  // r04 - baby
                            , '2'  // r06 - this year
                            , '1'  // r10 - january
                            , '12'  // r12 - 12
                        )
                        .check.interaction({
                            state: 'state_r13',
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

        describe("When you choose a language r13", function() {
            it("should navigate to state r14", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002'
                        , '1'  // r03 - mother
                        , '1'  // r04 - pregnant
                        , '1'  // r05 - this year
                        , '2'  // r07 - august
                        , '11'  // r11 - 11
                        , '1'  // r13 - english
                    )
                    .check.interaction({
                        state: 'state_r14',
                        reply: [
                            'Channel?',
                            '1. sms',
                            '2. voice'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("When you choose a channel r14", function() {
            describe("if you choose sms", function() {
                it("should navigate to state r15", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03 - mother
                            , '1'  // r04 - pregnant
                            , '1'  // r05 - this year
                            , '2'  // r07 - august
                            , '11'  // r11 - 11
                            , '1'  // r13 - english
                            , '1'  // r14 - sms
                        )
                        .check.interaction({
                            state: 'state_r15',
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
                it("should navigate to state r18, end session", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03 - mother
                            , '1'  // r04 - pregnant
                            , '1'  // r05 - this year
                            , '2'  // r07 - august
                            , '11'  // r11 - 11
                            , '1'  // r13 - english
                            , '2'  // r14 - voice
                        )
                        .check.interaction({
                            state: 'state_r18',
                            reply: 'Thank you!'
                        })
                        .check.reply.ends_session()
                        .run();
                });
            });
        });

        describe("When you choose a day r15", function() {
            it("should navigate to state r16", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002'
                        , '1'  // r03 - mother
                        , '1'  // r04 - pregnant
                        , '1'  // r05 - this year
                        , '2'  // r07 - august
                        , '11'  // r11 - 11
                        , '1'  // r13 - english
                        , '1'  // r14 - sms
                        , '1'  // r15 - mon_wed
                    )
                    .check.interaction({
                        state: 'state_r16',
                        reply: [
                            'Message time?',
                            '1. 9_11',
                            '2. 2_5'
                        ].join('\n')
                    })
                    .run();
            });
        });

        describe("When you choose a time r16", function() {
            it("should navigate to state r17", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002'
                        , '1'  // r03 - mother
                        , '1'  // r04 - pregnant
                        , '1'  // r05 - this year
                        , '2'  // r07 - august
                        , '11'  // r11 - 11
                        , '1'  // r13 - english
                        , '1'  // r14 - sms
                        , '1'  // r15 - mon_wed
                        , '2'  // r16 - 2_5
                    )
                    .check.interaction({
                        state: 'state_r17',
                        reply: 'Thank you! Time: 2_5. Days: mon_wed.'
                    })
                    .run();
            });
        });

    });
});
