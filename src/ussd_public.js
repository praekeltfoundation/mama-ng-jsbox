go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;


    var GoFC = App.extend(function(self) {
        App.call(self, 'state_start');
        var $ = self.$;
        var interrupt = true;

        self.init = function() {};


    // TEXT CONTENT

        var questions = {
            "state_timed_out":
                "You have an incomplete registration. Would you like to continue with this registration?",
            "state_msisdn_permission":  //st-B
                "Welcome to Hello Mama. Do you have permission to manage the number [MSISDN]?",
            "state_msisdn_no_permission":  // unnamed state on flow diagram
                "We're sorry, you do not have permission to update the preferences for this subscriber.",
            "state_language":   // st-D
                "Welcome to Hello Mama. Please choose your language",
            "state_registered_msisdn":  // st-C
                "Please enter the number which is registered to receive messages. For example, 0803304899",
            "state_main_menu":  // st-A
                "Select:",
            "state_main_menu_household": // st-A1
                "Select:",
            "state_msisdn_not_recognised":  // st-F
                "We do not recognise this number. Please dial from the registered number or sign up with your local Community Health Extension worker.",
            "state_already_registered_baby":
                "You are already registered for baby messages.",
            "state_new_registeration_baby":
                "Thank you. You will now receive messages about caring for baby",
            "state_change_menu_sms":
                "Please select what you would like to do:",
            "state_voice_days":
                "We will call twice a week. On what days would the person like to receive messages?",
            "state_voice_times":
                "Thank you. At what time would they like to receive these calls?",
            "state_voice_confirm":
                "Thank you. You will now start receiving voice calls between [time] on [days].",
            "state_change_menu_voice":
                "Please select what you would like to do:",
            "state_sms_confirm":
                "Thank you. You will now receive text messages.",
            "state_new_msisdn":
                "Please enter the new mobile number you would like to receive weekly messages on. For example, 0803304899",
            "state_number_in_use":
                "Sorry, this number is already registered. They must opt-out before they can register again.",
            "state_msg_receiver":
                "Who will receive these messages?",
            "state_end_number_change":
                "Thank you. The number which receives messages has been updated.",
            "state_msg_language":
                "What language would this person like to receive these messages in?",
            "state_msg_language_confirm":
                "Thank you. You language preference has been updated and you will start to receive messages in this language.",
            "state_optout_reason":
                "Please tell us why you no longer want to receive messages so we can help you further.",
            "state_loss_subscription":
                "We are sorry for your loss. Would you like to receive a small set of free messages from Hello Mama that could help you in this difficult time?",
            "state_loss_subscription_confirm":
                "Thank you. You will now receive messages to support you during this difficult time.",
            "state_optout_receiver":
                "Who would you like to stop receiving messages?",
            "state_end_optout":
                "Thank you. You will no longer receive messages",
            "state_end_exit":
                "Thank you for using the Hello Mama service"
        };

        var errors = {
            "state_registered_msisdn":
                "Mobile number not registered."
        };

        get_error_text = function(name) {
            return errors[name] || "Sorry not a valid input. " + questions[name];
        };



    // TIMEOUT HANDLING

        // override normal state adding
        self.add = function(name, creator) {
            self.states.add(name, function(name, opts) {
                if (!interrupt || !go.utils_project.timed_out(self.im))
                    return creator(name, opts);
                interrupt = false;
                opts = opts || {};
                opts.name = name;
                // Prevent previous content being passed to next state
                self.im.msg.content = null;
                return self.states.create('state_msisdn_permission', opts);
            });
        };

    // START STATE

        // ROUTING
        self.states.add('state_start', function() {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return go.utils
                .get_or_create_identity({'msisdn': self.im.user.addr}, self.im, null)
                .then(function(user) {
                    self.im.user.set_answer('user_id', user.id);
                    if (user.details.receiver_role) {
                        self.im.user.set_answer('role_player', user.details.receiver_role);
                        return self.states.create('state_msisdn_permission');
                    } else {
                        self.im.user.set_answer('role_player', 'guest');
                        return self.states.create('state_language');
                    }
                });
        });


    // INITIAL STATES

        // ChoiceState st-B
        self.add('state_msisdn_permission', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('state_check_receiver_role', $("Yes")),
                    new Choice('state_msisdn_no_permission', $("No")),
                    new Choice('state_registered_msisdn', $("Change the number I'd like to manage"))
                ],
                error: $(get_error_text(name)),
                next: function(choice) {
                    if (choice.value === 'state_check_receiver_role') {
                        self.im.user.set_answer('contact_id', self.im.user.answers.user_id);
                    }
                    return choice.value;
                }
            });
        });

        // unnamed on flow diagram
        self.add('state_msisdn_no_permission', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });

        // ChoiceState st-D
        self.add('state_language', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('english', $("English")),
                    new Choice('hausa', $("Hausa")),
                    new Choice('igbo', $("Igbo")),
                    new Choice('pidgin', $('Pidgin')),
                    new Choice('yoruba', $('Yoruba'))
                ],
                error: $(get_error_text(name)),
                next: 'state_registered_msisdn'
            });
        });

        // FreeText st-C
        self.add('state_registered_msisdn', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
                    }
                },
                next: 'state_check_registered'
            });
        });

        // Interstitial - determine contact registration
        self.states.add('state_check_registered', function() {
            var msisdn = go.utils.normalize_msisdn(
                self.im.user.answers.state_registered_msisdn,
                self.im.config.country_code
            );
            return go.utils
                .get_identity_by_address({'msisdn': msisdn}, self.im)
                .then(function(contact) {
                    if (contact.details.receiver_role) {
                        self.im.user.set_answer('role_player', contact.details.receiver_role);
                        self.im.user.set_answer('contact_id', contact.id);
                        return self.states.create('state_check_receiver_role');
                    } else {
                        return self.states.create('state_msisdn_not_recognised');
                    }
                });
        });

        // EndState st-F
        self.add('state_msisdn_not_recognised', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });

        // Interstitial - before main menu
        self.add('state_check_receiver_role', function(name) {
            var role = self.im.user.answers.role_player;
            var contact_id = self.im.user.answers.contact_id;
            if (role === 'mother') {
                self.im.user.set_answer('mother_id', contact_id);
                self.im.user.set_answer('receiver_id', 'none');
                return self.states.create('state_main_menu');
            } else {
                // lookup contact so we can get the link to the mother
                return go.utils
                    .get_identity(contact_id, self.im)
                    .then(function(contact) {
                        self.im.user.set_answer('receiver_id', contact.id);
                        self.im.user.set_answer('mother_id', contact.details.linked_to);
                        if (contact.details.household_msgs_only) {
                            self.im.user.set_answer('receiver_household_only', true);
                            return self.states.create('state_main_menu_household');
                        } else {
                            return self.states.create('state_main_menu');
                        }
                    });
            }
        });

        // ChoiceState st-A
        self.add('state_main_menu', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('state_check_baby_subscription', $("Start Baby messages")),
                    new Choice('state_check_msg_type', $("Change message preferences")),
                    new Choice('state_new_msisdn', $("Change my number")),
                    new Choice('state_msg_language', $("Change language")),
                    new Choice('state_optout_reason', $("Stop receiving messages"))
                ],
                error: $(get_error_text(name)),
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // ChoiceState st-A1
        self.add('state_main_menu_household', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('state_check_baby_subscription', $("Start Baby messages")),
                    new Choice('state_new_msisdn', $("Change my number")),
                    new Choice('state_msg_language', $("Change language")),
                    new Choice('state_optout_reason', $("Stop receiving messages"))
                ],
                error: $(get_error_text(name)),
                next: function(choice) {
                    return choice.value;
                }
            });
        });


    // BABY CHANGE STATES

        // Interstitials
        self.add('state_check_baby_subscription', function(name) {
            return go.utils_project
                .check_baby_subscription(self.im.user.addr)
                .then(function(isSubscribed) {
                    if (isSubscribed) {
                        return self.states.create('state_already_registered_baby');
                    } else {
                        return self.states.create('state_new_registeration_baby');
                    }
                });
        });

        // ChoiceState st-01
        self.add('state_already_registered_baby', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('state_check_receiver_role', $("Back to main menu")),
                    new Choice('state_end_exit', $("Exit"))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // EndState st-02
        self.add('state_new_registeration_baby', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });


    // MSG CHANGE STATES

        self.add('state_check_msg_type', function(name) {
            return go.utils_project
                .check_msg_type(self.im.user.addr)
                .then(function(msgType) {
                    if (msgType === 'sms') {
                        return self.states.create('state_change_menu_sms');
                    } else if (msgType === 'voice') {
                        return self.states.create('state_change_menu_voice');
                    } else {
                        return self.state.create('state_end_exit');
                    }
                });
        });

        // ChoiceState st-03
        self.add('state_change_menu_sms', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
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
                question: $(questions[name]),
                error: $(get_error_text(name)),
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
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('9_11', $("Between 9-11am")),
                    new Choice('2_5', $("Between 2-5pm"))
                ],
                next: 'state_voice_confirm'
            });
        });

        // EndState st-06
        self.add('state_voice_confirm', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });

        // ChoiceState st-07
        self.add('state_change_menu_voice', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('state_voice_days', $("Change the day and time I receive messages")),
                    new Choice('state_sms_confirm', $("Change from voice to text messages")),
                    new Choice('state_check_receiver_role', $("Back to main menu"))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // EndState st-08
        self.add('state_sms_confirm', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });


    // NUMBER CHANGE STATES

        // FreeText st-09
        self.add('state_new_msisdn', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
                    }
                },
                next: function(content) {
                    var msisdn = go.utils.normalize_msisdn(
                        content, self.im.config.country_code);
                    return go.utils
                        .get_identity_by_address({'msisdn': msisdn}, self.im)
                        .then(function(identity) {
                            if (identity && identity.details && identity.details.receiver_role) {
                                return 'state_number_in_use';
                            } else {
                                return {
                                    'name': 'state_update_number',
                                    'creator_opts': {'new_msisdn': msisdn}
                                };
                            }
                        });
                }
            });
        });

        // ChoiceState
        self.add('state_number_in_use', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('state_new_msisdn', $("Try a different number")),
                    new Choice('state_end_exit', $("Exit"))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // Interstitial
        self.add('state_update_number', function(name, creator_opts) {
            return go.utils
                .get_identity(self.im.user.answers.contact_id, self.im)
                .then(function(contact) {
                    // TODO #70: Handle multiple addresses, currently overwrites existing
                    // on assumption we're dealing with one msisdn only
                    contact.details.addresses.msisdn = {};
                    contact.details.addresses.msisdn[creator_opts.new_msisdn] = {};
                    return go.utils
                        .update_identity(self.im, contact)
                        .then(function() {
                            return self.states.create('state_end_number_change');
                        });
                });
        });

        // EndState st-10
        self.add('state_end_number_change', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });


    // LANGUAGE CHANGE STATES

        // ChoiceState st-11
        self.add('state_msg_language', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('english', $("English")),
                    new Choice('hausa', $("Hausa")),
                    new Choice('igbo', $("Igbo")),
                    new Choice('pidgin', $('Pidgin')),
                    new Choice('yoruba', $('Yoruba'))
                ],
                next: 'state_msg_language_confirm'
            });
        });

        // EndState st-12
        self.add('state_msg_language_confirm', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });


    // OPTOUT STATES

        // ChoiceState st-13
        self.add('state_optout_reason', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('state_loss_subscription', $("Mother miscarried")),
                    new Choice('state_loss_subscription', $("Baby stillborn")),
                    new Choice('state_loss_subscription', $("Baby passed away")),
                    new Choice('state_optout_receiver', $("Messages not useful")),
                    new Choice('state_optout_receiver', $("Other"))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // ChoiceState st-14
        self.add('state_loss_subscription', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('yes', $("Yes")),
                    new Choice('no', $("No"))
                ],
                next: function(choice) {
                    if(choice.value === 'yes') {
                        return 'state_loss_subscription_confirm';
                    }
                    else {
                        return 'state_end_optout';
                    }
                }
            });
        });

        // EndState st-15
        self.add('state_loss_subscription_confirm', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });

        // ChoiceState st-16
        self.add('state_optout_receiver', function(name) {
            var role = go.utils_project.check_role(self.im.user.addr);
            if (role === 'father_role') {
                return new ChoiceState(name, {
                    question: $(questions[name]),
                    error: $(get_error_text(name)),
                    choices: [
                        new Choice('me', $("Only me")),
                        new Choice('father_mother', $("The Father and the Mother"))
                    ],
                    next: function(choice) {
                        switch (choice.value) {
                            case 'me':  // deliberate fall-through to default
                            case 'father_mother':
                                return 'state_end_optout';
                        }
                    }
                });
            }
            else {
                return new ChoiceState(name, {
                    question: $(questions[name]),
                    error: $(get_error_text(name)),
                    choices: [
                        new Choice('me', $("Only me")),
                        new Choice('father', $("The Father")),
                        new Choice('father_mother', $("The Father and the Mother"))
                    ],
                    next: function(choice) {
                        switch (choice.value) {
                            case 'me':  // deliberate fall-through to default
                            case 'father':
                            case 'father_mother':
                                return 'state_end_optout';
                        }
                    }
                });
            }
        });

        // EndState st-17
        self.add('state_end_optout', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });


    // GENERAL END STATE

        // EndState st-18
        self.add('state_end_exit', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });

    });

    return {
        GoFC: GoFC
    };
}();
