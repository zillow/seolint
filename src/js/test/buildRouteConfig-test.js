const expect = require('chai').expect;
const buildRouteConfig = require('../buildRouteConfig');

describe('buildRouteConfig', () => {
    it('creates empty config for string urls', () => {
        const config = {
            urls: ['https://www.zillow.com/', 'https://www.zillow.com/mortgage-rates/']
        };
        expect(buildRouteConfig(config)).to.eql({
            'https://www.zillow.com/': {},
            'https://www.zillow.com/mortgage-rates/': {}
        });
    });

    it('copies config for object urls', () => {
        const config = {
            urls: [
                {
                    url: 'https://www.zillow.com/',
                    foo: true
                },
                {
                    url: 'https://www.zillow.com/mortgage-rates/',
                    bar: true
                }
            ]
        };
        expect(buildRouteConfig(config)).to.eql({
            'https://www.zillow.com/': {
                foo: true
            },
            'https://www.zillow.com/mortgage-rates/': {
                bar: true
            }
        });
    });

    it('resolves hostnames', () => {
        const config = {
            hostname: 'https://www.example.com/',
            urls: ['https://www.zillow.com/', { url: 'https://www.zillow.com/mortgage-rates/' }]
        };
        expect(buildRouteConfig(config)).to.eql({
            'https://www.example.com/': {},
            'https://www.example.com/mortgage-rates/': {}
        });
    });
});
