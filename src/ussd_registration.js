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

        self.init = function() {

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
            "state_auth_code":
                "Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345",
            "state_msisdn":
                "Please enter the mobile number of the person who will receive the weekly messages.  For example 0803304899",
            "state_msg_receiver":
                "Please select who will receive the messages on their phone:",
            "state_pregnancy_status":
                "Please select one of the following:",
            "state_last_period_month":
                "Please select the month the woman had her last period:",
            "state_last_period_day":
                "What day of the month did the woman start her last period? For example, 12.",
            "state_baby_birth_date":
                "Select the month & year the baby was born:",
            "state_baby_birth_day":
                "What day of the month was the baby born? For example, 12.",
            "state_msg_language":
                "Which language would this person like to receive these messages in?",
            "state_msg_call_or_text":
                "How would this person like to get messages?",
            "state_receive_calls_days":
                "We will call them twice a week. On what days would the person like to receive these calls?",
            "state_receive_calls_time":
                "Thank you. At what time would they like to receive these calls?",
            "state_end_thank_you_calls":
                "Thank you. The person will now start receiving calls on [day and day] between [time - time].",
            "state_end_thank_you_texts":
                "Thank you. The person will now start receiving messages three times a week."
        };

        var smss = {
            "time_out":
                "Please dial back in to *XXX*XX# to complete the Hello MAMA registration."
        };

        get_sms_text = function(msg_receiver) {
            return msg_receiver === 'time_out'
                ? smss.time_out : null;
        };

        var errors = {
            "state_auth_code":
                "Sorry, that is not a valid number. Please enter your unique personnel code. For example, 12345."
        };

        get_error_text = function(name) {
            return errors[name] || "Sorry, that is not a valid number. " + questions[name];
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
                question: $(questions[name]),
                choices: [
                    new Choice('continue', $("Yes")),
                    new Choice('restart', $("Start new registration"))
                ],
                next: function(choice) {
                    return go.utils
                        .track_redials(self.contact, self.im, choice.value)
                        .then(function() {
                            if (choice.value === 'continue') {
                                return {
                                    name: creator_opts.name,
                                    creator_opts: creator_opts
                                };
                                // return creator_opts.name;
                            } else if (choice.value === 'restart') {
                                return 'state_start';
                            }
                        });
                }
            });
        });


    // START STATE

        self.add('state_start', function(name) {
            return go.utils
                .check_msisdn_hcp(self.im.user.addr)
                .then(function(hcp_recognised) {
                    if (hcp_recognised) {
                        return self.states.create('state_msisdn');
                    } else {
                        return self.states.create('state_auth_code');
                    }
                });
        });


    // REGISTRATION STATES

        // FreeText st-1
        self.add('state_auth_code', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    return go.utils
                        .validate_personnel_code(self.im, content)
                        .then(function(valid_personnel_code) {
                            if (valid_personnel_code) {
                                return null;  // vumi expects null or undefined if check passes
                            } else {
                                return $(get_error_text(name));
                            }
                        });
                },
                next: 'state_msisdn'
            });
        });

        // FreeState st-02
        self.add('state_msisdn', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
                    }
                },
                next: 'state_msg_receiver'
            });
        });

        // ChoiceState st-03
        self.add('state_msg_receiver', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('the_mother', $("The Mother")),
                    new Choice('the_father', $("The Father")),
                    new Choice('family_member', $("Family member")),
                    new Choice('trusted_friend', $("Trusted friend"))
                ],
                error: $(get_error_text(name)),
                next: 'state_pregnancy_status'
            });
        });

        // ChoiceState st-04
        self.add('state_pregnancy_status', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('the_mother_pregnant', $("The mother is pregnant")),
                    new Choice('the_mother_baby', $("The mother has a baby under 1 year old"))
                ],
                error: $(get_error_text(name)),
                next: function(choice) {
                    return choice.value === 'the_mother_pregnant'
                        ? 'state_last_period_month'
                        : 'state_baby_birth_date';
                }
            });
        });

        // PaginatedChoiceState st-05
        self.add('state_last_period_month', function(name) {
            var today = go.utils.get_today(self.im.config);
            var start_month = today.month();
            return new PaginatedChoiceState(name, {
                question: $(questions[name]),
                choices: go.utils.make_month_choices($, start_month, 9, -1),
                error: $(get_error_text(name)),
                next: 'state_last_period_day'
            });
        });

        // FreeText st-06
        self.add('state_last_period_day', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_day_of_month(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
                    }
                },
                next: 'state_msg_language'
            });
        });

        // ChoiceState st-07
        self.add('state_msg_language', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('english', $('English')),
                    new Choice('hausa', $('Hausa')),
                    new Choice('igbo', $('Igbo'))
                ],
                next: 'state_msg_call_or_text'
            });
        });

        // ChoiceState st-08
        self.add('state_msg_call_or_text', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('voice_calls', $('Voice calls')),
                    new Choice('text_smss', $('Text SMSs'))
                ],
                next: function(choice) {
                    return choice.value === 'voice_calls'
                        ? 'state_receive_calls_days'
                        : 'state_end_thank_you_texts';
                }
            });
        });

        // ChoiceState st-09
        self.add('state_receive_calls_days', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('monday_and_wednesday', $('Monday and Wednesday')),
                    new Choice('tuesday_and_thursday', $('Tuesday and Thursday'))
                ],
                next: 'state_receive_calls_time'
            });
        });

        // ChoiceState st-10
        self.add('state_receive_calls_time', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('between_9_11am', $('Between 9-11am')),
                    new Choice('between_2_5pm', $('Between 2-5pm'))
                ],
                next: 'state_end_thank_you_calls'
            });
        });

        // EndState st-11
        self.add('state_end_thank_you_calls', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });

        // PaginatedChoiceState st-12
        self.add('state_baby_birth_date', function(name) {
            var today = go.utils.get_today(self.im.config);
            var start_month = today.month();
            return new PaginatedChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                characters_per_page: 160,
                options_per_page: null,
                more: $('More'),
                back: $('Back'),
                choices: go.utils.make_month_choices($, start_month, 9, -1),
                next: 'state_baby_birth_day'
            });
        });

        // FreeText st-14
        self.add('state_baby_birth_day', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_day_of_month(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
                    }
                },
                next: 'state_msg_language'
            });
        });

        // EndState st-15
        self.add('state_end_thank_you_texts', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });

    });

    return {
        GoApp: GoApp
    };
}();