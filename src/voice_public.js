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

    // ROUTING

        self.states.add('state_start', function() {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return self.im
                .log('Starting for identity: ' + self.im.user.addr)
                .then(function () {
                    return go.utils.get_or_create_identity({'msisdn': self.im.user.addr}, self.im, null);
                })
                .then(function(user) {
                    self.im.user.set_answer('user_id', user.id);
                    if (user.details.receiver_role) {
                        self.im.user.set_answer('role_player', user.details.receiver_role);
                    } else {
                        self.im.user.set_answer('role_player', 'guest');
                    }

                    return self.states.create("state_msg_receiver_msisdn");
                });
        });

        // A loopback state that is required since you can't pass opts back
        // into the same state
        self.add('state_retry', function(name, opts) {
            return self.states.create(opts.retry_state, {'retry': true});
        });

    // CHANGE STATE

        // FreeText st-B
        self.add('state_msg_receiver_msisdn', function(name, creator_opts) {
            var speech_option = '1';
            var question_text = 'Welcome, Number';
            var retry_text = 'Retry. Welcome, Number';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            return new FreeText(name, {
                question: $(use_text),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return 'state_check_registered';
                    } else {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    }
                }
            });
        });

        // Interstitial - determine contact registration
        self.states.add('state_check_registered', function() {
            var msisdn = go.utils.normalize_msisdn(
                self.im.user.answers.state_msg_receiver_msisdn,
                self.im.config.country_code
            );
            return go.utils
                .get_identity_by_address({'msisdn': msisdn}, self.im)
                .then(function(contact) {
                    if (contact && contact.details.receiver_role) {
                        self.im.user.set_answer('role_player', contact.details.receiver_role);
                        self.im.user.set_answer('contact_id', contact.id);
                        return self.states.create('state_check_receiver_role');
                    } else {
                        return self.states.create('state_msisdn_not_recognised');
                    }
                });
        });

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

        // ChoiceState st-B
        self.add('state_msisdn_not_recognised', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Number not recognised.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('state_msg_receiver_msisdn', $('If you entered the incorrect number, press 1')),
                    new Choice('state_end_exit', $('to exit, press 2'))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // EndState st-22
        self.add('state_end_exit', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you for using the Hello Mama service. Goodbye.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        // ChoiceState st-A
        self.add('state_main_menu', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Choose:'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('state_baby_check', $('baby')),
                    new Choice('state_voice_days', $('preferences')),
                    new Choice('state_new_msisdn', $('number')),
                    new Choice('state_msg_language', $('language')),
                    new Choice('state_optout_reason', $('optout'))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

       // ChoiceState st-A1
        self.add('state_main_menu_household', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Choose:'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('state_baby_check', $('baby')),
                    new Choice('state_new_msisdn', $('number')),
                    new Choice('state_msg_language', $('language')),
                    new Choice('state_optout_reason', $('optout'))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        self.add('state_baby_check', function(name) {
            return go.utils_project
                .check_baby_subscription(self.im.user.addr)
                .then(function(isSubscribed) {
                    if (isSubscribed) {
                        return self.states.create('state_baby_already_subscribed');
                    } else {
                        return self.states.create('state_baby_confirm_subscription');
                    }
               });
        });

        // FreeText st-01
        self.add('state_baby_already_subscribed', function(name) {
            var speech_option = 1;
            return new FreeText(name, {
                question: $('You are already subscribed. To go back to main menu, 0 then #'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_main_menu'   // TODO: add input logic to go back to main menu
            });
        });

        // ChoiceState st-1A
        self.add('state_baby_confirm_subscription', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Confirm baby?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('confirm', $('To confirm press 1. To go back to main menu, 0 then #'))
                ],
                next: 'state_baby_save'
            });
        });

        // interstitial to save subscription to baby messages
        self.add('state_baby_save', function(name) {
            return go.utils_project
                .switch_to_baby(self.im)
                .then(function() {
                    return self.states.create('state_end_baby');
                });
        });

        // EndState st-02
        self.add('state_end_baby', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you - baby'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        // interstitial to check what type of messages the user is registered for
        self.add('state_msg_type_check', function(name) {
            return go.utils_project
                .check_msg_type(self.im)
                .then(function(messageType) {
                    if (messageType == "sms") {
                        return self.states.create('state_sms_menu');
                    } else {   // is subscribed for voice messages
                        return self.states.create('state_voice_menu');
                    }
                });
        });

        // ChoiceState st-03
        self.add('state_sms_menu', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('What would you like to do?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('change', $('Change from text to voice')),
                    new Choice('back', $('Go back to main menu, press 0 then #')),
                ],
                next: 'state_voice_days'
            });
        });

        // ChoiceState st-04
        self.add('state_voice_days', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Message days?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('mon_wed', $('mon_wed')),
                    new Choice('tue_thu', $('tue_thu'))
                ],
                next: 'state_voice_times'
            });
        });

        // ChoiceState st-05
        self.add('state_voice_times', function(name) {
            var days = self.im.user.answers.state_voice_days;
            var speech_option = go.utils_project.get_speech_option_days(days);

            return new ChoiceState(name, {
                question: $('Message times?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('9_11', $('9_11')),
                    new Choice('2_5', $('2_5'))
                ],
                next: 'state_voice_save'
            });
        });

        // interstitial to save subscription to baby messages
        /*self.add('state_voice_save', function(name) {
            return go.utils_project
                .update_identity ...?
                .then(function() {
                    return self.states.create('state_end_voice');
                });
        });*/

        // EndState st-06
        self.add('state_end_msg_times', function(name) {
            var days = self.im.user.answers.state_voice_days;
            var time = self.im.user.answers.state_voice_times;
            var speech_option = go.utils_project.get_speech_option_days_time(days, time);

            return new EndState(name, {
                text: $('Thank you! Time: {{ time }}. Days: {{ days }}.'
                    ).context({ time: time, days: days }),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        // ChoiceState st-07
        self.add('state_voice_menu', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('What would you like to do?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('change', $('Change times')),
                    new Choice('change', $('Change from voice to text')),
                    new Choice('back', $('Go back to main menu, press 0 then #'))
                ],
                next: 'state_baby_save'
            });
        });

        // FreeText st-09
        self.add('state_new_msisdn', function(name) {
            var speech_option = 1;
            return new FreeText(name, {
                question: $('Please enter new mobile number'),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $("Invalid number. Try again. Please enter new mobile number");
                    }
                },
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
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

        // ChoiceState st-22
        self.add('state_number_in_use', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $("Sorry, this number is already registered"),
                error: $("Invalid input."),
                choices: [
                    new Choice('state_new_msisdn', $("To try a different number, press 1")),
                    new Choice('state_end_exit', $("To exit, press 2"))
                ],
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
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
                            return self.states.create('state_end_new_msisdn');
                        });
                });
        });

        // EndState st-10
        self.add('state_end_new_msisdn', function(name) {
            var speech_option = 1;
            return new EndState(name, {
                text: $('Thank you. Mobile number changed.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        // ChoiceState st-11
        self.add('state_msg_language', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Language?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('english', $('English')),
                    new Choice('hausa', $('Hausa')),
                    new Choice('igbo', $('Igbo')),
                    new Choice('pidgin', $('Pidgin')),
                    new Choice('yoruba', $('Yoruba'))
                ],
                next: 'state_end_msg_language'
            });
        });

        // EndState st-12
        self.add('state_end_msg_language', function(name) {
            var speech_option = 1;
            return new EndState(name, {
                text: $('Thank you. Language preference updated.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        self.add('state_optout_reason', function(name) {
            var speech_option = '1';
            var routing = {
                'miscarriage': 'state_loss_opt_in',
                'stillborn': 'state_loss_opt_in',
                'baby_died': 'state_loss_opt_in',
                'not_useful': 'state_optin_deny',
                'other': 'state_optin_deny'
            };
            return new ChoiceState(name, {
                question: $('Optout reason?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('miscarriage', $('miscarriage')),
                    new Choice('stillborn', $('stillborn')),
                    new Choice('baby_died', $('baby_died')),
                    new Choice('not_useful', $('not_useful')),
                    new Choice('other', $('other'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.add('state_loss_opt_in', function(name) {
            var speech_option = '1';
            var routing = {
                'opt_in_confirm': 'state_optin_confirm',
                'opt_in_deny': 'state_optin_deny'
            };
            return new ChoiceState(name, {
                question: $('Receive loss messages?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('opt_in_confirm', $('opt_in_confirm')),
                    new Choice('opt_in_deny', $('opt_in_deny'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.add('state_optin_confirm', function(name) {
            return go.utils_project
                .optout_loss_opt_in(self.im)
                .then(function() {
                    return self.states.create('state_end_loss_opt_in');
                });
        });

        self.add('state_end_loss_opt_in', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you - loss opt in'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        self.add('state_optin_deny', function(name) {
            return go.utils_project
                .optout(self.im)
                .then(function() {
                    return self.states.create('state_end_optout');
                });
        });

        self.add('state_end_optout', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you - optout'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        self.add('state_end_not_active', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('No active subscriptions'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

    });

    return {
        GoApp: GoApp
    };
}();
