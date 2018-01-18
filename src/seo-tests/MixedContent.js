const expect = require('chai').expect;

module.exports = {
    description: 'Verifies that the page has no mixed-content resources',
    parser: ({ url, client }) => {
        const isSecure = url.startsWith('https://');
        const insecureResources = Object.keys(client.resources).filter(resource => resource.startsWith('http://'));
        return { isSecure, insecureResources };
    },
    validator: ({ isSecure, insecureResources }) => {
        if (!isSecure) {
            return;
        }

        // eslint-disable-next-line no-unused-expressions
        expect(insecureResources, `found insecure resources on a secure page:\n${insecureResources.join('\n')}\n`).to.be
            .empty;
    }
};
