var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
// var assert = require('assert');
var AppTester = vumigo.AppTester;


describe("Mama Nigeria App", function() {
    describe("Voice Change", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();
            tester = new AppTester(app);

            tester
                .setup.config.app({
                    name: 'voice_change',
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
            describe("if you are an unregistered user", function() {
                it("should navigate to state c02_not_registered", function() {
                    return tester
                        .setup.user.addr('unknown user')
                        .inputs(
                            {session_event: 'new'}
                        )
                        .check.interaction({
                            state: 'state_c02_not_registered',
                            reply: 'Unrecognised number'
                        })
                        .run();
                });
            });

            describe("if you are a registered user", function() {
                it("should navigate to state c01_main_menu", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                        )
                        .check.interaction({
                            state: 'state_c01_main_menu',
                            reply: [
                                'Baby / Message time / Optout?',
                                '1. baby',
                                '2. msg_time',
                                '3. optout'
                            ].join('\n')
                        })
                        .run();
                });
            });
        });


        // TEST CHANGE FLOW

        describe("When you enter a choice c01_main_menu", function() {
            describe("if you choose baby", function() {
                it("should navigate to state c03_baby_confirm", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '1'  // c01_main_menu - baby
                        )
                        .check.interaction({
                            state: 'state_c03_baby_confirm',
                            reply: [
                                'Confirm baby?',
                                '1. confirm'
                            ].join('\n')
                        })
                        .run();
                });
            });

            describe("if you choose msg_time", function() {
                it("should navigate to state c04_voice_days", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                            , '2'  // c01_main_menu - msg_time
                        )
                        .check.interaction({
                            state: 'state_c04_voice_days',
                            reply: [
                                'Message days?',
                                '1. mon_wed',
                                '2. tue_thu'
                            ].join('\n')
                        })
                        .run();
                });
            });

        });

    });
});
