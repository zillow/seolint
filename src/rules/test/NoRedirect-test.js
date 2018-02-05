const expect = require('chai').expect;
const { parser, validator } = require('../NoRedirect');

describe('NoRedirect', () => {
    describe('parser', () => {
        it('no redirect', () => {
            const parsed = parser({
                server: {
                    response: {
                        request: {
                            headers: {},
                            href: 'https://www.example.com'
                        }
                    }
                }
            });
            expect(parsed).to.eql({
                referer: undefined,
                href: 'https://www.example.com'
            });
        });

        it('redirect', () => {
            const parsed = parser({
                server: {
                    response: {
                        request: {
                            headers: {
                                referer: 'https://example.com'
                            },
                            href: 'https://www.example.com'
                        }
                    }
                }
            });
            expect(parsed).to.eql({
                referer: 'https://example.com',
                href: 'https://www.example.com'
            });
        });
    });

    describe('validator', () => {
        it('succeeds if there is no referer', () => {
            const validatorFn = validator.bind(null, {
                href: 'https://www.example.com'
            });
            expect(validatorFn).to.not.throw();
        });

        it('fails if there is a referer', () => {
            const validatorFn = validator.bind(null, {
                referer: 'https://example.com',
                href: 'https://www.example.com'
            });
            expect(validatorFn).to.throw();
        });
    });
});
