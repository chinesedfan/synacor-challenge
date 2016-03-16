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
var rThingTitle = /^Things of interest here:$/;
var rExitTitle = /^There are (\d+) exits:|There is (1) exit:$/;
var rItem = /^- (.+)$/;
var rInput = /^What do you do\?$/;
var isMessage = false; // the next line is message
var isThingList = false; // the thing list begins
var isExitList = false; // the exit list begins

/**
 * For each node, it stands for a status of the game.
 * - title, indicates where you are
 * - message, the main detail information
 * - things, the array of interest thing
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
    } else {
        _.each(nodeMap, function(node, message) {
            var data = {
                children: node.tos,
                exits: node.exits,
                things: node.things,
                title: node.title,
                message: node.message
            };
            console.log('%d: %s,', node.id, JSON.stringify(data));
        });
    }
});

function startGame() {
    var bufferList = [];
    var app = spawn('node', ['../index.js', '../bin/challenge.bin'], {
        cwd: __dirname
    });
    var timer;

    app.stdout.on('data', function(data) {
        clearTimeout(timer);
        if (app.killed) return;

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

        timer = setTimeout(function() {
            updatePath(app, curNode, -1);
            throw new GameError(app, 'abort', 'you may died');
        }, 2000);
    });
}

function updatePath(app, node, tid) {
    if (!node) return;

    if (_.isUndefined(node.tos[node.exitIndex])) {
        pathDebug('found: %d[%d] = %d', node.id, node.exitIndex, tid);
        node.tos[node.exitIndex] = tid;
    } else if (node.tos[node.exitIndex] != tid) {
        throw new GameError(app, 'error', 'path conflict');
    }
}

function dispatchLine(app, line) {
    var matches;
    originDebug(line);

    if (line == "I don't understand; try 'help' for instructions.") {
        throw new GameError(app, 'error', 'wrong input: ' + curInput);
    }

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

        updatePath(app, prevNode, curNode.id);
    } else if (matches = rTitle.exec(line)) {
        lineDebug('title');
        isMessage = true;

        prevNode = curNode;
        curNode = {};
        curNode.title = matches[1];
        curNode.isDone = false;
        curNode.tos = [];
        curNode.choice = 0;
    } else if (matches = rThingTitle.exec(line)) {
        lineDebug('thing title');
        isThingList = true;
        if (curNode.isDone) return;
        curNode.things = [];
    } else if (matches = rExitTitle.exec(line)) {
        lineDebug('exit title');
        isExitList = true;
        if (curNode.isDone) return;
        curNode.exits = [];
    } else if (matches = rItem.exec(line)) {
        if (isExitList) {
            lineDebug('exit item');
            !curNode.isDone && curNode.exits.push(matches[1]);
        } else if (isThingList) {
            lineDebug('thing item');
            !curNode.isDone && curNode.things.push(matches[1]);
        }
    } else if (matches = rInput.exec(line)) {
        lineDebug('input');
        isThingList = false;
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
            curInput = curInput || [];
            curInput.push(curNode.exitIndex);
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
