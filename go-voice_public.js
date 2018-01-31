// WARNING: This is a generated file.
//          If you edit it you will be sad.
//          Edit src/app.js instead.

var go = {};
go;

/*jshint -W083 */
var vumigo = require('vumigo_v02');
var moment = require('moment');
var assert = require('assert');
var JsonApi = vumigo.http.api.JsonApi;
var Choice = vumigo.states.Choice;
var url_utils = require('url');

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

    /**: get_paginated_response(service, endpoint, params)
    Gets all pages of a paginated request.

    :param string service: The name of the service being queried.
    :param string endpoint: The url endpoint to send the request to.
    :param object params: The query parameters for the request
    :param object im:
    */
    get_paginated_response: function(service, endpoint, params, im) {
        // Get the current page and log the call
        return go.utils
            .service_api_call(service, 'get', params, null, endpoint, im)
            .then(function(response) {
                var results = response.data.results;
                if (response.data.next === null) {
                    return {results: results, count: results.length};
                }
                var next_url = url_utils.parse(response.data.next, true);
                // Recursively get next pages
                return go.utils.
                    get_paginated_response(service, endpoint, next_url.query, im)
                    .then(function(page) {
                        // Tack subsequent pages onto current page
                        var combined_results = results.concat(page.results);
                        return {results: combined_results,
                                count:combined_results.length};
                    });
            });
    },

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
            && content.length == 11;
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

    check_number_in_range: function(content, lower, upper) {
      if (go.utils.check_valid_number(content)) {
        var number = parseInt(content);
        return (number >= lower && number <= upper);
      }
      return false;
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
      // Currently supports month translation in formats MMMM and MM

        var choices = [];
        var monthIterator = startDate;
        for (var i=0; i<limit; i++) {
            var raw_label = monthIterator.format(labelFormat);
            var prefix, suffix, month, translation;

            var quad_month_index = labelFormat.indexOf("MMMM");
            var trip_month_index = labelFormat.indexOf("MMM");

            if (quad_month_index > -1) {
                month = monthIterator.format("MMMM");
                prefix = raw_label.substring(0, quad_month_index);
                suffix = raw_label.substring(quad_month_index+month.length, raw_label.length);
                translation = {
                    January: $("{{pre}}January{{post}}"),
                    February: $("{{pre}}February{{post}}"),
                    March: $("{{pre}}March{{post}}"),
                    April: $("{{pre}}April{{post}}"),
                    May: $("{{pre}}May{{post}}"),
                    June: $("{{pre}}June{{post}}"),
                    July: $("{{pre}}July{{post}}"),
                    August: $("{{pre}}August{{post}}"),
                    September: $("{{pre}}September{{post}}"),
                    October: $("{{pre}}October{{post}}"),
                    November: $("{{pre}}November{{post}}"),
                    December: $("{{pre}}December{{post}}"),
                };
                translated_label = translation[month].context({
                    pre: prefix,
                    post: suffix
                });
            } else if (trip_month_index > -1) {
                month = monthIterator.format("MMM");
                prefix = raw_label.substring(0, trip_month_index);
                suffix = raw_label.substring(trip_month_index+month.length, raw_label.length);
                translation = {
                    Jan: $("{{pre}}Jan{{post}}"),
                    Feb: $("{{pre}}Feb{{post}}"),
                    Mar: $("{{pre}}Mar{{post}}"),
                    Apr: $("{{pre}}Apr{{post}}"),
                    May: $("{{pre}}May{{post}}"),
                    Jun: $("{{pre}}Jun{{post}}"),
                    Jul: $("{{pre}}Jul{{post}}"),
                    Aug: $("{{pre}}Aug{{post}}"),
                    Sep: $("{{pre}}Sep{{post}}"),
                    Oct: $("{{pre}}Oct{{post}}"),
                    Nov: $("{{pre}}Nov{{post}}"),
                    Dec: $("{{pre}}Dec{{post}}"),
                };
                translated_label = translation[month].context({
                    pre: prefix,
                    post: suffix
                });
            } else {
                // assume numbers don't need translation
                translated_label = raw_label;
            }

            choices.push(new Choice(monthIterator.format(valueFormat),
                                    translated_label));
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
                    .get_paginated_response('identities', 'identities/search/', params, im)
                    .then(function(json_get_response) {
                        var identities_found = json_get_response.results;
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

    update_identity: function(im, identity, optin) {
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

        if (optin) {
            if (identity.details && identity.details.addresses && identity.details.addresses.msisdn){
                if (identity.details.opted_out){
                    delete identity.details.opted_out;
                }

                for (var msisdn in identity.details.addresses.msisdn) {
                    if ("optedout" in identity.details.addresses.msisdn[msisdn]){
                        delete identity.details.addresses.msisdn[msisdn].optedout;
                    }
                }
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
            .get_paginated_response('subscriptions', endpoint, params, im)
            .then(function(response) {
                return response.results;
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

    resend_all_subscriptions: function(im, identity) {
        return go.utils
            .get_active_subscriptions_by_identity(im, identity.id)
            .then(function(subscriptions){
                for (var i=0; i<subscriptions.length; i++) {
                    subscription = subscriptions[i];
                    var endpoint = 'subscriptions/' + subscription.id + '/resend';
                    go.utils.service_api_call('subscriptions', 'post', {}, {}, endpoint, im);
                }
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

go.app = function() {
    var vumigo = require('vumigo_v02');
    var Q = require('q');
    var App = vumigo.App;
    var ChoiceState = vumigo.states.ChoiceState;
    var Choice = vumigo.states.Choice;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;


    var GoApp = App.extend(function(self) {
        App.call(self, 'state_start');
        var $ = self.$;

        self.add = function(name, creator) {
            self.states.add(name, function(name, opts) {
                var pass_opts = opts || {};
                pass_opts.name = name;

                if (go.utils_project.should_repeat(self.im)) {
                    // Prevent previous content being passed to next state
                    // thus preventing infinite repeat loop
                    self.im.msg.content = null;
                    return self.states.create(name, pass_opts);
                }

                if (go.utils_project.should_restart(self.im)) {
                    // Prevent previous content being passed to next state
                    self.im.msg.content = null;
                    var state_to_restart_from = self.im.user.answers.receiver_household_only
                        ? 'state_main_menu_household'
                        : 'state_main_menu';
                    return self.states.create(state_to_restart_from, pass_opts);  // restarts to either st-A or st-A1
                }

                return creator(name, opts);
            });
        };

    // START STATE

        // ROUTING

        self.states.add('state_start', function() {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            return self.im.user
                .set_lang(self.im.config.default_language)
                .then(function() {
                    return self.states.create("state_msg_receiver_msisdn");
                });
        });

        // A loopback state that is required since you can't pass opts back
        // into the same state
        self.add('state_retry', function(name, opts) {
            return self.states.create(opts.retry_state, {'retry': true});
        });

    // INITIAL STATES

        // FreeText st-B
        self.add('state_msg_receiver_msisdn', function(name, creator_opts) {
            var speech_option = '1';
            var question_text = 'Welcome, Number';
            return new FreeText(name, {
                question: $(question_text),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (go.utils.is_valid_msisdn(content)) {
                        return 'state_check_registered';
                    } else {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    }
                }
            });
        });

        // Interstitial - determine contact registration
        self.states.add('state_check_registered', function() {
            var msisdn = go.utils.normalize_msisdn(
                self.im.user.answers.state_msg_receiver_msisdn,
                self.im.config.country_code
            );
            return self.im
                .log('Starting for msisdn: ' + msisdn)
                .then(function() {
                    return go.utils
                        .get_identity_by_address({'msisdn': msisdn}, self.im)
                        .then(function(contact) {
                            if (contact && contact.details.receiver_role) {
                                self.im.user.set_answer('role_player', contact.details.receiver_role);
                                self.im.user.set_answer('contact_id', contact.id);
                                return self.im.user
                                    .set_lang(contact.details.preferred_language)
                                    .then(function() {
                                        return self.states.create('state_check_receiver_role');
                                    });
                            } else {
                                return self.states.create('state_msisdn_not_recognised');
                            }
                        });
                });
        });

        self.add('state_check_receiver_role', function(name) {
            var role = self.im.user.answers.role_player;
            var contact_id = self.im.user.answers.contact_id;
            if (role === 'mother') {
                // lookup contact so we can get the link to the household receiver (if any)
                return go.utils
                    .get_identity(contact_id, self.im)
                    .then(function(mother) {
                        self.im.user.set_answer('mother_id', contact_id);
                        self.im.user.set_answer('mother_msisdn',
                            Object.keys(mother.details.addresses.msisdn)[0]);
                        if (mother.details.linked_to) {
                            self.im.user.set_answer('household_id', mother.details.linked_to);
                            self.im.user.set_answer('seperate_household_receiver', true);
                            self.im.user.set_answer('reg_type', 'mother_and_other');
                            // lookup household so we can save their msisdn
                            return go.utils
                                .get_identity(self.im.user.answers.household_id, self.im)
                                .then(function(household) {
                                    self.im.user.set_answer('household_msisdn',
                                        Object.keys(household.details.addresses.msisdn)[0]);
                                    return self.states.create('state_main_menu');
                                });
                        } else {
                            // mother_only
                            self.im.user.set_answer('household_id', null);
                            self.im.user.set_answer('seperate_household_receiver', false);
                            self.im.user.set_answer('reg_type', 'mother_only');
                            return self.states.create('state_main_menu');
                        }
                    });
            } else {
                // lookup contact so we can get the link to the mother
                return go.utils
                    .get_identity(contact_id, self.im)
                    .then(function(contact) {
                        self.im.user.set_answer('household_id', contact_id);
                        self.im.user.set_answer('mother_id', contact.details.linked_to);
                        self.im.user.set_answer('household_msisdn',
                            Object.keys(contact.details.addresses.msisdn)[0]);
                        if (contact.details.household_msgs_only) {
                            // set true for mother_friend, mother_family, mother_father identification
                            self.im.user.set_answer('seperate_household_receiver', true);
                            self.im.user.set_answer('reg_type', 'mother_and_other');
                            // lookup mother so we can save her msisdn
                            return go.utils
                                .get_identity(self.im.user.answers.mother_id, self.im)
                                .then(function(mother) {
                                    self.im.user.set_answer('mother_msisdn',
                                        Object.keys(mother.details.addresses.msisdn)[0]);
                                    return self.states.create('state_main_menu_household');
                                });
                        } else {
                            // set false for friend_only, family_only, father_only identification
                            // cannot set mother msisdn as it doesn't exist
                            self.im.user.set_answer('seperate_household_receiver', false);
                            self.im.user.set_answer('reg_type', 'other_only');
                            return self.states.create('state_main_menu');
                        }
                    });
            }
        });

        // ChoiceState st-B
        self.add('state_msisdn_not_recognised', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Number not recognised.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                choices: [
                    new Choice('state_msg_receiver_msisdn', $('If you entered the incorrect number, press 1')),
                    new Choice('state_end_exit', $('to exit, press 2'))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // ChoiceState st-A
        self.add('state_main_menu', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Choose:'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                choices: [
                    new Choice('state_check_baby_subscription', $('baby')),
                    new Choice('state_check_msg_type', $('preferences')),
                    new Choice('state_new_msisdn', $('number')),
                    new Choice('state_msg_language', $('language')),
                    new Choice('state_optout_reason', $('optout'))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

       // ChoiceState st-A1
        self.add('state_main_menu_household', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Choose:'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                choices: [
                    new Choice('state_check_baby_subscription', $('baby')),
                    new Choice('state_new_msisdn', $('number')),
                    new Choice('state_msg_language', $('language')),
                    new Choice('state_optout_reason', $('optout'))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

    // BABY CHANGE STATES

        // interstitial
        self.add('state_check_baby_subscription', function(name) {
            return go.utils_project
                .check_postbirth_subscription(self.im, self.im.user.answers.mother_id)
                .then(function(postbirth_sub) {
                    if (postbirth_sub === true) {
                        return self.states.create('state_already_registered_baby');
                    } else if (postbirth_sub === 'no_active_subs_found') {
                        return self.states.create('state_baby_switch_broken');  // TODO #101
                    } else {
                        return self.states.create('state_change_baby');
                    }
                });
        });

        // EndState st-01
        self.add('state_already_registered_baby', function(name) {
            var speech_option = 1;
            return new EndState(name, {
                text: $('You are already subscribed.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                next: 'state_start'
            });
        });

        // interstitial to save subscription to baby messages
        self.add('state_change_baby', function(name) {
            return go.utils_project
                .switch_to_baby(self.im, self.im.user.answers.mother_id)
                .then(function() {
                    return self.states.create('state_end_baby');
                });
        });

        // EndState st-02
        self.add('state_end_baby', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you - baby'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                next: 'state_start'
            });
        });

    // MSG CHANGE STATES

        // interstitial to check what type of messages the user is registered for
        self.add('state_check_msg_type', function(name) {
            return go.utils_project
                .get_subscription_msg_type(self.im, self.im.user.answers.mother_id)
                .then(function(msg_format) {
                    self.im.user.set_answer('msg_format', msg_format);
                    if (msg_format === 'text') {
                        return self.states.create('state_change_menu_sms');
                    } else if (msg_format === 'audio') {
                        return self.states.create('state_change_menu_voice');
                    } else {
                        return self.states.create('state_end_exit');
                    }
                });
        });

        // ChoiceState st-03
        self.add('state_change_menu_sms', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Please select what you would like to do:'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                choices: [
                    new Choice('change', $('Change from text to voice'))
                ],
                next: 'state_voice_days'
            });
        });

        // ChoiceState st-04
        self.add('state_voice_days', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Message days?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                choices: [
                    new Choice('mon_wed', $('Monday and Wednesday')),
                    new Choice('tue_thu', $('Tuesday and Thursday'))
                ],
                next: 'state_voice_times'
            });
        });

        // ChoiceState st-05
        self.add('state_voice_times', function(name) {
            var days = self.im.user.answers.state_voice_days;
            var speech_option = go.utils_project.get_speech_option_days(days);

            return new ChoiceState(name, {
                question: $('Message times?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                choices: [
                    new Choice('9_11', $('9-11am')),
                    new Choice('2_5', $('2-5pm')),
                    new Choice('6_8', $('6-8pm'))
                ],
                next: function(choice) {
                    return go.utils_project
                        .update_msg_format_time(
                            self.im,
                            'audio',
                            self.im.user.answers.state_voice_days,
                            choice.value
                        )
                        .then(function() {
                            return 'state_end_voice_confirm';
                        });
                }
            });
        });

        // EndState st-06
        self.add('state_end_voice_confirm', function(name) {
            var days = self.im.user.answers.state_voice_days;
            var time = self.im.user.answers.state_voice_times;
            var speech_option = go.utils_project.get_speech_option_days_time(days, time);

            return new EndState(name, {
                text: $('Thank you! Time: {{ time }}. Days: {{ days }}.'
                    ).context({ time: time, days: days }),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                next: 'state_start'
            });
        });

        // ChoiceState st-07
        self.add('state_change_menu_voice', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Please select what you would like to do:'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                choices: [
                    new Choice('state_voice_days', $('Change times')),
                    new Choice('state_end_sms_confirm', $('Change mother message from voice to text'))
                ],
                next: function(choice) {
                        if (choice.value !== 'state_end_sms_confirm') {
                            return choice.value;
                        } else {
                            return go.utils_project
                                .update_msg_format_time(
                                    self.im,
                                    'text',
                                    null,
                                    null
                                )
                                .then(function() {
                                    return 'state_end_sms_confirm';
                                });
                        }
                }
            });
        });

        // EndState st-09
        self.add('state_end_sms_confirm', function(name) {
            var speech_option = '1';

            return new EndState(name, {
                text: $('Thank you. You will now receive text messages.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                next: 'state_start'
            });
        });

    // NUMBER CHANGE STATES

        // FreeText st-09
        self.add('state_new_msisdn', function(name, creator_opts) {
            var speech_option = 1;
            var question_text = 'Please enter new mobile number';
            return new FreeText(name, {
                question: $(question_text),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option, creator_opts.retry),
                next: function(content) {
                    if (!go.utils.is_valid_msisdn(content)) {
                        return {
                            'name': 'state_retry',
                            'creator_opts': {'retry_state': name}
                        };
                    }
                    var msisdn = go.utils.normalize_msisdn(
                        content, self.im.config.country_code);
                    return go.utils
                        .get_identity_by_address({'msisdn': msisdn}, self.im)
                        .then(function(identity) {
                            if (identity && identity.details && identity.details.receiver_role) {
                                return 'state_number_in_use';
                            } else {
                                return {
                                    'name': 'state_update_number',
                                    'creator_opts': {'new_msisdn': msisdn}
                                };
                            }
                        });
                }
            });
        });

        // ChoiceState st-22
        self.add('state_number_in_use', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $("Sorry, this number is already registered"),
                error: $("Invalid input."),
                choices: [
                    new Choice('state_new_msisdn', $("To try a different number, press 1")),
                    new Choice('state_end_exit', $("To exit, press 2"))
                ],
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        // Interstitial
        self.add('state_update_number', function(name, creator_opts) {
            return go.utils
                .get_identity(self.im.user.answers.contact_id, self.im)
                .then(function(contact) {
                    // TODO #70: Handle multiple addresses, currently overwrites existing
                    // on assumption we're dealing with one msisdn only
                    contact.details.addresses.msisdn = {};
                    contact.details.addresses.msisdn[creator_opts.new_msisdn] = {};
                    return go.utils
                        .update_identity(self.im, contact)
                        .then(function() {
                            return self.states.create('state_end_new_msisdn');
                        });
                });
        });

        // EndState st-10
        self.add('state_end_new_msisdn', function(name) {
            var speech_option = 1;
            return new EndState(name, {
                text: $('Thank you. Mobile number changed.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                next: 'state_start'
            });
        });

    // LANGUAGE CHANGE STATES

        // ChoiceState st-11
        self.add('state_msg_language', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Language?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                choices: [
                    new Choice('eng_NG', $('English')),
                    new Choice('ibo_NG', $('Igbo')),
                    new Choice('pcm_NG', $('Pidgin'))
                ],
                next: function(choice) {
                    return self.im.user
                        .set_lang(choice.value)
                        .then(function() {
                            return self.states.create('state_change_language');
                        });
                }
            });
        });

        self.add('state_change_language', function(name) {
            return go.utils_project
                .change_language(
                    self.im,
                    self.im.user.answers.state_msg_language,
                    self.im.user.answers.mother_id,
                    self.im.user.answers.household_id
                )
                .then(function() {
                    return self.states.create('state_end_msg_language_confirm');
                });
        });

        // EndState st-12
        self.add('state_end_msg_language_confirm', function(name) {
            var speech_option = 1;
            return new EndState(name, {
                text: $('Thank you. Language preference updated.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                next: 'state_start'
            });
        });

    // OPTOUT STATES

        // ChoiceState st-13
        self.add('state_optout_reason', function(name) {
            var speech_option = '1';

            return new ChoiceState(name, {
                question: $('Optout reason?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                choices: [
                    new Choice('miscarriage', $("Mother miscarried")),
                    new Choice('stillborn', $("Baby stillborn")),
                    new Choice('baby_death', $("Baby passed away")),
                    new Choice('not_useful', $("Messages not useful")),
                    new Choice('other', $("Other"))
                ],
                next: function(choice) {
                    switch (choice.value) {
                        case 'miscarriage': return 'state_loss_subscription';
                        case 'stillborn': return 'state_optout_all';
                        case 'baby_death': return 'state_optout_all';
                        case 'not_useful': return 'state_check_subscription';
                        case 'other': return 'state_check_subscription';
                    }
                }
            });
        });

        // ChoiceState st-14
        self.add('state_loss_subscription', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Receive loss messages?'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                choices: [
                    new Choice('state_switch_loss', $("Yes")),
                    new Choice('state_optout_all', $("No"))
                ],
                next: function(choice) {
                    return choice.value;
                }
            });
        });

        self.add('state_optout_all', function(name) {
            if (self.im.user.answers.household_id === null) {
                return Q
                    .all([
                        go.utils_project.optout_mother(self.im, 'voice_public'),
                        go.utils_project.unsub_mother(
                            self.im, self.im.user.answers.mother_id,
                            self.im.user.answers.household_id,
                            self.im.user.answers.state_optout_reason)
                    ])
                    .then(function() {
                        if (self.im.user.answers.state_optout_reason === 'not_useful' ||
                            self.im.user.answers.state_optout_reason === 'other') {
                            return self.states.create('state_end_optout');
                        } else {
                            return self.states.create('state_end_loss');
                        }
                    });
            } else if (self.im.user.answers.reg_type === 'other_only') {
                return Q
                    .all([
                        go.utils_project.optout_household(self.im, 'voice_public'),
                        go.utils_project.unsub_household(
                            self.im, self.im.user.answers.mother_id,
                            self.im.user.answers.household_id,
                            self.im.user.answers.state_optout_reason)
                    ])
                    .then(function() {
                        if (self.im.user.answers.state_optout_reason === 'not_useful' ||
                            self.im.user.answers.state_optout_reason === 'other') {
                            return self.states.create('state_end_optout');
                        } else {
                            return self.states.create('state_end_loss');
                        }
                    });
            } else {
                return Q
                    .all([
                        go.utils_project.optout_mother(self.im, 'voice_public'),
                        go.utils_project.unsub_mother(
                            self.im, self.im.user.answers.mother_id,
                            self.im.user.answers.household_id,
                            self.im.user.answers.state_optout_reason),
                        go.utils_project.optout_household(self.im, 'voice_public'),
                        go.utils_project.unsub_household(
                            self.im, self.im.user.answers.mother_id,
                            self.im.user.answers.household_id,
                            self.im.user.answers.state_optout_reason)
                    ])
                    .then(function() {
                        if (self.im.user.answers.state_optout_reason === 'not_useful' ||
                            self.im.user.answers.state_optout_reason === 'other') {
                            return self.states.create('state_end_optout');
                        } else {
                            return self.states.create('state_end_loss');
                        }
                    });
            }
        });

        self.add('state_switch_loss', function(name) {
            return go.utils_project
                .switch_to_loss(self.im, self.im.user.answers.mother_id,
                                self.im.user.answers.state_optout_reason)
                .then(function() {
                    if (self.im.user.answers.household_id &&
                        self.im.user.answers.seperate_household_receiver === true) {
                        return go.utils_project
                            .optout_household(self.im, 'voice_public')
                            .then(function() {
                                return self.states.create('state_end_loss_subscription_confirm');
                            });
                    } else if (self.im.user.answers.household_id &&
                               self.im.user.answers.seperate_household_receiver === false) {
                        return go.utils_project
                            .unsub_household(self.im, self.im.user.answers.mother_id,
                                             self.im.user.answers.household_id,
                                             self.im.user.answers.state_optout_reason)
                            .then(function() {
                                return self.states.create('state_end_loss_subscription_confirm');
                            });
                    } else {
                        return self.states.create('state_end_loss_subscription_confirm');
                    }
                });
        });

        // interstitial
        self.states.add('state_check_subscription', function() {
            var contact_id = self.im.user.answers.contact_id;
            return go.utils
                .get_identity(contact_id, self.im)
                .then(function(contact) {
                    //  and mother_only subscriptions bypass to end state state_end_optout
                    if (self.im.user.answers.reg_type === 'mother_only') {
                        return Q.all([
                            go.utils_project.optout_mother(self.im, 'voice_public'),
                            go.utils_project.unsub_mother(
                                self.im, self.im.user.answers.mother_id,
                                self.im.user.answers.household_id,
                                self.im.user.answers.state_optout_reason)
                        ]).then(function() {
                            return self.states.create('state_end_optout');
                        });
                    } else if (self.im.user.answers.reg_type === 'mother_and_other' &&
                         self.im.user.answers.role_player !== 'mother') {
                        return Q.all([
                            go.utils_project.optout_household(self.im, 'voice_public'),
                            go.utils_project.unsub_household(
                                self.im, self.im.user.answers.mother_id,
                                self.im.user.answers.household_id,
                                self.im.user.answers.state_optout_reason)
                        ]).then(function() {
                            return self.states.create('state_end_optout');
                        });
                    } else {
                        return self.states.create("state_optout_receiver");
                    }
                });
        });

        // EndState st-15
        self.add('state_end_loss_subscription_confirm', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you. You will now receive messages to support you during this difficult time.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                next: 'state_start'
            });
        });

        // ChoiceState st-16
        self.add('state_optout_receiver', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Which messages to opt-out on?'),
                error: $("Invalid input. Which message to opt-out on?"),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                choices: [
                    new Choice('mother', $("Mother messages")),
                    new Choice('household', $("Household messages")),
                    new Choice('all', $("All messages"))
                ],
                next: function(choice) {
                    switch (choice.value) {
                        case 'mother':
                            if (self.im.user.answers.reg_type === 'other_only') {
                                return go.utils_project
                                    .unsub_mother(self.im, self.im.user.answers.mother_id,
                                                  self.im.user.answers.household_id,
                                                  self.im.user.answers.state_optout_reason)
                                    .then(function() {
                                        return 'state_end_optout';
                                    });
                            } else {
                                return go.utils_project
                                    .optout_mother(self.im, 'voice_public')
                                    .then(function() {
                                        return 'state_end_optout';
                                    });
                            }
                            break;
                        case 'household':
                            // unsubscribe from household messages only
                            if (self.im.user.answers.reg_type === 'other_only') {
                                return go.utils_project
                                    .unsub_household(self.im, self.im.user.answers.mother_id,
                                                     self.im.user.answers.household_id,
                                                     self.im.user.answers.state_optout_reason)
                                    .then(function() {
                                        return 'state_end_optout';
                                    });
                            // opt out household messages receiver
                            } else {
                                return go.utils_project
                                    .optout_household(self.im, 'voice_public')
                                    .then(function() {
                                        return 'state_end_optout';
                                    });
                            }
                            break;
                        case 'all':
                            if (self.im.user.answers.reg_type === 'other_only') {
                                return Q
                                    .all([
                                        go.utils_project.unsub_mother(
                                            self.im, self.im.user.answers.mother_id,
                                            self.im.user.answers.household_id,
                                            self.im.user.answers.state_optout_reason
                                        ),
                                        go.utils_project.optout_household(self.im, 'voice_public')
                                    ])
                                    .then(function() {
                                        return 'state_end_optout';
                                    });
                            } else {
                                return Q
                                    .all([
                                        go.utils_project.optout_mother(self.im, 'voice_public'),
                                        go.utils_project.optout_household(self.im, 'voice_public')
                                    ])
                                    .then(function() {
                                        return 'state_end_optout';
                                    });
                            }
                    }
                }
            });
        });

        // EndState st-17
        self.add('state_end_optout', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you - optout'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                next: 'state_start'
            });
        });

        // EndState st-21
        self.add('state_end_loss', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('We are sorry for your loss. You will no longer receive messages.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
                next: 'state_start'
            });
        });

    // GENERAL END STATE

        // EndState st-22
        self.add('state_end_exit', function(name) {
            var speech_option = '1';
            return new EndState(name, {
                text: $('Thank you for using the Hello Mama service. Goodbye.'),
                helper_metadata: go.utils_project.make_voice_helper_data(
                    self.im, name, self.im.user.lang, speech_option),
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
