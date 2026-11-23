'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const siteScript = fs.readFileSync(path.join(root, 'js/site.js'), 'utf8');

function loadForm(page, responses, { hostname = 'musicangel.ie', tracker = true } = {}) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    const [formTag] = html.match(/<form\b[^>]*(?:id="enquiry(?:Form)?"|data-enquiry="[^"]+")[^>]*>/);
    const handlers = {};
    const button = { style: {} };
    const status = { style: {} };
    const events = [];
    const requests = [];
    const location = new URL(`https://${hostname}/${page}`);
    const form = {
        addEventListener: (name, handler) => { handlers[name] = handler; },
        getAttribute: name => formTag.match(new RegExp(`${name}="([^"]+)"`))?.[1],
        querySelector: selector => selector === '.form-status' ? status : button
    };
    const document = {
        querySelectorAll: selector => selector.startsWith('form') ? [form] : [],
        getElementById: () => null,
        dispatchEvent: () => {},
        referrer: ''
    };
    vm.runInNewContext(siteScript, {
        window: { location, umami: tracker ? { track: (...args) => events.push(args) } : undefined },
        document,
        fetch: async endpoint => {
            requests.push(endpoint);
            return responses.shift();
        },
        navigator: { userAgent: '' },
        FormData: class {
            entries() { return Object.entries({ name: 'Example Test', email: 'test@example.test' }); }
        },
        AbortController, CustomEvent, setTimeout, clearTimeout, URL, URLSearchParams
    });
    return { submit: () => handlers.submit({ preventDefault() {} }), button, status, events, requests };
}

function accepted(leadStore = 'stored') {
    return Response.json({ ok: true, lead_id: 'test-lead', lead_store: leadStore });
}

const flushEvents = () => new Promise(resolve => setImmediate(resolve));

for (const page of ['index.html', 'check-availability/index.html', 'song-list/index.html']) {
    test(`${page} records one event for an accepted enquiry`, async () => {
        const form = loadForm(page, [accepted()]);
        await Promise.all([form.submit(), form.submit()]);
        await flushEvents();
        assert.deepEqual(form.requests, ['/api/enquiry']);
        assert.deepEqual(form.events, [['enquiry_submit']]);
        assert.equal(form.button.textContent, 'Sent');
    });
}

test('backup API acceptance records one event', async () => {
    const form = loadForm('index.html', [new Response(null, { status: 503 }), accepted('not_stored')]);
    await form.submit();
    await flushEvents();
    assert.equal(form.requests.length, 2);
    assert.deepEqual(form.events, [['enquiry_submit']]);
});

test('silent rejections and unsuccessful responses record no event', async () => {
    for (const response of [
        Response.json({ ok: true }),
        Response.json({ ok: true, lead_id: 'spam-test' }),
        new Response('not an API response'),
        new Response(null, { status: 400 })
    ]) {
        const form = loadForm('index.html', [response]);
        await form.submit();
        await flushEvents();
        assert.deepEqual(form.events, []);
    }
});

test('previews and unavailable analytics leave successful form handling intact', async () => {
    for (const options of [{ hostname: 'musicangelt.pages.dev' }, { tracker: false }]) {
        const form = loadForm('index.html', [accepted()], options);
        await form.submit();
        await flushEvents();
        assert.deepEqual(form.events, []);
        assert.equal(form.button.textContent, 'Sent');
    }
});
