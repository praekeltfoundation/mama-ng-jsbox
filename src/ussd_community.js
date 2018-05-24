go.app = function() {
    var vumigo = require('vumigo_v02');
    var SeedJsboxUtils = require('seed-jsbox-utils');
    var MetricsHelper = require('go-jsbox-metrics-helper');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;
    var JsonApi = vumigo.http.api.JsonApi;


    var GoApp = App.extend(function(self) {
        App.call(self, 'state_start');
        var $ = self.$;
        var interrupt = true;

        self.init = function() {
            // Send a dial back reminder via sms the first time someone times out
            self.im.on('session:close', function(e) {
                return go.utils_project.eval_dialback_reminder(
                    e, self.im, self.im.user.answers.user_id, $,
                    "Please dial back into {{channel}} to complete the Hello MAMA registration"
                    );
            });

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
                        state: 'state_end_voice',
                        action: 'enter'
                    },[self.metric_prefix, "registrations_completed"].join('.')
                )
                .add.total_state_actions(
                    {
                        state: 'state_end_sms',
                        action: 'enter'
                    },[self.metric_prefix, "registrations_completed"].join('.')
                )
            ;

            // Average sessions to register - manual instead of helper because of two end states
            var avg_label = [self.metric_prefix, 'avg.sessions_to_register'].join('.');
            var avg_metadata_label = 'sessions_until_state_metric_' + avg_label;
            var avg_states = ['state_end_voice', 'state_end_sms'];
            self.im.on('session:new', function(e) {
                /* Increment sessions counter */
                mh._increment_metadata(e.im.user, avg_metadata_label);
            });

            self.im.on('state:enter', function(e) {
                /* Reset sessions counter and fire metric */
                if(avg_states.indexOf(e.state.name) != -1) {
                    var metadata_value = mh._reset_metadata(
                        e.state.im.user, avg_metadata_label);
                    return e.state.im.metrics.fire.avg(avg_label, metadata_value);
                }
            });

            sbm = new SeedJsboxUtils.StageBasedMessaging(
                new JsonApi(self.im, {}),
                self.im.config.services.subscriptions.api_token,
                self.im.config.services.subscriptions.url
            );

        };

    // TEXT CONTENT

        var get_content = function(state_name) {
            switch (state_name) {
                case "state_timed_out":
                    return $("You have an incomplete registration. Would you like to continue with this registration?");
                case "state_auth_code":
                    return $("{{prefix}}Please enter your unique Community Resource Persons code.");
                case "state_msg_receiver":
                    return $("{{prefix}}Who will receive the messages on their phone?");
                case "state_msisdn":
                    return $("{{prefix}}Please enter the mobile number of the {{roleplayer}}. They must consent to receiving messages.");
                case "state_msisdn_already_registered":
                    return $("{{prefix}}Sorry, this number is already registered for messages. They must opt-out before continuing.");
                case "state_msisdn_mother":
                    return $("{{prefix}}Please enter the mobile number of the mother. They must consent to receiving messages.");
                case "state_msisdn_household":
                    return $("{{prefix}}Please enter the mobile number of the {{roleplayer}}. They must consent to receiving messages.");
                case "state_msg_language":
                    return $("{{prefix}}What language would they like to receive the messages in?");
                case "state_msg_type":
                    return $("{{prefix}}How would they like to receive the messages?");
                case "state_end_voice":
                    return $("Thank you. The person will now start receiving calls on Tuesday between 6pm and 8pm for 4 weeks.");
                case "state_end_sms":
                    return $("Thank you. The person will now start receiving messages once per week for 4 weeks.");
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
                    if (user.details.corp_code) {
                        self.im.user.set_answer('operator_id', user.id);
                        return self.states.create('state_msg_receiver');
                    } else {
                        return self.states.create('state_auth_code');
                    }
                });
        });


        // REGISTRATION STATES
        self.add('state_auth_code', function(name) {
            return new FreeText(name, {
                question: get_content(name).context({prefix: "Welcome to Hello MAMA! "}),
                check: function(content) {
                    var unique_code = content;
                    return go.utils_project
                        .find_corp_with_unique_code(self.im, unique_code)
                        .then(function(corp) {
                            if (corp) {
                                self.im.user.set_answer('operator_id', corp.id);
                                return null;  // vumi expects null or undefined if check passes
                            } else {
                                return get_content(name)
                                    .context({prefix: state_error_types.invalid_number});
                            }
                        });
                },
                next: 'state_msg_receiver'
            });
        });

        self.add('state_msg_receiver', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:"Welcome to Hello Mama. "}),
                error: get_content(name).context({prefix: state_error_types.invalid_selection}),
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
                            prefix: state_error_types.invalid_number,
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
                            if (contact === undefined || contact === null ||
                                    self.im.user.answers.state_msg_receiver != 'mother_only') {
                                return 'state_save_identities';
                            }

                            return sbm
                                .is_identity_subscribed(
                                    contact.id, [/public\.mother/, /prebirth\.mother/, /postbirth\.mother/])
                                .then(function(subscribed) {
                                    if (!subscribed) {
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
            });
        });

        self.add('state_msisdn_already_registered', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                error: get_content(name)
                    .context({prefix: state_error_types.invalid_selection}),
                choices: [
                    new Choice('msisdn', $("Try a different number")),
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

        self.add('state_end_msisdn', function(name) {
            return new EndState(name, {
                text: get_content(name),
                next: 'state_start'
            });
        });

        self.add('state_msisdn_mother', function(name) {
            return new FreeText(name, {
                question: get_content(name).context({prefix:""}),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return get_content(name).context({prefix: state_error_types.invalid_number});
                    }
                },
                next: function(content) {
                    var msisdn = go.utils.normalize_msisdn(
                        content, self.im.config.country_code);
                    return go.utils
                        .get_identity_by_address({'msisdn': msisdn}, self.im)
                        .then(function(contact) {
                            if (contact === undefined || contact === null) {
                                return 'state_msisdn_household';
                            }
                            return sbm
                                .is_identity_subscribed(
                                    contact.id, [/public\.mother/, /prebirth\.mother/, /postbirth\.mother/])
                                .then(function(subscribed) {
                                    if (!subscribed || subscribed == 'no_active_subs_found') {
                                        return 'state_msisdn_household';
                                    } else {
                                        return 'state_msisdn_already_registered';
                                    }
                                });
                        });
                }
            });
        });

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
                    return self.states.create('state_msg_language');
                });
        });

        self.add('state_msg_language', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                error: get_content(name).context({prefix: state_error_types.invalid_selection}),
                choices: [
                    new Choice('eng_NG', $('English')),
                    new Choice('ibo_NG', $('Igbo')),
                    new Choice('pcm_NG', $('Pidgin'))
                ],
                next: 'state_msg_type'
            });
        });

        self.add('state_msg_type', function(name) {
            return new ChoiceState(name, {
                question: get_content(name).context({prefix:""}),
                error: get_content(name).context({prefix: state_error_types.invalid_selection}),
                choices: [
                    new Choice('audio', $('Voice calls')),
                    new Choice('text', $('Text SMSs'))
                ],
                next: function(choice) {
                    self.im.user.set_answer('state_pregnancy_status', 'public');
                    if (choice.value === 'audio') {
                        self.im.user.set_answer('state_voice_days', self.im.config.default_day);
                        self.im.user.set_answer('state_voice_times', self.im.config.default_time);

                        return go.utils_project
                            .finish_registration(self.im)
                            .then(function() {
                                return 'state_end_voice';
                            });
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

        self.add('state_end_voice', function(name) {
            return new EndState(name, {
                text: get_content(name).context(),
                next: 'state_start'
            });
        });

        self.add('state_end_sms', function(name) {
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
