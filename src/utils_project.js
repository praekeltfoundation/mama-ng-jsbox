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
