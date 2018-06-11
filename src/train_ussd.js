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

        var get_content = function(state_name) {
            switch (state_name) {
                // REGISTRATION
                case "state_timed_out":
                    return $("You have an incomplete registration. Would you like to continue with this registration?");
                case "state_personnel_auth":
                    return $("{{prefix}}Please enter your Hello Mama code.");
                case "state_training_intro":
                    return $("Select an option to practise:");
                case "state_msg_receiver":
                    return $("{{prefix}}Who will receive messages?");
                case "state_msisdn":
                    return $("{{prefix}}Please enter the mobile number of the {{roleplayer}}. They must consent to receiving messages.");
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
                    return $("{{prefix}}On what date of the month was the baby born?");
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
                    return $("Thank you. They will now start receiving messages three times a week on Monday, Wednesday and Friday.");
                case "state_end_msisdn":
                    return $("Thank you for using the Hello Mama service.");

                // CHANGE
                case "state_msisdn_permission":
                    return $("{{prefix}}Do you have permission to manage the number {{msisdn}}?");
                case "state_msisdn_no_permission":  // unnamed state on flow diagram
                    return $("{{prefix}}We're sorry, you do not have permission to update the preferences for this subscriber.");
                case "state_language":
                    return $("{{prefix}}Welcome to the Hello Mama training line. Please choose your language.");
                case "state_registered_msisdn":
                    return $("{{prefix}}Please enter the number which is registered to receive messages.");
                case "state_main_menu":
                    return $("{{prefix}}Select:");
                case "state_main_menu_household":
                    return $("{{prefix}}Select:");
                case "state_msisdn_not_recognised":  // st-F
                    return $("{{prefix}}We do not recognise this number. Please dial from the registered number or sign up with the Local Community Health Extension Worker.");
                case "state_already_registered_baby":
                    return $("You are already registered for baby messages.");
                case "state_new_registration_baby":
                    return $("Thank you. You will now receive messages about caring for the baby");
                case "state_change_menu_sms":
                    return $("{{prefix}}Please select an option:");
                case "state_change_voice_days":
                    return $("{{prefix}}We will call twice a week. On what days would you like to receive messages?");
                case "state_change_voice_times":
                    return $("{{prefix}}At what time would you like to receive these calls?");
                case "state_end_voice_confirm":
                    return null;  // not currently in use
                    // ("Thank you. You will now start receiving voice calls on {{days}} between {{times}}");
                case "state_change_menu_voice":
                    return $("{{prefix}}Please select an option:");
                case "state_end_sms_confirm":
                    return $("Thank you. You will now receive text messages");
                case "state_new_msisdn":
                    return $("{{prefix}}Please enter the new mobile number you would like to receive messages on.");
                case "state_number_in_use":
                    return $("{{prefix}}Sorry this number is already registered. You must opt-out before registering again.");
                case "state_msg_receiver":
                    return $("{{prefix}}Who will receive these messages?");
                case "state_end_number_change":
                    return $("Thank you. The number which receives messages has been updated.");
                case "state_change_msg_language":
                    return $("{{prefix}}What language would you like to receive these messages in?");
                case "state_change_msg_language_confirm":
                    return $("Thank you. Your language has been updated and you will start to receive messages in this language.");
                case "state_optout_reason":
                    return $("{{prefix}}Why do you no longer want to receive messages?");
                case "state_loss_subscription":
                    return $("{{prefix}}We are sorry for your loss. Would the mother like to receive a small set of free messages that could help during this difficult time?");
                case "state_end_loss_subscription_confirm":
                    return $("Thank you. You will now receive messages to support you during this difficult time.");
                case "state_optout_receiver":
                    return $("{{prefix}}Which messages would you like to stop receiving?");
                case "state_end_optout":
                    return $("Thank you. You will no longer receive messages");
                case "state_end_loss":
                    return $("We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW.");
                case "state_end_exit":
                    return $("Thank you for using the Hello Mama service");
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
            return self.states.create('state_training_intro');
        });

        // ChoiceState st-E
        self.add("state_training_intro", function(name) {
            return new ChoiceState(name, {
                question: get_content(name),
                // error:
                choices: [
                    new Choice("register", "Registering a pregnancy"),
                    new Choice("register_with_code", "Registering a pregnancy with your Hello Mama code"),
                    new Choice("change", "Changing patient details")
                ],
                next: function(choice) {
                    switch (choice.value) {
                        case "register":
                            return "state_msg_receiver";
                        case "register_with_code":
                            return "state_personnel_auth";
                        case "change":
                            return "state_language";
                        default:
                            return "state_start";
                    }
                }
            });
        });


    // REGISTRATION STATES

        self.add('state_personnel_auth', function(name) {
            return new FreeText(name, {
                question: get_content(name).context({prefix:""}),
                check: function(content) {
                    if (go.utils.check_valid_number(content) && content.length === 5) {
                        return null;
                    } else {
                        return get_content(name)
                            .context({prefix: state_error_types.invalid_number});
                    }
                },
                next: 'state_msg_receiver'
            });
        });

        // ChoiceState st-02
        self.add('state_msg_receiver', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
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
                    if (go.utils.is_valid_msisdn(content) && (go.utils.phoneNumberPrefix(content)== true)) {
                    
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return get_content(name).context({
                            prefix: state_error_types.invalid_number,
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
                question: get_content(name).context({prefix:""}),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content) && (go.utils.phoneNumberPrefix(content)== true)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return get_content(name)
                            .context({prefix: state_error_types.invalid_number});
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
                    if (go.utils.is_valid_msisdn(content) && (go.utils.phoneNumberPrefix(content)== true)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return get_content(name).context({
                            prefix: state_error_types.invalid_number,
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
                question: get_content(name).context({prefix:""}),
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
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
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_date}),
                characters_per_page: 182,
                options_per_page: 5,
                more: $('More'),
                back: $('Back'),
                choices: go.utils.make_month_choices($, today, 10, -1,
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
                        return get_content(name)
                            .context({prefix: state_error_types.invalid_date});
                    }
                },
                next: 'state_validate_date'
            });
        });

        self.add('state_gravida', function(name) {
            return new FreeText(name, {
                question: get_content(name).context({prefix:""}),
                check: function(content) {
                    if (go.utils.check_number_in_range(content, 0, 10)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return get_content(name)
                            .context({prefix: state_error_types.invalid_number});
                    }
                },
                next: 'state_msg_language'
            });
        });

        // ChoiceState st-07
        self.add('state_msg_language', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
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
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
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
                question: get_content(name).context({prefix:""}),
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
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
                question: get_content(name)
                    .context({prefix: "",
                        days: self.im.user.answers.state_voice_days
                        .replace('mon_wed', 'Mondays and Wednesdays')
                        .replace('tue_thu', 'Tuesdays and Thursdays')}),
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection,
                        days: self.im.user.answers.state_voice_days
                        .replace('mon_wed', 'Mondays and Wednesdays')
                        .replace('tue_thu', 'Tuesdays and Thursdays')}),
                choices: [
                    new Choice('9_11', $('Between 9-11am')),
                    new Choice('2_5', $('Between 2-5pm')),
                    new Choice('6_8', $('Between 6-8pm'))
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
                "2_5": "2pm - 5pm",
                "6_8": "6pm - 8pm"
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
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
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
                        return get_content(name)
                            .context({prefix: state_error_types.invalid_date});
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
                        .context({prefix: state_error_types.invalid_selection,
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

    // CHANGE STATES

    // initial change states

        // ChoiceState st-D
        self.add('state_language', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                choices: [
                    new Choice('eng_NG', $("English")),
                    new Choice('ibo_NG', $("Igbo")),
                    new Choice('pcm_NG', $('Pidgin'))
                ],
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
                next: function(choice) {
                    return self.im.user
                        .set_lang(choice.value)
                        .then(function() {
                            return 'state_registered_msisdn';
                        });
                }
            });
        });

        // FreeText st-C
        self.add('state_registered_msisdn', function(name) {
            return new FreeText(name, {
                question: get_content(name).context({prefix:""}),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content) && (go.utils.phoneNumberPrefix(content)== true)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return get_content(name)
                            .context({prefix: state_error_types.invalid_number});
                    }
                },
                next: 'state_main_menu'
            });
        });

        // ChoiceState st-A
        self.add('state_main_menu', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                choices: [
                    new Choice('state_new_registration_baby', $("Start Baby messages")),
                    new Choice('state_change_menu_sms', $("Change message preferences")),
                    new Choice('state_new_msisdn', $("Change my number")),
                    new Choice('state_change_msg_language', $("Change language")),
                    new Choice('state_optout_reason', $("Stop receiving messages"))
                ],
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
                next: function(choice) {
                    return choice.value;
                }
            });
        });

    // baby change states

        // EndState st-02
        self.add('state_new_registration_baby', function(name) {
            return new EndState(name, {
                text: get_content(name),
                next: 'state_start'
            });
        });

    // msg change states

        // ChoiceState st-03
        self.add('state_change_menu_sms', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
                choices: [
                    new Choice('to_voice', $("Change from text to voice messages")),
                    new Choice('back', $("Back to main menu"))
                ],
                next: function(choice) {
                    return choice.value === 'to_voice'
                        ? 'state_change_voice_days'
                        : 'state_main_menu';
                }
            });
        });

        // ChoiceState st-04
        self.add('state_change_voice_days', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
                choices: [
                    new Choice('mon_wed', $("Monday and Wednesday")),
                    new Choice('tue_thu', $("Tuesday and Thursday"))
                ],
                next: 'state_change_voice_times'
            });
        });

        // ChoiceState st-05
        self.add('state_change_voice_times', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
                choices: [
                    new Choice('9_11', $("Between 9-11am")),
                    new Choice('2_5', $("Between 2-5pm")),
                    new Choice('6_8', $("Between 6-8pm"))
                ],
                next: function(choice) {
                    return 'state_end_voice_confirm';
                }
            });
        });

        // EndState st-06
        self.add('state_end_voice_confirm', function(name) {
            var days = self.im.user.answers.state_change_voice_days;
            var times = self.im.user.answers.state_change_voice_times;
            var text;

            var values = {
                "mon_wed": "Monday and Wednesday",
                "tue_thu": "Tuesday and Thursday",
                "9_11": "9 and 11am",
                "2_5": "2 and 5pm",
                "6_8": "6 and 8pm"
            };

            text = $("Thank you. You will now start receiving voice calls on " + values[days] + " between " + values[times]);

            return new EndState(name, {
                text: text,
                next: 'state_start'
            });
        });

    // number change states

        // FreeText st-09
        self.add('state_new_msisdn', function(name) {
            return new FreeText(name, {
                question: get_content(name).context({prefix:""}),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content) && (go.utils.phoneNumberPrefix(content)== true)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return get_content(name)
                            .context({prefix: state_error_types.invalid_number});
                    }
                },
                next: 'state_end_number_change'
            });
        });

        // EndState st-10
        self.add('state_end_number_change', function(name) {
            return new EndState(name, {
                text: get_content(name),
                next: 'state_start'
            });
        });

    // language change states

        // ChoiceState st-11
        self.add('state_change_msg_language', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
                choices: [
                    new Choice('eng_NG', $("English")),
                    new Choice('ibo_NG', $("Igbo")),
                    new Choice('pcm_NG', $('Pidgin'))
                ],
                next: function(choice) {
                    return self.im.user
                        .set_lang(choice.value)
                        .then(function() {
                            return 'state_change_msg_language_confirm';
                        });
                }
            });
        });

        // EndState st-12
        self.add('state_change_msg_language_confirm', function(name) {
            return new EndState(name, {
                text: get_content(name),
                next: 'state_start'
            });
        });

    // optout states

        // ChoiceState st-13
        self.add('state_optout_reason', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
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
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
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
            return new EndState(name, {
                text: get_content(name),
                next: 'state_start'
            });
        });

        // ChoiceState st-16
        self.add('state_optout_receiver', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
                choices: [
                    new Choice('mother', $("Mother messages")),
                    new Choice('household', $("Household messages")),
                    new Choice('all', $("All messages"))
                ],
                next: 'state_end_optout'
            });
        });

        // EndState st-17
        self.add('state_end_optout', function(name) {
            return new EndState(name, {
                text: get_content(name),
                next: 'state_start'
            });
        });

        // EndState st-21
        self.add('state_end_loss', function(name) {
            return new EndState(name, {
                text: get_content(name),
                next: 'state_start'
            });
        });

    // general end state

        // EndState st-18
        self.add('state_end_exit', function(name) {
            return new EndState(name, {
                text: get_content(name),
                next: 'state_start'
            });
        });
    });

    return {
        GoApp: GoApp
    };
}();
