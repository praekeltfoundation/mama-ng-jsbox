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
                self.im.msg.helper_metadata.caller_id_number,
                self.im.config.country_code);
            return go.utils
                .get_identity_by_address({'msisdn': msisdn}, self.im)
                .then(function(identity){
                    if (identity) {
                        return go.utils
                            .resend_all_subscriptions(self.im, identity)
                            .then(function(results){
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
            // freeswitch crashes if the text is empty
            return new EndState(name, {text: 'Thank you.'});
        });

    });

    return {
        GoApp: GoApp
    };
}();
