var fs = require('fs');
var _ = require('lodash');
var utils = require('../lib/utils');

fs.readFile('../bin/challenge.bin', function(err, content) {
	if (err) throw err;

	var numbers = utils.binary2numbers(content);
	_.all(numbers, function(n, i) {
		if (n > 32776) {
			console.log('invalid number: ' + n + '(0x' + n.toString(16) + ')');
			console.log('index:', i);
			return false;
		}
		return true;
	});
	console.log('done: ' + numbers.length);
});