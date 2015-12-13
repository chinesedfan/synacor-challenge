var utils = require('./utils');
var cpu = require('./cpu');
module.exports = solve;

function solve(data) {
	var numbers = utils.binary2numbers(data);
	var ops = utils.numbers2ops(numbers);

	cpu.run(ops);
}
