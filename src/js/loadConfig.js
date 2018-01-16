const path = require('path');

module.exports = function(filename) {
    let filepath = filename;
    if (!path.isAbsolute(filepath)) {
        filepath = path.join(process.cwd(), filename);
    }
    try {
        return require(filepath); // eslint-disable-line import/no-dynamic-require
    } catch (e) {
        if (process.env.NODE_ENV === 'development') {
            console.log(e);
        }
        throw new Error(`Invalid config file: ${filename}`);
    }
};
