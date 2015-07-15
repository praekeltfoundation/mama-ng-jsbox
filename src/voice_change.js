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
            return new ChoiceState(name, {
                question: $('Confirm baby?'),
                choices: [
                    new Choice('confirm', $('confirm'))
                ],
                next: 'state_c08_end_baby'
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

        self.states.add('state_c05_optout_reason', function(name) {
            var routing = {
                'miscarriage': 'state_c07_loss_opt_in',
                'stillborn': 'state_c07_loss_opt_in',
                'baby_died': 'state_c07_loss_opt_in',
                'not_useful': 'state_c11_end_optout',
                'other': 'state_c11_end_optout'
            };
            return new ChoiceState(name, {
                question: $('Optout reason?'),
                choices: [
                    new Choice('miscarriage', $('miscarriage')),
                    new Choice('stillborn', $('stillborn')),
                    new Choice('baby_died', $('baby_died')),
                    new Choice('not_useful', $('not_useful')),
                    new Choice('other', $('other'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_c06_voice_times', function(name) {
            return new ChoiceState(name, {
                question: $('Message times?'),
                choices: [
                    new Choice('9_11', $('9_11')),
                    new Choice('2_5', $('2_5'))
                ],
                next: 'state_c09_end_msg_times'
            });
        });

        self.states.add('state_c07_loss_opt_in', function(name) {
            var routing = {
                'opt_in_confirm': 'state_c10_end_loss_opt_in',
                'opt_in_deny': 'state_c11_end_optout'
            };
            return new ChoiceState(name, {
                question: $('Receive loss messages?'),
                choices: [
                    new Choice('opt_in_confirm', $('opt_in_confirm')),
                    new Choice('opt_in_deny', $('opt_in_deny'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_c08_end_baby', function(name) {
            return new EndState(name, {
                text: $('Thank you - baby'),
                next: 'state_start'
            });
        });

        self.states.add('state_c09_end_msg_times', function(name) {
            var time = self.im.user.answers.state_c06_voice_times;
            var days = self.im.user.answers.state_c04_voice_days;
            return new EndState(name, {
                text: $('Thank you! Time: {{ time }}. Days: {{ days }}.'
                    ).context({ time: time, days: days }),
                next: 'state_start'
            });
        });

        self.states.add('state_c10_end_loss_opt_in', function(name) {
            return new EndState(name, {
                text: $('Thank you - loss opt in'),
                next: 'state_start'
            });
        });

        self.states.add('state_c11_end_optout', function(name) {
            return new EndState(name, {
                text: $('Thank you - optout'),
                next: 'state_start'
            });
        });

    });

    return {
        GoApp: GoApp
    };
}();
