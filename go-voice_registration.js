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
    // TODO #12 - this is currently just a temporary workaround
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

// This app handles registration and state changes

go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var ChoiceState = vumigo.states.ChoiceState;
    var Choice = vumigo.states.Choice;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;


    var GoApp = App.extend(function(self) {
        App.call(self, 'state_r01_number');
        var $ = self.$;
        var lang = 'en';


    // REGISTRATION

        self.states.add('state_r01_number', function(name) {
            // Reset user answers when restarting the app
            self.im.user.answers = {};
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Welcome, Number'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.check_valid_phone_number(content) === false) {
                        return 'state_r02_retry_number';
                    } else {
                        return 'state_r03_receiver';
                    }
                }
            });
        });

        self.states.add('state_r02_retry_number', function(name) {
            var speech_option = '1';
            return new FreeText(name, {
                question: $('Retry number'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    if (go.utils.check_valid_phone_number(content) === false) {
                        return 'state_r02_retry_number';
                    } else {
                        return 'state_r03_receiver';
                    }
                }
            });
        });

        self.states.add('state_r03_receiver', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Choose receiver'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('mother', $('Mother')),
                    new Choice('other', $('Other'))
                ],
                next: 'state_r04_mom_state'
            });
        });

        self.states.add('state_r04_mom_state', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Pregnant or baby'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('pregnant', $('Pregnant')),
                    new Choice('baby', $('Baby'))
                ],
                next: 'state_r05_birth_year'
            });
        });

        self.states.add('state_r05_birth_year', function(name) {
            // TODO #6 Don't show next year for pregnancy in Jan / Feb
            var speech_option;
            var year_choices = [
                new Choice('last_year', $('last_year')),
                new Choice('this_year', $('this_year')),
                new Choice('next_year', $('next_year'))
            ];
            if (self.im.user.answers.state_r04_mom_state === 'pregnant') {
                choices = year_choices.slice(1,3);
                speech_option = '1';
            } else {
                choices = year_choices.slice(0,2);
                speech_option = '2';
            }
            return new ChoiceState(name, {
                question: $('Birth year?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: choices,
                next: function(choice) {
                    return 'state_r06_birth_month';
                }
            });
        });

        self.states.add('state_r06_birth_month', function(name) {
            var speech_option;
            self.im.user.answers.state_r04_mom_state === 'pregnant'
                ? speech_option = '1'
                : speech_option = '2';
            // create choices eg. new Choice('1', $('1')) etc.
            var month_choices = [];
            for (i=1; i<=12; i++) {
                month_choices.push(new Choice(i.toString(), $(i.toString())));
            }
            return new ChoiceState(name, {
                question: $('Birth month? 1-12'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: month_choices,
                next: 'state_r07_confirm_month'
            });
        });

        self.states.add('state_r07_confirm_month', function(name) {
            var routing = {
                'confirm': 'state_r08_birth_day',
                'retry': 'state_r06_birth_month'
            };
            var speech_option = self.im.user.answers.state_r06_birth_month;
            return new ChoiceState(name, {
                question: $('You entered x for Month. Correct?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('confirm', $('confirm')),
                    new Choice('retry', $('retry'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r08_birth_day', function(name) {
            var month = self.im.user.answers.state_r06_birth_month;
            var speech_option = go.utils.get_speech_option_birth_day(
                self.im, month);
            return new FreeText(name, {
                question: $('Birth day in {{ month }}?'
                    ).context({ month: month }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: function(content) {
                    // TODO check user has entered a proper day
                    return 'state_r09_language';
                }
            });
        });

        self.states.add('state_r09_language', function(name) {
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
                next: 'state_r10_message_type'
            });
        });

        self.states.add('state_r10_message_type', function(name) {
            var speech_option = '1';
            var routing = {
                'sms': 'state_r13_end',
                'voice': 'state_r11_voice_days'
            };
            return new ChoiceState(name, {
                question: $('Channel?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('sms', $('sms')),
                    new Choice('voice', $('voice'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r11_voice_days', function(name) {
            var speech_option = '1';
            return new ChoiceState(name, {
                question: $('Message days?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('mon_wed', $('mon_wed')),
                    new Choice('tue_thu', $('tue_thu'))
                ],
                next: 'state_r12_voice_times'
            });
        });

        self.states.add('state_r12_voice_times', function(name) {
            var days = self.im.user.answers.state_r11_voice_days;
            var speech_option = go.utils.get_speech_option_days(days);
            return new ChoiceState(name, {
                question: $('Message time?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('9_11', $('9_11')),
                    new Choice('2_5', $('2_5'))
                ],
                next: 'state_r13_end'
            });
        });

        self.states.add('state_r13_end', function(name) {
            var time = self.im.user.answers.state_r12_voice_times;
            var days = self.im.user.answers.state_r11_voice_days;
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
                next: 'state_r01_number'
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
