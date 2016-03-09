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
                if (go.utils_project.should_repeat(self.im)) {
                    // Prevent previous content being passed to next state
                    // thus preventing infinite repeat loop
                    self.im.msg.content = null;
                    return creator(name, opts);
                }

                if (!interrupt || !go.utils_project.should_restart(self.im))
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
                        self.im.user.set_answer('operator_id', user.id);
                        return self.states.create('state_msg_receiver');
                    } else {
                        return self.states.create('state_personnel_auth');
                    }
                });
        });

        // A loopback state that is required since you can't pass opts back
        // into the same state
        self.add('state_retry', function(name, opts) {
            return self.states.create(opts.retry_state, {'retry': true});
        });


    // REGISTRATION

        // FreeText st-01
        self.add('state_personnel_auth', function(name, creator_opts) {
            var question_text = 'Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345';
            var retry_text = 'Sorry, that is not a valid number. Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            var speech_option = '1';
            return new FreeText(name, {
                question: $(use_text),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    return go.utils_project
                        .find_healthworker_with_personnel_code(self.im, content)
                        .then(function(healthworker) {
                            if (healthworker) {
                                self.im.user.set_answer('operator_id', healthworker.id);
                                return 'state_msg_receiver';
                            } else {
                                return {
                                    'name': 'state_retry',
                                    'creator_opts': {'retry_state': name}
                                };
                            }
                        });
                }
            });
        });

        // ChoiceState st-02
        self.add('state_msg_receiver', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Choose message receiver'),
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
            var retry_text = 'Sorry, invalid input. Please enter number';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            var speech_option = '1';
            return new FreeText(name, {
                question: $(use_text),
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
            var retry_text = 'Sorry, invalid input. Please enter number (Mother)';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            var speech_option = '1';
            return new FreeText(name, {
                question: $(use_text),
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
            var retry_text = "Sorry, invalid input. Please enter the {{role_player}}'s number";
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            var speech_option = go.utils_project.get_speech_option_household(rolePlayer);

            return new FreeText(name, {
                question: $(use_text).context({role_player: rolePlayer}),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    } else {
                        var receiver_mapping = {
                            'mother_father': 'father_only',
                            'mother_friend': 'friend_only',
                            'mother_family': 'family_only'
                        };
                        if (self.im.user.answers.state_msisdn_household ===
                            self.im.user.answers.state_msisdn_mother) {
                            self.im.user.set_answer('state_msg_receiver',
                                receiver_mapping[self.im.user.answers.state_msg_receiver]);
                            self.im.user.set_answer('state_msisdn',
                                                    self.im.user.answers.state_msisdn_mother);
                        }
                        return 'state_save_identities';
                    }
                }
            });
        });

        // Get or create identities and save their IDs
        self.add('state_save_identities', function(name, creator_opts) {
            return go.utils_project
                .save_identities(
                    self.im,
                    self.im.user.answers.state_msg_receiver,
                    self.im.user.answers.state_msisdn,
                    self.im.user.answers.state_msisdn_household,
                    self.im.user.answers.state_msisdn_mother,
                    self.im.user.answers.operator_id
                )
                .then(function() {
                    return self.states.create('state_pregnancy_status');
                });
        });

        // ChoiceState st-04
        self.add('state_pregnancy_status', function(name, creator_opts) {
            var speech_option = '1';
            var routing = {
                'prebirth': 'state_last_period_year',
                'postbirth': 'state_baby_birth_year'
            };
            return new ChoiceState(name, {
                question: $('Pregnant or baby'),
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
                question: $('Last period?'),
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
            var retry_text = 'Retry. Period month this/last year?';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            var speech_option = go.utils_project.get_speech_option_year(
                self.im.user.answers.state_last_period_year);
            return new ChoiceState(name, {
                question: $(use_text),
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
            var retry_text = 'Retry last period day {{ month }} {{ year }}';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            var month = self.im.user.answers.working_month;
            var year = self.im.user.answers.working_year;
            var speech_option = go.utils_project.get_speech_option_pregnancy_status_day(
                self.im, month);

            return new FreeText(name, {
                question: $(use_text).context({ month: month, year: year }),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (!(go.utils.is_valid_day_of_month(content))) {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    } else {
                        self.im.user.set_answer('working_date', year + month + content);
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
                question: $('Baby born?'),
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
            var retry_text = 'Retry. Birth month this/last year?';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            var speech_option = go.utils_project.get_speech_option_year(
                self.im.user.answers.state_baby_birth_year);
            return new ChoiceState(name, {
                question: $(use_text),
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
            var retry_text = 'Retry birth day {{ month }} {{ year }}';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            var month = self.im.user.answers.working_month;
            var year = self.im.user.answers.working_year;
            var speech_option = go.utils_project.get_speech_option_pregnancy_status_day(
                self.im, month);

            return new FreeText(name, {
                question: $(use_text).context({ month: month, year: year }),
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
                            year + month + content);
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
                    $('The date you entered is not a real date. Please try again.'),
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
                question: $('Please enter the number of times the woman has been pregnant before. This includes any pregnancies she may not have carried to term.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: 'state_msg_language'
            });
        });

        // ChoiceState st-07
        self.add('state_msg_language', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Language?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('english', $('english')),
                    new Choice('hausa', $('hausa')),
                    new Choice('igbo', $('igbo')),
                    new Choice('pidgin', $('pidgin')),
                    new Choice('yoruba', $('yoruba'))
                ],
                next: 'state_msg_type'
            });
        });

        // ChoiceState st-08
        self.add('state_msg_type', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Channel?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('voice', $('voice')),
                    new Choice('sms', $('sms'))
                ],
                next: function(choice) {
                    if (choice.value === 'voice') {
                        return 'state_voice_days';
                    } else {
                        return go.utils_project
                            .finish_registration(self.im)
                            .then(function() {
                                return 'state_end_sms';
                            });
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
                question: $('Message days?'),
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
                question: $('Message time?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('9_11', $('9_11')),
                    new Choice('2_5', $('2_5'))
                ],
                next: function() {
                    return go.utils_project
                        .finish_registration(self.im)
                        .then(function() {
                            return 'state_end_voice';
                        });
                }
            });
        });

        // EndState st-11
        self.add('state_end_voice', function(name, creator_opts) {
            var time = self.im.user.answers.state_voice_times;
            var days = self.im.user.answers.state_voice_days;
            var speech_option = go.utils_project.get_speech_option_days_time(days, time);
            var text = $('Thank you! Time: {{ time }}. Days: {{ days }}.'
                         ).context({ time: time, days: days });
            return new EndState(name, {
                text: text,
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: 'state_start'
            });
        });

    });

    return {
        GoApp: GoApp
    };
}();
