// identities
// +2345059991111 - Existing identity with active subscription
// +2345059992222 - Existing identity with no subscription
// +2345059993333 - No identity or subscription

module.exports = function() {
    return [

        // 0: get identity 05059991111 by msisdn
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
                    "next": null,
                    "previous": null,
                    "results": [{
                        "url": "http://localhost:8001/api/v1/identities/3f7c8851-5204-43f7-af7f-005059991111/",
                        "id": "3f7c8851-5204-43f7-af7f-005059991111",
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "+2345059991111": {}
                                }
                            },
                            "receiver_role": "mother",
                            "linked_to": null,
                            "preferred_msg_type": "text",
                            "preferred_language": "ibo_NG"
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // 1: get subscriptions for identity 3f7c8851-5204-43f7-af7f-005059991111
        {
            'request': {
                'method': 'GET',
                'params': {
                    'identity': '3f7c8851-5204-43f7-af7f-005059991111',
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
                    "next": null,
                    "previous": null,
                    "results": [
                        {
                            'url': 'http://localhost:8002/api/v1/subscriptions/51fcca25-2e85-4c44-subscription-1111',
                            'id': '51fcca25-2e85-4c44-subscription-1111',
                            'version': 1,
                            'identity': '3f7c8851-5204-43f7-af7f-005059991111',
                            'messageset': 1,
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

        // 2: Resend subscription
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8005/api/v1/subscriptions/51fcca25-2e85-4c44-subscription-1111/resend',
                'data': {}
            },
            'response': {
                'code': 201,
                'data': {
                    "accepted": true
                }
            }
        },

        // 3: get identity 05059992222 by msisdn
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
                            "preferred_language": "ibo_NG"
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }]
                }
            }
        },

        // 4: get subscriptions for identity 3f7c8851-5204-43f7-af7f-005059992222 - no results
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
                    "next": null,
                    "previous": null,
                    "results": []

                }
            }
        },

        // 5: get identity 05059993333 by msisdn - no results
        {
            'repeatable': true,
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
                    "next": null,
                    "previous": null,
                    "results": []
                }
            }
        },

    ];
};
