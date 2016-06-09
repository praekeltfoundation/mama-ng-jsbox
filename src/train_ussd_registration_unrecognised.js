go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var PaginatedChoiceState = vumigo.states.PaginatedChoiceState;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;


    var GoApp = App.extend(function(self) {
        App.call(self, 'state_start');
        var $ = self.$;
        var interrupt = true;
        var bypassPostbirth = true;

        self.init = function() {
            // Send a dial back reminder via sms the first time someone times out
            // TR01 - deactivate SMS sending (backend required)
            // self.im.on('session:close', function(e) {
            //     return go.utils_project.eval_dialback_reminder(
            //         e, self.im, self.im.user.answers.user_id, $,
            //         "Please dial back in to {{channel}} to complete the Hello MAMA registration"
            //         );
            // });
        };


    // TEXT CONTENT

        var questions = {
            "state_timed_out":
                $("You have an incomplete registration. Would you like to continue with this registration?"),
            "state_auth_code":
                $("Please enter you Hello Mama code."),
            "state_msg_receiver":
                $("Welcome to the Hello Mama training line. Who will receive the messages?"),
            "state_msisdn":
                $("Please enter the mobile number of the {{roleplayer}}. They must consent to receiving messages."),
            "state_msisdn_already_registered":
                $("Sorry, this number is already registered. They must opt-out before they can register again."),
            "state_msisdn_mother":
                $("Please enter the mobile number of the mother. They must consent to receiving messages."),
            "state_msisdn_household":
                $("Please enter the mobile number of the {{roleplayer}}. They must consent to receiving messages."),
            "state_pregnancy_status":
                $("Please select one of the following:"),
            "state_last_period_month":
                $("Please select the month the woman started her last period:"),
            "state_last_period_day":
                $("What date of the month did the woman start her last period?"),
            "state_baby_birth_month_year":
                $("Select the month and year the baby was born:"),
            "state_baby_birth_day":
                $("On what date of the month was the baby born?"),
            "state_gravida":
                $("Please enter the total number of times the woman has been pregnant. This includes any pregnancies she may not have carried to term."),
            "state_msg_language":
                $("What language would they like to receive the messages in?"),
            "state_msg_type":
                $("How would they like to receive the messages?"),
            "state_voice_days":
                $("On what days would they like to receive these calls?"),
            "state_voice_times":
                $("At what time would they like to receive these calls on {{days}}?"),
            "state_end_voice":
                $("Thank you. They will now start receiving calls on {{days}} between {{times}}."),
            "state_end_sms":
                $("Thank you. They will now start receiving text messages three times a week on Monday, Wednesday and Friday."),
            "state_end_msisdn":
                $("Thank you for using the Hello Mama service.")
        };

        var state_error_types = {
            "invalid_date": "Sorry, invalid date.",
            "invalid_selection": "Sorry, invalid option.",
            "invalid_number": "Sorry, invalid number."
        };

        var errors = {
            "state_auth_code":
                $("{{error}} Please enter your Hello Mama code.")
                    .context({error: state_error_types.invalid_number}),
            "state_msg_receiver":
                $("{{error}} Welcome to the Hello Mama training line. Who will receive the messages?")
                    .context({error: state_error_types.invalid_selection}),
            "state_msisdn":
                $("{{error}} Please enter the mobile number of the {{roleplayer}}. They must consent to receiving messages."),
            "state_msisdn_mother":
                $("{{error}} Please enter the mobile number of the mother. They must consent to receiving messages.")
                    .context({error: state_error_types.invalid_number}),
            "state_msisdn_already_registered":
                $("{{error}} Sorry, this number is already registered. They must opt-out before they can register again.")
                    .context({error: state_error_types.invalid_selection}),
            "state_msisdn_household":
                $("{{error}} Please enter the mobile number of the {{roleplayer}}. They must consent to receiving messages."),
            "state_last_period_month":
                $("{{error}} Please select the month the woman started her last period:")
                    .context({error: state_error_types.invalid_date}),
            "state_last_period_day":
                $("{{error}} What date of the month did the woman start her last period?")
                    .context({error: state_error_types.invalid_date}),
            "state_gravida":
                $("{{error}} Please enter the total number of times the woman has been pregnant. This includes any pregnancies she may not have carried to term.")
                    .context({error: state_error_types.invalid_number}),
            "state_baby_birth_day":
                $("Sorry, invalid number. What day of the month was the baby born? For example, 12."),
        };


    // TIMEOUT HANDLING

        // override normal state adding
        self.add = function(name, creator) {
            self.states.add(name, function(name, opts) {
                if (!interrupt || !go.utils.timed_out(self.im))
                    return creator(name, opts);

                interrupt = false;
                opts = opts || {};
                opts.name = name;
                return self.states.create('state_timed_out', opts);
            });
        };

        // timeout 01
        self.states.add('state_timed_out', function(name, creator_opts) {
            return new ChoiceState(name, {
                question: questions[name],
                choices: [
                    new Choice('continue', $("Yes")),
                    new Choice('restart', $("No, start new registration"))
                ],
                next: function(choice) {
                    if (choice.value === 'continue') {
                        return {
                            name: creator_opts.name,
                            creator_opts: creator_opts
                        };
                    } else if (choice.value === 'restart') {
                        return 'state_start';
                    }
                }
            });
        });


    // START STATE

        self.add('state_start', function(name) {
            self.im.user.answers = {};  // reset answers
            return self.states.create('state_auth_code');
        });


    // REGISTRATION STATES

        // FreeText st-1
        self.add('state_auth_code', function(name) {
            return new FreeText(name, {
                question: questions[name],
                check: function(content) {
                    if (go.utils.check_valid_number(content) && content.length === 5) {
                        return null;
                    } else {
                        return errors[name];
                    }
                },
                next: 'state_msg_receiver'
            });
        });

        // ChoiceState st-02
        self.add('state_msg_receiver', function(name) {
            return new ChoiceState(name, {
                question: questions[name],
                choices: [
                    new Choice('mother_father', $("Mother, Father")),
                    new Choice('mother_only', $("Mother")),
                    new Choice('father_only', $("Father")),
                    new Choice('mother_family', $("Mother, family member")),
                    new Choice('mother_friend', $("Mother, friend")),
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
        self.add('state_msisdn', function(name) {
            return new FreeText(name, {
                question: questions[name].context({
                    roleplayer: self.im.user.answers.state_msg_receiver
                        // change the state_msg_receiver answer to display correctly
                        // in the ussd text
                        .replace('mother_only', 'mother')
                        .replace('father_only', 'father')
                        .replace('friend_only', 'friend')
                        .replace('family_only', 'family member')
                }),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return errors[name].context({
                            error: state_error_types.invalid_number,
                            roleplayer: self.im.user.answers.state_msg_receiver
                                .replace('mother_only', 'mother')
                                .replace('father_only', 'father')
                                .replace('friend_only', 'friend')
                                .replace('family_only', 'family member')
                        });
                    }
                },
                next: function(content) {
                    return 'state_save_identities';
                }
            });
        });

        // FreeText st-3A
        self.add('state_msisdn_mother', function(name) {
            return new FreeText(name, {
                question: questions[name],
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return errors[name];
                    }
                },
                next: 'state_msisdn_household'
            });
        });

        // FreeText st-3B
        self.add('state_msisdn_household', function(name) {
            return new FreeText(name, {
                question: questions[name].context({
                    roleplayer: self.im.user.answers.state_msg_receiver
                        // change the state_msg_receiver answer to display correctly
                        // in the ussd text
                        .replace('mother_family', 'family member')
                        .replace('mother_', '')
                }),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return errors[name].context({
                            error: state_error_types.invalid_number,
                            roleplayer: self.im.user.answers.state_msg_receiver
                                // change the state_msg_receiver answer to display correctly
                                // in the ussd text
                                .replace('mother_family', 'family member')
                                .replace('mother_', '')
                        });
                    }
                },
                next: function() {
                    return 'state_save_identities';
                }
            });
        });

        // Get or create identities and save their IDs
        self.add('state_save_identities', function(name) {
            if (bypassPostbirth) {
                self.im.user.set_answer('state_pregnancy_status', 'prebirth');
                return self.states.create('state_last_period_month');
            } else {
                return self.states.create('state_pregnancy_status');
            }
        });

        // ChoiceState st-04
        self.add('state_pregnancy_status', function(name) {
            return new ChoiceState(name, {
                question: questions[name],
                choices: [
                    new Choice('prebirth', $("The mother is pregnant")),
                    new Choice('postbirth', $("The mother has a baby under 1 year old"))
                ],
                next: function(choice) {
                    return choice.value === 'prebirth'
                        ? 'state_last_period_month'
                        : 'state_baby_birth_month_year';
                }
            });
        });

        // PaginatedChoiceState st-05
        self.add('state_last_period_month', function(name) {
            var today = go.utils.get_today(self.im.config);
            return new PaginatedChoiceState(name, {
                question: questions[name],
                characters_per_page: 182,
                options_per_page: null,
                more: $('More'),
                back: $('Back'),
                choices: go.utils.make_month_choices($, today, 9, -1,
                                                     "YYYYMM", "MMMM YYYY"),
                next: 'state_last_period_day'
            });
        });

        // FreeText st-06
        self.add('state_last_period_day', function(name) {
            return new FreeText(name, {
                question: questions[name],
                check: function(content) {
                    if (go.utils.is_valid_day_of_month(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return errors[name];
                    }
                },
                next: 'state_validate_date'
            });
        });

        self.add('state_gravida', function(name) {
            return new FreeText(name, {
                question: questions[name],
                check: function(content) {
                    if (go.utils.check_valid_number(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return errors[name];
                    }
                },
                next: 'state_msg_language'
            });
        });

        // ChoiceState st-07
        self.add('state_msg_language', function(name) {
            return new ChoiceState(name, {
                question: questions[name],
                choices: [
                    new Choice('eng_NG', $('English')),
                    new Choice('ibo_NG', $('Igbo')),
                    new Choice('pcm_NG', $('Pidgin'))
                ],
                next: 'state_msg_type'
            });
        });

        // ChoiceState st-08
        self.add('state_msg_type', function(name) {
            return new ChoiceState(name, {
                question: questions[name],
                choices: [
                    new Choice('audio', $('Voice calls')),
                    new Choice('text', $('Text SMSs'))
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

        // ChoiceState st-09
        self.add('state_voice_days', function(name) {
            return new ChoiceState(name, {
                question: questions[name],
                choices: [
                    new Choice('mon_wed', $('Monday and Wednesday')),
                    new Choice('tue_thu', $('Tuesday and Thursday'))
                ],
                next: 'state_voice_times'
            });
        });

        // ChoiceState st-10
        self.add('state_voice_times', function(name) {
            return new ChoiceState(name, {
                question: questions[name]
                    .context({days: self.im.user.answers.state_voice_days
                    .replace('mon_wed', 'Mondays and Wednesdays')
                    .replace('tue_thu', 'Tuesdays and Thursdays')}),
                choices: [
                    new Choice('9_11', $('Between 9-11am')),
                    new Choice('2_5', $('Between 2-5pm'))
                ],
                next: function() {
                    return 'state_end_voice';
                }
            });
        });

        // EndState st-11
        self.add('state_end_voice', function(name) {
            var voice_schedule = {
                "mon_wed": "Monday and Wednesday",
                "tue_thu": "Tuesday and Thursday",
                "9_11": "9am - 11am",
                "2_5": "2pm - 5pm"
            };
            return new EndState(name, {
                text: questions[name].context({
                    days: voice_schedule[self.im.user.answers.state_voice_days],
                    times: voice_schedule[self.im.user.answers.state_voice_times]
                }),
                next: 'state_start'
            });
        });

        // PaginatedChoiceState st-12 & 13
        self.add('state_baby_birth_month_year', function(name) {
            var today = go.utils.get_today(self.im.config);
            return new PaginatedChoiceState(name, {
                question: questions[name],
                characters_per_page: 182,
                options_per_page: null,
                more: $('More'),
                back: $('Back'),
                choices: go.utils.make_month_choices($, today, 12, -1,
                                                     "YYYYMM", "MMMM YYYY"),
                next: 'state_baby_birth_day'
            });
        });

        // FreeText st-14
        self.add('state_baby_birth_day', function(name) {
            return new FreeText(name, {
                question: questions[name],
                check: function(content) {
                    if (go.utils.is_valid_day_of_month(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return errors[name];
                    }
                },
                next: 'state_validate_date'
            });
        });

        // EndState st-15
        self.add('state_end_sms', function(name) {
            return new EndState(name, {
                text: questions[name],
                next: 'state_start'
            });
        });

        // to validate overall date
        self.add('state_validate_date', function(name) {
            var monthAndYear = self.im.user.answers.state_last_period_month ||  // flow via st-05 & st-06
                                self.im.user.answers.state_baby_birth_month_year;
            var day = self.im.user.answers.state_last_period_day
                   || self.im.user.answers.state_baby_birth_day;  // flow via st-12 & st-13

            var dateToValidate = monthAndYear + go.utils.double_digit_number(day);

            if (go.utils.is_valid_date(dateToValidate, 'YYYYMMDD')) {
                self.im.user.set_answer('working_date', dateToValidate);
                return self.states.create('state_gravida');
            } else {
                return self.states.create('state_invalid_date', {date: dateToValidate});
            }
        });

        self.add('state_invalid_date', function(name, opts) {
            return new ChoiceState(name, {
                question:
                    $('The date you entered ({{ date }}) is incorrect. ' +
                    'Please try again.'
                    ).context({date: opts.date}),

                choices: [
                    new Choice('continue', $('Continue'))
                ],
                next: function() {
                    if (self.im.user.answers.state_last_period_day) {  // flow via st-05 & st-06
                        return self.states.create('state_last_period_month');
                    }
                    else if (self.im.user.answers.state_baby_birth_day) { // flow via st-12 & st-13
                        return self.states.create('state_baby_birth_month_year');
                    }
                }
            });
        });
    });

    return {
        GoApp: GoApp
    };
}();
