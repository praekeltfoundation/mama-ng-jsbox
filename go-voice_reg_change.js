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
                return false;
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

// This app handles registration and state changes

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


    // ROUTING

        self.states.add('state_start', function() {
            return go.utils
                .is_registered(self.im)
                .then(function(is_registered) {
                    if (is_registered === true) {
                        return self.states.create("state_change_1");
                    } else {
                        return self.states.create("state_r01");
                    }
                });
        });

    // REGISTRATION

        self.states.add('state_r01', function(name) {
            return new FreeText(name, {
                question: $('Welcome, Number'),

                next: function(content) {
                    if (go.utils.check_valid_phone_number(content) === false) {
                        return 'state_r02';
                    } else {
                        return 'state_r03';
                    }
                }
            });
        });

        self.states.add('state_r02', function(name) {
            return new FreeText(name, {
                question: $('Retry number'),
                next: function(content) {
                    if (go.utils.check_valid_phone_number(content) === false) {
                        return 'state_r02';
                    } else {
                        return 'state_r03';
                    }
                }
            });
        });

        self.states.add('state_r03', function(name) {
            return new ChoiceState(name, {
                question: $('Choose receiver'),
                choices: [
                    new Choice('mother', $('Mother')),
                    new Choice('other', $('Other'))
                ],
                next: 'state_r04'
            });
        });

        self.states.add('state_r04', function(name) {
            var routing = {
                'pregnant': 'state_r05',
                'baby': 'state_r06',
                'menu': 'state_r01'
            };
            return new ChoiceState(name, {
                question: $('Pregnant or baby'),
                choices: [
                    new Choice('pregnant', $('Pregnant')),
                    new Choice('baby', $('Baby')),
                    new Choice('menu', $('Menu')),
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r05', function(name) {
            var routing = {
                'this_year': 'state_r07',
                'next_year': 'state_r08',
                'menu': 'state_r01'
            };
            return new ChoiceState(name, {
                question: $('DOB?'),
                choices: [
                    new Choice('this_year', $('This year')),
                    new Choice('next_year', $('Next year')),
                    new Choice('menu', $('Menu')),
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r06', function(name) {
            var routing = {
                'last_year': 'state_r09',
                'this_year': 'state_r10',
                'menu': 'state_r01'
            };
            return new ChoiceState(name, {
                question: $('DOB?'),
                choices: [
                    new Choice('last_year', $('Last year')),
                    new Choice('this_year', $('This year')),
                    new Choice('menu', $('Menu')),
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r07', function(name) {
            var routing = {
                'august': 'state_r11',
                'september': 'state_r11',
                'october': 'state_r11',
                'november': 'state_r11',
                'december': 'state_r11',
                'menu': 'state_r01'
            };
            return new ChoiceState(name, {
                question: $('Which month?'),
                choices: [
                    new Choice('august', $('august')),
                    new Choice('september', $('september')),
                    new Choice('october', $('october')),
                    new Choice('november', $('november')),
                    new Choice('december', $('december')),
                    new Choice('menu', $('Menu')),
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r08', function(name) {
            var routing = {
                'january': 'state_r11',
                'february': 'state_r11',
                'march': 'state_r11',
                'april': 'state_r11',
                'may': 'state_r11',
                'menu': 'state_r01'
            };
            return new ChoiceState(name, {
                question: $('Which month?'),
                choices: [
                    new Choice('january', $('january')),
                    new Choice('february', $('february')),
                    new Choice('march', $('march')),
                    new Choice('april', $('april')),
                    new Choice('may', $('may')),
                    new Choice('menu', $('Menu')),
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_username', function(name) {
            return new FreeText(name, {
                question: $('What is your name?'),
                next: function(content) {
                    return go.utils
                        .create_contact(self.im, content)
                        .then(function() {
                            return 'state_end';
                        });
                }
            });
        });


        self.states.add('state_end', function(name) {
            return new EndState(name, {
                text: $('This is the end.'),
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
