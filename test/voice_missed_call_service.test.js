var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures_missed_call');
var AppTester = vumigo.AppTester;

IDENTITY_WITH_ACTIVE_SUBSCRIPTION_MSISDN = '+2345059991111';
IDENTITY_WITH_NO_SUBSCRIPTION_MSISDN = '+2345059992222';
NO_IDENTITY_NO_SUBSCRIPTION_MSISDN = '+2345059993333';


describe("Mama Nigeria App", function() {
    describe("Missed Call Service", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();
            tester = new AppTester(app);

            tester
                .setup.config.app({
                    name: 'voice-missed-call-service-test',
                    country_code: '234',  // nigeria
                    services: {
                        identities: {
                            api_token: 'test_token_identities',
                            url: "http://localhost:8001/api/v1/"
                        },
                        subscriptions: {
                            api_token: 'test_token_subscriptions',
                            url: "http://localhost:8005/api/v1/"
                        },
                    }
                })
                .setup(function(api) {
                    fixtures().forEach(function(d) {
                        api.http.fixtures.add(d);
                    });
                });
        });


        // TEST RESTART

        describe("Start of session", function() {
            it("Identity and active subscription", function() {
                return tester
                    .setup.user.addr(IDENTITY_WITH_ACTIVE_SUBSCRIPTION_MSISDN)
                    .inputs(
                        {session_event: 'new'}
                    )
                    .check.interaction({
                        state: 'state_end'
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [0, 1, 2]);
                    })
                    .run();
            });

            it("Identity and no subscription", function() {
                return tester
                    .setup.user.addr(IDENTITY_WITH_NO_SUBSCRIPTION_MSISDN)
                    .inputs(
                        {session_event: 'new'}
                    )
                    .check.interaction({
                        state: 'state_end'
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [3, 4]);
                    })
                    .run();
            });

            it("No identity or subscription", function() {
                return tester
                    .setup.user.addr(NO_IDENTITY_NO_SUBSCRIPTION_MSISDN)
                    .inputs(
                        {session_event: 'new'}
                    )
                    .check.interaction({
                        state: 'state_end'
                    })
                    .check(function(api) {
                        go.utils.check_fixtures_used(api, [5]);
                    })
                    .run();
            });
        });
    });
});
