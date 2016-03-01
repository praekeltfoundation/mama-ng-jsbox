// Identity roles
// 05059991111: heretofore unseen number
// 05059992222: registered user - mother only registration, sms, pregnant, igbo
// 05059993333: registered user - friend_only, voice, baby, english, receives for 05059995555
// 05059994444: existing contact that does not have a receiver_role
// 05059995555: registered user - mother that receives messages via 05059993333
// 05059996666: registered user - mother that receives own messages, linked to 05059997777
// 05059997777: registered user - family member that receives household messages for 05059996666
// 05059998888:

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
                                    "+2348080020002": {}
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
                                    "+23405059994444": {}
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
                                    "+23405059993333": {}
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
                                "+23405059993333": {}
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
                                    "+23405059997777": {}
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
                                "+23405059997777": {}
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
