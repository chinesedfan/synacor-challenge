var debug = require('debug');
var callDebug = debug('call');
var retDebug = debug('ret');

var r0 = 4, r1 = 1, r7 = 0;
var stack = [];
var cache = [];

call6027();
console.log('...done with:', r0, r1, r7);

function call6027() {
    var key = getKey();
    if (onCallStart(key) === false) return;

    if (!r0) {
        r0 = r1 + 1;
        onCallEnd(key);
        return;
    }
p6035:
    if (!r1) {
        r0 = r0 - 1;
        r1 = r7;
        beforeCallSub(key);
        call6027();
        onCallEnd(key);
        return;
    }
p6048:
    stack.push(r0);
    r1 = r1 - 1;
    beforeCallSub(key);
    call6027();
    r1 = r0;
    r0 = stack.pop();
    r0 = r0 - 1;
    beforeCallSub(key);
    call6027();
    onCallEnd(key);
    return;
}
function getKey() {
    return r0 + '-' + r1;
}
function onCallStart(key) {
    if (typeof cache[key] === 'undefined') {
        cache[key] = {};
    } else {
        r0 = cache[key].r0;
        r1 = cache[key].r1;
        onCallEnd(key);
        return false;
    }
}
function onCallEnd(key) {
    cache[key].r0 = r0;
    cache[key].r1 = r1;

    retDebug('%s returns %d %d', key, r0, r1);
}
function beforeCallSub(key) {
    var subkey = getKey();
    if (!cache[key].children) {
        cache[key].children = [];
    } 
    cache[key].children.push(subkey);

    callDebug('%s calls %s', key, subkey);
}
