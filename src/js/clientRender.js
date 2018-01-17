const phantom = require('phantom');
const waitForPageResources = require('./waitForPageResources');

/**
 * @param url {string} The url to render
 * @param providedInstance {Phantom} A phantom instance to create pages with.
 *   If not provided, a new phantom instance will be created.
 */
module.exports = function(url, providedInstance) {
    return new Promise((resolve, reject) => {
        let localInstance;
        let localPage;
        let localResources;
        let resourcesPromise;

        // If a phantom instance is already provided, use that to create the page,
        // otherwise create a new phantom instance.
        let createPage;
        if (providedInstance) {
            createPage = providedInstance.createPage();
        } else {
            createPage = phantom.create().then(instance => {
                localInstance = instance;
                return instance.createPage();
            });
        }

        createPage
            .then(page => {
                localPage = page;
                resourcesPromise = waitForPageResources(page);
                return page.open(url);
            })
            .then(status => {
                if (status === 'fail') {
                    throw new Error(`Phantom page failed to open url: ${url}`);
                }
                return resourcesPromise;
            })
            .then(resources => {
                localResources = resources;
                return localPage.property('content');
            })
            .then(content => {
                localPage.close();
                if (localInstance) {
                    localInstance.exit();
                }
                resolve({ content, resources: localResources });
            })
            .catch(error => {
                if (process.env.NODE_ENV === 'development') {
                    console.log(error);
                }

                localPage.close();
                if (localInstance) {
                    localInstance.exit();
                }
                reject(error);
            });
    });
};
