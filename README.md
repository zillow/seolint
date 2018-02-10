# SEOLint

[![npm version](https://badge.fury.io/js/seolint.svg)](https://badge.fury.io/js/seolint)

SEOLint is a linting tool for validating SEO best practices on your web pages.
The tool supports both [server-side and client-side](https://github.com/zillow/seolint#server-side-vs-client-side-rendering) rendered web pages.

## Installation & Upgrading

SEOLint requires node version 8.3.0 or greater. We highly recommend [nvm](https://github.com/creationix/nvm) for installing node.
Once you have node/npm, you can install/upgrade SEOLint globally with the following command:

```bash
npm install -g seolint@latest
```

## Usage

To run SEOLint on a single url:

```bash
seolint https://www.zillow.com/
```

To run with a [configuration file](https://github.com/zillow/seolint#seolintconfigjs):

```bash
seolint --config seolint.config.js
```

To see the full usage information:

```bash
seolint --help
```

## SEO Rules

Below are the rules run for every url you give to SEOLint. These are general recommendations that you may want to [override with custom behavior](https://github.com/zillow/seolint#rule-customization).

#### H1Tag

Verifies that the page has one and only one `<h1>` tag.

#### TitleTag

Verifies that the page has a `<title>` tag with an appropriate length (no more than 60 characters).

* https://moz.com/learn/seo/title-tag

#### MetaDescription

Verifies that the page has a `<meta name="description" content="" />` tag with an appropriate length (between 50-300 characters).

* https://moz.com/learn/seo/meta-description

#### ImageAltAttribute

Verifies that all `<img>` tags have an alt text attribute.
Decorative images that don't add information to the content of the page should have an empty alt attribute (`alt=""`) so they can be ignored by screen readers.

* https://moz.com/learn/seo/alt-text
* https://www.w3.org/WAI/tutorials/images/decorative/

#### NoRedirect

Verifies that the page was not redirected. You can customize the validator to alternatively verify that the page _was_ redirected.

#### MixedContent

Verifies that the page has no mixed-content resources.

* https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content

#### ConsistentTrailingSlash

Verifies that all the links on your page use consistent trailing slashes.

* https://webmasters.googleblog.com/2010/04/to-slash-or-not-to-slash.html

Note: Inconsistent trailing slashes are not necessarily a bad thing on their own,
you just have to make sure that your redirects are set up correctly and you are linking to the correct version.
Ultimately we want to prevent duplicate content and unnecessary redirects.

#### Canonical

Verifies that the page has one canonical link with a fully resolved url.

* https://webmasters.googleblog.com/2013/04/5-common-mistakes-with-relcanonical.html

## Server-side vs Client-side Rendering

In the past, server-side rendering was considered mandatory for search engines to be able to crawl your website.
Nowadays, search engines are very capable at crawling client-side rendered applications,
however there are still some small discrepancies that SEOLint tries to identify.
Most of the time these discrepancies come when your client-side application overwrites content that the server-side already produced (for example a meta description).
We have found that it is important that either your client-side rendered application produces the same output as the the server-side rendering,
or the values should be omitted by the server and written only by the client;
SEOLint will validate server-side and client-side content whenever applicable.

## seolint.config.js

SEOLint supports JavaScript and JSON configuration files - you can see an example of each in the [examples folder](https://github.com/zillow/seolint/tree/master/examples).

```javascript
const expect = require('chai').expect;
const path = require('path');

module.exports = {
    // {array} url configurations
    urls: [
        // {string} url with default configuration
        'https://www.zillow.com/',

        // {object} custom url configuration
        {
            // {string} url
            url: 'https://www.zillow.com/mortgage-rates/',

            // {object} url rule configurations
            rules: {
                TitleTag: {
                    // {number | string} reporting level for this rule
                    level: 'warn',

                    // {object} rule specific options
                    options: {},

                    // {function} override the default parser
                    parser: (url, clientPage, serverPage) => ({ myClientTitle: 'foo', myServerTitle: 'foo' }),

                    // {function} override the default validator
                    validator: ({ myClientTitle, myServerTitle }) => { expect(myClientTitle).to.equal(myServerTitle); }
                }
            }
        }
    ],

    // {string} force all urls to use this hostname
    hostname: 'https://www.zillow.com/',

    // {string} directory of custom rules to include
    rulesdir: path.join(__dirname, 'path/to/my/rules'),
    
    // {object} global rule configurations
    rules: {
        TitleTag: 'off'
    }
}
```

Note: If you are using a JavaScript configuration file that has third-party module dependencies (e.g. chai), make sure to install those dependencies at the location of your config file, otherwise seolint will fail. It's a good idea to `npm i --save-dev` those dependencies if your seolint config file lives alongside your `package.json`.

## Configuring Rules

You can change the severity of rules by changing the rule level in your configuration. By default, all rules run with an `"error"` level. If any rule fails at the `"error"` level, the program will finish with an exit code of 1. Alternatively, you can run rules at the `"warn"` level which will not trigger an exit code of 1. To turn a rule off completely, set the level to `"off"`.

You can also use numeric levels `2`, `1`, and `0`, for `"error"`, `"warn"`, and `"off"` respectively.

### Global Configuration

To change the level of a rule for all urls, add the configuration at the root of your configuration file:

```javascript
{
    rules: {
          TitleTag: "warn",
          Canonical: "off",
          MixedContent: "error"
    }
}
```

### URL Specific Configuration

You can override global configurations for any given url by adding a rules object to your url configuration:

```javascript
{
    urls: [
        {
            url: 'https://www.zillow.com/',
            rules: {
                TitleTag: "warn",
                Canonical: "off",
                MixedContent: "error"
            }
        }
    ]
}
```

## Advanced Configuration

In some cases, you will want to override the default behavior of rules in your configuration file.
Each rule consists of a parser and a validator function.
After SEOLint renders your page, it passes all the render data to the parser function,
the result of which is passed to the validator.

Client rendering is done with [puppeteer](https://github.com/GoogleChrome/puppeteer) and server rendering is done with [request](https://github.com/request/request).

### `parser(data, options)`

Below is the structure of parser `data`:

```javascript
{
    // {string} The url of the string being tested
    url: '',

    // {object} Data from the client render
    client: {
        // {string} The HTML content rendered by the client
        content: '',

        // {object} Resource data for each requested resource
        resources: {
            'resource url': {
                // {object} The requestData returned from puppeteer's "request" page event
                request: {},

                // {object} The response returned from puppeteers's "response" page event
                response: {}
            }
        }
    },

    // {object} Data from the server render
    server: {
        // {string} The HTML content rendered by the server
        content: '',

        // {object} The response object from the request API
        response: {}
    }
}
```

### `validator(parsed, options)`

Validators are simple functions that take the output of the parser function as input. If the validator runs without throwing an error, the test is successful. If you want the validator to fail, just throw an error. The default validators use the [chai assertion library](http://chaijs.com/api/bdd/) for validating the parsed page data.

### SEO Rule Defaults

SEO rules were broken up into separate parsers and validators so that you can tweak validation conditions without having to re-parse the render data.
You can override the parser, the validator, or both, but be mindful when changing the parser as it will also change the input to the validator.

Below you will find the default return values for all the SEO rules.

#### H1Tag

##### `parser => { clientH1s, serverH1s }`

* `clientH1s` (`array`): Array of h1 text strings found on the client rendering
* `serverH1s` (`array`): Array of h1 text strings found on the server rendering

#### TitleTag

##### `parser => { clientTitle, serverTitle }`

* `clientTitle` (`string`): The client rendered title text
* `serverTitle` (`string`): The server rendered title text

#### MetaDescription

##### `parser => { clientDescription, serverDescription }`

* `clientDescription` (`string`): The client rendered description content
* `serverDescription` (`string`): The server rendered description content

#### ImageAltAttribute

##### `parser => { clientImages, serverImages }`

* `clientImages` (`array`): Array of client rendered image objects including a `src` and `alt` property
* `serverImages` (`array`): Array of server rendered image objects including a `src` and `alt` property

#### NoRedirect

##### `parser => { referer, href }`

* `referer` (`string`): The URL of the referring page that initiated the redirect.
* `href` (`string`): The URL of the resulting page after the redirect.

#### MixedContent

##### `parser => { isSecure, insecureResources }`

* `isSecure` (`boolean`): Is the requested URL a secure page.
* `insecureResources` (`array`): An array of insecure URLs requested by the page.

#### ConsistentTrailingSlash

##### `options`

* `noSlash` (`boolean`): By default, the rule verifies that all links have a trailing slash.
Set this to true to verify that all links do not have a trailing slash.

##### `parser => { hrefsWithoutSlash, hrefs }`

* `hrefsWithoutSlash` (`array`): An array of all hrefs from the same domain that do not have a trailing slash.
* `href` (`array`): An array of all hrefs found on the page.

#### Canonical

##### `options`

* `expectedPath` (`string`): By default, the rule verifies that the canonical matches the page url.
Set this to specify a different expected canonical path.

##### `parser => { url, clientCanonicalsHead, clientCanonicalsBody, serverCanonicalsHead, serverCanonicalsBody }`

* `url` (`string`): The url of final page (after any redirects).
* `clientCanonicalsHead` (`array`): An array of canonical links in the head of the client.
* `clientCanonicalsBody` (`array`): An array of canonical links in the body of the client.
* `serverCanonicalsHead` (`array`): An array of canonical links in the head of the server.
* `serverCanonicalsBody` (`array`): An array of canonical links in the body of the server.

## Custom Rules

You can write your own rules and include them when running tests.
Custom rules follow the same format as the default rules with a `parser` and `validator` function (see the [default rules](https://github.com/zillow/seolint/tree/master/src/rules) or [examples](https://github.com/zillow/seolint/tree/master/examples/rules) for inspiration). To include your rules, specify `rulesdir` in your [configuration file](https://github.com/zillow/seolint#seolintconfigjs) or `--rulesdir` on the command line:

```bash
seolint --rulesdir path/to/my/rules https://www.zillow.com/
```
