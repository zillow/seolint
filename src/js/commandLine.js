const _ = require('lodash');
const loadConfig = require('./loadConfig');

const CLI_OPTIONS = {
    config: {
        alias: 'c',
        description: 'A JavaScript or JSON configuration file',
        requiresArg: true,
        type: 'string'
    },
    hostname: {
        description: 'URLs are run with the specified hostname (e.g. https://localhost:8443/)',
        type: 'string'
    },
    disablePhantomPool: {
        description:
            'A pool of phantom processes is used for faster client rendering. You can try disabling this if you are experiencing problems.',
        type: 'boolean',
        default: false
    },
    kill: {
        alias: 'k',
        description: 'Kill hanging phantom processes',
        type: 'boolean'
    }
};

/**
 * Preprocessor for CLI_OPTIONS
 */
function getYargsOptions() {
    return _.mapValues(CLI_OPTIONS, option => {
        const defaultValue = option.default;
        const derivedType = typeof defaultValue;

        // Remove default values for all keys. We do this so that we can
        // differentiate between values that were set on the command line vs
        // values that were not set at all.
        const config = _.omit(option, 'default');

        // Add description for the default value
        if ('default' in option && !('defaultDescription' in option)) {
            config.defaultDescription = `${defaultValue}`;
            if (derivedType === 'string') {
                config.defaultDescription = `"${defaultValue}"`;
            }
        }

        // Booleans need to have their default set to undefined so that the yargs does
        // not implicitly set it to false.
        if (derivedType === 'boolean') {
            config.default = undefined;
        }

        // Add the requiresArg constraint for non-booleans
        if (!('requiresArg' in option) && option.type && option.type !== 'boolean') {
            config.requiresArg = true;
        }

        return config;
    });
}

function getDefaultValues() {
    return _.mapValues(CLI_OPTIONS, option => option.default);
}

const yargs = require('yargs')
    .wrap(null)
    .usage(`Usage:\n  $0 [options] [urls ...]`)
    .example('$0 https://www.zillow.com/', 'Run on a single url')
    .example(
        '$0 https://www.zillow.com/mortgage-calculator/ https://www.zillow.com/mortgage-rates/',
        'Run with the provided urls'
    )
    .example('$0 --config examples/mortgage.seolint.js', 'Run with the provided configuration file')
    .help()
    .alias('help', 'h')
    .options(getYargsOptions());

module.exports = {
    parse: (argv = process.argv) => {
        // Omit undefined properties so they do not later override config file options
        const options = _.omitBy(yargs.parse(argv), _.isUndefined);

        // Options from config file
        let fileConfig = {};
        if (options.config) {
            try {
                fileConfig = loadConfig(options.config);
            } catch (e) {
                return { error: e.message };
            }
        }

        const config = {
            ...getDefaultValues(),
            ...fileConfig,
            // Omit noisy cli options
            ..._.omit(options, ['_', '$0', 'c', 'config'])
        };

        // Command line urls
        const urls = options._.slice(2);
        if (urls.length) {
            config.urls = urls;
        }

        // Only return config properties that have a value
        return _.omitBy(config, v => !v);
    },

    showHelp: () => {
        yargs.showHelp();
    }
};
