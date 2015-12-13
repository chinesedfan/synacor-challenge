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
	it('simple add/mult/mod/and/or/not', function() {
		var ops = [
			{code: 9, argv: [32768, 1, 2]},
			{code: 10, argv: [32769, 1, 2]},
			{code: 11, argv: [32770, 1, 2]},
			{code: 12, argv: [32771, 1, 2]},
			{code: 13, argv: [32772, 1, 2]},
			{code: 14, argv: [32773, 1]},
			{code: 0, argv: []}
		];

		var cpu = new CPU(ops, true);
		cpu.run();
		assert.deepEqual(cpu.register, [3, 2, 1, 0, 3, 32766, 0, 0]);
	});
	it('overflow add', function() {
		var ops = [
			{code: 9, argv: [32768, 123, 32768]},
			{code: 0, argv: []}
		];

		var cpu = new CPU(ops, true);
		cpu.run();
		assert.deepEqual(cpu.register[0], 123);
	});
	it('wmem/rmem', function() {
		var ops = [
			{code: 16, argv: [0, 1234]},
			{code: 15, argv: [1, 0]},
			{code: 0, argv: []}
		];

		var cpu = new CPU(ops, true);
		cpu.run();
		assert.deepEqual(cpu.memory[0], 1234);
		assert.deepEqual(cpu.memory[1], 1234);
	});
});