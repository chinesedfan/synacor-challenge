function CPU(ops, debug) {
	this.memory = [];
	this.register = [0,0,0,0,0,0,0,0];
	this.stack = [];
	this.output = []; // for debug
	this.debug = debug;

	this.ops = ops;
	this.ip = 0;
	this.halt = false;
}

var fn = CPU.prototype;
fn.run = function() {
	var op;

	while (!this.halt) {
		op = this.ops[this.ip];
		this.execute(op);
	}
};
fn.execute = function(op) {
	switch (op.code) {
	case 0: // halt
		this.halt = 1;
		break;
	case 19: // out a
		var msg = String.fromCharCode(op.argv[0]);
		if (this.debug) {
			this.output.push(msg);
		} else {
			console.log(msg);
		}
		break;
	case 21: // noop
	default:
		break;
	}

	this.ip++;
};

module.exports = {
	CPU: CPU,
	run: function(ops) {
		(new CPU(ops)).run();
	}
}