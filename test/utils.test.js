var assert = require('assert');
var fs = require('fs');
var _ = require('lodash');
var utils = require('../lib/utils');

describe('util methods', function() {
    it('numbers2ops', function() {
        var numbers = [21, 19, 63, 0];

        assert.deepEqual(utils.numbers2ops(numbers), [
            {code: 21, argv: []},
            {code: 19, argv: [63]},
            {code: 0, argv: []}
        ]);
    });
    it('binary2numbers', function(done) {
        var bin = require.resolve('../bin/challenge.bin');
        var fsize = fs.statSync(bin).size;
        fs.readFile(bin, function(err, content) {
            if (err) return done(err);

            var numbers = utils.binary2numbers(content);
            _.all(numbers, function(n, i) {
                if (n > 32776) {
                    var msg = 'invalid number: ' + n + '(0x' + n.toString(16) + ')';
                    msg += '\nindex: ' + i;
                    done(msg);
                    return false;
                }
                return true;
            });
            assert.deepEqual(numbers.length, fsize / 2);
            done();
        });
    });
});
