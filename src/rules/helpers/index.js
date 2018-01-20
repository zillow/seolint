module.exports = {
    /**
     * @param $ Cheerio instance
     * @return {string[]}
     */
    getH1s: $ => {
        return $('h1')
            .map(function() {
                return $(this)
                    .text()
                    .trim();
            })
            .get();
    },

    /**
     * @param $ Cheerio instance
     * @return {string}
     */
    getTitle: $ => {
        const node = $('head title');
        if (node.length) {
            return node.text().trim();
        }
        return null;
    },

    /**
     * @param $ Cheerio instance
     * @return {string}
     */
    getDescription: $ => {
        const node = $('meta[name="description"]');
        if (node.length) {
            return node.attr('content');
        }
        return null;
    },

    /**
     * @param $ Cheerio instance
     * @param selector {string} Limit the search to the given selector
     * @return {string}
     */
    getCanonicals: ($, selector) => {
        let nodes;
        if (selector) {
            nodes = $(selector).find('link[rel="canonical"]');
        } else {
            nodes = $('link[rel="canonical"]');
        }
        return nodes
            .map(function() {
                const href = $(this).attr('href');
                if (typeof href === 'undefined') {
                    return -1;
                }
                return href;
            })
            .get()
            .map(v => (v === -1 ? null : v));
    },

    /**
     * @param $ Cheerio instance
     * @return {string[]}
     */
    getImageAltAttributes: $ => {
        return $('img')
            .map(function() {
                const alt = $(this).attr('alt');
                if (typeof alt === 'undefined') {
                    // Cheerio map excludes null/undefined values
                    return -1;
                }
                return alt;
            })
            .get()
            .map(v => (v === -1 ? null : v));
    },

    /**
     * @param $ Cheerio instance
     * @return {string[]}
     */
    getHrefs: $ => {
        return $('a')
            .map(function() {
                return $(this).attr('href');
            })
            .get()
            .filter(href => !href.startsWith('javascript:'));
    }
};
