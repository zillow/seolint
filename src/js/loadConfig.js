const path = require('path');

module.exports = function(filename) {
    const resolved = path.join(process.cwd(), filename);
    try {
        return require(resolved); // eslint-disable-line import/no-dynamic-require
    } catch (e) {
        throw new Error(`Invalid config file: ${filename}`);
    }
};
