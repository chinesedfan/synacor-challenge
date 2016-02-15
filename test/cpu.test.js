var assert = require('assert');
var CPU = require('../lib/cpu').CPU;

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
	describe('wmem/rmem', function() {
		it('rmem r0, [843];', function() {
			var numbers = [
				15, 32768, 843,
				0
			];

			var cpu = new CPU(numbers, {async: true});
			cpu.memory[843] = 20000;
			cpu.run();
			assert.deepEqual(cpu.register[0], 20000);
		});
		it('add r2, 843, 1; rmem r0, [r2];', function() {
			var numbers = [
				9, 32770, 843, 1,
				15, 32768, 32770,
				0
			];

			var cpu = new CPU(numbers, {async: true});
			cpu.memory[844] = 10000;
			cpu.run();
			assert.deepEqual(cpu.register[2], 844);
			assert.deepEqual(cpu.register[0], 10000);
		});
		it('set r0, 843; wmem [r0], 30000; rmem r2, [r0];', function() {
			var numbers = [
				1, 32768, 843,
				16, 32768, 30000,
				15, 32770, 32768,
				0
			];

			var cpu = new CPU(numbers, {async: true});
			cpu.run();
			assert.deepEqual(cpu.register[0], 843);
			assert.deepEqual(cpu.register[2], 30000);
			assert.deepEqual(cpu.memory[843], 30000);
		});
	});
});
