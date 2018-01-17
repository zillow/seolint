const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const colors = require('colors');

const TEST_DIR = path.join(__dirname, '../seo-tests');

let tests;
try {
    tests = fs
        .readdirSync(TEST_DIR)
        .map(testName => {
            const filePath = path.join(TEST_DIR, testName);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
                // eslint-disable-next-line import/no-dynamic-require
                const test = require(filePath);
                test.name = testName;
                return test;
            }
            return null;
        })
        .filter(t => t);
} catch (e) {
    if (process.env.NODE_ENV === 'development') {
        console.log(e);
    }
    throw new Error(`Failed to load SEO tests: ${e}`);
}

module.exports = (pages, routeConfig) => {
    let successCount = 0;
    let failCount = 0;

    console.log('Begin testing...');
    _.forEach(pages, ({ client, server }, url) => {
        console.log(`  Testing: ${url}`);
        const config = routeConfig[url] || {};

        tests.forEach(test => {
            const testConfig = config[test.name] || {};
            let overrides = [];

            let parserFn = test.parser;
            if (testConfig.parser) {
                parserFn = testConfig.parser;
                overrides.push('parser');
            }

            let validatorFn = test.validator;
            if (testConfig.validator) {
                validatorFn = testConfig.validator;
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
            const parsed = parserFn({ url, client, server });

            let success = true;
            try {
                validatorFn(parsed);
            } catch (e) {
                failCount += 1;
                success = false;
                console.log(`    ${colors.red(`✗`)} ${test.name}${overrides}`);
                console.log(`      ${e}\n`);
            }
            if (success) {
                successCount += 1;
                console.log(`    ${colors.green(`✓`)} ${test.name}${overrides}`);
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
