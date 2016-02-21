// This app handles registration

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

    // START

        self.states.add('state_start', function(name) {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return go.utils
                .get_or_create_identity({'msisdn': self.im.user.addr}, self.im, null)
                .then(function(user) {
                    self.im.user.set_answer('user_id', user.id);
                    if (user.details.personnel_code) {
                        return self.states.create('state_msg_receiver');
                    } else {
                        return self.states.create('state_personnel_auth');
                    }
                });
        });


    // REGISTRATION

        // FreeText st-01
        self.add('state_personnel_auth', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    return go.utils
                        .find_healthworker_with_personnel_code(self.im, content)
                        .then(function(healthworker) {
                            if (healthworker) {
                                return 'state_msg_receiver';
                            } else {
                                return 'state_retry_personnel_auth';
                            }
                        });
                }
            });
        });

        // FreeText st-17
        self.add('state_retry_personnel_auth', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Sorry, that is not a valid number. Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    return go.utils
                        .find_healthworker_with_personnel_code(self.im, content)
                        .then(function(healthworker) {
                            if (healthworker) {
                                return 'state_msg_receiver';
                            } else {
                                return 'state_retry_personnel_auth';
                            }
                        });
                }
            });
        });

        // ChoiceState st-02
        self.add('state_msg_receiver', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Choose message receiver'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('mother_father', $('Mother & Father')),
                    new Choice('mother_only', $('Only Mother')),
                    new Choice('father_only', $('Only Father')),
                    new Choice('family_member', $('Family member')),
                    new Choice('trusted_friend', $('Trusted friend'))

                ],
                next: function(choice) {
                    if (choice.value == 'mother_father') {
                        return 'state_father_msisdn';
                    } else {
                        return 'state_receiver_msisdn';
                    }
                }
            });
        });

        // FreeText st-03
        self.add('state_receiver_msisdn', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Please enter number'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return 'state_retry_receiver_msisdn';
                    } else {
                        return 'state_pregnancy_status';
                    }
                }
            });
        });

        // FreeText st-16
        self.add('state_retry_receiver_msisdn', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Sorry, invalid input. Please enter number'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return 'state_retry_receiver_msisdn';
                    } else {
                        return 'state_pregnancy_status';
                    }
                }
            });
        });

        // FreeText st-3A
        self.add('state_father_msisdn', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Please enter number (Father)'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return 'state_retry_father_msisdn';
                    } else {
                        return 'state_mother_msisdn';
                    }
                }
            });
        });

        // FreeText (retry state of st-3A)
        self.add('state_retry_father_msisdn', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Sorry, invalid input. Please enter number (Father)'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return 'state_retry_father_msisdn';
                    } else {
                        return 'state_mother_msisdn';
                    }
                }
            });
        });

        // FreeText st-3B
        self.add('state_mother_msisdn', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Please enter number (Mother)'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return 'state_retry_mother_msisdn';
                    } else {
                        return 'state_pregnancy_status';
                    }
                }
            });
        });

        // FreeText (retry state of st-3B)
        self.add('state_retry_mother_msisdn', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Sorry, invalid input. Please enter number (Mother)'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return 'state_retry_mother_msisdn';
                    } else {
                        return 'state_pregnancy_status';
                    }
                }
            });
        });

        // ChoiceState st-04
        self.add('state_pregnancy_status', function(name) {
            var speech_option = '1';
            var routing = {
                'prebirth': 'state_last_period_year',
                'postbirth': 'state_baby_birth_year'
            };
            return new ChoiceState(name, {
                question: $('Pregnant or baby'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('prebirth', $('Pregnant')),
                    new Choice('postbirth', $('Baby'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

    // pregnant
        // ChoiceState st-05
        self.add('state_last_period_year', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Last period?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('this_year', $('This year')),
                    new Choice('last_year', $('Last year'))
                ],
                next: function(choice) {
                    var year_value = go.utils.get_year_value(
                        go.utils.get_today(self.im.config), choice.value);
                    self.im.user.set_answer('working_year', year_value);
                    return 'state_last_period_month';
                }
            });
        });

        // ChoiceState st-5
        self.add('state_last_period_month', function(name) {
            var speech_option = go.utils.get_speech_option_year(
                self.im.user.answers.state_last_period_year);
            return new ChoiceState(name, {
                question: $('Period month this/last year?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: go.utils.make_month_choices(
                    $, go.utils.get_january(self.im.config), 12, 1, "MM", "MMMM"),
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    if (go.utils.is_valid_month(today, self.im.user.answers.working_year,
                                                choice.value, 10)) {
                        self.im.user.set_answer('working_month', choice.value);
                        return 'state_last_period_day';
                    } else {
                        return 'state_retry_last_period_month';
                    }
                }
            });
        });

        // Retry ChoiceState st-5
        self.add('state_retry_last_period_month', function(name) {
            var speech_option = go.utils.get_speech_option_year(
                self.im.user.answers.state_last_period_year);
            return new ChoiceState(name, {
                question: $('Retry. Period month this/last year?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: go.utils.make_month_choices(
                    $, go.utils.get_january(self.im.config), 12, 1, "MM", "MMMM"),
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    if (go.utils.is_valid_month(today, self.im.user.answers.working_year,
                                                choice.value, 10)) {
                        self.im.user.set_answer('working_month', choice.value);
                        return 'state_last_period_day';
                    } else {
                        return 'state_retry_last_period_month';
                    }
                }
            });
        });

        // FreeText st-06
        self.add('state_last_period_day', function(name) {
            var month = self.im.user.answers.working_month;
            var year = self.im.user.answers.working_year;
            var speech_option = go.utils.get_speech_option_pregnancy_status_day(
                self.im, month);

            return new FreeText(name, {
                question: $('Last period day {{ month }} [{{ year }}]'
                            ).context({ month: month, year: year }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (!(content > 0 && content <= 31)) {
                        return 'state_retry_last_period_day';
                    } else {
                        self.im.user.set_answer('working_date',
                            year + '-' + month + '-' + content);
                        // TODO: state_validate_date
                        return 'state_msg_language';
                    }
                }
            });
        });

        // FreeText st-19 (retry state 06)
        self.add('state_retry_last_period_day', function(name) {
            var month = self.im.user.answers.working_month;
            var year = self.im.user.answers.working_year;
            var speech_option = go.utils.get_speech_option_pregnancy_status_day(
                self.im, month);
            return new FreeText(name, {
                question: $('Retry period day'
                            ).context({ month: month, year: year }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    self.im.user.set_answer('working_date',
                        year + '-' + month + '-' + content);
                    // TODO: copy from state_last_period_day
                    return 'state_validate_date';
                }
            });
        });

    // baby
        // ChoiceState st-12
        self.add('state_baby_birth_year', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Baby born?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('this_year', $('this year')),
                    new Choice('last_year', $('last year'))
                ],
                next: function(choice) {
                    var year_value = go.utils.get_year_value(
                        go.utils.get_today(self.im.config), choice.value);
                    self.im.user.set_answer('working_year', year_value);
                    return 'state_baby_birth_month';
                }
            });
        });

        // ChoiceState st-12
        self.add('state_baby_birth_month', function(name) {
            var speech_option = go.utils.get_speech_option_year(
                self.im.user.answers.state_baby_birth_year);
            return new ChoiceState(name, {
                question: $('Birth month this/last year?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: go.utils.make_month_choices(
                    $, go.utils.get_january(self.im.config), 12, 1, "MM", "MMMM"),
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    if (go.utils.is_valid_month(today, self.im.user.answers.working_year,
                                                choice.value, 13)) {
                        self.im.user.set_answer('working_month', choice.value);
                        return 'state_baby_birth_day';
                    } else {
                        return 'state_retry_baby_birth_month';
                    }
                }
            });
        });

        // Retry ChoiceState st-12
        self.add('state_retry_baby_birth_month', function(name) {
            var speech_option = go.utils.get_speech_option_year(
                self.im.user.answers.state_baby_birth_year);
            return new ChoiceState(name, {
                question: $('Retry. Birth month this/last year?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: go.utils.make_month_choices(
                    $, go.utils.get_january(self.im.config), 12, 1, "MM", "MMMM"),
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    if (go.utils.is_valid_month(today, self.im.user.answers.working_year,
                                                choice.value, 13)) {
                        self.im.user.set_answer('working_month', choice.value);
                        return 'state_baby_birth_day';
                    } else {
                        return 'state_retry_baby_birth_month';
                    }
                }
            });
        });

        // FreeText st-13
        self.add('state_baby_birth_day', function(name) {
            var month = self.im.user.answers.working_month;
            var year = self.im.user.answers.working_year;
            var speech_option = go.utils.get_speech_option_pregnancy_status_day(
                self.im, month);

            return new FreeText(name, {
                question: $('Birth day in {{ month }} [{{ year}}]'
            ).context({ month: month, year: year }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (!(content > 0 && content <= 31)) {
                        return 'state_retry_baby_birth_day';
                    } else {
                        self.im.user.set_answer('working_date',
                            year + '-' + month + '-' + content);
                        // TODO: state_validate_date
                        return 'state_msg_language';
                    }
                }
            });
        });

        // FreeText st-18 (retry state st-13)
        self.add('state_retry_baby_birth_day', function(name) {
            var month = self.im.user.answers.working_month;
            var year = self.im.user.answers.working_year;
            var speech_option = go.utils.get_speech_option_pregnancy_status_day(
                self.im, month);

            return new FreeText(name, {
                question: $('Retry birth day'
            ).context({ month: month, year: year }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    // TODO: copy
                    self.im.user.set_answer('working_date',
                        year + '-' + month + '-' + content);

                    return 'state_validate_date';
                }
            });
        });

    // continue
        // Validate overall date
        self.add('state_validate_date', function(name) {
            var dateToValidate = self.im.user.answers.working_date;
            if (go.utils.is_valid_date(dateToValidate, 'YYYY-MM-DD')) {
                return self.states.create('state_msg_language');
            } else {
                return self.states.create('state_invalid_date');
            }
        });

        self.add('state_invalid_date', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question:
                    $('The date you entered is not a real date. Please try again.'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('continue', $('Continue'))
                ],
                next: function() {
                    if (self.im.user.answers.state_pregnancy_status === 'prebirth') {
                        return 'state_last_period_year';
                    } else {
                        return 'state_baby_birth_year';
                    }
                }
            });
        });

        // ChoiceState st-07
        self.add('state_msg_language', function(name) {
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
                next: 'state_msg_type'
            });
        });

        // ChoiceState st-08
        self.add('state_msg_type', function(name) {
            var speech_option = '1';
            var routing = {
                'sms': 'state_end_sms',
                'voice': 'state_voice_days'
            };
            return new ChoiceState(name, {
                question: $('Channel?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('voice', $('voice')),
                    new Choice('sms', $('sms'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        // EndState st-14
        self.add('state_end_sms', function(name) {
            var speech_option = '1';
            var text = $('Thank you! three times a week.');
            return new EndState(name, {
                text: text,
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        // ChoiceState st-09
        self.add('state_voice_days', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Message days?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('mon_wed', $('mon_wed')),
                    new Choice('tue_thu', $('tue_thu'))
                ],
                next: 'state_voice_times'
            });
        });

        // ChoiceState st-10
        self.add('state_voice_times', function(name) {
            var days = self.im.user.answers.state_voice_days;
            var speech_option = go.utils.get_speech_option_days(days);
            return new ChoiceState(name, {
                question: $('Message time?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('9_11', $('9_11')),
                    new Choice('2_5', $('2_5'))
                ],
                next: 'state_end_voice'
            });
        });

        // interstitial
        // self.add('state_voice_save', function(name) {
        //     return go.utils
        //         .save_contact_info_and_subscribe(self.im)
        //         .then(function() {
        //             return go.utils
        //                 .vumi_send_text(self.im, self.im.user.answers.mama_num,
        //                     self.im.config.reg_complete_sms)
        //                 .then(function() {
        //                     return self.states.create('state_end_voice');
        //                 });
        //         });
        // });

        // EndState st-11
        self.add('state_end_voice', function(name) {
            var time = self.im.user.answers.state_voice_times;
            var days = self.im.user.answers.state_voice_days;
            var speech_option = go.utils.get_speech_option_days_time(days, time);
            var text = $('Thank you! Time: {{ time }}. Days: {{ days }}.'
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
