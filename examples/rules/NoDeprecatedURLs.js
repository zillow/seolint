const cheerio = require('cheerio');
const expect = require('chai').expect;
const _ = require('lodash');
const { resolveURL } = require('../../src/js/urlHelpers');
const { getHrefs } = require('../../src/rules/helpers');
const { URL } = require('url');

module.exports = {
    description: 'Verifies that the page does not contain any URLs of a deprecated format.',
    parser: ({ url, client, server }) => {
        const $client = cheerio.load(client.content);
        const $server = cheerio.load(server.content);

        return _.uniq(
            getHrefs($client)
                .concat(getHrefs($server))
                .map(href => (/^https?:\/\//.test(href) ? href : resolveURL(href, url)))
                .filter(href => /^https?:\/\/www(\.\w+)?\.zillow\.(com|net)\//.test(href))
                .map(href => new URL(href).pathname)
        );
    },

    /**
     * GOOD:
     *   /browse/mortgage/?ratesType=rates&stateAbbr=al
     *
     * BAD:
     *   /browse/mortgage/<STATE_ABBREVIATION>/
     */
    validator: paths => {
        paths.forEach(path => {
            const trimmed = path.split('?')[0].split('#')[0];
            const parts = trimmed.split('/');
            if (parts[1] === 'browse' && parts[2] === 'mortgage') {
                expect(!!parts[3], `browse routes should use query params, but instead found: "${path}"`).to.equal(
                    false
                );
            }
        });
    }
};
