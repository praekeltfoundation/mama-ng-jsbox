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
            self.im.on('session:close', function(e) {
                return go.utils_project.eval_dialback_reminder(
                    e, self.im, self.im.user.answers.user_id, $,
                    "Please dial back into {{channel}} to complete the Hello MAMA registration"
                    );
            });
        };


    // TEXT CONTENT

        var get_content = function(state_name) {
            switch (state_name) {
                case "state_timed_out":
                    return $("You have an incomplete registration. Would you like to continue with this registration?");
                case "state_auth_code":
                    return $("{{prefix}}Please enter your Hello Mama code.");
                case "state_msg_receiver":
                    return $("{{prefix}}Who will receive the messages on their phone?");
                case "state_msisdn":
                    return $("{{prefix}}Please enter the mobile number of the {{roleplayer}}. They must consent to receiving messages.");
                case "state_msisdn_already_registered":
                    return $("{{prefix}}Sorry, this number is already registered. They must opt-out before continuing.");
                case "state_msisdn_mother":
                    return $("{{prefix}}Please enter the mobile number of the mother. They must consent to receiving messages.");
                case "state_msisdn_household":
                    return $("{{prefix}}Please enter the mobile number of the {{roleplayer}}. They must consent to receiving messages.");
                case "state_pregnancy_status":
                    return $("{{prefix}}Please select one of the following:");
                case "state_last_period_month":
                    return $("{{prefix}}Please select the month the woman started her last period:");
                case "state_last_period_day":
                    return $("{{prefix}}What date of the month did the woman start her last period?");
                case "state_baby_birth_month_year":
                    return $("{{prefix}}Select the month and year the baby was born:");
                case "state_baby_birth_day":
                    return $("{{prefix}}What date of the month was the baby born?");
                case "state_gravida":
                    return $("{{prefix}}Please enter the total number of times the woman has been pregnant. This includes any pregnancies she may not have carried to term.");
                case "state_msg_language":
                    return $("{{prefix}}What language would they like to receive the messages in?");
                case "state_msg_type":
                    return $("{{prefix}}How would they like to receive the messages?");
                case "state_voice_days":
                    return $("{{prefix}}On what days would they like to receive these calls?");
                case "state_voice_times":
                    return $("{{prefix}}At what time would they like to receive these calls on {{days}}?");
                case "state_end_voice":
                    return $("Thank you. They will now start receiving calls on {{days}} between {{times}}.");
                case "state_end_sms":
                    return $("Thank you. They will now start receiving text messages three times a week on Monday, Wednesday and Friday.");
                case "state_end_msisdn":
                    return $("Thank you for using the Hello Mama service.");
            }
        };

        var state_error_types = {
            "invalid_date": $("Sorry, invalid date. "),
            "invalid_selection": $("Sorry, invalid option. "),
            "invalid_number": $("Sorry, invalid number. ")
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
                question: get_content(name),
                choices: [
                    new Choice('continue', $("Yes")),
                    new Choice('restart', $("No, start a new registration"))
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
            return go.utils
                .get_or_create_identity({'msisdn': self.im.user.addr}, self.im, null)
                .then(function(user) {
                    self.im.user.set_answer('user_id', user.id);
                    if (user.details.personnel_code) {
                        self.im.user.set_answer('operator_id', user.id);
                        return self.states.create('state_msg_receiver');
                    } else {
                        return self.states.create('state_auth_code');
                    }
                });
        });


    // REGISTRATION STATES

        // FreeText st-1
        self.add('state_auth_code', function(name) {
            return new FreeText(name, {
                question: get_content(name).context({prefix: ""}),
                check: function(content) {
                    var personnel_code = content;
                    return go.utils_project
                        .find_healthworker_with_personnel_code(self.im, personnel_code)
                        .then(function(healthworker) {
                            if (healthworker) {
                                self.im.user.set_answer('operator_id', healthworker.id);
                                return null;  // vumi expects null or undefined if check passes
                            } else {
                                return get_content(name)
                                    .context({prefix: state_error_types.invalid_number.args[0]});
                            }
                        });
                },
                next: 'state_msg_receiver'
            });
        });

        // ChoiceState st-02
        self.add('state_msg_receiver', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:"Welcome to Hello Mama. "}),
                error: get_content(name).context({prefix: state_error_types.invalid_selection.args[0]}),
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
                question: get_content(name).context({
                    prefix: "",
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
                        return get_content(name).context({
                            prefix: state_error_types.invalid_number.args[0],
                            roleplayer: self.im.user.answers.state_msg_receiver
                                // change the state_msg_receiver answer to display correctly
                                // in the ussd text
                                .replace('mother_only', 'mother')
                                .replace('father_only', 'father')
                                .replace('friend_only', 'friend')
                                .replace('family_only', 'family member')
                        });
                    }
                },
                next: function(content) {
                    var msisdn = go.utils.normalize_msisdn(
                        content, self.im.config.country_code);
                    return go.utils
                        .get_identity_by_address({'msisdn': msisdn}, self.im)
                        .then(function(contact) {
                            if (contact && contact.details && contact.details.receiver_role) {
                                self.im.user.set_answer('role_player', contact.details.receiver_role);
                                self.im.user.set_answer('contact_id', contact.id);
                                return 'state_msisdn_already_registered';
                            } else {
                                return 'state_save_identities';
                            }
                        });
                }
            });
        });

        // ChoiceState st-22
        self.add('state_msisdn_already_registered', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection.args[0]}),
                choices: [
                    new Choice('state_msisdn', $("Try a different number")),
                    new Choice('state_msg_receiver', $("Choose a different receiver")),
                    new Choice('exit', $("Exit"))
                ],
                next: function(choice) {
                    if (choice.value != 'exit') {
                        return choice.value;
                    } else {
                        return 'state_end_msisdn';
                    }
                }
            });
        });

        // EndState of st-22
        self.add('state_end_msisdn', function(name) {
            return new EndState(name, {
                text: get_content(name),
                next: 'state_start'
            });
        });

        // FreeText st-3A
        self.add('state_msisdn_mother', function(name) {
            return new FreeText(name, {
                question: get_content(name).context({prefix:""}),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return get_content(name).context({prefix: state_error_types.invalid_number.args[0]});
                    }
                },
                next: 'state_msisdn_household'
            });
        });

        // FreeText st-3B
        self.add('state_msisdn_household', function(name) {
            return new FreeText(name, {
                question: get_content(name).context({
                    prefix: "",
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
                        return get_content(name).context({
                            prefix: state_error_types.invalid_number.args[0],
                            roleplayer: self.im.user.answers.state_msg_receiver
                                // change the state_msg_receiver answer to display correctly
                                // in the ussd text
                                .replace('mother_family', 'family member')
                                .replace('mother_', '')
                        });
                    }
                },
                next: function() {
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
            });
        });

        // Get or create identities and save their IDs
        self.add('state_save_identities', function(name) {
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
                    if (bypassPostbirth) {
                        self.im.user.set_answer('state_pregnancy_status', 'prebirth');
                        return self.states.create('state_last_period_month');
                    } else {
                        return self.states.create('state_pregnancy_status');
                    }
                });
        });

        // ChoiceState st-04
        self.add('state_pregnancy_status', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                error: get_content(name).context({prefix: state_error_types.invalid_date.args[0]}),
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
                question: get_content(name).context({prefix:""}),
                error: get_content(name).context({prefix: state_error_types.invalid_date.args[0]}),
                characters_per_page: 182,
                options_per_page: 5,
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
                question: get_content(name).context({prefix:""}),
                check: function(content) {
                    if (go.utils.is_valid_day_of_month(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return get_content(name).context({prefix: state_error_types.invalid_date.args[0]});
                    }
                },
                next: 'state_validate_date'
            });
        });

        //
        self.add('state_gravida', function(name) {
            return new FreeText(name, {
                question: get_content(name).context({prefix:""}),
                check: function(content) {
                    if (go.utils.check_valid_number(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return get_content(name).context({prefix: state_error_types.invalid_number.args[0]});
                    }
                },
                next: 'state_msg_language'
            });
        });

        // ChoiceState st-07
        self.add('state_msg_language', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                error: get_content(name).context({prefix: state_error_types.invalid_selection.args[0]}),
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
                question: get_content(name).context({prefix:""}),
                error: get_content(name).context({prefix: state_error_types.invalid_selection.args[0]}),
                choices: [
                    new Choice('audio', $('Voice calls')),
                    new Choice('text', $('Text SMSs'))
                ],
                next: function(choice) {
                    if (choice.value === 'audio') {
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

        // ChoiceState st-09
        self.add('state_voice_days', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                error: get_content(name).context({prefix: state_error_types.invalid_selection.args[0]}),
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
                question: get_content(name).context({
                    prefix: "",
                    days: self.im.user.answers.state_voice_days
                        .replace('mon_wed', 'Mondays and Wednesdays')
                        .replace('tue_thu', 'Tuesdays and Thursdays')
                }),
                error: get_content(name).context({
                    prefix: state_error_types.invalid_selection.args[0],
                    days: self.im.user.answers.state_voice_days
                        .replace('mon_wed', 'Mondays and Wednesdays')
                        .replace('tue_thu', 'Tuesdays and Thursdays')
                }),
                choices: [
                    new Choice('9_11', $('Between 9-11am')),
                    new Choice('2_5', $('Between 2-5pm'))
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
        self.add('state_end_voice', function(name) {
            var voice_schedule = {
                "mon_wed": "Monday and Wednesday",
                "tue_thu": "Tuesday and Thursday",
                "9_11": "9am-11am",
                "2_5": "2pm-5pm"
            };
            return new EndState(name, {
                text: get_content(name).context({
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
                question: get_content(name).context({prefix:""}),
                error: get_content(name).context({prefix: state_error_types.invalid_date.args[0]}),
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
                question: get_content(name).context({prefix:""}),
                check: function(content) {
                    if (go.utils.is_valid_day_of_month(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return get_content(name).context({prefix: state_error_types.invalid_date[0]});
                    }
                },
                next: 'state_validate_date'
            });
        });

        // EndState st-15
        self.add('state_end_sms', function(name) {
            return new EndState(name, {
                text: get_content(name),
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
                        'Please try again.').context({date: opts.date}),
                error:
                    $('{{prefix}}The date you entered ({{ date }}) is incorrect. ' +
                        'Please try again.')
                        .context({prefix: state_error_types.invalid_selection.args[0],
                            date: opts.date}),
                choices: [
                    new Choice('continue', $('Continue')),
                    new Choice('exit', $('Exit'))
                ],
                next: function(choice) {
                    if (choice.value !== 'exit') {
                        if (self.im.user.answers.state_last_period_day) {  // flow via st-05 & st-06
                            return 'state_last_period_month';
                        }
                        else if (self.im.user.answers.state_baby_birth_day) { // flow via st-12 & st-13
                            return 'state_baby_birth_month_year';
                        }
                    } else {
                        return 'state_end_msisdn';
                    }

                }
            });
        });
    });

    return {
        GoApp: GoApp
    };
}();
