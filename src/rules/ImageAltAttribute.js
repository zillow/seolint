const cheerio = require('cheerio');
const expect = require('chai').expect;
const { getImages } = require('./helpers');
const _ = require('lodash');

module.exports = {
    description:
        'Verifies that all `<img>` tags have an alt text attribute. Decorative images that don\'t add information to the content of the page should have an empty alt attribute (`alt=""`) so they can be ignored by screen readers.',
    resources: ['https://moz.com/learn/seo/alt-text', 'https://www.w3.org/WAI/tutorials/images/decorative/'],
    parser: ({ client, server }) => {
        const $client = cheerio.load(client.content);
        const $server = cheerio.load(server.content);

        return {
            clientImages: getImages($client),
            serverImages: getImages($server)
        };
    },
    validator: ({ clientImages /* , serverImages */ }) => {
        const failures = [];
        _.forEach(clientImages, image => {
            if (typeof image.alt !== 'string') {
                failures.push(image);
            }
        });

        // eslint-disable-next-line no-unused-expressions
        expect(failures, `found images without an alt attribute:\n${failures.map(f => f.src).join('\n')}\n`).to.be
            .empty;
    }
};
