// WARNING: This is a generated file.
//          If you edit it you will be sad.
//          Edit src/app.js instead.

var go = {};
go;

/*jshint -W083 */
var Q = require('q');
var vumigo = require('vumigo_v02');
var moment = require('moment');
var querystring = require("querystring");
var JsonApi = vumigo.http.api.JsonApi;

// Shared utils lib
go.utils = {

    should_restart: function(im) {
        var no_restart_states = [
            'state_r01_number',
            'state_r02_retry_number',
            'state_c01_main_menu',
            'state_c02_not_registered',
            'state_c07_loss_opt_in',
            'state_c08_end_baby',
            'state_c09_end_msg_times',
            'state_c10_end_loss_opt_in',
            'state_c11_end_optout'
        ];

        return im.msg.content === '*'
            && no_restart_states.indexOf(im.user.state.name) === -1;
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
        return im.config.voice_content.url + lang + '/' + name + '_' + num + '.mp3';
    },

    // Construct helper_data object
    make_voice_helper_data: function(im, name, lang, num) {
        return {
            voice: {
                speech_url: go.utils.make_speech_url(im, name, lang, num),
                wait_for: '#'
            }
        };
    },

    control_api_call: function(method, params, payload, endpoint, im) {
        var api = new JsonApi(im, {
            headers: {
                'Authorization': ['Token ' + im.config.control.api_key],
                'Content-Type': ['application/json'],
            }
        });
        for(var param in params) {
            params[param] = querystring.escape(params[param]);
        }
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
    is_registered: function(contact_id, im) {
        return go.utils
            .get_contact_by_id(contact_id, im)
            .then(function(contact) {
                var true_options = ['true', 'True', true];
                return true_options.indexOf(contact.details.has_registered) !== -1;
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
            msisdn: msisdn
        };
        return go.utils
            .control_api_call('get', params, null, 'contacts/search/', im)
            .then(function(json_get_response) {
                var contacts_found = json_get_response.data.results;
                // Return the first contact's id
                return (contacts_found.length > 0)
                    ? contacts_found[0].id
                    : null;
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

    normalise_ng_msisdn: function(msisdn) {
        // currently just adds a plus if one is missing,
        // possibly needs to add country code
        return (msisdn.substr(0,1) === '+') ? msisdn : '+' + msisdn;
    },

    // Gets a contact id if it exists, otherwise creates a new one
    get_or_create_contact: function(msisdn, im) {
        msisdn = go.utils.normalise_ng_msisdn(msisdn);
        return go.utils
            // Get contact id using msisdn
            .get_contact_id_by_msisdn(msisdn, im)
            .then(function(contact_id) {
                if (contact_id !== null) {
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

    is_valid_date: function(date, format) {
        // implements strict validation with 'true' below
        return moment(date, format, true).isValid();
    },

    get_baby_dob: function(im, day) {
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

        var month = im.user.answers.state_r06_birth_month;
        var date_string = [
            year.toString(),
            go.utils.double_digit_number(month),
            go.utils.double_digit_number(day)
        ].join('-');

        if (go.utils.is_valid_date(date_string, 'YYYY-MM-DD')) {
            return date_string;
        } else {
            return 'invalid date';
        }
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

    update_mama_details: function(im, mama_contact, chew_phone_used) {
        if (im.user.answers.state_r04_mom_state === 'baby') {
            mama_contact.details.baby_dob = im.user.answers.birth_date;
            mama_contact.details.mama_edd = 'registration_after_baby_born';
        } else {
            mama_contact.details.baby_dob = 'mama_is_pregnant';
            mama_contact.details.mama_edd = im.user.answers.birth_date;
        }
        mama_contact.details.opted_out = false;
        mama_contact.details.has_registered = true;
        mama_contact.details.registered_at = go.utils.get_today(im.config
            ).format('YYYY-MM-DD HH:mm:ss');
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
        return (mama_contact.details.state_current === 'pregnant') ? 1 : 2;
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
            contact: "/api/v1/contacts/" + mama_contact.id + "/",
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

    subscribe_contact: function(im, subscription) {
        var payload = subscription;
        return go.utils
            .control_api_call("post", null, payload, 'subscriptions/', im)
            .then(function(response) {
                return response.data.id;
            });
    },

    save_contact_info_and_subscribe: function(im) {
        var mama_id = im.user.answers.mama_id;
        return Q
            .all([
                // get mama contact
                go.utils.get_contact_by_id(mama_id, im),
                // deactivate existing subscriptions
                go.utils.subscriptions_unsubscribe_all(mama_id, im)
            ])
            .spread(function(mama_contact, unsubscribe_result) {
                mama_contact = go.utils.update_mama_details(
                    im, mama_contact);
                var subscription = go.utils
                    .setup_subscription(im, mama_contact);

                return Q
                    .all([
                        // Update mama's contact
                        go.utils.update_contact(im, mama_contact),
                        // Create a subscription for mama
                        go.utils.subscribe_contact(im, subscription)
                    ]);
            });
    },

    get_active_subscriptions_by_contact_id: function(contact_id, im) {
        // returns all active subscriptions - for unlikely case where there
        // is more than one active subscription
        var params = {
            contact: contact_id,
            active: "True"
        };
        return go.utils
            .control_api_call("get", params, null, 'subscriptions/', im)
            .then(function(json_get_response) {
                return json_get_response.data.results;
            });
    },

    get_active_subscription_by_contact_id: function(contact_id, im) {
        // returns first active subscription found
        return go.utils
            .get_active_subscriptions_by_contact_id(contact_id, im)
            .then(function(subscriptions) {
                return subscriptions[0];
            });
    },

    subscriptions_unsubscribe_all: function(contact_id, im) {
        // make all subscriptions inactive
        // unlike other functions takes into account that there may be
        // more than one active subscription returned (unlikely)
        return go.utils
            .get_active_subscriptions_by_contact_id(contact_id, im)
            .then(function(active_subscriptions) {
                var subscriptions = active_subscriptions;
                var clean = true;  // clean tracks if api call is unnecessary
                var patch_calls = [];
                for (i=0; i<subscriptions.length; i++) {
                    var updated_subscription = subscriptions[i];
                    var endpoint = 'subscriptions/' + updated_subscription.id + '/';
                    updated_subscription.active = false;
                    // store the patch calls to be made
                    patch_calls.push(function() {
                        return go.utils.control_api_call("patch", {}, updated_subscription, endpoint, im);
                    });
                    clean = false;
                }
                if (!clean) {
                    return Q.all(patch_calls.map(Q.try));
            } else {
                return Q();
            }
        });
    },

    switch_to_baby: function(im) {
        var mama_id = im.user.answers.mama_id;
        return Q
            .all([
                // get contact so details can be updated
                go.utils.get_contact_by_id(mama_id, im),
                // set existing subscriptions inactive
                go.utils.subscriptions_unsubscribe_all(mama_id, im)
            ])
            .spread(function(mama_contact, unsubscribe_result) {
                // set new mama contact details
                mama_contact.details.baby_dob = go.utils.get_today(im.config).format('YYYY-MM-DD');
                mama_contact.details.state_current = "baby";

                // set up baby message subscription
                baby_subscription = go.utils.setup_subscription(im, mama_contact);

                return Q.all([
                    // update mama contact
                    go.utils.update_contact(im, mama_contact),
                    // subscribe to baby messages
                    go.utils.subscribe_contact(im, baby_subscription)
                ]);
            });
    },

    update_subscription: function(im, subscription) {
        var endpoint = 'subscriptions/' + subscription.id + '/';
        return go.utils
            .control_api_call('patch', {}, subscription, endpoint, im)
            .then(function(response) {
                return response.data.id;
            });
    },

    change_msg_times: function(im) {
        var mama_id = im.user.answers.mama_id;
        return Q
            .all([
                // get contact so details can be updated
                go.utils.get_contact_by_id(mama_id, im),
                // get existing subscriptions so schedule can be updated
                go.utils.get_active_subscription_by_contact_id(mama_id, im)
            ])
            .spread(function(mama_contact, subscription) {
                // set new mama contact details
                mama_contact.details.voice_days = im.user.answers.state_c04_voice_days;
                mama_contact.details.voice_times = im.user.answers.state_c06_voice_times;

                // set new subscription schedule
                subscription.schedule = go.utils.get_schedule(mama_contact);

                return Q.all([
                    // update mama contact
                    go.utils.update_contact(im, mama_contact),
                    // update subscription
                    go.utils.update_subscription(im, subscription)
                ]);
            });
    },

    optout_loss_opt_in: function(im) {
        return go.utils
            .optout(im)
            .then(function(contact_id) {
                // TODO #17 Subscribe to loss messages
                return Q();
            });
    },

    optout: function(im) {
        var mama_id = im.user.answers.mama_id;
        return Q
            .all([
                // get contact so details can be updated
                go.utils.get_contact_by_id(mama_id, im),
                // set existing subscriptions inactive
                go.utils.subscriptions_unsubscribe_all(mama_id, im)
            ])
            .spread(function(mama_contact, unsubscribe_result) {
                // set new mama contact details
                mama_contact.details.opted_out = true;
                mama_contact.details.optout_reason = im.user.answers.state_c05_optout_reason;

                // update mama contact
                return go.utils
                    .update_contact(im, mama_contact);
            });
    },

    "commas": "commas"
};

// This app handles state changes

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


    // ROUTING

        self.states.add('state_start', function() {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return self.states.create("state_c12_number");
        });


    // CHANGE STATE

        self.add('state_c12_number', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Welcome, Number'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.check_valid_phone_number(content) === false) {
                        return 'state_c13_retry_number';
                    } else {
                        return go.utils
                            // get or create mama contact
                            .get_or_create_contact(content, self.im)
                            .then(function(mama_id) {
                                self.im.user.set_answer('mama_id', mama_id);
                                return go.utils
                                    .is_registered(mama_id, self.im)
                                    .then(function(is_registered) {
                                        if (is_registered === true) {
                                            return self.states.create("state_c01_main_menu");
                                        } else {
                                            return self.states.create("state_c02_not_registered");
                                        }
                                    });
                            });
                    }
                }
            });
        });

        self.add('state_c13_retry_number', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Retry number'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.check_valid_phone_number(content) === false) {
                        return 'state_c13_retry_number';
                    } else {
                        return go.utils
                            // get or create mama contact
                            .get_or_create_contact(content, self.im)
                            .then(function(mama_id) {
                                self.im.user.set_answer('mama_id', mama_id);
                                return go.utils
                                    .is_registered(mama_id, self.im)
                                    .then(function(is_registered) {
                                        if (is_registered === true) {
                                            return self.states.create("state_c01_main_menu");
                                        } else {
                                            return self.states.create("state_c02_not_registered");
                                        }
                                    });
                            });
                    }
                }
            });
        });


        self.add('state_c01_main_menu', function(name) {
            var speech_option = '1';
            var routing = {
                'baby': 'state_c03_baby_confirm',
                'msg_time': 'state_c04_voice_days',
                'optout': 'state_c05_optout_reason'
            };
            return new ChoiceState(name, {
                question: $('Baby / Message time / Optout?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('baby', $('baby')),
                    new Choice('msg_time', $('msg_time')),
                    new Choice('optout', $('optout'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.add('state_c02_not_registered', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Unrecognised number'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        self.add('state_c03_baby_confirm', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Confirm baby?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('confirm', $('confirm'))
                ],
                next: 'state_c08_enter'
            });
        });

        self.add('state_c04_voice_days', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Message days?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('mon_wed', $('mon_wed')),
                    new Choice('tue_thu', $('tue_thu'))
                ],
                next: 'state_c06_voice_times'
            });
        });

        self.add('state_c05_optout_reason', function(name) {
            var speech_option = '1';
            var routing = {
                'miscarriage': 'state_c07_loss_opt_in',
                'stillborn': 'state_c07_loss_opt_in',
                'baby_died': 'state_c07_loss_opt_in',
                'not_useful': 'state_c11_enter',
                'other': 'state_c11_enter'
            };
            return new ChoiceState(name, {
                question: $('Optout reason?'),
                helper_metadata: go.utils.make_voice_helper_data(
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

        self.add('state_c06_voice_times', function(name) {
            var days = self.im.user.answers.state_c04_voice_days;
            var speech_option = go.utils.get_speech_option_days(days);
            return new ChoiceState(name, {
                question: $('Message times?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('9_11', $('9_11')),
                    new Choice('2_5', $('2_5'))
                ],
                next: 'state_c09_enter'
            });
        });

        self.add('state_c07_loss_opt_in', function(name) {
            var speech_option = '1';
            var routing = {
                'opt_in_confirm': 'state_c10_enter',
                'opt_in_deny': 'state_c11_enter'
            };
            return new ChoiceState(name, {
                question: $('Receive loss messages?'),
                helper_metadata: go.utils.make_voice_helper_data(
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

        self.add('state_c08_enter', function(name) {
            return go.utils
                .switch_to_baby(self.im)
                .then(function() {
                    return self.states.create('state_c08_end_baby');
                });
        });

        self.add('state_c08_end_baby', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you - baby'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        self.add('state_c09_enter', function(name) {
            return go.utils
                .change_msg_times(self.im)
                .then(function() {
                    return self.states.create('state_c09_end_msg_times');
                });
        });

        self.add('state_c09_end_msg_times', function(name) {
            var days = self.im.user.answers.state_c04_voice_days;
            var time = self.im.user.answers.state_c06_voice_times;
            var speech_option = go.utils.get_speech_option_days_time(days, time);
            return new EndState(name, {
                text: $('Thank you! Time: {{ time }}. Days: {{ days }}.'
                    ).context({ time: time, days: days }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        self.add('state_c10_enter', function(name) {
            return go.utils
                .optout_loss_opt_in(self.im)
                .then(function() {
                    return self.states.create('state_c10_end_loss_opt_in');
                });
        });

        self.add('state_c10_end_loss_opt_in', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you - loss opt in'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        self.add('state_c11_enter', function(name) {
            return go.utils
                .optout(self.im)
                .then(function() {
                    return self.states.create('state_c11_end_optout');
                });
        });

        self.add('state_c11_end_optout', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you - optout'),
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
