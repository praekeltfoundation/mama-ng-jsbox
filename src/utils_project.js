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
            .get_paginated_response('identities', 'identities/search/', params, im)
            .then(function(json_get_response) {
                var healthworkers_found = json_get_response.results;
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

    update_identities: function(im, optin) {
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

                    return go.utils.update_identity(im, mother_identity, optin);
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
                        go.utils.update_identity(im, mother_identity, optin),
                        go.utils.update_identity(im, receiver_identity, optin)
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
                        go.utils.update_identity(im, mother_identity, optin),
                        go.utils.update_identity(im, receiver_identity, optin)
                    ]);
                });
        }
    },


// DATE HELPERS

    is_valid_month: function(today, choiceYear, choiceMonth, monthsValid) {
        // function used to validate months for states 5A/5B & 12A/12B

        // NOTE: make sure we cast numbers to strings instead
        //       of adding up numbers
        var choiceDate = new moment('' + choiceYear + choiceMonth, "YYYYMM");
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

    get_weeks_until_today: function(config, date, format) {
        return (
            parseInt(
                moment.duration(
                    go.utils.get_today(config) - moment(date, format)
                ).asWeeks()
            )
        );
    },


// GENERAL HELPERS

    should_restart: function(im) {
        var no_restart_states = [
            // voice registration states
            'state_personnel_auth',
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
        var url_array = [];

        var url_start = im.config.services.voice_content.url + lang + '/' + name + '_' + num;
        var extension = '.mp3';

        if (retry) {
            var error_url = go.utils_project.get_voice_error_url(im, name, lang);
            url_array.push(error_url);
        }

        url_array.push(url_start + extension);

        return url_array;
    },

    // Construct helper_data object
    make_voice_helper_data: function(im, name, lang, num, retry) {
        var voice_url = go.utils_project.make_speech_url(im, name, lang, num, retry);
        var bargeInDisallowedStates = [
            // voice registration states
            'state_end_msisdn',
            'state_end_sms',
            'state_end_voice',
            // voice public states
            'state_end_voice_confirm',
            'state_end_sms_confirm',
            'state_end_new_msisdn',
            'state_end_baby',
            'state_end_exit',
            'state_end_msg_language_confirm',
            'state_end_loss_subscription_confirm',
            'state_end_loss',
            'state_end_optout'
        ];

        var voice_url_check = voice_url.length === 1
            // if length is 1, check the only url in array
            ? voice_url[0]
            // else in error case, length > 1, check second url in array
            : voice_url[1];

        return im
            .log([
                'Voice URL is: ' + voice_url_check,
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
                    .head(voice_url_check)
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
                            .log('Unable to find voice file: ' + voice_url_check + '. Error: ' + error)
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

    get_voice_error_url: function(im, name, lang) {
        var states_to_error_map = {
            // ussd states
            "state_personnel_auth": "state_error_invalid_number",
            "state_msg_receiver": "state_error_invalid_selection",
            "state_msisdn": "state_error_invalid_number",
            "state_msisdn_mother": "state_error_invalid_number",
            "state_msisdn_household": "state_error_invalid_number",
            "state_msisdn_already_registered": "state_error_invalid_selection",
            "state_pregnancy_status": "state_error_invalid_selection",
            "state_last_period_year": "state_error_invalid_date",
            "state_last_period_month": "state_error_invalid_date",
            "state_last_period_day": "state_error_invalid_date",
            "state_gravida": "state_error_invalid_number",
            "state_msg_type": "state_error_invalid_selection",
            // ussd/voice states
            "state_voice_days": "state_error_invalid_selection",
            "state_voice_times": "state_error_invalid_selection",
            "state_msg_language": "state_error_invalid_selection",
            // voice states
            "state_main_menu": "state_error_invalid_selection",
            "state_main_menu_household": "state_error_invalid_selection",
            "state_msg_receiver_msisdn": "state_error_invalid_number",
            "state_msisdn_not_recognised": "state_error_invalid_selection",
            "state_change_menu_sms": "state_error_invalid_selection",
            "state_change_menu_voice": "state_error_invalid_selection",
            "state_new_msisdn": "state_error_invalid_number",
            "state_number_in_use": "state_error_invalid_selection",
            "state_optout_reason": "state_error_invalid_selection",
            "state_loss_subscription": "state_error_invalid_selection",
            "state_optout_receiver": "state_error_invalid_selection"
        };

        var error_url = im.config.services.voice_content.url + lang + '/' + states_to_error_map[name] + '.mp3';

        return error_url;
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

    get_speech_option_only: function(role) {
        role_map = {
            'mother_only': '1',
            'family_only': '2',
            'friend_only': '3',
            'father_only': '4'
        };
        return role_map[role];
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
        day_time_map = {
            'mon_wed_9_11': '1',
            'tue_thu_9_11': '2',
            'mon_wed_2_5': '3',
            'tue_thu_2_5': '4',
            'mon_wed_6_8': '5',
            'tue_thu_6_8': '6',
        };

        return day_time_map[days + '_' + time];
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
            go.utils_project.update_identities(im, true)
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
            'igbo': 'ibo_NG',
            'pidgin': 'pcm_NG'
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
