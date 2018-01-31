go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var EndState = vumigo.states.EndState;

    var GoApp = App.extend(function(self) {
        App.call(self, 'state_start');

        self.add = function(name, creator) {
            self.states.add(name, function(name, opts) {
                return creator(name, opts);
            });
        };

        // START STATE

        self.states.add('state_start', function() {
            var msisdn = go.utils.normalize_msisdn(
                self.im.user.addr, self.im.config.country_code);
            return go.utils
                .get_identity_by_address({'msisdn': msisdn}, self.im)
                .then(function(identity){
                    if (identity) {
                        return go.utils
                            .resend_all_subscriptions(self.im, identity)
                            .then(function(count){
                                return self.states.create("state_end");
                            });
                    }
                    else {
                        return self.im.log('Identity not found for msisdn: ' + msisdn)
                            .then(function(){
                                return self.states.create("state_end");
                            });
                    }
                });
        });

        // EndState
        self.add('state_end', function(name) {
            return new EndState(name, {text: ''});
        });

    });

    return {
        GoApp: GoApp
    };
}();
