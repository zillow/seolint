const expect = require('chai').expect;
const { parser, validator } = require('../TitleTagCheck');

describe('TitleTagCheck.js', () => {
    describe('parser', () => {
        it('client and server title', () => {
            const parsed = parser(
                'http://example.com',
                '<html><head><title>foo</title></head><body></body></html>',
                '<html><head><title>bar</title></head><body></body></html>'
            );
            expect(parsed).to.eql({
                clientTitle: 'foo',
                serverTitle: 'bar'
            });
        });
        it('client only title', () => {
            const parsed = parser(
                'http://example.com',
                '<html><head><title>foo</title></head><body></body></html>',
                '<html><head></head><body></body></html>'
            );
            expect(parsed).to.eql({
                clientTitle: 'foo',
                serverTitle: ''
            });
        });
        it('server only title', () => {
            const parsed = parser(
                'http://example.com',
                '<html><head></head><body></body></html>',
                '<html><head><title>bar</title></head><body></body></html>'
            );
            expect(parsed).to.eql({
                clientTitle: '',
                serverTitle: 'bar'
            });
        });
        it('no title', () => {
            const parsed = parser(
                'http://example.com',
                '<html><head></head><body></body></html>',
                '<html><head></head><body></body></html>'
            );
            expect(parsed).to.eql({
                clientTitle: '',
                serverTitle: ''
            });
        });
    });

    describe('validator', () => {
        it('succeeds with client but no server title', () => {
            const validatorFn = validator.bind(null, {
                clientTitle: 'foo',
                serverTitle: ''
            });
            expect(validatorFn).to.not.throw();
        });
        it('succeeds with matching client and server title', () => {
            const validatorFn = validator.bind(null, {
                clientTitle: 'foo',
                serverTitle: 'foo'
            });
            expect(validatorFn).to.not.throw();
        });
        it('fails if client and server title do not match', () => {
            const validatorFn = validator.bind(null, {
                clientTitle: 'foo',
                serverTitle: 'bar'
            });
            expect(validatorFn).to.throw();
        });
        it('fails if no title exists at all', () => {
            const validatorFn = validator.bind(null, {
                clientTitle: '',
                serverTitle: ''
            });
            expect(validatorFn).to.throw();
        });
        it('fails if the title is over 60 characters', () => {
            const validatorFn = validator.bind(null, {
                clientTitle: 'abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz',
                serverTitle: 'abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz'
            });
            expect(validatorFn).to.throw();
        });
    });
});
