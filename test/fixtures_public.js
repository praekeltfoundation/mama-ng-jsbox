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
            'repeatable': true,
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
            'repeatable': true,
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
            'repeatable': true,
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
                            "preferred_msg_type": "text",
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
                            "preferred_msg_type": "audio",
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
                        "preferred_msg_type": "audio",
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
                            "preferred_msg_type": "audio",
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
                        "preferred_msg_type": "audio",
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
            'repeatable': true,
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
                        "preferred_msg_type": "text",
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
                        "preferred_msg_type": "text",
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
                        "preferred_msg_type": "text",
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
                        "preferred_msg_type": "audio",
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
                        "preferred_msg_type": "audio",
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
                            "preferred_msg_type": "audio",
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
            'repeatable': true,
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
                        "preferred_msg_type": "audio",
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
                        "preferred_msg_type": "audio",
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
                        "preferred_msg_type": "audio",
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
                        "preferred_msg_type": "audio",
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
                        "preferred_msg_type": "audio",
                        "preferred_msg_days": "mon_wed",
                        "preferred_msg_times": "9_11",
                        "preferred_language": "hausa"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 16: get subscription for identity 3f7c8851-5204-43f7-af7f-005059992222
        {
            'request': {
                'method': 'GET',
                'params': {
                    'identity': '3f7c8851-5204-43f7-af7f-005059992222',
                    'active': 'true'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8005/api/v1/subscriptions/'
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [
                        {
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
                    ]

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
                    'short_name': 'pregnant_mother_text_10_42',
                    'notes': null,
                    'next_set': 4,
                    'default_schedule': 1,
                    'content_type': 'text',
                    'created_at': "2015-07-10T06:13:29.693272Z",
                    'updated_at': "2015-07-10T06:13:29.693272Z"
                }
            }
        },

        // 18: Change messaging 1 - sms to voice
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/change/',
                'data': {
                    "mother_id": "3f7c8851-5204-43f7-af7f-005059992222",
                    "action": "change_messaging",
                    "data": {
                        "msg_type": "audio",
                        "voice_days": "tue_thu",
                        "voice_times": "9_11"
                    }
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 1
                }
            }
        },

        // 19: get subscription for identity 3f7c8851-5204-43f7-af7f-005059995555
        {
            'request': {
                'method': 'GET',
                'params': {
                    'identity': '3f7c8851-5204-43f7-af7f-005059995555',
                    'active': 'true'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8005/api/v1/subscriptions/'
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [
                        {
                            'url': 'http://localhost:8002/api/v1/subscriptions/51fcca25-2e85-4c44-subscription-5555',
                            'id': '51fcca25-2e85-4c44-subscription-5555',
                            'version': 1,
                            'identity': '3f7c8851-5204-43f7-af7f-005059995555',
                            'messageset_id': 2,
                            'next_sequence_number': 1,
                            'lang': "eng_NG",
                            'active': true,
                            'completed': false,
                            'schedule': 1,
                            'process_status': 0,
                            'metadata': {},
                            'created_at': "2015-07-10T06:13:29.693272Z",
                            'updated_at': "2015-07-10T06:13:29.693272Z"
                        }
                    ]

                }
            }
        },

        // 20: get messageset 2
        {
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8003/api/v1/messagesets/2/'
            },
            'response': {
                'code': 200,
                'data': {
                    'id': 1,
                    'short_name': 'messageset 2',
                    'notes': null,
                    'next_set': 3,
                    'default_schedule': 1,
                    'content_type': 'audio',
                    'created_at': "2015-07-10T06:13:29.693272Z",
                    'updated_at': "2015-07-10T06:13:29.693272Z"
                }
            }
        },

        // 21: Change messaging 2 - voice to voice
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/change/',
                'data': {
                    "mother_id": "3f7c8851-5204-43f7-af7f-005059995555",
                    "action": "change_messaging",
                    "data": {
                        "msg_type": "audio",
                        "voice_days": "mon_wed",
                        "voice_times": "2_5"
                    }
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 1
                }
            }
        },

        // 22: get subscription for identity 3f7c8851-5204-43f7-af7f-005059996666
        {
            'request': {
                'method': 'GET',
                'params': {
                    'identity': '3f7c8851-5204-43f7-af7f-005059996666',
                    'active': 'true'
                },
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8005/api/v1/subscriptions/'
            },
            'response': {
                "code": 200,
                "data": {
                    "count": 1,
                    "next": null,
                    "previous": null,
                    "results": [
                        {
                            'url': 'http://localhost:8002/api/v1/subscriptions/51fcca25-2e85-4c44-subscription-6666',
                            'id': '51fcca25-2e85-4c44-subscription-6666',
                            'version': 1,
                            'identity': '3f7c8851-5204-43f7-af7f-005059996666',
                            'messageset_id': 3,
                            'next_sequence_number': 1,
                            'lang': "pcm_NG",
                            'active': true,
                            'completed': false,
                            'schedule': 1,
                            'process_status': 0,
                            'metadata': {},
                            'created_at': "2015-07-10T06:13:29.693272Z",
                            'updated_at': "2015-07-10T06:13:29.693272Z"
                        }
                    ]
                }
            }
        },

        // 23: get messageset 3
        {
            'request': {
                'method': 'GET',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8003/api/v1/messagesets/3/'
            },
            'response': {
                'code': 200,
                'data': {
                    'id': 1,
                    'short_name': 'messageset 3',
                    'notes': null,
                    'next_set': 4,
                    'default_schedule': 1,
                    'content_type': 'audio',
                    'created_at': "2015-07-10T06:13:29.693272Z",
                    'updated_at': "2015-07-10T06:13:29.693272Z"
                }
            }
        },

        // 24: Change messaging 3 - voice to sms
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/change/',
                'data': {
                    "mother_id": "3f7c8851-5204-43f7-af7f-005059996666",
                    "action": "change_messaging",
                    "data": {
                        "msg_type": "text",
                        "voice_days": null,
                        "voice_times": null
                    }
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 1
                }
            }
        },

        // 25: Fixture to make HEAD requests to mp3 files to see if they exist
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

        // 26: patch identity 3f7c8851-5204-43f7-af7f-005059992222
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
                                "+2345059992222": {}
                            }
                        },
                        "receiver_role": "mother",
                        "linked_to": null,
                        "preferred_msg_type": "audio",
                        "preferred_language": "igbo",
                        "preferred_msg_days": "tue_thu",
                        "preferred_msg_times": "9_11"
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
                                "+2345059992222": {}
                            }
                        },
                        "receiver_role": "mother",
                        "linked_to": null,
                        "preferred_msg_type": "audio",
                        "preferred_language": "igbo",
                        "preferred_msg_days": "tue_thu",
                        "preferred_msg_times": "9_11"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 27: patch identity 3f7c8851-5204-43f7-af7f-005059992222
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
                                "+2345059992222": {}
                            }
                        },
                        "receiver_role": "mother",
                        "linked_to": null,
                        "preferred_msg_type": "text",
                        "preferred_language": "igbo",
                        "opted_out": true,
                        "optout_reason": "miscarriage"
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
                        "preferred_msg_type": "text",
                        "preferred_language": "igbo"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 28: patch identity 3f7c8851-5204-43f7-af7f-005059995555
        {
            'request': {
                'method': 'PATCH',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059995555/',
                'data': {
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059995555/",
                    "id": "3f7c8851-5204-43f7-af7f-005059995555",
                    "version": 1,
                    "communicate_through": "3f7c8851-5204-43f7-af7f-005059993333",
                    "operator": null,
                    "details": {
                        "receiver_role": "mother",
                        "preferred_language": "hausa",
                        "linked_to": "cb245673-aa41-4302-ac47-9093333333",
                        "preferred_msg_type": "audio",
                        "preferred_msg_days": "mon_wed",
                        "preferred_msg_times": "2_5"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
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
                        "linked_to": "cb245673-aa41-4302-ac47-9093333333",
                        "preferred_msg_type": "audio",
                        "preferred_msg_days": "mon_wed",
                        "preferred_msg_times": "2_5"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 29: patch identity 3f7c8851-5204-43f7-af7f-005059996666
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
                                "+2345059996666": {}
                            }
                        },
                        "receiver_role": "mother",
                        "linked_to": "3f7c8851-5204-43f7-af7f-005059997777",
                        "preferred_msg_type": "text",
                        "preferred_msg_days": null,
                        "preferred_msg_times": null,
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
                                "+2345059996666": {}
                            }
                        },
                        "receiver_role": "mother",
                        "linked_to": "3f7c8851-5204-43f7-af7f-005059997777",
                        "preferred_msg_type": "text",
                        "preferred_msg_days": null,
                        "preferred_msg_times": null,
                        "preferred_language": "pidgin"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 30: get identity 3f7c8851-5204-43f7-af7f-005059995555
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

        // 31: Change to loss 1 - miscarriage 2222
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/change/',
                'data': {
                    "mother_id": "3f7c8851-5204-43f7-af7f-005059992222",
                    "action": "change_loss",
                    "data": {
                        "loss_reason": "miscarriage"
                    }
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 2
                }
            }
        },

        // 32: Change to loss 2 - miscarriage 5555
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/change/',
                'data': {
                    "mother_id": "3f7c8851-5204-43f7-af7f-005059995555",
                    "action": "change_loss",
                    "data": {
                        "loss_reason": "miscarriage"
                    }
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 2
                }
            }
        },

        // 33: Unsubscribe 1 - miscarriage 3333
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/change/',
                'data': {
                    "mother_id": "3f7c8851-5204-43f7-af7f-005059995555",
                    "action": "unsubscribe_household_only",
                    "data": {
                        "household_id": "3f7c8851-5204-43f7-af7f-005059993333",
                        "loss_reason": "miscarriage"
                    }
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 1
                }
            }
        },

        // 34: Change to loss 3 - miscarriage 6666
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/change/',
                'data': {
                    "mother_id": "3f7c8851-5204-43f7-af7f-005059996666",
                    "action": "change_loss",
                    "data": {
                        "loss_reason": "miscarriage"
                    }
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 3
                }
            }
        },

        // 35: Optout - miscarriage 7777
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059997777",
                    "reason": "miscarriage",
                    "address_type": "msisdn",
                    "address": "+2345059997777",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 1
                }
            }
        },

        // 36: Optout - miscarriage 2222
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059992222",
                    "reason": "miscarriage",
                    "address_type": "msisdn",
                    "address": "+2345059992222",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 2
                }
            }
        },

        // 37: Optout - miscarriage 5555 - unused
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "identity": "3f7c8851-5204-43f7-af7f-005059995555",
                    "reason": "miscarriage"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 3
                }
            }
        },

        // 38: Optout - miscarriage 3333
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059993333",
                    "reason": "miscarriage",
                    "address_type": "msisdn",
                    "address": "+2345059993333",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 4
                }
            }
        },

        // 39: Optout - miscarriage 6666
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059996666",
                    "reason": "miscarriage",
                    "address_type": "msisdn",
                    "address": "+2345059996666",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 5
                }
            }
        },

        // 40: Optout - stillborn 7777
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059997777",
                    "reason": "stillborn",
                    "address_type": "msisdn",
                    "address": "+2345059997777",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 1
                }
            }
        },

        // 41: Optout - stillborn 2222
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059992222",
                    "reason": "stillborn",
                    "address_type": "msisdn",
                    "address": "+2345059992222",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 2
                }
            }
        },

        // 42: Optout - stillborn 5555 - unused
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "identity": "3f7c8851-5204-43f7-af7f-005059995555",
                    "reason": "stillborn"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 3
                }
            }
        },

        // 43: Optout - stillborn 3333
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059993333",
                    "reason": "stillborn",
                    "address_type": "msisdn",
                    "address": "+2345059993333",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 4
                }
            }
        },

        // 44: Optout - stillborn 6666
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059996666",
                    "reason": "stillborn",
                    "address_type": "msisdn",
                    "address": "+2345059996666",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 5
                }
            }
        },

        // 45: Optout - baby_death 7777
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059997777",
                    "reason": "baby_death",
                    "address_type": "msisdn",
                    "address": "+2345059997777",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 1
                }
            }
        },

        // 46: Optout - baby_death 2222
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059992222",
                    "reason": "baby_death",
                    "address_type": "msisdn",
                    "address": "+2345059992222",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 2
                }
            }
        },

        // 47: Optout - baby_death 5555 - unused
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "identity": "3f7c8851-5204-43f7-af7f-005059995555",
                    "reason": "baby_death"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 3
                }
            }
        },

        // 48: Optout - baby_death 3333
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059993333",
                    "reason": "baby_death",
                    "address_type": "msisdn",
                    "address": "+2345059993333",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 4
                }
            }
        },

        // 49: Optout - baby_death 6666
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059996666",
                    "reason": "baby_death",
                    "address_type": "msisdn",
                    "address": "+2345059996666",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 5
                }
            }
        },

        // 50: Optout - not_useful 7777
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059997777",
                    "reason": "not_useful",
                    "address_type": "msisdn",
                    "address": "+2345059997777",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 1
                }
            }
        },

        // 51: Optout - not_useful 2222
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059992222",
                    "reason": "not_useful",
                    "address_type": "msisdn",
                    "address": "+2345059992222",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 2
                }
            }
        },

        // 52: Optout - not_useful 5555
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/change/',
                'data': {
                    "mother_id": "3f7c8851-5204-43f7-af7f-005059995555",
                    "action": "unsubscribe_mother_only",
                    "data": {
                        "household_id": "3f7c8851-5204-43f7-af7f-005059993333",
                        "loss_reason": "not_useful"
                    }
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 3
                }
            }
        },

        // 53: Optout - not_useful 3333
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059993333",
                    "reason": "not_useful",
                    "address_type": "msisdn",
                    "address": "+2345059993333",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 4
                }
            }
        },

        // 54: Optout - not_useful 6666
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059996666",
                    "reason": "not_useful",
                    "address_type": "msisdn",
                    "address": "+2345059996666",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 5
                }
            }
        },

        // 55: Optout - other 7777
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059997777",
                    "reason": "other",
                    "address_type": "msisdn",
                    "address": "+2345059997777",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 1
                }
            }
        },

        // 56: Optout - other 2222
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059992222",
                    "reason": "other",
                    "address_type": "msisdn",
                    "address": "+2345059992222",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 2
                }
            }
        },

        // 57: Unsub mother - other 5555
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/change/',
                'data': {
                    "mother_id": "3f7c8851-5204-43f7-af7f-005059995555",
                    "action": "unsubscribe_mother_only",
                    "data": {
                        "household_id": "3f7c8851-5204-43f7-af7f-005059993333",
                        "loss_reason": "other"
                    }
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 3
                }
            }
        },

        // 58: Optout - other 3333
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059993333",
                    "reason": "other",
                    "address_type": "msisdn",
                    "address": "+2345059993333",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 4
                }
            }
        },

        // 59: Optout - other 6666
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/optout/',
                'data': {
                    "optout_type": "stop",
                    "identity": "3f7c8851-5204-43f7-af7f-005059996666",
                    "reason": "other",
                    "address_type": "msisdn",
                    "address": "+2345059996666",
                    "request_source": "ussd_public",
                    "request_source_id": "0170b7bb-978e-4b8a-35d2-662af5b6daee"
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 5
                }
            }
        },

        // 60: Unsubscribe 2 - not_useful 3333
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/change/',
                'data': {
                    "mother_id": "3f7c8851-5204-43f7-af7f-005059995555",
                    "action": "unsubscribe_household_only",
                    "data": {
                        "household_id": "3f7c8851-5204-43f7-af7f-005059993333",
                        "loss_reason": "not_useful"
                    }
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 1
                }
            }
        },

        // 61: Unsubscribe 3 - other 3333
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/change/',
                'data': {
                    "mother_id": "3f7c8851-5204-43f7-af7f-005059995555",
                    "action": "unsubscribe_household_only",
                    "data": {
                        "household_id": "3f7c8851-5204-43f7-af7f-005059993333",
                        "loss_reason": "other"
                    }
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 1
                }
            }
        },

        // 62: Change language - 2222
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/change/',
                'data': {
                    "mother_id": "3f7c8851-5204-43f7-af7f-005059992222",
                    "action": "change_language",
                    "data": {
                        "household_id": null,
                        "new_language": "pidgin"
                    }
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 1
                }
            }
        },

        // 63: patch identity 3f7c8851-5204-43f7-af7f-005059992222
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
                                "+2345059992222": {}
                            }
                        },
                        "receiver_role": "mother",
                        "linked_to": null,
                        "preferred_msg_type": "text",
                        "preferred_language": "pidgin"
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
                                "+2345059992222": {}
                            }
                        },
                        "receiver_role": "mother",
                        "linked_to": null,
                        "preferred_msg_type": "text",
                        "preferred_language": "pidgin"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 64: Change language - 5555 (& 3333)
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/change/',
                'data': {
                    "mother_id": "3f7c8851-5204-43f7-af7f-005059995555",
                    "action": "change_language",
                    "data": {
                        "household_id": "3f7c8851-5204-43f7-af7f-005059993333",
                        "new_language": "pidgin"
                    }
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 2
                }
            }
        },

        // 65: patch identity 3f7c8851-5204-43f7-af7f-005059995555
        {
            'request': {
                'method': 'PATCH',
                'params': {},
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059995555/',
                'data': {
                    "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059995555/",
                    "id": "3f7c8851-5204-43f7-af7f-005059995555",
                    "version": 1,
                    "communicate_through": "3f7c8851-5204-43f7-af7f-005059993333",
                    "operator": null,
                    "details": {
                        "receiver_role": "mother",
                        "preferred_language": "pidgin",
                        "linked_to": "cb245673-aa41-4302-ac47-9093333333"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
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
                        "preferred_language": "pidgin",
                        "linked_to": "cb245673-aa41-4302-ac47-9093333333"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 66: patch identity 3f7c8851-5204-43f7-af7f-005059993333
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
                                "+2345059993333": {}
                            }
                        },
                        "receiver_role": "friend",
                        "linked_to": "3f7c8851-5204-43f7-af7f-005059995555",
                        "preferred_msg_type": "audio",
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
                        "preferred_msg_type": "audio",
                        "preferred_msg_days": "mon_wed",
                        "preferred_msg_times": "9_11",
                        "preferred_language": "pidgin"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 67: Change language - 6666 (& 7777)
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8002/api/v1/change/',
                'data': {
                    "mother_id": "3f7c8851-5204-43f7-af7f-005059996666",
                    "action": "change_language",
                    "data": {
                        "household_id": "3f7c8851-5204-43f7-af7f-005059997777",
                        "new_language": "pidgin"
                    }
                }
            },
            'response': {
                'code': 201,
                'data': {
                    'id': 3
                }
            }
        },

        // 68: patch identity 3f7c8851-5204-43f7-af7f-005059996666
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
                                "+2345059996666": {}
                            }
                        },
                        "receiver_role": "mother",
                        "linked_to": "3f7c8851-5204-43f7-af7f-005059997777",
                        "preferred_msg_type": "audio",
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
                                "+2345059996666": {}
                            }
                        },
                        "receiver_role": "mother",
                        "linked_to": "3f7c8851-5204-43f7-af7f-005059997777",
                        "preferred_msg_type": "audio",
                        "preferred_msg_days": "mon_wed",
                        "preferred_msg_times": "9_11",
                        "preferred_language": "pidgin"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },

        // 69: patch identity 3f7c8851-5204-43f7-af7f-005059997777
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
                                "+2345059997777": {}
                            }
                        },
                        "receiver_role": "family",
                        "linked_to": "3f7c8851-5204-43f7-af7f-005059996666",
                        "household_msgs_only": true,
                        "preferred_msg_type": "audio",
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
                        "preferred_msg_type": "audio",
                        "preferred_msg_days": "mon_wed",
                        "preferred_msg_times": "9_11",
                        "preferred_language": "pidgin"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        },


    ];
};
