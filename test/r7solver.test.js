var assert = require('assert');
var solver = require('../tools/r7solver');

var r7;

describe('f3', function() {
    describe('if r7 = 1', function() {
        beforeEach(function() {
            r7 = 1;
        });
        it('then f(3, 0) = 5', function() {
            assert.equal(solver.f3(0, r7), 5);
        });
        it('then f(3, 1) = 13', function() {
            assert.equal(solver.f3(1, r7), 13);
        });
    });
    describe('if r7 = 2', function() {
        beforeEach(function() {
            r7 = 2;
        });
        it('then f(3, 0) = 11', function() {
            assert.equal(solver.f3(0, r7), 11);
        });
        it('then f(3, 1) = 38', function() {
            assert.equal(solver.f3(1, r7), 38);
        });
        it('then f(3, 2) = 119', function() {
            assert.equal(solver.f3(2, r7), 119);
        });
        it('then f(3, 5) = 3278', function() {
            assert.equal(solver.f3(5, r7), 3278);
        });
    });
});
