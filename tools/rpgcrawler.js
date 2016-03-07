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
 * - choice, which choice should be selected, default is 0
 */
var nodeMap = {};
var pathMap = {};
var nodeCount = 0;
var curNode;

startGame();

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
    app.stderr.on('data', function(data) {
        console.log(data);
        app.kill();
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
    } else if (matches = rTitle.exec(line)) {
        lineDebug('title');
        isMessage = true;

        curNode = {};
        curNode.title = matches[1];
        curNode.isDone = false;
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
        if (curNode.choice < curNode.exits.length) {
            nodeDebug('choice: ' + (curNode.choice + 1) + '/' + curNode.exits.length);
            originDebug('> ' + curNode.exits[curNode.choice]);
            app.stdin.write(curNode.exits[curNode.choice] + '\n');
        } else {
            throw new Error('the choice exceeds exits length:\n' + JSON.stringify(curNode, null, 4));
        }
        curNode.choice = curNode.choice + 1;
    }
}
