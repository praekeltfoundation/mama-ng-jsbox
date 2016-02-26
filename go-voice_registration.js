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

// GENERIC UTILS
go.utils = {

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


// TEXT HELPERS

    check_valid_alpha: function(input) {
        // check that all chars are in standard alphabet
        var alpha_only = new RegExp('^[A-Za-z]+$');
        return input !== '' && alpha_only.test(input);
    },

    is_valid_name: function(input) {
        // check that all chars are alphabetical
        return go.utils.check_valid_alpha(input);
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
            .service_api_call("registrations", "post", null, reg_info, "registrations/", im)
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

        return go.utils
            .service_api_call('identities', 'get', params, null, 'identities/search/', im)
            .then(function(json_get_response) {
                var identities_found = json_get_response.data.results;
                // Return the first identity in the list of identities
                return (identities_found.length > 0)
                ? identities_found[0]
                : null;
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
      // Returns the id (which should be the same as the identity's id)

        var endpoint = 'identities/' + identity.id + '/';
        return go.utils
            .service_api_call('identities', 'patch', {}, identity, endpoint, im)
            .then(function(response) {
                return response.data.id;
            });
    },


"commas": "commas"
};

/*jshint -W083 */
var Q = require('q');
var moment = require('moment');

// PROJECT SPECIFIC UTILS
go.utils_project = {

// TEMPORARY

    check_msisdn_hcp: function(msisdn) {
        return Q()
            .then(function(q_response) {
                return msisdn === '082222' || msisdn === '082333'
                    || msisdn === '082444' || msisdn === '082555' || msisdn === '0803304899';
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
                    mother_identity.details.preferred_language = im.user.answers.state_msg_language;
                    mother_identity.details.preferred_msg_type = im.user.answers.state_msg_type;

                    if (im.user.answers.state_msg_type === 'voice') {
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
                    mother_identity.details.preferred_language = im.user.answers.state_msg_language;

                    receiver_identity.details.receiver_role = msg_receiver.replace('_only', '');
                    receiver_identity.details.linked_to = im.user.answers.mother_id;
                    receiver_identity.details.preferred_msg_type = im.user.answers.state_msg_type;
                    receiver_identity.details.preferred_language = im.user.answers.state_msg_language;

                    if (im.user.answers.state_msg_type === 'voice') {
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
                    mother_identity.details.preferred_msg_type = im.user.answers.state_msg_type;
                    mother_identity.details.preferred_language = im.user.answers.state_msg_language;

                    receiver_identity.details.receiver_role = msg_receiver;
                    receiver_identity.details.preferred_msg_type = im.user.answers.state_msg_type;
                    receiver_identity.details.preferred_language = im.user.answers.state_msg_language;

                    if (im.user.answers.state_msg_type === 'voice') {
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


// VOICE HELPERS

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
        return {
            voice: {
                speech_url: go.utils_project.make_speech_url(im, name, lang, num, retry),
                wait_for: '#'
            }
        };
    },


// SPEECH OPTION HELPERS

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
        mama_identity.details.lang = go.utils_project.get_lang(im);
        mama_identity.details.msg_type = im.user.answers.state_r10_message_type;
        mama_identity.details.voice_days = im.user.answers.state_r11_voice_days || 'sms';
        mama_identity.details.voice_times = im.user.answers.state_r12_voice_times || 'sms';
        return mama_identity;
    },

    get_lang: function(im) {
        lang_map = {
            'english': 'eng_NG',
            'hausa': 'hau_NG',
            'igbo': 'ibo_NG'
        };
        return lang_map[im.user.answers.state_r09_language];
    },


// OPTOUT HELPERS

    optout_loss_opt_in: function(im) {
        return go.utils_project
        .optout(im)
        .then(function(identity_id) {
            // TODO #17 Subscribe to loss messages
            return Q();
        });
    },

    optout: function(im) {
        var mama_id = im.user.answers.mama_id;
        return Q
        .all([
            // get identity so details can be updated
            go.utils.get_identity(mama_id, im),
            // set existing subscriptions inactive
            go.utils_project.subscriptions_unsubscribe_all(mama_id, im)
        ])
        .spread(function(mama_identity, unsubscribe_result) {
            // set new mama identity details
            mama_identity.details.opted_out = true;
            mama_identity.details.optout_reason = im.user.answers.state_c05_optout_reason;

            // update mama identity
            return go.utils.update_identity(im, mama_identity);
        });
    },


// CHANGE HELPERS

    change_msg_times: function(im) {
        var mama_id = im.user.answers.mama_id;
        return Q
        .all([
            // get identity so details can be updated
            go.utils.get_identity(mama_id, im),
            // get existing subscriptions so schedule can be updated
            go.utils_project.get_active_subscription_by_identity_id(mama_id, im)
        ])
        .spread(function(mama_identity, subscription) {
            // set new mama identity details
            mama_identity.details.voice_days = im.user.answers.state_c04_voice_days;
            mama_identity.details.voice_times = im.user.answers.state_c06_voice_times;

            // set new subscription schedule
            subscription.schedule = go.utils_project.get_schedule(mama_identity);

            return Q.all([
                // update mama identity
                go.utils.update_identity(im, mama_identity),
                // update subscription
                go.utils_project.update_subscription(im, subscription)
            ]);
        });
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
        .service_api_call("outbound", "post", null, payload, 'outbound/', im)
        .then(function(json_post_response) {
            var outbound_response = json_post_response.data;
            // Return the outbound id
            return outbound_response.id;
        });
    },


// SUBSCRIPTION HELPERS

    is_registered: function(identity_id, im) {
        // Determine whether identity is registered
        return go.utils
            .get_identity(identity_id, im)
            .then(function(identity) {
                var true_options = ['true', 'True', true];
                return true_options.indexOf(identity.details.has_registered) !== -1;
            });
    },

    setup_subscription: function(im, mama_identity) {
        subscription = {
            identity: "/api/v1/identities/" + mama_identity.id + "/",
            version: 1,
            messageset_id: go.utils_project.get_messageset_id(mama_identity),
            next_sequence_number: go.utils_project.get_next_sequence_number(mama_identity),
            lang: mama_identity.details.lang,
            active: true,
            completed: false,
            schedule: go.utils_project.get_schedule(mama_identity),
            process_status: 0,
            metadata: {
                msg_type: mama_identity.details.msg_type
            }
        };
        return subscription;
    },

    get_messageset_id: function(mama_identity) {
        return (mama_identity.details.state_current === 'pregnant') ? 1 : 2;
    },

    get_next_sequence_number: function(mama_identity) {
        return 1;
    },

    get_schedule: function(mama_identity) {
        var schedule_id;
        var days = mama_identity.details.voice_days;
        var times = mama_identity.details.voice_times;

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

    subscribe_identity: function(im, subscription) {
        var payload = subscription;
        return go.utils
        .service_api_call("subscriptions", "post", null, payload, "subscriptions/", im)
        .then(function(response) {
            return response.data.id;
        });
    },

    get_active_subscriptions_by_identity_id: function(identity_id, im) {
        // returns all active subscriptions - for unlikely case where there
        // is more than one active subscription
        var params = {
            identity: identity_id,
            active: "True"
        };
        return go.utils
        .service_api_call("subscriptions", "get", params, null, "subscriptions/", im)
        .then(function(json_get_response) {
            return json_get_response.data.results;
        });
    },

    get_active_subscription_by_identity_id: function(identity_id, im) {
        // returns first active subscription found
        return go.utils_project
        .get_active_subscriptions_by_identity_id(identity_id, im)
        .then(function(subscriptions) {
            return subscriptions[0];
        });
    },

    has_active_subscriptions: function(identity_id, im) {
        return go.utils_project
        .get_active_subscriptions_by_identity_id(identity_id, im)
        .then(function(subscriptions) {
            return subscriptions.length > 0;
        });
    },

    subscriptions_unsubscribe_all: function(identity_id, im) {
        // make all subscriptions inactive
        // unlike other functions takes into account that there may be
        // more than one active subscription returned (unlikely)
        return go.utils_project
        .get_active_subscriptions_by_identity_id(identity_id, im)
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
            // get identity so details can be updated
            go.utils.get_identity(mama_id, im),
            // set existing subscriptions inactive
            go.utils_project.subscriptions_unsubscribe_all(mama_id, im)
        ])
        .spread(function(mama_identity, unsubscribe_result) {
            // set new mama identity details
            mama_identity.details.baby_dob = go.utils.get_today(im.config).format('YYYY-MM-DD');
            mama_identity.details.state_current = "baby";

            // set up baby message subscription
            baby_subscription = go.utils_project.setup_subscription(im, mama_identity);

            return Q.all([
                // update mama identity
                go.utils.update_identity(im, mama_identity),
                // subscribe to baby messages
                go.utils_project.subscribe_identity(im, baby_subscription)
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


// TIMEOUT HELPERS

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
        var lang = 'eng_NG';
        var interrupt = true;

        self.add = function(name, creator) {
            self.states.add(name, function(name, opts) {
                if (!interrupt || !go.utils_project.should_restart(self.im))
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
                .get_or_create_identity({'msisdn': self.im.user.addr}, self.im, null)
                .then(function(user) {
                    self.im.user.set_answer('user_id', user.id);
                    if (user.details.personnel_code) {
                        self.im.user.set_answer('operator_id', user.id);
                        return self.states.create('state_msg_receiver');
                    } else {
                        return self.states.create('state_personnel_auth');
                    }
                });
        });

        // A loopback state that is required since you can't pass opts back
        // into the same state
        self.add('state_retry', function(name, opts) {
            return self.states.create(opts.retry_state, {'retry': true});
        });


    // REGISTRATION

        // FreeText st-01
        self.add('state_personnel_auth', function(name, creator_opts) {
            var question_text = 'Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345';
            var retry_text = 'Sorry, that is not a valid number. Welcome to Hello Mama! Please enter your unique personnel code. For example, 12345';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            var speech_option = '1';
            return new FreeText(name, {
                question: $(use_text),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    return go.utils_project
                        .find_healthworker_with_personnel_code(self.im, content)
                        .then(function(healthworker) {
                            if (healthworker) {
                                self.im.user.set_answer('operator_id', healthworker.id);
                                return 'state_msg_receiver';
                            } else {
                                return {
                                    'name': 'state_retry',
                                    'creator_opts': {'retry_state': name}
                                };
                            }
                        });
                }
            });
        });

        // ChoiceState st-02
        self.add('state_msg_receiver', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Choose message receiver'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('mother_father', $('Mother & Father')),
                    new Choice('mother_only', $('Only Mother')),
                    new Choice('father_only', $('Only Father')),
                    new Choice('family_member', $('Family member')),
                    new Choice('trusted_friend', $('Trusted friend'))

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
        self.add('state_msisdn', function(name, creator_opts) {
            var question_text = 'Please enter number';
            var retry_text = 'Sorry, invalid input. Please enter number';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            var speech_option = '1';
            return new FreeText(name, {
                question: $(use_text),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    } else {
                        return 'state_save_identities';
                    }
                }
            });
        });

        // FreeText st-3A
        self.add('state_msisdn_father', function(name, creator_opts) {
            var question_text = 'Please enter number (Father)';
            var retry_text = 'Sorry, invalid input. Please enter number (Father)';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            var speech_option = '1';
            return new FreeText(name, {
                question: $(use_text),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    } else {
                        return 'state_msisdn_mother';
                    }
                }
            });
        });

        // FreeText st-3B
        self.add('state_msisdn_mother', function(name, creator_opts) {
            var question_text = 'Please enter number (Mother)';
            var retry_text = 'Sorry, invalid input. Please enter number (Mother)';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            var speech_option = '1';
            return new FreeText(name, {
                question: $(use_text),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content) === false) {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    } else {
                        if (self.im.user.answers.state_msisdn_father ===
                            self.im.user.answers.state_msisdn_mother) {
                            self.im.user.set_answer('state_msg_receiver', 'father_only');
                            self.im.user.set_answer('state_msisdn',
                                                    self.im.user.answers.state_msisdn_mother);
                        }
                        return 'state_save_identities';
                    }
                }
            });
        });

        // Get or create identities and save their IDs
        self.add('state_save_identities', function(name, creator_opts) {
            return go.utils_project
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
        self.add('state_pregnancy_status', function(name, creator_opts) {
            var speech_option = '1';
            var routing = {
                'prebirth': 'state_last_period_year',
                'postbirth': 'state_baby_birth_year'
            };
            return new ChoiceState(name, {
                question: $('Pregnant or baby'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('prebirth', $('Pregnant')),
                    new Choice('postbirth', $('Baby'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

    // pregnant
        // ChoiceState st-05
        self.add('state_last_period_year', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Last period?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('this_year', $('This year')),
                    new Choice('last_year', $('Last year'))
                ],
                next: function(choice) {
                    var year_value = go.utils_project.get_year_value(
                        go.utils.get_today(self.im.config), choice.value);
                    self.im.user.set_answer('working_year', year_value);
                    return 'state_last_period_month';
                }
            });
        });

        // ChoiceState st-5
        self.add('state_last_period_month', function(name, creator_opts) {
            var question_text = 'Period month this/last year?';
            var retry_text = 'Retry. Period month this/last year?';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            var speech_option = go.utils_project.get_speech_option_year(
                self.im.user.answers.state_last_period_year);
            return new ChoiceState(name, {
                question: $(use_text),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: go.utils.make_month_choices(
                    $, go.utils.get_january(self.im.config), 12, 1, "MM", "MMMM"),
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    if (go.utils_project.is_valid_month(today, self.im.user.answers.working_year,
                                                choice.value, 10)) {
                        self.im.user.set_answer('working_month', choice.value);
                        return 'state_last_period_day';
                    } else {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    }
                }
            });
        });

        // FreeText st-06
        self.add('state_last_period_day', function(name, creator_opts) {
            var question_text = 'Last period day {{ month }} {{ year }}';
            var retry_text = 'Retry last period day {{ month }} {{ year }}';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            var month = self.im.user.answers.working_month;
            var year = self.im.user.answers.working_year;
            var speech_option = go.utils_project.get_speech_option_pregnancy_status_day(
                self.im, month);

            return new FreeText(name, {
                question: $(use_text).context({ month: month, year: year }),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (!(content > 0 && content <= 31)) {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    } else {
                        self.im.user.set_answer('working_date', year + month + content);
                        return 'state_validate_date';
                    }
                }
            });
        });

    // baby
        // ChoiceState st-12
        self.add('state_baby_birth_year', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Baby born?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('this_year', $('this year')),
                    new Choice('last_year', $('last year'))
                ],
                next: function(choice) {
                    var year_value = go.utils_project.get_year_value(
                        go.utils.get_today(self.im.config), choice.value);
                    self.im.user.set_answer('working_year', year_value);
                    return 'state_baby_birth_month';
                }
            });
        });

        // ChoiceState st-12
        self.add('state_baby_birth_month', function(name, creator_opts) {
            var question_text = 'Birth month this/last year?';
            var retry_text = 'Retry. Birth month this/last year?';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            var speech_option = go.utils_project.get_speech_option_year(
                self.im.user.answers.state_baby_birth_year);
            return new ChoiceState(name, {
                question: $(use_text),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: go.utils.make_month_choices(
                    $, go.utils.get_january(self.im.config), 12, 1, "MM", "MMMM"),
                next: function(choice) {
                    var today = go.utils.get_today(self.im.config);
                    if (go.utils_project.is_valid_month(today, self.im.user.answers.working_year,
                                                choice.value, 13)) {
                        self.im.user.set_answer('working_month', choice.value);
                        return 'state_baby_birth_day';
                    } else {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    }
                }
            });
        });

        // FreeText st-13
        self.add('state_baby_birth_day', function(name, creator_opts) {
            var question_text = 'Birth day in {{ month }} {{ year }}';
            var retry_text = 'Retry birth day {{ month }} {{ year }}';
            var use_text = creator_opts.retry === true ? retry_text : question_text;
            var month = self.im.user.answers.working_month;
            var year = self.im.user.answers.working_year;
            var speech_option = go.utils_project.get_speech_option_pregnancy_status_day(
                self.im, month);

            return new FreeText(name, {
                question: $(use_text).context({ month: month, year: year }),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (!(content > 0 && content <= 31)) {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    } else {
                        self.im.user.set_answer('working_date',
                            year + month + content);
                        return 'state_validate_date';
                    }
                }
            });
        });

    // continue
        // Validate overall date
        self.add('state_validate_date', function(name, creator_opts) {
            var dateToValidate = self.im.user.answers.working_date;
            if (go.utils.is_valid_date(dateToValidate, 'YYYYMMDD')) {
                return self.states.create('state_msg_language');
            } else {
                return self.states.create('state_invalid_date');
            }
        });

        self.add('state_invalid_date', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question:
                    $('The date you entered is not a real date. Please try again.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('continue', $('Continue'))
                ],
                next: function() {
                    if (self.im.user.answers.state_pregnancy_status === 'prebirth') {
                        return 'state_last_period_year';
                    } else {
                        return 'state_baby_birth_year';
                    }
                }
            });
        });

        // ChoiceState st-07
        self.add('state_msg_language', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Language?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('english', $('english')),
                    new Choice('hausa', $('hausa')),
                    new Choice('igbo', $('igbo')),
                ],
                next: 'state_msg_type'
            });
        });

        // ChoiceState st-08
        self.add('state_msg_type', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Channel?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('voice', $('voice')),
                    new Choice('sms', $('sms'))
                ],
                next: function(choice) {
                    if (choice.value === 'voice') {
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

        // EndState st-14
        self.add('state_end_sms', function(name, creator_opts) {
            var speech_option = '1';
            var text = $('Thank you! three times a week.');
            return new EndState(name, {
                text: text,
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                next: 'state_start'
            });
        });

        // ChoiceState st-09
        self.add('state_voice_days', function(name, creator_opts) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Message days?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('mon_wed', $('mon_wed')),
                    new Choice('tue_thu', $('tue_thu'))
                ],
                next: 'state_voice_times'
            });
        });

        // ChoiceState st-10
        self.add('state_voice_times', function(name, creator_opts) {
            var days = self.im.user.answers.state_voice_days;
            var speech_option = go.utils_project.get_speech_option_days(days);
            return new ChoiceState(name, {
                question: $('Message time?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
                choices: [
                    new Choice('9_11', $('9_11')),
                    new Choice('2_5', $('2_5'))
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
        self.add('state_end_voice', function(name, creator_opts) {
            var time = self.im.user.answers.state_voice_times;
            var days = self.im.user.answers.state_voice_days;
            var speech_option = go.utils_project.get_speech_option_days_time(days, time);
            var text = $('Thank you! Time: {{ time }}. Days: {{ days }}.'
                         ).context({ time: time, days: days });
            return new EndState(name, {
                text: text,
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, lang, speech_option, creator_opts.retry),
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
