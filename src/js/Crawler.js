const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const serverRender = require('./serverRender');
const ClientRenderer = require('./ClientRenderer');

function Crawler(options) {
    this.options = {
        usePhantomPool: true,
        ...options
    };
    this.pages = {};
}

util.inherits(Crawler, EventEmitter);

/**
 * Crawl the given urls.
 *
 * @param urls {array} The urls to crawl
 */
Crawler.prototype.crawl = function(urls) {
    this.emit('crawlingBegin');

    const clientRenderer = new ClientRenderer({
        usePhantomPool: this.options.usePhantomPool
    });

    Promise.all(
        _.map(urls, (urlConfig, url) => {
            // Do not crawl pages twice
            if (url in this.pages) {
                return null;
            }

            this.emit('pageBegin', url);

            this.emit('clientRenderBegin', url);
            const clientPromise = clientRenderer.render(url).then(
                // Successfully client rendered
                page => {
                    this.emit('clientRenderEnd', url, page);
                    return page;
                },
                // Failed client render
                error => {
                    this.emit('clientRenderError', url, error);
                    throw error;
                }
            );

            this.emit('serverRenderBegin', url);
            const serverPromise = serverRender(url).then(
                // Successfully server rendered
                page => {
                    this.emit('serverRenderEnd', url, page);
                    return page;
                },
                // Failed server render
                error => {
                    this.emit('serverRenderError', url, error);
                    throw error;
                }
            );

            return Promise.all([clientPromise, serverPromise]).then(
                // Successfully client/server rendered page
                pages => {
                    const clientPage = pages[0];
                    const serverPage = pages[1];
                    this.pages[url] = { clientPage, serverPage };
                    this.emit('pageEnd', url, clientPage, serverPage);
                },
                // Failed client/server render
                error => {
                    this.emit('pageError', url, error);
                }
            );
        })
    ).then(
        // All rendering promises successful
        () => {
            clientRenderer.destroy();
            this.emit('crawlingEnd', this.pages);
        },
        // Unexpected error while rendering
        error => {
            clientRenderer.destroy();
            this.emit('crawlingError', error);
        }
    );
};

module.exports = Crawler;
