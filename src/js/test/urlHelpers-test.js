const expect = require('chai').expect;
const { resolveURL, isValidURL, isSameHostname } = require('../urlHelpers');

describe('url-helpers', () => {
    describe('resolveURL', () => {
        it('resolves a relative url to http', () => {
            const url = '/foo/';
            const urlBase = 'http://www.zillow.com/';
            expect(resolveURL(url, urlBase)).to.equal('http://www.zillow.com/foo/');
        });

        it('resolves a relative url to https', () => {
            const url = '/bar/';
            const urlBase = 'https://www.zillow.com/';
            expect(resolveURL(url, urlBase)).to.equal('https://www.zillow.com/bar/');
        });

        it('resolves a new hostname but keeps the protocol', () => {
            const url = 'http://example.com/baz/';
            const urlBase = 'https://www.zillow.com/';
            expect(resolveURL(url, urlBase)).to.equal('http://www.zillow.com/baz/');
        });

        it('resolves a url with a superfluous base', () => {
            const url = 'http://example.com/page.html';
            const urlBase = 'https://www.alphabet.com/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r/s/t/u/v/w/x/y/z/';
            expect(resolveURL(url, urlBase)).to.equal('http://www.alphabet.com/page.html');
        });
    });

    describe('isSameHostname', () => {
        it('different protocols', () => {
            const urlA = 'http://www.zillow.com/';
            const urlB = 'https://www.zillow.com/';
            expect(isSameHostname(urlA, urlB)).to.equal(true);
        });

        it('different ports', () => {
            const urlA = 'https://localhost:8443/';
            const urlB = 'http://localhost:8080/';
            expect(isSameHostname(urlA, urlB)).to.equal(true);
        });

        it('different subdomains', () => {
            const urlA = 'https://example.com/';
            const urlB = 'http://foo.example.com/';
            expect(isSameHostname(urlA, urlB)).to.equal(false);
        });
    });

    describe('isValidURL', () => {
        it('invalid URLs', () => {
            expect(isValidURL('/')).to.equal(false);
            expect(isValidURL('alkjsdf')).to.equal(false);
            expect(isValidURL('foo.com')).to.equal(false);
        });
        it('valid URLs', () => {
            expect(isValidURL('http://foo.com')).to.equal(true);
            expect(isValidURL('http://localhost:8080/foo.html')).to.equal(true);
        });
    });
});
