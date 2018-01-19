const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const colors = require('colors');

const RULES_DIR = path.join(__dirname, '../rules');

let rules;
try {
    rules = fs
        .readdirSync(RULES_DIR)
        .map(ruleName => {
            const filePath = path.join(RULES_DIR, ruleName);
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
} catch (e) {
    if (process.env.NODE_ENV === 'development') {
        console.log(e);
    }
    throw new Error(`Failed to load SEO rules: ${e}`);
}

module.exports = (pages, routeConfig) => {
    let successCount = 0;
    let failCount = 0;

    console.log('Begin testing...');
    _.forEach(pages, ({ client, server }, url) => {
        console.log(`  Testing: ${url}`);
        const config = routeConfig[url] || {};

        rules.forEach(rule => {
            const ruleConfig = config[rule.name] || {};
            let overrides = [];

            let parserFn = rule.parser;
            if (ruleConfig.parser) {
                parserFn = ruleConfig.parser;
                overrides.push('parser');
            }

            let validatorFn = rule.validator;
            if (ruleConfig.validator) {
                validatorFn = ruleConfig.validator;
                overrides.push('validator');
            }

            // Create overrides warning
            if (overrides.length) {
                const text = `⚠  overriding ${overrides.join(', ')}`;
                overrides = ` (${colors.yellow(text)})`;
            } else {
                overrides = '';
            }

            // Parse the pages for validation data
            const parsed = parserFn({ url, client, server }, ruleConfig.options);

            let success = true;
            try {
                validatorFn(parsed, ruleConfig.options);
            } catch (e) {
                failCount += 1;
                success = false;
                console.log(`    ${colors.red(`✗`)} ${rule.name}${overrides}`);
                console.log(`      ${e}\n`);
            }
            if (success) {
                successCount += 1;
                console.log(`    ${colors.green(`✓`)} ${rule.name}${overrides}`);
            }
        });
    });

    console.log('\n');
    if (successCount) {
        console.log(colors.green(`  ${successCount} passing`));
    }
    if (failCount) {
        console.log(colors.red(`  ${failCount} failing`));
    }
    console.log();
};
