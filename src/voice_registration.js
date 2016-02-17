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
                .get_or_create_contact(self.im.user.addr, self.im)
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
                        .validate_personnel_code(self.im, content)
                        .then(function(valid_personnel_code) {
                            if (valid_personnel_code) {
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
                        .validate_personnel_code(self.im, content)
                        .then(function(valid_personnel_code) {
                            if (valid_personnel_code) {
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
                    new Choice('father_ony', $('Only Father')),
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
            var speech_option = 1;
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
            var speech_option = 1;
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
            return new ChoiceState(name, {
                question: $('Pregnant or baby'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('state_last_period_year', $('Pregnant')),
                    new Choice('state_baby_birth_year', $('Baby'))
                ],
                next: function(choice) {
                    return choice.value;
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
                    new Choice('state_this_year_period_month', $('This year')),
                    new Choice('state_last_year_period_month', $('Last year'))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // ChoiceState st-5A
        self.add('state_this_year_period_month', function(name) {
            var speech_option = 1;
            return new ChoiceState(name, {
                question: $('Period month this year?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                    choices: go.utils.make_month_choices(
                        $, go.utils.get_january(self.im.config), 12, 1, "MM", "MMMM"),
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    if (go.utils.is_valid_month(today, today.year(), choice.value, 10))
                    {
                        return 'state_last_period_day';
                    }
                    else {
                        return 'state_retry_this_year_period_month';
                    }
                }
            });
        });

        // retry state 5A
        self.add('state_retry_this_year_period_month', function(name) {
            var speech_option = 1;
            return new ChoiceState(name, {
                question: $("Retry. Period month this year?"),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                    choices: go.utils.make_month_choices(
                        $, go.utils.get_january(self.im.config), 12, 1, "MM", "MMMM"),
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    if (go.utils.is_valid_month(today, today.year(), choice.value, 10))
                    {
                        return 'state_last_period_day';
                    }
                    else {
                        return 'state_retry_this_year_period_month';
                    }
                }
            });
        });

        // ChoiceState st-5B
        self.add('state_last_year_period_month', function(name) {
            var speech_option = 1;
            return new ChoiceState(name, {
                question: $("Period month last year?"),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                    choices: go.utils.make_month_choices(
                        $, go.utils.get_january(self.im.config), 12, 1, "MM", "MMMM"),
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    if (go.utils.is_valid_month(today, today.year()-1, choice.value, 10))
                    {
                        return 'state_last_period_day';
                    }
                    else {
                        return 'state_retry_last_year_period_month';
                    }
                }
            });
        });

        // retry state 5B
        self.add('state_retry_last_year_period_month', function(name) {
            var speech_option = 1;
            return new ChoiceState(name, {
                question: $("Retry. Period month last year?"),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                    choices: go.utils.make_month_choices(
                        $, go.utils.get_january(self.im.config), 12, 1, "MM", "MMMM"),
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    if (go.utils.is_valid_month(today, today.year()-1, choice.value, 10))
                    {
                        return 'state_last_period_day';
                    }
                    else {
                        return 'state_retry_last_year_period_month';
                    }
                }
            });
        });

        // FreeText st-06
        self.add('state_last_period_day', function(name) {
            var dateRef = go.utils.get_today(self.im.config);
            var month = self.im.user.answers.state_this_year_period_month ||
                        self.im.user.answers.state_last_year_period_month;
            var year;
            if (self.im.user.answers.state_this_year_period_month) {
                year = dateRef.format("YYYY");
            } else {
                year = dateRef.subtract('year', 1).format("YYYY");
            }

            var speech_option = go.utils.get_speech_option_birth_day(
                self.im, month);

            return new FreeText(name, {
                question: $('Last period day {{ month }} [{{ year}}]'
            ).context({ month: month, year: year }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    var period_date = content+"-"+month+"-"+year;
                    if (!(content > 0 && content <= 31)) {
                        return 'state_retry_last_period_day';
                    } else {
                        self.im.user.set_answer('last_period_date', period_date);
                        return 'state_msg_language';
                    }
                }
            });
        });

        // FreeText st-19 (retry state 06)
        self.add('state_retry_last_period_day', function(name) {
            var dateRef = go.utils.get_today(self.im.config);
            var month = self.im.user.answers.state_this_year_period_month ||
                        self.im.user.answers.state_last_year_period_month;
            var year;
            if (self.im.user.answers.state_this_year_period_month) {
                year = dateRef.format("YYYY");
            } else {
                year = dateRef.subtract('year', 1).format("YYYY");
            }

            var speech_option = go.utils.get_speech_option_birth_day(
                self.im, month);

            return new FreeText(name, {
                question: $('Retry period day'
            ).context({ month: month, year: year }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    var period_date = content+"-"+month+"-"+year;
                    self.im.user.set_answer('last_period_date', period_date);

                    return 'state_validate_date';
                }
            });
        });

        // to validate overall date
        self.add('state_validate_date', function(name) {
            var dateToValidate = self.im.user.answers.last_period_date ||
                                 self.im.user.answers.baby_birth_date;

            if (go.utils.is_valid_date(dateToValidate, 'DD-MM-YYYY')) {
                return self.states.create('state_msg_language');
            } else {
                return self.states.create('state_invalid_date');
            }
        });

        self.add('state_invalid_date', function(name) {
            var speech_option = 1;
            return new ChoiceState(name, {
                question:
                    $('The date you entered is not a real date. Please try again.'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('continue', $('Continue'))
                ],
                next: function() {
                    if (self.im.user.answers.state_last_period_day) {  // flow via st-05, 5A/B & st-06
                        return self.states.create('state_last_period_year');
                    }
                    else if (self.im.user.answers.state_baby_birth_day) { // flow via st-12, 12A/B & st-13
                        return self.states.create('state_baby_birth_year');
                    }
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
                    new Choice('state_this_year_baby_birth_month', $('this year')),
                    new Choice('state_last_year_baby_birth_month', $('last year'))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // ChoiceState st-12A
        self.add('state_this_year_baby_birth_month', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Baby month this year?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: go.utils.make_month_choices(
                    $, go.utils.get_january(self.im.config), 12, 1, "MM", "MMMM"),
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    if (go.utils.is_valid_month(today, today.year(), choice.value, 13)) {
                        return 'state_baby_birth_day';
                    } else {
                        return 'state_retry_this_year_baby_birth_month';
                    }
                }
            });
        });

        // retry state 12A
        self.add('state_retry_this_year_baby_birth_month', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Retry. Baby month this year?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                    choices: go.utils.make_month_choices(
                        $, go.utils.get_january(self.im.config), 12, 1, "MM", "MMMM"),
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    if (go.utils.is_valid_month(today, today.year(), choice.value, 13)) {
                        return 'state_baby_birth_day';
                    } else {
                        return 'state_retry_this_year_baby_birth_month';
                    }
                }
            });
        });

        // ChoiceState st-12B
        self.add('state_last_year_baby_birth_month', function(name) {
            var speech_option = 1;
            return new ChoiceState(name, {
                question: $('Baby month last year?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                    choices: go.utils.make_month_choices(
                        $, go.utils.get_january(self.im.config), 12, 1, "MM", "MMMM"),
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    if (go.utils.is_valid_month(today, today.year()-1, choice.value, 13)) {
                        return 'state_baby_birth_day';
                    } else {
                        return 'state_retry_last_year_baby_birth_month';
                    }
                }
            });
        });

        // retry state 12B
        self.add('state_retry_last_year_baby_birth_month', function(name) {
            var speech_option = 1;

            return new ChoiceState(name, {
                question: $('Retry. Baby month last year?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                    choices: go.utils.make_month_choices(
                        $, go.utils.get_january(self.im.config), 12, 1, "MM", "MMMM"),
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    if (go.utils.is_valid_month(today, today.year()-1, choice.value, 13)) {
                        return 'state_baby_birth_day';
                    } else {
                        return 'state_retry_last_year_baby_birth_month';
                    }
                }
            });
        });

        // FreeText st-13
        self.add('state_baby_birth_day', function(name) {
            var dateRef = go.utils.get_today(self.im.config);
            var month = self.im.user.answers.state_this_year_baby_birth_month ||
                        self.im.user.answers.state_last_year_baby_birth_month;
            var year;
            if (self.im.user.answers.state_this_year_baby_birth_month) {
                year = dateRef.format("YYYY");
            } else {
                year = dateRef.subtract('year', 1).format("YYYY");
            }

            var speech_option = go.utils.get_speech_option_birth_day(
                self.im, month);

            return new FreeText(name, {
                question: $('Birth day in {{ month }} [{{ year}}]'
            ).context({ month: month, year: year }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    var birth_date = content+'-'+month+'-'+year;
                    if (!(content > 0 && content <= 31)) {
                        return 'state_retry_baby_birth_day';
                    } else {
                        self.im.user.set_answer('baby_birth_date', birth_date);
                        return 'state_msg_language';
                    }
                }
            });
        });

        // FreeText st-18 (retry state st-13)
        self.add('state_retry_baby_birth_day', function(name) {
            var dateRef = go.utils.get_today(self.im.config);
            var month = self.im.user.answers.state_this_year_baby_birth_month ||
                        self.im.user.answers.state_last_year_baby_birth_month;
            var year;
            if (self.im.user.answers.state_12A_baby_birth_month) {
                year = dateRef.format("YYYY");
            } else {
                year = dateRef.subtract('year', 1).format("YYYY");
            }

            var speech_option = go.utils.get_speech_option_birth_day(
                self.im, month);

            return new FreeText(name, {
                question: $('Retry birth day'
            ).context({ month: month, year: year }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    var birth_date = content+'-'+month+'-'+year;
                    self.im.user.set_answer('baby_birth_date', birth_date);

                    return 'state_validate_date';
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
                next: 'state_voice_save'
            });
        });

        // interstitial
        self.add('state_voice_save', function(name) {
            return go.utils
                .save_contact_info_and_subscribe(self.im)
                .then(function() {
                    return go.utils
                        .vumi_send_text(self.im, self.im.user.answers.mama_num,
                            self.im.config.reg_complete_sms)
                        .then(function() {
                            return self.states.create('state_end_voice');
                        });
                });
        });

        // EndState st-11
        self.add('state_end_voice', function(name) {
            var time = self.im.user.answers.state_voice_times;
            var days = self.im.user.answers.state_voice_days;
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
