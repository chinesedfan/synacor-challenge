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
    if (typeof cache[key] !== 'undefined') {
        r0 = cache[key].r0;
        r1 = cache[key].r1;
        retDebug('%s returns %d %d', key, r0, r1);
        return;
    }

    if (!r0) {
        r0 = r1 + 1;
        retDebug('%s returns %d %d', key, r0, r1);
        updateCache(key);
        return;
    }
p6035:
    if (!r1) {
        r0 = r0 - 1;
        r1 = r7;
        callDebug('%s calls %s', key, getKey());
        call6027();
        retDebug('%s returns %d %d', key, r0, r1);
        updateCache(key);
        return;
    }
p6048:
    stack.push(r0);
    r1 = r1 - 1;
    callDebug('%s calls %s', key, getKey());
    call6027();
    r1 = r0;
    r0 = stack.pop();
    r0 = r0 - 1;
    callDebug('%s calls %s', key, getKey());
    call6027();
    retDebug('%s returns %d %d', key, r0, r1);
    updateCache(key);
    return;
}
function getKey() {
    return r0 + '-' + r1;
}
function updateCache(key) {
    cache[key] = {
        r0: r0,
        r1: r1
    };
}
