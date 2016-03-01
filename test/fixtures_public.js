// Identity roles
// 05059991111: heretofore unseen number
// 05059992222: registered user - mother only registration, sms, pregnant, igbo
// 05059993333: registered user - friend_only, voice, baby, english, receives for 05059995555
// 05059994444: existing contact that does not have a receiver_role
// 05059995555: registered user - mother that receives messages via 05059993333
// 05059996666: registered user - mother that receives own messages, linked to 05059997777
// 05059997777: registered user - family member that receives household messages for 05059996666
// 05059998888: number being changed to

// There are 4 cases to consider when a change is attempted:
// case 1: mother_only registration - mother dialing in (05059992222)
// case 2: friend_only registration - friend dialing in (05059993333) (no way to identify mother)
// case 3: mother_family registration - mother dialing in (05059996666)
// case 4: mother_family registration - family member dialing in (05059997777)

module.exports = function() {
    return [

        // 0: get identity 05059991111 by msisdn - no results
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2345059991111'
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

        // 1: create identity 05059991111
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': "http://localhost:8001/api/v1/identities/",
                'data': {
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059991111": {}
                            }
                        }
                    }
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
                                "+2345059991111": {}
                            }
                        }
                    },
                    "operator": null,
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 2: get identity 05059992222 by msisdn
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2345059992222'
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
                        "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059992222/",
                        "id": "3f7c8851-5204-43f7-af7f-005059992222",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "+2345059992222": {}
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

        // 3: get identity 05059994444 by msisdn
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2345059994444'
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
                        "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059994444/",
                        "id": "3f7c8851-5204-43f7-af7f-005059994444",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "+2345059994444": {}
                                }
                            },
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // 4: get identity 05059993333 by msisdn
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2345059993333'
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
                        "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059993333/",
                        "id": "3f7c8851-5204-43f7-af7f-005059993333",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "+2345059993333": {}
                                }
                            },
                            "receiver_role": "friend",
                            "linked_to": "3f7c8851-5204-43f7-af7f-005059995555",
                            "preferred_msg_type": "voice",
                            "preferred_msg_days": "mon_wed",
                            "preferred_msg_times": "9_11",
                            "preferred_language": "hausa"
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // 5: get identity 3f7c8851-5204-43f7-af7f-005059993333
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059993333/",
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059993333/",
                    "id": "3f7c8851-5204-43f7-af7f-005059993333",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059993333": {}
                            }
                        },
                        "receiver_role": "friend",
                        "linked_to": "3f7c8851-5204-43f7-af7f-005059995555",
                        "preferred_msg_type": "voice",
                        "preferred_msg_days": "mon_wed",
                        "preferred_msg_times": "9_11",
                        "preferred_language": "hausa"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 6: get identity 05059997777 by msisdn
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2345059997777'
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
                        "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059997777/",
                        "id": "3f7c8851-5204-43f7-af7f-005059997777",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "+2345059997777": {}
                                }
                            },
                            "receiver_role": "family",
                            "linked_to": "3f7c8851-5204-43f7-af7f-005059996666",
                            "household_msgs_only": true,
                            "preferred_msg_type": "voice",
                            "preferred_msg_days": "mon_wed",
                            "preferred_msg_times": "9_11",
                            "preferred_language": "hausa"
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // 7: get identity 3f7c8851-5204-43f7-af7f-005059997777
        {
            'repeatable': true,
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059997777/',
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059997777/",
                    "id": "3f7c8851-5204-43f7-af7f-005059997777",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059997777": {}
                            }
                        },
                        "receiver_role": "family",
                        "linked_to": "3f7c8851-5204-43f7-af7f-005059996666",
                        "household_msgs_only": true,
                        "preferred_msg_type": "voice",
                        "preferred_msg_days": "mon_wed",
                        "preferred_msg_times": "9_11",
                        "preferred_language": "hausa"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 8: get identity 05059998888 by msisdn - no results
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2345059998888'
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

        // 9: get identity 3f7c8851-5204-43f7-af7f-005059992222
        {
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059992222/',
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059992222/",
                    "id": "3f7c8851-5204-43f7-af7f-005059992222",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059992222": {}
                            }
                        },
                        "receiver_role": "mother",
                        "linked_to": null,
                        "preferred_msg_type": "sms",
                        "preferred_language": "igbo"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 10: patch identity 3f7c8851-5204-43f7-af7f-005059992222
        {
            'request': {
                'method': 'PATCH',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059992222/',
                'data': {
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059992222/",
                    "id": "3f7c8851-5204-43f7-af7f-005059992222",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059998888": {}
                            }
                        },
                        "receiver_role": "mother",
                        "linked_to": null,
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
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059992222/",
                    "id": "3f7c8851-5204-43f7-af7f-005059992222",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059998888": {}
                            }
                        },
                        "receiver_role": "mother",
                        "linked_to": null,
                        "preferred_msg_type": "sms",
                        "preferred_language": "igbo"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 11: patch identity 3f7c8851-5204-43f7-af7f-005059993333
        {
            'request': {
                'method': 'PATCH',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059993333/',
                'data': {
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059993333/",
                    "id": "3f7c8851-5204-43f7-af7f-005059993333",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059998888": {}
                            }
                        },
                        "receiver_role": "friend",
                        "linked_to": "3f7c8851-5204-43f7-af7f-005059995555",
                        "preferred_msg_type": "voice",
                        "preferred_msg_days": "mon_wed",
                        "preferred_msg_times": "9_11",
                        "preferred_language": "hausa"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }

            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059993333/",
                    "id": "3f7c8851-5204-43f7-af7f-005059993333",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059998888": {}
                            }
                        },
                        "receiver_role": "friend",
                        "linked_to": "3f7c8851-5204-43f7-af7f-005059995555",
                        "preferred_msg_type": "voice",
                        "preferred_msg_days": "mon_wed",
                        "preferred_msg_times": "9_11",
                        "preferred_language": "hausa"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 12: get identity 05059996666 by msisdn
        {
            'request': {
                'method': 'GET',
                'params': {
                    'details__addresses__msisdn': '+2345059996666'
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
                        "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059996666/",
                        "id": "3f7c8851-5204-43f7-af7f-005059996666",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "+2345059996666": {}
                                }
                            },
                            "receiver_role": "mother",
                            "linked_to": "3f7c8851-5204-43f7-af7f-005059997777",
                            "preferred_msg_type": "voice",
                            "preferred_msg_days": "mon_wed",
                            "preferred_msg_times": "9_11",
                            "preferred_language": "pidgin"
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // 13: get identity 3f7c8851-5204-43f7-af7f-005059996666
        {
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059996666/',
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059996666/",
                    "id": "3f7c8851-5204-43f7-af7f-005059996666",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059996666": {}
                            }
                        },
                        "receiver_role": "mother",
                        "linked_to": "3f7c8851-5204-43f7-af7f-005059997777",
                        "preferred_msg_type": "voice",
                        "preferred_msg_days": "mon_wed",
                        "preferred_msg_times": "9_11",
                        "preferred_language": "pidgin"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 14: patch identity 3f7c8851-5204-43f7-af7f-005059996666
        {
            'request': {
                'method': 'PATCH',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059996666/',
                'data': {
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059996666/",
                    "id": "3f7c8851-5204-43f7-af7f-005059996666",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059998888": {}
                            }
                        },
                        "receiver_role": "mother",
                        "linked_to": "3f7c8851-5204-43f7-af7f-005059997777",
                        "preferred_msg_type": "voice",
                        "preferred_msg_days": "mon_wed",
                        "preferred_msg_times": "9_11",
                        "preferred_language": "pidgin"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059996666/",
                    "id": "3f7c8851-5204-43f7-af7f-005059996666",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059998888": {}
                            }
                        },
                        "receiver_role": "mother",
                        "linked_to": "3f7c8851-5204-43f7-af7f-005059997777",
                        "preferred_msg_type": "voice",
                        "preferred_msg_days": "mon_wed",
                        "preferred_msg_times": "9_11",
                        "preferred_language": "pidgin"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 15: patch identity 3f7c8851-5204-43f7-af7f-005059997777
        {
            'request': {
                'method': 'PATCH',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059997777/',
                'data': {
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059997777/",
                    "id": "3f7c8851-5204-43f7-af7f-005059997777",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059998888": {}
                            }
                        },
                        "receiver_role": "family",
                        "linked_to": "3f7c8851-5204-43f7-af7f-005059996666",
                        "household_msgs_only": true,
                        "preferred_msg_type": "voice",
                        "preferred_msg_days": "mon_wed",
                        "preferred_msg_times": "9_11",
                        "preferred_language": "hausa"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059997777/",
                    "id": "3f7c8851-5204-43f7-af7f-005059997777",
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                "+2345059998888": {}
                            }
                        },
                        "receiver_role": "family",
                        "linked_to": "3f7c8851-5204-43f7-af7f-005059996666",
                        "household_msgs_only": true,
                        "preferred_msg_type": "voice",
                        "preferred_msg_days": "mon_wed",
                        "preferred_msg_times": "9_11",
                        "preferred_language": "hausa"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 16: get subscription via identity 3f7c8851-5204-43f7-af7f-005059992222
        {
            'request': {
                'method': 'GET',
                'params': {
                    'identity': '3f7c8851-5204-43f7-af7f-005059992222'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/subscriptions/'
            },
            'response': {
                "code": 200,
                "data": {
                    'url': 'http://localhost:8002/api/v1/subscriptions/51fcca25-2e85-4c44-subscription-2222',
                    'id': '51fcca25-2e85-4c44-subscription-2222',
                    'version': 1,
                    'identity': '3f7c8851-5204-43f7-af7f-005059992222',
                    'messageset_id': 1,
                    'next_sequence_number': 1,
                    'lang': "ibo_NG",
                    'active': true,
                    'completed': false,
                    'schedule': 1,
                    'process_status': 0,
                    'metadata': {},
                    'created_at': "2015-07-10T06:13:29.693272Z",
                    'updated_at': "2015-07-10T06:13:29.693272Z"
                }
            }
        },

        // 17: get messageset 1
        {
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8003/api/v1/messagesets/1/'
            },
            'response': {
                'code': 200,
                'data': {
                    'id': 1,
                    'short_name': 'messageset 1',
                    'notes': null,
                    'next_set': 2,
                    'default_schedule': 1,
                    'content_type': 'text',
                    'created_at': "2015-07-10T06:13:29.693272Z",
                    'updated_at': "2015-07-10T06:13:29.693272Z"
                }
            }
        },

        // 18: patch subscription
        {
            'request': {
                'method': 'PATCH',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/subscriptions/51fcca25-2e85-4c44-subscription-2222/',
                'data': {
                    "url": "http://localhost:8002/api/v1/subscriptions/51fcca25-2e85-4c44-subscription-2222",
                    "id": "51fcca25-2e85-4c44-subscription-2222",
                    "version": 1,
                    "identity": "3f7c8851-5204-43f7-af7f-005059992222",
                    "messageset_id": 1,
                    "next_sequence_number": 1,
                    "lang": "ibo_NG",
                    "active": true,
                    "completed": false,
                    "schedule": 1,
                    "process_status": 0,
                    "metadata": {},
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693272Z"
                }
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8002/api/v1/subscriptions/51fcca25-2e85-4c44-subscription-2222",
                    "id": "51fcca25-2e85-4c44-subscription-2222",
                    "version": 1,
                    "identity": "3f7c8851-5204-43f7-af7f-005059992222",
                    "messageset_id": 1,
                    "next_sequence_number": 1,
                    "lang": "ibo_NG",
                    "active": true,
                    "completed": false,
                    "schedule": 1,
                    "process_status": 0,
                    "metadata": {},
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693272Z"
                }
            }
        },

        // x: unused - get identity 3f7c8851-5204-43f7-af7f-005059995555
        {
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059995555/",
            },
            'response': {
                "code": 200,
                "data": {
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059995555/",
                    "id": "3f7c8851-5204-43f7-af7f-005059995555",
                    "version": 1,
                    "communicate_through": "3f7c8851-5204-43f7-af7f-005059993333",
                    "operator": null,
                    "details": {
                        "receiver_role": "mother",
                        "preferred_language": "hausa",
                        "linked_to": "cb245673-aa41-4302-ac47-9093333333"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },


    ];
};
