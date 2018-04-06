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

        self.init = function() {

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
            return self.states.create('state_auth_code');
        });


        // REGISTRATION STATES
        self.add('state_auth_code', function(name) {
            return new FreeText(name, {
                question: get_content(name).context({prefix: "Welcome to Hello MAMA! "}),
                check: function(content) {
                    if (go.utils.check_valid_number(content) && content.length === 5) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return get_content(name)
                            .context({prefix: state_error_types.invalid_number});
                    }
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
                    return 'state_save_identities';
                }
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
                next: 'state_msisdn_household'
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
                    return 'state_save_identities';
                }
            });
        });

        // Get or create identities and save their IDs
        self.add('state_save_identities', function(name) {
            return self.states.create('state_msg_language');
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
                    if (choice.value === 'audio') {
                        return 'state_end_voice';
                    } else {
                        return 'state_end_sms';
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
