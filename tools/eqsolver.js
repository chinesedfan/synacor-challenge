var _ = require('lodash');

var numbers = [2, 3, 5, 7, 9];
var isSolved = _.any(permutations(numbers), function(arr) {
    if (isEq.apply(this, arr)) {
        console.log('...solved: ' + arr);
        return true;
    }
    return false;
});
if (!isSolved) {
    console.log('...failed to solve.');
}

function isEq(a, b, c, d, e) {
    // _ + _ * _^2 + _^3 - _ = 399
    return (a + b * c * c + d * d * d - e) == 399;
}
function permutations(arr) {
    if (arr.length == 1) {
        return [arr];
    }

    var result = [];
    _.each(arr, function(x, i) {
        swap(arr, 0, i);
        _.each(permutations(arr.slice(1)), function(rest) {
            result.push([x].concat(rest));
        });
    });
    return result;
}
function swap(arr, i, j) {
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}
