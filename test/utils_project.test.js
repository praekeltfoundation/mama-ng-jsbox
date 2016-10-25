var assert = require('assert');
var moment = require('moment');

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
