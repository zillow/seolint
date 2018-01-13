/* eslint-disable no-unused-expressions */

const cheerio = require('cheerio');
const expect = require('chai').expect;
const { getTitle } = require('./helpers');

module.exports = {
    description: 'Verifies that the page has a `<title>` tag with an appropriate length (no more than 60 characters).',
    resources: ['https://moz.com/learn/seo/title-tag'],
    parser: (url, clientPage, serverPage) => {
        const $clientPage = cheerio.load(clientPage);
        const $serverPage = cheerio.load(serverPage);

        const clientTitle = getTitle($clientPage);
        const serverTitle = getTitle($serverPage);

        return {
            clientTitle,
            serverTitle
        };
    },
    validator: ({ clientTitle, serverTitle }) => {
        expect(clientTitle, 'all pages should have a title').to.not.be.empty;

        if (serverTitle) {
            expect(serverTitle, 'client and server titles should match').to.equal(clientTitle);
        }

        expect(clientTitle.length, 'title length should not be more than 60 characters').to.be.at.most(60);
    }
};
