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
            return node.text();
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
    }
};
