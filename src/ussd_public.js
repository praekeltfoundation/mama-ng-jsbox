go.app = function() {
    var vumigo = require('vumigo_v02');
    //var MetricsHelper = require('go-jsbox-metrics-helper'); //..? unique hello mama id..?
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    //var PaginatedChoiceState = vumigo.states.PaginatedChoiceState;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;


    var GoFC = App.extend(function(self) {
        App.call(self, 'state_start');
        var $ = self.$;
        var interrupt = true;

        self.init = function() {

            // Use the metrics helper to add some metrics
            //mh = new MetricsHelper(self.im);
            //mh
                // Total unique users
            //    .add.total_unique_users('total.ussd.unique_users')

                // Total sessions
            //    .add.total_sessions('total.ussd.sessions');

                // Total times reached state_timed_out
                /*.add.total_state_actions(
                    {
                        state: 'state_timed_out',
                        action: 'enter'
                    },
                    'total.reached_state_timed_out'
                );*/

            // Load self.contact
            return self.im.contacts
                .for_user()
                .then(function(user_contact) {
                   self.contact = user_contact;
                });
        };


    // TEXT CONTENT

        var questions = {
            "state_timed_out":
                "You have an incomplete registration. Would you like to continue with this registration?",
            "state_msisdn_permission":  //B
                "Welcome to Hello Mama. Do you have permission to manage the number [MSISDN]?",
            "state_msisdn_no_permission":
                "We're sorry, you do not have permission to update the preferences for this subscriber.",
            "state_language":   //D
                "Welcome to Hello Mama. Please choose your language",
            "state_msg_registered_msisdn":  //C
                "Please enter the number which is registered to receive messages. For example, 0803304899",
            "state_main_menu":  //A
                "Select:",
            "state_msisdn_not_recognised":  //F
                "We do not recognise this number. Please dial from the registered number or sign up with your local Community Health Extension worker.",
            "state_msg_already_registered_baby":
                "You are already registered for baby messages.",
            "state_msg_new_registeration_baby":
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
            "state_msg_new_msisdn":
                "Please enter the new mobile number you would like to receive weekly messages on. For example, 0803304899",
            "state_msg_receiver":
                "Who will receive these messages?",
            "state_msg_receiver_confirm":
                "Thank you. The number which receives messages has been updated.",
            "state_msg_language":
                "What language would this person like to receive these messages in?",
            "state_msg_language_confirm":
                "Thank you. You language preference has been updated and you will start to receive messages in this language.",
            "state_optout_reason":
                "Please tell us why you no longer want to receive messages so we can help you further.",
            "state_msg_loss_subscription":
                "We are sorry for you loss. Would you like to receive a small set of free messages from Hello Mama that could help in this difficult time?",
            "state_msg_loss_subscription_confirm":
                "Thank you. You will now receive messages to support you during this difficult time.",
            "state_msg_end_subscription":
                "Thank you. You will no longer receive messages",
            "state_end_thank_you":
                "Thank you for using the Hello Mama service",
            "state_end":
                " "
        };

        var errors = {
            "state_msg_registered_msisdn":
                "Mobile number not registered."
        };

        get_error_text = function(name) {
            return errors[name] || "Sorry not a valid input. " + questions[name];
        };



    // TIMEOUT HANDLING

        // override normal state adding
        self.add = function(name, creator) {
            self.states.add(name, function(name, opts) {
                if (!interrupt || !go.utils.should_restart(self.im))
                    return creator(name, opts);
                interrupt = false;
                opts = opts || {};
                opts.name = name;
                // Prevent previous content being passed to next state
                self.im.msg.content = null;  ///????
                return self.states.create('state_start', opts);
            });
        };

    // START STATE

        // ROUTING
        self.states.add('state_start', function() {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return self.states.create("state_msisdn_permission"); //** should be state_check_msisdn
        });

        // Interstitial start state - evaluating whether user is registered
        /*self.add('state_check_msisdn', function(name) {
            return go.utils
                .get_or_create_contact(self.im.user.addr, self.im)
                .then(function(user_id) {
                    return go.utils
                        .is_registered(user_id, self.im)
                        .then(function(recognised) {
                            if (recognised) {
                                return self.states.create('state_msisdn_permission');
                            } else {
                                return self.states.create('state_language');
                            }
                        });
                });
        });*/

        self.add('state_end', function(name) {
            return new EndState(name, {});
        });

    // INITIAL STATES

        // ChoiceState st-B
        self.add('state_msisdn_permission', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('state_main_menu', $("Yes")),
                    new Choice('state_msisdn_no_permission', $("No")),
                    new Choice('state_msg_msisdn', $("Change the number I'd like to manage"))
                  ],
                  error: $(get_error_text(name)),
                  next: function(choice) {
                      return choice.value;
                  }
              });
        });

        self.add('state_msisdn_no_permission', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                //next: 'state_start'
            });
        });

        // ChoiceState st-D
        self.add('state_language', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('english', $("English")),
                    new Choice('hausa', $("Hausa")),
                    new Choice('igbo', $("Igbo"))
                  ],
                  error: $(get_error_text(name)),
                  next: 'state_msg_registered_msisdn'
              });
        });

        // FreeText st-C
        self.add('state_msg_registered_msisdn', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
                    }
                },
                next: 'state_main_menu'//'state_check_msisdn'  // ensure unregistered outcome goes to state F and not loop to state_language again
            });
        });

        // ChoiceState st-A
        self.add('state_main_menu', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('state_check_baby_subscription', $("Start Baby messages")),
                    new Choice('state_check_msg_type', $("Change message preferences")),
                    new Choice('state_msg_msisdn', $("Change my number")),
                    new Choice('state_msg_language', $("Change language")),
                    new Choice('state_optout_reason', $("Stop receiving messages"))
                ],
                error: $(get_error_text(name)),
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // CHANGE STATES

        // Interstitials
        self.add('state_check_baby_subscription', function(name) {
            return go.utils
                .check_baby_subscription(self.im.user.addr)
                .then(function(is_subscribed) {
                    if (is_subscribed) {
                        return self.states.create('state_msg_already_registered_baby');
                    } else {
                        return self.states.create('state_msg_new_registeration_baby');
                    }
                });
        });

        self.add('state_check_msg_type', function(name) {
            return go.utils
                .check_sms_subscription(self.im.user.addr)
                .then(function(is_subscribed) {   //assuming a registered user always has a default subscription
                    if (is_subscribed) {
                        return self.states.create('state_change_menu_sms');
                    } else {
                        return self.states.create('state_change_menu_voice');
                    }
                });
        });

        // ChoiceState st-01
        self.add('state_msg_already_registered_baby', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('state_main_menu', $("Back to main menu")),
                    new Choice('state_end', $("Exit"))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // EndState st-02
        self.add('state_msg_new_registeration_baby', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
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
                    new Choice('', $("Between 9-11am")),
                    new Choice('', $("Between 2-5pm"))
                ],
                next: 'state_voice_confirm'
            });
        });

        // EndState st-06
        self.add('state_voice_confirm', function(name) {
            return new EndState(name, {
                text: $(questions[name])
                //next: 'state_start'
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
                    new Choice('state_main_menu', $("Back to main menu"))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // EndState st-08
        self.add('state_sms_confirm', function(name) {
            return new EndState(name, {
                text: $(questions[name])
                //next: 'state_start'
            });
        });

        // EndState st-13
        self.add('state_end_thank_you', function(name) {
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
