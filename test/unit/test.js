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
		var numbers = [
			21,
			19, 97,
			0
		];

		var cpu = new CPU(numbers, {async: true});
		cpu.run();
		assert.deepEqual(cpu.output, ['a']);
	});
	it('set', function() {
		var numbers = [
			1, 32768, 1234,
			0
		];

		var cpu = new CPU(numbers, {async: true});
		cpu.run();
		assert.deepEqual(cpu.register[0], 1234);
	});
	it('push number', function() {
		var numbers = [
			2, 1234,
			0
		];

		var cpu = new CPU(numbers, {async: true});
		cpu.run();
		assert.deepEqual(cpu.stack, [1234]);
	});
	it('push reg', function() {
		var numbers = [
			2, 1234,
			1, 32768, 5678,
			2, 32768,
			0
		];

		var cpu = new CPU(numbers, {async: true});
		cpu.run();
		assert.deepEqual(cpu.stack, [1234, 5678]);
	});
	it('pop to memory', function() {
		var numbers = [
			2, 1234,
			3, 0,
			0
		];

		var cpu = new CPU(numbers, {async: true});
		cpu.run();
		assert.deepEqual(cpu.stack, []);
		assert.deepEqual(cpu.memory[0], 1234);
	});
	it('pop to reg', function() {
		var numbers = [
			2, 1234,
			3, 32768,
			0
		];

		var cpu = new CPU(numbers, {async: true});
		cpu.run();
		assert.deepEqual(cpu.stack, []);
		assert.deepEqual(cpu.register[0], 1234);
	});
	it('eq', function() {
		var numbers = [
			1, 32768, 1234,
			1, 32769, 1234,
			1, 32770, 5678,
			4, 32771, 32768, 32769,
			4, 32772, 32768, 32770,
			0
		];

		var cpu = new CPU(numbers, {async: true});
		cpu.run();
		assert.deepEqual(cpu.register[3], 1);
		assert.deepEqual(cpu.register[4], 0);
	});
	it('gt', function() {
		var numbers = [
			1, 0, 1234,
			1, 1, 1234,
			1, 2, 5678,
			5, 32771, 32768, 32769,
			5, 32772, 32768, 32770,
			5, 32773, 2, 1,
			0
		];

		var cpu = new CPU(numbers, {async: true});
		cpu.run();
		assert.deepEqual(cpu.register[3], 0);
		assert.deepEqual(cpu.register[4], 0);
		assert.deepEqual(cpu.register[5], 1);
	});
	it('simple add/mult/mod/and/or/not', function() {
		var numbers = [
			9, 32768, 1, 2,
			10, 32769, 1, 2,
			11, 32770, 1, 2,
			12, 32771, 1, 2,
			13, 32772, 1, 2,
			14, 32773, 1,
			0
		];

		var cpu = new CPU(numbers, {async: true});
		cpu.run();
		assert.deepEqual(cpu.register, [3, 2, 1, 0, 3, 32766, 0, 0]);
	});
	it('overflow add', function() {
		var numbers = [
			9, 32768, 123, 32768,
			0
		];

		var cpu = new CPU(numbers, {async: true});
		cpu.run();
		assert.deepEqual(cpu.register[0], 123);
	});
	it('wmem/rmem', function() {
		var numbers = [
			16, 0, 1234,
			15, 1, 0,
			0
		];

		var cpu = new CPU(numbers, {async: true});
		cpu.run();
		assert.deepEqual(cpu.memory[0], 1234);
		assert.deepEqual(cpu.memory[1], 1234);
	});
});
