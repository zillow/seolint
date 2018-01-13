const ps = require('ps-node');
const colors = require('colors');

// Lookup phantomjs processes, and kill them by pid.
ps.lookup({ command: 'phantomjs' }, function(err, resultList) {
    if (err) {
        console.log(colors.red(err));
    }
    if (resultList.length > 0) {
        console.log('Killing hanging phantomjs processes:');
    } else {
        console.log('Nothing to kill.');
    }
    resultList.forEach(process => {
        if (process) {
            console.log('PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments);
            ps.kill(process.pid, error => {
                if (error) {
                    console.log(colors.red(error));
                } else {
                    console.log(colors.blue('Process %s has been killed!', process.pid));
                }
            });
        }
    });
});
