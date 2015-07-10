// This app handles registration and state changes

go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;


    var GoApp = App.extend(function(self) {
        App.call(self, 'state_start');
        var $ = self.$;


        self.states.add('state_start', function() {
            return self.states.create("state_username");
        });


        self.states.add('state_username', function(name) {
            return new FreeText(name, {
                question: $('What is your name?'),
                next: function(content) {
                    return go.utils
                        .create_contact(self.im, content)
                        .then(function() {
                            return 'state_end';
                        });
                }
            });
        });


        self.states.add('state_end', function(name) {
            return new EndState(name, {
                text: $('This is the end.'),
                next: 'state_start'
            });
        });

    });

    return {
        GoApp: GoApp
    };
}();
