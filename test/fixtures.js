module.exports = function() {
    return [
        // get contact 08080021232 by msisdn (to validate personnel_code)
        {
            'request': {
                'method': 'GET',
                'params': {
                    'msisdn': '+2348080021232'
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
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000002/",
                        "id": "cb245673-aa41-4302-ac47-00000000002",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": "msisdn:+2348080021232",
                            "personnel_code": "12345"
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // get contact 08080020002 by msisdn
        {
            'repeatable': true,  // necessary for timeout restart testing
            'request': {
                'method': 'GET',
                'params': {
                    'msisdn': '+2348080020002'
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
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000002/",
                        "id": "cb245673-aa41-4302-ac47-00000000002",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": "msisdn:+2348080020002"
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // get contact 07070050005 by msisdn
        {
            'request': {
                'method': 'GET',
                'params': {
                    'msisdn': '+2347070050005'
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
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/",
                        "id": "cb245673-aa41-4302-ac47-00000000005",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": "msisdn:+2347070050005",
                            "baby_dob": "mama_is_pregnant",
                            "mama_edd": "2015-12-21",
                            "opted_out": false,
                            "has_registered": true,
                            "registered_at": "2015-07-22 00:00:00",
                            "registered_by": "cb245673-aa41-4302-ac47-00000000001",
                            "chew_phone_used": true,
                            "msg_receiver": "mother",
                            "state_at_registration": "pregnant",
                            "state_current": "pregnant",
                            "lang": "eng_NG",
                            "msg_type": "voice",
                            "voice_days": "mon_wed",
                            "voice_times": "2_5"
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // get contact 07070060006 by msisdn
        {
            'request': {
                'method': 'GET',
                'params': {
                    'msisdn': '+2347070060006'
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
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000006/",
                        "id": "cb245673-aa41-4302-ac47-00000000006",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": "msisdn:+2347070060006",
                            "baby_dob": "mama_is_pregnant",
                            "mama_edd": "2015-12-21",
                            "opted_out": false,
                            "has_registered": true,
                            "registered_at": "2015-07-22 00:00:00",
                            "registered_by": "cb245673-aa41-4302-ac47-00000000001",
                            "chew_phone_used": true,
                            "msg_receiver": "mother",
                            "state_at_registration": "pregnant",
                            "state_current": "pregnant",
                            "lang": "eng_NG",
                            "msg_type": "voice",
                            "voice_days": "mon_wed",
                            "voice_times": "2_5"
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // get contact 08080030003 by msisdn - no results
        {
            'request': {
                'method': 'GET',
                'params': {
                    'msisdn': '+2348080030003'
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
                    "count": 0,
                    "next": null,
                    "previous": null,
                    "results": []
                }
            }
        },

        // create contact 08080030003
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8000/api/v1/contacts/",
                'data':  {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+2348080030003"
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000003/",
                    "id": "cb245673-aa41-4302-ac47-00000000003",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+2348080030003"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // get contact cb245673-aa41-4302-ac47-00000000003
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000003/',
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000003/",
                    "id": "cb245673-aa41-4302-ac47-00000000003",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+2348080030003"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
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
                        "addresses": "msisdn:+2348080020002"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // get contact cb245673-aa41-4302-ac47-00000000005
        {
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/',
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+2347070050005",
                        "baby_dob": "mama_is_pregnant",
                        "mama_edd": "2015-12-21",
                        "opted_out": false,
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00",
                        "msg_receiver": "mother",
                        "state_at_registration": "pregnant",
                        "state_current": "pregnant",
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

        // get contact cb245673-aa41-4302-ac47-00000000006
        {
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000006/',
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000006/",
                    "id": "cb245673-aa41-4302-ac47-00000000006",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+2347070060006",
                        "baby_dob": "mama_is_pregnant",
                        "mama_edd": "2015-12-21",
                        "opted_out": false,
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00",
                        "msg_receiver": "mother",
                        "state_at_registration": "pregnant",
                        "state_current": "pregnant",
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
                        "addresses": "msisdn:+2348080020002",
                        "baby_dob": "2015-12-21",
                        "mama_edd": "registration_after_baby_born",
                        "opted_out": false,
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00",
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
                        "addresses": "msisdn:+2348080020002",
                        "baby_dob": "2015-12-21",
                        "mama_edd": "registration_after_baby_born",
                        "opted_out": false,
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00",
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

        // unsubscribe all active for 0002 - mama
        {
            'request': {
                'method': 'GET',
                'url': 'http://localhost:8000/api/v1/subscriptions/',
                'params': {
                    'active': 'True',
                    'contact': 'cb245673-aa41-4302-ac47-00000000002'
                }
            },
            'response': {
                'code': 200,
                "data": {
                    "count": 0,
                    "next": null,
                    "previous": null,
                    "results": []
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
                    "contact": "/api/v1/contacts/cb245673-aa41-4302-ac47-00000000002/",
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
                    "contact": "/api/v1/contacts/cb245673-aa41-4302-ac47-00000000002/",
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
                        "addresses": "msisdn:+2348080020002",
                        "baby_dob": "mama_is_pregnant",
                        "mama_edd": "2016-02-27",
                        "opted_out": false,
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00",
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
                        "addresses": "msisdn:+2348080020002",
                        "baby_dob": "mama_is_pregnant",
                        "mama_edd": "2016-02-27",
                        "opted_out": false,
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00",
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
                    "contact": "/api/v1/contacts/cb245673-aa41-4302-ac47-00000000002/",
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
                    "id": "1234-00002",
                    "contact": "/api/v1/contacts/cb245673-aa41-4302-ac47-00000000002/",
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
        },

        // get active subscriptions for 0005
        {
            'request': {
                'method': 'GET',
                'params': {
                    'contact': 'cb245673-aa41-4302-ac47-00000000005',
                    'active': 'True'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8000/api/v1/subscriptions/"
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [
                        {
                            "url": "http://localhost:8000/api/v1/subscriptions/1234-00005/",
                            "id": "1234-00005",
                            "version": 1,
                            "contact": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/",
                            "messageset_id": 1,
                            "next_sequence_number": 7,
                            "lang": "eng_NG",
                            "active": true,
                            "completed": false,
                            "schedule": 1,
                            "process_status": 0,
                            "metadata": {
                                "msg_type": "voice",
                            },
                            "created_at": "2015-07-30T15:19:01.734812Z",
                            "updated_at": "2015-08-05T07:00:00.826924Z"
                        }
                    ]
                }
            }
        },

        // get active subscriptions for 0006
        {
            'request': {
                'method': 'GET',
                'params': {
                    'contact': 'cb245673-aa41-4302-ac47-00000000006',
                    'active': 'True'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8000/api/v1/subscriptions/"
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": []
                }
            }
        },

        // unsubscribe subscriptions for 0005
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8000/api/v1/subscriptions/1234-00005/",
                'data': {
                    "url": "http://localhost:8000/api/v1/subscriptions/1234-00005/",
                    "id": "1234-00005",
                    "version": 1,
                    "contact": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/",
                    "messageset_id": 1,
                    "next_sequence_number": 7,
                    "lang": "eng_NG",
                    "active": false,
                    "completed": false,
                    "schedule": 1,
                    "process_status": 0,
                    "metadata": {
                        "msg_type": "voice",
                    },
                    "created_at": "2015-07-30T15:19:01.734812Z",
                    "updated_at": "2015-08-05T07:00:00.826924Z"
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8000/api/v1/subscriptions/1234-00005/",
                    "id": "1234-00005",
                    "version": 1,
                    "contact": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/",
                    "messageset_id": 1,
                    "next_sequence_number": 7,
                    "lang": "eng_NG",
                    "active": false,
                    "completed": false,
                    "schedule": 1,
                    "process_status": 0,
                    "metadata": {
                        "msg_type": "voice",
                    },
                    "created_at": "2015-07-30T15:19:01.734812Z",
                    "updated_at": "2015-08-05T07:00:00.826924Z"
                }
            }
        },

        // patch contact 07070050005 details (baby switch)
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                "data": {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+2347070050005",
                        "baby_dob": "2015-07-22",
                        "mama_edd": "2015-12-21",
                        "opted_out": false,
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00",
                        "msg_receiver": "mother",
                        "state_at_registration": "pregnant",
                        "state_current": "baby",
                        "lang": "eng_NG",
                        "msg_type": "voice",
                        "voice_days": "mon_wed",
                        "voice_times": "2_5"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                },
                'url': "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/"
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+2347070050005",
                        "baby_dob": "2015-07-22",
                        "mama_edd": "2015-12-21",
                        "opted_out": false,
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00",
                        "msg_receiver": "mother",
                        "state_at_registration": "pregnant",
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

        // post subscription for 0005 to baby (baby switch)
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8000/api/v1/subscriptions/",
                'data':  {
                    "contact": "/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/",
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
                    "id": "1234-00002",
                    "contact": "/api/v1/contacts/cb245673-aa41-4302-ac47-00000000002/",
                    "version": 1,
                    "messageset_id": 1,
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

        // patch contact 07070050005 details (time change)
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                "data": {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+2347070050005",
                        "baby_dob": "mama_is_pregnant",
                        "mama_edd": "2015-12-21",
                        "opted_out": false,
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00",
                        "msg_receiver": "mother",
                        "state_at_registration": "pregnant",
                        "state_current": "pregnant",
                        "lang": "eng_NG",
                        "msg_type": "voice",
                        "voice_days": "tue_thu",
                        "voice_times": "9_11"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                },
                'url': "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/"
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+2347070050005",
                        "baby_dob": "mama_is_pregnant",
                        "mama_edd": "2015-12-21",
                        "opted_out": false,
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00",
                        "msg_receiver": "mother",
                        "state_at_registration": "pregnant",
                        "state_current": "pregnant",
                        "lang": "eng_NG",
                        "msg_type": "voice",
                        "voice_days": "tue_thu",
                        "voice_times": "9_11"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // patch subscription 1234-00005 (time change)
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8000/api/v1/subscriptions/1234-00005/",
                "data": {
                    "url":"http://localhost:8000/api/v1/subscriptions/1234-00005/",
                    "id":"1234-00005",
                    "version":1,
                    "contact":"http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/",
                    "messageset_id":1,
                    "next_sequence_number":7,
                    "lang":"eng_NG",
                    "active":true,
                    "completed":false,
                    "schedule":3,
                    "process_status":0,
                    "metadata":{
                        "msg_type":"voice"
                    },
                    "created_at":"2015-07-30T15:19:01.734812Z",
                    "updated_at":"2015-08-05T07:00:00.826924Z"
                },
            },
            'response': {
                "code": 200,
                "data": {
                    "url":"http://localhost:8000/api/v1/subscriptions/1234-00005/",
                    "id":"1234-00005",
                    "version":1,
                    "contact":"http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/",
                    "messageset_id":1,
                    "next_sequence_number":7,
                    "lang":"eng_NG",
                    "active":true,
                    "completed":false,
                    "schedule":3,
                    "process_status":0,
                    "metadata":{
                        "msg_type":"voice"
                    },
                    "created_at":"2015-07-30T15:19:01.734812Z",
                    "updated_at":"2015-08-05T07:00:00.826924Z"
                }
            }
        },

        // patch contact 07070050005 details (optout 1)
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                "data": {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+2347070050005",
                        "baby_dob": "mama_is_pregnant",
                        "mama_edd": "2015-12-21",
                        "opted_out": true,
                        "optout_reason": "miscarriage",
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00",
                        "msg_receiver": "mother",
                        "state_at_registration": "pregnant",
                        "state_current": "pregnant",
                        "lang": "eng_NG",
                        "msg_type": "voice",
                        "voice_days": "mon_wed",
                        "voice_times": "2_5"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                },
                'url': "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/"
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+2347070050005",
                        "baby_dob": "mama_is_pregnant",
                        "mama_edd": "2015-12-21",
                        "opted_out": true,
                        "optout_reason": "miscarriage",
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00",
                        "msg_receiver": "mother",
                        "state_at_registration": "pregnant",
                        "state_current": "pregnant",
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

        // patch contact 07070050005 details (optout 2)
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                "data": {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+2347070050005",
                        "baby_dob": "mama_is_pregnant",
                        "mama_edd": "2015-12-21",
                        "opted_out": true,
                        "optout_reason": "not_useful",
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00",
                        "msg_receiver": "mother",
                        "state_at_registration": "pregnant",
                        "state_current": "pregnant",
                        "lang": "eng_NG",
                        "msg_type": "voice",
                        "voice_days": "mon_wed",
                        "voice_times": "2_5"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                },
                'url': "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/"
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+2347070050005",
                        "baby_dob": "mama_is_pregnant",
                        "mama_edd": "2015-12-21",
                        "opted_out": true,
                        "optout_reason": "not_useful",
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00",
                        "msg_receiver": "mother",
                        "state_at_registration": "pregnant",
                        "state_current": "pregnant",
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

        // patch contact 07070050005 details (optout 3)
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                "data": {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+2347070050005",
                        "baby_dob": "mama_is_pregnant",
                        "mama_edd": "2015-12-21",
                        "opted_out": true,
                        "optout_reason": "other",
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00",
                        "msg_receiver": "mother",
                        "state_at_registration": "pregnant",
                        "state_current": "pregnant",
                        "lang": "eng_NG",
                        "msg_type": "voice",
                        "voice_days": "mon_wed",
                        "voice_times": "2_5"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                },
                'url': "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/"
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": "msisdn:+2347070050005",
                        "baby_dob": "mama_is_pregnant",
                        "mama_edd": "2015-12-21",
                        "opted_out": true,
                        "optout_reason": "other",
                        "has_registered": true,
                        "registered_at": "2015-07-22 00:00:00",
                        "msg_receiver": "mother",
                        "state_at_registration": "pregnant",
                        "state_current": "pregnant",
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

        // send sms via vumi http api
        // post subscription for 0005 to baby (baby switch)
        {
            'request': {
                'method': 'PUT',
                'headers': {
                    'Authorization': ['??'],
                    'Content-Type': ['application/json; charset=utf-8']
                },
                'url': "https://localhost/api/v1/go/http_api_nostream/conversation_key/messages.json",
                'data':  {
                    "to_addr": "+2348080020002",
                    "content": "You have been registered on Hello Mama. Welcome! " +
                               "To change the day & time you receive calls, stop " +
                               "them, or tell us you've had the baby, please call " +
                               "{{ voice_change_num }}."
                }
            },
            'response': {
                "code": 200,
                "data": {
                }
            }
        },

    ];
};
