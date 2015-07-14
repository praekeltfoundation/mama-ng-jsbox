// This app handles state changes

go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    // var ChoiceState = vumigo.states.ChoiceState;
    // var Choice = vumigo.states.Choice;
    var EndState = vumigo.states.EndState;
    // var FreeText = vumigo.states.FreeText;


    var GoApp = App.extend(function(self) {
        App.call(self, 'state_start');
        var $ = self.$;


    // ROUTING

        self.states.add('state_start', function() {
            return go.utils
                .is_registered(self.im)
                .then(function(is_registered) {
                    if (is_registered === true) {
                        return self.states.create("state_c01");
                    } else {
                        return self.states.create("state_c02");
                    }
                });
        });

    // CHANGE

        self.states.add('state_c01', function(name) {
            return new EndState(name, {
                text: $('Hello!'),
                next: 'state_start'
            });
        });

        self.states.add('state_c02', function(name) {
            return new EndState(name, {
                text: $('Bye!'),
                next: 'state_start'
            });
        });

    });

    return {
        GoApp: GoApp
    };
}();
