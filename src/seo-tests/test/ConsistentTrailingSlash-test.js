const expect = require('chai').expect;
const { parser } = require('../ConsistentTrailingSlash');

describe('ConsistentTrailingSlash', () => {
    describe('parser', () => {
        it('link with querystring and trailing slash', () => {
            const parsed = parser({
                url: 'https://www.example.com/',
                client: {
                    content: '<html><body><a href="https://www.example.com/foo/?bar"></a></body></html>'
                },
                server: {
                    content: '<html><body></body></html>'
                }
            });
            expect(parsed).to.eql({
                hrefs: ['https://www.example.com/foo/?bar'],
                hrefsWithoutSlash: []
            });
        });

        it('link with querystring and no trailing slash', () => {
            const parsed = parser({
                url: 'https://www.example.com/',
                client: {
                    content: '<html><body><a href="https://www.example.com/foo?bar"></a></body></html>'
                },
                server: {
                    content: '<html><body></body></html>'
                }
            });
            expect(parsed).to.eql({
                hrefs: ['https://www.example.com/foo?bar'],
                hrefsWithoutSlash: ['https://www.example.com/foo?bar']
            });
        });

        it('link with hash param and trailing slash', () => {
            const parsed = parser({
                url: 'https://www.example.com/',
                client: {
                    content: '<html><body><a href="https://www.example.com/foo/#bar"></a></body></html>'
                },
                server: {
                    content: '<html><body></body></html>'
                }
            });
            expect(parsed).to.eql({
                hrefs: ['https://www.example.com/foo/#bar'],
                hrefsWithoutSlash: []
            });
        });

        it('link with trailing slash at the end of query param', () => {
            const parsed = parser({
                url: 'https://www.example.com/',
                client: {
                    content: '<html><body><a href="https://www.example.com/foo#bar"></a></body></html>'
                },
                server: {
                    content: '<html><body></body></html>'
                }
            });
            expect(parsed).to.eql({
                hrefs: ['https://www.example.com/foo#bar'],
                hrefsWithoutSlash: ['https://www.example.com/foo#bar']
            });
        });

        it('link with trailing slash at the end of hash param', () => {
            const parsed = parser({
                url: 'https://www.example.com/',
                client: {
                    content: '<html><body><a href="https://www.example.com/foo#bar/"></a></body></html>'
                },
                server: {
                    content: '<html><body></body></html>'
                }
            });
            expect(parsed).to.eql({
                hrefs: ['https://www.example.com/foo#bar/'],
                hrefsWithoutSlash: ['https://www.example.com/foo#bar/']
            });
        });

        it('link with hash param and no trailing slash', () => {
            const parsed = parser({
                url: 'https://www.example.com/',
                client: {
                    content: '<html><body><a href="https://www.example.com/foo?bar/"></a></body></html>'
                },
                server: {
                    content: '<html><body></body></html>'
                }
            });
            expect(parsed).to.eql({
                hrefs: ['https://www.example.com/foo?bar/'],
                hrefsWithoutSlash: ['https://www.example.com/foo?bar/']
            });
        });

        it('link with extension', () => {
            const parsed = parser({
                url: 'https://www.example.com/',
                client: {
                    content: '<html><body><a href="https://www.example.com/foo.barbaz"></a></body></html>'
                },
                server: {
                    content: '<html><body></body></html>'
                }
            });
            expect(parsed).to.eql({
                hrefs: ['https://www.example.com/foo.barbaz'],
                hrefsWithoutSlash: []
            });
        });

        it('link from different domain', () => {
            const parsed = parser({
                url: 'https://www.example.com/',
                client: {
                    content: '<html><body><a href="https://www.zillow.com/foo"></a></body></html>'
                },
                server: {
                    content: '<html><body></body></html>'
                }
            });
            expect(parsed).to.eql({
                hrefs: ['https://www.zillow.com/foo'],
                hrefsWithoutSlash: []
            });
        });

        it('different links in client and server', () => {
            const parsed = parser({
                url: 'https://www.example.com/',
                client: {
                    content:
                        '<html><body><a href="https://www.zillow.com/bar"></a><a href="https://www.example.com/bar"></a><a href="http://www.example.com/abc"></a></body></html>'
                },
                server: {
                    content:
                        '<html><body><a href="https://www.zillow.com/bar"></a><a href="https://www.example.com/bar"></a><a href="https://www.example.com/xyz/"></a><a href="https://www.example.com/baz"></a></body></html>'
                }
            });
            expect(parsed).to.eql({
                hrefs: [
                    'https://www.zillow.com/bar',
                    'https://www.example.com/bar',
                    'http://www.example.com/abc',
                    'https://www.example.com/xyz/',
                    'https://www.example.com/baz'
                ],
                hrefsWithoutSlash: [
                    'https://www.example.com/bar',
                    'http://www.example.com/abc',
                    'https://www.example.com/baz'
                ]
            });
        });
    });

    describe('validator', () => {});
});
