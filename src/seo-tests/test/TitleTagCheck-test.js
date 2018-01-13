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
            const results = validator({
                clientTitle: 'foo',
                serverTitle: ''
            });
            expect(results).to.equal(undefined); // Returned without throwing
        });
        it('succeeds with matching client and server title', () => {
            const results = validator({
                clientTitle: 'foo',
                serverTitle: 'foo'
            });
            expect(results).to.equal(undefined); // Returned without throwing
        });
        it('fails if client and server title do not match', () => {
            let failed;
            try {
                validator({
                    clientTitle: 'foo',
                    serverTitle: 'bar'
                });
            } catch (e) {
                failed = true;
            }
            expect(failed).to.equal(true);
        });
        it('fails if no title exists at all', () => {
            let failed;
            try {
                validator({
                    clientTitle: '',
                    serverTitle: ''
                });
            } catch (e) {
                failed = true;
            }
            expect(failed).to.equal(true);
        });
        it('fails if the title is over 60 characters', () => {
            let failed;
            try {
                validator({
                    clientTitle: 'abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz',
                    serverTitle: 'abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz'
                });
            } catch (e) {
                failed = true;
            }
            expect(failed).to.equal(true);
        });
    });
});
