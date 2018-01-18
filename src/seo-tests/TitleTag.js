const cheerio = require('cheerio');
const expect = require('chai').expect;
const { getTitle } = require('./helpers');

module.exports = {
    description: 'Verifies that the page has a `<title>` tag with an appropriate length (no more than 60 characters).',
    resources: ['https://moz.com/learn/seo/title-tag'],
    parser: ({ client, server }) => {
        const $client = cheerio.load(client.content);
        const $server = cheerio.load(server.content);

        return {
            clientTitle: getTitle($client),
            serverTitle: getTitle($server)
        };
    },
    validator: ({ clientTitle, serverTitle }) => {
        // eslint-disable-next-line no-unused-expressions
        expect(clientTitle, 'all pages should have a title').to.not.be.null;
        // eslint-disable-next-line no-unused-expressions
        expect(clientTitle, 'all pages should have a title').to.not.be.empty;

        if (serverTitle) {
            expect(serverTitle, 'client and server titles should match').to.equal(clientTitle);
        }

        expect(clientTitle.length, 'title length should not be more than 60 characters').to.be.at.most(60);
    }
};
