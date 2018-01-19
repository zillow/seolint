const expect = require('chai').expect;
const { parser, validator } = require('../NoDeprecatedURLs');

describe('NoDeprecatedURLs.js', () => {
    describe('parser', () => {
        it('includes relative urls', () => {
            const parsed = parser({
                url: 'https://www.zillow.com/',
                client: {
                    content: '<html><body><a href="/foo.html"></a></body></html>'
                },
                server: {
                    content: '<html><body><a href="/bar.html"></a></body></html>'
                }
            });
            expect(parsed).to.eql(['/foo.html', '/bar.html']);
        });

        it('excludes other domains', () => {
            const parsed = parser({
                url: 'https://www.zillow.com/',
                client: {
                    content: '<html><body><a href="https://www.example.com/foo.html"></a></body></html>'
                },
                server: {
                    content: '<html><body><a href="http://www.foo.com/bar.html"></a></body></html>'
                }
            });
            expect(parsed).to.eql([]);
        });

        it('joins client and server links', () => {
            const parsed = parser({
                url: 'https://www.zillow.com/',
                client: {
                    content:
                        '<html><body><a href="/foo.html"></a><a href="http://www.zillow.com/baz.html"></a></body></html>'
                },
                server: {
                    content: '<html><body><a href="/bar.html"></a></body></html>'
                }
            });
            expect(parsed).to.eql(['/foo.html', '/baz.html', '/bar.html']);
        });

        it('includes other zillow domains', () => {
            const parsed = parser({
                url: 'https://www.zillow.com/',
                client: {
                    content:
                        '<html><body><a href="/foo.html"></a><a href="http://www.zillow.com/foo.html"></a><a href="http://www.mm1.zillow.net/bar.html"></a><a href="http://www.mm2.zillow.net/baz.html"></a></body></html>'
                },
                server: {
                    content: '<html><body></body></html>'
                }
            });
            expect(parsed).to.eql(['/foo.html', '/bar.html', '/baz.html']);
        });

        it('dedupes paths', () => {
            const parsed = parser({
                url: 'https://www.zillow.com/',
                client: {
                    content:
                        '<html><body><a href="https://www.zillow.com/foo.html"></a><a href="/foo.html"></a></body></html>'
                },
                server: {
                    content:
                        '<html><body><a href="/foo.html"></a><a href="https://www.zillow.com/foo.html"></a></body></html>'
                }
            });
            expect(parsed).to.eql(['/foo.html']);
        });
    });

    describe('validator', () => {
        it('succeeds for no links', () => {
            const validatorFn = validator.bind(null, []);
            expect(validatorFn).to.not.throw();
        });

        it('succeeds for current links', () => {
            const validatorFn = validator.bind(null, ['/mortgage-rates/', '/browse/mortgage/', '/mortgage-calculator']);
            expect(validatorFn).to.not.throw();
        });

        it('succeeds when there are query params', () => {
            const validatorFn = validator.bind(null, ['/browse/mortgage/?foo']);
            expect(validatorFn).to.not.throw();
        });

        it('succeeds when there are hash params', () => {
            const validatorFn = validator.bind(null, ['/browse/mortgage/#foo']);
            expect(validatorFn).to.not.throw();
        });

        it('fails for outdated link', () => {
            const validatorFn = validator.bind(null, ['/browse/mortgage/wa/']);
            expect(validatorFn).to.throw(
                'browse routes should use query params, but instead found: "/browse/mortgage/wa/"'
            );
        });
    });
});
