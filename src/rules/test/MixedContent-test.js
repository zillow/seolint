const expect = require('chai').expect;
const { parser, validator } = require('../MixedContent');

describe('MixedContent', () => {
    describe('parser', () => {
        it('has no resources', () => {
            const parsed = parser({
                url: 'http://www.example.com',
                client: {
                    resources: {}
                }
            });
            expect(parsed).to.eql({
                isSecure: false,
                insecureResources: []
            });
        });

        it('has mixed resources', () => {
            const parsed = parser({
                url: 'http://www.example.com',
                client: {
                    resources: {
                        'http://www.example.com/foo.png': {},
                        'https://www.example.com/script.js': {},
                        'http://www.example.com/bar.png': {}
                    }
                }
            });
            expect(parsed).to.eql({
                isSecure: false,
                insecureResources: ['http://www.example.com/foo.png', 'http://www.example.com/bar.png']
            });
        });

        it('data resources', () => {
            const parsed = parser({
                url: 'http://www.example.com',
                client: {
                    resources: {
                        'data:image/png;base64,AAAAAAAAAAAAAAAA': {},
                        'http://www.example.com/foo.png': {}
                    }
                }
            });
            expect(parsed).to.eql({
                isSecure: false,
                insecureResources: ['http://www.example.com/foo.png']
            });
        });

        it('secure page', () => {
            const parsed = parser({
                url: 'https://www.example.com',
                client: {
                    resources: {}
                }
            });
            expect(parsed).to.eql({
                isSecure: true,
                insecureResources: []
            });
        });

        it('insecure page', () => {
            const parsed = parser({
                url: 'http://www.example.com',
                client: {
                    resources: {}
                }
            });
            expect(parsed).to.eql({
                isSecure: false,
                insecureResources: []
            });
        });
    });

    describe('validator', () => {
        it('succeeds for insecure pages with mixed content', () => {
            const validatorFn = validator.bind(null, {
                isSecure: false,
                insecureResources: ['http://www.foo.com/bar.png']
            });
            expect(validatorFn).to.not.throw();
        });

        it('fails for secure page with mixed content', () => {
            const validatorFn = validator.bind(null, {
                isSecure: true,
                insecureResources: ['http://www.foo.com/bar.png']
            });
            expect(validatorFn).to.throw();
        });

        it('succeeds for secure page no mixed content', () => {
            const validatorFn = validator.bind(null, {
                isSecure: true,
                insecureResources: []
            });
            expect(validatorFn).to.not.throw();
        });
    });
});
