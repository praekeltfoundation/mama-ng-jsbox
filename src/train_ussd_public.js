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

        var questions = {
            "state_timed_out":
                $("You have an incomplete registration. Would you like to continue with this registration?"),
            "state_msisdn_permission":
                $("Do you have permission to manage the number {{msisdn}}?"),
            "state_msisdn_no_permission":  // unnamed state on flow diagram
                $("We're sorry, you do not have permission to update the preferences for this number."),
            "state_language":
                $("Welcome to Hello Mama training line. Please choose your language."),
            "state_registered_msisdn":
                $("Please enter the number which is registered to receive messages. For example, 0803304899"),
            "state_main_menu":
                $("Select:"),
            "state_main_menu_household":
                $("Select:"),
            "state_msisdn_not_recognised":  // st-F
                $("We do not recognise this number. Please dial from the registered number or sign up with your local Community Health Extension worker."),
            "state_already_registered_baby":
                $("You are already registered for baby messages."),
            "state_new_registration_baby":
                $("Thank you. You will now receive messages about caring for the baby"),
            "state_change_menu_sms":
                $("Please select an option:"),
            "state_voice_days":
                $("We will call twice a week. On what days would you like to receive messages?"),
            "state_voice_times":
                $("At what time would you like to receive these calls?"),
            "state_end_voice_confirm":
                null,  // not currently in use
                // ("Thank you. You will now start receiving voice calls on {{days}} between {{times}}"),
            "state_change_menu_voice":
                $("Please select an option:"),
            "state_end_sms_confirm":
                $("Thank you. You will now receive text messages."),
            "state_new_msisdn":
                $("Please enter the new mobile number you would like to receive messages on."),
            "state_number_in_use":
                $("Sorry, this number is already registered. They must opt-out before registering again."),
            "state_msg_receiver":
                $("Who will receive these messages?"),
            "state_end_number_change":
                $("Thank you. The number which receives messages has been updated."),
            "state_msg_language":
                $("What language would you like to receive these messages in?"),
            "state_msg_language_confirm":
                $("Thank you. You language has been updated and you will start to receive messages in this language."),
            "state_optout_reason":
                $("Please tell us why you no longer want to receive messages so we can help you further"),
            "state_loss_subscription":
                $("We are sorry for your loss. Would the mother like to receive a small set of free messages from Hello Mama that could help during this difficult time?"),
            "state_end_loss_subscription_confirm":
                $("Thank you. You will now receive messages to support you during this difficult time."),
            "state_optout_receiver":
                $("Which messages would you like to stop receiving?"),
            "state_end_optout":
                $("Thank you. You will no longer receive messages"),
            "state_end_loss":
                $("We are sorry for your loss. You will no longer receive messages. Should you need support during this difficult time, please contact your local CHEW."),
            "state_end_exit":
                $("Thank you for using the Hello Mama service")
        };

        var state_error_types = {
            "invalid_selection": "Sorry, invalid option.",
            "invalid_number": "Sorry, invalid number."
        };

        var errors = {
            "state_registered_msisdn":
                $("{{error}} Please enter the number which is registered to receive messages.")
                    .context({error: state_error_types.invalid_number}),
            "state_msisdn_permission":
                $("{{error}} Do you have permission to manage the number {{msisdn}}?"),
            "state_language":
                $("{{error}} Welcome to Hello Mama training line. Please choose your language")
                    .context({error: state_error_types.invalid_selection}),
            "state_main_menu":
                $("{{error}} Select:")
                    .context({error: state_error_types.invalid_selection}),
            "state_main_menu_household":
                $("{{error}} Select:")
                    .context({error: state_error_types.invalid_selection}),
            "state_change_menu_sms":
                $("{{error}} Please select an option:")
                    .context({error: state_error_types.invalid_selection}),
            "state_voice_days":
                $("{{error}} We will call twice a week. On what days would you like to receive messages?")
                    .context({error: state_error_types.invalid_selection}),
            "state_voice_times":
                $("{{error}} At what time would you like to receive these calls?")
                    .context({error: state_error_types.invalid_selection}),
            "state_change_menu_voice":
                $("{{error}} Please select an option:")
                    .context({error: state_error_types.invalid_selection}),
            "state_new_msisdn":
                $("{{error}} Please enter the new mobile number you would like to receive messages on.")
                    .context({error: state_error_types.invalid_number}),
            "state_number_in_use":
                $("{{error}} Sorry this number is already registered. You must opt-out before registering again.")
                    .context({error: state_error_types.invalid_selection}),
            "state_msg_language":
                $("{{error}} What language would you like to receive these messages in?")
                    .context({error: state_error_types.invalid_selection}),
            "state_optout_reason":
                $("{{error}} Please tell us why you no longer want to receive messages so we can help you further")
                    .context({error: state_error_types.invalid_selection}),
            "state_loss_subscription":
                $("{{error}} We are sorry for your loss. Would you like to receive a small set of free messages from Hello Mama that could help during this difficult time?")
                    .context({error: state_error_types.invalid_selection}),
            "state_optout_receiver":
                $("{{error}} Which messages would you like to stop receiving?")
                    .context({error: state_error_types.invalid_selection}),
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
                question: questions[name],
                choices: [
                    new Choice('eng_NG', $("English")),
                    new Choice('ibo_NG', $("Igbo")),
                    new Choice('pcm_NG', $('Pidgin'))
                ],
                error: errors[name],
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
                question: questions[name],
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return errors[name];
                    }
                },
                next: 'state_main_menu'
            });
        });

        // ChoiceState st-A
        self.add('state_main_menu', function(name) {
            return new ChoiceState(name, {
                question: questions[name],
                choices: [
                    new Choice('state_new_registration_baby', $("Start Baby messages")),
                    new Choice('state_change_menu_sms', $("Change message preferences")),
                    new Choice('state_new_msisdn', $("Change my number")),
                    new Choice('state_msg_language', $("Change language")),
                    new Choice('state_optout_reason', $("Stop receiving messages"))
                ],
                error: errors[name],
                next: function(choice) {
                    return choice.value;
                }
            });
        });


    // BABY CHANGE STATES

        // EndState st-02
        self.add('state_new_registration_baby', function(name) {
            return new EndState(name, {
                text: questions[name],
                next: 'state_start'
            });
        });


    // MSG CHANGE STATES

        // ChoiceState st-03
        self.add('state_change_menu_sms', function(name) {
            return new ChoiceState(name, {
                question: questions[name],
                error: errors[name],
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
                question: questions[name],
                error: errors[name],
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
                question: questions[name],
                error: errors[name],
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
                question: questions[name],
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return errors[name];
                    }
                },
                next: 'state_end_number_change'
            });
        });

        // EndState st-10
        self.add('state_end_number_change', function(name) {
            return new EndState(name, {
                text: questions[name],
                next: 'state_start'
            });
        });


    // LANGUAGE CHANGE STATES

        // ChoiceState st-11
        self.add('state_msg_language', function(name) {
            return new ChoiceState(name, {
                question: questions[name],
                error: errors[name],
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
                text: questions[name],
                next: 'state_start'
            });
        });


    // OPTOUT STATES

        // ChoiceState st-13
        self.add('state_optout_reason', function(name) {
            return new ChoiceState(name, {
                question: questions[name],
                error: errors[name],
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
                question: questions[name],
                error: errors[name],
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
                text: questions[name],
                next: 'state_start'
            });
        });

        // ChoiceState st-16
        self.add('state_optout_receiver', function(name) {
            return new ChoiceState(name, {
                question: questions[name],
                error: errors[name],
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
                text: questions[name],
                next: 'state_start'
            });
        });

        // EndState st-21
        self.add('state_end_loss', function(name) {
            return new EndState(name, {
                text: questions[name],
                next: 'state_start'
            });
        });


    // GENERAL END STATE

        // EndState st-18
        self.add('state_end_exit', function(name) {
            return new EndState(name, {
                text: questions[name],
                next: 'state_start'
            });
        });

    });

    return {
        GoApp: GoApp
    };
}();
