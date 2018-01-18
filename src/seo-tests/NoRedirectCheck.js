const expect = require('chai').expect;

module.exports = {
    description: 'Verifies that the page was not redirected',
    parser: ({ server }) => {
        const referer = server.response.request.headers.referer;
        const href = server.response.request.href;
        return { referer, href };
    },
    validator: ({ referer, href }) => {
        // eslint-disable-next-line no-unused-expressions
        expect(referer, `${referer} redirected to ${href}`).to.be.undefined;
    }
};
