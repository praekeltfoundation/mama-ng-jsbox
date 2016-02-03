// This app handles registration

go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var ChoiceState = vumigo.states.ChoiceState;
    var Choice = vumigo.states.Choice;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;
    var PaginatedChoiceState = vumigo.states.PaginatedChoiceState;


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

    // START

        self.states.add('state_start', function(name) {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return self.states.create("state_personnel_auth");
        });


    // REGISTRATION

        self.add('state_personnel_auth', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (content != '12345') {      // temporarily hard-coded
                        return 'state_r02_retry_number';
                    } else {
                        self.im.user.set_answer('mama_num', content);
                        return go.utils
                            // get or create mama contact
                            .get_or_create_contact(content, self.im)
                            .then(function(mama_id) {
                                self.im.user.set_answer('mama_id', mama_id);
                                return 'state_msg_receiver';
                            });
                    }
                }
            });
        });

        self.add('state_r02_retry_number', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Sorry, that is not a valid number. Retry...'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return 'state_r02_retry_number';
                    } else {
                        self.im.user.set_answer('mama_num', content);
                        return go.utils
                            // get or create mama contact
                            .get_or_create_contact(content, self.im)
                            .then(function(mama_id) {
                                self.im.user.set_answer('mama_id', mama_id);
                                return 'state_msg_receiver';
                            });
                    }
                }
            });
        });

        self.add('state_msg_receiver', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Choose message receiver'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('mother_father', $('Mother & Father')),
                    new Choice('mother_only', $('Only Mother')),
                    new Choice('father_ony', $('Only Father')),
                    new Choice('family_member', $('Family member')),
                    new Choice('trusted_friend', $('Trusted friend'))

                ],
                next: function(choice) {
                    if (choice.value == 'mother_father') {
                        return 'state_father_msisdn';
                    }
                    else {
                        return 'state_receiver_msisdn';
                    }
                }
            });
        });

        self.add('state_receiver_msisdn', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Please enter number'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return 'state_r02_retry_number';  // error message, allow retry
                    } else {
                        return 'state_pregnancy_status';
                    }
                }
            });
        });

        self.add('state_father_msisdn', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Please enter number (Father)'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return 'state_r02_retry_number';  // error message, allow retry
                    } else {
                        return 'state_mother_msisdn';
                    }
                }
            });
        });

        self.add('state_mother_msisdn', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Please enter number (Mother)'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return 'state_r02_retry_number'; // error message, allow retry
                    } else {
                        return 'state_pregnancy_status';
                    }
                }
            });
        });

        self.add('state_pregnancy_status', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Pregnant or baby'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('pregnant', $('Pregnant')),
                    new Choice('baby', $('Baby'))
                ],
                next: 'state_r05_birth_year'
            });
        });

        self.add('state_r05_last_period', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Last period?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('state_r5A_period_month', $('This year')),
                    new Choice('state_r5B_period_month', $('Last year'))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        self.add('state_r5A_period_month', function(name) {
            var startDate = go.utils.get_today(self.im.config);
            var currentMonth = today.format("MM");
            var monthsToDisplay = currentMonth <= 10 ? currentMonth : 10;
            if (currentMonth > 10) {
                startDate.add('month', (12 - currentMonth));
            }
            console.log('today month: '+currentMonth);
            console.log('monthsToDisplay: '+monthsToDisplay);
            console.log('startDate: '+startDate);
            return new PaginatedChoiceState(name, {
                question: $(questions[name]),
                characters_per_page: 182,
                options_per_page: null,
                more: $('More'),
                back: $('Back'),
                choices: go.utils.make_month_choices($, today, monthsToDisplay, 1),
                next: 'state_last_period_day'
            });
        });

        self.add('state_r05_birth_year', function(name) {
            var today = go.utils.get_today(self.im.config);
            var monthsToDisplay = today.format("MM");
            console.log('today: '+today);
            console.log('monthsToDisplay: '+monthsToDisplay);
            return new PaginatedChoiceState(name, {
                question: $(questions[name]),
                characters_per_page: 182,
                options_per_page: null,
                more: $('More'),
                back: $('Back'),
                choices: go.utils.make_month_choices($, today, monthsToDisplay, 1),
                next: 'state_last_period_day'
            });
        });

        self.add('state_r06_birth_month', function(name) {
            var speech_option;
            self.im.user.answers.state_pregnancy_status === 'pregnant'
                ? speech_option = '1'
                : speech_option = '2';
            // create choices eg. new Choice('1', '1') etc.
            var month_choices = [];
            for (i=1; i<=12; i++) {
                month_choices.push(new Choice(i.toString(), i.toString()));
            }
            return new ChoiceState(name, {
                question: $('Birth month? 1-12'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: month_choices,
                next: 'state_r07_confirm_month'
            });
        });

        self.add('state_r07_confirm_month', function(name) {
            var routing = {
                'confirm': 'state_r08_birth_day',
                'retry': 'state_r06_birth_month'
            };
            var speech_option = self.im.user.answers.state_r06_birth_month;
            return new ChoiceState(name, {
                question: $('You entered x for Month. Correct?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('confirm', $('confirm')),
                    new Choice('retry', $('retry'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.add('state_r08_birth_day', function(name) {
            var month = self.im.user.answers.state_r06_birth_month;
            var speech_option = go.utils.get_speech_option_birth_day(
                self.im, month);
            return new FreeText(name, {
                question: $('Birth day in {{ month }}?'
                    ).context({ month: month }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    var birth_date = go.utils.get_baby_dob(self.im, content);
                    if (birth_date === 'invalid date') {
                        return 'state_r14_retry_birth_day';
                    } else {
                        self.im.user.set_answer('birth_date', birth_date);
                        return 'state_r09_language';
                    }
                }
            });
        });

        self.add('state_r14_retry_birth_day', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Retry birth day'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    var birth_date = go.utils.get_baby_dob(self.im, content);
                    if (birth_date === 'invalid date') {
                        return 'state_r14_retry_birth_day';
                    } else {
                        self.im.user.set_answer('birth_date', birth_date);
                        return 'state_r09_language';
                    }
                }
            });
        });

        self.add('state_r09_language', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Language?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('english', $('english')),
                    new Choice('hausa', $('hausa')),
                    new Choice('igbo', $('igbo')),
                ],
                next: 'state_r10_message_type'
            });
        });

        self.add('state_r10_message_type', function(name) {
            var speech_option = '1';
            var routing = {
                'sms': 'state_r13_enter',
                'voice': 'state_r11_voice_days'
            };
            return new ChoiceState(name, {
                question: $('Channel?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('sms', $('sms')),
                    new Choice('voice', $('voice'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.add('state_r11_voice_days', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Message days?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('mon_wed', $('mon_wed')),
                    new Choice('tue_thu', $('tue_thu'))
                ],
                next: 'state_r12_voice_times'
            });
        });

        self.add('state_r12_voice_times', function(name) {
            var days = self.im.user.answers.state_r11_voice_days;
            var speech_option = go.utils.get_speech_option_days(days);
            return new ChoiceState(name, {
                question: $('Message time?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('9_11', $('9_11')),
                    new Choice('2_5', $('2_5'))
                ],
                next: 'state_r13_enter'
            });
        });

        self.add('state_r13_enter', function(name) {
            return go.utils
                .save_contact_info_and_subscribe(self.im)
                .then(function() {
                    return go.utils
                        .vumi_send_text(self.im, self.im.user.answers.mama_num,
                            self.im.config.reg_complete_sms)
                        .then(function() {
                            return self.states.create('state_r13_end');
                        });
                });
        });

        self.add('state_r13_end', function(name) {
            var time = self.im.user.answers.state_r12_voice_times;
            var days = self.im.user.answers.state_r11_voice_days;
            var speech_option = go.utils.get_speech_option_days_time(days, time);
            var text;
            time === undefined
                ? text = $('Thank you!')
                : text = $('Thank you! Time: {{ time }}. Days: {{ days }}.'
                           ).context({ time: time, days: days });
            return new EndState(name, {
                text: text,
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
