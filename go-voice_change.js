// WARNING: This is a generated file.
//          If you edit it you will be sad.
//          Edit src/app.js instead.

var go = {};
go;

var Q = require('q');
var vumigo = require('vumigo_v02');
var JsonApi = vumigo.http.api.JsonApi;

// Shared utils lib
go.utils = {

    return_true: function() {
        return true;
    },

    return_false: function() {
        return false;
    },

    return_q: function() {
        return Q();
    },

    // Construct url string
    make_speech_url: function(im, name, lang, num) {
        return im.config.control.url + lang + '/' + name + '_' + num + '.mp3';
    },

    // Construct helper_data object
    make_voice_helper_data: function(im, name, lang, num) {
        return {
            voice: {
                speech_url: go.utils.make_speech_url(im, name, lang, num)
            }
        };
    },

    control_api_call: function(method, params, payload, endpoint, im) {
        var api = new JsonApi(im, {
            headers: {
                'Authorization': 'Token ' + im.config.control.api_key,
                'Content-Type': 'application/json',
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
    is_registered: function(im) {
        return Q()
            .then(function() {
                if (im.user.addr === 'unknown user') {
                    return false;
                } else {
                    return true;
                }
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

    get_addresses: function(im) {
        return "msisdn:" + im.user.addr;
    },

    create_contact: function(im, name) {
        payload = {
            "details": {
                "name": name,
                "default_addr_type": "msisdn",
                "addresses": go.utils.get_addresses(im)
            }
        };

        return go.utils
            .control_api_call("post", null, payload, 'contacts/', im);
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


    var GoApp = App.extend(function(self) {
        App.call(self, 'state_start');
        var $ = self.$;


    // ROUTING

        self.states.add('state_start', function() {
            return go.utils
                .is_registered(self.im)
                .then(function(is_registered) {
                    if (is_registered === true) {
                        return self.states.create("state_c01_main_menu");
                    } else {
                        return self.states.create("state_c02_not_registered");
                    }
                });
        });

    // CHANGE STATE

        self.states.add('state_c01_main_menu', function(name) {
            var routing = {
                'baby': 'state_c03_baby_confirm',
                'msg_time': 'state_c04_voice_days',
                'optout': 'state_c05_optout_reason'
            };
            return new ChoiceState(name, {
                question: $('Baby / Message time / Optout?'),
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

        self.states.add('state_c02_not_registered', function(name) {
            return new EndState(name, {
                text: $('Unrecognised number'),
                next: 'state_start'
            });
        });

        self.states.add('state_c03_baby_confirm', function(name) {
            return new ChoiceState(name, {
                question: $('Confirm baby?'),
                choices: [
                    new Choice('confirm', $('confirm'))
                ],
                next: 'state_c08_end_baby'
            });
        });

        self.states.add('state_c04_voice_days', function(name) {
            return new ChoiceState(name, {
                question: $('Message days?'),
                choices: [
                    new Choice('mon_wed', $('mon_wed')),
                    new Choice('tue_thu', $('tue_thu'))
                ],
                next: 'state_c06_voice_times'
            });
        });

        self.states.add('state_c05_optout_reason', function(name) {
            var routing = {
                'miscarriage': 'state_c07_loss_opt_in',
                'stillborn': 'state_c07_loss_opt_in',
                'baby_died': 'state_c07_loss_opt_in',
                'not_useful': 'state_c11_end_optout',
                'other': 'state_c11_end_optout'
            };
            return new ChoiceState(name, {
                question: $('Optout reason?'),
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

        self.states.add('state_c06_voice_times', function(name) {
            return new ChoiceState(name, {
                question: $('Message times?'),
                choices: [
                    new Choice('9_11', $('9_11')),
                    new Choice('2_5', $('2_5'))
                ],
                next: 'state_c09_end_msg_times'
            });
        });

        self.states.add('state_c07_loss_opt_in', function(name) {
            var routing = {
                'opt_in_confirm': 'state_c10_end_loss_opt_in',
                'opt_in_deny': 'state_c11_end_optout'
            };
            return new ChoiceState(name, {
                question: $('Receive loss messages?'),
                choices: [
                    new Choice('opt_in_confirm', $('opt_in_confirm')),
                    new Choice('opt_in_deny', $('opt_in_deny'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_c08_end_baby', function(name) {
            return new EndState(name, {
                text: $('Thank you - baby'),
                next: 'state_start'
            });
        });

        self.states.add('state_c09_end_msg_times', function(name) {
            var time = self.im.user.answers.state_c06_voice_times;
            var days = self.im.user.answers.state_c04_voice_days;
            return new EndState(name, {
                text: $('Thank you! Time: {{ time }}. Days: {{ days }}.'
                    ).context({ time: time, days: days }),
                next: 'state_start'
            });
        });

        self.states.add('state_c10_end_loss_opt_in', function(name) {
            return new EndState(name, {
                text: $('Thank you - loss opt in'),
                next: 'state_start'
            });
        });

        self.states.add('state_c11_end_optout', function(name) {
            return new EndState(name, {
                text: $('Thank you - optout'),
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
