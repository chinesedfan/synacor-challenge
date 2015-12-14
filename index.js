var fs = require('fs');
var path = require('path');
var solve = require('./lib');

var args = process.argv.slice(2);

if (args.length < 1) {
	console.log('Useage: node ' + path.basename(__filename) + ' <input>');
	return;
}

fs.readFile(args[0], function(err, content) {
	if (err) throw err;

	solve(content);
});