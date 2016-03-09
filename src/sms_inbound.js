go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var EndState = vumigo.states.EndState;


    var GoApp = App.extend(function(self) {
        App.call(self, 'state_start');
        var $ = self.$;

        self.init = function() {

            // Load self.contact
            return self.im.contacts
                .for_user()
                .then(function(user_contact) {
                   self.contact = user_contact;
               });
        };


        self.states.add('state_start', function() {
            var user_first_word = go.utils.get_clean_first_word(self.im.msg.content);
            switch (user_first_word) {
                case "STOP":
                    return self.states.create("state_opt_out");
                default:
                    return self.states.create("state_end_helpdesk");
            }
        });

        // OPTOUT STATES
        self.states.add('state_opt_out', function(name) {
            return go.utils
                .opt_out(self.im, self.contact)
                .then(function() {
                    return self.states.create('state_end_opt_out');
                });
        });

        self.states.add('state_end_opt_out', function(name) {
            return new EndState(name, {
                text: $('You will no longer receive messages from Hello Mama. Should you ever want to re-subscribe, contact your local community health extension worker'),
                next: 'state_start'
            });
        });

        self.states.add('state_end_helpdesk', function(name) {
            return new EndState(name, {
                text: $("Currently no helpdesk functionality is active. Reply STOP to unsubscribe."),
                next: 'state_start'
            });
        });

    });

    return {
        GoApp: GoApp
    };
}();
