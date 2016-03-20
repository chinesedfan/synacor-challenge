var r0 = 4, r1 = 1, r7 = 0;
var stack = [];

call6027();
console.log('...done with:', r0, r1, r7);

function call6027() {
    if (!r0) {
        r0 = r1 + 1;
        return;
    }
p6035:
    if (!r1) {
        r0 = r0 - 1;
        r1 = r7;
        call6027();
        return;
    }
p6048:
    stack.push(r0);
    r1 = r1 - 1;
    call6027();
    r1 = r0;
    r0 = stack.pop();
    r0 = r0 - 1;
    call6027();
    return;
}
