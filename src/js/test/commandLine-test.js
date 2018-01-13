const expect = require('chai').expect;
const { parse } = require('../commandLine');

const MORTGAGE_CONFIG = require('./fixture/mortgage.config');
const MLC_CONFIG = require('./fixture/mlc.config');
const DEFAULT_CONFIG = {};

describe('commandLine', () => {
    describe('parse', () => {
        it('no arguments', () => {
            const argv = ['node', 'index.js'];
            const config = parse(argv);
            expect(config).to.eql(DEFAULT_CONFIG);
        });

        it('single url', () => {
            const argv = ['node', 'index.js', 'https://www.zillow.com/'];
            const config = parse(argv);
            expect(config).to.eql({
                ...DEFAULT_CONFIG,
                urls: ['https://www.zillow.com/']
            });
        });

        it('multiple urls', () => {
            const argv = ['node', 'index.js', 'https://www.zillow.com/', 'https://www.zillow.com/mortgage-rates/'];
            const config = parse(argv);
            expect(config).to.eql({
                ...DEFAULT_CONFIG,
                urls: ['https://www.zillow.com/', 'https://www.zillow.com/mortgage-rates/']
            });
        });

        it('options before urls', () => {
            const argv = [
                'node',
                'index.js',
                '--disablePhantomPool',
                'https://www.zillow.com/',
                'https://www.zillow.com/mortgage-rates/'
            ];
            const config = parse(argv);
            expect(config).to.eql({
                ...DEFAULT_CONFIG,
                disablePhantomPool: true,
                urls: ['https://www.zillow.com/', 'https://www.zillow.com/mortgage-rates/']
            });
        });

        it('options after urls', () => {
            const argv = [
                'node',
                'index.js',
                'https://www.zillow.com/',
                'https://www.zillow.com/mortgage-rates/',
                '--disablePhantomPool'
            ];
            const config = parse(argv);
            expect(config).to.eql({
                ...DEFAULT_CONFIG,
                disablePhantomPool: true,
                urls: ['https://www.zillow.com/', 'https://www.zillow.com/mortgage-rates/']
            });
        });

        it('options in between urls', () => {
            const argv = [
                'node',
                'index.js',
                'https://www.zillow.com/',
                '--disablePhantomPool',
                'https://www.zillow.com/mortgage-rates/'
            ];
            const config = parse(argv);
            expect(config).to.eql({
                ...DEFAULT_CONFIG,
                disablePhantomPool: true,
                urls: ['https://www.zillow.com/', 'https://www.zillow.com/mortgage-rates/']
            });
        });

        it('js config file', () => {
            const argv = ['node', 'index.js', '--config', 'examples/mortgage.seolint.js'];
            const config = parse(argv);

            // Turn urls into simple list of strings for easy comparison
            config.urls = config.urls.map(url => (typeof url === 'string' ? url : url.url));

            expect(config).to.eql({
                ...DEFAULT_CONFIG,
                ...MORTGAGE_CONFIG
            });
        });

        it('json config file', () => {
            const argv = ['node', 'index.js', '--config', 'examples/mlc.seolint.json'];
            const config = parse(argv);
            expect(config).to.eql({
                ...DEFAULT_CONFIG,
                ...MLC_CONFIG
            });
        });

        it('invalid config file', () => {
            const argv = ['node', 'index.js', '--config', 'thisfiledoesnotexist.json'];
            const config = parse(argv);
            expect(config).to.eql({
                error: 'Invalid config file: thisfiledoesnotexist.json'
            });
        });

        it('command line options override config file', () => {
            const argv = [
                'node',
                'index.js',
                '--config',
                'examples/mlc.seolint.json',
                '--hostname',
                'https://www.example.com/'
            ];
            const config = parse(argv);
            expect(config).to.eql({
                ...DEFAULT_CONFIG,
                ...MLC_CONFIG,
                hostname: 'https://www.example.com/'
            });
        });
    });
});
