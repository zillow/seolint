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
            resolve(resources);
        }, delay);

        resolveResourceWait = _.debounce(() => {
            resolveDelay.cancel();
            clearTimeout(maxWaitTimeout);
            resolve(resources);
        }, resourceWait);

        maxWaitTimeout = setTimeout(() => {
            resolveDelay.cancel();
            resolveResourceWait.cancel();
            resolve(resources);
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

        page.on('onResourceRequested', function(request) {
            const { url } = request;
            if (!(url in resources)) {
                resources[url] = { request };
                resourcesRequested += 1;
            }
            updateResolve();
        });

        page.on('onResourceReceived', function(response) {
            const { url } = response;
            if (url in resources && !resources[url].response) {
                resources[url].response = response;
                resourcesReceived += 1;
                updateResolve();
            }
        });
    });
};
