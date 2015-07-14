var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var assert = require('assert');
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
            describe("if you are a registered user", function() {
                it("should navigate to state c01", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'}
                        )
                        .check.interaction({
                            state: 'state_c01',
                            reply: 'Hello!'
                        })
                        .run();
                });
            });
        });


        // TEST CHANGE FLOW


    });
});
