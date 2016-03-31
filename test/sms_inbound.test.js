var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures_public');
var assert = require('assert');
var AppTester = vumigo.AppTester;


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
                    name: 'sms_inbound',
                    country_code: '234',  // nigeria
                    channel: '*120*8864*0000#',
                    testing_today: '2015-04-03 06:07:08.999',
                    services: {
                        identities: {
                            api_token: 'test_token_identities',
                            url: "http://localhost:8001/api/v1/"
                        },
                        registrations: {
                            api_token: 'test_token_registrations',
                            url: "http://localhost:8002/api/v1/"
                        },
                        voice_content: {
                            api_token: "test_token_voice_content",
                            url: "http://localhost:8004/api/v1/"
                        },
                        subscriptions: {
                            api_token: 'test_token_subscriptions',
                            url: "http://localhost:8005/api/v1/"
                        },
                        outbound: {
                            api_token: 'test_token_outbond',
                            url: "http://localhost:8006/api/v1/"
                        }
                    },
                    no_timeout_redirects: [
                        'state_start',
                        'state_end_voice',
                        'state_end_sms'
                    ]
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
