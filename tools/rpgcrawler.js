var spawn = require('child_process').spawn;
var _ = require('lodash');

/**
 * Debug options:
 * - line, output the line type, like `title`/`message` and so on
 * - node, output the state and the choice
 * - origin, the origin message
 */
var debug = require('debug');
var lineDebug = debug('line');
var nodeDebug = debug('node');
var pathDebug = debug('path');
var originDebug = debug('origin');

var rTitle = /^== (.+) ==$/;
var rExitTitle = /^There are (\d+) exits:|There is (1) exit:$/;
var rExitItem = /^- (.+)$/;
var rInput = /^What do you do\?$/;
var isMessage = false; // the next line is message
var isExitList = false; // the exit list begins

/**
 * For each node, it stands for a status of the game.
 * - title, indicates where you are
 * - message, the main detail information
 * - exits, the array of possible choices
 *
 * - id, the unique id, starts from 0
 * - isDone, whether all information has been collected
 * - tos, the array of node id corresponding to `exits`
 * - exitIndex, which choice has just been selected, default is 0
 */
var nodeMap = {};
var nodeCount = 0;
var curNode;
var prevNode;

/**
 * For each input, it is a list of `exit index`
 */
var inputList = [];
var curInput;
var curInputPos = 0;

startGame();
process.on('uncaughtException', function(err) {
    pathDebug('%s: %s', err.type, err.message);
    err.app.kill();
    if (err.type === 'error') return;

    if (inputList.length) {
        curNode = null;
        curInput = inputList.shift();
        curInputPos = 0;
        startGame();
    }
});

function startGame() {
    var bufferList = [];
    var app = spawn('node', ['../index.js', '../bin/challenge.bin'], {
        cwd: __dirname
    });

    app.stdout.on('data', function(data) {
        var start = 0;
        _.each(data, function(byte, i) {
            if (byte == 10) {
                bufferList.push(data.slice(start, i));
                dispatchLine(app, Buffer.concat(bufferList).toString());

                bufferList = [];
                start = i + 1;
            } if (i == data.length - 1) {
                bufferList.push(data.slice(start));
            }
        });
    });
}

function dispatchLine(app, line) {
    var matches;

    originDebug(line);
    if (isMessage) {
        lineDebug('message');
        isMessage = false;

        if (nodeMap[line]) {
            curNode = nodeMap[line];
        } else {
            nodeMap[line] = curNode;
            curNode.id = nodeCount++;
            curNode.message = line;
        }
        nodeDebug('at: ' + curNode.id);

        if (!prevNode) return;
        if (_.isUndefined(prevNode.tos[prevNode.exitIndex])) {
            pathDebug('found: %d[%d] = %d', prevNode.id, prevNode.exitIndex, curNode.id);
            prevNode.tos[prevNode.exitIndex] = curNode.id;
        } else if (prevNode.tos[prevNode.exitIndex] != curNode.id) {
            throw new GameError(app, 'error', 'path conflict');
        }
    } else if (matches = rTitle.exec(line)) {
        lineDebug('title');
        isMessage = true;

        prevNode = curNode;
        curNode = {};
        curNode.title = matches[1];
        curNode.isDone = false;
        curNode.tos = [];
        curNode.choice = 0;
    } else if (matches = rExitTitle.exec(line)) {
        lineDebug('exit title');
        isExitList = true;
        if (curNode.isDone) return;
        curNode.exits = [];
    } else if (matches = rExitItem.exec(line)) {
        if (!isExitList) return;
        lineDebug('exit item');
        if (curNode.isDone) return;
        curNode.exits.push(matches[1]);
    } else if (matches = rInput.exec(line)) {
        lineDebug('input');
        isExitList = false;
        curNode.isDone = true;

        if (curInput && curInput.length && curInputPos < curInput.length) {
            curNode.exitIndex = curInput[curInputPos];
        } else {
            var hasFound = false;
            _.each(curNode.exits, function(val, i) {
                if (!_.isUndefined(curNode.tos[i])) return;
                if (!hasFound) {
                    hasFound = true;
                    curNode.exitIndex = i;

                    curInput = curInput || [];
                    curInput.push(i);
                } else {
                    var newInput = curInput ? _.clone(curInput) : [];
                    newInput.push(i);

                    pathDebug('new: ' + newInput);
                    inputList.push(newInput);
                }
            });
            if (!hasFound) {
                throw new GameError(app, 'abort', 'no un-selected exit exists');
            }
        }
        curInputPos++;
        nodeDebug('choice: %d/%d', (curNode.exitIndex + 1), curNode.exits.length);

        var choice = curNode.exits[curNode.exitIndex];
        originDebug('> ' + choice);
        app.stdin.write(choice + '\n');
    }
}

function GameError(app, type, msg) {
    this.app = app;
    this.type = type;
    this.message = msg;
}
