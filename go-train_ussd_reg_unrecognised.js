// WARNING: This is a generated file.
//          If you edit it you will be sad.
//          Edit src/app.js instead.

var go = {};
go;

/*jshint -W083 */

// TRAINING UTILS
go.utils_training = {

    timed_out: function(im) {
        return im.msg.session_event === 'new'
            && im.user.state.name
            && im.config.no_timeout_redirects.indexOf(im.user.state.name) === -1;
    },

    get_or_create_identity: function(address, im, operator_id) {
      // Gets a identity if it exists, otherwise creates a new one

        if (address.msisdn) {
            address.msisdn = go.utils
                .normalize_msisdn(address.msisdn, im.config.country_code);
        }
        return go.utils
            // Get identity id using address
            .get_identity_by_address(address, im)
            .then(function(identity) {
                if (identity !== null) {
                    // If identity exists, return the id
                    return identity;
                } else {
                    // If identity doesn't exist, create it
                    return go.utils
                    .create_identity(im, address, null, operator_id)
                    .then(function(identity) {
                        return identity;
                    });
                }
        });
    },

};

/*jshint -W083 */
var vumigo = require('vumigo_v02');
var moment = require('moment');
var assert = require('assert');
var JsonApi = vumigo.http.api.JsonApi;
var Choice = vumigo.states.Choice;

// GENERIC UTILS
go.utils = {

// FIXTURES HELPERS

    check_fixtures_used: function(api, expected_used) {
        var fixts = api.http.fixtures.fixtures;
        var fixts_used = [];
        fixts.forEach(function(f, i) {
            f.uses > 0 ? fixts_used.push(i) : null;
        });
        assert.deepEqual(fixts_used, expected_used);
    },

// TIMEOUT HELPERS

    timed_out: function(im) {
        return im.msg.session_event === 'new'
            && im.user.state.name
            && im.config.no_timeout_redirects.indexOf(im.user.state.name) === -1;
    },

    timeout_redirect: function(im) {
        return im.config.timeout_redirects.indexOf(im.user.state.name) !== -1;
    },


// SERVICE API CALL HELPERS

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
                    })
                    .then(go.utils.log_service_api_call(service, method, params, payload, endpoint, im));
            case "get":
                return http.get(im.config.services[service].url + endpoint, {
                        params: params
                    })
                    .then(go.utils.log_service_api_call(service, method, params, payload, endpoint, im));
            case "patch":
                return http.patch(im.config.services[service].url + endpoint, {
                        data: payload
                    })
                    .then(go.utils.log_service_api_call(service, method, params, payload, endpoint, im));
            case "put":
                return http.put(im.config.services[service].url + endpoint, {
                    params: params,
                    data: payload
                })
                .then(go.utils.log_service_api_call(service, method, params, payload, endpoint, im));
            case "delete":
                return http
                    .delete(im.config.services[service].url + endpoint)
                    .then(go.utils.log_service_api_call(service, method, params, payload, endpoint, im));
            }
    },

    log_service_api_call: function(service, method, params, payload, endpoint, im) {
        return function (response) {
            return im
                .log([
                    'Request: ' + method + ' ' + im.config.services[service].url + endpoint,
                    'Payload: ' + JSON.stringify(payload),
                    'Params: ' + JSON.stringify(params),
                    'Response: ' + JSON.stringify(response),
                ].join('\n'))
                .then(function () {
                    return response;
                });
        };
    },


// MSISDN HELPERS

    // Check that it's a number and starts with 0 and approximate length
    // TODO: refactor to take length, explicitly deal with '+'
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


// NUMBER HELPERS

    // An attempt to solve the insanity of JavaScript numbers
    check_valid_number: function(content) {
        var numbers_only = new RegExp('^\\d+$');
        return content !== ''
            && numbers_only.test(content)
            && !Number.isNaN(Number(content));
    },

    double_digit_number: function(input) {
        input_numeric = parseInt(input, 10);
        if (parseInt(input, 10) < 10) {
            return "0" + input_numeric.toString();
        } else {
            return input_numeric.toString();
        }
    },


// DATE HELPERS

    get_today: function(config) {
        if (config.testing_today) {
            return new moment(config.testing_today, 'YYYY-MM-DD');
        } else {
            return new moment();
        }
    },

    get_january: function(config) {
        // returns current year january 1st moment date
        return go.utils.get_today(config).startOf('year');
    },

    is_valid_date: function(date, format) {
        // implements strict validation with 'true' below
        return moment(date, format, true).isValid();
    },

    is_valid_year: function(year, minYear, maxYear) {
        // expects string parameters
        // checks that the number is within the range determined by the
        // minYear & maxYear parameters
        return go.utils.check_valid_number(year)
            && parseInt(year, 10) >= parseInt(minYear, 10)
            && parseInt(year, 10) <= parseInt(maxYear, 10);
    },

    is_valid_day_of_month: function(input) {
        // check that it is a number and between 1 and 31
        return go.utils.check_valid_number(input)
            && parseInt(input, 10) >= 1
            && parseInt(input, 10) <= 31;
    },


// TEXT HELPERS

    check_valid_alpha: function(input) {
        // check that all chars are in standard alphabet
        var alpha_only = new RegExp('^[A-Za-z]+$');
        return input !== '' && alpha_only.test(input);
    },

    is_valid_name: function(input, min, max) {
        // check that the string does not include the characters listed in the
        // regex, and min <= input string length <= max
        var name_check = new RegExp(
            '(^[^±!@£$%^&*_+§¡€#¢§¶•ªº«\\/<>?:;|=.,0123456789]{min,max}$)'
            .replace('min', min.toString())
            .replace('max', max.toString())
        );
        return input !== '' && name_check.test(input);
    },

    get_clean_first_word: function(user_message) {
        return user_message
            .split(" ")[0]          // split off first word
            .replace(/\W/g, '')     // remove non letters
            .toUpperCase();         // capitalise
    },


// CHOICE HELPERS

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


// REGISTRATION HELPERS

    create_registration: function(im, reg_info) {
        return go.utils
            .service_api_call("registrations", "post", null, reg_info, "registration/", im)
            .then(function(result) {
                return result.id;
            });
    },


// IDENTITY HELPERS

    get_identity_by_address: function(address, im) {
      // Searches the Identity Store for all identities with the provided address.
      // Returns the first identity object found
      // Address should be an object {address_type: address}, eg.
      // {'msisdn': '0821234444'}, {'email': 'me@example.com'}

        var address_type = Object.keys(address)[0];
        var address_val = address[address_type];
        var params = {};
        var search_string = 'details__addresses__' + address_type;
        params[search_string] = address_val;

        return im
            .log('Getting identity for: ' + JSON.stringify(params))
            .then(function() {
                return go.utils
                    .service_api_call('identities', 'get', params, null, 'identities/search/', im)
                    .then(function(json_get_response) {
                        var identities_found = json_get_response.data.results;
                        // Return the first identity in the list of identities
                        return (identities_found.length > 0)
                        ? identities_found[0]
                        : null;
                    });
            });
    },

    get_identity: function(identity_id, im) {
      // Gets the identity from the Identity Store
      // Returns the identity object
        var endpoint = 'identities/' + identity_id + '/';
        return go.utils
        .service_api_call('identities', 'get', {}, null, endpoint, im)
        .then(function(json_get_response) {
            return json_get_response.data;
        });
    },

    create_identity: function(im, address, communicate_through_id, operator_id) {
      // Create a new identity
      // Returns the identity object

        var payload = {
            "details": {
                "default_addr_type": null,
                "addresses": {}
            }
        };
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
                return json_post_response.data;
            });
    },

    get_or_create_identity: function(address, im, operator_id) {
      // Gets a identity if it exists, otherwise creates a new one

        if (address.msisdn) {
            address.msisdn = go.utils
                .normalize_msisdn(address.msisdn, im.config.country_code);
        }
        return go.utils
            // Get identity id using address
            .get_identity_by_address(address, im)
            .then(function(identity) {
                if (identity !== null) {
                    // If identity exists, return the id
                    return identity;
                } else {
                    // If identity doesn't exist, create it
                    return go.utils
                    .create_identity(im, address, null, operator_id)
                    .then(function(identity) {
                        return identity;
                    });
                }
        });
    },

    update_identity: function(im, identity) {
      // Update an identity by passing in the full updated identity object
      // Removes potentially added fields that auto-complete and should not
      // be submitted
      // Returns the id (which should be the same as the identity's id)

        auto_fields = ["url", "created_at", "updated_at", "created_by", "updated_by", "user"];
        for (var i in auto_fields) {
            field = auto_fields[i];
            if (field in identity) {
                delete identity[field];
            }
        }

        var endpoint = 'identities/' + identity.id + '/';
        return go.utils
            .service_api_call('identities', 'patch', {}, identity, endpoint, im)
            .then(function(response) {
                return response.data.id;
            });
    },


// SUBSCRIPTION HELPERS

    get_subscription: function(im, subscription_id) {
      // Gets the subscription from the Stage-base Store
      // Returns the subscription object

        var endpoint = 'subscriptions/' + subscription_id + '/';
        return go.utils
            .service_api_call('subscriptions', 'get', {}, null, endpoint, im)
            .then(function(response) {
                return response.data;
            });
    },

    get_active_subscriptions_by_identity: function(im, identity_id) {
      // Searches the Stage-base Store for all active subscriptions with the provided identity_id
      // Returns the first subscription object found or null if none are found

        var params = {
            identity: identity_id,
            active: true
        };
        var endpoint = 'subscriptions/';
        return go.utils
            .service_api_call('subscriptions', 'get', params, null, endpoint, im)
            .then(function(response) {
                return response.data.results;
            });
    },

    get_active_subscription_by_identity: function(im, identity_id) {
      // Searches the Stage-base Store for all active subscriptions with the provided identity_id
      // Returns the first subscription object found or null if none are found

        return go.utils
            .get_active_subscriptions_by_identity(im, identity_id)
            .then(function(subscriptions_found) {
                return (subscriptions_found.length > 0)
                    ? subscriptions_found[0]
                    : null;
            });
    },

    has_active_subscription: function(identity_id, im) {
      // Returns whether an identity has an active subscription
      // Returns true / false

        return go.utils
            .get_active_subscriptions_by_identity(im, identity_id)
            .then(function(subscriptions) {
                return subscriptions.length > 0;
            });
    },

    update_subscription: function(im, subscription) {
      // Update a subscription by passing in the full updated subscription object
      // Returns the id (which should be the same as the subscription's id)

        var endpoint = 'subscriptions/' + subscription.id + '/';
        return go.utils
            .service_api_call('subscriptions', 'patch', {}, subscription, endpoint, im)
            .then(function(response) {
                return response.data.id;
            });
    },


// MESSAGESET HELPERS

    get_messageset: function(im, messageset_id) {
      // Gets the messageset from the Stage-base Store
      // Returns the messageset object

        var endpoint = 'messageset/' + messageset_id + '/';
        return go.utils
            .service_api_call('subscriptions', 'get', {}, null, endpoint, im)
            .then(function(response) {
                return response.data;
            });
    },


// MESSAGE_SENDER HELPERS

    save_inbound_message: function(im, from_addr, content) {
      // Saves the inbound messages to seed-message-sender

        var payload = {
            "message_id": im.config.testing_message_id || im.msg.message_id,
            "in_reply_to": null,
            "to_addr": im.config.channel,
            "from_addr": from_addr,
            "content": content,
            "transport_name": im.config.transport_name,
            "transport_type": im.config.transport_type,
            "helper_metadata": {}
        };
        return go.utils
            .service_api_call("message_sender", "post", null, payload, 'inbound/', im)
            .then(function(json_post_response) {
                var inbound_response = json_post_response.data;
                // Return the inbound id
                return inbound_response.id;
            });
    },


// OPTOUT & OPTIN HELPERS

    optout: function(im, identity_id, optout_reason, address_type, address,
                     request_source, requestor_source_id, optout_type, config) {
      // Posts an optout to the identity store optout endpoint

        var optout_info = {
            optout_type: optout_type || 'stop',  // default to 'stop'
            identity: identity_id,
            reason: optout_reason || 'unknown',  // default to 'unknown'
            address_type: address_type || 'msisdn',  // default to 'msisdn'
            address: address,
            request_source: request_source,
            requestor_source_id: requestor_source_id
        };
        return go.utils
            .service_api_call("identities", "post", null, optout_info, "optout/", im)
            .then(function(response) {
                return response;
            });
    },


"commas": "commas"
};

/*jshint -W083 */
var Q = require('q');
var moment = require('moment');
var vumigo = require('vumigo_v02');
var HttpApi = vumigo.http.api.HttpApi;

// PROJECT SPECIFIC UTILS
go.utils_project = {


// IDENTITY HELPERS

    find_healthworker_with_personnel_code: function(im, personnel_code) {
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
    },

    save_identities: function(im, msg_receiver, receiver_msisdn, household_msisdn,
                              mother_msisdn, operator_id) {
      // Creates identities for the msisdns entered in various states
      // and sets the identitity id's to user.answers for later use
      // msg_receiver: (str) person who will receive messages eg. 'mother_only'
      // *_msisdn: (str) msisdns of role players
      // operator_id: (str - uuid) id of healthworker making the registration

        if (msg_receiver === 'mother_only') {
            return go.utils
                // get or create mother's identity
                .get_or_create_identity({'msisdn': receiver_msisdn}, im, operator_id)
                .then(function(mother) {
                    im.user.set_answer('mother_id', mother.id);
                    im.user.set_answer('receiver_id', mother.id);
                    return;
                });
        } else if (['friend_only', 'family_only', 'father_only'].indexOf(msg_receiver) !== -1) {
            return go.utils
                // get or create msg_receiver's identity
                .get_or_create_identity({'msisdn': receiver_msisdn}, im, operator_id)
                .then(function(msg_receiver) {
                    im.user.set_answer('receiver_id', msg_receiver.id);
                    return go.utils
                        // create mother's identity - cannot get as no identifying information
                        .create_identity(im, null, msg_receiver.id, operator_id)
                        .then(function(mother) {
                            im.user.set_answer('mother_id', mother.id);
                            return;
                        });
                });
        } else if (['mother_friend', 'mother_family', 'mother_father'].indexOf(msg_receiver) !== -1) {
            return Q
                .all([
                    // create father's identity
                    go.utils.get_or_create_identity({'msisdn': household_msisdn}, im, operator_id),
                    // create mother's identity
                    go.utils.get_or_create_identity({'msisdn': mother_msisdn}, im, operator_id),
                ])
                .spread(function(father, mother) {
                    im.user.set_answer('receiver_id', father.id);
                    im.user.set_answer('mother_id', mother.id);
                    return;
                });
        }
    },

    update_identities: function(im) {
      // Saves useful data collected during registration to the relevant identities
        var msg_receiver = im.user.answers.state_msg_receiver;
        if (msg_receiver === 'mother_only') {
            return go.utils
                .get_identity(im.user.answers.mother_id, im)
                .then(function(mother_identity) {
                    mother_identity.details.receiver_role = 'mother';
                    mother_identity.details.linked_to = null;
                    mother_identity.details.gravida = im.user.answers.state_gravida;
                    mother_identity.details.preferred_language = im.user.answers.state_msg_language;
                    mother_identity.details.preferred_msg_type = im.user.answers.state_msg_type;

                    if (im.user.answers.state_msg_type === 'audio') {
                        mother_identity.details.preferred_msg_days = im.user.answers.state_voice_days;
                        mother_identity.details.preferred_msg_times = im.user.answers.state_voice_times;
                    }

                    return go.utils.update_identity(im, mother_identity);
                });
        } else if (['friend_only', 'family_only', 'father_only'].indexOf(msg_receiver) !== -1) {
            return Q
                .all([
                    go.utils.get_identity(im.user.answers.mother_id, im),
                    go.utils.get_identity(im.user.answers.receiver_id, im)
                ])
                .spread(function(mother_identity, receiver_identity) {
                    mother_identity.details.receiver_role = 'mother';
                    mother_identity.details.linked_to = im.user.answers.receiver_id;
                    mother_identity.details.gravida = im.user.answers.state_gravida;
                    mother_identity.details.preferred_language = im.user.answers.state_msg_language;

                    receiver_identity.details.receiver_role = msg_receiver.replace('_only', '');
                    receiver_identity.details.linked_to = im.user.answers.mother_id;
                    receiver_identity.details.preferred_msg_type = im.user.answers.state_msg_type;
                    receiver_identity.details.preferred_language = im.user.answers.state_msg_language;

                    if (im.user.answers.state_msg_type === 'audio') {
                        receiver_identity.details.preferred_msg_days = im.user.answers.state_voice_days;
                        receiver_identity.details.preferred_msg_times = im.user.answers.state_voice_times;
                    }

                    return Q.all([
                        go.utils.update_identity(im, mother_identity),
                        go.utils.update_identity(im, receiver_identity)
                    ]);
                });
        } else if (['mother_friend', 'mother_family', 'mother_father'].indexOf(msg_receiver) !== -1) {
            return Q
                .all([
                    go.utils.get_identity(im.user.answers.mother_id, im),
                    go.utils.get_identity(im.user.answers.receiver_id, im)
                ])
                .spread(function(mother_identity, receiver_identity) {
                    mother_identity.details.receiver_role = 'mother';
                    mother_identity.details.linked_to = im.user.answers.receiver_id;
                    mother_identity.details.preferred_msg_type = im.user.answers.state_msg_type;
                    mother_identity.details.gravida = im.user.answers.state_gravida;
                    mother_identity.details.preferred_language = im.user.answers.state_msg_language;

                    receiver_identity.details.receiver_role = msg_receiver.replace('mother_', '');
                    receiver_identity.details.linked_to = im.user.answers.mother_id;
                    receiver_identity.details.household_msgs_only = true;
                    receiver_identity.details.preferred_msg_type = im.user.answers.state_msg_type;
                    receiver_identity.details.preferred_language = im.user.answers.state_msg_language;

                    if (im.user.answers.state_msg_type === 'audio') {
                        mother_identity.details.preferred_msg_days = im.user.answers.state_voice_days;
                        mother_identity.details.preferred_msg_times = im.user.answers.state_voice_times;
                        receiver_identity.details.preferred_msg_days = im.user.answers.state_voice_days;
                        receiver_identity.details.preferred_msg_times = im.user.answers.state_voice_times;
                    }

                    return Q.all([
                        go.utils.update_identity(im, mother_identity),
                        go.utils.update_identity(im, receiver_identity)
                    ]);
                });
        }
    },


// DATE HELPERS

    is_valid_month: function(today, choiceYear, choiceMonth, monthsValid) {
        // function used to validate months for states 5A/5B & 12A/12B

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
    },

    get_year_value: function(today, year_choice) {
        return year_choice === 'this_year'
            ? today.year()
            : today.year() - 1;
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


// GENERAL HELPERS

    should_restart: function(im) {
        var no_restart_states = [
            // voice registration states
            'state_personnel_auth',
            'state_gravida',
            // voice change states
            'state_msg_receiver_msisdn',
            'state_main_menu',
            'state_main_menu_household'
        ];

        return im.msg.content === '0'
            && im.user.state.name
            && no_restart_states.indexOf(im.user.state.name) === -1;
    },

    should_repeat: function(im) {
        return im.msg.content === '*';
    },


// VOICE HELPERS

    make_default_speech_url: function (im, lang) {
        return im.config.services.voice_content.url + lang + '/voice_file_not_found.mp3';
    },

    // Construct url string
    make_speech_url: function(im, name, lang, num, retry) {
        var url_start = im.config.services.voice_content.url + lang + '/' + name + '_' + num;
        if (retry) {
            url_start += '_retry';
        }
        var extension = '.mp3';
        return url_start + extension;
    },

    // Construct helper_data object
    make_voice_helper_data: function(im, name, lang, num, retry) {
        var voice_url = go.utils_project.make_speech_url(im, name, lang, num, retry);
        var bargeInDisallowedStates = [
            // voice registration states
            'state_msg_receiver',
            'state_msisdn_already_registered',
            'state_gravida',
            'state_end_msisdn',
            'state_end_sms',
            'state_end_voice',
            // voice public states
            'state_msg_receiver_msisdn',
            'state_main_menu',
            'state_main_menu_household',
            'state_already_registered_baby',
            'state_end_voice_confirm',
            'state_end_baby',
            'state_end_exit',
            'state_end_msg_language_confirm',
            'state_end_loss_subscription_confirm',
            'state_end_loss',
            'state_end_optout'
        ];

        return im
            .log([
                'Voice URL is: ' + voice_url,
                'Constructed from:',
                '   Name: ' + name,
                '   Lang: ' + lang,
                '   Num: ' + num,
                '   Retry: ' + retry,
                ].join('\n'))
            .then(function () {
                var http = new HttpApi(im, {
                    headers: {
                        'Connection': ['close']
                    }
                });
                return http
                    .head(voice_url)
                    .then(function (response) {
                        return {
                            voice: {
                                speech_url: voice_url,
                                wait_for: '#',
                                barge_in: bargeInDisallowedStates.indexOf(name) !== -1 ? false : true
                            }
                        };
                    }, function (error) {
                        return im
                            .log('Unable to find voice file: ' + voice_url + '. Error: ' + error)
                            .then(function () {
                                return {
                                    voice: {
                                        speech_url: go.utils_project.make_default_speech_url(im, lang)
                                    }
                                };
                            });
                    });
            });
    },


// SPEECH OPTION HELPERS

    get_speech_option_household: function(member) {
        member_map = {
            'father': '1',
            'family member': '2',
            'friend': '3'
        };
        return member_map[member];
    },

    get_speech_option_pregnancy_status_day: function(im, month) {
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
    },

    get_speech_option_days: function(days) {
        day_map = {
            'mon_wed': '1',
            'tue_thu': '2'
        };
        return day_map[days];
    },

    get_speech_option_year: function(year) {
        return year === 'this_year' ? '1' : '2';
    },

    get_speech_option_days_time: function(days, time) {
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
    },


// REGISTRATION HELPERS

    compile_reg_info: function(im) {
        var reg_info = {
            stage: im.user.answers.state_pregnancy_status,
            mother_id: im.user.answers.mother_id,
            data: {
                msg_receiver: im.user.answers.state_msg_receiver,
                receiver_id: im.user.answers.receiver_id,
                operator_id: im.user.answers.operator_id,
                gravida: im.user.answers.state_gravida,
                language: im.user.answers.state_msg_language,
                msg_type: im.user.answers.state_msg_type
            }
        };

        if (im.user.answers.user_id) {
            reg_info.data.user_id = im.user.answers.user_id;
        }

        // add data for voice time and day if applicable
        if (im.user.answers.state_msg_type === 'audio') {
            reg_info.data.voice_times = im.user.answers.state_voice_times;
            reg_info.data.voice_days = im.user.answers.state_voice_days;
        }

        // add data for last_period_date or baby_dob
        if (im.user.answers.state_pregnancy_status === 'prebirth') {
            reg_info.data.last_period_date = im.user.answers.working_date;
        } else if (im.user.answers.state_pregnancy_status === 'postbirth') {
            reg_info.data.baby_dob = im.user.answers.working_date;
        }

        return reg_info;
    },

    finish_registration: function(im) {
        var reg_info = go.utils_project.compile_reg_info(im);
        return Q.all([
            go.utils.create_registration(im, reg_info),
            go.utils_project.update_identities(im)
        ]);
    },

    update_mama_details: function(im, mama_identity, chew_phone_used) {
        if (im.user.answers.state_r04_mom_state === 'baby') {
            mama_identity.details.baby_dob = im.user.answers.birth_date;
            mama_identity.details.mama_edd = 'registration_after_baby_born';
        } else {
            mama_identity.details.baby_dob = 'mama_is_pregnant';
            mama_identity.details.mama_edd = im.user.answers.birth_date;
        }
        mama_identity.details.opted_out = false;
        mama_identity.details.has_registered = true;
        mama_identity.details.registered_at = go.utils.get_today(im.config
        ).format('YYYY-MM-DD HH:mm:ss');
        mama_identity.details.msg_receiver = im.user.answers.state_r03_receiver;
        mama_identity.details.state_at_registration = im.user.answers.state_r04_mom_state;
        mama_identity.details.state_current = im.user.answers.state_r04_mom_state;
        mama_identity.details.gravida = im.user.answers.state_gravida;
        mama_identity.details.lang = go.utils_project.get_lang(im);
        mama_identity.details.msg_type = im.user.answers.state_r10_message_type;
        mama_identity.details.voice_days = im.user.answers.state_r11_voice_days || 'text';
        mama_identity.details.voice_times = im.user.answers.state_r12_voice_times || 'text';
        return mama_identity;
    },

    get_lang: function(im) {
        lang_map = {
            'english': 'eng_NG',
            'hausa': 'hau_NG',
            'igbo': 'ibo_NG',
            'pidgin': 'pcm_NG',
            'yoruba': 'yor_NG'
        };
        return lang_map[im.user.answers.state_r09_language];
    },


// OPTOUT HELPERS

    optout_mother: function(im, request_source) {
        return go.utils.optout(
            im,
            im.user.answers.mother_id,
            im.user.answers.state_optout_reason,
            'msisdn',
            im.user.answers.mother_msisdn,
            request_source,
            im.config.testing_message_id ||
              im.msg.message_id,
            'stop'
        );
    },

    optout_household: function(im, request_source) {
        return go.utils.optout(
            im,
            im.user.answers.household_id,
            im.user.answers.state_optout_reason,
            'msisdn',
            im.user.answers.household_msisdn,
            request_source,
            im.config.testing_message_id || im.msg.message_id,
            'stop'
        );
    },


// CHANGE HELPERS

    update_msg_format_time: function(im, new_msg_format, voice_days, voice_times) {
      // Sends new message type, preferred day and time to Change endpoint
      // and updates the mother's preferred msg settings

        var change_data = {
            "mother_id": im.user.answers.mother_id,
            "action": "change_messaging",
            "data": {
                "msg_type": new_msg_format,
                "voice_days": voice_days || null,
                "voice_times": voice_times || null
            }
        };

        return go.utils
            .service_api_call("registrations", "post", null, change_data, "change/", im)
            .then(function() {
                return go.utils
                    .get_identity(im.user.answers.mother_id, im)
                    .then(function(mother_identity) {
                        // Update mother only as household messages are text only for now
                        mother_identity.details.preferred_msg_type = new_msg_format;
                        mother_identity.details.preferred_msg_days = voice_days || null;
                        mother_identity.details.preferred_msg_times = voice_times || null;
                        return go.utils
                            .update_identity(im, mother_identity);
                    });
            });
    },

    switch_to_loss: function(im, mother_id, reason) {
      // Sends an Api request to the registration store to switch the mother
      // to loss messages

        var change_data = {
            "mother_id": mother_id,
            "action": "change_loss",
            "data": {
                "reason": reason
            }
        };

        return go.utils
            .service_api_call("registrations", "post", null, change_data, "change/", im)
            .then(function(response) {
                return response;
            });
    },

    switch_to_baby: function(im, mother_id) {
      // Sends an Api request to the registration store to switch the mother
      // to baby messages

        var change_data = {
            "mother_id": mother_id,
            "action": "change_baby",
            "data": {}
        };

        return go.utils
            .service_api_call("registrations", "post", null, change_data, "change/", im)
            .then(function(response) {
                return response;
            });
    },

    unsub_household: function(im, mother_id, household_id, reason) {
      // A unique change endpoint that unsubscribes only the household receiver
      // in an _only registration case; rather than doing an optout which would
      // block the mother's messages from getting through to the receiver

        var change_data = {
            "mother_id": mother_id,
            "action": "unsubscribe_household_only",
            "data": {
                "household_id": household_id,
                "reason": reason
            }
        };

        return go.utils
            .service_api_call("registrations", "post", null, change_data, "change/", im)
            .then(function(response) {
                return response;
            });
    },

    unsub_mother: function(im, mother_id, household_id, reason) {
      // A unique change endpoint that unsubscribes from the mother messages only
      // in an _only registration case; rather than doing an optout which would
      // block the household messages from getting through to the receiver

        var change_data = {
            "mother_id": mother_id,
            "action": "unsubscribe_mother_only",
            "data": {
                "household_id": household_id,
                "reason": reason
            }
        };

        return go.utils
            .service_api_call("registrations", "post", null, change_data, "change/", im)
            .then(function(response) {
                return response;
            });
    },

    change_language: function(im, new_lang, mother_id, household_id) {
      // Sends an Api request to the registration store to change the
      // subscriptions' languages, and sends a patch request to the identity
      // store to change the identities' languages

        var change_data = {
            "mother_id": mother_id,
            "action": "change_language",
            "data": {
                "new_language": new_lang,
                "household_id": household_id
            }
        };

        if (household_id === null) {
            return go.utils
                .get_identity(mother_id, im)
                .then(function(mother_identity) {
                    mother_identity.details.preferred_language = new_lang;
                    return Q
                        .all([
                            go.utils.update_identity(im, mother_identity),
                            go.utils.service_api_call("registrations", "post", null, change_data, "change/", im)
                        ]);
                });
        } else {
            return Q
                .all([
                    go.utils.get_identity(mother_id, im),
                    go.utils.get_identity(household_id, im)
                ])
                .spread(function(mother_identity, household_identity) {
                    mother_identity.details.preferred_language = new_lang;
                    household_identity.details.preferred_language = new_lang;
                    return Q
                        .all([
                            go.utils.update_identity(im, mother_identity),
                            go.utils.update_identity(im, household_identity),
                            go.utils.service_api_call("registrations", "post", null, change_data, "change/", im)
                        ]);
                });
        }
    },


// SMS HELPERS

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
            .get_identity(user_id, im)
            .then(function(user) {
                if (!user.details.dialback_sent) {
                    user.details.dialback_sent = true;
                    return Q.all([
                        go.utils_project.send_text(im, user_id, sms_content),
                        go.utils.update_identity(im, user)
                    ]);
                }
            });
        } else {
            return Q();
        }
    },

    send_text: function(im, user_id, sms_content) {
        var payload = {
            "identity": user_id,
            "content": sms_content.replace("{{channel}}", im.config.channel)
            // $ does not work well with fixtures here since it's an object
        };
        return go.utils
        .service_api_call("message_sender", "post", null, payload, 'outbound/', im)
        .then(function(json_post_response) {
            var outbound_response = json_post_response.data;
            // Return the outbound id
            return outbound_response.id;
        });
    },


// SUBSCRIPTION HELPERS

    get_subscription_messageset_through_identity: function(im, mother_id, household_id) {
      // Return the messageset that an identity is subscribed to

        // get subscription
        return go.utils
            .get_active_subscription_by_identity(im, mother_id)
            .then(function(subscription) {
                if (subscription === null) {
                    // try to look for an active subscription on the household_id
                    return go.utils
                        .get_active_subscription_by_identity(im, household_id)
                        .then(function(subscription) {
                            if (subscription === null) {
                                return 'no_active_subs_found';
                            } else {
                                // get messageset
                                return go.utils
                                    .get_messageset(im, subscription.messageset)
                                    .then(function(messageset) {
                                        return messageset;
                                    });
                            }
                        });
                } else {
                    // get messageset
                    return go.utils
                        .get_messageset(im, subscription.messageset)
                        .then(function(messageset) {
                            return messageset;
                        });
                    }
            });
    },

    get_subscription_msg_type: function(im, mother_id) {
      // Look up what type of messages the mother is receiving

        return go.utils_project
            .get_subscription_messageset_through_identity(im, mother_id)
            .then(function(messageset) {
                return messageset.content_type;  // 'text' / 'audio'
            });
    },

    check_postbirth_subscription: function(im, mother_id) {
      // Look up if the mother is subscribed to postbirth messages
        return go.utils_project
            .get_subscription_messageset_through_identity(im, mother_id)
            .then(function(messageset) {
                if (messageset === 'no_active_subs_found') {
                    return 'no_active_subs_found';
                } else {
                    return messageset.short_name.substring(0,9) === 'postbirth';
                }
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


    "commas": "commas"
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
        var bypassPostbirth = true;

        self.init = function() {
            // Send a dial back reminder via sms the first time someone times out
            self.im.on('session:close', function(e) {
                return go.utils_project.eval_dialback_reminder(
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
            "state_msisdn_already_registered":
                "Sorry, this number is already registered. They must opt-out before registering again.",
            "state_msisdn_mother":
                "Please enter the mother's mobile number. She must consent to receiving messages.",
            "state_msisdn_household":
                "Please enter the {{roleplayer}}'s number. They will receive a weekly SMS and must consent to receiving messages.",
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
            "state_gravida":
                "Please enter the number of times the woman has been pregnant before. This includes any pregnancies she may not have carried to term.",
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
                "Thank you. The person will now start receiving messages three times a week.",
            "state_end_msisdn":
                "Thank you for using the Hello Mama service."
        };

        var errors = {
            "state_auth_code":
                "Sorry, that is not a valid number. Please enter your unique personnel code. For example, 12345",
        };

        get_error_text = function(name) {
            return errors[name] || "Sorry, that is not a valid number. " + questions[name];
        };


    // TIMEOUT HANDLING

        // override normal state adding
        self.add = function(name, creator) {
            self.states.add(name, function(name, opts) {
                if (!interrupt || !go.utils_training.timed_out(self.im))
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
            return go.utils_training
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
                    return go.utils_project
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
                    if (seperate.indexOf(choice.value) !== -1) {
                        return 'state_msisdn_mother';
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
                next: function(content) {
                    var msisdn = go.utils.normalize_msisdn(
                        content, self.im.config.country_code);
                    return go.utils
                        .get_identity_by_address({'msisdn': msisdn}, self.im)
                        .then(function(contact) {
                            if (contact && contact.details && contact.details.receiver_role) {
                                self.im.user.set_answer('role_player', contact.details.receiver_role);
                                self.im.user.set_answer('contact_id', contact.id);
                                return 'state_msisdn_already_registered';
                            } else {
                                return 'state_save_identities';
                            }
                        });
                }
            });
        });

        // ChoiceState st-22
        self.add('state_msisdn_already_registered', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('state_msisdn', $("Try a different number")),
                    new Choice('state_msg_receiver', $("Choose a different receiver")),
                    new Choice('exit', $("Exit"))
                ],
                next: function(choice) {
                    if (choice.value != 'exit') {
                        return choice.value;
                    } else {
                        return 'state_end_msisdn';
                    }

                }
            });
        });

        // EndState of st-22
        self.add('state_end_msisdn', function(name) {
            return new EndState(name, {
                text: $(questions[name]),
                next: 'state_start'
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
                next: 'state_msisdn_household'
            });
        });

        // FreeText st-3B
        self.add('state_msisdn_household', function(name) {
            return new FreeText(name, {
                question: $(questions[name]).context({
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
                        return $(get_error_text(name)).context({
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
                    if (bypassPostbirth) {
                        self.im.user.set_answer('state_pregnancy_status', 'prebirth');
                        return self.states.create('state_last_period_month');
                    } else {
                        return self.states.create('state_pregnancy_status');
                    }
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

        //
        self.add('state_gravida', function(name) {
            return new FreeText(name, {
                question: $(questions[name]),
                check: function(content) {
                    if (go.utils.check_valid_number(content)) {
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
                choices: [
                    new Choice('eng_NG', $('English')),
                    new Choice('hau_NG', $('Hausa')),
                    new Choice('ibo_NG', $('Igbo')),
                    new Choice('pcm_NG', $('Pidgin')),
                    new Choice('yor_NG', $('Yoruba'))
                ],
                next: 'state_msg_type'
            });
        });

        // ChoiceState st-08
        self.add('state_msg_type', function(name) {
            return new ChoiceState(name, {
                question: $(questions[name]),
                choices: [
                    new Choice('audio', $('Voice calls')),
                    new Choice('text', $('Text SMSs'))
                ],
                next: function(choice) {
                    if (choice.value === 'audio') {
                        return 'state_voice_days';
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
                    return go.utils_project
                        .finish_registration(self.im)
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
                return self.states.create('state_gravida');
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
