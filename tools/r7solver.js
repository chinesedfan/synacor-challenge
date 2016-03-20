if (require.main.filename == __filename) {
    init();
}

function init() {
    for (var i = 1, max = 0x7fff; i < max; i++) {
        var y = f41(i);
        if (!(i & 0xff)) {
            console.log('if r7 = %d, then f(4, 1) = %d', i, y);
        }
        if (y == 6) console.log(i);
    }
    console.log('...done!');
}

function f41(r7) {
    return f3(f3(r7, r7), r7);
}
function f3(b, r7) {
    var d1 = pow(r7 + 1, b, 0x8000);
    var d2 = pow(r7 + 1, b, r7 * 0x8000);
    d2--;
    if (d2 == -1) d2 = r7 - 1;

    var ret = d1 * ((r7 + 1) * (r7 + 1) + r7) + d2 / r7 * (2 * r7 + 1);
    return ret & 0x7fff;
}
function pow(base, exp, div) {
    var ret = 1;
    for (var i = 0, max = exp; i < max; i++) {
        ret *= base;
        ret %= div;
    }
    return ret;
}

module.exports = {
    f3: f3,
    f41: f41
};
