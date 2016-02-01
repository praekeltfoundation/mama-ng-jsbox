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

    check_sms_subscription: function(msisdn) {
        return Q()
            .then(function(q_response) {
                return msisdn === '082444';
            });
    },

    check_voice_subscription: function(msisdn) {
        return Q()
            .then(function(q_response) {
                return msisdn === '082555';
            });
    },

    check_msg_type: function(msisdn) {
        return go.utils
            .check_sms_subscription(msisdn)
            .then(function(is_subscribed_for_sms) {
                return is_subscribed_for_sms ? true : false;
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

    make_month_choices: function($, start, limit, increment) {
        var choices = [
            new Choice('072015', $('July 15')),
            new Choice('062015', $('June 15')),
            new Choice('052015', $('May 15')),
            new Choice('042015', $('Apr 15')),
            new Choice('032015', $('Mar 15')),
            new Choice('022015', $('Feb 15')),
            new Choice('012015', $('Jan 15')),
            new Choice('122014', $('Dec 14')),
            new Choice('112014', $('Nov 14')),
        ];
        return choices;
    },

    "commas": "commas"
};

go.app = function() {
    var vumigo = require('vumigo_v02');
    //var MetricsHelper = require('go-jsbox-metrics-helper'); //..? unique hello mama id..?
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    //var PaginatedChoiceState = vumigo.states.PaginatedChoiceState;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;


    var GoFC = App.extend(function(self) {
        App.call(self, 'state_start');
        var $ = self.$;
        var interrupt = true;

        self.init = function() {

            // Use the metrics helper to add some metrics
            //mh = new MetricsHelper(self.im);
            //mh
                // Total unique users
            //    .add.total_unique_users('total.ussd.unique_users')

                // Total sessions
            //    .add.total_sessions('total.ussd.sessions');

                // Total times reached state_timed_out
                /*.add.total_state_actions(
                    {
                        state: 'state_timed_out',
                        action: 'enter'
                    },
                    'total.reached_state_timed_out'
                );*/

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
            "state_msisdn_permission":  //st-B
                "Welcome to Hello Mama. Do you have permission to manage the number [MSISDN]?",
            "state_msisdn_no_permission":  // unnamed state on flow diagram
                "We're sorry, you do not have permission to update the preferences for this subscriber.",
            "state_language":   //st-D
                "Welcome to Hello Mama. Please choose your language",
            "state_registered_msisdn":  //st-C
                "Please enter the number which is registered to receive messages. For example, 0803304899",
            "state_main_menu":  //st-A
                "Select:",
            "state_msisdn_not_recognised":  //st-F
                "We do not recognise this number. Please dial from the registered number or sign up with your local Community Health Extension worker.",
            "state_already_registered_baby":
                "You are already registered for baby messages.",
            "state_new_registeration_baby":
                "Thank you. You will now receive messages about caring for baby",
            "state_change_menu_sms":
                "Please select what you would like to do:",
            "state_voice_days":
                "We will call twice a week. On what days would the person like to receive messages?",
            "state_voice_times":
                "Thank you. At what time would they like to receive these calls?",
            "state_voice_confirm":
                "Thank you. You will now start receiving voice calls between [time] on [days].",
            "state_change_menu_voice":
                "Please select what you would like to do:",
            "state_sms_confirm":
                "Thank you. You will now receive text messages.",
            "state_new_msisdn":
                "Please enter the new mobile number you would like to receive weekly messages on. For example, 0803304899",
            "state_msg_receiver":
                "Who will receive these messages?",
            "state_msg_receiver_confirm":
                "Thank you. The number which receives messages has been updated.",
            "state_msg_language":
                "What language would this person like to receive these messages in?",
            "state_msg_language_confirm":
                "Thank you. You language preference has been updated and you will start to receive messages in this language.",
            "state_optout_reason":
                "Please tell us why you no longer want to receive messages so we can help you further.",
            "state_loss_subscription":
                "We are sorry for your loss. Would you like to receive a small set of free messages from Hello Mama that could help you in this difficult time?",
            "state_loss_subscription_confirm":
                "Thank you. You will now receive messages to support you during this difficult time.",
            "state_end_optout":
                "Thank you. You will no longer receive messages",
            "state_end_exit":
                "Thank you for using the Hello Mama service"
        };

        var errors = {
            "state_registered_msisdn":
                "Mobile number not registered."
        };

        get_error_text = function(name) {
            return errors[name] || "Sorry not a valid input. " + questions[name];
        };



    // TIMEOUT HANDLING

        // override normal state adding
        self.add = function(name, creator) {
            self.states.add(name, function(name, opts) {
                if (!interrupt || !go.utils.timed_out(self.im) /*|| !go.utils.should_restart(self.im)*/)
                    return creator(name, opts);
                interrupt = false;
                opts = opts || {};
                opts.name = name;
                // Prevent previous content being passed to next state
                self.im.msg.content = null;
                return self.states.create('state_msisdn_permission', opts);
            });
        };

    // START STATE

        // ROUTING
        self.states.add('state_start', function() {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return self.states.create("state_check_msisdn");
        });

        // Interstitial start state - evaluating whether user is registered
        /*self.add('state_check_msisdn', function(name) {
            return go.utils
                .get_or_create_contact(self.im.user.addr, self.im)
                .then(function(user_id) {
                    return go.utils
                        .is_registered(user_id, self.im)
                        .then(function(recognised) {
                            if (recognised) {
                                return self.states.create('state_msisdn_permission');
                            } else {
                                return self.states.create('state_language');
                            }
                        });
                });
        });*/

        self.add('state_check_msisdn', function(name) {
            return go.utils
                .check_msisdn_hcp(self.im.user.addr)
                .then(function(recognised) {
                    if (recognised) {
                        return self.states.create('state_msisdn_permission');
                    } else {
                        return self.states.create('state_language');
                    }
                });
        });


    // INITIAL STATES

        // ChoiceState st-B
        self.add('state_msisdn_permission', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('state_main_menu', $("Yes")),
                    new Choice('state_msisdn_no_permission', $("No")),
                    new Choice('state_registered_msisdn', $("Change the number I'd like to manage"))
                  ],
                  error: $(get_error_text(name)),
                  next: function(choice) {
                      return choice.value;
                  }
              });
        });

        // unnamed on flow diagram
        self.add('state_msisdn_no_permission', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                //next: 'state_start'
            });
        });

        // EndState st-F
        self.add('state_msisdn_not_recognised', function(name) {
            return new EndState(name, {
                text: $(questions[name])
            });
        });

        // ChoiceState st-D
        self.add('state_language', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('english', $("English")),
                    new Choice('hausa', $("Hausa")),
                    new Choice('igbo', $("Igbo"))
                  ],
                  error: $(get_error_text(name)),
                  next: 'state_registered_msisdn'
              });
        });

        // FreeText st-C
        self.add('state_registered_msisdn', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
                    }
                },
                next: function(content) {
                        return go.utils
                            .check_msisdn_hcp(content)
                            .then(function(recognised) {
                                if (recognised) {
                                    return 'state_main_menu';
                                } else {
                                    return 'state_msisdn_not_recognised';
                                }
                            });
                }
            });
        });

        // ChoiceState st-A
        self.add('state_main_menu', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('state_check_baby_subscription', $("Start Baby messages")),
                    new Choice('state_check_msg_type', $("Change message preferences")),
                    new Choice('state_new_msisdn', $("Change my number")),
                    new Choice('state_msg_language', $("Change language")),
                    new Choice('state_optout_reason', $("Stop receiving messages"))
                ],
                error: $(get_error_text(name)),
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // CHANGE STATES

        // Interstitials
        self.add('state_check_baby_subscription', function(name) {
            return go.utils
                .check_baby_subscription(self.im.user.addr)
                .then(function(is_subscribed) {
                    if (is_subscribed) {
                        return self.states.create('state_already_registered_baby');
                    } else {
                        return self.states.create('state_new_registeration_baby');
                    }
                });
        });

        self.add('state_check_msg_type', function(name) {
            return go.utils
                .check_msg_type(self.im.user.addr)
                .then(function(is_subscribed_for_sms) {   //assuming a registered user always has a default subscription
                    if (is_subscribed_for_sms) {
                        return self.states.create('state_change_menu_sms');
                    } else {
                        return self.states.create('state_change_menu_voice');
                    }
                });
        });

        // ChoiceState st-01
        self.add('state_already_registered_baby', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('state_main_menu', $("Back to main menu")),
                    new Choice('state_end_exit', $("Exit"))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // EndState st-02
        self.add('state_new_registeration_baby', function(name) {
            return new EndState(name, {
                text: $(questions[name])
            });
        });

        // ChoiceState st-03
        self.add('state_change_menu_sms', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('to_voice', $("Change from text to voice messages")),
                    new Choice('back', $("Back to main menu"))
                ],
                next: function(choice) {
                    return choice.value === 'to_voice'
                        ? 'state_voice_days'
                        : 'state_main_menu';
                }
            });
        });

        // ChoiceState st-04
        self.add('state_voice_days', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('mon_wed', $("Monday and Wednesday")),
                    new Choice('tue_thu', $("Tuesday and Thursday"))
                ],
                next: 'state_voice_times'
            });
        });

        // ChoiceState st-05
        self.add('state_voice_times', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('9_11', $("Between 9-11am")),
                    new Choice('2_5', $("Between 2-5pm"))
                ],
                next: 'state_voice_confirm'
            });
        });

        // EndState st-06
        self.add('state_voice_confirm', function(name) {
            return new EndState(name, {
                text: $(questions[name])
            });
        });

        // ChoiceState st-07
        self.add('state_change_menu_voice', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('state_voice_days', $("Change the day and time I receive messages")),
                    new Choice('state_sms_confirm', $("Change from voice to text messages")),
                    new Choice('state_main_menu', $("Back to main menu"))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // EndState st-08
        self.add('state_sms_confirm', function(name) {
            return new EndState(name, {
                text: $(questions[name])
            });
        });

        // FreeText st-09
        self.add('state_new_msisdn', function(name) {
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

        // ChoiceState st-10
        self.add('state_msg_receiver', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('mother', $("The Mother")),
                    new Choice('father', $("The Father")),
                    new Choice('family_member', $("Family member")),
                    new Choice('trusted_friend', $("Trusted friend"))
                ],
                next: 'state_msg_receiver_confirm'
            });
        });

        // EndState st-11
        self.add('state_msg_receiver_confirm', function(name) {
            return new EndState(name, {
                text: $(questions[name])
            });
        });

        // ChoiceState st-12
        self.add('state_msg_language', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('english', $("English")),
                    new Choice('hausa', $("Hausa")),
                    new Choice('igbo', $("Igbo"))
                ],
                next: 'state_msg_language_confirm'
            });
        });

        // EndState st-13
        self.add('state_msg_language_confirm', function(name) {
            return new EndState(name, {
                text: $(questions[name])
            });
        });

        // ChoiceState st-14
        self.add('state_optout_reason', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('state_loss_subscription', $("Mother miscarried")),
                    new Choice('state_loss_subscription', $("Baby stillborn")),
                    new Choice('state_loss_subscription', $("Baby passed away")),
                    new Choice('state_end_optout', $("Messages not useful")),
                    new Choice('state_end_optout', $("Other"))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // ChoiceState st-15
        self.add('state_loss_subscription', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                error: $(get_error_text(name)),
                choices: [
                    new Choice('yes', $("Yes")),
                    new Choice('no', $("No"))
                ],
                next: function(choice) {
                    if(choice.value === 'yes') {
                        return 'state_loss_subscription_confirm';
                    }
                    else {
                        return 'state_end_optout';
                    }
                }
            });
        });

        // EndState st-16
        self.add('state_loss_subscription_confirm', function(name) {
            return new EndState(name, {
                text: $(questions[name])
            });
        });

        // EndState st-17
        self.add('state_end_optout', function(name) {
            return new EndState(name, {
                text: $(questions[name])
            });
        });

        // EndState st-18
        self.add('state_end_exit', function(name) {
            return new EndState(name, {
                text: $(questions[name])
            });
        });

    });

    return {
        GoFC: GoFC
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