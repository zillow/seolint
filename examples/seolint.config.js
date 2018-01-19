const { URL } = require('url');
const { expect } = require('chai');

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
        'NoRedirect.js': {
            validator: ({ referer, href }) => {
                expect(new URL(referer).pathname).to.equal('/30_Year_Fixed_Mortgage_Rates/');
                expect(new URL(href).pathname).to.equal('/mortgage-rates/30-year-fixed/');
            }
        }
    },
    {
        url: 'https://www.zillow.com/20_Year_Fixed_Mortgage_Rates/',
        'NoRedirect.js': {
            validator: ({ referer, href }) => {
                expect(new URL(referer).pathname).to.equal('/20_Year_Fixed_Mortgage_Rates/');
                expect(new URL(href).pathname).to.equal('/mortgage-rates/20-year-fixed/');
            }
        }
    },
    {
        url: 'https://www.zillow.com/15_Year_Fixed_Mortgage_Rates/',
        'NoRedirect.js': {
            validator: ({ referer, href }) => {
                expect(new URL(referer).pathname).to.equal('/15_Year_Fixed_Mortgage_Rates/');
                expect(new URL(href).pathname).to.equal('/mortgage-rates/15-year-fixed/');
            }
        }
    },
    {
        url: 'https://www.zillow.com/7-1_ARM_Mortgage_Rates/',
        'NoRedirect.js': {
            validator: ({ referer, href }) => {
                expect(new URL(referer).pathname).to.equal('/7-1_ARM_Mortgage_Rates/');
                expect(new URL(href).pathname).to.equal('/mortgage-rates/7-1-arm/');
            }
        }
    },
    {
        url: 'https://www.zillow.com/5-1_ARM_Mortgage_Rates/',
        'NoRedirect.js': {
            validator: ({ referer, href }) => {
                expect(new URL(referer).pathname).to.equal('/5-1_ARM_Mortgage_Rates/');
                expect(new URL(href).pathname).to.equal('/mortgage-rates/5-1-arm/');
            }
        }
    },
    {
        url: 'https://www.zillow.com/Washington_Mortgage_Rates/',
        'NoRedirect.js': {
            validator: ({ referer, href }) => {
                expect(new URL(referer).pathname).to.equal('/Washington_Mortgage_Rates/');
                expect(new URL(href).pathname).to.equal('/mortgage-rates/wa/');
            }
        }
    },
    {
        url: 'https://www.zillow.com/Mortgage_Rates/',
        'NoRedirect.js': {
            validator: ({ referer, href }) => {
                expect(new URL(referer).pathname).to.equal('/Mortgage_Rates/');
                expect(new URL(href).pathname).to.equal('/mortgage-rates/');
            }
        }
    },
    // Calculators
    'https://www.zillow.com/mortgage-calculator/',
    {
        url: 'https://www.zillow.com/mortgage-calculator/house-affordability/',
        'TitleTag.js': {
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
        'NoRedirect.js': {
            validator: ({ referer, href }) => {
                expect(new URL(referer).pathname).to.equal('/mortgage-calculator/payment/');
                expect(new URL(href).pathname).to.equal('/mortgage-calculator/');
            }
        }
    },
    // Legacy Long form
    {
        url: 'https://www.zillow.com/pre-approval/',
        'Canonical.js': {
            options: {
                expectedPath: '/home-loans/pre-approval/'
            }
        }
    },
    {
        url: 'https://www.zillow.com/home-loans/#/pre-approval',
        'Canonical.js': {
            options: {
                expectedPath: '/home-loans/pre-approval/'
            }
        }
    },
    {
        url: 'https://www.zillow.com/pre-qualify/',
        'Canonical.js': {
            options: {
                expectedPath: '/home-loans/pre-qualify/'
            }
        }
    },
    {
        url: 'https://www.zillow.com/home-loans/#/pre-qualify',
        'Canonical.js': {
            options: {
                expectedPath: '/home-loans/pre-qualify/'
            }
        }
    },
    {
        url: 'https://www.zillow.com/home-loans/#/landing',
        'Canonical.js': {
            options: {
                expectedPath: '/home-loans/'
            }
        }
    },
    {
        url: 'https://www.zillow.com/home-loans/#/purchase',
        'Canonical.js': {
            options: {
                expectedPath: '/home-loans/purchase/'
            }
        }
    },
    {
        url: 'https://www.zillow.com/home-loans/#/refinance',
        'Canonical.js': {
            options: {
                expectedPath: '/home-loans/refinance/'
            }
        }
    },
    {
        url: 'https://www.zillow.com/home-loans/#/va',
        'Canonical.js': {
            options: {
                expectedPath: '/home-loans/va/'
            }
        }
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
        'Canonical.js': {
            options: {
                expectedPath: '/mortgage/browse/'
            }
        }
    },
    {
        url: 'https://www.zillow.com/mortgage/browse/?ratesType=refinance&stateAbbr=al',
        'Canonical.js': {
            options: {
                expectedPath: '/mortgage/browse/'
            }
        }
    },
    {
        url: 'https://www.zillow.com/mortgage/browse/?ratesType=lenders&stateAbbr=al',
        'Canonical.js': {
            options: {
                expectedPath: '/mortgage/browse/'
            }
        }
    }
];

module.exports = {
    hostname: 'https://www.mm1.zillow.net/',
    urls: URLS
};
