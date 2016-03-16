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
                    var state_to_restart_from = self.im.user.answers.receiver_household_only
                        ? 'state_main_menu_household'
                        : 'state_main_menu';
                    return self.states.create(state_to_restart_from, pass_opts);  // restarts to either st-A or st-A1
                }

                return creator(name, opts);
            });
        };

    // ROUTING

        self.states.add('state_start', function() {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return self.states.create("state_msg_receiver_msisdn");
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
            return self.im
                .log('Starting for msisdn: ' + msisdn)
                .then(function() {
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
                    new Choice('state_check_msg_type', $('preferences')),
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
                next: function(choice) {
                    return 'state_baby_already_subscribed';
                }
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
                next: function(choice) {
                    return 'state_baby_save';
                }
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
        self.add('state_check_msg_type', function(name) {
            return go.utils_project
                .get_subscription_msg_type(self.im, self.im.user.answers.mother_id)
                .then(function(msg_format) {
                    self.im.user.set_answer('msg_format', msg_format);
                    if (msg_format === 'text') {
                        return self.states.create('state_change_menu_sms');
                    } else if (msg_format === 'audio') {
                        return self.states.create('state_change_menu_voice');
                    } else {
                        return self.states.create('state_end_exit');
                    }
                });
        });

        // ChoiceState st-03
        self.add('state_change_menu_sms', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Please select what you would like to do:'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('change', $('Change from text to voice'))
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
                    new Choice('mon_wed', $('Monday and Wednesday')),
                    new Choice('tue_thu', $('Tuesday and Thursday'))
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
                    new Choice('9_11', $('9-11am')),
                    new Choice('2_5', $('2-5pm'))
                ],
                next: function(choice) {
                    return go.utils_project
                        .update_msg_format_time(
                            self.im,
                            'audio',
                            self.im.user.answers.state_voice_days,
                            choice.value
                        )
                        .then(function() {
                            return 'state_end_voice_confirm';
                        });
                }
            });
        });

        // EndState st-06
        self.add('state_end_voice_confirm', function(name) {
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
        self.add('state_change_menu_voice', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Please select what you would like to do:'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('state_voice_days', $('Change times')),
                    new Choice('state_end_sms_confirm', $('Change mother message from voice to text'))
                ],
                next: function(choice) {
                        if (choice.value !== 'state_end_sms_confirm') {
                            return choice.value;
                        } else {
                            return go.utils_project
                                .update_msg_format_time(
                                    self.im,
                                    'text',
                                    null,
                                    null
                                )
                                .then(function() {
                                    return 'state_end_sms_confirm';
                                });
                        }
                }
            });
        });

        // EndState st-09
        self.add('state_end_sms_confirm', function(name) {
            var speech_option = '1';

            return new EndState(name, {
                text: $('Thank you. You will now receive text messages.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        // FreeText st-09
        self.add('state_new_msisdn', function(name, creator_opts) {
            var speech_option = 1;
            var question_text = 'Please enter new mobile number';
            var retry_text = 'Invalid number. Try again. Please enter new mobile number';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            return new FreeText(name, {
                question: $(use_text),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (!go.utils.is_valid_msisdn(content)) {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    }
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

        // ChoiceState st-13
        self.add('state_optout_reason', function(name) {
            var speech_option = '1';
            var routing = {
                'miscarriage': 'state_loss_opt_in',
                'stillborn': 'state_end_loss',
                'baby_died': 'state_end_loss',
                'not_useful': 'state_check_subscription',
                'other': 'state_check_subscription'
            };
            return new ChoiceState(name, {
                question: $('Optout reason?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('miscarriage', $("Mother miscarried")),
                    new Choice('stillborn', $("Baby stillborn")),
                    new Choice('baby_died', $("Baby passed away")),
                    new Choice('not_useful', $("Messages not useful")),
                    new Choice('other', $("Other"))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        // ChoiceState st-14
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

        // EndState st-21
        self.add('state_end_loss', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('We are sorry for your loss. You will no longer receive messages.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        // interstitial
        self.states.add('state_check_subscription', function() {
            var contact_id = self.im.user.answers.contact_id;
            return go.utils
                .get_identity(contact_id, self.im)
                .then(function(contact) {
                    // household and mother_only subscriptions bypass to end state state_end_optout
                    if (contact.details.household_msgs_only || (self.im.user.mother_id === contact_id && self.im.user.receiver_id === 'none')) {
                        return self.states.create("state_end_optout");
                    } else {
                        return self.states.create("state_optout_receiver");
                    }
                });
        });

        // ChoiceState st-16
        self.add('state_optout_receiver', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Which messages to opt-out on?'),
                error: $("Invalid input. Which message to opt-out on?"),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('mother', $("Mother messages")),
                    new Choice('household', $("Household messages")),
                    new Choice('all', $("All messages"))
                ],
                next: function(choice) {
                        switch (choice.value) {
                            case 'mother':  // deliberate fall-through to default
                            case 'household':
                            case 'all':
                                return 'state_end_optout';
                        }
                }
            });
        });

        // EndState st-17
        self.add('state_end_optout', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you - optout'),
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
