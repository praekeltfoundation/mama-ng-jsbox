// Contact roles
// 08080070007: registered nurse - personnel code 12345
// 07030010001: unregistered mother but with existing contact (voice)
// 08080020002: unregistered mother but with existing contact (ussd)
// 08080030003: unrecognised contact - contact gets created
// 08080040004: clone of 0002 but with dialback_sent = true
// 07070050005: registered mother
// 07070060006: registered mother
// 09091111111: mother being registered - mother_only registration
// 09092222222: trusted_friend / family member registration
// 09093333333: father_only registration
// 09094444444: mother_father registration - mother
// 09095555555: mother_father registration - father
// cb245673-aa41-4302-ac47-1234567890 - id of mother with no msisdn


module.exports = function() {
    return [
        // 0: get contact 08080070007 by msisdn (to validate personnel_code)
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

        // 1: get contact 08080020002 by msisdn
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

        // 2: get contact 07030010001 by msisdn
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

        // 3: get contact 07070050005 by msisdn
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

        // 4: get contact 07070060006 by msisdn
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

        // 5: get contact 08080030003 by msisdn - no results
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

        // 6: get contact 08080070007 by personnel code
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

        // 7: get contact by personnel code - no results
        {
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

        // 8: create contact 08080030003
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

        // 9: get contact cb245673-aa41-4302-ac47-00000000003
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

        // 10: get contact cb245673-aa41-4302-ac47-00000000001
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

        // 11: get contact cb245673-aa41-4302-ac47-00000000002
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

        // 12: get contact cb245673-aa41-4302-ac47-00000000005
        {
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

        // 13: get contact cb245673-aa41-4302-ac47-00000000006
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

        // 14: patch contact cb245673-aa41-4302-ac47-00000000002 - voice reg mama
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
                    "contact": "/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
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
                    "contact": "/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
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

        // 17: patch contact cb245673-aa41-4302-ac47-00000000001 - voice / sms reg chew
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

        // 18: patch contact cb245673-aa41-4302-ac47-00000000002 - sms reg mama
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
                    "contact": "/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
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
                    "contact": "/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
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
                            "contact": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
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
                    'contact': 'cb245673-aa41-4302-ac47-00000000006',
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
                    "contact": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
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
                    "contact": "http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
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

        // 23: patch contact 07070050005 details (baby switch)
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
                    "contact": "/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
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
                    "contact": "/api/v1/identities/cb245673-aa41-4302-ac47-00000000002/",
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

        // 25: patch contact 07070050005 details (time change)
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
                    "contact":"http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
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
                    "contact":"http://localhost:8001/api/v1/identities/cb245673-aa41-4302-ac47-00000000005/",
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

        // 27: patch contact 07070050005 details (optout 1)
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

        // 28: patch contact 07070050005 details (optout 2)
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

        // 29: patch contact 07070050005 details (optout 3)
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
                    "contact": "cb245673-aa41-4302-ac47-00000000002",
                    "content": "Please dial back in to *120*8864*0000# to complete the Hello MAMA registration"
                }
            },
            'response': {
                "code": 201,
                "data": {
                }
            }
        },

        // 31: get contact 08080040004 by msisdn
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

        // 32: get contact cb245673-aa41-4302-ac47-00000000004
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

        // 33: patch contact 08080020002 details (time change)
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

        // 34: get contact 09091111111 by msisdn - no results
        {
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

        // 35: create contact 09091111111
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

        // 36: get contact 09092222222 by msisdn - no results
        {
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

        // 37: create contact 09092222222
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

        // 38: create contact communicate through 09092222222
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

        // 39: get contact 09093333333 by msisdn - no results
        {
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

        // 40: create contact 09093333333
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

        // 41: create contact communicate through 09093333333
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

        // 42: get contact 09094444444 by msisdn - no results
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

        // 43: get contact 09095555555 by msisdn - no results
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

        // 44: create contact 09094444444
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

        // 45: create contact 09095555555
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

        // 46: create registration 09092222222 - trusted_friend / family_member - sms
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
                    "data": {
                        "msg_receiver": "trusted_friend",
                        "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                        "receiver_id": "cb245673-aa41-4302-ac47-9092222222",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
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
                    "data": {
                        "msg_receiver": "trusted_friend",
                        "mother_id": "cb245673-aa41-4302-ac47-1234567890",
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
                    "data": {
                        "msg_receiver": "father_only",
                        "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                        "receiver_id": "cb245673-aa41-4302-ac47-9093333333",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
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
                    "data": {
                        "msg_receiver": "father_only",
                        "mother_id": "cb245673-aa41-4302-ac47-1234567890",
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

        // 48: create registration 09092222222 - trusted_friend / family_member - voice
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
                    "data": {
                        "msg_receiver": "trusted_friend",
                        "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                        "receiver_id": "cb245673-aa41-4302-ac47-9092222222",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "language": "english",
                        "msg_type": "voice",
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
                    "data": {
                        "msg_receiver": "trusted_friend",
                        "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                        "receiver_id": "cb245673-aa41-4302-ac47-9092222222",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "language": "english",
                        "msg_type": "voice",
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
                    "data": {
                        "msg_receiver": "mother_father",
                        "mother_id": "cb245673-aa41-4302-ac47-9094444444",
                        "receiver_id": "cb245673-aa41-4302-ac47-9095555555",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "language": "english",
                        "msg_type": "voice",
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
                    "data": {
                        "msg_receiver": "mother_father",
                        "mother_id": "cb245673-aa41-4302-ac47-9094444444",
                        "receiver_id": "cb245673-aa41-4302-ac47-9095555555",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "language": "english",
                        "msg_type": "voice",
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
                    "data": {
                        "msg_receiver": "father_only",
                        "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                        "receiver_id": "cb245673-aa41-4302-ac47-9093333333",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "language": "english",
                        "msg_type": "voice",
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
                    "data": {
                        "msg_receiver": "father_only",
                        "mother_id": "cb245673-aa41-4302-ac47-1234567890",
                        "receiver_id": "cb245673-aa41-4302-ac47-9093333333",
                        "operator_id": "cb245673-aa41-4302-ac47-00000000007",
                        "language": "english",
                        "msg_type": "voice",
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

        // 51: get contact 08080070007 by id cb245673-aa41-4302-ac47-00000000007
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

    ];
};
