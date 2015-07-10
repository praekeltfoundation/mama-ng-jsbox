module.exports = function() {
    return [
        // create contact 082001
        {
            'request': {
                'method': 'POST',
                'headers': {
                    'Authorization': ['Token test_key'],
                    'Content-Type': ['application/json']
                },
                'url': 'http://localhost:8000/api/v1/contacts/',
                'data': {
                    "details": {
                        "name": "Semi-Test",
                        "msisdn": "082001"
                    }
                }
            },
            'response': {
                'code': 201,
                'data': {
                    "url": "http://localhost:8000/api/v1/contacts/cb245673-aa41-4302-ac47-667a7ed44cc6/",
                    "id": "cb245673-aa41-4302-ac47-667a7ed44cc6",
                    "version": 1,
                    "details": {
                        "name": "Semi-Test",
                        "msisdn": "082001"
                    },
                    "created_at": "2015-07-10T06:13:29.693272Z",
                    "updated_at": "2015-07-10T06:13:29.693298Z"
                }
            }
        }
    ];
};
