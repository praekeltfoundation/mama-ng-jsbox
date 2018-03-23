module.exports = function() {
    return {
        create_registration: function(params) {
            params = params || {};
            var identity = params.identity || 'cb245673-aa41-4302-ac47-00000001002';
            var receiver = params.receiver || 'cb245673-aa41-4302-ac47-00000001003';
            var operator = params.operator || 'cb245673-aa41-4302-ac47-00000001004';
            var user = params.user;
            var stage = params.stage || 'public';
            var msg_receiver = params.msg_receiver || 'friend_only';
            var msg_type = params.msg_type || 'text';
            var language = params.language || 'ibo_NG';

            var res = {
                'request': {
                    'method': 'POST',
                    'headers': {
                        'Authorization': ['Token test_key'],
                        'Content-Type': ['application/json']
                    },
                    'url': "http://localhost:8002/api/v1/registration/",
                    'data':  {
                        "stage": stage,
                        "mother_id": identity,
                        "data": {
                            "msg_receiver": msg_receiver,
                            "receiver_id": receiver,
                            "language": language,
                            "msg_type": msg_type,
                            "operator_id": operator,
                        }
                    }
                },
                'response': {
                    "code": 201,
                    "data": {
                        "id": "reg_for_" + identity + "_uuid",
                        "stage": stage,
                        "mother_id": identity,
                        "data": {
                            "msg_receiver": msg_receiver,
                            "receiver_id": receiver,
                            "language": language,
                            "msg_type": msg_type,
                            "operator_id": operator,
                        },
                        "validated": false,
                        "source": "source",
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z",
                        "created_by": "user",
                        "updated_by": "user"
                    }
                }
            };

            if (stage == 'public' && msg_type == 'audio'){
                res.request.data.data.voice_times = '6_8';
                res.request.data.data.voice_days = 'tue';
                res.response.data.data.voice_times = '6_8';
                res.response.data.data.voice_days = 'tue';
            }

            if (user){
                res.request.data.data.user_id = user;
                res.response.data.data.user_id = user;
            }

            return res;
        },

        add_voice_file_check: function() {

            var res = {
                'repeatable': true,
                'request': {
                    'method': 'HEAD',
                    'params': {},
                    'headers': {
                        'Connection': ['close']
                    },
                    'url': new RegExp('^http:\/\/localhost:8004\/api\/v1\/.*\.mp3$'),
                },
                'response': {
                    "code": 200,
                    "data": {}
                }
            };

            return res;
        },

        javascript: "commas"
    };
};
