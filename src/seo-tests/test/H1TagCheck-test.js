const expect = require('chai').expect;
const { parser, validator } = require('../H1TagCheck');

describe('H1TagCheck.js', () => {
    describe('parser', () => {
        it('multiple h1s', () => {
            const parsed = parser(
                'http://example.com',
                '<html><body><h1>foo</h1><h1>bar</h1></body></html>',
                '<html><body><h1>baz</h1></body></html>'
            );
            expect(parsed).to.eql({
                clientH1s: ['foo', 'bar'],
                serverH1s: ['baz']
            });
        });
        it('no h1s', () => {
            const parsed = parser('http://example.com', '<html><body></body></html>', '<html><body></body></html>');
            expect(parsed).to.eql({
                clientH1s: [],
                serverH1s: []
            });
        });
        it('server only h1', () => {
            const parsed = parser(
                'http://example.com',
                '<html><body></body></html>',
                '<html><body><h1>baz</h1></body></html>'
            );
            expect(parsed).to.eql({
                clientH1s: [],
                serverH1s: ['baz']
            });
        });
        it('client only h1', () => {
            const parsed = parser(
                'http://example.com',
                '<html><body><h1>foo</h1></body></html>',
                '<html><body></body></html>'
            );
            expect(parsed).to.eql({
                clientH1s: ['foo'],
                serverH1s: []
            });
        });
    });

    describe('validator', () => {
        it('fails for multiple client h1s', () => {
            let failed;
            try {
                validator({
                    clientH1s: ['foo', 'bar'],
                    serverH1s: ['foo']
                });
            } catch (e) {
                failed = true;
            }
            expect(failed).to.equal(true);
        });
        it('fails for multiple server h1s', () => {
            let failed;
            try {
                validator({
                    clientH1s: ['foo'],
                    serverH1s: ['foo', 'bar']
                });
            } catch (e) {
                failed = true;
            }
            expect(failed).to.equal(true);
        });
        it('fails if client h1 does not match server h1', () => {
            let failed;
            try {
                validator({
                    clientH1s: ['foo'],
                    serverH1s: ['bar']
                });
            } catch (e) {
                failed = true;
            }
            expect(failed).to.equal(true);
        });
        it('fails if there is no client or server h1', () => {
            let failed;
            try {
                validator({
                    clientH1s: [],
                    serverH1s: []
                });
            } catch (e) {
                failed = true;
            }
            expect(failed).to.equal(true);
        });
        it('succeeds for client only h1', () => {
            const result = validator({
                clientH1s: ['Foo'],
                serverH1s: []
            });
            expect(result).to.equal(undefined); // Returned without throwing
        });
        it('succeeds for matching client/server h1s', () => {
            const result = validator({
                clientH1s: ['Foo'],
                serverH1s: ['Foo']
            });
            expect(result).to.equal(undefined); // Returned without throwing
        });
    });
});
