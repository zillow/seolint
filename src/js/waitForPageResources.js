const _ = require('lodash');

/**
 * Given a phantom page, return a promise that resolves when
 * all the page resources have loaded.
 *
 * @param page Phantom page
 * @param delay {number} Milliseconds after all resources have been received
 *   before resolving
 * @param resourceWait {number} Timeout after requesting a resource that
 *   was never received
 * @param maxWait {number} Max wait time before resolving the promise
 */
module.exports = (page, delay = 5000, resourceWait = 10000, maxWait = 30000) => {
    return new Promise(resolve => {
        const resources = {};
        let resourcesRequested = 0;
        let resourcesReceived = 0;

        let resolveResourceWait;
        let maxWaitTimeout;

        const resolveDelay = _.debounce(() => {
            resolveResourceWait.cancel();
            clearTimeout(maxWaitTimeout);
            resolve();
        }, delay);

        resolveResourceWait = _.debounce(() => {
            resolveDelay.cancel();
            clearTimeout(maxWaitTimeout);
            resolve();
        }, resourceWait);

        maxWaitTimeout = setTimeout(() => {
            resolveDelay.cancel();
            resolveResourceWait.cancel();
            resolve();
        }, maxWait);

        const updateResolve = () => {
            if (resourcesRequested === resourcesReceived) {
                resolveResourceWait.cancel();
                resolveDelay();
            } else {
                resolveDelay.cancel();
                resolveResourceWait();
            }
        };

        page.on('onResourceRequested', function({ url }) {
            if (!(url in resources)) {
                resources[url] = false;
                resourcesRequested += 1;
            }
            updateResolve();
        });

        page.on('onResourceReceived', function({ url }) {
            if (url in resources && !resources[url]) {
                resources[url] = true;
                resourcesReceived += 1;
                updateResolve();
            }
        });
    });
};
