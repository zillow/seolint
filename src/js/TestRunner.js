const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const util = require('util');

const RULES_DIR = path.join(__dirname, '../rules');

function TestRunner({ routeConfig }) {
    this.routeConfig = routeConfig || {};
    this.successCount = 0;
    this.failCount = 0;
    this.rules = [];
    this.loadRules(RULES_DIR);
}

util.inherits(TestRunner, EventEmitter);

/**
 * Run all rules on the given pages.
 *
 * @param pages Pages returned by Crawler.crawl
 */
TestRunner.prototype.run = function(pages) {
    this.emit('testingBegin');

    _.forEach(pages, ({ client, server }, url) => {
        this.emit('pageBegin', url);

        this.rules.forEach(rule => {
            this.emit('ruleBegin', url, rule.name);

            const config = this.routeConfig[rule.name] || {};

            let parserFn = rule.parser;
            let parserOverride = false;
            if (config.parser) {
                parserFn = config.parser;
                parserOverride = true;
            }

            let validatorFn = rule.validator;
            let validatorOverride = false;
            if (config.validator) {
                validatorFn = config.validator;
                validatorOverride = true;
            }

            // Parse the pages for validation data
            const parsed = parserFn({ url, client, server }, config.options);

            let error;
            try {
                validatorFn(parsed, config.options);
                this.successCount += 1;
            } catch (e) {
                this.failCount += 1;
                error = e;
            }

            this.emit('ruleEnd', url, rule.name, error, parserOverride, validatorOverride);
        });
    });

    this.emit('testingEnd', this.successCount, this.failCount);
};

/**
 * Load rule definitions into the test runner
 *
 * @param dir {string} The directory path
 */
TestRunner.prototype.loadRules = function(dir) {
    try {
        const rules = fs
            .readdirSync(dir)
            .map(ruleName => {
                const filePath = path.join(dir, ruleName);
                const stats = fs.statSync(filePath);
                if (stats.isFile()) {
                    // eslint-disable-next-line import/no-dynamic-require
                    const rule = require(filePath);
                    rule.name = ruleName;
                    return rule;
                }
                return null;
            })
            .filter(t => t);
        this.rules.push(...rules);
    } catch (e) {
        if (process.env.NODE_ENV === 'development') {
            console.log(e);
        }
        throw new Error(`Failed to load SEO rules: ${e}`);
    }
};

module.exports = TestRunner;
