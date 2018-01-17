const expect = require('chai').expect;
const { parser, validator } = require('../H1TagCheck');

describe('H1TagCheck.js', () => {
    describe('parser', () => {
        it('multiple h1s', () => {
            const parsed = parser({
                client: { content: '<html><body><h1>foo</h1><h1>bar</h1></body></html>' },
                server: { content: '<html><body><h1>baz</h1></body></html>' }
            });
            expect(parsed).to.eql({
                clientH1s: ['foo', 'bar'],
                serverH1s: ['baz']
            });
        });
        it('no h1s', () => {
            const parsed = parser({
                client: { content: '<html><body></body></html>' },
                server: { content: '<html><body></body></html>' }
            });
            expect(parsed).to.eql({
                clientH1s: [],
                serverH1s: []
            });
        });
        it('server only h1', () => {
            const parsed = parser({
                client: { content: '<html><body></body></html>' },
                server: { content: '<html><body><h1>baz</h1></body></html>' }
            });
            expect(parsed).to.eql({
                clientH1s: [],
                serverH1s: ['baz']
            });
        });
        it('client only h1', () => {
            const parsed = parser({
                client: { content: '<html><body><h1>foo</h1></body></html>' },
                server: { content: '<html><body></body></html>' }
            });
            expect(parsed).to.eql({
                clientH1s: ['foo'],
                serverH1s: []
            });
        });
    });

    describe('validator', () => {
        it('fails for multiple client h1s', () => {
            const validatorFn = validator.bind(null, {
                clientH1s: ['foo', 'bar'],
                serverH1s: ['foo']
            });
            expect(validatorFn).to.throw();
        });
        it('fails for multiple server h1s', () => {
            const validatorFn = validator.bind(null, {
                clientH1s: ['foo'],
                serverH1s: ['foo', 'bar']
            });
            expect(validatorFn).to.throw();
        });
        it('fails if client h1 does not match server h1', () => {
            const validatorFn = validator.bind(null, {
                clientH1s: ['foo'],
                serverH1s: ['bar']
            });
            expect(validatorFn).to.throw();
        });
        it('fails if there is no client or server h1', () => {
            const validatorFn = validator.bind(null, {
                clientH1s: [],
                serverH1s: []
            });
            expect(validatorFn).to.throw();
        });
        it('succeeds for client only h1', () => {
            const validatorFn = validator.bind(null, {
                clientH1s: ['Foo'],
                serverH1s: []
            });
            expect(validatorFn).to.not.throw();
        });
        it('succeeds for matching client/server h1s', () => {
            const validatorFn = validator.bind(null, {
                clientH1s: ['Foo'],
                serverH1s: ['Foo']
            });
            expect(validatorFn).to.not.throw();
        });
    });
});
