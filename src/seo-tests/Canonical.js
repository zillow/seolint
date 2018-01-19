const cheerio = require('cheerio');
const expect = require('chai').expect;
const { getCanonicals } = require('./helpers');
const { isValidURL, resolveURL } = require('../js/urlHelpers');

module.exports = {
    description: 'Verifies that the page has a proper canonical link.',
    resources: ['https://webmasters.googleblog.com/2013/04/5-common-mistakes-with-relcanonical.html'],
    parser: ({ client, server }) => {
        const $client = cheerio.load(client.content);
        const $server = cheerio.load(server.content);

        return {
            url: server.response.request.href,
            clientCanonicalsHead: getCanonicals($client, 'head'),
            clientCanonicalsBody: getCanonicals($client, 'body'),
            serverCanonicalsHead: getCanonicals($server, 'head'),
            serverCanonicalsBody: getCanonicals($server, 'body')
        };
    },
    validator: (
        { url, clientCanonicalsHead, clientCanonicalsBody, serverCanonicalsHead, serverCanonicalsBody },
        options = {}
    ) => {
        // Make sure there are no canonicals in the body
        expect(
            clientCanonicalsBody,
            `found canonical tags in the client body:\n${clientCanonicalsBody.join('\n')}\n`
        ).to.have.lengthOf(0);
        expect(
            serverCanonicalsBody,
            `found canonical tags in the server body:\n${serverCanonicalsBody.join('\n')}\n`
        ).to.have.lengthOf(0);

        // eslint-disable-next-line no-unused-expressions
        expect(clientCanonicalsHead, 'missing canonical link').to.not.be.empty;
        expect(
            clientCanonicalsHead,
            `found more than one canonicals:\n${clientCanonicalsHead.join('\n')}`
        ).to.have.lengthOf(1);

        if (serverCanonicalsHead.length) {
            expect(clientCanonicalsHead, 'server and client canonical should match').to.eql(serverCanonicalsHead);
        }

        const canonical = clientCanonicalsHead[0];
        expect(isValidURL(canonical), `"${canonical}" is not a fully resolved url`).to.equal(true);

        let expected = url;
        if (options.expectedPath) {
            expected = resolveURL(options.expectedPath, url);
        }
        expect(canonical, `unexpected canonical: "${canonical}"`).to.equal(expected);
    }
};
