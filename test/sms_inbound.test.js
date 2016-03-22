var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures_public');
var assert = require('assert');
var AppTester = vumigo.AppTester;
var optoutstore = require('./optoutstore');
var DummyOptoutResource = optoutstore.DummyOptoutResource;


describe("Mama Nigeria App", function() {
    describe("SMS inbound reply test", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();
            tester = new AppTester(app);

            tester
                .setup.char_limit(160)
                .setup.config.app({
                    name: 'smsapp',
                    services: {
                        identities: {
                            api_token: 'test_token_identities',
                            url: "http://localhost:8001/api/v1/"
                        }
                    }
                })
                .setup(function(api) {
                    api.resources.add(new DummyOptoutResource());
                    api.resources.attach(api);
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                })
                ;
        });

        describe("when the user sends a STOP message", function() {
            it.skip("should opt them out", function() {
                return tester
                    .setup.user.addr('+2345059999999')
                    .inputs('stop and wait for green')
                    .check.interaction({
                        state: 'state_end_opt_out',
                        reply:
                            'You will no longer receive messages from Hello Mama. Should you ever want to re-subscribe, contact your local community health extension worker'
                    })
                    .check(function(api) {
                        var expected_used = [31];
                        var fixts = api.http.fixtures.fixtures;
                        var fixts_used = [];
                        fixts.forEach(function(f, i) {
                            f.uses > 0 ? fixts_used.push(i) : null;
                        });
                        assert.deepEqual(fixts_used, expected_used);
                    })
                    .run();
            });
        });

        describe("when the user sends any other message", function() {
            it("should display helpdesk message", function() {
                return tester
                    .setup.user.addr('+2345059999999')
                    .inputs('go when the light is green')
                    .check.interaction({
                        state: 'state_end_helpdesk',
                        reply:
                            'Currently no helpdesk functionality is active. Reply STOP to unsubscribe.'
                    })
                    .check(function(api) {
                        var expected_used = [];
                        var fixts = api.http.fixtures.fixtures;
                        var fixts_used = [];
                        fixts.forEach(function(f, i) {
                            f.uses > 0 ? fixts_used.push(i) : null;
                        });
                        assert.deepEqual(fixts_used, expected_used);
                    })
                    .run();
            });
        });

    });
});
