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

    // START STATE

        // ROUTING

        self.states.add('state_start', function() {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return self.im.user
                .set_lang(self.im.config.default_language)
                .then(function() {
                    return self.states.create("state_msg_receiver_msisdn");
                });
        });

        // A loopback state that is required since you can't pass opts back
        // into the same state
        self.add('state_retry', function(name, opts) {
            return self.states.create(opts.retry_state, {'retry': true});
        });

    // INITIAL STATES

        // FreeText st-B
        self.add('state_msg_receiver_msisdn', function(name, creator_opts) {
            var speech_option = '1';
            var question_text = 'Welcome, Number';
            var retry_text = 'Retry. Welcome, Number';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            return new FreeText(name, {
                question: $(use_text),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return 'state_main_menu';
                    } else {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    }
                }
            });
        });

        // ChoiceState st-A
        self.add('state_main_menu', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Choose:'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                choices: [
                    new Choice('state_baby_confirm_subscription', $('baby')),
                    new Choice('state_change_menu_sms', $('preferences')),
                    new Choice('state_new_msisdn', $('number')),
                    new Choice('state_msg_language', $('language')),
                    new Choice('state_optout_reason', $('optout'))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

    // BABY CHANGE STATES

        // ChoiceState st-1A
        self.add('state_baby_confirm_subscription', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Confirm baby?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                choices: [
                    new Choice('confirm', $('To confirm press 1. To go back to main menu, 0 then #'))
                ],
                next: function(choice) {
                    return 'state_end_baby';
                }
            });
        });

        // EndState st-02
        self.add('state_end_baby', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you - baby'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                next: 'state_start'
            });
        });

    // MSG CHANGE STATES

        // ChoiceState st-03
        self.add('state_change_menu_sms', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Please select what you would like to do:'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
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
                    self.im, name, self.im.user.lang, speech_option),
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
                    self.im, name, self.im.user.lang, speech_option),
                choices: [
                    new Choice('9_11', $('9-11am')),
                    new Choice('2_5', $('2-5pm'))
                ],
                next: function(choice) {
                    return 'state_end_voice_confirm';
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
                    self.im, name, self.im.user.lang, speech_option),
                next: 'state_start'
            });
        });

    // NUMBER CHANGE STATES

        // FreeText st-09
        self.add('state_new_msisdn', function(name, creator_opts) {
            var speech_option = 1;
            var question_text = 'Please enter new mobile number';
            var retry_text = 'Invalid number. Try again. Please enter new mobile number';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            return new FreeText(name, {
                question: $(use_text),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (!go.utils.is_valid_msisdn(content)) {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    }
                    return 'state_end_new_msisdn';
                }
            });
        });

        // EndState st-10
        self.add('state_end_new_msisdn', function(name) {
            var speech_option = 1;
            return new EndState(name, {
                text: $('Thank you. Mobile number changed.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                next: 'state_start'
            });
        });

    // LANGUAGE CHANGE STATES

        // ChoiceState st-11
        self.add('state_msg_language', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Language?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                choices: [
                    new Choice('eng_NG', $('English')),
                    new Choice('ibo_NG', $('Igbo')),
                    new Choice('pcm_NG', $('Pidgin'))
                ],
                next: function(choice) {
                    return self.im.user
                        .set_lang(choice.value)
                        .then(function() {
                            return 'state_end_msg_language_confirm';
                        });
                }
            });
        });

        // EndState st-12
        self.add('state_end_msg_language_confirm', function(name) {
            var speech_option = 1;
            return new EndState(name, {
                text: $('Thank you. Language preference updated.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                next: 'state_start'
            });
        });

    // OPTOUT STATES

        // ChoiceState st-13
        self.add('state_optout_reason', function(name) {
            var speech_option = '1';

            return new ChoiceState(name, {
                question: $('Optout reason?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
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
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Receive loss messages?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
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
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you. You will now receive messages to support you during this difficult time.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                next: 'state_start'
            });
        });

        // ChoiceState st-16
        self.add('state_optout_receiver', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Which messages to opt-out on?'),
                error: $("Invalid input. Which message to opt-out on?"),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                choices: [
                    new Choice('mother', $("Mother messages")),
                    new Choice('household', $("Household messages")),
                    new Choice('all', $("All messages"))
                ],
                next: function(choice) {
                    return 'state_end_optout';
                }
            });
        });

        // EndState st-17
        self.add('state_end_optout', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you - optout'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                next: 'state_start'
            });
        });

        // EndState st-21
        self.add('state_end_loss', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('We are sorry for your loss. You will no longer receive messages.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                next: 'state_start'
            });
        });

    // GENERAL END STATE

        // EndState st-22
        self.add('state_end_exit', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you for using the Hello Mama service. Goodbye.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                next: 'state_start'
            });
        });

    });

    return {
        GoApp: GoApp
    };
}();
