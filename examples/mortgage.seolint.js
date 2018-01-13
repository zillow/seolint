const { URL } = require('url');
const { expect } = require('chai');

const canonicalValidator = canonical => ({
    validator: results => {
        expect(new URL(results.Canonical).pathname).to.equal(canonical);
    }
});

const URLS = [
    // Mortgage rates
    'https://www.zillow.com/mortgage-rates/',
    'https://www.zillow.com/refinance/',
    'https://www.zillow.com/mortgage-rates/30-year-fixed/',
    'https://www.zillow.com/mortgage-rates/15-year-fixed/',
    'https://www.zillow.com/mortgage-rates/7-1-arm/',
    'https://www.zillow.com/mortgage-rates/5-1-arm/',
    'https://www.zillow.com/mortgage-rates/al/',
    'https://www.zillow.com/mortgage-rates/al/akron/',
    'https://www.zillow.com/refinance/al/',
    'https://www.zillow.com/refinance/al/akron/',
    // Legacy mortgage rates
    {
        url: 'https://www.zillow.com/30_Year_Fixed_Mortgage_Rates/',
        'CrawledPageWasRedirected.js': {
            validator: results => {
                expect(results.status).to.equal(200);
                expect(new URL(results.href).pathname).to.equal('/mortgage-rates/30-year-fixed/');
            }
        }
    },
    {
        url: 'https://www.zillow.com/20_Year_Fixed_Mortgage_Rates/',
        'CrawledPageWasRedirected.js': {
            validator: results => {
                expect(results.status).to.equal(200);
                expect(new URL(results.href).pathname).to.equal('/mortgage-rates/20-year-fixed/');
            }
        }
    },
    {
        url: 'https://www.zillow.com/15_Year_Fixed_Mortgage_Rates/',
        'CrawledPageWasRedirected.js': {
            validator: results => {
                expect(results.status).to.equal(200);
                expect(new URL(results.href).pathname).to.equal('/mortgage-rates/15-year-fixed/');
            }
        }
    },
    {
        url: 'https://www.zillow.com/7-1_ARM_Mortgage_Rates/',
        'CrawledPageWasRedirected.js': {
            validator: results => {
                expect(results.status).to.equal(200);
                expect(new URL(results.href).pathname).to.equal('/mortgage-rates/7-1-arm/');
            }
        }
    },
    {
        url: 'https://www.zillow.com/5-1_ARM_Mortgage_Rates/',
        'CrawledPageWasRedirected.js': {
            validator: results => {
                expect(results.status).to.equal(200);
                expect(new URL(results.href).pathname).to.equal('/mortgage-rates/5-1-arm/');
            }
        }
    },
    {
        url: 'https://www.zillow.com/Washington_Mortgage_Rates/',
        'CrawledPageWasRedirected.js': {
            validator: results => {
                expect(results.status).to.equal(200);
                expect(new URL(results.href).pathname).to.equal('/mortgage-rates/wa/');
            }
        }
    },
    {
        url: 'https://www.zillow.com/Mortgage_Rates/',
        'CrawledPageWasRedirected.js': {
            validator: results => {
                expect(results.status).to.equal(200);
                expect(new URL(results.href).pathname).to.equal('/mortgage-rates/');
            }
        }
    },
    // Calculators
    'https://www.zillow.com/mortgage-calculator/',
    {
        url: 'https://www.zillow.com/mortgage-calculator/house-affordability/',
        'TitleTagCheck.js': {
            validator: ({ clientTitle, serverTitle }) => {
                // ZM-15463: Exception for for this route for this title only. If we change the title, we should shorten it as well.
                expect(serverTitle).to.equal('How Much House Can I Afford - Home Affordability Calculator | Zillow');
                expect(clientTitle).to.equal('How Much House Can I Afford - Home Affordability Calculator | Zillow');
            }
        }
    },
    'https://www.zillow.com/mortgage-calculator/refinance-calculator/',
    'https://www.zillow.com/mortgage-calculator/amortization-schedule-calculator/',
    'https://www.zillow.com/mortgage-calculator/debt-to-income-calculator/',
    {
        url: 'https://www.zillow.com/mortgage-calculator/payment/',
        'CrawledPageWasRedirected.js': {
            validator: results => {
                expect(results.status).to.equal(200);
                expect(new URL(results.href).pathname).to.equal('/mortgage-calculator/');
            }
        }
    },
    // Legacy Long form
    {
        url: 'https://www.zillow.com/pre-approval/',
        'CanonicalLinkMatchesUrl.js': canonicalValidator('/home-loans/pre-approval/')
    },
    {
        url: 'https://www.zillow.com/home-loans/#/pre-approval',
        'CanonicalLinkMatchesUrl.js': canonicalValidator('/home-loans/pre-approval/')
    },
    {
        url: 'https://www.zillow.com/pre-qualify/',
        'CanonicalLinkMatchesUrl.js': canonicalValidator('/home-loans/pre-qualify/')
    },
    {
        url: 'https://www.zillow.com/home-loans/#/pre-qualify',
        'CanonicalLinkMatchesUrl.js': canonicalValidator('/home-loans/pre-qualify/')
    },
    {
        url: 'https://www.zillow.com/home-loans/#/landing',
        'CanonicalLinkMatchesUrl.js': canonicalValidator('/home-loans/')
    },
    {
        url: 'https://www.zillow.com/home-loans/#/purchase',
        'CanonicalLinkMatchesUrl.js': canonicalValidator('/home-loans/purchase/')
    },
    {
        url: 'https://www.zillow.com/home-loans/#/refinance',
        'CanonicalLinkMatchesUrl.js': canonicalValidator('/home-loans/refinance/')
    },
    {
        url: 'https://www.zillow.com/home-loans/#/va',
        'CanonicalLinkMatchesUrl.js': canonicalValidator('/home-loans/va/')
    },
    // Long form
    'https://www.zillow.com/home-loans/',
    'https://www.zillow.com/home-loans/pre-approval/',
    'https://www.zillow.com/home-loans/pre-qualify/',
    'https://www.zillow.com/home-loans/purchase/',
    'https://www.zillow.com/home-loans/refinance/',
    'https://www.zillow.com/home-loans/va/',
    'https://www.zillow.com/home-loans/heloc/',
    // Lenders
    'https://www.zillow.com/advertising/mortgage/',
    'https://www.zillow.com/lender-directory/al/',
    'https://www.zillow.com/lender-directory/al/akron/',
    // Browse
    'https://www.zillow.com/mortgage/browse/',
    {
        url: 'https://www.zillow.com/mortgage/browse/?ratesType=rates&stateAbbr=al',
        'CanonicalLinkMatchesUrl.js': canonicalValidator('/mortgage/browse/')
    },
    {
        url: 'https://www.zillow.com/mortgage/browse/?ratesType=refinance&stateAbbr=al',
        'CanonicalLinkMatchesUrl.js': canonicalValidator('/mortgage/browse/')
    },
    {
        url: 'https://www.zillow.com/mortgage/browse/?ratesType=lenders&stateAbbr=al',
        'CanonicalLinkMatchesUrl.js': canonicalValidator('/mortgage/browse/')
    }
];

module.exports = {
    hostname: 'https://www.mm1.zillow.net/',
    urls: URLS
};
