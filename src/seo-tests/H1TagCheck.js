/* eslint-disable no-unused-expressions */

const cheerio = require('cheerio');
const expect = require('chai').expect;
const { getH1s } = require('./helpers');

module.exports = {
    description: 'Verifies that the page has one and only one <h1> tag',
    parser: ({ client, server }) => {
        const $client = cheerio.load(client.content);
        const $server = cheerio.load(server.content);

        return {
            clientH1s: getH1s($client),
            serverH1s: getH1s($server)
        };
    },
    validator: ({ clientH1s, serverH1s }) => {
        expect(clientH1s, 'all pages should have an H1').to.not.be.empty;

        if (clientH1s.length) {
            expect(clientH1s, 'client page has only one h1').to.have.lengthOf(1);
        }
        if (serverH1s.length) {
            expect(serverH1s, 'server page has only one h1').to.have.lengthOf(1);
        }

        if (clientH1s.length && serverH1s.length) {
            expect(clientH1s[0], 'client h1 matches server h1').to.equal(serverH1s[0]);
        }
    }
};
