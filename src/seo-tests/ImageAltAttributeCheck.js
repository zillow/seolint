const cheerio = require('cheerio');
const expect = require('chai').expect;
const { getImageAltAttributes } = require('./helpers');

module.exports = {
    description:
        'Verifies that all `<img>` tags have an alt text attribute. Decorative images that don\'t add information to the content of the page should have an empty alt attribute (`alt=""`) so they can be ignored by screen readers.',
    resources: ['https://moz.com/learn/seo/alt-text', 'https://www.w3.org/WAI/tutorials/images/decorative/'],
    parser: (url, clientPage, serverPage) => {
        const $clientPage = cheerio.load(clientPage);
        const $serverPage = cheerio.load(serverPage);

        return {
            clientImageAltAttributes: getImageAltAttributes($clientPage),
            serverImageAltAttributes: getImageAltAttributes($serverPage)
        };
    },
    validator: ({ clientImageAltAttributes /* , serverImageAltAttributes */ }) => {
        clientImageAltAttributes.forEach(altAttribute => {
            expect(altAttribute, 'all images should have an alt text attribute').to.not.equal(null);
        });
    }
};
