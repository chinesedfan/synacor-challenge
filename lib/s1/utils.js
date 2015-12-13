function code2argn(code) {
	switch (code) {
	case 2:
	case 3:
	case 6:
	case 17:
	case 19:
	case 20:
		return 1;
	case 1:
	case 7:
	case 8:
	case 14:
	case 15:
	case 16:
		return 2;
	case 4:
	case 5:
	case 9:
	case 10:
	case 11:
	case 12:
	case 13:
		return 3;
	case 0:
	case 18:
	case 21:
	default:
		return 0;
	}
}

module.exports = {
	binary2numbers: function(data) {
		var i, number, ret = [];

		for (i = 0; i < data.length; i += 2) {
			number = data.charCodeAt(i) | (data.charCodeAt(i+1) << 8);
		}

		return ret;
	},
	numbers2ops: function(numbers) {
		var i = 0,
			code, argn,
			ops = [];

		while (numbers.length) {
			code = numbers.shift();

			argn = code2argn(code);
			ops.push({
				code: code,
				argv: numbers.splice(0, argn)
			});
		}
		return ops;
	}
};