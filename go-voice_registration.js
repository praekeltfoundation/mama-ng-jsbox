// WARNING: This is a generated file.
//          If you edit it you will be sad.
//          Edit src/app.js instead.

var go = {};
go;

var Q = require('q');
var vumigo = require('vumigo_v02');
var moment = require('moment');
var JsonApi = vumigo.http.api.JsonApi;

// Shared utils lib
go.utils = {

    should_restart: function(im) {
        var no_restart_states = [
            'state_r01_number',
            'state_r02_retry_number'
        ];

        return im.msg.content === '*'
            && no_restart_states.indexOf(im.user.state.name) === -1;
    },

    return_true: function() {
        return true;
    },

    return_false: function() {
        return false;
    },

    return_q: function() {
        return Q();
    },

    get_speech_option_birth_day: function(im, month) {
        var speech_option_start = 0;
        if (im.user.answers.state_r04_mom_state === 'baby') {
            im.user.answers.state_r05_birth_year === 'last_year'
                ? speech_option_start = 12
                : speech_option_start = 24;
        }
        var speech_option_num = speech_option_start + parseInt(month, 10);
        return speech_option_num.toString();
    },

    get_speech_option_days: function(days) {
        day_map = {
            'mon_wed': '1',
            'tue_thu': '2'
        };
        return day_map[days];
    },

    get_speech_option_days_time: function(days, time) {
        var speech_option;
        day_map_9_11 = {
            'mon_wed': '2',
            'tue_thu': '3'
        };
        day_map_2_5 = {
            'mon_wed': '4',
            'tue_thu': '5'
        };
        if (time === undefined) {
            speech_option = '1';
        } else {
            time === '9_11' ? speech_option = day_map_9_11[days]
                            : speech_option = day_map_2_5[days];
        }
        return speech_option;
    },

    // Construct url string
    make_speech_url: function(im, name, lang, num) {
        return im.config.control.url + lang + '/' + name + '_' + num + '.mp3';
    },

    // Construct helper_data object
    make_voice_helper_data: function(im, name, lang, num) {
        return {
            voice: {
                speech_url: go.utils.make_speech_url(im, name, lang, num)
            }
        };
    },

    control_api_call: function(method, params, payload, endpoint, im) {
        var api = new JsonApi(im, {
            headers: {
                'Authorization': 'Token ' + im.config.control.api_key,
                'Content-Type': 'application/json',
            }
        });
        switch (method) {
            case "post":
                return api.post(im.config.control.url + endpoint, {
                    data: payload
                });
            case "get":
                return api.get(im.config.control.url + endpoint, {
                    params: params
                });
            case "patch":
                return api.patch(im.config.control.url + endpoint, {
                    data: payload
                });
            case "put":
                return api.put(im.config.control.url + endpoint, {
                    params: params,
                  data: payload
                });
            case "delete":
                return api.delete(im.config.control.url + endpoint);
            }
    },

    // Determine whether contact is registered
    // TODO #12 - this is currently just a temporary workaround
    is_registered: function(im) {
        return Q()
            .then(function() {
                if (im.user.addr === 'unknown user') {
                    return false;
                } else {
                    return true;
                }
            });
    },

    // An attempt to solve the insanity of JavaScript numbers
    check_valid_number: function(content) {
        var numbers_only = new RegExp('^\\d+$');
        if (content !== ''
                && numbers_only.test(content)
                && !Number.isNaN(Number(content))) {
            return true;
        } else {
            return false;
        }
    },

    // Check that it is a number and starts with 0 and more or less correct len
    check_valid_phone_number: function(content) {
        if (go.utils.check_valid_number(content)
                && content[0] === '0'
                && content.length >= 10
                && content.length <= 13) {
            return true;
        } else {
            return false;
        }
    },

    get_addresses: function(msisdn) {
        return "msisdn:" + msisdn;
    },

    get_contact_id_by_msisdn: function(msisdn, im) {
        var params = {
            to_addr: msisdn
        };
        return go.utils
            .control_api_call('get', params, null, 'contacts/search/', im)
            .then(function(json_get_response) {
                var contacts_found = json_get_response.data;
                // Return the first contact's id
                return contacts_found[0].id || "no_contacts_found";
            });
    },

    get_contact_by_id: function(contact_id, im) {
        var endpoint = 'contacts/' + contact_id + '/';
        return go.utils
            .control_api_call('get', {}, null, endpoint, im)
            .then(function(json_get_response) {
                return json_get_response.data;
            });
    },

    // Create a new contact with the minimum required details
    create_contact: function(msisdn, im) {
        var payload = {
            "details": {
                "default_addr_type": "msisdn",
                "addresses": go.utils.get_addresses(msisdn)
            }
        };
        return go.utils
            .control_api_call("post", null, payload, 'contacts/', im)
            .then(function(json_post_response) {
                var contact_created = json_post_response.data;
                // Return the contact's id
                return contact_created.id;
            });
    },

    // Gets a contact id if it exists, otherwise creates a new one
    get_or_create_contact: function(msisdn, im) {
        return go.utils
            // Get contact id using msisdn
            .get_contact_id_by_msisdn(msisdn, im)
            .then(function(contact_id) {
                if (contact_id !== "no_contacts_found") {
                    // If contact exists, return the id
                    return contact_id;
                } else {
                    // If contact doesn't exist, create it
                    return go.utils
                        .create_contact(msisdn, im)
                        .then(function(contact_id) {
                            return contact_id;
                        });
                }
            });
    },

    get_today: function(config) {
        var today;
        if (config.testing_today) {
            today = new moment(config.testing_today, 'YYYY-MM-DD');
        } else {
            today = new moment();
        }
        return today;
    },

    double_digit_number: function(input) {
        input_numeric = parseInt(input, 10);
        if (parseInt(input, 10) < 10) {
            return "0" + input_numeric.toString();
        } else {
            return input_numeric.toString();
        }
    },

    get_baby_dob: function(im) {
        var date_today = go.utils.get_today(im.config);

        var year_text = im.user.answers.state_r05_birth_year;
        var year;
        switch (year_text) {
            case 'last_year':
                year = date_today.year() - 1;
                break;
            case 'this_year':
                year = date_today.year();
                break;
            case 'next_year':
                year = date_today.year() + 1;
                break;
        }

        var month = im.user.answers.state_r06_birth_month - 1;
        var day = im.user.answers.state_r08_birth_day;

        var baby_dob = moment({
            year: year,
            month: month,
            day: day
        });
        return baby_dob.format('YYYY-MM-DD');
    },

    get_lang: function(im) {
        lang_map = {
            'english': 'eng_NG',
            'hausa': 'hau_NG',
            'igbo': 'ibo_NG'
        };
        return lang_map[im.user.answers.state_r09_language];
    },

    update_contact: function(im, contact) {
        // For patching any field on the contact
        var endpoint = 'contacts/' + contact.id + '/';
        return go.utils
            .control_api_call('patch', {}, contact, endpoint, im)
            .then(function(response) {
                return response.data.id;
            });
    },

    update_mama_details: function(im, mama_contact, user_id, chew_phone_used) {
        if (im.user.answers.state_r04_mom_state === 'baby') {
            mama_contact.details.baby_dob = go.utils.get_baby_dob(im);
            mama_contact.details.mama_edd = 'registration_after_baby_born';
        } else {
            mama_contact.details.baby_dob = 'mama_is_pregnant';
            mama_contact.details.mama_edd = go.utils.get_baby_dob(im);
        }
        mama_contact.details.opted_out = false;  // ?
        mama_contact.details.has_registered = true;
        mama_contact.details.registered_at = go.utils.get_today(im.config
            ).format('YYYY-MM-DD HH:mm:ss ZZ');
        mama_contact.details.registered_by = user_id;
        mama_contact.details.chew_phone_used = chew_phone_used;
        mama_contact.details.msg_receiver = im.user.answers.state_r03_receiver;
        mama_contact.details.state_at_registration = im.user.answers.state_r04_mom_state;
        mama_contact.details.state_current = im.user.answers.state_r04_mom_state;
        mama_contact.details.lang = go.utils.get_lang(im);
        mama_contact.details.msg_type = im.user.answers.state_r10_message_type;
        mama_contact.details.voice_days = im.user.answers.state_r11_voice_days || 'sms';
        mama_contact.details.voice_times = im.user.answers.state_r12_voice_times || 'sms';
        return mama_contact;
    },

    get_messageset_id: function(mama_contact) {
        return (mama_contact.details.state_at_registration === 'pregnant') ? 1 : 2;
    },

    get_next_sequence_number: function(mama_contact) {
        return 1;
    },

    get_schedule: function(mama_contact) {
        var schedule_id;
        var days = mama_contact.details.voice_days;
        var times = mama_contact.details.voice_times;

        if (days === 'mon_wed' && times === '9_11') {
            schedule_id = 1;
        } else if (days === 'mon_wed' && times === '2_5') {
            schedule_id = 2;
        } else if (days === 'tue_thu' && times === '9_11') {
            schedule_id = 3;
        } else if (days === 'tue_thu' && times === '2_5') {
            schedule_id = 4;
        } else {
            schedule_id = 1;  // for sms
        }
        return schedule_id;
    },

    setup_subscription: function(im, mama_contact) {
        subscription = {
            contact: mama_contact.id,
            version: 1,
            messageset_id: go.utils.get_messageset_id(mama_contact),
            next_sequence_number: go.utils.get_next_sequence_number(mama_contact),
            lang: mama_contact.details.lang,
            active: true,
            completed: false,
            schedule: go.utils.get_schedule(mama_contact),
            process_status: 0,
            metadata: {
                msg_type: mama_contact.details.msg_type
            }
        };
        return subscription;
    },

    update_chew_details: function(im, chew_contact, mama_id) {
        var mama_reg_ids = chew_contact.details.mamas_registered_ids || [];
        var mama_reg_qty = chew_contact.details.mamas_registered_qty || 0;
        mama_reg_ids.push(mama_id);
        mama_reg_qty += 1;
        chew_contact.details.mamas_registered_ids = mama_reg_ids;
        chew_contact.details.mamas_registered_qty = mama_reg_qty;
        return chew_contact;
    },

    subscribe_contact: function(im, subscription) {
        var payload = subscription;
        return go.utils
            .control_api_call("post", null, payload, 'subscriptions/', im)
            .then(function(response) {
                return response.data.id;
            });
    },

    save_contacts_info_and_subscribe: function(im) {
        var user_id = im.user.answers.user_id;
        var mama_id = im.user.answers.mama_id;
        var chew_phone_used = (user_id === mama_id) ? false : true;
        return go.utils
            .get_contact_by_id(mama_id, im)
            .then(function(mama_contact) {
                mama_contact = go.utils.update_mama_details(
                    im, mama_contact, user_id, chew_phone_used);
                var subscription = go.utils
                    .setup_subscription(im, mama_contact);

                return Q
                    .all([
                        // Update mama's contact
                        go.utils.update_contact(im, mama_contact),
                        // Create a subscription for mama
                        go.utils.subscribe_contact(im, subscription)
                    ])
                    .then(function() {
                        if (chew_phone_used === true) {
                            // Update chew's info
                            return go.utils
                                .get_contact_by_id(user_id, im)
                                .then(function(chew_contact) {
                                    chew_contact = go.utils
                                        .update_chew_details(im, chew_contact, mama_id);
                                    return go.utils
                                        .update_contact(im, chew_contact);
                                });
                        } else {
                            return Q();
                        }
                    });

            });
    },

    create_subscription: function(subscription_info) {
        return Q();
    },



    "commas": "commas"
};

// This app handles registration

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
        var lang = 'en';
        var interrupt = true;

        self.add = function(name, creator) {
            self.states.add(name, function(name, opts) {
                if (!interrupt || !go.utils.should_restart(self.im))
                    return creator(name, opts);

                interrupt = false;
                opts = opts || {};
                opts.name = name;
                // Prevent previous content being passed to next state
                self.im.msg.content = null;
                return self.states.create('state_start', opts);
            });
        };

    // START

        self.states.add('state_start', function(name) {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return go.utils
                // get or create dialer (phone user) contact
                .get_or_create_contact(self.im.user.addr, self.im)
                .then(function(user_id) {
                    self.im.user.set_answer('user_id', user_id);
                    return self.states.create("state_r01_number");
                });
        });


    // REGISTRATION

        self.add('state_r01_number', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Welcome, Number'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.check_valid_phone_number(content) === false) {
                        return 'state_r02_retry_number';
                    } else {
                        return go.utils
                            // get or create mama contact
                            .get_or_create_contact('+'+content, self.im)
                            .then(function(mama_id) {
                                self.im.user.set_answer('mama_id', mama_id);
                                return 'state_r03_receiver';
                            });
                    }
                }
            });
        });

        self.add('state_r02_retry_number', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Retry number'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.check_valid_phone_number(content) === false) {
                        return 'state_r02_retry_number';
                    } else {
                        return go.utils
                            // get or create mama contact
                            .get_or_create_contact('+'+content, self.im)
                            .then(function(mama_id) {
                                self.im.user.set_answer('mama_id', mama_id);
                                return 'state_r03_receiver';
                            });
                    }
                }
            });
        });

        self.add('state_r03_receiver', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Choose receiver'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('mother', $('Mother')),
                    new Choice('other', $('Other'))
                ],
                next: 'state_r04_mom_state'
            });
        });

        self.add('state_r04_mom_state', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Pregnant or baby'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('pregnant', $('Pregnant')),
                    new Choice('baby', $('Baby'))
                ],
                next: 'state_r05_birth_year'
            });
        });

        self.add('state_r05_birth_year', function(name) {
            // TODO #6 Don't show next year for pregnancy in Jan / Feb
            var speech_option;
            var year_choices = [
                new Choice('last_year', $('last_year')),
                new Choice('this_year', $('this_year')),
                new Choice('next_year', $('next_year'))
            ];
            if (self.im.user.answers.state_r04_mom_state === 'pregnant') {
                choices = year_choices.slice(1,3);
                speech_option = '1';
            } else {
                choices = year_choices.slice(0,2);
                speech_option = '2';
            }
            return new ChoiceState(name, {
                question: $('Birth year?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: choices,
                next: function(choice) {
                    return 'state_r06_birth_month';
                }
            });
        });

        self.add('state_r06_birth_month', function(name) {
            var speech_option;
            self.im.user.answers.state_r04_mom_state === 'pregnant'
                ? speech_option = '1'
                : speech_option = '2';
            // create choices eg. new Choice('1', '1') etc.
            var month_choices = [];
            for (i=1; i<=12; i++) {
                month_choices.push(new Choice(i.toString(), i.toString()));
            }
            return new ChoiceState(name, {
                question: $('Birth month? 1-12'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: month_choices,
                next: 'state_r07_confirm_month'
            });
        });

        self.add('state_r07_confirm_month', function(name) {
            var routing = {
                'confirm': 'state_r08_birth_day',
                'retry': 'state_r06_birth_month'
            };
            var speech_option = self.im.user.answers.state_r06_birth_month;
            return new ChoiceState(name, {
                question: $('You entered x for Month. Correct?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('confirm', $('confirm')),
                    new Choice('retry', $('retry'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.add('state_r08_birth_day', function(name) {
            var month = self.im.user.answers.state_r06_birth_month;
            var speech_option = go.utils.get_speech_option_birth_day(
                self.im, month);
            return new FreeText(name, {
                question: $('Birth day in {{ month }}?'
                    ).context({ month: month }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    // TODO check user has entered a proper day
                    return 'state_r09_language';
                }
            });
        });

        self.add('state_r09_language', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Language?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('english', $('english')),
                    new Choice('hausa', $('hausa')),
                    new Choice('igbo', $('igbo')),
                ],
                next: 'state_r10_message_type'
            });
        });

        self.add('state_r10_message_type', function(name) {
            var speech_option = '1';
            var routing = {
                'sms': 'state_r13_enter',
                'voice': 'state_r11_voice_days'
            };
            return new ChoiceState(name, {
                question: $('Channel?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('sms', $('sms')),
                    new Choice('voice', $('voice'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.add('state_r11_voice_days', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Message days?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('mon_wed', $('mon_wed')),
                    new Choice('tue_thu', $('tue_thu'))
                ],
                next: 'state_r12_voice_times'
            });
        });

        self.add('state_r12_voice_times', function(name) {
            var days = self.im.user.answers.state_r11_voice_days;
            var speech_option = go.utils.get_speech_option_days(days);
            return new ChoiceState(name, {
                question: $('Message time?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('9_11', $('9_11')),
                    new Choice('2_5', $('2_5'))
                ],
                next: 'state_r13_enter'
            });
        });

        self.add('state_r13_enter', function(name) {
            return go.utils
                .save_contacts_info_and_subscribe(self.im)
                .then(function() {
                    return self.states.create('state_r13_end');
                });
        });

        self.add('state_r13_end', function(name) {
            var time = self.im.user.answers.state_r12_voice_times;
            var days = self.im.user.answers.state_r11_voice_days;
            var speech_option = go.utils.get_speech_option_days_time(days, time);
            var text;
            time === undefined
                ? text = $('Thank you!')
                : text = $('Thank you! Time: {{ time }}. Days: {{ days }}.'
                           ).context({ time: time, days: days });
            return new EndState(name, {
                text: text,
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

    });

    return {
        GoApp: GoApp
    };
}();

go.init = function() {
    var vumigo = require('vumigo_v02');
    var InteractionMachine = vumigo.InteractionMachine;
    var GoApp = go.app.GoApp;

    return {
        im: new InteractionMachine(api, new GoApp())
    };
}();
