var spawn = require('child_process').spawn;
var _ = require('lodash');

var app = spawn('node', ['../index.js', '../bin/challenge.bin'], {
    cwd: __dirname
});
var bufferList = [];

app.stdout.on('data', function(data) {
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
});
app.stderr.on('data', function(data) {
    console.log(data);
});

function dispatchLine(line) {
    console.log('> ', line);
}
