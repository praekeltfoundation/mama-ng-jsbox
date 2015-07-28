module.exports = function() {
    return [
        // get contact 07030010001 by msisdn
        {

            'request': {
                'method': 'GET',
                'params': {
                    'to_addr': '+07030010001'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8000/api/v1/contacts/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "objects": [
                        {
                            "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000001/",
                            "id": "cb245673-aa41-4302-ac47-00000000001",
                            "version": 1,
                            "details": {
                                "default_addr_type": "msisdn",
                                "addresses": "msisdn:+07030010001"
                            },
                            "created_at": "2015-07-10T06:13:29.693272Z",
                            "updated_at": "2015-07-10T06:13:29.693298Z"
                        }
                    ]
                }
            }
        },

        // get contact 08080020002 by msisdn
        {

            'request': {
                'method': 'GET',
                'params': {
                    'to_addr': '+08080020002'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8000/api/v1/contacts/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "objects": [
                        {
                            "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000002/",
                            "id": "cb245673-aa41-4302-ac47-00000000002",
                            "version": 1,
                            "details": {
                                "default_addr_type": "msisdn",
                                "addresses": "msisdn:+08080020002"
                            },
                            "created_at": "2015-07-10T06:13:29.693272Z",
                            "updated_at": "2015-07-10T06:13:29.693298Z"
                        }
                    ]
                }
            }
        },

        // get contact cb245673-aa41-4302-ac47-00000000001
        {

            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000001',
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000001/",
                    "id": "cb245673-aa41-4302-ac47-00000000001",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+07030010001"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // get contact cb245673-aa41-4302-ac47-00000000002
        {

            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000002/',
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000002/",
                    "id": "cb245673-aa41-4302-ac47-00000000002",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+08080020002"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // patch contact cb245673-aa41-4302-ac47-00000000002
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000002/",
                'data':  {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000002/",
                    "id": "cb245673-aa41-4302-ac47-00000000002",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+08080020002",
                        "opted_out": false,
                        "has_registered": true,
                        "registration_date": "2015-07-22 00:00:00 +0200",
                        "registered_by": "cb245673-aa41-4302-ac47-00000000001",
                        "baby_dob": "2015-12-21",
                        "msg_receiver": "mother",
                        "state_at_registration": "baby",
                        "lang": "eng_NG",
                        "msg_type": "voice",
                        "voice_days": "mon_wed",
                        "voice_times": "2_5"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000002/",
                    "id": "cb245673-aa41-4302-ac47-00000000002",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+08080020002",
                        "opted_out": false,
                        "has_registered": true,
                        "registration_date": "2015-07-22 00:00:00 +0200",
                        "registered_by": "cb245673-aa41-4302-ac47-00000000001",
                        "baby_dob": "2015-12-21",
                        "msg_receiver": "mother",
                        "state_at_registration": "baby",
                        "lang": "eng_NG",
                        "msg_type": "voice",
                        "voice_days": "mon_wed",
                        "voice_times": "2_5"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },


    ];
};
