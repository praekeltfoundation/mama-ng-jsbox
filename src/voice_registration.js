// This app handles registration and state changes

go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var ChoiceState = vumigo.states.ChoiceState;
    var Choice = vumigo.states.Choice;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;


    var GoApp = App.extend(function(self) {
        App.call(self, 'state_r01_number');
        var $ = self.$;


    // REGISTRATION

        self.states.add('state_r01_number', function(name) {
            return new FreeText(name, {
                question: $('Welcome, Number'),

                next: function(content) {
                    if (go.utils.check_valid_phone_number(content) === false) {
                        return 'state_r02_retry_number';
                    } else {
                        return 'state_r03_receiver';
                    }
                }
            });
        });

        self.states.add('state_r02_retry_number', function(name) {
            return new FreeText(name, {
                question: $('Retry number'),
                next: function(content) {
                    if (go.utils.check_valid_phone_number(content) === false) {
                        return 'state_r02_retry_number';
                    } else {
                        return 'state_r03_receiver';
                    }
                }
            });
        });

        self.states.add('state_r03_receiver', function(name) {
            return new ChoiceState(name, {
                question: $('Choose receiver'),
                choices: [
                    new Choice('mother', $('Mother')),
                    new Choice('other', $('Other'))
                ],
                next: 'state_r04_mom_state'
            });
        });

        self.states.add('state_r04_mom_state', function(name) {
            var routing = {
                'pregnant': 'state_r05_pregnant_year',
                'baby': 'state_r06_baby_year'
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

        self.states.add('state_r05_pregnant_year', function(name) {
            // TODO #6 Don't show next year in Jan / Feb
            var routing = {
                'this_year': 'state_r07_pregnant_thisyear_month',
                'next_year': 'state_r08_pregnant_nextyear_month'
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

        self.states.add('state_r06_baby_year', function(name) {
            var routing = {
                'last_year': 'state_r09_baby_lastyear_month',
                'this_year': 'state_r10_baby_thisyear_month'
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

        self.states.add('state_r07_pregnant_thisyear_month', function(name) {
            // TODO #6 Dynamically generate months
            var routing = {
                'july': 'state_r11_pregnant_day',
                'august': 'state_r11_pregnant_day',
                'september': 'state_r11_pregnant_day',
                'october': 'state_r11_pregnant_day',
                'november': 'state_r11_pregnant_day',
                'december': 'state_r11_pregnant_day'
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

        self.states.add('state_r08_pregnant_nextyear_month', function(name) {
            // TODO #6 Dynamically generate months
            var routing = {
                'january': 'state_r11_pregnant_day',
                'february': 'state_r11_pregnant_day',
                'march': 'state_r11_pregnant_day',
                'april': 'state_r11_pregnant_day',
                'may': 'state_r11_pregnant_day'
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

        self.states.add('state_r09_baby_lastyear_month', function(name) {
            // TODO #6 Dynamically generate months
            var routing = {
                'july': 'state_r12_baby_day',
                'august': 'state_r12_baby_day',
                'september': 'state_r12_baby_day',
                'october': 'state_r12_baby_day',
                'november': 'state_r12_baby_day',
                'december': 'state_r12_baby_day'
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

        self.states.add('state_r10_baby_thisyear_month', function(name) {
            // TODO #6 Dynamically generate months
            var routing = {
                'january': 'state_r12_baby_day',
                'february': 'state_r12_baby_day',
                'march': 'state_r12_baby_day',
                'april': 'state_r12_baby_day',
                'may': 'state_r12_baby_day',
                'june': 'state_r12_baby_day',
                'july': 'state_r12_baby_day'
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

        self.states.add('state_r11_pregnant_day', function(name) {
            // TODO #7
            var month = self.im.user.answers.state_r07_pregnant_thisyear_month
                     || self.im.user.answers.state_r08_pregnant_nextyear_month;
            return new FreeText(name, {
                question: $('Which day of {{ month }}?'
                    ).context({ month: month }),
                next: 'state_r13_language'
            });
        });

        self.states.add('state_r12_baby_day', function(name) {
            // TODO #7
            var month = self.im.user.answers.state_r09_baby_lastyear_month
                     || self.im.user.answers.state_r10_baby_thisyear_month;
            return new FreeText(name, {
                question: $('Which day of {{ month }}?'
                    ).context({ month: month }),
                next: 'state_r13_language'
            });
        });

        self.states.add('state_r13_language', function(name) {
            return new ChoiceState(name, {
                question: $('Language?'),
                choices: [
                    new Choice('english', $('english')),
                    new Choice('hausa', $('hausa')),
                    new Choice('igbo', $('igbo')),
                ],
                next: 'state_r14_message_type'
            });
        });

        self.states.add('state_r14_message_type', function(name) {
            var routing = {
                'sms': 'state_r15_voice_days',
                'voice': 'state_r18_end_sms'
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

        self.states.add('state_r15_voice_days', function(name) {
            return new ChoiceState(name, {
                question: $('Message days?'),
                choices: [
                    new Choice('mon_wed', $('mon_wed')),
                    new Choice('tue_thu', $('tue_thu'))
                ],
                next: 'state_r16_voice_times'
            });
        });

        self.states.add('state_r16_voice_times', function(name) {
            return new ChoiceState(name, {
                question: $('Message time?'),
                choices: [
                    new Choice('9_11', $('9_11')),
                    new Choice('2_5', $('2_5'))
                ],
                next: 'state_r17_end_voice'
            });
        });

        self.states.add('state_r17_end_voice', function(name) {
            var time = self.im.user.answers.state_r16_voice_times;
            var days = self.im.user.answers.state_r15_voice_days;
            return new EndState(name, {
                text: $('Thank you! Time: {{ time }}. Days: {{ days }}.'
                    ).context({ time: time, days: days }),
                next: 'state_r01_number'
            });
        });

        self.states.add('state_r18_end_sms', function(name) {
            return new EndState(name, {
                text: $('Thank you!'),
                next: 'state_r01_number'
            });
        });

    });

    return {
        GoApp: GoApp
    };
}();
