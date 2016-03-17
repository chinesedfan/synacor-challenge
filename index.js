var fs = require('fs');
var path = require('path');
var solve = require('./lib');

var args = process.argv.slice(2);

if (args.length < 1) {
	console.log('Useage: node ' + path.basename(__filename) + ' <bin_file> [input_file]');
	return;
}

fs.readFile(args[0], function(err, content) {
	if (err) throw err;

    var inputList;
    if (args.length >= 2) {
        inputList = fs.readFileSync(args[1]).toString().split('\n');
    }
	solve(content, {
        inputList: inputList
    });
});