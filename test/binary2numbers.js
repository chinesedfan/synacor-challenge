var fs = require('fs');
var utils = require('../lib/utils');

fs.readFile('../bin/challenge.bin', function(err, content) {
	if (err) throw err;

	var numbers = utils.binary2numbers(content.toString());
	console.log(numbers.slice(0, 100));
});