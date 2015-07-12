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
                                '2. Baby',
                                '3. Menu'
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
                                '2. Next year',
                                '3. Menu'
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
                                '2. This year',
                                '3. Menu'
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("if you choose menu", function() {
                it("should navigate to state r01", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03 - mother
                            , '3'  // r04 - menu
                        )
                        .check.interaction({
                            state: 'state_r01',
                            reply: 'Welcome, Number'
                        })
                        .run();
                });
            });
        });


        // describe("When you start the app", function() {
        //     it("should ask for your name", function() {
        //         return tester
        //             .setup.user.addr('+07030010001')
        //             .inputs(
        //                 {session_event: 'new'}
        //             )
        //             .check.interaction({
        //                 state: 'state_username',
        //                 reply: 'What is your name?'
        //             })
        //             .run();
        //     });
        // });

        // describe("When you enter your name", function() {
        //     it("should tell you you've reached the end", function() {
        //         return tester
        //             .setup.user.addr('+07030010001')
        //             .inputs(
        //                 {session_event: 'new'},
        //                 'Johnny'
        //             )
        //             .check.interaction({
        //                 state: 'state_end',
        //                 reply: 'This is the end.'
        //             })
        //             .run();
        //     });
        // });

    });
});
