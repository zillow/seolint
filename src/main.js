const colors = require('colors');
const Crawler = require(`./js/Crawler`);
const runTests = require(`./js/runTests`);
const commandLine = require(`./js/commandLine`);
const buildRouteConfig = require(`./js/buildRouteConfig`);
const config = commandLine.parse();

if (config.error) {
    console.error(config.error);
    process.exit(1);
} else if (!config.urls || !config.urls.length) {
    console.error(colors.red('You must provide at least one url to lint\n'));
    commandLine.showHelp();
    process.exit(1);
}

const routes = buildRouteConfig(config);
const crawler = new Crawler({
    usePhantomPool: !config.disablePhantomPool
});

crawler.on('crawlingEnd', pages => {
    console.log(colors.green(`\n\nCrawling complete!\n`));
    runTests(pages, routes);
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

crawler.crawl(routes);
