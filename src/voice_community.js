go.app = function() {
    var vumigo = require('vumigo_v02');
    var MetricsHelper = require('go-jsbox-metrics-helper');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;


    var GoApp = App.extend(function(self) {
        App.call(self, 'state_start');
        var $ = self.$;
        var lang = 'eng_NG';

        self.init = function() {
            self.env = self.im.config.env;
            self.metric_prefix = [self.env, self.im.config.name].join('.').replace(/-/g, '_');
            self.store_name = [self.env, self.im.config.name].join('.');

            mh = new MetricsHelper(self.im);
            mh
                .add.total_state_actions(
                    {
                        state: 'state_msg_receiver',
                        action: 'enter'
                    },[self.metric_prefix, "registrations_started"].join('.')
                )
                .add.total_state_actions(
                    {
                        state: 'state_end_voice_corp',
                        action: 'enter'
                    },[self.metric_prefix, "registrations_completed"].join('.')
                )
                .add.total_state_actions(
                    {
                        state: 'state_end_sms_corp',
                        action: 'enter'
                    },[self.metric_prefix, "registrations_completed"].join('.')
                )
                .add.time_between_states(
                    {
                        state: 'state_corp_auth',
                        action: 'enter'
                    },{
                        state: 'state_end_voice_corp',
                        action: 'enter'
                    }, [self.metric_prefix, 'time_to_register'].join('.')
                )
            ;

            // Average time to register - adding extra end state manually
            var time_label = [self.metric_prefix, 'time_to_register'].join('.');
            var time_metadata_label = 'time_between_states_metric_' + time_label;

            self.im.on('state:enter', function(e) {
                // Fire metric with time difference
                if(e.state.name === "state_end_sms_corp") {
                    var time_from = mh._reset_metadata(
                        e.state.im.user, time_metadata_label);
                    return e.state.im.metrics.fire.avg(
                        time_label, Date.now() - time_from);
                }
            });

        };

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
                    return self.states.create('state_msg_receiver', pass_opts);
                }

                return creator(name, pass_opts);
            });
        };

        // START STATE

        self.states.add('state_start', function(name) {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return self.states.create('state_corp_auth');
        });

        // A loopback state that is required since you can't pass opts back
        // into the same state
        self.add('state_retry', function(name, opts) {
            return self.states.create(opts.retry_state, {'retry': true});
        });


        // REGISTRATION STATES

        self.add('state_corp_auth', function(name, creator_opts) {
            var question_text = 'Welcome to Hello Mama! Please enter your unique Community Resource Persons code.';
            var speech_option = '1';
            return new FreeText(name, {
                question: question_text,
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    return go.utils_project
                        .find_corp_with_unique_code(self.im, content)
                        .then(function(corp) {
                            if (corp) {
                                self.im.user.set_answer('operator_id', corp.id);
                                return 'state_msg_receiver';
                            } else {
                                return {
                                    'name': 'state_retry',
                                    'creator_opts': {'retry_state': name}
                                };
                            }
                        });
                }
            });
        });

        self.add('state_msg_receiver', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: 'Choose message receiver',
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('mother_father', $("Mother & Father")),
                    new Choice('mother_only', $("Mother")),
                    new Choice('father_only', $("Father")),
                    new Choice('mother_family', $("Mother & family member")),
                    new Choice('mother_friend', $("Mother & friend")),
                    new Choice('friend_only', $("Friend")),
                    new Choice('family_only', $("Family member"))
                ],
                next: function(choice) {
                    var seperate = ["mother_father", "mother_family", "mother_friend"];
                    if (seperate.indexOf(choice.value) == -1) {
                        // Only one receiver
                        return 'state_msisdn';
                    } else {
                        // Mother and another receiver
                        return 'state_msisdn_mother';
                    }
                }
            });
        });

        self.add('state_msisdn', function(name, creator_opts) {
            var question_text = 'Please enter number';
            var speech_option = go.utils_project.get_speech_option_only(self.im.user.answers.state_msg_receiver);

            return new FreeText(name, {
                question: question_text,
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    } else {
                        var msisdn = go.utils.normalize_msisdn(
                            content, self.im.config.country_code);

                        return go.utils
                            .get_identity_by_address({'msisdn': msisdn}, self.im)
                            .then(function(contact) {
                                if (contact === undefined || contact === null ||
                                        self.im.user.answers.state_msg_receiver != 'mother_only') {
                                    return 'state_save_identities';
                                }

                                return go.utils_project
                                    .check_is_subscribed(
                                        self.im, contact.id, 'public.mother')
                                    .then(function(subscribed) {
                                        if (!subscribed || subscribed == 'no_active_subs_found') {
                                            self.im.user.set_answer('mother_id', contact.id);
                                            self.im.user.set_answer('receiver_id', contact.id);
                                            return self.states.create('state_msg_language');
                                        } else {
                                            self.im.user.set_answer('role_player', contact.details.receiver_role);
                                            self.im.user.set_answer('contact_id', contact.id);
                                            return 'state_msisdn_already_registered';
                                        }
                                    });
                            });
                    }
                }
            });
        });

        self.add('state_msisdn_already_registered', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: 'Sorry, this number is already registered.',
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('msisdn', $("Register a different number")),
                    new Choice('state_msg_receiver', $("Choose a different receiver")),
                    new Choice('exit', $("Exit"))
                ],
                next: function(choice) {
                    if (choice.value == 'msisdn') {
                      var seperate = ["mother_father", "mother_family", "mother_friend"];
                      if (seperate.indexOf(self.im.user.answers.state_msg_receiver) == -1) {
                          // Only one receiver
                          return 'state_msisdn';
                      } else {
                          // Mother and another receiver
                          return 'state_msisdn_mother';
                      }
                    } else if (choice.value == 'exit') {
                        return 'state_end_msisdn';
                    } else {
                        return choice.value;
                    }
                }
            });
        });

        self.add('state_end_msisdn', function(name, creator_opts) {
            var speech_option = '1';
            return new EndState(name, {
                text: 'Thank you for using the Hello Mama service.',
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: 'state_start'
            });
        });

        self.add('state_msisdn_mother', function(name, creator_opts) {
            var question_text = 'Please enter number (Mother)';
            var speech_option = '1';
            return new FreeText(name, {
                question: question_text,
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    } else {
                        var msisdn = go.utils.normalize_msisdn(
                            content, self.im.config.country_code);
                        return go.utils
                            .get_identity_by_address({'msisdn': msisdn}, self.im)
                            .then(function(contact) {
                                if (contact === undefined || contact === null) {
                                    return 'state_msisdn_household';
                                }
                                return go.utils_project
                                    .check_is_subscribed(
                                        self.im, contact.id, 'public.mother')
                                    .then(function(subscribed) {
                                        if (!subscribed || subscribed == 'no_active_subs_found') {
                                            return 'state_msisdn_household';
                                        } else {
                                            return 'state_msisdn_already_registered';
                                        }
                                    });
                            });
                    }
                }
            });
        });

        self.add('state_msisdn_household', function(name, creator_opts) {
            var rolePlayer = self.im.user.answers.state_msg_receiver.replace('mother_', '');  // discarding 'mother_' part of string
            rolePlayer = rolePlayer.replace('family', 'family member');  // append ' member' to family rolePlayer string to make output clearer

            var question_text = "Please enter the {{role_player}}'s number";
            var speech_option = go.utils_project.get_speech_option_household(rolePlayer);

            return new FreeText(name, {
                question: question_text,
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    } else {
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
                    return self.states.create('state_msg_language');
                });
        });

        self.add('state_msg_language', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: 'Language?',
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('eng_NG', $('english')),
                    new Choice('ibo_NG', $('igbo')),
                    new Choice('pcm_NG', $('pidgin'))
                ],
                next: 'state_msg_type'
            });
        });

        self.add('state_msg_type', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: 'Channel?',
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('audio', $('voice')),
                    new Choice('text', $('sms'))
                ],
                next: function(choice) {
                    self.im.user.set_answer('state_pregnancy_status', 'public');
                    if (choice.value === 'audio') {
                        self.im.user.set_answer('state_voice_days', self.im.config.default_day);
                        self.im.user.set_answer('state_voice_times', self.im.config.default_time);
                        return go.utils_project
                            .finish_registration(self.im)
                            .then(function() {
                                return 'state_end_voice_corp';
                            });
                    } else {
                        return go.utils_project
                            .finish_registration(self.im)
                            .then(function() {
                                return 'state_end_sms_corp';
                            });
                    }
                }
            });
        });

        self.add('state_end_voice_corp', function(name, creator_opts) {
            var speech_option = "1";
            var text = 'Thank you! once a week.';
            return new EndState(name, {
                text: text,
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: 'state_start'
            });
        });

        self.add('state_end_sms_corp', function(name, creator_opts) {
            var speech_option = '1';
            var text = 'Thank you! once a week.';
            return new EndState(name, {
                text: text,
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: 'state_start'
            });
        });

    });

    return {
        GoApp: GoApp
    };
}();
