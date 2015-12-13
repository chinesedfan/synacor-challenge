var assert = require('assert');
var path = require('path');

var rootpath = '../../';
var utils = require(path.join(rootpath, './lib/utils'));
var CPU = require(path.join(rootpath, './lib/cpu')).CPU;

describe('util methods', function() {
	it('numbers2ops', function() {
		var numbers = [21, 19, 63, 0];

		assert.deepEqual(utils.numbers2ops(numbers), [
			{code: 21, argv: []},
			{code: 19, argv: [63]},
			{code: 0, argv: []}
		]);
	});
});

describe('cpu methods', function() {
	it('noop out halt', function() {
		var ops = [
			{code: 21, argv: []},
			{code: 19, argv: [97]},
			{code: 0, argv: []}
		];

		var cpu = new CPU(ops, true);
		cpu.run();
		assert.deepEqual(cpu.output, ['a']);
	});
});