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
        if (im.user.answers.state_pregnancy_status === 'baby') {
            im.user.answers.state_baby_birth_year === 'last_year'
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

// SERVICE API CALL

    service_api_call: function (service, method, params, payload, endpoint, im) {
        var http = new JsonApi(im, {
            headers: {
                'Authorization': ['Token ' + im.config.services[service].api_token]
            }
        });
        switch (method) {
            case "post":
                return http.post(im.config.services[service].url + endpoint, {
                    data: payload
                });
            case "get":
                return http.get(im.config.services[service].url + endpoint, {
                    params: params
                });
            case "patch":
                return http.patch(im.config.services[service].url + endpoint, {
                    data: payload
                });
            case "put":
                return http.put(im.config.services[service].url + endpoint, {
                    params: params,
                  data: payload
                });
            case "delete":
                return http.delete(im.config.services[service].url + endpoint);
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
                } else if (msisdn === '082222') {
                    return 'voice';
                } else {
                    return 'none';
                }
            });
    },

    check_role: function(msisdn) {
        return Q()
            .then(function(q_response) {
                if (msisdn === '082101' || msisdn === '082555') {
                    return 'father_role';
                }
                else {
                    return 'mother_role';
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

    get_contact_by_msisdn: function(msisdn, im) {
        var params = {
            "details__addresses__msisdn": msisdn
        };
        return go.utils
            .service_api_call('identities', 'get', params, null, 'identities/search/', im)
            .then(function(json_get_response) {
                var contacts_found = json_get_response.data.results;
                // Return the first contact's id
                return (contacts_found.length > 0)
                    ? contacts_found[0]
                    : null;
            });
    },

    get_contact_by_id: function(contact_id, im) {
        var endpoint = 'identities/' + contact_id + '/';
        return go.utils
            .service_api_call('identities', 'get', {}, null, endpoint, im)
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
            .service_api_call("identities", "post", null, payload, 'identities', im)
            .then(function(json_post_response) {
                var contact_created = json_post_response.data;
                // Return the contact's id
                return contact_created.id;
            });
    },

    // Gets a contact if it exists, otherwise creates a new one
    get_or_create_contact: function(msisdn, im) {
        msisdn = go.utils.normalize_msisdn(msisdn, '234');  // nigeria
        return go.utils
            // Get contact id using msisdn
            .get_contact_by_msisdn(msisdn, im)
            .then(function(contact) {
                if (contact !== null) {
                    // If contact exists, return the id
                    return contact;
                } else {
                    // If contact doesn't exist, create it
                    return go.utils
                        .create_contact(msisdn, im)
                        .then(function(contact) {
                            return contact;
                        });
                }
            });
    },

    update_contact: function(im, contact) {
        // For patching any field on the contact
        var endpoint = 'identities/' + contact.id + '/';
        return go.utils
            .service_api_call('identities', 'patch', {}, contact, endpoint, im)
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

        var year_text = im.user.answers.state_baby_birth_year;
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

        var month = im.user.answers.state_12A_baby_birth_month ||
                    im.user.answers.state_12B_baby_birth_month;
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
            contact: "/api/v1/identities/" + mama_contact.id + "/",
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
            .service_api_call("subscriptions", "post", null, payload, "subscriptions/", im)
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
            .service_api_call("subscriptions", "get", params, null, "subscriptions/", im)
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
                    var endpoint = "subscriptions/" + updated_subscription.id + '/';
                    updated_subscription.active = false;
                    // store the patch calls to be made
                    patch_calls.push(function() {
                        return go.utils.service_api_call("subscriptions", "patch", {}, updated_subscription, endpoint, im);
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
        var endpoint = "subscriptions/" + subscription.id + '/';
        return go.utils
            .service_api_call("subscriptions", 'patch', {}, subscription, endpoint, im)
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

    eval_dialback_reminder: function(e, im, user_id, $, sms_content) {
        var close_state = e.im.state.name;
        var non_dialback_sms_states = [
            'state_start',
            'state_auth_code',
            'state_end_voice',
            'state_end_sms'
        ];
        if (non_dialback_sms_states.indexOf(close_state) === -1
          && e.user_terminated) {
            return go.utils
                .get_contact_by_id(user_id, im)
                .then(function(user) {
                    if (!user.details.dialback_sent) {
                        user.details.dialback_sent = true;
                        return Q.all([
                            go.utils.send_text(im, user_id, sms_content),
                            go.utils.update_contact(im, user)
                        ]);
                    }
                });
        } else {
            return Q();
        }
    },

    send_text: function(im, user_id, sms_content) {
        var payload = {
            "contact": user_id,
            "content": sms_content.replace("{{channel}}", im.config.channel)
                // $ does not work well with fixtures here since it's an object
        };
        return go.utils
            .service_api_call("outbound", "post", null, payload, 'outbound/', im)
            .then(function(json_post_response) {
                var outbound_response = json_post_response.data;
                // Return the outbound id
                return outbound_response.id;
            });
    },

// TIMEOUT HANDLING

    timed_out: function(im) {
        var no_redirects = [
            'state_start',
            'state_end_voice',
            'state_end_sms'
        ];
        return im.msg.session_event === 'new'
            && im.user.state.name
            && no_redirects.indexOf(im.user.state.name) === -1;
    },

// REGISTRATION HANDLING

    compile_registration_info: function(im) {
        var registration_info = {
            stage: im.user.answers.state_pregnancy_status,
            data: {
                msg_receiver: im.user.answers.state_msg_receiver,
                mother_id: im.user.answers.mother_id,
                receiver_id: im.user.answers.receiver_id,
                operator_id: im.user.answers.operator_id,
                language: im.user.answers.state_msg_language,
                msg_type: im.user.answers.state_msg_type,
            }
        };
        if (im.user.answers.state_pregnancy_status === 'prebirth') {
            registration_info.data.last_period_date = im.user.answers.valid_date;
        } else if (im.user.answers.state_pregnancy_status === 'postbirth') {
            registration_info.data.baby_dob = im.user.answers.valid_date;
        }
        return registration_info;
    },

    save_registration: function(im) {
        registration_info = go.utils.compile_registration_info(im);
        console.log(registration_info);
        return Q();
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
        var params = {
            "details__personnel_code": content
        };
        return go.utils
            .service_api_call('identities', 'get', params, null, 'identities/search/', im)
            .then(function(json_get_response) {
                var contacts_found = json_get_response.data.results;
                // Return the number of contact's found
                return contacts_found.length > 0;
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
    var moment = require('moment');
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

    // START

        self.states.add('state_start', function(name) {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return go.utils
                .get_or_create_contact(self.im.user.addr, self.im)
                .then(function(user) {
                    self.im.user.set_answer('user_id', user.id);
                    if (user.details.personnel_code) {
                        return self.states.create('state_msg_receiver');
                    } else {
                        return self.states.create('state_personnel_auth');
                    }
                });
        });


    // REGISTRATION

        // FreeText st-01
        self.add('state_personnel_auth', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    return go.utils
                        .validate_personnel_code(self.im, content)
                        .then(function(valid_personnel_code) {
                            if (valid_personnel_code) {
                                return 'state_msg_receiver';
                            } else {
                                return 'state_retry_personnel_auth';
                            }
                        });
                }
            });
        });

        // FreeText st-17
        self.add('state_retry_personnel_auth', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Sorry, that is not a valid number. Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    return go.utils
                        .validate_personnel_code(self.im, content)
                        .then(function(valid_personnel_code) {
                            if (valid_personnel_code) {
                                return 'state_msg_receiver';
                            } else {
                                return 'state_retry_personnel_auth';
                            }
                        });
                }
            });
        });

        // ChoiceState st-02
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
                    } else {
                        return 'state_receiver_msisdn';
                    }
                }
            });
        });

        // FreeText st-03
        self.add('state_receiver_msisdn', function(name) {
            var speech_option = 1;
            return new FreeText(name, {
                question: $('Please enter number'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return 'state_retry_receiver_msisdn';
                    } else {
                        return 'state_pregnancy_status';
                    }
                }
            });
        });

        // FreeText st-3A
        self.add('state_father_msisdn', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Please enter number (Father)'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return 'state_retry_father_msisdn';
                    } else {
                        return 'state_mother_msisdn';
                    }
                }
            });
        });

        // FreeText st-3B
        self.add('state_mother_msisdn', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Please enter number (Mother)'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return 'state_retry_mother_msisdn';
                    } else {
                        return 'state_pregnancy_status';
                    }
                }
            });
        });

        // ChoiceState st-04
        self.add('state_pregnancy_status', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Pregnant or baby'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('state_last_period_year', $('Pregnant')),
                    new Choice('state_baby_birth_year', $('Baby'))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

    // pregnant
        // ChoiceState st-05
        self.add('state_last_period_year', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Last period?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('state_this_year_period_month', $('This year')),
                    new Choice('state_last_year_period_month', $('Last year'))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // ChoiceState st-5A
        self.add('state_this_year_period_month', function(name) {
            var speech_option = 1;
            return new ChoiceState(name, {
                question: $('Period month this year?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('jan', $('January')),
                    new Choice('feb', $('February')),
                    new Choice('mar', $('March')),
                    new Choice('apr', $('April')),
                    new Choice('may', $('May')),
                    new Choice('jun', $('June')),
                    new Choice('jul', $('July')),
                    new Choice('aug', $('August')),
                    new Choice('sep', $('September')),
                    new Choice('oct', $('October')),
                    new Choice('nov', $('November')),
                    new Choice('dec', $('December'))
                ],
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    var currentMonth = parseInt(today.format("MM"));
                    var validStartMonth = currentMonth <= 10 ? 0 : currentMonth-10;
                    var choiceMonth = parseInt(today.month(choice.value).format("MM"));

                    if (choiceMonth <= currentMonth && choiceMonth > validStartMonth)
                    {
                        return 'state_last_period_day';
                    }
                    else {
                        return 'state_retry_this_year_period_month';
                    }
                }
            });
        });

        // retry state 5A
        self.add('state_retry_this_year_period_month', function(name) {
            var speech_option = 1;
            return new ChoiceState(name, {
                question: $("Invalid input. Period month?"),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('jan', $('January')),
                    new Choice('feb', $('February')),
                    new Choice('mar', $('March')),
                    new Choice('apr', $('April')),
                    new Choice('may', $('May')),
                    new Choice('jun', $('June')),
                    new Choice('jul', $('July')),
                    new Choice('aug', $('August')),
                    new Choice('sep', $('September')),
                    new Choice('oct', $('October')),
                    new Choice('nov', $('November')),
                    new Choice('dec', $('December'))
                ],
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    var currentMonth = parseInt(today.format("MM"));
                    var validStartMonth = currentMonth <= 10 ? 0 : currentMonth-10;
                    var choiceMonth = parseInt(today.month(choice.value).format("MM"));

                    if (choiceMonth <= currentMonth && choiceMonth > validStartMonth)
                    {
                        return 'state_last_period_day';
                    }
                    else {
                        return 'state_retry_this_year_period_month';
                    }
                }
            });
        });

        // ChoiceState st-5B
        self.add('state_last_year_period_month', function(name) {
            var speech_option = 1;
            return new ChoiceState(name, {
                question: $("Period month last year?"),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('jan', $('January')),
                    new Choice('feb', $('February')),
                    new Choice('mar', $('March')),
                    new Choice('apr', $('April')),
                    new Choice('may', $('May')),
                    new Choice('jun', $('June')),
                    new Choice('jul', $('July')),
                    new Choice('aug', $('August')),
                    new Choice('sep', $('September')),
                    new Choice('oct', $('October')),
                    new Choice('nov', $('November')),
                    new Choice('dec', $('December'))
                ],
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    today.subtract('year', 1);
                    var currentMonth = parseInt(today.format("MM"));
                    var validStartMonth = currentMonth <= 10 ? ((currentMonth+13) % 10) : -1;
                    validStartMonth = validStartMonth === 0 ? 10 : validStartMonth+10;
                    var choiceMonth = parseInt(today.month(choice.value).format("MM"));

                    if (validStartMonth !== -1){
                        if (choiceMonth > currentMonth && choiceMonth >= validStartMonth)
                        {
                            return 'state_last_period_day';
                        }
                        else {
                            return 'state_retry_last_year_period_month';
                        }
                    }
                }
            });
        });

        // retry state 5B
        self.add('state_retry_last_year_period_month', function(name) {
            var speech_option = 1;
            return new ChoiceState(name, {
                question: $("Invalid input. Period month?"),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('jan', $('January')),
                    new Choice('feb', $('February')),
                    new Choice('mar', $('March')),
                    new Choice('apr', $('April')),
                    new Choice('may', $('May')),
                    new Choice('jun', $('June')),
                    new Choice('jul', $('July')),
                    new Choice('aug', $('August')),
                    new Choice('sep', $('September')),
                    new Choice('oct', $('October')),
                    new Choice('nov', $('November')),
                    new Choice('dec', $('December'))
                ],
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    today.subtract('year', 1);
                    var currentMonth = parseInt(today.format("MM"));
                    var validStartMonth = currentMonth <= 10 ? ((currentMonth+13) % 10) : -1;
                    validStartMonth = validStartMonth === 0 ? 10 : validStartMonth+10;
                    var choiceMonth = parseInt(today.month(choice.value).format("MM"));

                    if (validStartMonth !== -1){
                        if (choiceMonth > currentMonth && choiceMonth >= validStartMonth)
                        {
                            return 'state_last_period_day';
                        }
                        else {
                            return 'state_retry_last_year_period_month';
                        }
                    }
                }
            });
        });

        // FreeText st-06
        self.add('state_last_period_day', function(name) {
            var dateRef = go.utils.get_today(self.im.config);
            var month = self.im.user.answers.state_this_year_period_month ||
                        self.im.user.answers.state_last_year_period_month;
            var year;
            if (self.im.user.answers.state_this_year_period_month) {
                year = dateRef.format("YYYY");
            } else {
                year = dateRef.subtract('year', 1).format("YYYY");
            }
            var monthNum = dateRef.month(month).format("MM");
            var speech_option = go.utils.get_speech_option_birth_day(
                self.im, monthNum);

            return new FreeText(name, {
                question: $('Last period day {{ month }} [{{ year}}]'
            ).context({ month: month, year: year }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    var period_date = content+"-"+monthNum+"-"+year;
                    if (!go.utils.is_valid_date(period_date, "DD-MM-YYYY")) {
                        return 'state_retry_last_period_day';
                    } else {
                        self.im.user.set_answer('last_period_date', period_date);
                        return 'state_msg_language';
                    }
                }
            });
        });

        // FreeText st-19 (retry state 06)
        self.add('state_retry_last_period_day', function(name) {
            var dateRef = go.utils.get_today(self.im.config);
            var month = self.im.user.answers.state_this_year_period_month ||
                        self.im.user.answers.state_last_year_period_month;
            var year;
            if (self.im.user.answers.state_this_year_period_month) {
                year = dateRef.format("YYYY");
            } else {
                year = dateRef.subtract('year', 1).format("YYYY");
            }
            var monthNum = dateRef.month(month).format("MM");
            var speech_option = go.utils.get_speech_option_birth_day(
                self.im, monthNum);

            return new FreeText(name, {
                question: $('Retry period day'
            ).context({ month: month, year: year }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    var period_date = content+"-"+monthNum+"-"+year;
                    if (!go.utils.is_valid_date(period_date, 'DD-MM-YYYY')) {
                        return 'state_retry_last_period_day';
                    } else {
                        self.im.user.set_answer('last_period_date', period_date);
                        return 'state_msg_language';
                    }
                }
            });
        });

    // baby
        // ChoiceState st-12
        self.add('state_baby_birth_year', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Baby born?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('state_this_year_baby_birth_month', $('this year')),
                    new Choice('state_last_year_baby_birth_month', $('last year'))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // ChoiceState st-12A
        self.add('state_this_year_baby_birth_month', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Baby month this year?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices:
                [
                    new Choice('jan', $('January')),
                    new Choice('feb', $('February')),
                    new Choice('mar', $('March')),
                    new Choice('apr', $('April')),
                    new Choice('may', $('May')),
                    new Choice('jun', $('June')),
                    new Choice('jul', $('July')),
                    new Choice('aug', $('August')),
                    new Choice('sep', $('September')),
                    new Choice('oct', $('October')),
                    new Choice('nov', $('November')),
                    new Choice('dec', $('December'))
                ],
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    var currentMonth = parseInt(today.format("MM"));
                    var choiceMonth = parseInt(today.month(choice.value).format("MM"));

                    if (choiceMonth > currentMonth) {
                        return 'state_retry_this_year_baby_birth_month';
                    } else {
                        return 'state_baby_birth_day';
                    }
                }
            });
        });

        // retry state 12A
        self.add('state_retry_this_year_baby_birth_month', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Invalid input. Baby month?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices:
                [
                    new Choice('jan', $('January')),
                    new Choice('feb', $('February')),
                    new Choice('mar', $('March')),
                    new Choice('apr', $('April')),
                    new Choice('may', $('May')),
                    new Choice('jun', $('June')),
                    new Choice('jul', $('July')),
                    new Choice('aug', $('August')),
                    new Choice('sep', $('September')),
                    new Choice('oct', $('October')),
                    new Choice('nov', $('November')),
                    new Choice('dec', $('December'))
                ],
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    var currentMonth = parseInt(today.format("MM"));
                    var choiceMonth = parseInt(today.month(choice.value).format("MM"));

                    if (choiceMonth > currentMonth) {
                        return 'state_retry_this_year_baby_birth_month';
                    } else {
                        return 'state_baby_birth_day';
                    }
                }
            });
        });

        // ChoiceState st-12B
        self.add('state_last_year_baby_birth_month', function(name) {
            var speech_option = 1;
            return new ChoiceState(name, {
                question: $('Baby month last year?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('jan', $('January')),
                    new Choice('feb', $('February')),
                    new Choice('mar', $('March')),
                    new Choice('apr', $('April')),
                    new Choice('may', $('May')),
                    new Choice('jun', $('June')),
                    new Choice('jul', $('July')),
                    new Choice('aug', $('August')),
                    new Choice('sep', $('September')),
                    new Choice('oct', $('October')),
                    new Choice('nov', $('November')),
                    new Choice('dec', $('December'))
                ],
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    var currentMonth = parseInt(today.format("MM"));
                    var choiceMonth =  parseInt(today.month(choice.value).format("MM"));
                    if (choiceMonth < currentMonth) {
                        return 'state_retry_last_year_baby_birth_month';
                    } else {
                        return 'state_baby_birth_day';
                    }
                }
            });
        });

        // retry state 12B
        self.add('state_retry_last_year_baby_birth_month', function(name) {
            var speech_option = 1;

            return new ChoiceState(name, {
                question: $('Invalid input. Baby month?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('jan', $('January')),
                    new Choice('feb', $('February')),
                    new Choice('mar', $('March')),
                    new Choice('apr', $('April')),
                    new Choice('may', $('May')),
                    new Choice('jun', $('June')),
                    new Choice('jul', $('July')),
                    new Choice('aug', $('August')),
                    new Choice('sep', $('September')),
                    new Choice('oct', $('October')),
                    new Choice('nov', $('November')),
                    new Choice('dec', $('December'))
                ],
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    var currentMonth = parseInt(today.format("MM"));
                    var choiceMonth = parseInt(today.month(choice.value).format("MM"));

                    if (choiceMonth < currentMonth) {
                        return 'state_retry_last_year_baby_birth_month';
                    } else {
                        return 'state_baby_birth_day';
                    }
                }
            });
        });

        // FreeText st-13
        self.add('state_baby_birth_day', function(name) {
            var dateRef = go.utils.get_today(self.im.config);
            var month = self.im.user.answers.state_this_year_baby_birth_month ||
                        self.im.user.answers.state_last_year_baby_birth_month;
            var year;
            if (self.im.user.answers.state_this_year_baby_birth_month) {
                year = dateRef.format("YYYY");
            } else {
                year = dateRef.subtract('year', 1).format("YYYY");
            }
            var monthNum = dateRef.month(month).format("MM");
            var speech_option = go.utils.get_speech_option_birth_day(
                self.im, monthNum);

            return new FreeText(name, {
                question: $('Birth day in {{ month }} [{{ year}}]'
            ).context({ month: month, year: year }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    var birth_date = content+'-'+monthNum+'-'+year;//go.utils.get_baby_dob(self.im, content);;
                    if (!(new moment(birth_date, "DD-MM-YYYY").isValid())) {
                        return 'state_retry_baby_birth_day';
                    } else {
                        self.im.user.set_answer('birth_date', birth_date);
                        return 'state_msg_language';
                    }
                }
            });
        });

        // FreeText st-18 (retry state st-13)
        self.add('state_retry_baby_birth_day', function(name) {
            var dateRef = go.utils.get_today(self.im.config);
            var month = self.im.user.answers.state_this_year_baby_birth_month ||
                        self.im.user.answers.state_last_year_baby_birth_month;
            var year;
            if (self.im.user.answers.state_12A_baby_birth_month) {
                year = dateRef.format("YYYY");
            } else {
                year = dateRef.subtract('year', 1).format("YYYY");
            }
            var monthNum = dateRef.month(month).format("MM");
            var speech_option = go.utils.get_speech_option_birth_day(
                self.im, monthNum);

            return new FreeText(name, {
                question: $('Retry birth day'
            ).context({ month: month, year: year }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    var birth_date = content+'-'+monthNum+'-'+year;//go.utils.get_baby_dob(self.im, content);;
                    if (!(new moment(birth_date, "DD-MM-YYYY").isValid())) {
                        return 'state_retry_baby_birth_day';
                    } else {
                        //self.im.user.set_answer('birth_date', birth_date);
                        return 'state_msg_language';
                    }
                }
            });
        });

        // ChoiceState st-07
        self.add('state_msg_language', function(name) {
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
                next: 'state_msg_type'
            });
        });

        // ChoiceState st-08
        self.add('state_msg_type', function(name) {
            var speech_option = '1';
            var routing = {
                    'sms': 'state_end_sms',
                    'voice': 'state_voice_days'
            };
            return new ChoiceState(name, {
                question: $('Channel?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('voice', $('voice')),
                    new Choice('sms', $('sms'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        // EndState st-14
        self.add('state_end_sms', function(name) {
            var speech_option = '1';
            var text = $('Thank you! three times a week.');
            return new EndState(name, {
                text: text,
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_start'
            });
        });

        // ChoiceState st-09
        self.add('state_voice_days', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Message days?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('mon_wed', $('mon_wed')),
                    new Choice('tue_thu', $('tue_thu'))
                ],
                next: 'state_voice_times'
            });
        });

        // ChoiceState st-10
        self.add('state_voice_times', function(name) {
            var days = self.im.user.answers.state_voice_days;
            var speech_option = go.utils.get_speech_option_days(days);
            return new ChoiceState(name, {
                question: $('Message time?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('9_11', $('9_11')),
                    new Choice('2_5', $('2_5'))
                ],
                next: 'state_voice_save'
            });
        });

        // interstitial
        self.add('state_voice_save', function(name) {
            return go.utils
                .save_contact_info_and_subscribe(self.im)
                .then(function() {
                    return go.utils
                        .vumi_send_text(self.im, self.im.user.answers.mama_num,
                            self.im.config.reg_complete_sms)
                        .then(function() {
                            return self.states.create('state_end_voice');
                        });
                });
        });

        // EndState st-11
        self.add('state_end_voice', function(name) {
            var time = self.im.user.answers.state_voice_times;
            var days = self.im.user.answers.state_voice_days;
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
