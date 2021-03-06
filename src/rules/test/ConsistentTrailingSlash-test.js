const expect = require('chai').expect;
const { parser, validator } = require('../ConsistentTrailingSlash');

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
                hrefsWithSlash: ['https://www.example.com/foo/?bar'],
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
                hrefsWithSlash: [],
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
                hrefsWithSlash: ['https://www.example.com/foo/#bar'],
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
                hrefsWithSlash: [],
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
                hrefsWithSlash: [],
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
                hrefsWithSlash: [],
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
                hrefsWithSlash: [],
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
                hrefsWithSlash: [],
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
                hrefsWithSlash: ['https://www.example.com/xyz/'],
                hrefsWithoutSlash: [
                    'https://www.example.com/bar',
                    'http://www.example.com/abc',
                    'https://www.example.com/baz'
                ]
            });
        });
    });

    describe('validator', () => {
        it('fails for any hrefs without a trailing slash', () => {
            const validatorFn = validator.bind(null, {
                hrefs: ['https://www.example.com/bar'],
                hrefsWithSlash: [],
                hrefsWithoutSlash: ['https://www.example.com/bar']
            });
            expect(validatorFn).to.throw('found links without trailing slashes');
        });

        it('succeeds if there are no hrefs without a trailing slash', () => {
            const validatorFn = validator.bind(null, {
                hrefs: ['https://www.example.com/bar/'],
                hrefsWithSlash: ['https://www.example.com/bar/'],
                hrefsWithoutSlash: []
            });
            expect(validatorFn).to.not.throw();
        });

        it('fails for any hrefs with a trailing slash with noSlashes option', () => {
            const validatorFn = validator.bind(
                null,
                {
                    hrefs: ['https://www.example.com/bar/'],
                    hrefsWithSlash: ['https://www.example.com/bar/'],
                    hrefsWithoutSlash: []
                },
                { noSlash: true }
            );
            expect(validatorFn).to.throw('found links with trailing slashes');
        });

        it('succeeds if there are no hrefs with a trailing slash with noSlashes option', () => {
            const validatorFn = validator.bind(
                null,
                {
                    hrefs: ['https://www.example.com/bar'],
                    hrefsWithSlash: [],
                    hrefsWithoutSlash: ['https://www.example.com/bar']
                },
                { noSlash: true }
            );
            expect(validatorFn).to.not.throw();
        });
    });
});
