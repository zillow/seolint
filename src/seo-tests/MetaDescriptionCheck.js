/* eslint-disable no-unused-expressions */

const cheerio = require('cheerio');
const expect = require('chai').expect;
const { getDescription } = require('./helpers');

module.exports = {
    description: 'Verifies that the page has a good meta description length',
    resources: ['https://moz.com/learn/seo/meta-description'],
    parser: (url, clientPage, serverPage) => {
        const $clientPage = cheerio.load(clientPage);
        const $serverPage = cheerio.load(serverPage);

        return {
            clientDescription: getDescription($clientPage),
            serverDescription: getDescription($serverPage)
        };
    },
    validator: ({ clientDescription, serverDescription }) => {
        expect(clientDescription, 'all pages should have a meta description').to.not.be.empty;

        if (serverDescription) {
            expect(serverDescription, 'client and server descriptions should match').to.equal(clientDescription);
        }

        expect(clientDescription.length, 'description length should be between 50-300 characters')
            .to.be.at.least(50)
            .and.at.most(300);
    }
};