const cheerio = require('cheerio');
const expect = require('chai').expect;
const { getHrefs } = require('./helpers');
const _ = require('lodash');
const { isSameHostname } = require('../js/urlHelpers');

module.exports = {
    description: 'Verfies that all the links on your page use consistent trailing slashes',
    resources: ['https://webmasters.googleblog.com/2010/04/to-slash-or-not-to-slash.html'],
    parser: ({ url, client, server }) => {
        const $client = cheerio.load(client.content);
        const $server = cheerio.load(server.content);

        const clientHrefs = getHrefs($client);
        const serverHrefs = getHrefs($server);

        const hrefs = _.uniq([...clientHrefs, ...serverHrefs]);
        const hrefsWithoutSlash = hrefs.filter(href => {
            // Remove query/hash params
            const trimmed = href.split('#')[0].split('?')[0];
            if (trimmed.endsWith('/')) {
                return false;
            }

            // Empty string
            if (!trimmed) {
                return false;
            }

            // Ends in an extension
            // eslint-disable-next-line no-useless-escape
            if (/\/[^\/]+\.[^\/]+$/.test(trimmed)) {
                return false;
            }

            if (trimmed.startsWith('http') && !isSameHostname(url, trimmed)) {
                return false;
            }

            return true;
        });

        return {
            hrefs,
            hrefsWithoutSlash
        };
    },
    validator: ({ hrefsWithoutSlash /* , hrefs */ }) => {
        // eslint-disable-next-line no-unused-expressions
        expect(hrefsWithoutSlash, `found links without trailing slashes:\n${hrefsWithoutSlash.join('\n')}\n`).to.be
            .empty;
    }
};
