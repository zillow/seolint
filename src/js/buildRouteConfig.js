const _ = require('lodash');
const { resolveURL } = require('./urlHelpers');

module.exports = config => {
    if (config.urls) {
        return config.urls.reduce((result, value) => {
            let url = value;
            let urlConfig = {};

            // URLs can come in the form of an object or string
            if (_.isPlainObject(value)) {
                url = value.url;
                urlConfig = { ...value };
                delete urlConfig.url;
            }

            // Resolve all the urls to the specified hostname
            if (config.hostname) {
                url = resolveURL(url, config.hostname);
            }

            result[url] = urlConfig;
            return result;
        }, {});
    }
    return {};
};
