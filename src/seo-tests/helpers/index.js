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
    getTitle: $ => $('title').text()
};
