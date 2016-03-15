// Identity roles - Registration
// 08080070007: registered healthworker - personnel code 12345
// 07030010001: unregistered mother but with existing identity (voice)
// 08080020002: unregistered mother but with existing identity (ussd)
// 08080030003: unrecognised identity - identity gets created
// 08080040004: clone of 0002 but with dialback_sent = true
// 07070050005: registered mother
// 07070060006: registered mother
// 09091111111: mother being registered - mother_only registration
// 09092222222: friend_only / family member registration
// 09093333333: father_only registration
// 09094444444: mother_father registration - mother
// 09095555555: mother_father registration - father
// 09096666666: mother being registered - mother_only registration
// cb245673-aa41-4302-ac47-1234567890 - id of mother with no msisdn
// 09097777777: identity with existing receiver_role (already registered)

module.exports = function() {
    return [
        // 0: get identity 08080070007 by msisdn (to validate personnel_code)
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2348080070007'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000007/",
                        "id": "cb245673-aa41-4302-ac47-00000000007",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "personnel_code": "12345",
                            "addresses": {
                                "msisdn": {
                                    "+2348080070007": {}
                                }
                            }
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // 1: get identity 08080020002 by msisdn
        {
            'repeatable': true,  // necessary for timeout restart testing
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2348080020002'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
                        "id": "cb245673-aa41-4302-ac47-00000000002",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "+2348080020002": {}
                                }
                            }
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // 2: get identity 07030010001 by msisdn
        {
            'repeatable': true,  // necessary for timeout restart testing
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2347030010001'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
                        "id": "cb245673-aa41-4302-ac47-00000000001",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "+2347030010001": {}
                                }
                            }
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // 3: get identity 07070050005 by msisdn
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2347070050005'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
                        "id": "cb245673-aa41-4302-ac47-00000000005",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "+2347070050005": {}
                                }
                            },
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

        // 4: get identity 07070060006 by msisdn
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2347070060006'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000006/",
                        "id": "cb245673-aa41-4302-ac47-00000000006",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "+2347070060006": {}
                                }
                            },
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

        // 5: get identity 08080030003 by msisdn - no results
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2348080030003'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
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

        // 6: get identity 08080070007 by personnel code
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__personnel_code': '12345'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000007/",
                        "id": "cb245673-aa41-4302-ac47-00000000007",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "user_id": "cb245673-aa41-4302-ac47-00000000002",
                            "addresses": {
                                "msisdn": {
                                    "+2348080070007": {}
                                }
                            }
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // 7: get identity by personnel code - no results
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {
                    'details__personnel_code': 'aaaaa'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
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

        // 8: create identity 08080030003
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/",
                'data':  {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2348080030003": {}
                            }
                        }
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000003/",
                    "id": "cb245673-aa41-4302-ac47-00000000003",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2348080030003": {}
                            }
                        }
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 9: get identity cb245673-aa41-4302-ac47-00000000003
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000003/',
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000003/",
                    "id": "cb245673-aa41-4302-ac47-00000000003",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2348080030003": {}
                            }
                        }
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 10: get identity cb245673-aa41-4302-ac47-00000000001
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/',
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
                    "id": "cb245673-aa41-4302-ac47-00000000001",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+07030010001": {}
                            }
                        }
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 11: get identity cb245673-aa41-4302-ac47-00000000002
        {
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/',
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
                    "id": "cb245673-aa41-4302-ac47-00000000002",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2348080020002": {}
                            }
                        }
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 12: get identity cb245673-aa41-4302-ac47-00000000005
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/',
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2347070050005": {}
                            }
                        },
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

        // 13: get identity cb245673-aa41-4302-ac47-00000000006
        {
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000006/',
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000006/",
                    "id": "cb245673-aa41-4302-ac47-00000000006",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2347070060006": {}
                            }
                        },
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

        // 14: patch identity cb245673-aa41-4302-ac47-00000000002 - voice reg mama
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
                'data':  {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
                    "id": "cb245673-aa41-4302-ac47-00000000002",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2348080020002": {}
                            }
                        },
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
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
                    "id": "cb245673-aa41-4302-ac47-00000000002",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2348080020002": {}
                            }
                        },
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

        // 15: unsubscribe all active for 0002 - mama
        {
            'request': {
                'method': 'GET',
                'url': 'http://localhost:8002/api/v1/subscriptions/',
                'params': {
                    'active': 'True',
                    'identity': 'cb245673-aa41-4302-ac47-00000000002'
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

        // 16: post subscription for 0002 - voice reg mama
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8002/api/v1/subscriptions/",
                'data':  {
                    "identity": "/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
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
                    "identity": "/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
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

        // 17: patch identity cb245673-aa41-4302-ac47-00000000001 - voice / sms reg chew
        {
            'request': {
                'method': 'PATCH',
                'url': 'http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/',
                'data': {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
                    "id": "cb245673-aa41-4302-ac47-00000000001",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2347030010001": {}
                            }
                        },
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
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000001/",
                    "id": "cb245673-aa41-4302-ac47-00000000001",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2347030010001": {}
                            }
                        },
                        "mamas_registered_ids": ["cb245673-aa41-4302-ac47-00000000002"],
                        "mamas_registered_qty": 1
                    },
                    "created_at":"2015-07-10T06:13:29.693272Z",
                    "updated_at":"2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 18: patch identity cb245673-aa41-4302-ac47-00000000002 - sms reg mama
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
                'data':  {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
                    "id": "cb245673-aa41-4302-ac47-00000000002",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2348080020002": {}
                            }
                        },
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
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
                    "id": "cb245673-aa41-4302-ac47-00000000002",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2348080020002": {}
                            }
                        },
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

        // 19: post subscription for 0002 - sms reg mama
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8002/api/v1/subscriptions/",
                'data':  {
                    "identity": "/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
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
                    "identity": "/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
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

        // 20: get active subscriptions for 0005
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {
                    'identity': 'cb245673-aa41-4302-ac47-00000000005',
                    'active': 'True'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8002/api/v1/subscriptions/"
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [
                        {
                            "url": "http://localhost:8002/api/v1/subscriptions/1234-00005/",
                            "id": "1234-00005",
                            "version": 1,
                            "identity": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
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

        // 21: get active subscriptions for 0006
        {
            'request': {
                'method': 'GET',
                'params': {
                    'identity': 'cb245673-aa41-4302-ac47-00000000006',
                    'active': 'True'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8002/api/v1/subscriptions/"
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

        // 22: unsubscribe subscriptions for 0005
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8002/api/v1/subscriptions/1234-00005/",
                'data': {
                    "url": "http://localhost:8002/api/v1/subscriptions/1234-00005/",
                    "id": "1234-00005",
                    "version": 1,
                    "identity": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
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
                    "url": "http://localhost:8002/api/v1/subscriptions/1234-00005/",
                    "id": "1234-00005",
                    "version": 1,
                    "identity": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
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

        // 23: patch identity 07070050005 details (baby switch)
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2347070050005": {}
                            }
                        },
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
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/"
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2347070050005": {}
                            }
                        },
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

        // 24: post subscription for 0005 to baby (baby switch)
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8002/api/v1/subscriptions/",
                'data':  {
                    "identity": "/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
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
                    "identity": "/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
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

        // 25: patch identity 07070050005 details (time change)
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2347070050005": {}
                            }
                        },
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
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/"
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2347070050005": {}
                            }
                        },
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

        // 26: patch subscription 1234-00005 (time change)
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8002/api/v1/subscriptions/1234-00005/",
                "data": {
                    "url":"http://localhost:8002/api/v1/subscriptions/1234-00005/",
                    "id":"1234-00005",
                    "version":1,
                    "identity":"http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
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
                    "url":"http://localhost:8002/api/v1/subscriptions/1234-00005/",
                    "id":"1234-00005",
                    "version":1,
                    "identity":"http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
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

        // 27: patch identity 07070050005 details (optout 1)
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2347070050005": {}
                            }
                        },
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
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/"
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2347070050005": {}
                            }
                        },
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

        // 28: patch identity 07070050005 details (optout 2)
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2347070050005": {}
                            }
                        },
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
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/"
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2347070050005": {}
                            }
                        },
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

        // 29: patch identity 07070050005 details (optout 3)
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2347070050005": {}
                            }
                        },
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
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/"
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
                    "id": "cb245673-aa41-4302-ac47-00000000005",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2347070050005": {}
                            }
                        },
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

        // 30: send sms via post to outbound
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8003/api/v1/outbound/",
                'data':  {
                    "identity": "cb245673-aa41-4302-ac47-00000000002",
                    "content": "Please dial back in to *120*8864*0000# to complete the Hello MAMA registration"
                }
            },
            'response': {
                "code": 201,
                "data": {
                }
            }
        },

        // 31: get identity 08080040004 by msisdn
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2348080040004'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000004/",
                        "id": "cb245673-aa41-4302-ac47-00000000004",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "+2348080040004": {}
                                }
                            },
                            "dialback_sent": true
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // 32: get identity cb245673-aa41-4302-ac47-00000000004
        {
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000004/',
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000004/",
                    "id": "cb245673-aa41-4302-ac47-00000000004",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2348080040004": {}
                            }
                        },
                        "dialback_sent": true
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 33: patch identity 08080020002 details (time change)
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
                    "id": "cb245673-aa41-4302-ac47-00000000002",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2348080020002": {}
                            }
                        },
                        "dialback_sent":true
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/"
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
                    "id": "cb245673-aa41-4302-ac47-00000000002",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2348080020002": {}
                            }
                        },
                        "dialback_sent":true
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 34: get identity 09091111111 by msisdn - no results
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2349091111111'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
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

        // 35: create identity 09091111111
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/",
                'data':  {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {"+2349091111111": {}}
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007"
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9091111111/",
                    "id": "cb245673-aa41-4302-ac47-9091111111",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349091111111": {}
                            }
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 36: get identity 09092222222 by msisdn - no results
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2349092222222'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
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

        // 37: create identity 09092222222
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/",
                'data':  {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {"+2349092222222": {}}
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007"
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9092222222/",
                    "id": "cb245673-aa41-4302-ac47-9092222222",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349092222222": {}
                            }
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 38: create identity communicate through 09092222222
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/",
                'data':  {
                    "communicate_through": "cb245673-aa41-4302-ac47-9092222222",
                    "operator": "cb245673-aa41-4302-ac47-00000000007"
                },
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                    "id": "cb245673-aa41-4302-ac47-1234567890",
                    "version": 1,
                    "communicate_through": "cb245673-aa41-4302-ac47-9092222222",
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 39: get identity 09093333333 by msisdn - no results
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2349093333333'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
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

        // 40: create identity 09093333333
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/",
                'data':  {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {"+2349093333333": {}}
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007"
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9093333333/",
                    "id": "cb245673-aa41-4302-ac47-9093333333",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349093333333": {}
                            }
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 41: create identity communicate through 09093333333
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/",
                'data':  {
                    "communicate_through": "cb245673-aa41-4302-ac47-9093333333",
                    "operator": "cb245673-aa41-4302-ac47-00000000007"
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                    "id": "cb245673-aa41-4302-ac47-1234567890",
                    "version": 1,
                    "communicate_through": "cb245673-aa41-4302-ac47-9093333333",
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 42: get identity 09094444444 by msisdn - no results
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2349094444444'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
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

        // 43: get identity 09095555555 by msisdn - no results
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2349095555555'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
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

        // 44: create identity 09094444444
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/",
                'data':  {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {"+2349094444444": {}}
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007"
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9094444444/",
                    "id": "cb245673-aa41-4302-ac47-9094444444",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349094444444": {}
                            }
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 45: create identity 09095555555
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/",
                'data':  {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {"+2349095555555": {}}
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007"
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9095555555/",
                    "id": "cb245673-aa41-4302-ac47-9095555555",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349095555555": {}
                            }
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 46: create registration 09092222222 - friend_only / family_member - sms
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8002/api/v1/registrations/",
                'data':  {
                    "stage": "prebirth",
                    "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                    "data": {
                        "msg_receiver": "friend_only",
                        "receiver_id": "cb245673-aa41-4302-ac47-9092222222",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "gravida": "3",
                        "language": "hausa",
                        "msg_type": "sms",
                        "last_period_date": "20150212",
                        "user_id": "cb245673-aa41-4302-ac47-00000000002"
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "id": "reg_for_09092222222_uuid",
                    "stage": "prebirth",
                    "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                    "data": {
                        "msg_receiver": "friend_only",
                        "receiver_id": "cb245673-aa41-4302-ac47-9092222222",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "language": "hausa",
                        "msg_type": "sms",
                        "last_period_date": "20150212",
                        "user_id": "cb245673-aa41-4302-ac47-00000000002"
                    },
                    "validated": false,
                    "source": "source",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z",
                    "created_by": "user",
                    "updated_by": "user"
                }
            }
        },

        // 47: create registration 09093333333 - father_only - sms
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8002/api/v1/registrations/",
                'data':  {
                    "stage": "postbirth",
                    "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                    "data": {
                        "msg_receiver": "father_only",
                        "receiver_id": "cb245673-aa41-4302-ac47-9093333333",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "gravida": "2",
                        "language": "igbo",
                        "msg_type": "sms",
                        "baby_dob": "20150112",
                        "user_id": "cb245673-aa41-4302-ac47-00000000002"
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "id": "reg_for_09093333333_uuid",
                    "stage": "postbirth",
                    "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                    "data": {
                        "msg_receiver": "father_only",
                        "receiver_id": "cb245673-aa41-4302-ac47-9093333333",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "language": "igbo",
                        "msg_type": "sms",
                        "baby_dob": "20150112",
                        "user_id": "cb245673-aa41-4302-ac47-00000000002"
                    },
                    "validated": false,
                    "source": "source",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z",
                    "created_by": "user",
                    "updated_by": "user"
                }
            }
        },

        // 48: create registration 09092222222 - friend_only / family_member - voice
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8002/api/v1/registrations/",
                'data':  {
                    "stage": "prebirth",
                    "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                    "data": {
                        "msg_receiver": "friend_only",
                        "receiver_id": "cb245673-aa41-4302-ac47-9092222222",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "gravida": "3",
                        "language": "english",
                        "msg_type": "voice",
                        "voice_times": "2_5",
                        "voice_days": "tue_thu",
                        "last_period_date": "20150212",
                        "user_id": "cb245673-aa41-4302-ac47-00000000002"
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "id": "reg_for_09092222222_uuid",
                    "stage": "prebirth",
                    "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                    "data": {
                        "msg_receiver": "friend_only",
                        "receiver_id": "cb245673-aa41-4302-ac47-9092222222",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "language": "english",
                        "msg_type": "voice",
                        "voice_times": "2_5",
                        "voice_days": "tue_thu",
                        "last_period_date": "20150212",
                        "user_id": "cb245673-aa41-4302-ac47-00000000002"
                    },
                    "validated": false,
                    "source": "source",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z",
                    "created_by": "user",
                    "updated_by": "user"
                }
            }
        },

        // 49: create registration 09094444444 & 09095555555 - mother_father - voice
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8002/api/v1/registrations/",
                'data':  {
                    "stage": "prebirth",
                    "mother_id": "cb245673-aa41-4302-ac47-9094444444",
                    "data": {
                        "msg_receiver": "mother_father",
                        "receiver_id": "cb245673-aa41-4302-ac47-9095555555",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "gravida": "3",
                        "language": "english",
                        "msg_type": "voice",
                        "voice_times": "2_5",
                        "voice_days": "tue_thu",
                        "last_period_date": "20150212",
                        "user_id": "cb245673-aa41-4302-ac47-00000000002"
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "id": "reg_for_09092222222_uuid",
                    "stage": "prebirth",
                    "mother_id": "cb245673-aa41-4302-ac47-9094444444",
                    "data": {
                        "msg_receiver": "mother_father",
                        "receiver_id": "cb245673-aa41-4302-ac47-9095555555",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "language": "english",
                        "msg_type": "voice",
                        "voice_times": "2_5",
                        "voice_days": "tue_thu",
                        "last_period_date": "20150212",
                        "user_id": "cb245673-aa41-4302-ac47-00000000002"
                    },
                    "validated": false,
                    "source": "source",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z",
                    "created_by": "user",
                    "updated_by": "user"
                }
            }
        },

        // 50: create registration 09093333333 - father_only - voice
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8002/api/v1/registrations/",
                'data':  {
                    "stage": "prebirth",
                    "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                    "data": {
                        "msg_receiver": "father_only",
                        "receiver_id": "cb245673-aa41-4302-ac47-9093333333",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "gravida": "2",
                        "language": "english",
                        "msg_type": "voice",
                        "voice_times": "2_5",
                        "voice_days": "tue_thu",
                        "last_period_date": "20150212",
                        "user_id": "cb245673-aa41-4302-ac47-00000000002"
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "id": "reg_for_09093333333_uuid",
                    "stage": "prebirth",
                    "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                    "data": {
                        "msg_receiver": "father_only",
                        "receiver_id": "cb245673-aa41-4302-ac47-9093333333",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "language": "english",
                        "msg_type": "voice",
                        "voice_times": "2_5",
                        "voice_days": "tue_thu",
                        "last_period_date": "20150212",
                        "user_id": "cb245673-aa41-4302-ac47-00000000002"
                    },
                    "validated": false,
                    "source": "source",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z",
                    "created_by": "user",
                    "updated_by": "user"
                }
            }
        },

        // 51: get identity 08080070007 by id cb245673-aa41-4302-ac47-00000000007
        {
            'request': {
                'method': 'GET',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000007/',
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000007/",
                    "id": "cb245673-aa41-4302-ac47-00000000007",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "user_id": "cb245673-aa41-4302-ac47-00000000002",
                        "addresses": {
                            "msisdn": {
                                "+2348080070007": {}
                            }
                        }
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 52: create registration 09092222222 - friend_only / family_member - sms (voice)
        // unused if bypassPostbirth = true
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8002/api/v1/registrations/",
                'data':  {
                    "stage": "postbirth",
                    "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                    "data": {
                        "msg_receiver": "friend_only",
                        "receiver_id": "cb245673-aa41-4302-ac47-9092222222",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "gravida": "2",
                        "language": "igbo",
                        "msg_type": "sms",
                        "baby_dob": "20160713"
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "id": "reg_for_09092222222_uuid",
                    "stage": "postbirth",
                    "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                    "data": {
                        "msg_receiver": "friend_only",
                        "receiver_id": "cb245673-aa41-4302-ac47-9092222222",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "gravida": "2",
                        "language": "igbo",
                        "msg_type": "sms",
                        "baby_dob": "20160713"
                    },
                    "validated": false,
                    "source": "source",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z",
                    "created_by": "user",
                    "updated_by": "user"
                }
            }
        },

        // 53: create registration 09092222222 - friend_only / family_member - voice
        // unused if bypassPostbirth = true
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8002/api/v1/registrations/",
                'data':  {
                    "stage": "postbirth",
                    "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                    "data": {
                        "msg_receiver": "friend_only",
                        "receiver_id": "cb245673-aa41-4302-ac47-9092222222",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "gravida": "2",
                        "language": "igbo",
                        "msg_type": "voice",
                        "voice_times": "2_5",
                        "voice_days": "mon_wed",
                        "baby_dob": "20160913",
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "id": "reg_for_09092222222_uuid",
                    "stage": "postbirth",
                    "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                    "data": {
                        "msg_receiver": "friend_only",
                        "receiver_id": "cb245673-aa41-4302-ac47-9092222222",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "gravida": "2",
                        "language": "igbo",
                        "msg_type": "voice",
                        "baby_dob": "20160913",
                    },
                    "validated": false,
                    "source": "source",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z",
                    "created_by": "user",
                    "updated_by": "user"
                }
            }
        },

        // 54: get identity cb245673-aa41-4302-ac47-1234567890
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/',
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                    "id": "cb245673-aa41-4302-ac47-1234567890",
                    "version": 1,
                    "communicate_through": "cb245673-aa41-4302-ac47-9093333333",
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "details": {},
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 55: patch identity cb245673-aa41-4302-ac47-1234567890
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                'data':  {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                    "id": "cb245673-aa41-4302-ac47-1234567890",
                    "version": 1,
                    "communicate_through": "cb245673-aa41-4302-ac47-9093333333",
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "details": {
                        "receiver_role": "mother",
                        "preferred_msg_type": "sms",
                        "preferred_language": "igbo"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                    "id": "cb245673-aa41-4302-ac47-1234567890",
                    "version": 1,
                    "communicate_through": "cb245673-aa41-4302-ac47-9093333333",
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "details": {
                        "receiver_role": "mother",
                        "preferred_msg_type": "sms",
                        "preferred_language": "igbo"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 56: get identity cb245673-aa41-4302-ac47-9093333333
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9093333333/",
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9093333333/",
                    "id": "cb245673-aa41-4302-ac47-9093333333",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349093333333": {}
                            }
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 57: patch identity cb245673-aa41-4302-ac47-1234567890
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                'data':  {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                    "id": "cb245673-aa41-4302-ac47-1234567890",
                    "version": 1,
                    "communicate_through": "cb245673-aa41-4302-ac47-9093333333",
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "details": {
                        "receiver_role": "mother",
                        "linked_to": "cb245673-aa41-4302-ac47-9093333333",
                        "gravida": "2",
                        "preferred_language": "igbo"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                    "id": "cb245673-aa41-4302-ac47-1234567890",
                    "version": 1,
                    "communicate_through": "cb245673-aa41-4302-ac47-9093333333",
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "details": {
                        "receiver_role": "mother",
                        "linked_to": "cb245673-aa41-4302-ac47-9093333333",
                        "gravida": "2",
                        "preferred_language": "igbo"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 58: patch identity cb245673-aa41-4302-ac47-9093333333
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9093333333/",
                'data':  {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9093333333/",
                    "id": "cb245673-aa41-4302-ac47-9093333333",
                    "version": 1,
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349093333333": {}
                            }
                        },
                        "receiver_role": "father",
                        "linked_to": "cb245673-aa41-4302-ac47-1234567890",
                        "preferred_msg_type": "sms",
                        "preferred_language": "igbo"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9093333333/",
                    "id": "cb245673-aa41-4302-ac47-9093333333",
                    "version": 1,
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349093333333": {}
                            }
                        },
                        "receiver_role": "father",
                        "linked_to": "cb245673-aa41-4302-ac47-1234567890",
                        "preferred_msg_type": "sms",
                        "preferred_language": "igbo"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 59: get identity cb245673-aa41-4302-ac47-9092222222
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9092222222/",
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9092222222/",
                    "id": "cb245673-aa41-4302-ac47-9092222222",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349092222222": {}
                            }
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 60: patch identity cb245673-aa41-4302-ac47-1234567890
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                'data': {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                    "id": "cb245673-aa41-4302-ac47-1234567890",
                    "version": 1,
                    "communicate_through": "cb245673-aa41-4302-ac47-9093333333",
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "details": {
                        "receiver_role": "mother",
                        "linked_to": "cb245673-aa41-4302-ac47-9092222222",
                        "gravida": "3",
                        "preferred_language": "hausa"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at":"2015-07-10T06:13:29.693298Z"
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                    "id": "cb245673-aa41-4302-ac47-1234567890",
                    "version": 1,
                    "communicate_through": "cb245673-aa41-4302-ac47-9093333333",
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "details": {
                        "receiver_role": "mother",
                        "linked_to": "cb245673-aa41-4302-ac47-9092222222",
                        "gravida": "3",
                        "preferred_language": "hausa"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at":"2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 61: patch identity cb245673-aa41-4302-ac47-9092222222
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9092222222/",
                'data': {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9092222222/",
                    "id": "cb245673-aa41-4302-ac47-9092222222",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349092222222": {}
                            }
                        },
                        "receiver_role": "friend",
                        "linked_to": "cb245673-aa41-4302-ac47-1234567890",
                        "preferred_msg_type": "sms",
                        "preferred_language": "hausa"
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"}
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9092222222/",
                    "id": "cb245673-aa41-4302-ac47-9092222222",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349092222222": {}
                            }
                        },
                        "receiver_role": "friend",
                        "linked_to": "cb245673-aa41-4302-ac47-1234567890",
                        "preferred_msg_type": "sms",
                        "preferred_language": "hausa"
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"}
            }
        },

        // 62: patch identity cb245673-aa41-4302-ac47-1234567890
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                'data': {
                    "url":"http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                    "id":"cb245673-aa41-4302-ac47-1234567890",
                    "version":1,
                    "communicate_through":"cb245673-aa41-4302-ac47-9093333333",
                    "operator":"cb245673-aa41-4302-ac47-00000000007",
                    "details": {
                        "receiver_role":"mother",
                        "gravida": "3",
                        "preferred_language":"english",
                        "linked_to":"cb245673-aa41-4302-ac47-9092222222"
                    },
                "created_at":"2015-07-10T06:13:29.693272Z",
                "updated_at":"2015-07-10T06:13:29.693298Z"}
            },
            'response': {
                "code": 200,
                "data": {
                    "url":"http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                    "id":"cb245673-aa41-4302-ac47-1234567890",
                    "version":1,
                    "communicate_through":"cb245673-aa41-4302-ac47-9093333333",
                    "operator":"cb245673-aa41-4302-ac47-00000000007",
                    "details": {
                        "receiver_role":"mother",
                        "gravida": "3",
                        "preferred_language":"english",
                        "linked_to":"cb245673-aa41-4302-ac47-9092222222"
                    },
                "created_at":"2015-07-10T06:13:29.693272Z",
                "updated_at":"2015-07-10T06:13:29.693298Z"}
            }
        },

        // 63: patch identity cb245673-aa41-4302-ac47-9092222222
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9092222222/",
                'data': {
                    "url":"http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9092222222/",
                    "id":"cb245673-aa41-4302-ac47-9092222222",
                    "version":1,
                    "details": {
                        "default_addr_type":"msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349092222222": {}
                            }
                        },
                        "receiver_role":"friend",
                        "linked_to": "cb245673-aa41-4302-ac47-1234567890",
                        "preferred_msg_type":"voice",
                        "preferred_language":"english",
                        "preferred_msg_days":"tue_thu",
                        "preferred_msg_times":"2_5"
                    },
                    "operator":"cb245673-aa41-4302-ac47-00000000007",
                    "created_at":"2015-07-10T06:13:29.693272Z",
                    "updated_at":"2015-07-10T06:13:29.693298Z"
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url":"http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9092222222/",
                    "id":"cb245673-aa41-4302-ac47-9092222222",
                    "version":1,
                    "details": {
                        "default_addr_type":"msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349092222222": {}
                            }
                        },
                        "receiver_role":"friend",
                        "linked_to": "cb245673-aa41-4302-ac47-1234567890",
                        "preferred_msg_type":"voice",
                        "preferred_language":"english",
                        "preferred_msg_days":"tue_thu",
                        "preferred_msg_times":"2_5"
                    },
                    "operator":"cb245673-aa41-4302-ac47-00000000007",
                    "created_at":"2015-07-10T06:13:29.693272Z",
                    "updated_at":"2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 64: get identity cb245673-aa41-4302-ac47-9094444444
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9094444444/",
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9094444444/",
                    "id": "cb245673-aa41-4302-ac47-9094444444",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349094444444": {}
                            }
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 65: get identity cb245673-aa41-4302-ac47-9095555555
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9095555555/",
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9095555555/",
                    "id": "cb245673-aa41-4302-ac47-9095555555",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349095555555": {}
                            }
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 66: patch identity cb245673-aa41-4302-ac47-9094444444
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9094444444/",
                'data': {
                    "url":"http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9094444444/",
                    "id":"cb245673-aa41-4302-ac47-9094444444",
                    "version":1,
                    "details": {
                        "default_addr_type":"msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349094444444": {}
                            }
                        },
                        "receiver_role":"mother",
                        "linked_to":"cb245673-aa41-4302-ac47-9095555555",
                        "preferred_msg_type":"voice",
                        "gravida": "3",
                        "preferred_language":"english",
                        "preferred_msg_days":"tue_thu",
                        "preferred_msg_times":"2_5"
                    },
                    "operator":"cb245673-aa41-4302-ac47-00000000007",
                    "created_at":"2015-07-10T06:13:29.693272Z",
                    "updated_at":"2015-07-10T06:13:29.693298Z"
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url":"http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9094444444/",
                    "id":"cb245673-aa41-4302-ac47-9094444444",
                    "version":1,
                    "details": {
                        "default_addr_type":"msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349094444444": {}
                            }
                        },
                        "receiver_role":"mother",
                        "linked_to":"cb245673-aa41-4302-ac47-9095555555",
                        "preferred_msg_type":"voice",
                        "gravida": "3",
                        "preferred_language":"english",
                        "preferred_msg_days":"tue_thu",
                        "preferred_msg_times":"2_5"
                    },
                    "operator":"cb245673-aa41-4302-ac47-00000000007",
                    "created_at":"2015-07-10T06:13:29.693272Z",
                    "updated_at":"2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 67: patch identity cb245673-aa41-4302-ac47-9095555555
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9095555555/",
                'data': {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9095555555/",
                    "id": "cb245673-aa41-4302-ac47-9095555555",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349095555555": {}
                            }
                        },
                        "receiver_role": "father",
                        "linked_to":"cb245673-aa41-4302-ac47-9094444444",
                        "household_msgs_only":true,
                        "preferred_msg_type": "voice",
                        "preferred_language": "english",
                        "preferred_msg_days": "tue_thu",
                        "preferred_msg_times": "2_5"
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9095555555/",
                    "id": "cb245673-aa41-4302-ac47-9095555555",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349095555555": {}
                            }
                        },
                        "receiver_role": "father",
                        "linked_to":"cb245673-aa41-4302-ac47-9094444444",
                        "household_msgs_only":true,
                        "preferred_msg_type": "voice",
                        "preferred_language": "english",
                        "preferred_msg_days": "tue_thu",
                        "preferred_msg_times": "2_5"
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 68: patch identity cb245673-aa41-4302-ac47-9093333333
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9093333333/",
                'data': {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9093333333/",
                    "id": "cb245673-aa41-4302-ac47-9093333333",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                               "+2349093333333": {}
                            }
                        },
                        "receiver_role": "father",
                        "linked_to": "cb245673-aa41-4302-ac47-1234567890",
                        "preferred_msg_type": "voice",
                        "preferred_language": "english",
                        "preferred_msg_days":"tue_thu",
                        "preferred_msg_times":"2_5"
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9095555555/",
                    "id": "cb245673-aa41-4302-ac47-9095555555",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349095555555": {}
                            }
                        },
                        "receiver_role": "father",
                        "linked_to": "cb245673-aa41-4302-ac47-1234567890",
                        "preferred_msg_type": "voice",
                        "preferred_language": "english",
                        "preferred_msg_days":"tue_thu",
                        "preferred_msg_times":"2_5"
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 69: patch identity cb245673-aa41-4302-ac47-9092222222
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9092222222/",
                'data': {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9092222222/",
                    "id": "cb245673-aa41-4302-ac47-9092222222",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349092222222": {}
                            }
                        },
                        "receiver_role": "friend",
                        "linked_to": "cb245673-aa41-4302-ac47-1234567890",
                        "preferred_msg_type": "sms",
                        "preferred_language": "igbo"
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9092222222/",
                    "id": "cb245673-aa41-4302-ac47-9092222222",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349092222222": {}
                            }
                        },
                        "receiver_role": "friend",
                        "linked_to": "cb245673-aa41-4302-ac47-1234567890",
                        "preferred_msg_type": "sms",
                        "preferred_language": "igbo"
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 70: patch identity cb245673-aa41-4302-ac47-9092222222
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9092222222/",
                'data': {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9092222222/",
                    "id": "cb245673-aa41-4302-ac47-9092222222",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349092222222": {}
                            }
                        },
                        "receiver_role": "friend",
                        "linked_to": "cb245673-aa41-4302-ac47-1234567890",
                        "preferred_msg_type": "voice",
                        "preferred_language": "igbo",
                        "preferred_msg_days": "mon_wed",
                        "preferred_msg_times": "2_5"
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at":"2015-07-10T06:13:29.693298Z"
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9092222222/",
                    "id": "cb245673-aa41-4302-ac47-9092222222",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349092222222": {}
                            }
                        },
                        "receiver_role": "friend",
                        "linked_to": "cb245673-aa41-4302-ac47-1234567890",
                        "preferred_msg_type": "voice",
                        "preferred_language": "igbo",
                        "preferred_msg_days": "mon_wed",
                        "preferred_msg_times": "2_5"
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at":"2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 71: get identity 09096666666 by msisdn - no results
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2349096666666'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
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

        // 72: create identity 09096666666
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/",
                'data':  {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {"+2349096666666": {}}
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007"
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9096666666/",
                    "id": "cb245673-aa41-4302-ac47-9096666666",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349096666666": {}
                            }
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 73: create registration 09096666666 - mother_only
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8002/api/v1/registrations/",
                'data': {
                    "stage": "prebirth",
                    "mother_id": "cb245673-aa41-4302-ac47-9096666666",
                    "data": {
                        "msg_receiver": "mother_only",
                        "receiver_id": "cb245673-aa41-4302-ac47-9096666666",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "gravida": "2",
                        "language": "english",
                        "msg_type": "voice",
                        "voice_times": "2_5",
                        "voice_days": "tue_thu",
                        "user_id": "cb245673-aa41-4302-ac47-00000000002",
                        "last_period_date":"20150212"
                    }
                }
            },
            'response': {
                "code": 201,
                "data": {
                    "id": "reg_for_0909666666_uuid",
                    "stage": "prebirth",
                    "mother_id": "cb245673-aa41-4302-ac47-9096666666",
                    "data": {
                        "msg_receiver": "mother_only",
                        "receiver_id": "cb245673-aa41-4302-ac47-9096666666",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "language": "english",
                        "msg_type": "voice",
                        "voice_times": "2_5",
                        "voice_days": "tue_thu",
                        "user_id": "cb245673-aa41-4302-ac47-00000000002",
                        "last_period_date":"20150212"
                    },
                    "validated": false,
                    "source": "source",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z",
                    "created_by": "user",
                    "updated_by": "user"
                }
            }
        },

        // 74: get identity cb245673-aa41-4302-ac47-9096666666
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9096666666/",
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9096666666/",
                    "id": "cb245673-aa41-4302-ac47-9096666666",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349096666666": {}
                            }
                        }
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 75: patch identity cb245673-aa41-4302-ac47-9096666666
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9096666666/",
                'data': {
                    "url":"http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9096666666/",
                    "id":"cb245673-aa41-4302-ac47-9096666666",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349096666666": {}
                            }
                        },
                        "receiver_role": "mother",
                        "linked_to": null,
                        "gravida": "2",
                        "preferred_language": "english",
                        "preferred_msg_type": "voice",
                        "preferred_msg_days": "tue_thu",
                        "preferred_msg_times": "2_5"
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url":"http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-9096666666/",
                    "id":"cb245673-aa41-4302-ac47-9096666666",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2349096666666": {}
                            }
                        },
                        "receiver_role": "mother",
                        "linked_to": null,
                        "gravida": "2",
                        "preferred_language": "english",
                        "preferred_msg_type": "voice",
                        "preferred_msg_days": "tue_thu",
                        "preferred_msg_times": "2_5"
                    },
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 76: patch identity cb245673-aa41-4302-ac47-1234567890
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                'data': {
                    "url":"http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                    "id":"cb245673-aa41-4302-ac47-1234567890",
                    "version":1,
                    "communicate_through":"cb245673-aa41-4302-ac47-9093333333",
                    "operator":"cb245673-aa41-4302-ac47-00000000007",
                    "details": {
                        "receiver_role":"mother",
                        "gravida": "2",
                        "preferred_language":"english",
                        "linked_to":"cb245673-aa41-4302-ac47-9093333333"
                    },
                "created_at":"2015-07-10T06:13:29.693272Z",
                "updated_at":"2015-07-10T06:13:29.693298Z"}
            },
            'response': {
                "code": 200,
                "data": {
                    "url":"http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                    "id":"cb245673-aa41-4302-ac47-1234567890",
                    "version":1,
                    "communicate_through":"cb245673-aa41-4302-ac47-9093333333",
                    "operator":"cb245673-aa41-4302-ac47-00000000007",
                    "details": {
                        "receiver_role":"mother",
                        "gravida": "2",
                        "preferred_language":"english",
                        "linked_to":"cb245673-aa41-4302-ac47-9093333333"
                    },
                "created_at":"2015-07-10T06:13:29.693272Z",
                "updated_at":"2015-07-10T06:13:29.693298Z"}
            }
        },

        // 77: patch identity cb245673-aa41-4302-ac47-1234567890
        {
            'request': {
                'method': 'PATCH',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                'data':  {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                    "id": "cb245673-aa41-4302-ac47-1234567890",
                    "version": 1,
                    "communicate_through": "cb245673-aa41-4302-ac47-9093333333",
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "details": {
                        "receiver_role": "mother",
                        "linked_to": "cb245673-aa41-4302-ac47-9092222222",
                        "gravida": "2",
                        "preferred_language": "igbo"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-1234567890/",
                    "id": "cb245673-aa41-4302-ac47-1234567890",
                    "version": 1,
                    "communicate_through": "cb245673-aa41-4302-ac47-9093333333",
                    "operator": "cb245673-aa41-4302-ac47-00000000007",
                    "details": {
                        "receiver_role": "mother",
                        "linked_to": "cb245673-aa41-4302-ac47-9092222222",
                        "gravida": "2",
                        "preferred_language": "igbo"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 78: get identity 09097777777 by msisdn
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2349097777777'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/search/',
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-009097777777/",
                        "id": "3f7c8851-5204-43f7-af7f-009097777777",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "+2349097777777": {}
                                }
                            },
                            "receiver_role": "mother",
                            "linked_to": null,
                            "preferred_msg_type": "sms",
                            "preferred_language": "igbo"
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // 79 Fixture to make HEAD requests to mp3 files to see if they exist
        {
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
        },

    ];
};
