const path = require('path');

module.exports = function(filepath) {
    let resolved = filepath;
    if (!path.isAbsolute(resolved)) {
        resolved = path.join(process.cwd(), filepath);
    }
    return resolved;
};
