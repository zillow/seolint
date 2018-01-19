const resolveFilePath = require('./resolveFilePath');

module.exports = function(filename) {
    try {
        return require(resolveFilePath(filename)); // eslint-disable-line import/no-dynamic-require
    } catch (e) {
        if (process.env.NODE_ENV === 'development') {
            console.log(e);
        }
        throw new Error(`Invalid config file: ${filename}`);
    }
};
