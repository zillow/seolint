const _ = require('lodash');
const { resolveURL } = require('./urlHelpers');

const getLevel = level => {
    if (level === 'error') {
        return 2;
    } else if (level === 'warn') {
        return 1;
    } else if (level === 'off') {
        return 0;
    } else if (typeof level === 'number') {
        return level;
    }
    throw new Error('unknown level');
};

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

            // Merge global and local rules, local rules take precedence
            const configRules = config.rules || {};
            const urlRules = urlConfig.rules || {};
            urlConfig.rules = _.mapValues({ ...configRules, ...urlRules }, val => {
                let res = val;

                // Use object form for all rules
                if (!_.isPlainObject(val)) {
                    res = { level: val };
                }

                // Always use number levels, or omit
                try {
                    res.level = getLevel(res.level);
                } catch (e) {
                    delete res.level;
                }

                return res;
            });

            // Remove empty rules
            urlConfig.rules = _.reduce(
                urlConfig.rules,
                (res, val, key) => {
                    if (!_.isEmpty(val)) {
                        res[key] = val;
                    }
                    return res;
                },
                {}
            );

            // Remove altogether if there are no rules
            if (_.isEmpty(urlConfig.rules)) {
                delete urlConfig.rules;
            }

            result[url] = urlConfig;
            return result;
        }, {});
    }
    return {};
};
