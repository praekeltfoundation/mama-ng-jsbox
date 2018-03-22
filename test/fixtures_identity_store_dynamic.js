module.exports = function() {
    return {
        identity_search: function(params) {
            params = params || {};
            var identity = params.identity || 'cb245673-aa41-4302-ac47-00000001002';
            var msisdn = params.msisdn || "+2348080020002";
            var search_param = params.search_param || "details__addresses__msisdn";
            var search_value = params.search_value || msisdn;
            var extra_details = params.extra_details || {};
            var opted_out = params.opted_out || false;

            var search_params = {};
            search_params[search_param] = search_value;

            results = [];
            if (!params.empty){
                results.push({
                    "url": "http://localhost:8001/api/v1/identities/" + identity + "/",
                    "id": identity,
                    "version": 1,
                    "details": {
                        "default_addr_type": "msisdn",
                        "addresses": {
                            "msisdn": {
                                msisdn: {}
                            }
                        }
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                });

                for (var key in extra_details){
                    results[0].details[key] = extra_details[key];
                }

                results[0].details.addresses.msisdn[msisdn] = {"default": true};

                if (opted_out){
                    results[0].details.addresses.msisdn[msisdn].optedout = true;
                }
            }

            var res = {
                'repeatable': true,  // necessary for timeout restart testing
                'request': {
                    'method': 'GET',
                    'params': search_params,
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
                        "results": results
                    }
                }
            };

            return res;
        },

        get_identity: function(params) {
            params = params || {};
            var identity = params.identity || 'cb245673-aa41-4302-ac47-00000001002';
            var msisdn = params.msisdn || "+2348080020002";
            var opted_out = params.opted_out || false;
            var extra_details = params.extra_details || {};

            var res = {
                'repeatable': true,
                'request': {
                    'method': 'GET',
                    'params': {},
                    'headers': {
                        'Authorization': ['Token test_key'],
                        'Content-Type': ['application/json']
                    },
                    'url': 'http://localhost:8001/api/v1/identities/' + identity + '/',
                },
                'response': {
                    "code": 200,
                    "data": {
                        "url": "http://localhost:8001/api/v1/identities/" + identity + "/",
                        "id": identity,
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    msisdn: {}
                                }
                            }
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }
                }
            };

            for (var key in extra_details){
                res.response.data.details[key] = extra_details[key];
            }

            res.response.data.details.addresses.msisdn[msisdn] = {"default": true};
            if (opted_out){
                res.response.data.details.addresses.msisdn[msisdn].optedout = true;
            }

            return res;
        },

        patch_identity: function(params) {
            params = params || {};
            var identity = params.identity || 'cb245673-aa41-4302-ac47-00000001002';
            var msisdn = params.msisdn || "+2348080020002";
            var extra_details = params.extra_details || {};

            var res = {
                'request': {
                    'method': 'PATCH',
                    'headers': {
                        'Authorization': ['Token test_key'],
                        'Content-Type': ['application/json']
                    },
                    "data": {
                        "id": identity,
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "msisdn": {}
                                }
                            },
                        },
                    },
                    'url': "http://localhost:8001/api/v1/identities/" + identity + "/"
                },
                'response': {
                    "code": 200,
                    "data": {
                        "url": "http://localhost:8001/api/v1/identities/" + identity + "/",
                        "id": identity,
                        "version": 1,
                        "details": {
                            "default_addr_type": "msisdn",
                            "addresses": {
                                "msisdn": {
                                    "msisdn": {}
                                }
                            },
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }
                }
            };

            for (var key in extra_details){
                res.request.data.details[key] = extra_details[key];
                res.response.data.details[key] = extra_details[key];
            }

            res.request.data.details.addresses.msisdn[msisdn] = {"default": true};
            res.response.data.details.addresses.msisdn[msisdn] = {"default": true};

            return res;
        },

        create_identity: function(params) {
            params = params || {};
            var identity = params.identity || 'cb245673-aa41-4302-ac47-00000001002';
            var communicate_through = params.communicate_through;
            var msisdn = params.msisdn;
            var default_addr_type = params.default_addr_type || null;

            var res = {
                'request': {
                    'method': 'POST',
                    'headers': {
                        'Authorization': ['Token test_key'],
                        'Content-Type': ['application/json']
                    },
                    'url': "http://localhost:8001/api/v1/identities/",
                    'data':  {
                        "details": {
                            "default_addr_type": default_addr_type,
                            "addresses":{}
                        }
                    },
                },
                'response': {
                    "code": 201,
                    "data": {
                        "url": "http://localhost:8001/api/v1/identities/" + identity + "/",
                        "id": identity,
                        "version": 1,
                        "details": {
                            "default_addr_type": default_addr_type,
                            "addresses":{}
                        },
                        "created_at": "2015-07-10T06:13:29.693272Z",
                        "updated_at": "2015-07-10T06:13:29.693298Z"
                    }
                }
            };

            if (msisdn){
                res.request.data.details.addresses.msisdn = {};
                res.request.data.details.addresses.msisdn[msisdn] = {};
                res.response.data.details.addresses.msisdn = {};
                res.response.data.details.addresses.msisdn[msisdn] = {};
            }

            if (communicate_through){
                res.request.data.communicate_through = communicate_through;
                res.response.data.communicate_through = communicate_through;
            }

            return res;
        },

        javascript: "commas"
    };
};
