var assert = require('assert');
var moment = require('moment');


         //Check the validity of a number to ensure that it matches a prefix from Telcos in Nigeria.
         
          PrefixFunction = {
            phoneNumberPrefix: function(msisdn)
        {
         
         if (msisdn.match(/^(0701|0702|0703|0705|0706|0708|0806|0807|0808|0809|0810|0811|0812|0813|0814|0815|0816|0817|0818|0909|0908|0902|0903|0905|0906|0907)/))
         {
           return true;
         }
         else
         {
           return false;
         }
        }
           };



describe('utils_project module', function() {
    describe('is_valid_month', function () {

        it('should pass for jan this year', function () {
            var today = new moment('2016-09-01', 'YYYY-MM-DD');
            assert.equal(
                go.utils_project.is_valid_month(today, 2016, 1, 11),
                true);
        });

        it('should pass for dec last year', function () {
            var today = new moment('2016-09-01', 'YYYY-MM-DD');
            assert.equal(
                go.utils_project.is_valid_month(today, 2015, 12, 11),
                true);
        });

        it('should return true for valid month ranges', function () {
            // january is within 10 months ago from `today`
            var today = new moment('2016-10-25', 'YYYY-MM-DD');
            assert.equal(
                go.utils_project.is_valid_month(today, 2016, 1, 10),
                true);
        });

        it('should fail for invalid month ranges', function () {
            // january is further than 9 months ago from `today`
            var today = new moment('2016-10-25', 'YYYY-MM-DD');
            assert.equal(
                go.utils_project.is_valid_month(today, 2016, 1, 9),
                false);
        });
    });
});

module.exports = PrefixFunction;