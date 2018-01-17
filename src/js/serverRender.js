const request = require('request');

module.exports = url => {
    return new Promise((resolve, reject) => {
        request({ url }, (error, response, body) => {
            if (error) {
                reject(error);
            }
            resolve({ content: body, response });
        });
    });
};
