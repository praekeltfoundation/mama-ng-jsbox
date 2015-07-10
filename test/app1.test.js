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


        // TEST APP1 IS RUNNING

        describe("When you start the app", function() {
            it("should ask for your name", function() {
                return tester
                    .setup.user.addr('082001')
                    .inputs(
                        {session_event: 'new'}
                    )
                    .check.interaction({
                        state: 'state_username',
                        reply: 'What is your name?'
                    })
                    .run();
            });
        });

        describe("When you enter your name", function() {
            it("should tell you you've reached the end", function() {
                return tester
                    .setup.user.addr('082001')
                    .inputs(
                        {session_event: 'new'},
                        'Johnny'
                    )
                    .check.interaction({
                        state: 'state_end',
                        reply: 'This is the end.'
                    })
                    .run();
            });
        });

    });
});
