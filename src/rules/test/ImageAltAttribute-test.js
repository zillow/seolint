const expect = require('chai').expect;
const { parser, validator } = require('../ImageAltAttribute');

describe('ImageAltAttribute', () => {
    describe('parser', () => {
        it('no images', () => {
            const parsed = parser({
                client: { content: '<html><head></head><body></body></html>' },
                server: { content: '<html><head></head><body></body></html>' }
            });
            expect(parsed).to.eql({
                clientImages: [],
                serverImages: []
            });
        });
        it('different client and server images', () => {
            const parsed = parser({
                client: { content: '<html><head></head><body><img src="foo.png" alt="foo" /></body></html>' },
                server: { content: '<html><head></head><body><img src="bar.png" alt="bar" /></body></html>' }
            });
            expect(parsed).to.eql({
                clientImages: [{ src: 'foo.png', alt: 'foo' }],
                serverImages: [{ src: 'bar.png', alt: 'bar' }]
            });
        });
    });

    describe('validator', () => {
        it('fails for missing alt attribute', () => {
            const validatorFn = validator.bind(null, {
                clientImages: [{ src: 'foo.png' }]
            });
            expect(validatorFn).to.throw('found images without an alt attribute:\nfoo.png');
        });
        it('succeeds for empty string alt attribute', () => {
            const validatorFn = validator.bind(null, {
                clientImages: [{ src: 'foo.png', alt: '' }]
            });
            expect(validatorFn).to.not.throw();
        });
        it('succeeds for multiple images', () => {
            const validatorFn = validator.bind(null, {
                clientImages: [{ src: 'foo.png', alt: 'foo' }, { src: 'bar.png', alt: 'bar' }]
            });
            expect(validatorFn).to.not.throw();
        });
        it('fails on last image', () => {
            const validatorFn = validator.bind(null, {
                clientImages: [{ src: 'foo.png', alt: 'foo' }, { src: 'bar.png' }]
            });
            expect(validatorFn).to.throw('found images without an alt attribute:\nbar.png');
        });
        it('succeeds when there are no images', () => {
            const validatorFn = validator.bind(null, {
                clientImages: []
            });
            expect(validatorFn).to.not.throw();
        });
    });
});
