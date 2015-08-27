// This app handles state changes

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
        var lang = 'eng_NG';
        var interrupt = true;

        self.add = function(name, creator) {
            self.states.add(name, function(name, opts) {
                if (!interrupt || !go.utils.should_restart(self.im))
                    return creator(name, opts);

                interrupt = false;
                opts = opts || {};
                opts.name = name;
                // Prevent previous content being passed to next state
                self.im.msg.content = null;
                return self.states.create('state_start', opts);
            });
        };


    // ROUTING

        self.states.add('state_start', function() {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return self.states.create("state_c12_number");
        });


    // CHANGE STATE

        self.add('state_c12_number', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Welcome, Number'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.check_valid_phone_number(content) === false) {
                        return 'state_c13_retry_number';
                    } else {
                        return go.utils
                            // get or create mama contact
                            .get_or_create_contact(content, self.im)
                            .then(function(mama_id) {
                                self.im.user.set_answer('mama_id', mama_id);
                                return go.utils
                                    .is_registered(mama_id, self.im)
                                    .then(function(is_registered) {
                                        if (is_registered === true) {
                                            return go.utils
                                                .has_active_subscriptions(mama_id, self.im)
                                                .then(function(has_active_subscriptions) {
                                                    if (has_active_subscriptions === true) {
                                                        return self.states.create("state_c01_main_menu");
                                                    } else {
                                                        return self.states.create("state_c14_end_not_active");
                                                    }
                                                });
                                        } else {
                                            return self.states.create("state_c02_not_registered");
                                        }
                                    });
                            });
                    }
                }
            });
        });

        self.add('state_c13_retry_number', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Retry number'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.check_valid_phone_number(content) === false) {
                        return 'state_c13_retry_number';
                    } else {
                        return go.utils
                            // get or create mama contact
                            .get_or_create_contact(content, self.im)
                            .then(function(mama_id) {
                                self.im.user.set_answer('mama_id', mama_id);
                                return go.utils
                                    .is_registered(mama_id, self.im)
                                    .then(function(is_registered) {
                                        if (is_registered === true) {
                                            return self.states.create("state_c01_main_menu");
                                        } else {
                                            return self.states.create("state_c02_not_registered");
                                        }
                                    });
                            });
                    }
                }
            });
        });


        self.add('state_c01_main_menu', function(name) {
            var speech_option = '1';
            var routing = {
                'baby': 'state_c03_baby_confirm',
                'msg_time': 'state_c04_voice_days',
                'optout': 'state_c05_optout_reason'
            };
            return new ChoiceState(name, {
                question: $('Baby / Message time / Optout?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
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

        self.add('state_c02_not_registered', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Unrecognised number'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        self.add('state_c03_baby_confirm', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Confirm baby?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('confirm', $('confirm'))
                ],
                next: 'state_c08_enter'
            });
        });

        self.add('state_c04_voice_days', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Message days?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('mon_wed', $('mon_wed')),
                    new Choice('tue_thu', $('tue_thu'))
                ],
                next: 'state_c06_voice_times'
            });
        });

        self.add('state_c05_optout_reason', function(name) {
            var speech_option = '1';
            var routing = {
                'miscarriage': 'state_c07_loss_opt_in',
                'stillborn': 'state_c07_loss_opt_in',
                'baby_died': 'state_c07_loss_opt_in',
                'not_useful': 'state_c11_enter',
                'other': 'state_c11_enter'
            };
            return new ChoiceState(name, {
                question: $('Optout reason?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
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

        self.add('state_c06_voice_times', function(name) {
            var days = self.im.user.answers.state_c04_voice_days;
            var speech_option = go.utils.get_speech_option_days(days);
            return new ChoiceState(name, {
                question: $('Message times?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('9_11', $('9_11')),
                    new Choice('2_5', $('2_5'))
                ],
                next: 'state_c09_enter'
            });
        });

        self.add('state_c07_loss_opt_in', function(name) {
            var speech_option = '1';
            var routing = {
                'opt_in_confirm': 'state_c10_enter',
                'opt_in_deny': 'state_c11_enter'
            };
            return new ChoiceState(name, {
                question: $('Receive loss messages?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('opt_in_confirm', $('opt_in_confirm')),
                    new Choice('opt_in_deny', $('opt_in_deny'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.add('state_c08_enter', function(name) {
            return go.utils
                .switch_to_baby(self.im)
                .then(function() {
                    return self.states.create('state_c08_end_baby');
                });
        });

        self.add('state_c08_end_baby', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you - baby'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        self.add('state_c09_enter', function(name) {
            return go.utils
                .change_msg_times(self.im)
                .then(function() {
                    return self.states.create('state_c09_end_msg_times');
                });
        });

        self.add('state_c09_end_msg_times', function(name) {
            var days = self.im.user.answers.state_c04_voice_days;
            var time = self.im.user.answers.state_c06_voice_times;
            var speech_option = go.utils.get_speech_option_days_time(days, time);
            return new EndState(name, {
                text: $('Thank you! Time: {{ time }}. Days: {{ days }}.'
                    ).context({ time: time, days: days }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        self.add('state_c10_enter', function(name) {
            return go.utils
                .optout_loss_opt_in(self.im)
                .then(function() {
                    return self.states.create('state_c10_end_loss_opt_in');
                });
        });

        self.add('state_c10_end_loss_opt_in', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you - loss opt in'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        self.add('state_c11_enter', function(name) {
            return go.utils
                .optout(self.im)
                .then(function() {
                    return self.states.create('state_c11_end_optout');
                });
        });

        self.add('state_c11_end_optout', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you - optout'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        self.add('state_c14_end_not_active', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('No active subscriptions'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

    });

    return {
        GoApp: GoApp
    };
}();
