if (require.main.filename == __filename) {
    init();
}

function init() {
    for (var i = 0, max = 1; i < max; i++) {
        var y = f41(i);
        if (y == 6) console.log(i);
    }
    console.log('...done!');
}

function f41(r7) {
    return f3(f3(r7, r7), r7);
}
function f3(b, r7) {
    var d = Math.pow(r7 + 1, b);
    return d * ((r7 + 1) * (r7 + 1) + r7) + (d - 1) / r7 * (2 * r7 + 1);
}

module.exports = {
    f3: f3,
    f41: f41
};
