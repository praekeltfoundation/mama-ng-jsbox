module.exports = function() {
    return {
        create_outbound: function(params) {
            params = params || {};
            var identity = params.identity || 'cb245673-aa41-4302-ac47-00000001002';

            var res = {
                'request': {
                    'method': 'POST',
                    'headers': {
                        'Authorization': ['Token test_key'],
                        'Content-Type': ['application/json']
                    },
                    'url': "http://localhost:8006/api/v1/outbound/",
                    'data':  {
                        "identity": identity,
                        "content": "Please dial back into *120*8864*0000# to complete the Hello MAMA registration"
                    }
                },
                'response': {
                    "code": 201,
                    "data": {
                    }
                }
            };

            return res;
        },

        javascript: "commas"
    };
};
