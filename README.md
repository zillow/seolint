# SEOLint

SEOLint is a linting tool for validating SEO best practices on your web pages.
The tool supports both server-side and client-side rendered web pages.

## Installation

SEOLint requires node version 6.5.0 or greater. We highly recommend [nvm](https://github.com/creationix/nvm) for installing node.
Once you have node/npm, you can install SEOLint globally with the following command:

```bash
npm install -g seolint
```

## Usage

To run SEOLint on a single url:

```bash
seolint https://www.zillow.com/
```

To run with a configuration file:

```bash
seolint --config seolint.config.js
```

To see the full usage information:

```bash
seolint --help
```

## seolint.config.js

SEOLint supports JavaScript and JSON configuration files.

```javascript
const expect = require('chai').expect;

module.exports = {
    // {array} url configurations
    url: [
        // {string} url with default configuration
        'https://www.zillow.com/',

        // {object} custom url configuration
        {
            // {string} url
            url: 'https://www.zillow.com/mortgage-rates/',

            // {object} custom test configuration
            'TitleTagCheck.js': {

                // {function} override the default parser
                parser: (url, clientPage, serverPage) => ({ myClientTitle: 'foo', myServerTitle: 'foo' }),

                // {function} override the default validator
                validator: ({ myClientTitle, myServerTitle }) => { expect(myClientTitle).to.equal(myServerTitle); }
            }
        }
    ],

    // {string} force all urls to use this hostname
    hostname: 'https://www.zillow.com/'
}
```

## SEO Tests

Below are the tests run for every url you give to SEOLint. Each test consists of a parser and a validator function.
After SEOLint renders your page, it passes the client and server content as strings to the parser function,
the result of which is passed to the validator.
You can override the parser and/or the validator in your configuration file for custom behavior.

### H1TagCheck.js

Verifies that the page has one and only one `<h1>` tag.

#### `parser => { clientH1s, serverH1s }`

* `clientH1s` (`array`): Array of h1 text strings found on the client rendering
* `serverH1s` (`array`): Array of h1 text strings found on the server rendering

### TitleTagCheck.js

Verifies that the page has a `<title>` tag with an appropriate length (no more than 60 characters).

* https://moz.com/learn/seo/title-tag

#### `parser => { clientTitle, serverTitle }`

* `clientTitle` (`string`): The client rendered title text
* `serverTitle` (`string`): The server rendered title text

## Server-side vs Client-side Rendering

In the past, server-side rendering was considered mandatory for search engines to be able to crawl your website.
Nowadays, search engines are very capable at crawling client-side rendered applications,
however there are still some small descrepancies that SEOLint tries to identify.
Most of the time these descrepancies come when your client-side application overwrites content that the server-side already produced (for example a meta description).
We have found that it is important that either your client-side rendered application produces the same output as the the server-side rendering,
or the values should be omitted by the server and written only by the client;
SEOLint will validate server-side and client-side content whenever applicable.
