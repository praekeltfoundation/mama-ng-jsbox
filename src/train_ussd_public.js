go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;


    var GoApp = App.extend(function(self) {
        App.call(self, 'state_start');
        var $ = self.$;
        var interrupt = true;

        self.init = function() {};


    // TEXT CONTENT

        var get_content = function(state_name) {
            switch (state_name) {
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
                case "state_voice_days":
                    return $("{{prefix}}We will call twice a week. On what days would you like to receive messages?");
                case "state_voice_times":
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
                case "state_msg_language":
                    return $("{{prefix}}What language would you like to receive these messages in?");
                case "state_msg_language_confirm":
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
            "invalid_selection": "Sorry, invalid option. ",
            "invalid_number": "Sorry, invalid number. "
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
                // Prevent previous content being passed to next state
                self.im.msg.content = null;
                return self.states.create('state_start', opts);
            });
        };


    // START STATE

        // ROUTING
        self.states.add('state_start', function() {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return self.states.create('state_language');
        });


    // INITIAL STATES

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
                    if (go.utils.is_valid_msisdn(content)) {
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
                    new Choice('state_msg_language', $("Change language")),
                    new Choice('state_optout_reason', $("Stop receiving messages"))
                ],
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
                next: function(choice) {
                    return choice.value;
                }
            });
        });


    // BABY CHANGE STATES

        // EndState st-02
        self.add('state_new_registration_baby', function(name) {
            return new EndState(name, {
                text: get_content(name),
                next: 'state_start'
            });
        });


    // MSG CHANGE STATES

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
                        ? 'state_voice_days'
                        : 'state_main_menu';
                }
            });
        });

        // ChoiceState st-04
        self.add('state_voice_days', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
                choices: [
                    new Choice('mon_wed', $("Monday and Wednesday")),
                    new Choice('tue_thu', $("Tuesday and Thursday"))
                ],
                next: 'state_voice_times'
            });
        });

        // ChoiceState st-05
        self.add('state_voice_times', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
                choices: [
                    new Choice('9_11', $("Between 9-11am")),
                    new Choice('2_5', $("Between 2-5pm"))
                ],
                next: function(choice) {
                    return 'state_end_voice_confirm';
                }
            });
        });

        // EndState st-06
        self.add('state_end_voice_confirm', function(name) {
            var days = self.im.user.answers.state_voice_days;
            var times = self.im.user.answers.state_voice_times;
            var text;

            if (days === 'mon_wed') {
                text = times === '9_11'
                    ? $("Thank you. You will now start receiving voice calls on Monday and Wednesday between 9 and 11am")
                    : $("Thank you. You will now start receiving voice calls on Monday and Wednesday between 2 and 5pm");
            } else {  // days === tue_thu
                text = times === '9_11'
                    ? $("Thank you. You will now start receiving voice calls on Tuesday and Thursday between 9 and 11am")
                    : $("Thank you. You will now start receiving voice calls on Tuesday and Thursday between 2 and 5pm");
            }
            return new EndState(name, {
                text: text,
                next: 'state_start'
            });
        });

    // NUMBER CHANGE STATES

        // FreeText st-09
        self.add('state_new_msisdn', function(name) {
            return new FreeText(name, {
                question: get_content(name).context({prefix:""}),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
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


    // LANGUAGE CHANGE STATES

        // ChoiceState st-11
        self.add('state_msg_language', function(name) {
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
                            return 'state_msg_language_confirm';
                        });
                }
            });
        });

        // EndState st-12
        self.add('state_msg_language_confirm', function(name) {
            return new EndState(name, {
                text: get_content(name),
                next: 'state_start'
            });
        });


    // OPTOUT STATES

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


    // GENERAL END STATE

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
