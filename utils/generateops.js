var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var utils = require('../lib/utils');

var bin = require.resolve('../bin/challenge.bin');
var output = path.resolve(__dirname, '../bin/instructions.txt');
fs.readFile(bin, function(err, content) {
    if (err) throw err;

    var numbers = utils.binary2numbers(content);
    var ops = utils.numbers2ops(numbers);
    var index = 0, instr, args; 
    var content = [];

    _.each(ops, function(op) {
        args = _.map(op.argv, getNumberName);
        if (op.code == 15) {
            args[1] = '[' + args[1] + ']';
        } else if (op.code == 16) {
            args[0] = '[' + args[0] + ']';
        }
        instr = getOpName(op.code) + ' ' + args.join(', ');
        content.push(index + ':\t' + instr);

        index += 1 + utils.code2argn(op.code);
    });
    fs.writeFileSync(output, content.join('\n'));
    console.log('...generated!');
});

var OP_NAMES = [
    // 0
    'halt', 'set', 'push', 'pop', 'eq',
    // 5
    'gt', 'jmp', 'jt', 'jf', 'add',
    // 10
    'mult', 'mod', 'and', 'or', 'not',
    // 15
    'rmem', 'wmem', 'call', 'ret', 'out',
    // 20
    'in', 'noop'
];
function getOpName(code) {
    return OP_NAMES[code] || code;
}

function getNumberName(number) {
    if (number < 32768) {
        return number;
    } else if (number < 32776) {
        return 'r' + (number - 32768);
    } else {
        throw new Error('invalid number: ' + number);
    }
}
