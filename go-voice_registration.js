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

    get_speech_option_month: function(month) {
        month_map = {
            'january': '01',
            'february': '02',
            'march': '03',
            'april': '04',
            'may': '05',
            'june': '06',
            'july': '07',
            'august': '08',
            'september': '09',
            'october': '10',
            'november': '11',
            'december': '12'
        };
        return month_map[month];
    },

    get_speech_option_month_year: function(month, year) {
        last_year_month_map = {
            'january': '01',
            'february': '02',
            'march': '03',
            'april': '04',
            'may': '05',
            'june': '06',
            'july': '07',
            'august': '08',
            'september': '09',
            'october': '10',
            'november': '11',
            'december': '12'
        };
        this_year_month_map = {
            'january': '13',
            'february': '14',
            'march': '15',
            'april': '16',
            'may': '17',
            'june': '18',
            'july': '19',
            'august': '20',
            'september': '21',
            'october': '22',
            'november': '23',
            'december': '24'
        };
        return year === 'last_year' ? last_year_month_map[month]
                                    : this_year_month_map[month];
    },

    get_speech_option_days: function(days) {
        day_map = {
            'mon_wed': '01',
            'tue_thu': '02'
        };
        return day_map[days];
    },

    get_speech_option_days_time: function(days, time) {
        day_map_9_11 = {
            'mon_wed': '01',
            'tue_thu': '02'
        };
        day_map_2_5 = {
            'mon_wed': '03',
            'tue_thu': '04'
        };
        return time === '9_11' ? day_map_9_11[days]
                               : day_map_2_5[days];
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
            var speech_option = '01';
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
            var speech_option = '01';
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
            var speech_option = '01';
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
            var speech_option = '01';
            var routing = {
                'pregnant': 'state_r05_pregnant_year',
                'baby': 'state_r06_baby_year'
            };
            return new ChoiceState(name, {
                question: $('Pregnant or baby'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('pregnant', $('Pregnant')),
                    new Choice('baby', $('Baby'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r05_pregnant_year', function(name) {
            // TODO #6 Don't show next year in Jan / Feb
            var speech_option = '01';
            var routing = {
                'this_year': 'state_r07_pregnant_thisyear_month',
                'next_year': 'state_r08_pregnant_nextyear_month'
            };
            return new ChoiceState(name, {
                question: $('DOB?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('this_year', $('This year')),
                    new Choice('next_year', $('Next year'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r06_baby_year', function(name) {
            var speech_option = '01';
            var routing = {
                'last_year': 'state_r09_baby_lastyear_month',
                'this_year': 'state_r10_baby_thisyear_month'
            };
            return new ChoiceState(name, {
                question: $('DOB?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('last_year', $('Last year')),
                    new Choice('this_year', $('This year'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r07_pregnant_thisyear_month', function(name) {
            var speech_option = '01';
            // TODO #6 Dynamically generate months
            var routing = {
                'july': 'state_r11_pregnant_day',
                'august': 'state_r11_pregnant_day',
                'september': 'state_r11_pregnant_day',
                'october': 'state_r11_pregnant_day',
                'november': 'state_r11_pregnant_day',
                'december': 'state_r11_pregnant_day'
            };
            return new ChoiceState(name, {
                question: $('Which month?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('july', $('july')),
                    new Choice('august', $('august')),
                    new Choice('september', $('september')),
                    new Choice('october', $('october')),
                    new Choice('november', $('november')),
                    new Choice('december', $('december'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r08_pregnant_nextyear_month', function(name) {
            var speech_option = '01';
            // TODO #6 Dynamically generate months
            var routing = {
                'january': 'state_r11_pregnant_day',
                'february': 'state_r11_pregnant_day',
                'march': 'state_r11_pregnant_day',
                'april': 'state_r11_pregnant_day',
                'may': 'state_r11_pregnant_day'
            };
            return new ChoiceState(name, {
                question: $('Which month?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('january', $('january')),
                    new Choice('february', $('february')),
                    new Choice('march', $('march')),
                    new Choice('april', $('april')),
                    new Choice('may', $('may'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r09_baby_lastyear_month', function(name) {
            var speech_option = '01';
            // TODO #6 Dynamically generate months
            var routing = {
                'july': 'state_r12_baby_day',
                'august': 'state_r12_baby_day',
                'september': 'state_r12_baby_day',
                'october': 'state_r12_baby_day',
                'november': 'state_r12_baby_day',
                'december': 'state_r12_baby_day'
            };
            return new ChoiceState(name, {
                question: $('Which month?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('july', $('july')),
                    new Choice('august', $('august')),
                    new Choice('september', $('september')),
                    new Choice('october', $('october')),
                    new Choice('november', $('november')),
                    new Choice('december', $('december'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r10_baby_thisyear_month', function(name) {
            var speech_option = '01';
            // TODO #6 Dynamically generate months
            var routing = {
                'january': 'state_r12_baby_day',
                'february': 'state_r12_baby_day',
                'march': 'state_r12_baby_day',
                'april': 'state_r12_baby_day',
                'may': 'state_r12_baby_day',
                'june': 'state_r12_baby_day',
                'july': 'state_r12_baby_day'
            };
            return new ChoiceState(name, {
                question: $('Which month?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('january', $('january')),
                    new Choice('february', $('february')),
                    new Choice('march', $('march')),
                    new Choice('april', $('april')),
                    new Choice('may', $('may')),
                    new Choice('june', $('june')),
                    new Choice('july', $('july'))
                ],
                next: function(choice) {
                    return routing[choice.value];
                }
            });
        });

        self.states.add('state_r11_pregnant_day', function(name) {
            // TODO #7
            var month = self.im.user.answers.state_r07_pregnant_thisyear_month
                     || self.im.user.answers.state_r08_pregnant_nextyear_month;
            var speech_option = go.utils.get_speech_option_month(month);
            return new FreeText(name, {
                question: $('Which day of {{ month }}?'
                    ).context({ month: month }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_r13_language'
            });
        });

        self.states.add('state_r12_baby_day', function(name) {
            // TODO #7
            var year = self.im.user.answers.state_r06_baby_year;
            var month = self.im.user.answers.state_r09_baby_lastyear_month
                     || self.im.user.answers.state_r10_baby_thisyear_month;
            var speech_option = go.utils.get_speech_option_month_year(month, year);
            return new FreeText(name, {
                question: $('Which day of {{ month }}?'
                    ).context({ month: month }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_r13_language'
            });
        });

        self.states.add('state_r13_language', function(name) {
            var speech_option = '01';
            return new ChoiceState(name, {
                question: $('Language?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('english', $('english')),
                    new Choice('hausa', $('hausa')),
                    new Choice('igbo', $('igbo')),
                ],
                next: 'state_r14_message_type'
            });
        });

        self.states.add('state_r14_message_type', function(name) {
            var speech_option = '01';
            var routing = {
                'sms': 'state_r15_voice_days',
                'voice': 'state_r18_end_sms'
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

        self.states.add('state_r15_voice_days', function(name) {
            var speech_option = '01';
            return new ChoiceState(name, {
                question: $('Message days?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('mon_wed', $('mon_wed')),
                    new Choice('tue_thu', $('tue_thu'))
                ],
                next: 'state_r16_voice_times'
            });
        });

        self.states.add('state_r16_voice_times', function(name) {
            var days = self.im.user.answers.state_r15_voice_days;
            var speech_option = go.utils.get_speech_option_days(days);
            return new ChoiceState(name, {
                question: $('Message time?'),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                choices: [
                    new Choice('9_11', $('9_11')),
                    new Choice('2_5', $('2_5'))
                ],
                next: 'state_r17_end_voice'
            });
        });

        self.states.add('state_r17_end_voice', function(name) {
            var time = self.im.user.answers.state_r16_voice_times;
            var days = self.im.user.answers.state_r15_voice_days;
            var speech_option = go.utils.get_speech_option_days_time(days, time);
            return new EndState(name, {
                text: $('Thank you! Time: {{ time }}. Days: {{ days }}.'
                    ).context({ time: time, days: days }),
                helper_metadata: go.utils.make_voice_helper_data(
                    self.im, name, lang, speech_option),
                next: 'state_r01_number'
            });
        });

        self.states.add('state_r18_end_sms', function(name) {
            var speech_option = '01';
            return new EndState(name, {
                text: $('Thank you!'),
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
