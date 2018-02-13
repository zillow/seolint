const puppeteer = require('puppeteer');

// https://github.com/GoogleChrome/puppeteer/issues/594
// Currently launching a browser for each url, we should create a pool
// of browsers and spread urls across that pool.
process.setMaxListeners(Infinity);

module.exports = async function(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const resources = {};
    page.on('request', request => {
        const requestUrl = request.url();
        resources[requestUrl] = resources[url] || {};
        resources[requestUrl].request = request;
    });
    page.on('response', response => {
        const responseUrl = response.url();
        resources[responseUrl] = resources[url] || {};
        resources[responseUrl].response = response;
    });

    await page.goto(url, { waitUntil: ['networkidle0', 'load', 'domcontentloaded'] });
    const content = await page.content();

    await page.close();
    await browser.close();

    return { content, resources };
};
