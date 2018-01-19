const colors = require('colors');
const Crawler = require(`./js/Crawler`);
const TestRunner = require(`./js/TestRunner`);
const commandLine = require(`./js/commandLine`);
const buildRouteConfig = require(`./js/buildRouteConfig`);
const config = commandLine.parse();
const resolveFilePath = require(`./js/resolveFilePath`);

if (config.error) {
    console.error(config.error);
    process.exit(1);
} else if (!config.urls || !config.urls.length) {
    console.error(colors.red('You must provide at least one url to lint\n'));
    commandLine.showHelp();
    process.exit(1);
}

const routeConfig = buildRouteConfig(config);

// Initialize test runner
// ----------------------

const testRunner = new TestRunner({
    routeConfig
});

if (config.rulesdir) {
    try {
        testRunner.loadRules(resolveFilePath(config.rulesdir));
    } catch (e) {
        console.log(colors.red(`Failed to load custom SEO rules: ${e}\n`));
        process.exit(1);
    }
}

testRunner.on('testingBegin', () => {
    console.log('Begin testing...');
});

testRunner.on('pageBegin', url => {
    console.log(`  Testing: ${url}`);
});

testRunner.on('ruleEnd', (url, rule, error, parserOverride, validatorOverride) => {
    // Create overrides warning
    let overrides = [];
    if (parserOverride || validatorOverride) {
        if (parserOverride) {
            overrides.push('parser');
        }
        if (validatorOverride) {
            overrides.push('validator');
        }
        const text = `⚠  overriding ${overrides.join(', ')}`;
        overrides = ` (${colors.yellow(text)})`;
    } else {
        overrides = '';
    }

    if (!error) {
        console.log(`    ${colors.green(`✓`)} ${rule}${overrides}`);
    } else {
        console.log(`    ${colors.red(`✗`)} ${rule}${overrides}`);
        console.log(`      ${error}\n`);
    }
});

testRunner.on('testingEnd', (successCount, failCount) => {
    console.log('\n');
    if (successCount) {
        console.log(colors.green(`  ${successCount} passing`));
    }
    if (failCount) {
        console.log(colors.red(`  ${failCount} failing`));
    }
    console.log();
});

// Initialize crawler
// ------------------

const crawler = new Crawler({
    usePhantomPool: !config.disablePhantomPool
});

crawler.on('crawlingEnd', pages => {
    console.log(colors.green(`\n\nCrawling complete!\n`));
    testRunner.run(pages);
});

crawler.on('crawlingError', error => {
    console.log(`Unexpected crawling error: ${error}`);
});

crawler.on('clientRenderEnd', url => {
    console.log(`${colors.blue(`⚐`)} Finished client rendering: ${url}`);
});

crawler.on('serverRenderEnd', url => {
    console.log(`${colors.blue(`⚑`)} Finished server rendering: ${url}`);
});

crawler.on('pageEnd', url => {
    console.log(`${colors.green(`✓`)} Finished crawling page: ${url}`);
});

crawler.on('pageError', (url, error) => {
    console.log(`${colors.red(`✗`)} Error while crawling page: ${url}: ${error}`);
});

crawler.crawl(routeConfig);
