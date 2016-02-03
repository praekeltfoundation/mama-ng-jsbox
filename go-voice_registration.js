// WARNING: This is a generated file.
//          If you edit it you will be sad.
//          Edit src/app.js instead.

var go = {};
go;

/*jshint -W083 */
var Q = require('q');
var vumigo = require('vumigo_v02');
var moment = require('moment');
var JsonApi = vumigo.http.api.JsonApi;
var Choice = vumigo.states.Choice;

// Shared utils lib
go.utils = {

// VOICE UTILS

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

// CONTROL API CALL

    control_api_call: function(method, params, payload, endpoint, im) {
        var api = new JsonApi(im, {
            headers: {
                'Authorization': ['Token ' + im.config.control.api_key],
                'Content-Type': ['application/json'],
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
    is_registered: function(contact_id, im) {
        return go.utils
            .get_contact_by_id(contact_id, im)
            .then(function(contact) {
                var true_options = ['true', 'True', true];
                return true_options.indexOf(contact.details.has_registered) !== -1;
            });
    },

    check_baby_subscription: function(msisdn) {
        return Q()
            .then(function(q_response) {
                return (msisdn === '082333');
            });
    },

    check_msg_type: function(msisdn) {
        return Q()
            .then(function(q_response) {
                if (msisdn === '082444') {
                    return 'sms';
                } else if (msisdn === '082555') {
                    return 'voice';
                } else {
                    return 'none';
                }
            });
    },

// MSISDN & NUMBER HANDLING

    // An attempt to solve the insanity of JavaScript numbers
    check_valid_number: function(content) {
        var numbers_only = new RegExp('^\\d+$');
        return content !== ''
            && numbers_only.test(content)
            && !Number.isNaN(Number(content));
    },

    // Check that it's a number and starts with 0 and approximate length
    is_valid_msisdn: function(content) {
        return go.utils.check_valid_number(content)
            && content[0] === '0'
            && content.length >= 10
            && content.length <= 13;
    },

    normalize_msisdn: function(raw, country_code) {
        // don't touch shortcodes
        if (raw.length <= 5) {
            return raw;
        }
        // remove chars that are not numbers or +
        raw = raw.replace(/[^0-9+]/g);
        if (raw.substr(0,2) === '00') {
            return '+' + raw.substr(2);
        }
        if (raw.substr(0,1) === '0') {
            return '+' + country_code + raw.substr(1);
        }
        if (raw.substr(0,1) === '+') {
            return raw;
        }
        if (raw.substr(0, country_code.length) === country_code) {
            return '+' + raw;
        }
        return raw;
    },

    double_digit_number: function(input) {
        input_numeric = parseInt(input, 10);
        if (parseInt(input, 10) < 10) {
            return "0" + input_numeric.toString();
        } else {
            return input_numeric.toString();
        }
    },

// CONTACT HANDLING

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

    // Gets a contact id if it exists, otherwise creates a new one
    get_or_create_contact: function(msisdn, im) {
        msisdn = go.utils.normalize_msisdn(msisdn, '234');  // nigeria
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

    get_lang: function(im) {
        lang_map = {
            'english': 'eng_NG',
            'hausa': 'hau_NG',
            'igbo': 'ibo_NG'
        };
        return lang_map[im.user.answers.state_r09_language];
    },

// DATE HANDLING

    get_today: function(config) {
        var today;
        if (config.testing_today) {
            today = new moment(config.testing_today, 'YYYY-MM-DD');
        } else {
            today = new moment();
        }
        return today;
    },

    is_valid_date: function(date, format) {
        // implements strict validation with 'true' below
        return moment(date, format, true).isValid();
    },

    is_valid_year: function(input) {
        // check that it is a number and has four digits
        return input.length === 4 && go.utils.check_valid_number(input);
    },

    is_valid_day_of_month: function(input) {
        // check that it is a number and between 1 and 31
        return go.utils.check_valid_number(input)
            && parseInt(input, 10) >= 1
            && parseInt(input, 10) <= 31;
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

// OTHER

    get_addresses: function(msisdn) {
        return "msisdn:" + msisdn;
    },

// SUBSCRIPTION HANDLING

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

    subscribe_contact: function(im, subscription) {
        var payload = subscription;
        return go.utils
            .control_api_call("post", null, payload, 'subscriptions/', im)
            .then(function(response) {
                return response.data.id;
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

    has_active_subscriptions: function(contact_id, im) {
        return go.utils
            .get_active_subscriptions_by_contact_id(contact_id, im)
            .then(function(subscriptions) {
                return subscriptions.length > 0;
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

// CHANGE HANDLING

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

// OPTOUT HANDLING

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

// SMS HANDLING

    vumi_send_text: function(im, to_addr, sms_message) {
        var api = new JsonApi(im, {
            headers: {
                'Content-Type': ['application/json; charset=utf-8'],
            },
            auth: {
                account_key: im.config.vumi_http.account_key,
                conversation_token: im.config.vumi_http.conversation_token
            }
        });

        return api.put(im.config.vumi_http.url, {
            data: {
                "to_addr": go.utils.normalize_msisdn(to_addr, '234'),  // nigeria
                "content": sms_message
            }
        });
    },

// TIMEOUT HANDLING

    timed_out: function(im) {
        var no_redirects = [
            'state_start',
            'state_end',
            'state_end_thank_translate'
        ];
        return im.msg.session_event === 'new'
            && im.user.state.name
            && no_redirects.indexOf(im.user.state.name) === -1;
    },

    // Track redials

    track_redials: function(contact, im, decision) {
        var status = contact.extra.status || 'unregistered';
        return Q.all([
            im.metrics.fire.inc(['total', 'redials', 'choice_made', 'last'].join('.')),
            im.metrics.fire.sum(['total', 'redials', 'choice_made', 'sum'].join('.'), 1),
            im.metrics.fire.inc(['total', 'redials', status, 'last'].join('.')),
            im.metrics.fire.sum(['total', 'redials', status, 'sum'].join('.'), 1),
            im.metrics.fire.inc(['total', 'redials', decision, 'last'].join('.')),
            im.metrics.fire.sum(['total', 'redials', decision, 'sum'].join('.'), 1),
            im.metrics.fire.inc(['total', 'redials', status, decision, 'last'].join('.')),
            im.metrics.fire.sum(['total', 'redials', status, decision, 'sum'].join('.'), 1),
        ]);
    },

// PROJECT SPECIFIC

    check_msisdn_hcp: function(msisdn) {
        return Q()
            .then(function(q_response) {
                return msisdn === '082222' || msisdn === '082333'
                    || msisdn === '082444' || msisdn === '082555' || msisdn === '0803304899';
            });
    },

    validate_personnel_code: function(im, content) {
        return Q()
            .then(function(q_response) {
                return content === '12345';
            });
    },

    check_valid_alpha: function(input) {
        var alpha_only = new RegExp('^[A-Za-z]+$');
        return input !== '' && alpha_only.test(input);
    },

    is_valid_name: function(input) {
        // check that all chars are alphabetical
        return go.utils.check_valid_alpha(input);
    },

    make_month_choices: function($, startDate, limit, increment) {
        var choices = [];

        var monthIterator = startDate;
        for (var i=0; i<limit; i++) {
            choices.push(new Choice(monthIterator.format("YYYYMM"), $(monthIterator.format("MMMM YY"))));
            monthIterator.add(increment, 'months');
        }

        return choices;
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
    var PaginatedChoiceState = vumigo.states.PaginatedChoiceState;


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

    // START

        self.states.add('state_start', function(name) {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return self.states.create("state_personnel_auth");
        });


    // REGISTRATION

        self.add('state_personnel_auth', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (content != '12345') {      // temporarily hard-coded
                        return 'state_r02_retry_number';
                    } else {
                        self.im.user.set_answer('mama_num', content);
                        return go.utils
                            // get or create mama contact
                            .get_or_create_contact(content, self.im)
                            .then(function(mama_id) {
                                self.im.user.set_answer('mama_id', mama_id);
                                return 'state_msg_receiver';
                            });
                    }
                }
            });
        });

        self.add('state_r02_retry_number', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Sorry, that is not a valid number. Retry...'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return 'state_r02_retry_number';
                    } else {
                        self.im.user.set_answer('mama_num', content);
                        return go.utils
                            // get or create mama contact
                            .get_or_create_contact(content, self.im)
                            .then(function(mama_id) {
                                self.im.user.set_answer('mama_id', mama_id);
                                return 'state_msg_receiver';
                            });
                    }
                }
            });
        });

        self.add('state_msg_receiver', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Choose message receiver'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('mother_father', $('Mother & Father')),
                    new Choice('mother_only', $('Only Mother')),
                    new Choice('father_ony', $('Only Father')),
                    new Choice('family_member', $('Family member')),
                    new Choice('trusted_friend', $('Trusted friend'))

                ],
                next: function(choice) {
                    if (choice.value == 'mother_father') {
                        return 'state_father_msisdn';
                    }
                    else {
                        return 'state_receiver_msisdn';
                    }
                }
            });
        });

        self.add('state_receiver_msisdn', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Please enter number'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return 'state_r02_retry_number';  // error message, allow retry
                    } else {
                        return 'state_pregnancy_status';
                    }
                }
            });
        });

        self.add('state_father_msisdn', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Please enter number (Father)'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return 'state_r02_retry_number';  // error message, allow retry
                    } else {
                        return 'state_mother_msisdn';
                    }
                }
            });
        });

        self.add('state_mother_msisdn', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Please enter number (Mother)'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return 'state_r02_retry_number'; // error message, allow retry
                    } else {
                        return 'state_pregnancy_status';
                    }
                }
            });
        });

        self.add('state_pregnancy_status', function(name) {
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

        self.add('state_r05_last_period', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Last period?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('state_r5A_period_month', $('This year')),
                    new Choice('state_r5B_period_month', $('Last year'))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        self.add('state_r5A_period_month', function(name) {
            var startDate = go.utils.get_today(self.im.config);
            var currentMonth = today.format("MM");
            var monthsToDisplay = currentMonth <= 10 ? currentMonth : 10;
            if (currentMonth > 10) {
                startDate.add('month', (12 - currentMonth));
            }
            console.log('today month: '+currentMonth);
            console.log('monthsToDisplay: '+monthsToDisplay);
            console.log('startDate: '+startDate);
            return new PaginatedChoiceState(name, {
                question: $(questions[name]),
                characters_per_page: 182,
                options_per_page: null,
                more: $('More'),
                back: $('Back'),
                choices: go.utils.make_month_choices($, today, monthsToDisplay, 1),
                next: 'state_last_period_day'
            });
        });

        self.add('state_r05_birth_year', function(name) {
            var today = go.utils.get_today(self.im.config);
            var monthsToDisplay = today.format("MM");
            console.log('today: '+today);
            console.log('monthsToDisplay: '+monthsToDisplay);
            return new PaginatedChoiceState(name, {
                question: $(questions[name]),
                characters_per_page: 182,
                options_per_page: null,
                more: $('More'),
                back: $('Back'),
                choices: go.utils.make_month_choices($, today, monthsToDisplay, 1),
                next: 'state_last_period_day'
            });
        });

        self.add('state_r06_birth_month', function(name) {
            var speech_option;
            self.im.user.answers.state_pregnancy_status === 'pregnant'
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
                    var birth_date = go.utils.get_baby_dob(self.im, content);
                    if (birth_date === 'invalid date') {
                        return 'state_r14_retry_birth_day';
                    } else {
                        self.im.user.set_answer('birth_date', birth_date);
                        return 'state_r09_language';
                    }
                }
            });
        });

        self.add('state_r14_retry_birth_day', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Retry birth day'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    var birth_date = go.utils.get_baby_dob(self.im, content);
                    if (birth_date === 'invalid date') {
                        return 'state_r14_retry_birth_day';
                    } else {
                        self.im.user.set_answer('birth_date', birth_date);
                        return 'state_r09_language';
                    }
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
                .save_contact_info_and_subscribe(self.im)
                .then(function() {
                    return go.utils
                        .vumi_send_text(self.im, self.im.user.answers.mama_num,
                            self.im.config.reg_complete_sms)
                        .then(function() {
                            return self.states.create('state_r13_end');
                        });
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
