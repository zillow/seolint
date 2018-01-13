const createPhantomPool = require('phantom-pool');
const clientRender = require('./clientRender');

function ClientRenderer({ usePhantomPool }) {
    if (usePhantomPool) {
        this.pool = createPhantomPool();
    }
}

ClientRenderer.prototype.render = function(url) {
    if (this.pool) {
        return new Promise((resolve, reject) => {
            this.pool.use(phInstance => {
                clientRender(url, phInstance).then(resolve, reject);
            });
        });
    }
    return clientRender(url);
};

ClientRenderer.prototype.destroy = function() {
    if (this.pool) {
        this.pool.drain().then(() => this.pool.clear());
    }
};

module.exports = ClientRenderer;
