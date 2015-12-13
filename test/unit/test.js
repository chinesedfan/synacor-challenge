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
	it('set', function() {
		var ops = [
			{code: 1, argv: [0, 1234]},
			{code: 0, argv: []}
		];

		var cpu = new CPU(ops, true);
		cpu.run();
		assert.deepEqual(cpu.register[0], 1234);
	});
	it('push number', function() {
		var ops = [
			{code: 2, argv: [1234]},
			{code: 0, argv: []}
		];

		var cpu = new CPU(ops, true);
		cpu.run();
		assert.deepEqual(cpu.stack, [1234]);
	});
	it('push reg', function() {
		var ops = [
			{code: 2, argv: [1234]},
			{code: 1, argv: [0, 5678]},
			{code: 2, argv: [32768]},
			{code: 0, argv: []}
		];

		var cpu = new CPU(ops, true);
		cpu.run();
		assert.deepEqual(cpu.stack, [1234, 5678]);
	});
	it('pop to memory', function() {
		var ops = [
			{code: 2, argv: [1234]},
			{code: 3, argv: [0]},
			{code: 0, argv: []}
		];

		var cpu = new CPU(ops, true);
		cpu.run();
		assert.deepEqual(cpu.stack, []);
		assert.deepEqual(cpu.memory[0], 1234);
	});
	it('pop to reg', function() {
		var ops = [
			{code: 2, argv: [1234]},
			{code: 3, argv: [32768]},
			{code: 0, argv: []}
		];

		var cpu = new CPU(ops, true);
		cpu.run();
		assert.deepEqual(cpu.stack, []);
		assert.deepEqual(cpu.register[0], 1234);
	});
	it('eq', function() {
		var ops = [
			{code: 1, argv: [0, 1234]},
			{code: 1, argv: [1, 1234]},
			{code: 1, argv: [2, 5678]},
			{code: 4, argv: [32771, 32768, 32769]},
			{code: 4, argv: [32772, 32768, 32770]},
			{code: 0, argv: []}
		];

		var cpu = new CPU(ops, true);
		cpu.run();
		assert.deepEqual(cpu.register[3], 1);
		assert.deepEqual(cpu.register[4], 0);
	});
	it('gt', function() {
		var ops = [
			{code: 1, argv: [0, 1234]},
			{code: 1, argv: [1, 1234]},
			{code: 1, argv: [2, 5678]},
			{code: 5, argv: [32771, 32768, 32769]},
			{code: 5, argv: [32772, 32768, 32770]},
			{code: 5, argv: [32773, 2, 1]},
			{code: 0, argv: []}
		];

		var cpu = new CPU(ops, true);
		cpu.run();
		assert.deepEqual(cpu.register[3], 0);
		assert.deepEqual(cpu.register[4], 0);
		assert.deepEqual(cpu.register[5], 1);
	});
});