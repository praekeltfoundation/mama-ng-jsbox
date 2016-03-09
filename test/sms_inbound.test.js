var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures_public');
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
                    },
                    control: {
                        username: 'test_user',
                        api_key: 'test_key',
                        url: "http://127.0.0.1:8000/api/v1/subscription/"
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
            it("should opt them out", function() {
                return tester
                    .setup.user.addr('+2345059999999')
                    .inputs('stop and wait for green')
                    .check.interaction({
                        state: 'state_end_opt_out',
                        reply:
                            'You will no longer receive messages from Hello Mama. Should you ever want to re-subscribe, contact your local community health extension worker'
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
                    .run();
            });
        });

    });
});
