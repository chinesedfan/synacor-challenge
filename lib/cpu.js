var readline = require('readline');
var utils = require('./utils');

function CPU(numbers, options) {
	this.memory = numbers;
	this.register = [0,0,0,0,0,0,0,0];
	this.stack = [];

	this.options = options || {};
	// if options.async is set, then cache outputs here
	this.output = [];

	this.ip = 0;
	this.halt = false;
}

var fn = CPU.prototype;
fn.run = function() {
	var code, argn, params;

	while (!this.halt) {
		code = this.memory[this.ip];
		argn = utils.code2argn(code);
		params = this.memory.slice(this.ip, this.ip + 1 + argn);
		try {
			this.execute.apply(this, params);
		} catch (e) {
			this.dump();
			throw e;
		}
	}
};
fn.dump = function() {
    console.log('=== Dump Info ===')
    console.log('ip:', this.ip);
	console.log('register:', this.register);
};
fn.execute = function(code, a, b, c) {
	switch (code) {
	case 0: // halt
		this.halt = 1;
		break;
	case 1: // set a = b
        b = this.read(b);
		this.write(a, b);
		break;
	case 2: // push a
		a = this.read(a);
		this.stack.push(a);
		break;
	case 3: // pop -> a
		if (!this.stack.length) {
			throw new Error('empty stack can not pop!');
		}
		this.write(a, this.stack.pop());
		break;
	case 4: // a = (b eq c)
		b = this.read(b);
		c = this.read(c);
		this.write(a, b == c ? 1 : 0);
		break;
	case 5: // a = (b gt c)
		b = this.read(b);
		c = this.read(c);
		this.write(a, b > c ? 1 : 0);
		break;
	case 6: // jmp a
		a = this.read(a);
		this.jump(a);
		return;
	case 7: // jt b if a != 0
		a = this.read(a);
		if (a != 0) {
			b = this.read(b);
			this.jump(b);
			return;
		}
		break;
	case 8: // jf b if a == 0
		a = this.read(a);
		if (a == 0) {
			b = this.read(b);
			this.jump(b);
			return;
		}
		break;
	case 9: // a = (b add c)
		b = this.read(b);
		c = this.read(c);
		this.write(a, b + c);
		break;
	case 10: // a = (b mult c)
		b = this.read(b);
		c = this.read(c);
		this.write(a, b * c);
		break;
	case 11: // a = (b mod c)
		b = this.read(b);
		c = this.read(c);
		this.write(a, b % c);
		break;
	case 12: // a = (b and c)
		b = this.read(b);
		c = this.read(c);
		this.write(a, b & c);
		break;
	case 13: // a = (b or c)
		b = this.read(b);
		c = this.read(c);
		this.write(a, b | c);
		break;
	case 14: // a = not b
		b = this.read(b);
		this.write(a, 0x7fff & ~b);
		break;
	case 15: // rmem b -> a
		b = this.read(b);
		this.write(a, this.memory[b]);
		break;
	case 16: // wmem b -> a
		a = this.read(a);
		b = this.read(b);
		this.write(a, b);
		break;
	case 17: // call
		this.stack.push(this.ip + arguments.length);
		a = this.read(a);
		this.jump(a);
		return;
	case 18: // ret
		if (this.stack.length) {
            this.jump(this.stack.pop());
		} else {
			this.halt = 1;
		}
		return;
	case 19: // out a
		var msg = String.fromCharCode(this.read(a));
		if (this.options.async) {
			this.output.push(msg);
		} else {
			process.stdout.write(msg);
		}
		break;
	case 20: // in a
        this.halt = 1;
        this.rl = readline.createInterface({
            input: process.stdin
        }).on('line', (function(line) {
            this.write(a, line.length ? line.charCodeAt(0) : 10);
            this.rl.close();
            this.halt = 0;
            this.run();
        }).bind(this));
		break;
	case 21: // noop
	default:
		break;
	}

	this.ip += arguments.length;
};
fn.read = function(number) {
	if (number < 32768) {
		return number;
	} else if (number < 32776) {
		return this.register[number - 32768];
	} else {
		throw new Error('read invalid number: ' + number);
	}
};
fn.write = function(number, value) {
	value %= 32768;

	if (number < 32768) {
		this.memory[number] = value;
	} else if (number < 32776) {
		this.register[number - 32768] = value;
	} else {
		throw new Error('write invalid number: ' + number);
	}
};
fn.jump = function(addr) {
	this.ip = addr;
};

module.exports = {
	CPU: CPU,
	run: function(binary) {
		var numbers = utils.binary2numbers(binary);
		(new CPU(numbers)).run();
	}
}