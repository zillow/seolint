const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const util = require('util');

const RULES_DIR = path.join(__dirname, '../rules');

function TestRunner({ routeConfig }) {
    this.routeConfig = routeConfig || {};
    this.successCount = 0;
    this.warningCount = 0;
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
    const results = {};
    const errors = [];
    const warnings = [];

    _.forEach(pages, ({ client, server }, url) => {
        this.emit('pageBegin', url);
        results[url] = {};

        this.rules.forEach(rule => {
            const urlConfig = this.routeConfig[url] || {};

            let ruleConfig = {};
            if (urlConfig.rules) {
                ruleConfig = urlConfig.rules[rule.name] || {};
            }

            // Skip rules that are turned off
            if (ruleConfig.level === 0) {
                return;
            }

            this.emit('ruleBegin', url, rule.name);

            let parserFn = rule.parser;
            let parserOverride = false;
            if (ruleConfig.parser) {
                parserFn = ruleConfig.parser;
                parserOverride = true;
            }

            let validatorFn = rule.validator;
            let validatorOverride = false;
            if (ruleConfig.validator) {
                validatorFn = ruleConfig.validator;
                validatorOverride = true;
            }

            // Parse the pages for validation data
            const parsed = parserFn({ url, client, server }, ruleConfig.options);

            let error;
            let warning;
            try {
                validatorFn(parsed, ruleConfig.options);
                this.successCount += 1;
            } catch (e) {
                if (ruleConfig.level === 1) {
                    this.warningCount += 1;
                    warning = e;
                    warnings.push({
                        url,
                        rule: rule.name,
                        warning
                    });
                } else {
                    this.failCount += 1;
                    error = e;
                    errors.push({
                        url,
                        rule: rule.name,
                        error
                    });
                }
            }

            // Add to results
            results[url][rule.name] = {
                error,
                warning,
                parserOverride,
                validatorOverride
            };

            this.emit('ruleEnd', url, rule.name, error, warning, parserOverride, validatorOverride);
        });
    });

    this.emit('testingEnd', this.successCount, this.warningCount, this.failCount, results, errors, warnings);
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
                    rule.name = ruleName.replace('.js', '');
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
