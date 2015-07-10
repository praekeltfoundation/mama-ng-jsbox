var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var AppTester = vumigo.AppTester;


describe("Mama Nigeria App", function() {
    describe("App2", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();
            tester = new AppTester(app);

            tester
                .setup.config.app({
                    name: 'app2'
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                })
                .setup(function(api) {
                    api.metrics.stores = {'app2_test': {}};
                })
                ;
        });


        // TEST APP2 IS RUNNING

        describe("When you start the app", function() {
            it("should tell you you've reached the end", function() {
                return tester
                    .setup.user.addr('082001')
                    .inputs(
                        {session_event: 'new'}
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
