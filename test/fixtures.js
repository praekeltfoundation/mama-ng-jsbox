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
                "data": [
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
                "data": [
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
        },

        // get contact cb245673-aa41-4302-ac47-00000000001
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000001/',
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

        // patch contact cb245673-aa41-4302-ac47-00000000002 - voice reg mama
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
                        "baby_dob": "2015-12-21",
                        "mama_edd": "registration_after_baby_born",
                        "opted_out": false,
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00 +0200",
                        "registered_by": "cb245673-aa41-4302-ac47-00000000001",
                        "chew_phone_used": true,
                        "msg_receiver": "mother",
                        "state_at_registration": "baby",
                        "state_current": "baby",
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
                        "baby_dob": "2015-12-21",
                        "mama_edd": "registration_after_baby_born",
                        "opted_out": false,
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00 +0200",
                        "registered_by": "cb245673-aa41-4302-ac47-00000000001",
                        "chew_phone_used": true,
                        "msg_receiver": "mother",
                        "state_at_registration": "baby",
                        "state_current": "baby",
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

        // post subscription for 0002 - voice reg mama
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8000/api/v1/subscriptions/",
                'data':  {
                    "contact": "cb245673-aa41-4302-ac47-00000000002",
                    "version": 1,
                    "messageset_id": 2,
                    "next_sequence_number": 1,
                    "lang": "eng_NG",
                    "active": true,
                    "completed": false,
                    "schedule": 2,
                    "process_status": 0,
                    "metadata": {
                        "msg_type":"voice"
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "contact": "cb245673-aa41-4302-ac47-00000000002",
                    "version": 1,
                    "messageset_id": 2,
                    "next_sequence_number": 1,
                    "lang": "eng_NG",
                    "active": true,
                    "completed": false,
                    "schedule": 2,
                    "process_status": 0,
                    "metadata": {
                        "msg_type":"voice"
                    }
                }
            }
        },

        // patch contact cb245673-aa41-4302-ac47-00000000001 - voice / sms reg chew
        {
            'request': {
                'method': 'PATCH',
                'url': 'http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000001/',
                'data': {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000001/",
                    "id": "cb245673-aa41-4302-ac47-00000000001",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+07030010001",
                        "mamas_registered_ids": ["cb245673-aa41-4302-ac47-00000000002"],
                        "mamas_registered_qty": 1
                    },
                    "created_at":"2015-07-10T06:13:29.693272Z",
                    "updated_at":"2015-07-10T06:13:29.693298Z"
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000001/",
                    "id": "cb245673-aa41-4302-ac47-00000000001",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+07030010001",
                        "mamas_registered_ids": ["cb245673-aa41-4302-ac47-00000000002"],
                        "mamas_registered_qty": 1
                    },
                    "created_at":"2015-07-10T06:13:29.693272Z",
                    "updated_at":"2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // patch contact cb245673-aa41-4302-ac47-00000000002 - sms reg mama
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
                        "baby_dob": "mama_is_pregnant",
                        "mama_edd": "2016-02-27",
                        "opted_out": false,
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00 +0200",
                        "registered_by": "cb245673-aa41-4302-ac47-00000000001",
                        "chew_phone_used": true,
                        "msg_receiver": "other",
                        "state_at_registration": "pregnant",
                        "state_current": "pregnant",
                        "lang": "eng_NG",
                        "msg_type": "sms",
                        "voice_days": "sms",
                        "voice_times": "sms"
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
                        "baby_dob": "mama_is_pregnant",
                        "mama_edd": "2016-02-27",
                        "opted_out": false,
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00 +0200",
                        "registered_by": "cb245673-aa41-4302-ac47-00000000001",
                        "chew_phone_used": true,
                        "msg_receiver": "other",
                        "state_at_registration": "pregnant",
                        "state_current": "pregnant",
                        "lang": "eng_NG",
                        "msg_type": "sms",
                        "voice_days": "sms",
                        "voice_times": "sms"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // post subscription for 0002 - sms reg mama
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8000/api/v1/subscriptions/",
                'data':  {
                    "contact": "cb245673-aa41-4302-ac47-00000000002",
                    "version": 1,
                    "messageset_id": 1,
                    "next_sequence_number": 1,
                    "lang": "eng_NG",
                    "active": true,
                    "completed": false,
                    "schedule": 1,
                    "process_status": 0,
                    "metadata": {
                        "msg_type":"sms"
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "contact": "cb245673-aa41-4302-ac47-00000000002",
                    "version": 1,
                    "messageset_id": 1,
                    "next_sequence_number": 1,
                    "lang": "eng_NG",
                    "active": true,
                    "completed": false,
                    "schedule": 1,
                    "process_status": 0,
                    "metadata": {
                        "msg_type":"sms"
                    }
                }
            }
        }

    ];
};
