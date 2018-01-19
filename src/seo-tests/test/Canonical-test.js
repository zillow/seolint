const expect = require('chai').expect;
const { parser, validator } = require('../Canonical');

describe('Canonical.js', () => {
    describe('parser', () => {
        it('parses body canonicals', () => {
            const parsed = parser({
                client: {
                    content: '<html><head></head><body><link rel="canonical" href="client" /></body></html>'
                },
                server: {
                    content: '<html><head></head><body><link rel="canonical" href="server" /></body></html>',
                    response: {
                        request: {
                            href: 'https://www.example.com/'
                        }
                    }
                }
            });
            expect(parsed).to.eql({
                url: 'https://www.example.com/',
                clientCanonicalsHead: [],
                clientCanonicalsBody: ['client'],
                serverCanonicalsHead: [],
                serverCanonicalsBody: ['server']
            });
        });

        it('parses head canonicals', () => {
            const parsed = parser({
                url: 'https://www.example.com/',
                client: {
                    content: '<html><head><link rel="canonical" href="client" /></head><body></body></html>'
                },
                server: {
                    content: '<html><head><link rel="canonical" href="server" /></head><body></body></html>',
                    response: {
                        request: {
                            href: 'https://www.example.com/'
                        }
                    }
                }
            });
            expect(parsed).to.eql({
                url: 'https://www.example.com/',
                clientCanonicalsHead: ['client'],
                clientCanonicalsBody: [],
                serverCanonicalsHead: ['server'],
                serverCanonicalsBody: []
            });
        });

        it('has no canonicals', () => {
            const parsed = parser({
                url: 'https://www.example.com/',
                client: {
                    content: '<html><head></head><body></body></html>'
                },
                server: {
                    content: '<html><head></head><body></body></html>',
                    response: {
                        request: {
                            href: 'https://www.example.com/'
                        }
                    }
                }
            });
            expect(parsed).to.eql({
                url: 'https://www.example.com/',
                clientCanonicalsHead: [],
                clientCanonicalsBody: [],
                serverCanonicalsHead: [],
                serverCanonicalsBody: []
            });
        });

        it('url was redirected', () => {
            const parsed = parser({
                url: 'https://www.example.com/',
                client: {
                    content: '<html><head></head><body></body></html>'
                },
                server: {
                    content: '<html><head></head><body></body></html>',
                    response: {
                        request: {
                            href: 'https://example.com'
                        }
                    }
                }
            });
            expect(parsed).to.eql({
                url: 'https://example.com',
                clientCanonicalsHead: [],
                clientCanonicalsBody: [],
                serverCanonicalsHead: [],
                serverCanonicalsBody: []
            });
        });
    });

    describe('validator', () => {
        it('fails for more than one canonical', () => {
            const validatorFn = validator.bind(null, {
                url: 'https://www.example.com/',
                clientCanonicalsHead: ['canonical1', 'canonical2'],
                clientCanonicalsBody: [],
                serverCanonicalsHead: [],
                serverCanonicalsBody: []
            });
            expect(validatorFn).to.throw('found more than one canonicals');
        });

        it('fails for canonical in the client body', () => {
            const validatorFn = validator.bind(null, {
                url: 'https://www.example.com/',
                clientCanonicalsHead: ['canonical'],
                clientCanonicalsBody: ['canonical'],
                serverCanonicalsHead: [],
                serverCanonicalsBody: []
            });
            expect(validatorFn).to.throw('found canonical tags in the client body');
        });

        it('fails for canonical in the server body', () => {
            const validatorFn = validator.bind(null, {
                url: 'https://www.example.com/',
                clientCanonicalsHead: ['canonical'],
                clientCanonicalsBody: [],
                serverCanonicalsHead: [],
                serverCanonicalsBody: ['canonical']
            });
            expect(validatorFn).to.throw('found canonical tags in the server body');
        });

        it('fails if the canonical is not fully resolved', () => {
            const validatorFn = validator.bind(null, {
                url: 'https://www.example.com/',
                clientCanonicalsHead: ['/'],
                clientCanonicalsBody: [],
                serverCanonicalsHead: [],
                serverCanonicalsBody: []
            });
            expect(validatorFn).to.throw('"/" is not a fully resolved url');
        });

        it('fails if the canonical does not match expected', () => {
            const validatorFn = validator.bind(null, {
                url: 'https://www.example.com/',
                clientCanonicalsHead: ['https://example.com/'],
                clientCanonicalsBody: [],
                serverCanonicalsHead: [],
                serverCanonicalsBody: []
            });
            expect(validatorFn).to.throw('unexpected canonical: "https://example.com/"');
        });

        it('fails if the client canonical does not match the server canonical', () => {
            const validatorFn = validator.bind(null, {
                url: 'https://www.example.com/',
                clientCanonicalsHead: ['https://www.example.com/'],
                clientCanonicalsBody: [],
                serverCanonicalsHead: ['https://example.com/'],
                serverCanonicalsBody: []
            });
            expect(validatorFn).to.throw('server and client canonical should match');
        });

        it('fails if the canonical has an empty href', () => {
            const validatorFn = validator.bind(null, {
                url: 'https://www.example.com/',
                clientCanonicalsHead: [''],
                clientCanonicalsBody: [],
                serverCanonicalsHead: [],
                serverCanonicalsBody: []
            });
            expect(validatorFn).to.throw('"" is not a fully resolved url');
        });

        it('fails if the canonical has no href', () => {
            const validatorFn = validator.bind(null, {
                url: 'https://www.example.com/',
                clientCanonicalsHead: [null],
                clientCanonicalsBody: [],
                serverCanonicalsHead: [],
                serverCanonicalsBody: []
            });
            expect(validatorFn).to.throw('"null" is not a fully resolved url');
        });

        it('fails if there is no canonical at all', () => {
            const validatorFn = validator.bind(null, {
                url: 'https://www.example.com/',
                clientCanonicalsHead: [],
                clientCanonicalsBody: [],
                serverCanonicalsHead: [],
                serverCanonicalsBody: []
            });
            expect(validatorFn).to.throw('missing canonical link');
        });

        it('succeeds if there is only one canonical on the client only', () => {
            const validatorFn = validator.bind(null, {
                url: 'https://www.example.com/',
                clientCanonicalsHead: ['https://www.example.com/'],
                clientCanonicalsBody: [],
                serverCanonicalsHead: [],
                serverCanonicalsBody: []
            });
            expect(validatorFn).to.not.throw();
        });

        it('succeeds if there is only one canonical and it matches on client and server', () => {
            const validatorFn = validator.bind(null, {
                url: 'https://www.example.com/',
                clientCanonicalsHead: ['https://www.example.com/'],
                clientCanonicalsBody: [],
                serverCanonicalsHead: ['https://www.example.com/'],
                serverCanonicalsBody: []
            });
            expect(validatorFn).to.not.throw();
        });

        it('succeeds with an optional expectedPath', () => {
            const validatorFn = validator.bind(
                null,
                {
                    url: 'https://www.example.com/foo/bar/',
                    clientCanonicalsHead: ['https://www.example.com/foo-bar/'],
                    clientCanonicalsBody: [],
                    serverCanonicalsHead: [],
                    serverCanonicalsBody: []
                },
                {
                    expectedPath: '/foo-bar/'
                }
            );
            expect(validatorFn).to.not.throw();
        });

        it('fails with an optional expectedPath', () => {
            const validatorFn = validator.bind(
                null,
                {
                    url: 'https://www.example.com/foo/bar/',
                    clientCanonicalsHead: ['https://www.example.com/foo/bar/'],
                    clientCanonicalsBody: [],
                    serverCanonicalsHead: [],
                    serverCanonicalsBody: []
                },
                {
                    expectedPath: '/foo-bar/'
                }
            );
            expect(validatorFn).to.throw('unexpected canonical: "https://www.example.com/foo/bar/"');
        });
    });
});
