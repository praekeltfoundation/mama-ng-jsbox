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
        var bypassPostbirth = true;

        self.add = function(name, creator) {
            self.states.add(name, function(name, opts) {
                var pass_opts = opts || {};
                pass_opts.name = name;

                if (go.utils_project.should_repeat(self.im)) {
                    // Prevent previous content being passed to next state
                    // thus preventing infinite repeat loop
                    self.im.msg.content = null;
                    return self.states.create(name, pass_opts);
                }

                if (go.utils_project.should_restart(self.im)) {
                    // Prevent previous content being passed to next state
                    self.im.msg.content = null;
                    // REGISTRATION restart
                    if (self.im.user.answers.state_personnel_auth) {
                        return self.states.create('state_msg_receiver', pass_opts);
                    }
                    // CHANGE restart
                    var state_to_restart_from = self.im.user.answers.receiver_household_only
                        ? 'state_main_menu_household'
                        : 'state_main_menu';
                    return self.states.create(state_to_restart_from, pass_opts);  // restarts to either st-A or st-A1

                }

                return creator(name, pass_opts);
            });
        };

    // START

        self.states.add('state_start', function(name) {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return self.states.create('state_training_intro');
        });

        // A loopback state that is required since you can't pass opts back
        // into the same state
        self.add('state_retry', function(name, opts) {
            return self.states.create(opts.retry_state, {'retry': true});
        });


    // REGISTRATION

        // ChoiceState st-E
        self.add('state_training_intro', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: 'Welcome to the Hello Mama training line.',
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('register', $("To practise registration, press 1")),
                    new Choice('change', $("To practise changing patient details, press 2"))
                ],
                next: function(choice) {
                    switch (choice.value) {
                        case 'register':
                            return 'state_personnel_auth';
                        case 'change':
                            return self.im.user
                                .set_lang(self.im.config.default_language)
                                .then(function() {
                                    return self.states.create('state_set_language');
                                });
                        default: 'state_start';
                    }
                }
            });
        });

        // FreeText st-01
        self.add('state_personnel_auth', function(name, creator_opts) {
            var question_text = 'Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345';
            var speech_option = '1';
            return new FreeText(name, {
                question: question_text,
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (go.utils.check_valid_number(content) && content.length === 5) {
                        return 'state_msg_receiver';
                    } else {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    }
                }
            });
        });

        // ChoiceState st-02
        self.add('state_msg_receiver', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: 'Choose message receiver',
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('mother_father', $("Mother & Father")),
                    new Choice('mother_only', $("Mother")),
                    new Choice('father_only', $("Father")),
                    new Choice('mother_family', $("Mother & family member")),
                    new Choice('mother_friend', $("Mother & friend")),
                    new Choice('friend_only', $("Friend")),
                    new Choice('family_only', $("Family member"))
                ],
                next: function(choice) {
                    var seperate = ["mother_father", "mother_family", "mother_friend"];
                    if (seperate.indexOf(choice.value) !== -1) {
                        return 'state_msisdn_mother';
                    } else {
                        return 'state_msisdn';
                    }
                }
            });
        });

        // FreeText st-03
        self.add('state_msisdn', function(name, creator_opts) {
            var question_text = 'Please enter number';
            var speech_option = '1';
            return new FreeText(name, {
                question: question_text,
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    } else {
                        return 'state_save_identities';
                    }
                }
            });
        });

        // FreeText st-3A
        self.add('state_msisdn_mother', function(name, creator_opts) {
            var question_text = 'Please enter number (Mother)';
            var speech_option = '1';
            return new FreeText(name, {
                question: question_text,
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    } else {
                        return 'state_msisdn_household';
                    }
                }
            });
        });

        // FreeText st-3B
        self.add('state_msisdn_household', function(name, creator_opts) {
            var rolePlayer = self.im.user.answers.state_msg_receiver.replace('mother_', '');  // discarding 'mother_' part of string
            rolePlayer = rolePlayer.replace('family', 'family member');  // append ' member' to family rolePlayer string to make output clearer

            var question_text = "Please enter the {{role_player}}'s number";
            var speech_option = go.utils_project.get_speech_option_household(rolePlayer);

            return new FreeText(name, {
                question: question_text,
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    } else {
                        return 'state_save_identities';
                    }
                }
            });
        });

        // Get or create identities and save their IDs
        self.add('state_save_identities', function(name, creator_opts) {
            if (bypassPostbirth) {
                self.im.user.set_answer('state_pregnancy_status', 'prebirth');
                return self.states.create('state_last_period_year');
            } else {
                return self.states.create('state_pregnancy_status');
            }
        });

        // ChoiceState st-04
        self.add('state_pregnancy_status', function(name, creator_opts) {
            var speech_option = '1';
            var routing = {
                'prebirth': 'state_last_period_year',
                'postbirth': 'state_baby_birth_year'
            };
            return new ChoiceState(name, {
                question: 'Pregnant or baby',
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
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
        self.add('state_last_period_year', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: 'Last period?',
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('this_year', $('This year')),
                    new Choice('last_year', $('Last year'))
                ],
                next: function(choice) {
                    var year_value = go.utils_project.get_year_value(
                        go.utils.get_today(self.im.config), choice.value);
                    self.im.user.set_answer('working_year', year_value);
                    return 'state_last_period_month';
                }
            });
        });

        // ChoiceState st-5
        self.add('state_last_period_month', function(name, creator_opts) {
            var question_text = 'Period month this/last year?';
            var speech_option = go.utils_project.get_speech_option_year(
                self.im.user.answers.state_last_period_year);
            return new ChoiceState(name, {
                question: question_text,
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: go.utils.make_month_choices(
                    $, go.utils.get_january(self.im.config), 12, 1, "MM", "MMMM"),
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    if (go.utils_project.is_valid_month(today, self.im.user.answers.working_year,
                                                choice.value, 10)) {
                        self.im.user.set_answer('working_month', choice.value);
                        return 'state_last_period_day';
                    } else {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    }
                }
            });
        });

        // FreeText st-06
        self.add('state_last_period_day', function(name, creator_opts) {
            var question_text = 'Last period day {{ month }} {{ year }}';

            var month = self.im.user.answers.working_month;
            var year = self.im.user.answers.working_year;
            var speech_option = parseInt(month, 10);

            return new FreeText(name, {
                question: question_text,
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (!(go.utils.is_valid_day_of_month(content))) {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    } else {
                        self.im.user.set_answer('working_date',
                            year + month + go.utils.double_digit_number(content));
                        return 'state_validate_date';
                    }
                }
            });
        });

    // baby
        // ChoiceState st-12
        self.add('state_baby_birth_year', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: 'Baby born?',
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('this_year', $('this year')),
                    new Choice('last_year', $('last year'))
                ],
                next: function(choice) {
                    var year_value = go.utils_project.get_year_value(
                        go.utils.get_today(self.im.config), choice.value);
                    self.im.user.set_answer('working_year', year_value);
                    return 'state_baby_birth_month';
                }
            });
        });

        // ChoiceState st-12
        self.add('state_baby_birth_month', function(name, creator_opts) {
            var question_text = 'Birth month this/last year?';
            var speech_option = go.utils_project.get_speech_option_year(
                self.im.user.answers.state_baby_birth_year);
            return new ChoiceState(name, {
                question: question_text,
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: go.utils.make_month_choices(
                    $, go.utils.get_january(self.im.config), 12, 1, "MM", "MMMM"),
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    if (go.utils_project.is_valid_month(today, self.im.user.answers.working_year,
                                                choice.value, 13)) {
                        self.im.user.set_answer('working_month', choice.value);
                        return 'state_baby_birth_day';
                    } else {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    }
                }
            });
        });

        // FreeText st-13
        self.add('state_baby_birth_day', function(name, creator_opts) {
            var question_text = 'Birth day in {{ month }} {{ year }}';
            var month = self.im.user.answers.working_month;
            var year = self.im.user.answers.working_year;
            var speech_option = parseInt(month, 10);

            return new FreeText(name, {
                question: question_text,
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (!(go.utils.is_valid_day_of_month(content))) {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    } else {
                        self.im.user.set_answer('working_date',
                            year + month + go.utils.double_digit_number(content));
                        return 'state_validate_date';
                    }
                }
            });
        });

    // continue
        // Validate overall date
        self.add('state_validate_date', function(name, creator_opts) {
            var dateToValidate = self.im.user.answers.working_date;
            if (go.utils.is_valid_date(dateToValidate, 'YYYYMMDD')) {
                return self.states.create('state_gravida');
            } else {
                return self.states.create('state_invalid_date');
            }
        });

        self.add('state_invalid_date', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question:
                    'The date you entered is not a real date. Please try again.',
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
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

        // FreeText st-19
        self.add('state_gravida', function(name, creator_opts) {
            var speech_option = '1';
            return new FreeText(name, {
                question: 'Please enter the number of times the woman has been pregnant before. This includes any pregnancies she may not have carried to term.',
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: 'state_msg_language'
            });
        });

        // ChoiceState st-07
        self.add('state_msg_language', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: 'Language?',
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('eng_NG', $('english')),
                    new Choice('ibo_NG', $('igbo')),
                    new Choice('pcm_NG', $('pidgin'))
                ],
                next: 'state_msg_type'
            });
        });

        // ChoiceState st-08
        self.add('state_msg_type', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: 'Channel?',
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('audio', $('voice')),
                    new Choice('text', $('sms'))
                ],
                next: function(choice) {
                    if (choice.value === 'audio') {
                        return 'state_voice_days';
                    } else {
                        return 'state_end_sms';
                    }
                }
            });
        });

        // EndState st-14
        self.add('state_end_sms', function(name, creator_opts) {
            var speech_option = '1';
            var text = $('Thank you! three times a week.');
            return new EndState(name, {
                text: text,
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: 'state_start'
            });
        });

        // ChoiceState st-09
        self.add('state_voice_days', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: 'Message days?',
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('mon_wed', $('mon_wed')),
                    new Choice('tue_thu', $('tue_thu'))
                ],
                next: 'state_voice_times'
            });
        });

        // ChoiceState st-10
        self.add('state_voice_times', function(name, creator_opts) {
            var days = self.im.user.answers.state_voice_days;
            var speech_option = go.utils_project.get_speech_option_days(days);
            return new ChoiceState(name, {
                question: 'Message time?',
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('9_11', $('9_11')),
                    new Choice('2_5', $('2_5'))
                ],
                next: function() {
                    return 'state_end_voice';
                }
            });
        });

        // EndState st-11
        self.add('state_end_voice', function(name, creator_opts) {
            var time = self.im.user.answers.state_voice_times;
            var days = self.im.user.answers.state_voice_days;
            var speech_option = go.utils_project.get_speech_option_days_time(days, time);
            return new EndState(name, {
                text: 'Thank you! Time: {{ time }}. Days: {{ days }}.',
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: 'state_start'
            });
        });

        // INITIAL CHANGE STATES

            self.add('state_set_language', function(name) {
                var speech_option = '1';
                return new ChoiceState(name, {
                    question: $('Language?'),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option),
                    choices: [
                        new Choice('eng_NG', $('English')),
                        new Choice('ibo_NG', $('Igbo')),
                        new Choice('pcm_NG', $('Pidgin'))
                    ],
                    next: function(choice) {
                        return self.im.user
                            .set_lang(choice.value)
                            .then(function() {
                                return 'state_msg_receiver_msisdn';
                            });
                    }
                });
            });

            // FreeText st-B
            self.add('state_msg_receiver_msisdn', function(name, creator_opts) {
                var speech_option = '1';
                var question_text = 'Welcome, Number';
                return new FreeText(name, {
                    question: $(question_text),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option, creator_opts.retry),
                    next: function(content) {
                        if (go.utils.is_valid_msisdn(content)) {
                            return 'state_main_menu';
                        } else {
                            return {
                                'name': 'state_retry',
                                'creator_opts': {'retry_state': name}
                            };
                        }
                    }
                });
            });

            // ChoiceState st-A
            self.add('state_main_menu', function(name) {
                var speech_option = '1';
                return new ChoiceState(name, {
                    question: $('Choose:'),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option),
                    choices: [
                        new Choice('state_baby_confirm_subscription', $('baby')),
                        new Choice('state_change_menu_sms', $('preferences')),
                        new Choice('state_new_msisdn', $('number')),
                        new Choice('state_change_msg_language', $('language')),
                        new Choice('state_optout_reason', $('optout'))
                    ],
                    next: function(choice) {
                        return choice.value;
                    }
                });
            });

        // BABY CHANGE STATES

            // ChoiceState st-1A
            self.add('state_baby_confirm_subscription', function(name) {
                var speech_option = '1';
                return new ChoiceState(name, {
                    question: $('Confirm baby?'),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option),
                    choices: [
                        new Choice('confirm', $('To confirm press 1. To go back to main menu, 0 then #'))
                    ],
                    next: function(choice) {
                        return 'state_end_baby';
                    }
                });
            });

            // EndState st-02
            self.add('state_end_baby', function(name) {
                var speech_option = '1';
                return new EndState(name, {
                    text: $('Thank you - baby'),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option),
                    next: 'state_start'
                });
            });

        // MSG CHANGE STATES

            // ChoiceState st-03
            self.add('state_change_menu_sms', function(name) {
                var speech_option = '1';
                return new ChoiceState(name, {
                    question: $('Please select what you would like to do:'),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option),
                    choices: [
                        new Choice('change', $('Change from text to voice'))
                    ],
                    next: 'state_change_voice_days'
                });
            });

            // ChoiceState st-04
            self.add('state_change_voice_days', function(name) {
                var speech_option = '1';
                return new ChoiceState(name, {
                    question: $('Message days?'),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option),
                    choices: [
                        new Choice('mon_wed', $('Monday and Wednesday')),
                        new Choice('tue_thu', $('Tuesday and Thursday'))
                    ],
                    next: 'state_change_voice_times'
                });
            });

            // ChoiceState st-05
            self.add('state_change_voice_times', function(name) {
                var days = self.im.user.answers.state_change_voice_days;
                var speech_option = go.utils_project.get_speech_option_days(days);

                return new ChoiceState(name, {
                    question: $('Message times?'),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option),
                    choices: [
                        new Choice('9_11', $('9-11am')),
                        new Choice('2_5', $('2-5pm'))
                    ],
                    next: function(choice) {
                        return 'state_end_voice_confirm';
                    }
                });
            });

            // EndState st-06
            self.add('state_end_voice_confirm', function(name) {
                var days = self.im.user.answers.state_change_voice_days;
                var time = self.im.user.answers.state_change_voice_times;
                var speech_option = go.utils_project.get_speech_option_days_time(days, time);

                return new EndState(name, {
                    text: $('Thank you! Time: {{ time }}. Days: {{ days }}.'
                        ).context({ time: time, days: days }),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option),
                    next: 'state_start'
                });
            });

        // NUMBER CHANGE STATES

            // FreeText st-09
            self.add('state_new_msisdn', function(name, creator_opts) {
                var speech_option = 1;
                var question_text = 'Please enter new mobile number';
                return new FreeText(name, {
                    question: $(question_text),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option, creator_opts.retry),
                    next: function(content) {
                        if (!go.utils.is_valid_msisdn(content)) {
                            return {
                                'name': 'state_retry',
                                'creator_opts': {'retry_state': name}
                            };
                        }
                        return 'state_end_new_msisdn';
                    }
                });
            });

            // EndState st-10
            self.add('state_end_new_msisdn', function(name) {
                var speech_option = 1;
                return new EndState(name, {
                    text: $('Thank you. Mobile number changed.'),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option),
                    next: 'state_start'
                });
            });

        // LANGUAGE CHANGE STATES

            // ChoiceState st-11
            self.add('state_change_msg_language', function(name) {
                var speech_option = '1';
                return new ChoiceState(name, {
                    question: $('Language?'),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option),
                    choices: [
                        new Choice('eng_NG', $('English')),
                        new Choice('ibo_NG', $('Igbo')),
                        new Choice('pcm_NG', $('Pidgin'))
                    ],
                    next: function(choice) {
                        return self.im.user
                            .set_lang(choice.value)
                            .then(function() {
                                return 'state_end_msg_language_confirm';
                            });
                    }
                });
            });

            // EndState st-12
            self.add('state_end_msg_language_confirm', function(name) {
                var speech_option = 1;
                return new EndState(name, {
                    text: $('Thank you. Language preference updated.'),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option),
                    next: 'state_start'
                });
            });

        // OPTOUT STATES

            // ChoiceState st-13
            self.add('state_optout_reason', function(name) {
                var speech_option = '1';

                return new ChoiceState(name, {
                    question: $('Optout reason?'),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option),
                    choices: [
                        new Choice('miscarriage', $("Mother miscarried")),
                        new Choice('stillborn', $("Baby stillborn")),
                        new Choice('baby_death', $("Baby passed away")),
                        new Choice('not_useful', $("Messages not useful")),
                        new Choice('other', $("Other"))
                    ],
                    next: function(choice) {
                        switch (choice.value) {
                            case 'miscarriage': return 'state_loss_subscription';
                            case 'stillborn': return 'state_end_loss';
                            case 'baby_death': return 'state_end_loss';
                            case 'not_useful': return 'state_optout_receiver';
                            case 'other': return 'state_optout_receiver';
                        }
                    }
                });
            });

            // ChoiceState st-14
            self.add('state_loss_subscription', function(name) {
                var speech_option = '1';
                return new ChoiceState(name, {
                    question: $('Receive loss messages?'),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option),
                    choices: [
                        new Choice('state_end_loss_subscription_confirm', $("Yes")),
                        new Choice('state_end_loss', $("No"))
                    ],
                    next: function(choice) {
                        return choice.value;
                    }
                });
            });

            // EndState st-15
            self.add('state_end_loss_subscription_confirm', function(name) {
                var speech_option = '1';
                return new EndState(name, {
                    text: $('Thank you. You will now receive messages to support you during this difficult time.'),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option),
                    next: 'state_start'
                });
            });

            // ChoiceState st-16
            self.add('state_optout_receiver', function(name) {
                var speech_option = '1';
                return new ChoiceState(name, {
                    question: $('Which messages to opt-out on?'),
                    error: $("Invalid input. Which message to opt-out on?"),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option),
                    choices: [
                        new Choice('mother', $("Mother messages")),
                        new Choice('household', $("Household messages")),
                        new Choice('all', $("All messages"))
                    ],
                    next: function(choice) {
                        return 'state_end_optout';
                    }
                });
            });

            // EndState st-17
            self.add('state_end_optout', function(name) {
                var speech_option = '1';
                return new EndState(name, {
                    text: $('Thank you - optout'),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option),
                    next: 'state_start'
                });
            });

            // EndState st-21
            self.add('state_end_loss', function(name) {
                var speech_option = '1';
                return new EndState(name, {
                    text: $('We are sorry for your loss. You will no longer receive messages.'),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option),
                    next: 'state_start'
                });
            });

        // GENERAL END STATE

            // EndState st-22
            self.add('state_end_exit', function(name) {
                var speech_option = '1';
                return new EndState(name, {
                    text: $('Thank you for using the Hello Mama service. Goodbye.'),
                    helper_metadata: go.utils_project.make_voice_helper_data(
                        self.im, name, self.im.user.lang, speech_option),
                    next: 'state_start'
                });
            });

    });

    return {
        GoApp: GoApp
    };
}();
