const cheerio = require('cheerio');
const expect = require('chai').expect;
const { getHrefs } = require('./helpers');
const _ = require('lodash');
const { isSameHostname } = require('../js/urlHelpers');

module.exports = {
    description: 'Verfies that all the links on your page use consistent trailing slashes',
    resources: ['https://webmasters.googleblog.com/2010/04/to-slash-or-not-to-slash.html'],
    level: 1, // Warn by default
    parser: ({ url, client, server }) => {
        const $client = cheerio.load(client.content);
        const $server = cheerio.load(server.content);

        const clientHrefs = getHrefs($client);
        const serverHrefs = getHrefs($server);

        const hrefs = _.uniq([...clientHrefs, ...serverHrefs]);
        const hrefsWithoutSlash = [];
        const hrefsWithSlash = [];
        hrefs.forEach(href => {
            // Remove query/hash params
            const trimmed = href.split('#')[0].split('?')[0];

            // Empty string
            if (!trimmed) {
                return;
            }

            // Ends in an extension
            // eslint-disable-next-line no-useless-escape
            if (/\/[^\/]+\.[^\/]+$/.test(trimmed)) {
                return;
            }

            // Is from the same host
            if (trimmed.startsWith('http') && !isSameHostname(url, trimmed)) {
                return;
            }

            if (trimmed.endsWith('/')) {
                hrefsWithSlash.push(href);
            } else {
                hrefsWithoutSlash.push(href);
            }
        });

        return {
            hrefs,
            hrefsWithSlash,
            hrefsWithoutSlash
        };
    },
    validator: ({ hrefsWithSlash, hrefsWithoutSlash }, options) => {
        if (options && options.noSlash) {
            // eslint-disable-next-line no-unused-expressions
            expect(hrefsWithSlash, `found links with trailing slashes:\n${hrefsWithSlash.join('\n')}\n`).to.be.empty;
        } else {
            // eslint-disable-next-line no-unused-expressions
            expect(hrefsWithoutSlash, `found links without trailing slashes:\n${hrefsWithoutSlash.join('\n')}\n`).to.be
                .empty;
        }
    }
};
