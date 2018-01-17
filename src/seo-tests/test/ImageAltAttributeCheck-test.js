const expect = require('chai').expect;
const { parser, validator } = require('../ImageAltAttributeCheck');

describe('ImageAltAttributeCheck.js', () => {
    describe('parser', () => {
        it('no images', () => {
            const parsed = parser(
                'http://example.com',
                '<html><head></head><body></body></html>',
                '<html><head></head><body></body></html>'
            );
            expect(parsed).to.eql({
                clientImageAltAttributes: [],
                serverImageAltAttributes: []
            });
        });
        it('multiple images', () => {
            const parsed = parser(
                'http://example.com',
                '<html><head></head><body><img alt="foo"><img alt=""><img alt="bar"></body></html>',
                '<html><head></head><body><img alt="bar"><img alt=""><img alt="foo"></body></html>'
            );
            expect(parsed).to.eql({
                clientImageAltAttributes: ['foo', '', 'bar'],
                serverImageAltAttributes: ['bar', '', 'foo']
            });
        });
        it('empty string alt attribute', () => {
            const parsed = parser(
                'http://example.com',
                '<html><head></head><body><img alt=""></body></html>',
                '<html><head></head><body><img alt=""></body></html>'
            );
            expect(parsed).to.eql({
                clientImageAltAttributes: [''],
                serverImageAltAttributes: ['']
            });
        });
        it('missing alt attribute', () => {
            const parsed = parser(
                'http://example.com',
                '<html><head></head><body><img></body></html>',
                '<html><head></head><body><img></body></html>'
            );
            expect(parsed).to.eql({
                clientImageAltAttributes: [null],
                serverImageAltAttributes: [null]
            });
        });
    });

    describe('validator', () => {
        it('fails for missing alt attribute', () => {
            const validatorFn = validator.bind(null, {
                clientImageAltAttributes: [null],
                serverImageAltAttributes: [null]
            });
            expect(validatorFn).to.throw();
        });
        it('succeeds for empty string alt attribute', () => {
            const validatorFn = validator.bind(null, {
                clientImageAltAttributes: [''],
                serverImageAltAttributes: ['']
            });
            expect(validatorFn).to.not.throw();
        });
        it('succeeds for multiple images', () => {
            const validatorFn = validator.bind(null, {
                clientImageAltAttributes: ['foo', 'bar'],
                serverImageAltAttributes: ['foo', 'bar']
            });
            expect(validatorFn).to.not.throw();
        });
        it('fails on last image', () => {
            const validatorFn = validator.bind(null, {
                clientImageAltAttributes: ['foo', 'bar', null],
                serverImageAltAttributes: ['foo', 'bar', null]
            });
            expect(validatorFn).to.throw();
        });
        it('succeeds when there are no images', () => {
            const validatorFn = validator.bind(null, {
                clientImageAltAttributes: [],
                serverImageAltAttributes: []
            });
            expect(validatorFn).to.not.throw();
        });
    });
});
