# mama-ng-jsbox

HelloMama Nigeria JSbox app
Contains logic for Registration and State Changes

    $ npm install
    $ npm test


## Translations

Install jspot

    $ npm install -g jspot

Export pot files and move to config folder

    $ jspot extract go-sms_inbound.js -k $
    $ mv messages.pot config/go-sms_inbound.pot
    $ jspot extract go-ussd_public.js -k $
    $ mv messages.pot config/go-ussd_public.pot
    $ jspot extract go-ussd_registration.js -k $
    $ mv messages.pot config/go-ussd_registration.pot

Translate and return with lang specific POT file and convert to JSON.

    $ cd config
    $ jspot json go-ussd_public.ibo_NG.pot
