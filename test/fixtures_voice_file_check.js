module.exports = function () {
    return [
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
}
