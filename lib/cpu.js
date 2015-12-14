function CPU(ops, debug) {
	this.memory = [];
	this.register = [0,0,0,0,0,0,0,0];
	this.stack = [];
	this.output = []; // for debug
	this.debug = debug;

	this.ops = ops;
	this.load();
	this.ip = 0;
	this.halt = false;
}

var fn = CPU.prototype;
fn.load = function() {
	var addr = 0, i, op, j;
	for (i = 0; i < this.ops.length; i++) {
		op = this.ops[i];
		this.memory[addr++] = op.code;
		for (j = 0; j < op.argv.length; j++) {
			this.memory[addr++] = op.argv[j];
		}
	}

	console.log('loaded ops: ' + this.ops.length);
	console.log('loaded memory: ' + addr);
};
fn.run = function() {
	var op;

	while (!this.halt) {
		op = this.ops[this.ip];
		try {
			this.execute(op);
		} catch (e) {
			console.log(this.ip, op);
			throw e;
		}
	}
};
fn.execute = function(op) {
	var a = op.argv[0],
		b = op.argv[1],
		c = op.argv[2];

	switch (op.code) {
	case 0: // halt
		this.halt = 1;
		break;
	case 1: // set reg[a] = b
		this.register[a] = b;
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
		this.write(a, this.memory[b]);
		break;
	case 16: // wmem b -> a
		this.write(a, b);
		break;
	case 17: // call
		this.stack.push(this.ip + 1);
		a = this.read(a);
		this.jump(a);
		return;
	case 18: // ret
		if (this.stack.length) {
			// because op index is pushed, pop directly
			this.ip = this.stack.pop();
		} else {
			this.halt = 1;
			return;
		}
		break;
	case 19: // out a
		var msg = String.fromCharCode(a);
		if (this.debug) {
			this.output.push(msg);
		} else {
			process.stdout.write(msg);
		}
		break;
	case 20: // in
		throw new Error('not implement IN');
		break;
	case 21: // noop
	default:
		break;
	}

	this.ip++;
};
fn.read = function(number) {
	if (number < 32767) {
		return number;
	} else if (number < 32776) {
		return this.register[number - 32768];
	} else {
		throw new Error('read invalid number: ' + number);
	}
};
fn.write = function(number, value) {
	value %= 32768;

	if (number < 32767) {
		this.memory[number] = value;
	} else if (number < 32776) {
		this.register[number - 32768] = value;
	} else {
		throw new Error('write invalid number: ' + number);
	}
};
fn.jump = function(addr) {
	// in real CPU, register IR records the memory address of next instruction
	// but for testing easier, my design accepts a list of op and keeps the index of ops
	// so here have to covert the memory address to op index
	var pos = 0;
	for (var i = 0; i < this.ops.length; i++) {
		if (pos == addr) break;
		pos += 1 + this.ops[i].argv.length;
	}
	if (pos != addr) {
		throw new Error('can not jump to memory: ' + addr);
	}
	this.ip = pos;
};

module.exports = {
	CPU: CPU,
	run: function(ops) {
		(new CPU(ops)).run();
	}
}