const { URL } = require('url');

/**
 * Test if the given url is valid.
 *
 * @param url {string}
 * @returns {boolean}
 */
const isValidURL = url => {
    try {
        return !!new URL(url);
    } catch (e) {
        return false;
    }
};

/**
 * Test if two urls have the same hostname.
 *
 * @param urlA {string}
 * @param urlB {string}
 * @returns {boolean}
 */
const isSameHostname = (urlA, urlB) => {
    const a = new URL(urlA);
    const b = new URL(urlB);
    return a.hostname === b.hostname;
};

/**
 * Changes the origin of `url` to the origin of `urlBase`.
 *
 * @param url {string}
 * @param urlBase {string}
 * @returns {string}
 */
const resolveURL = (url, urlBase) => {
    const base = new URL(urlBase);
    const resolved = new URL(url, urlBase);
    resolved.host = base.host;
    return resolved.toString();
};

module.exports = {
    resolveURL,
    isSameHostname,
    isValidURL
};
