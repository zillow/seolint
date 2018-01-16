const cheerio = require('cheerio');
const expect = require('chai').expect;
const { getH1s, getTitle, getDescription } = require('.');

describe('seo-tests helpers', () => {
    describe('getH1s', () => {
        it('multiple h1s', () => {
            const $ = cheerio.load('<html><body><h1>Foo</h1><h1>Bar</h1></body></html>');
            expect(getH1s($)).to.eql(['Foo', 'Bar']);
        });
        it('no h1s', () => {
            const $ = cheerio.load('<html><body></body></html>');
            expect(getH1s($)).to.eql([]);
        });
        it('single h1', () => {
            const $ = cheerio.load('<html><body><h1>Baz</h1></body></html>');
            expect(getH1s($)).to.eql(['Baz']);
        });
    });

    describe('getTitle', () => {
        it('has title', () => {
            const $ = cheerio.load('<html><head><title>Title!</title></head><body></body></html>');
            expect(getTitle($)).to.equal('Title!');
        });
        it('does not have title', () => {
            const $ = cheerio.load('<html><head></head><body></body></html>');
            expect(getTitle($)).to.equal('');
        });
    });

    describe('getDescription', () => {
        it('has description', () => {
            const $ = cheerio.load(
                '<html><head><meta name="description" content="This is the meta description" /></head><body></body></html>'
            );
            expect(getDescription($)).to.equal('This is the meta description');
        });

        it('does not have description', () => {
            const $ = cheerio.load('<html><head></head><body></body></html>');
            expect(getDescription($)).to.equal('');
        });
    });
});
