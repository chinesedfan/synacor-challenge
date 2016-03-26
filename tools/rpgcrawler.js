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

var rNodeTitle = /node\.id=(\S+)/;
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
 * - internalId, consists of a special memory value and registers
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

var app;

startGame();
process.on('uncaughtException', function(err) {
    if (err instanceof GameError) {
        pathDebug('%s: %s', err.type, err.message);
        app.kill();
        
        if (err.type == 'error') return;
    } else {
        console.log(err.stack);
        return;
    }

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
                internalId: node.internalId,
                message: node.message
            };
            console.log('%d: %s,', node.id, JSON.stringify(data));
        });
    }
});

function startGame() {
    var bufferList = [];
    var timer;

    app = spawn('node', ['../index.js', '../bin/challenge.bin'], {
        env: _.extend({}, process.env, {
            DEBUG: 'node',
            DEBUG_FD: 1
        }),
        cwd: __dirname
    });
    app.stdout.on('data', function(data) {
        clearTimeout(timer);
        if (app.killed) return;

        var start = 0;
        _.each(data, function(byte, i) {
            if (byte == 10) {
                bufferList.push(data.slice(start, i));
                dispatchLine(Buffer.concat(bufferList).toString());

                bufferList = [];
                start = i + 1;
            } if (i == data.length - 1) {
                bufferList.push(data.slice(start));
            }
        });

        timer = setTimeout(function() {
            updatePath(curNode, -1);
            throw new GameError('abort', 'you may died');
        }, 2000);
    });
}

function updatePath(node, tid) {
    if (!node) return;

    if (_.isUndefined(node.tos[node.exitIndex])) {
        pathDebug('found: %d[%d] = %d', node.id, node.exitIndex, tid);
        node.tos[node.exitIndex] = tid;
    } else if (node.tos[node.exitIndex] != tid) {
        throw new GameError('error', 'path conflict');
    }
}

function dispatchLine(line) {
    var matches;
    originDebug(line);

    if (line == "I don't understand; try 'help' for instructions.") {
        throw new GameError('error', 'wrong input: ' + curInput);
    }

    if (isMessage) {
        lineDebug('message');
        isMessage = false;

        curNode.message = line;
    } else if (matches = rNodeTitle.exec(line)) {
        lineDebug('node title');

        prevNode = curNode;
        if (nodeMap[matches[1]]) {
            curNode = nodeMap[matches[1]];
        } else {
            curNode = {
                id: nodeCount++,
                internalId: matches[1],
                isDone: false,
                tos: [],
                choice: 0
            };
            nodeMap[matches[1]] = curNode;
        }
        nodeDebug('at: ' + curNode.id);

        updatePath(prevNode, curNode.id);
    } else if (matches = rTitle.exec(line)) {
        lineDebug('title');
        isMessage = true;

        curNode.title = matches[1];
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
                throw new GameError('abort', 'no un-selected exit exists');
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

function GameError(type, msg) {
    this.type = type;
    this.message = msg;
}
