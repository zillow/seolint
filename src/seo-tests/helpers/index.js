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
        const node = $('title');
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
    }
};
