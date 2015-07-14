// This app handles registration and state changes

go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var ChoiceState = vumigo.states.ChoiceState;
    var Choice = vumigo.states.Choice;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;


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
                        return self.states.create("state_r01");
                    }
                });
        });

    // REGISTRATION

        self.states.add('state_r01', function(name) {
            return new FreeText(name, {
                question: $('Welcome, Number'),

                next: function(content) {
                    if (go.utils.check_valid_phone_number(content) === false) {
                        return 'state_r02';
                    } else {
                        return 'state_r03';
                    }
                }
            });
        });

        self.states.add('state_r02', function(name) {
            return new FreeText(name, {
                question: $('Retry number'),
                next: function(content) {
                    if (go.utils.check_valid_phone_number(content) === false) {
                        return 'state_r02';
                    } else {
                        return 'state_r03';
                    }
                }
            });
        });

        self.states.add('state_r03', function(name) {
            return new ChoiceState(name, {
                question: $('Choose receiver'),
                choices: [
                    new Choice('mother', $('Mother')),
                    new Choice('other', $('Other'))
                ],
                next: 'state_r04'
            });
        });

        self.states.add('state_r04', function(name) {
            var routing = {
                'pregnant': 'state_r05',
                'baby': 'state_r06'
            };
            return new ChoiceState(name, {
                question: $('Pregnant or baby'),
                choices: [
                    new Choice('pregnant', $('Pregnant')),
                    new Choice('baby', $('Baby'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r05', function(name) {
            // TODO #6 Don't show next year in Jan / Feb
            var routing = {
                'this_year': 'state_r07',
                'next_year': 'state_r08'
            };
            return new ChoiceState(name, {
                question: $('DOB?'),
                choices: [
                    new Choice('this_year', $('This year')),
                    new Choice('next_year', $('Next year'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r06', function(name) {
            var routing = {
                'last_year': 'state_r09',
                'this_year': 'state_r10'
            };
            return new ChoiceState(name, {
                question: $('DOB?'),
                choices: [
                    new Choice('last_year', $('Last year')),
                    new Choice('this_year', $('This year'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r07', function(name) {
            // TODO #6 Dynamically generate months
            var routing = {
                'july': 'state_r11',
                'august': 'state_r11',
                'september': 'state_r11',
                'october': 'state_r11',
                'november': 'state_r11',
                'december': 'state_r11'
            };
            return new ChoiceState(name, {
                question: $('Which month?'),
                choices: [
                    new Choice('july', $('july')),
                    new Choice('august', $('august')),
                    new Choice('september', $('september')),
                    new Choice('october', $('october')),
                    new Choice('november', $('november')),
                    new Choice('december', $('december'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r08', function(name) {
            // TODO #6 Dynamically generate months
            var routing = {
                'january': 'state_r11',
                'february': 'state_r11',
                'march': 'state_r11',
                'april': 'state_r11',
                'may': 'state_r11'
            };
            return new ChoiceState(name, {
                question: $('Which month?'),
                choices: [
                    new Choice('january', $('january')),
                    new Choice('february', $('february')),
                    new Choice('march', $('march')),
                    new Choice('april', $('april')),
                    new Choice('may', $('may'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r09', function(name) {
            // TODO #6 Dynamically generate months
            var routing = {
                'july': 'state_r12',
                'august': 'state_r12',
                'september': 'state_r12',
                'october': 'state_r12',
                'november': 'state_r12',
                'december': 'state_r12'
            };
            return new ChoiceState(name, {
                question: $('Which month?'),
                choices: [
                    new Choice('july', $('july')),
                    new Choice('august', $('august')),
                    new Choice('september', $('september')),
                    new Choice('october', $('october')),
                    new Choice('november', $('november')),
                    new Choice('december', $('december'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r10', function(name) {
            // TODO #6 Dynamically generate months
            var routing = {
                'january': 'state_r12',
                'february': 'state_r12',
                'march': 'state_r12',
                'april': 'state_r12',
                'may': 'state_r12',
                'june': 'state_r12',
                'july': 'state_r12'
            };
            return new ChoiceState(name, {
                question: $('Which month?'),
                choices: [
                    new Choice('january', $('january')),
                    new Choice('february', $('february')),
                    new Choice('march', $('march')),
                    new Choice('april', $('april')),
                    new Choice('may', $('may')),
                    new Choice('june', $('june')),
                    new Choice('july', $('july'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r11', function(name) {
            // TODO #7
            var month = self.im.user.answers.state_r07
                     || self.im.user.answers.state_r08;
            return new FreeText(name, {
                question: $('Which day of {{ month }}?'
                    ).context({ month: month }),
                next: 'state_r13'
            });
        });

        self.states.add('state_r12', function(name) {
            // TODO #7
            var month = self.im.user.answers.state_r09
                     || self.im.user.answers.state_r10;
            return new FreeText(name, {
                question: $('Which day of {{ month }}?'
                    ).context({ month: month }),
                next: 'state_r13'
            });
        });

        self.states.add('state_r13', function(name) {
            return new ChoiceState(name, {
                question: $('Language?'),
                choices: [
                    new Choice('english', $('english')),
                    new Choice('hausa', $('hausa')),
                    new Choice('igbo', $('igbo')),
                ],
                next: 'state_r14'
            });
        });

        self.states.add('state_r14', function(name) {
            var routing = {
                'sms': 'state_r15',
                'voice': 'state_r18'
            };
            return new ChoiceState(name, {
                question: $('Channel?'),
                choices: [
                    new Choice('sms', $('sms')),
                    new Choice('voice', $('voice'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r15', function(name) {
            return new ChoiceState(name, {
                question: $('Message days?'),
                choices: [
                    new Choice('mon_wed', $('mon_wed')),
                    new Choice('tue_thu', $('tue_thu'))
                ],
                next: 'state_r16'
            });
        });

        self.states.add('state_r16', function(name) {
            return new ChoiceState(name, {
                question: $('Message time?'),
                choices: [
                    new Choice('9_11', $('9_11')),
                    new Choice('2_5', $('2_5'))
                ],
                next: 'state_r17'
            });
        });

        self.states.add('state_r17', function(name) {
            var time = self.im.user.answers.state_r16;
            var days = self.im.user.answers.state_r15;
            return new EndState(name, {
                text: $('Thank you! Time: {{ time }}. Days: {{ days }}.'
                    ).context({ time: time, days: days }),
                next: 'state_start'
            });
        });

        self.states.add('state_r18', function(name) {
            return new EndState(name, {
                text: $('Thank you!'),
                next: 'state_start'
            });
        });

    });

    return {
        GoApp: GoApp
    };
}();
