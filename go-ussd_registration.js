// WARNING: This is a generated file.
//          If you edit it you will be sad.
//          Edit src/app.js instead.

var go = {};
go;

/*jshint -W083 */
var vumigo = require('vumigo_v02');
var moment = require('moment');
var JsonApi = vumigo.http.api.JsonApi;
var Choice = vumigo.states.Choice;

// SHARED utils lib
go.utils = {

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

    get_january: function(config) {
        // returns current year january 1st moment date
        return go.utils.get_today(config).startOf('year');
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

    check_valid_alpha: function(input) {
        var alpha_only = new RegExp('^[A-Za-z]+$');
        return input !== '' && alpha_only.test(input);
    },

    is_valid_name: function(input) {
        // check that all chars are alphabetical
        return go.utils.check_valid_alpha(input);
    },

    make_month_choices: function($, startDate, limit, increment, valueFormat, labelFormat) {
        var choices = [];

        var monthIterator = startDate;
        for (var i=0; i<limit; i++) {
            choices.push(new Choice(monthIterator.format(valueFormat),
                                    $(monthIterator.format(labelFormat))));
            monthIterator.add(increment, 'months');
        }

        return choices;
    },

    "commas": "commas"
};

/*jshint -W083 */
var Q = require('q');
var moment = require('moment');

// PROJECT SPECIFIC utils lib

go.utils_HelloMama = Object.create(go.utils);

go.utils_HelloMama.
    check_msisdn_hcp = function(msisdn) {
        return Q()
            .then(function(q_response) {
                return msisdn === '082222' || msisdn === '082333'
                    || msisdn === '082444' || msisdn === '082555' || msisdn === '0803304899';
            });
    };

go.utils_HelloMama.
    find_healthworker_with_personnel_code = function(im, personnel_code) {
        var params = {
            "details__personnel_code": personnel_code
        };
        return go.utils
            .service_api_call('identities', 'get', params, null, 'identities/search/', im)
            .then(function(json_get_response) {
                var healthworkers_found = json_get_response.data.results;
                // Return the first healthworker if found
                return healthworkers_found[0];
            });
    };

go.utils_HelloMama.
    save_identities = function(im, msg_receiver, receiver_msisdn, father_msisdn,
                              mother_msisdn, operator_id) {
        // Creates identities for the msisdns entered in various states
        // and sets the identitity id's to user.answers for later use
        // msg_receiver: (str) person who will receive messages eg. 'mother_only'
        // *_msisdn: (str) msisdns of role players
        // operator_id: (str - uuid) id of healthworker making the registration
        if (msg_receiver === 'mother_only') {
            return go.utils_HelloMama
                // get or create mother's identity
                .get_or_create_identity({'msisdn': receiver_msisdn}, im, operator_id)
                .then(function(mother) {
                    im.user.set_answer('mother_id', mother.id);
                    im.user.set_answer('receiver_id', mother.id);
                    return;
                });
        } else if (['trusted_friend', 'family_member', 'father_only'].indexOf(msg_receiver) !== -1) {
            return go.utils_HelloMama
                // get or create msg_receiver's identity
                .get_or_create_identity({'msisdn': receiver_msisdn}, im, operator_id)
                .then(function(msg_receiver) {
                    im.user.set_answer('receiver_id', msg_receiver.id);
                    return go.utils_HelloMama
                        // create mother's identity - cannot get as no identifying information
                        .create_identity(im, null, msg_receiver.id, operator_id)
                        .then(function(mother) {
                            im.user.set_answer('mother_id', mother.id);
                            return;
                        });
                });
        } else if (msg_receiver === 'mother_father') {
            return Q
                .all([
                    // create father's identity
                    go.utils_HelloMama.get_or_create_identity({'msisdn': father_msisdn}, im, operator_id),
                    // create mother's identity
                    go.utils_HelloMama.get_or_create_identity({'msisdn': mother_msisdn}, im, operator_id),
                ])
                .spread(function(father, mother) {
                    im.user.set_answer('receiver_id', father.id);
                    im.user.set_answer('mother_id', mother.id);
                    return;
                });
        }
    };


    // function used to validate months for states 5A/5B & 12A/12B
go.utils_HelloMama.
    is_valid_month = function(today, choiceYear, choiceMonth, monthsValid) {
        var choiceDate = new moment(choiceYear+choiceMonth, "YYYYMM");

        var startDate = today.clone();
        // note: 1 is subtracted as current month is already included
        startDate = startDate.subtract('month', monthsValid - 1);
        startDate.date(1);  // set day of month to 1st

        // choice >= startDate && <= today/endDate
        if ((choiceDate.isSame(startDate) || choiceDate.isAfter(startDate)) &&
            (choiceDate.isSame(today) || choiceDate.isBefore(today))) {
            return true;
        } else {
            return false;
        }
    };

go.utils_HelloMama.
    get_year_value = function(today, year_choice) {
        return year_choice === 'this_year'
            ? today.year()
            : today.year() - 1;
    };

    // Determine whether contact is registered
go.utils_HelloMama.
    is_registered = function(contact_id, im) {
        return go.utils_HelloMama
            .get_identity(contact_id, im)
            .then(function(contact) {
                var true_options = ['true', 'True', true];
                return true_options.indexOf(contact.details.has_registered) !== -1;
            });
    };

go.utils_HelloMama.
    check_baby_subscription = function(msisdn) {
        return Q()
            .then(function(q_response) {
                return (msisdn === '082333');
            });
    };

go.utils_HelloMama.
    check_msg_type = function(msisdn) {
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
    };

go.utils_HelloMama.
    check_role = function(msisdn) {
        return Q()
            .then(function(q_response) {
                if (msisdn === '082101' || msisdn === '082555') {
                    return 'father_role';
                }
                else {
                    return 'mother_role';
                }
            });
    };

// VOICE UTILS

go.utils_HelloMama.
    should_restart = function(im) {
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
    };

    // Construct url string
go.utils_HelloMama.
    make_speech_url = function(im, name, lang, num, retry) {
        var url_start = im.config.services.voice_content.url + lang + '/' + name + '_' + num;
        if (retry) {
            url_start += '_retry';
        }
        var extension = '.mp3';
        return url_start + extension;
    };

    // Construct helper_data object
go.utils_HelloMama.
    make_voice_helper_data = function(im, name, lang, num, retry) {
        return {
            voice: {
                speech_url: go.utils_HelloMama.make_speech_url(im, name, lang, num, retry),
                wait_for: '#'
            }
        };
    };

go.utils_HelloMama.
    get_speech_option_pregnancy_status_day = function(im, month) {
        var speech_option_start;

        if (im.user.answers.state_pregnancy_status === 'prebirth') {
            im.user.answers.state_last_period_year === 'last_year'
                ? speech_option_start = 0
                : speech_option_start = 12;
        } else if (im.user.answers.state_pregnancy_status === 'postbirth') {
            im.user.answers.state_baby_birth_year === 'last_year'
                ? speech_option_start = 0
                : speech_option_start = 12;
        }

        var speech_option_num = speech_option_start + parseInt(month, 10);
        return speech_option_num.toString();
    };

go.utils_HelloMama.
    get_speech_option_days = function(days) {
        day_map = {
            'mon_wed': '1',
            'tue_thu': '2'
        };
        return day_map[days];
    },

go.utils_HelloMama.
    get_speech_option_year = function(year) {
        return year === 'this_year' ? '1' : '2';
    };

go.utils_HelloMama.
    get_speech_option_days_time = function(days, time) {
        var speech_option;

        day_map_9_11 = {
            'mon_wed': '1',
            'tue_thu': '2'
        };
        day_map_2_5 = {
            'mon_wed': '3',
            'tue_thu': '4'
        };
        time === '9_11' ? speech_option = day_map_9_11[days]
                        : speech_option = day_map_2_5[days];
        return speech_option;
    };

// REGISTRATION HANDLING

    go.utils_HelloMama.
        compile_reg_info = function(im) {
            var reg_info = {
                stage: im.user.answers.state_pregnancy_status,
                data: {
                    msg_receiver: im.user.answers.state_msg_receiver,
                    mother_id: im.user.answers.mother_id,
                    receiver_id: im.user.answers.receiver_id,
                    operator_id: im.user.answers.operator_id,
                    language: im.user.answers.state_msg_language,
                    msg_type: im.user.answers.state_msg_type,
                    user_id: im.user.answers.user_id
                }
            };

            // add data for last_period_date or baby_dob
            if (im.user.answers.state_pregnancy_status === 'prebirth') {
                reg_info.data.last_period_date = im.user.answers.working_date;
            } else if (im.user.answers.state_pregnancy_status === 'postbirth') {
                reg_info.data.baby_dob = im.user.answers.working_date;
            }
            return reg_info;
        };

    go.utils_HelloMama.
        save_registration = function(im) {
            // compile registration
            var reg_info = go.utils_HelloMama.compile_reg_info(im);
            return go.utils
                .service_api_call("registrations", "post", null, reg_info, "registrations/", im)
                .then(function(result) {
                    return result.id;
                });
        };

// IDENTITY HANDLING
    go.utils_HelloMama.
        get_identity_by_address = function(address, im) {
            // Searches the Identity Store for all identities with the provided address.
            // Returns the first identity object found
            // Address should be an object {address_type: address}, eg.
            // {'msisdn': '0821234444'}, {'email': 'me@example.com'}
            var address_type = Object.keys(address)[0];
            var address_val = address[address_type];
            var params = {};
            var search_string = 'details__addresses__' + address_type;
            params[search_string] = address_val;

            return go.utils
            .service_api_call('identities', 'get', params, null, 'identities/search/', im)
            .then(function(json_get_response) {
                var identities_found = json_get_response.data.results;
                // Return the first identity in the list of identities
                return (identities_found.length > 0)
                ? identities_found[0]
                : null;
            });
        };

        // Gets the identity from the Identity Store
        // Returns the identity object
    go.utils_HelloMama.
        get_identity = function(identity_id, im) {
            var endpoint = 'identities/' + identity_id + '/';
            return go.utils
            .service_api_call('identities', 'get', {}, null, endpoint, im)
            .then(function(json_get_response) {
                return json_get_response.data;
            });
        };

        // Create a new identity
    go.utils_HelloMama.
        create_identity = function(im, address, communicate_through_id, operator_id) {
            var payload = {};

            // compile base payload
            if (address) {
                var address_type = Object.keys(address);
                var addresses = {};
                addresses[address_type] = {};
                addresses[address_type][address[address_type]] = {};
                payload.details = {
                    "default_addr_type": "msisdn",
                    "addresses": addresses
                };
            }

            if (communicate_through_id) {
                payload.communicate_through = communicate_through_id;
            }

            // add operator_id if available
            if (operator_id) {
                payload.operator = operator_id;
            }

            return go.utils
            .service_api_call("identities", "post", null, payload, 'identities/', im)
            .then(function(json_post_response) {
                var contact_created = json_post_response.data;
                // Return the contact
                return contact_created;
            });
        };

        // Gets a contact if it exists, otherwise creates a new one
    go.utils_HelloMama.
        get_or_create_identity = function(address, im, operator_id) {
            if (address.msisdn) {
                address.msisdn = go.utils
                .normalize_msisdn(address.msisdn, im.config.country_code);
            }
            return go.utils_HelloMama
            // Get contact id using msisdn
            .get_identity_by_address(address, im)
            .then(function(contact) {
                if (contact !== null) {
                    // If contact exists, return the id
                    return contact;
                } else {
                    // If contact doesn't exist, create it
                    return go.utils_HelloMama
                    .create_identity(im, address, null, operator_id)
                    .then(function(contact) {
                        return contact;
                    });
                }
            });
        };

    go.utils_HelloMama.
        update_identity = function(im, contact) {
            // For patching any field on the contact
            var endpoint = 'identities/' + contact.id + '/';
            return go.utils
            .service_api_call('identities', 'patch', {}, contact, endpoint, im)
            .then(function(response) {
                return response.data.id;
            });
        };

    go.utils_HelloMama.
        update_mama_details = function(im, mama_contact, chew_phone_used) {
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
            mama_contact.details.lang = go.utils_HelloMama.get_lang(im);
            mama_contact.details.msg_type = im.user.answers.state_r10_message_type;
            mama_contact.details.voice_days = im.user.answers.state_r11_voice_days || 'sms';
            mama_contact.details.voice_times = im.user.answers.state_r12_voice_times || 'sms';
            return mama_contact;
        };

    go.utils_HelloMama.
        get_lang = function(im) {
            lang_map = {
                'english': 'eng_NG',
                'hausa': 'hau_NG',
                'igbo': 'ibo_NG'
            };
            return lang_map[im.user.answers.state_r09_language];
        },

// OPTOUT HANDLING

    go.utils_HelloMama.
        optout_loss_opt_in = function(im) {
            return go.utils_HelloMama
                .optout(im)
                .then(function(contact_id) {
                    // TODO #17 Subscribe to loss messages
                    return Q();
                });
        };

    go.utils_HelloMama.
        optout = function(im) {
            var mama_id = im.user.answers.mama_id;
            return Q
            .all([
                // get contact so details can be updated
                go.utils_HelloMama.get_identity(mama_id, im),
                // set existing subscriptions inactive
                go.utils_HelloMama.subscriptions_unsubscribe_all(mama_id, im)
            ])
            .spread(function(mama_contact, unsubscribe_result) {
                // set new mama contact details
                mama_contact.details.opted_out = true;
                mama_contact.details.optout_reason = im.user.answers.state_c05_optout_reason;

                // update mama contact
                return go.utils_HelloMama
                .update_identity(im, mama_contact);
            });
        };

// CHANGE HANDLING

    go.utils_HelloMama.
        change_msg_times = function(im) {
            var mama_id = im.user.answers.mama_id;
            return Q
            .all([
                // get contact so details can be updated
                go.utils_HelloMama.get_identity(mama_id, im),
                // get existing subscriptions so schedule can be updated
                go.utils_HelloMama.get_active_subscription_by_contact_id(mama_id, im)
            ])
            .spread(function(mama_contact, subscription) {
                // set new mama contact details
                mama_contact.details.voice_days = im.user.answers.state_c04_voice_days;
                mama_contact.details.voice_times = im.user.answers.state_c06_voice_times;

                // set new subscription schedule
                subscription.schedule = go.utils_HelloMama.get_schedule(mama_contact);

                return Q.all([
                    // update mama contact
                    go.utils_HelloMama.update_identity(im, mama_contact),
                    // update subscription
                    go.utils_HelloMama.update_subscription(im, subscription)
                ]);
            });
        };

// SMS HANDLING

    go.utils_HelloMama.
        eval_dialback_reminder = function(e, im, user_id, $, sms_content) {
            var close_state = e.im.state.name;
            var non_dialback_sms_states = [
                'state_start',
                'state_auth_code',
                'state_end_voice',
                'state_end_sms'
            ];
            if (non_dialback_sms_states.indexOf(close_state) === -1
            && e.user_terminated) {
                return go.utils_HelloMama
                .get_identity(user_id, im)
                .then(function(user) {
                    if (!user.details.dialback_sent) {
                        user.details.dialback_sent = true;
                        return Q.all([
                            go.utils_HelloMama.send_text(im, user_id, sms_content),
                            go.utils_HelloMama.update_identity(im, user)
                        ]);
                    }
                });
            } else {
                return Q();
            }
        };

    go.utils_HelloMama.
        send_text = function(im, user_id, sms_content) {
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
        };

// SUBSCRIPTION HANDLING

    go.utils_HelloMama.
        setup_subscription = function(im, mama_contact) {
            subscription = {
                contact: "/api/v1/identities/" + mama_contact.id + "/",
                version: 1,
                messageset_id: go.utils_HelloMama.get_messageset_id(mama_contact),
                next_sequence_number: go.utils_HelloMama.get_next_sequence_number(mama_contact),
                lang: mama_contact.details.lang,
                active: true,
                completed: false,
                schedule: go.utils_HelloMama.get_schedule(mama_contact),
                process_status: 0,
                metadata: {
                    msg_type: mama_contact.details.msg_type
                }
            };
            return subscription;
        };

    go.utils_HelloMama.
        get_messageset_id = function(mama_contact) {
            return (mama_contact.details.state_current === 'pregnant') ? 1 : 2;
        };

    go.utils_HelloMama.
        get_next_sequence_number = function(mama_contact) {
            return 1;
        };

    go.utils_HelloMama.
        get_schedule = function(mama_contact) {
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
        };

    go.utils_HelloMama.
        subscribe_contact = function(im, subscription) {
            var payload = subscription;
            return go.utils
            .service_api_call("subscriptions", "post", null, payload, "subscriptions/", im)
            .then(function(response) {
                return response.data.id;
            });
        };

    go.utils_HelloMama.
        get_active_subscriptions_by_contact_id = function(contact_id, im) {
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
        };

    go.utils_HelloMama.
        get_active_subscription_by_contact_id = function(contact_id, im) {
            // returns first active subscription found
            return go.utils_HelloMama
            .get_active_subscriptions_by_contact_id(contact_id, im)
            .then(function(subscriptions) {
                return subscriptions[0];
            });
        };

    go.utils_HelloMama.
        has_active_subscriptions = function(contact_id, im) {
            return go.utils_HelloMama
            .get_active_subscriptions_by_contact_id(contact_id, im)
            .then(function(subscriptions) {
                return subscriptions.length > 0;
            });
        };

    go.utils_HelloMama.
        subscriptions_unsubscribe_all = function(contact_id, im) {
            // make all subscriptions inactive
            // unlike other functions takes into account that there may be
            // more than one active subscription returned (unlikely)
            return go.utils_HelloMama
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
        };

    go.utils_HelloMama.
        switch_to_baby = function(im) {
            var mama_id = im.user.answers.mama_id;
            return Q
            .all([
                // get contact so details can be updated
                go.utils_HelloMama.get_identity(mama_id, im),
                // set existing subscriptions inactive
                go.utils_HelloMama.subscriptions_unsubscribe_all(mama_id, im)
            ])
            .spread(function(mama_contact, unsubscribe_result) {
                // set new mama contact details
                mama_contact.details.baby_dob = go.utils.get_today(im.config).format('YYYY-MM-DD');
                mama_contact.details.state_current = "baby";

                // set up baby message subscription
                baby_subscription = go.utils_HelloMama.setup_subscription(im, mama_contact);

                return Q.all([
                    // update mama contact
                    go.utils_HelloMama.update_identity(im, mama_contact),
                    // subscribe to baby messages
                    go.utils_HelloMama.subscribe_contact(im, baby_subscription)
                ]);
            });
        };

    go.utils_HelloMama.
        update_subscription = function(im, subscription) {
            var endpoint = "subscriptions/" + subscription.id + '/';
            return go.utils
            .service_api_call("subscriptions", 'patch', {}, subscription, endpoint, im)
            .then(function(response) {
                return response.data.id;
            });
        };

// TIMEOUT HANDLING

    go.utils_HelloMama.
        timed_out = function(im) {
            var no_redirects = [
                'state_start',
                'state_end_voice',
                'state_end_sms'
            ];
            return im.msg.session_event === 'new'
            && im.user.state.name
            && no_redirects.indexOf(im.user.state.name) === -1;
        };

// DATE HANDLING

    go.utils_HelloMama.
        get_baby_dob = function(im, day) {
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
        };

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
            // Send a dial back reminder via sms the first time someone times out
            self.im.on('session:close', function(e) {
                return go.utils_HelloMama.eval_dialback_reminder(
                    e, self.im, self.im.user.answers.user_id, $,
                    "Please dial back in to {{channel}} to complete the Hello MAMA registration"
                    );
            });
        };


    // TEXT CONTENT

        var questions = {
            "state_timed_out":
                "You have an incomplete registration. Would you like to continue with this registration?",
            "state_auth_code":
                "Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345",
            "state_msg_receiver":
                "Please select who will receive the messages on their phone:",
            "state_msisdn":
                "Please enter the mobile number of the person who will receive the weekly messages. For example, 08033048990",
            "state_msisdn_father":
                "Please enter the mobile number of the FATHER. For example, 08033048990",
            "state_msisdn_mother":
                "Please enter the mobile number of the MOTHER. For example, 08033048990",
            "state_pregnancy_status":
                "Please select one of the following:",
            "state_last_period_month":
                "Please select the month the woman had her last period:",
            "state_last_period_day":
                "What day of the month did the woman start her last period? For example, 12.",
            "state_baby_birth_month_year":
                "Select the month & year the baby was born:",
            "state_baby_birth_day":
                "What day of the month was the baby born? For example, 12.",
            "state_msg_language":
                "Which language would this person like to receive these messages in?",
            "state_msg_type":
                "How would this person like to get messages?",
            "state_voice_days":
                "We will call them twice a week. On what days would the person like to receive these calls?",
            "state_voice_times":
                "Thank you. At what time would they like to receive these calls?",
            "state_end_voice":
                "Thank you. The person will now start receiving calls on {{days}} between {{times}}.",
            "state_end_sms":
                "Thank you. The person will now start receiving messages three times a week."
        };

        var errors = {
            "state_auth_code":
                "Sorry, that is not a valid number. Please enter your unique personnel code. For example, 12345"
        };

        get_error_text = function(name) {
            return errors[name] || "Sorry, that is not a valid number. " + questions[name];
        };


    // TIMEOUT HANDLING

        // override normal state adding
        self.add = function(name, creator) {
            self.states.add(name, function(name, opts) {
                if (!interrupt || !go.utils_HelloMama.timed_out(self.im))
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
                    new Choice('restart', $("No, start new registration"))
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
            return go.utils_HelloMama
                .get_or_create_identity({'msisdn': self.im.user.addr}, self.im, null)
                .then(function(user) {
                    self.im.user.set_answer('user_id', user.id);
                    if (user.details.personnel_code) {
                        self.im.user.set_answer('operator_id', user.id);
                        return self.states.create('state_msg_receiver');
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
                    var personnel_code = content;
                    return go.utils_HelloMama
                        .find_healthworker_with_personnel_code(self.im, personnel_code)
                        .then(function(healthworker) {
                            if (healthworker) {
                                self.im.user.set_answer('operator_id', healthworker.id);
                                return null;  // vumi expects null or undefined if check passes
                            } else {
                                return $(get_error_text(name));
                            }
                        });
                },
                next: 'state_msg_receiver'
            });
        });

        // ChoiceState st-02
        self.add('state_msg_receiver', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('mother_father', $("The Mother & Father")),
                    new Choice('mother_only', $("The Mother only")),
                    new Choice('father_only', $("The Father only")),
                    new Choice('family_member', $("A family member")),
                    new Choice('trusted_friend', $("A trusted friend"))
                ],
                next: function(choice) {
                    if (choice.value === 'mother_father') {
                        return 'state_msisdn_father';
                    } else {
                        return 'state_msisdn';
                    }
                }
            });
        });

        // FreeText st-03
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
                next: 'state_save_identities'
            });
        });

        // FreeText st-3A
        self.add('state_msisdn_father', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
                    }
                },
                next: 'state_msisdn_mother'
            });
        });

        // FreeText st-3A
        self.add('state_msisdn_mother', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return null;  // vumi expects null or undefined if check passes
                    } else {
                        return $(get_error_text(name));
                    }
                },
                next: function() {
                    if (self.im.user.answers.state_msisdn_father ===
                        self.im.user.answers.state_msisdn_mother) {
                        self.im.user.set_answer('state_msg_receiver', 'father_only');
                        self.im.user.set_answer('state_msisdn',
                                                self.im.user.answers.state_msisdn_mother);
                    }
                    return 'state_save_identities';
                }
            });
        });

        // Get or create identities and save their IDs
        self.add('state_save_identities', function(name) {
            return go.utils_HelloMama
                .save_identities(
                    self.im,
                    self.im.user.answers.state_msg_receiver,
                    self.im.user.answers.state_msisdn,
                    self.im.user.answers.state_msisdn_father,
                    self.im.user.answers.state_msisdn_mother,
                    self.im.user.answers.operator_id
                )
                .then(function() {
                    return self.states.create('state_pregnancy_status');
                });
        });

        // ChoiceState st-04
        self.add('state_pregnancy_status', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('prebirth', $("The mother is pregnant")),
                    new Choice('postbirth', $("The mother has a baby under 1 year old"))
                ],
                next: function(choice) {
                    return choice.value === 'prebirth'
                        ? 'state_last_period_month'
                        : 'state_baby_birth_month_year';
                }
            });
        });

        // PaginatedChoiceState st-05
        self.add('state_last_period_month', function(name) {
            var today = go.utils.get_today(self.im.config);
            return new PaginatedChoiceState(name, {
                question: $(questions[name]),
                characters_per_page: 182,
                //options_per_page: null,
                more: $('More'),
                back: $('Back'),
                choices: go.utils.make_month_choices($, today, 9, -1,
                                                     "YYYYMM", "MMMM YY"),
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
                next: 'state_validate_date'
            });
        });

        // ChoiceState st-07
        self.add('state_msg_language', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('english', $('English')),
                    new Choice('hausa', $('Hausa')),
                    new Choice('igbo', $('Igbo'))
                ],
                next: 'state_msg_type'
            });
        });

        // ChoiceState st-08
        self.add('state_msg_type', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('voice', $('Voice calls')),
                    new Choice('sms', $('Text SMSs'))
                ],
                next: function(choice) {
                    if (choice.value === 'voice') {
                        return 'state_voice_days';
                    } else {
                        return go.utils_HelloMama
                            .save_registration(self.im)
                            .then(function() {
                                return 'state_end_sms';
                            });
                    }
                }
            });
        });

        // ChoiceState st-09
        self.add('state_voice_days', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('mon_wed', $('Monday and Wednesday')),
                    new Choice('tue_thu', $('Tuesday and Thursday'))
                ],
                next: 'state_voice_times'
            });
        });

        // ChoiceState st-10
        self.add('state_voice_times', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('9_11', $('Between 9-11am')),
                    new Choice('2_5', $('Between 2-5pm'))
                ],
                next: function() {
                    return go.utils_HelloMama
                        .save_registration(self.im)
                        .then(function() {
                            return 'state_end_voice';
                        });
                }
            });
        });

        // EndState st-11
        self.add('state_end_voice', function(name) {
            var voice_schedule = {
                "mon_wed": "Monday and Wednesday",
                "tue_thu": "Tuesday and Thursday",
                "9_11": "9am - 11am",
                "2_5": "2pm - 5pm"
            };
            return new EndState(name, {
                text: $(questions[name]).context({
                    days: voice_schedule[self.im.user.answers.state_voice_days],
                    times: voice_schedule[self.im.user.answers.state_voice_times]
                }),
                next: 'state_start'
            });
        });

        // PaginatedChoiceState st-12 & 13
        self.add('state_baby_birth_month_year', function(name) {
            var today = go.utils.get_today(self.im.config);
            return new PaginatedChoiceState(name, {
                question: $(questions[name]),
                characters_per_page: 182,
                options_per_page: null,
                more: $('More'),
                back: $('Back'),
                choices: go.utils.make_month_choices($, today, 12, -1,
                                                     "YYYYMM", "MMMM YY"),
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
                next: 'state_validate_date'
            });
        });

        // EndState st-15
        self.add('state_end_sms', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
            });
        });

        // to validate overall date
        self.add('state_validate_date', function(name) {
            var monthAndYear = self.im.user.answers.state_last_period_month ||  // flow via st-05 & st-06
                                self.im.user.answers.state_baby_birth_month_year;
            var day = self.im.user.answers.state_last_period_day ||
                        self.im.user.answers.state_baby_birth_day;          // flow via st-12 & st-13

            var dateToValidate = monthAndYear+day;

            if (go.utils.is_valid_date(dateToValidate, 'YYYYMMDD')) {
                self.im.user.set_answer('working_date', dateToValidate);
                return self.states.create('state_msg_language');
            } else {
                return self.states.create('state_invalid_date', {date: dateToValidate});
            }
        });

        self.add('state_invalid_date', function(name, opts) {
            return new ChoiceState(name, {
                question:
                    $('The date you entered ({{ date }}) is not a ' +
                        'real date. Please try again.'
                    ).context({date: opts.date}),

                choices: [
                    new Choice('continue', $('Continue'))
                ],
                next: function() {
                    if (self.im.user.answers.state_last_period_day) {  // flow via st-05 & st-06
                        return self.states.create('state_last_period_month');
                    }
                    else if (self.im.user.answers.state_baby_birth_day) { // flow via st-12 & st-13
                        return self.states.create('state_baby_birth_month_year');
                    }
                }
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
