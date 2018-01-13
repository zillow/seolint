const sinon = require('sinon');
const expect = require('chai').expect;
const SynchronousPromise = require('synchronous-promise').SynchronousPromise;
const waitForPageResources = require('../waitForPageResources');

const DEFAULT_DELAY = 3000;
const DEFAULT_RESOURCE_WAIT = 10000;
const DEFAULT_MAX_WAIT = 30000;

describe('waitForPageResources', () => {
    let callbacks;
    let page;
    let requestResource;
    let receiveResource;
    let clock;

    beforeEach(() => {
        SynchronousPromise.installGlobally();

        // Mock the phantom page callbacks
        callbacks = {};
        page = {
            on: (event, fn) => {
                callbacks[event] = fn;
            }
        };

        // Test functions for simulating resource events
        requestResource = resource => {
            callbacks.onResourceRequested({ url: resource });
        };
        receiveResource = resource => {
            callbacks.onResourceReceived({ url: resource });
        };

        // Mock timers
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        callbacks = null;
        page = null;
        requestResource = null;
        receiveResource = null;
        clock.restore();
        SynchronousPromise.uninstallGlobally();
    });

    it('requests resource twice, receives it only once', () => {
        const resolved = sinon.stub();
        waitForPageResources(page, DEFAULT_DELAY, DEFAULT_RESOURCE_WAIT, DEFAULT_MAX_WAIT).then(resolved);

        requestResource('foo');
        clock.tick(500);
        requestResource('foo'); // should not wait for this resources
        receiveResource('foo');
        clock.tick(2999);
        expect(resolved.called).to.equal(false);
        clock.tick(1);
        expect(resolved.calledOnce).to.equal(true);
    });

    it('requests resource once, recieves it twice', () => {
        const resolved = sinon.stub();
        waitForPageResources(page, DEFAULT_DELAY, DEFAULT_RESOURCE_WAIT, DEFAULT_MAX_WAIT).then(resolved);

        requestResource('foo');
        receiveResource('foo');
        clock.tick(500);
        receiveResource('foo'); // this should not further delay resolve
        clock.tick(2499);
        expect(resolved.called).to.equal(false);
        clock.tick(1);
        expect(resolved.calledOnce).to.equal(true);
    });

    it('reaches max timeout', () => {
        const resolved = sinon.stub();
        waitForPageResources(page, DEFAULT_DELAY, DEFAULT_RESOURCE_WAIT, DEFAULT_MAX_WAIT).then(resolved);

        requestResource('foo');
        clock.tick(9999);
        expect(resolved.called).to.equal(false);

        requestResource('bar'); // reset resource timer
        clock.tick(9999);
        expect(resolved.called).to.equal(false);

        requestResource('baz'); // reset resource timer
        clock.tick(9999);
        expect(resolved.called).to.equal(false);

        requestResource('foofoo'); // reset resource timer
        clock.tick(3);
        expect(resolved.calledOnce, 'hits max timer').to.equal(true);
    });

    it('timeouts on missing requested resources', () => {
        const resolved = sinon.stub();
        waitForPageResources(page, DEFAULT_DELAY, DEFAULT_RESOURCE_WAIT, DEFAULT_MAX_WAIT).then(resolved);

        requestResource('foo');
        clock.tick(9999);
        expect(resolved.called).to.equal(false);
        clock.tick(1);
        expect(resolved.calledOnce).to.equal(true);
    });

    it('delays after receiving last requested resource', () => {
        const resolved = sinon.stub();
        waitForPageResources(page, DEFAULT_DELAY, DEFAULT_RESOURCE_WAIT, DEFAULT_MAX_WAIT).then(resolved);

        requestResource('foo');
        clock.tick(9999);
        expect(resolved.called).to.equal(false);

        receiveResource('foo');
        clock.tick(1);
        expect(resolved.called).to.equal(false);
        clock.tick(2998);
        expect(resolved.called).to.equal(false);
        clock.tick(1);
        expect(resolved.calledOnce).to.equal(true);
    });

    it('cancels timers after max timeout', () => {
        const resolved = sinon.stub();
        waitForPageResources(page, DEFAULT_DELAY, DEFAULT_RESOURCE_WAIT, DEFAULT_MAX_WAIT).then(resolved);

        requestResource('foo');
        clock.tick(9999);
        expect(resolved.called).to.equal(false);

        requestResource('bar'); // reset resource timer
        clock.tick(9999);
        expect(resolved.called).to.equal(false);

        requestResource('baz'); // reset resource timer
        clock.tick(9999);
        expect(resolved.called).to.equal(false);

        requestResource('foofoo'); // reset resource timer
        clock.tick(3);
        expect(resolved.called, 'hits max timer').to.equal(true);

        clock.tick(9999999);
        expect(resolved.calledOnce).to.equal(true);
    });

    it('cancels timers after resource timeout', () => {
        const resolved = sinon.stub();
        waitForPageResources(page, DEFAULT_DELAY, DEFAULT_RESOURCE_WAIT, DEFAULT_MAX_WAIT).then(resolved);

        requestResource('foo');
        clock.tick(9999);
        expect(resolved.called).to.equal(false);
        clock.tick(1);
        expect(resolved.calledOnce).to.equal(true);

        clock.tick(9999999);
        expect(resolved.calledOnce).to.equal(true);
    });

    it('cancels timers after delay', () => {
        const resolved = sinon.stub();
        waitForPageResources(page, DEFAULT_DELAY, DEFAULT_RESOURCE_WAIT, DEFAULT_MAX_WAIT).then(resolved);

        requestResource('foo');
        clock.tick(500);
        receiveResource('foo');
        clock.tick(2499);
        expect(resolved.called).to.equal(false);
        clock.tick(1);
        expect(resolved.called).to.equal(false);
        clock.tick(500);
        expect(resolved.calledOnce).to.equal(true);

        clock.tick(9999999);
        expect(resolved.calledOnce).to.equal(true);
    });
});
