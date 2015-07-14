// This app handles state changes

go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var ChoiceState = vumigo.states.ChoiceState;
    var Choice = vumigo.states.Choice;
    var EndState = vumigo.states.EndState;


    var GoApp = App.extend(function(self) {
        App.call(self, 'state_start');
        var $ = self.$;


    // ROUTING

        self.states.add('state_start', function() {
            return go.utils
                .is_registered(self.im)
                .then(function(is_registered) {
                    if (is_registered === true) {
                        return self.states.create("state_c01_main_menu");
                    } else {
                        return self.states.create("state_c02_not_registered");
                    }
                });
        });

    // CHANGE STATE

        self.states.add('state_c01_main_menu', function(name) {
            var routing = {
                'baby': 'state_c03_baby_confirm',
                'msg_time': 'state_c04_voice_days',
                'optout': 'state_c05_optout_reason'
            };
            return new ChoiceState(name, {
                question: $('Baby / Message time / Optout?'),
                choices: [
                    new Choice('baby', $('baby')),
                    new Choice('msg_time', $('msg_time')),
                    new Choice('optout', $('optout'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_c02_not_registered', function(name) {
            return new EndState(name, {
                text: $('Unrecognised number'),
                next: 'state_start'
            });
        });

        self.states.add('state_c03_baby_confirm', function(name) {
            var routing = {
                'confirm': 'state_c08_end_baby'
            };
            return new ChoiceState(name, {
                question: $('Confirm baby?'),
                choices: [
                    new Choice('confirm', $('confirm'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_c04_voice_days', function(name) {
            return new ChoiceState(name, {
                question: $('Message days?'),
                choices: [
                    new Choice('mon_wed', $('mon_wed')),
                    new Choice('tue_thu', $('tue_thu'))
                ],
                next: 'state_c06_voice_times'
            });
        });

    });

    return {
        GoApp: GoApp
    };
}();
