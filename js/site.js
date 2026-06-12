/*!
 * MusicAngel site behaviour.
 * Centralises consent, enquiry handling, and lightweight engagement tracking.
 */
(function () {
    'use strict';

    var FORM_LOADED_AT = Date.now();
    var ENQUIRY_ENDPOINT = window.MUSICANGEL_ENQUIRY_ENDPOINT || '/api/enquiry';
    var ENQUIRY_FALLBACK_ENDPOINT = window.MUSICANGEL_ENQUIRY_FALLBACK_ENDPOINT || 'https://musicangelt.pages.dev/api/enquiry';
    var CONTACT_EMAIL = window.MUSICANGEL_CONTACT_EMAIL || 'jo.musicangel@gmail.com';
    var CC_KEY = 'mc:consent:v1';
    var ATTRIBUTION_KEY = 'mc:paid-attribution:v1';
    var SESSION_ATTRIBUTION_KEY = 'mc:session-attribution:v1';
    var SESSION_ID_KEY = 'mc:session-id:v1';
    var ATTRIBUTION_PARAMS = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_term', 'utm_content',
        'utm_adgroup', 'utm_matchtype', 'utm_network',
        'gclid', 'gbraid', 'wbraid',
        'gad_source', 'gad_campaignid', 'gad_adgroupid', 'gad_creativeid',
        'gad_keyword', 'gad_matchtype', 'gad_network',
        'msclkid', 'fbclid', 'li_fat_id'
    ];
    var SEARCH_HOSTS = [
        'google.', 'bing.', 'yahoo.', 'duckduckgo.', 'ecosia.', 'search.brave.', 'search.yahoo.'
    ];

    function track(eventName, params) {
        if (typeof window.gtag !== 'function') return;
        window.gtag('event', eventName, params || {});
    }

    function hasMarketingConsent() {
        try { return localStorage.getItem(CC_KEY) === 'accept'; }
        catch (e) { return false; }
    }

    function attributionFromUrl() {
        var params = new URLSearchParams(window.location.search);
        var data = {};
        ATTRIBUTION_PARAMS.forEach(function (key) {
            if (params.has(key)) data[key] = params.get(key);
        });
        return data;
    }

    function rootHost(value) {
        try {
            return new URL(value, window.location.origin).hostname.replace(/^www\./i, '').toLowerCase();
        } catch (e) {
            return '';
        }
    }

    function isInternalReferrer(value) {
        if (!value) return false;
        return rootHost(value) === rootHost(window.location.href);
    }

    function isSearchReferrer(value) {
        var host = rootHost(value);
        if (!host) return false;
        return SEARCH_HOSTS.some(function (needle) {
            return host.indexOf(needle) !== -1;
        });
    }

    function classifyAttribution(data) {
        var medium = String(data.utm_medium || '').toLowerCase();
        var source = String(data.utm_source || '').toLowerCase();
        var firstReferrer = data.first_external_referrer || data.first_landing_referrer || '';

        if (data.gclid || data.gbraid || data.wbraid || (source === 'google' && /^(cpc|ppc|paid|paid_search)$/.test(medium))) {
            return {
                attribution_source: 'google_ads',
                attribution_source_detail: data.utm_term ? 'keyword=' + data.utm_term : 'paid click id present'
            };
        }

        if (isSearchReferrer(firstReferrer)) {
            return {
                attribution_source: 'organic_search',
                attribution_source_detail: rootHost(firstReferrer)
            };
        }

        if (firstReferrer && !isInternalReferrer(firstReferrer) && firstReferrer !== '(direct)') {
            return {
                attribution_source: 'referral',
                attribution_source_detail: rootHost(firstReferrer) || firstReferrer
            };
        }

        if (firstReferrer === '(direct)' || !firstReferrer) {
            return {
                attribution_source: 'direct_or_unknown',
                attribution_source_detail: 'No external referrer captured'
            };
        }

        return {
            attribution_source: 'internal_unknown',
            attribution_source_detail: 'Session first referrer was internal'
        };
    }

    function deviceClass() {
        var ua = navigator.userAgent || '';
        if (/iPad|Tablet/i.test(ua)) return 'tablet';
        if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'mobile';
        return 'desktop';
    }

    function sessionId() {
        try {
            var existing = sessionStorage.getItem(SESSION_ID_KEY);
            if (existing) return existing;
            var id = 'mas-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
            sessionStorage.setItem(SESSION_ID_KEY, id);
            return id;
        } catch (e) {
            return '';
        }
    }

    function readSessionAttribution() {
        try {
            var stored = JSON.parse(sessionStorage.getItem(SESSION_ATTRIBUTION_KEY) || '{}');
            return stored && typeof stored === 'object' ? stored : {};
        } catch (e) {
            return {};
        }
    }

    function saveSessionAttribution() {
        var stored = readSessionAttribution();
        var current = attributionFromUrl();
        var now = new Date().toISOString();
        var referrer = document.referrer || '';
        var firstReferrer = stored.first_landing_referrer || referrer || '(direct)';
        var merged = Object.assign({}, stored, current, {
            first_landing_page: stored.first_landing_page || window.location.href,
            first_landing_referrer: firstReferrer,
            first_external_referrer: stored.first_external_referrer || (referrer && !isInternalReferrer(referrer) ? referrer : ''),
            landing_page: window.location.href,
            landing_referrer: referrer || '',
            attribution_updated_at: now
        });

        Object.assign(merged, classifyAttribution(merged));
        try { sessionStorage.setItem(SESSION_ATTRIBUTION_KEY, JSON.stringify(merged)); } catch (e) {}
        return merged;
    }

    function readStoredAttribution() {
        if (!hasMarketingConsent()) return {};
        try {
            var stored = JSON.parse(localStorage.getItem(ATTRIBUTION_KEY) || '{}');
            return stored && typeof stored === 'object' ? stored : {};
        } catch (e) {
            return {};
        }
    }

    function saveCurrentAttribution() {
        if (!hasMarketingConsent()) return;
        var current = attributionFromUrl();
        if (!Object.keys(current).length) return;
        var stored = readStoredAttribution();
        var merged = Object.assign({}, stored, current, {
            first_landing_page: stored.first_landing_page || stored.landing_page || window.location.href,
            first_landing_referrer: stored.first_landing_referrer || stored.landing_referrer || document.referrer || '',
            landing_page: window.location.href,
            landing_referrer: document.referrer || '',
            attribution_updated_at: new Date().toISOString()
        });
        try { localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(merged)); } catch (e) {}
    }

    function setupConsent() {
        var cc = document.getElementById('cc');
        if (!cc) return;

        function applyConsent(decision) {
            try { localStorage.setItem(CC_KEY, decision); } catch (e) {}
            var granted = decision === 'accept' ? 'granted' : 'denied';
            if (typeof window.gtag === 'function') {
                window.gtag('consent', 'update', {
                    ad_storage: granted,
                    ad_user_data: granted,
                    ad_personalization: granted,
                    analytics_storage: granted
                });
            }
            if (decision === 'accept') {
                saveCurrentAttribution();
                document.dispatchEvent(new CustomEvent('consent:granted'));
            }
            cc.classList.remove('visible');
            setTimeout(function () { cc.hidden = true; }, 250);
        }

        var saved = null;
        try { saved = localStorage.getItem(CC_KEY); } catch (e) {}
        if (saved === 'accept' || saved === 'decline') {
            applyConsent(saved);
        } else {
            cc.hidden = false;
            requestAnimationFrame(function () { cc.classList.add('visible'); });
        }

        cc.addEventListener('click', function (event) {
            var btn = event.target.closest('[data-cc]');
            if (btn) applyConsent(btn.getAttribute('data-cc'));
        });
    }

    function enrichPayload(data, formId) {
        data._t = FORM_LOADED_AT;
        data.page = window.location.href;
        data.referrer = document.referrer || '';
        data.device = deviceClass();
        data.viewport = window.innerWidth + 'x' + window.innerHeight;
        data.user_agent = navigator.userAgent || '';
        data.form_id = formId || '';
        data.session_id = sessionId();

        Object.assign(data, readSessionAttribution(), readStoredAttribution(), attributionFromUrl());
        Object.assign(data, classifyAttribution(data));
        return data;
    }

    function buildMailto(data) {
        var subject = encodeURIComponent('Wedding enquiry: MusicAngel' + (data.band ? ' - ' + data.band : ''));
        var body = [
            'Name: ' + (data.name || ''),
            "Partner: " + (data.partner || ''),
            'Email: ' + (data.email || ''),
            'Phone: ' + (data.phone || ''),
            'Wedding Date: ' + (data.date || ''),
            'Venue: ' + (data.venue || ''),
            'Band: ' + (data.band || ''),
            '',
            'Message:',
            data.message || '',
            '',
            'Source page: ' + (data.page || window.location.href),
            'Referrer: ' + (data.referrer || ''),
            'Device: ' + (data.device || ''),
            'Viewport: ' + (data.viewport || ''),
            'Lead source: ' + (data.attribution_source || ''),
            'Lead source detail: ' + (data.attribution_source_detail || ''),
            'First landing page: ' + (data.first_landing_page || ''),
            'First landing referrer: ' + (data.first_landing_referrer || '')
        ].join('\n');

        return 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + encodeURIComponent(body);
    }

    function submitWithTimeout(endpoint, payload) {
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, 7000);

        return fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        }).finally(function () {
            clearTimeout(timer);
        });
    }

    async function submitPayload(payload) {
        var endpoints = [ENQUIRY_ENDPOINT];
        if (ENQUIRY_FALLBACK_ENDPOINT && endpoints.indexOf(ENQUIRY_FALLBACK_ENDPOINT) === -1) {
            endpoints.push(ENQUIRY_FALLBACK_ENDPOINT);
        }

        var lastError = null;
        for (var i = 0; i < endpoints.length; i += 1) {
            try {
                var res = await submitWithTimeout(endpoints[i], payload);
                if (res.ok) return res;

                // Validation failures are real responses. Infrastructure failures
                // such as GitHub Pages 404s should fall through to the backup API.
                if (res.status >= 400 && res.status < 500 && [401, 404, 405].indexOf(res.status) === -1) {
                    return res;
                }
                lastError = new Error('HTTP ' + res.status);
            } catch (err) {
                lastError = err;
            }
        }
        throw lastError || new Error('No enquiry endpoint available');
    }

    function setupForms() {
        var forms = document.querySelectorAll('form#enquiry, form#enquiryForm, form[data-enquiry]');
        forms.forEach(function (form) {
            var formStarted = false;
            function trackFormStart() {
                if (formStarted) return;
                formStarted = true;
                track('form_start', {
                    form_id: form.getAttribute('id') || form.getAttribute('data-enquiry') || 'enquiry',
                    page_path: window.location.pathname
                });
            }
            form.addEventListener('focusin', trackFormStart, { once: true });
            form.addEventListener('input', trackFormStart, { once: true });

            form.addEventListener('submit', async function (event) {
                event.preventDefault();

                var btn = form.querySelector('button[type="submit"]');
                var status = form.querySelector('.form-status') || document.getElementById('formStatus');
                var original = btn ? btn.innerHTML : '';
                var formId = form.getAttribute('id') || form.getAttribute('data-enquiry') || 'enquiry';
                var data = enrichPayload(Object.fromEntries(new FormData(form).entries()), formId);

                if (btn) {
                    btn.disabled = true;
                    btn.style.opacity = '0.6';
                    btn.textContent = 'Sending...';
                }
                if (status) {
                    status.textContent = '';
                    status.style.color = '';
                }

                track('form_submit_attempt', {
                    form_id: formId,
                    enquiry_band: data.band || '',
                    enquiry_venue: data.venue || '',
                    page_path: window.location.pathname
                });

                try {
                    var res = await submitPayload(data);
                    if (res.ok) {
                        saveCurrentAttribution();
                        track('form_submit', {
                            form_id: formId,
                            enquiry_band: data.band || '',
                            enquiry_venue: data.venue || '',
                            page_path: window.location.pathname
                        });
                        track('generate_lead', {
                            currency: 'EUR',
                            value: 250,
                            form_id: formId,
                            enquiry_band: data.band || '',
                            enquiry_venue: data.venue || ''
                        });
                        document.dispatchEvent(new CustomEvent('musicangel:lead', {
                            detail: {
                                currency: 'EUR',
                                value: 250,
                                form_id: formId,
                                enquiry_band: data.band || '',
                                enquiry_venue: data.venue || '',
                                page_path: window.location.pathname
                            }
                        }));
                        if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
                        if (btn) btn.textContent = 'Sent';
                        if (status) status.textContent = 'Thanks. We will reply within one working day.';
                        return;
                    }
                    throw new Error('HTTP ' + res.status);
                } catch (err) {
                    track('lead_mailto_fallback', {
                        form_id: formId,
                        page_path: window.location.pathname,
                        reason: err && err.name === 'AbortError' ? 'timeout' : 'api_unavailable'
                    });
                    if (status) {
                        status.style.color = '#8f3030';
                        status.textContent = 'Opening your email to finish the enquiry.';
                    }
                    window.location.href = buildMailto(data);
                    if (btn) {
                        btn.disabled = false;
                        btn.style.opacity = '';
                        btn.innerHTML = original;
                    }
                }
            });
        });
    }

    function setupNavigation() {
        var nav = document.getElementById('nav');
        if (nav) {
            var tick = false;
            window.addEventListener('scroll', function () {
                if (tick) return;
                requestAnimationFrame(function () {
                    nav.classList.toggle('scrolled', window.scrollY > 40);
                    tick = false;
                });
                tick = true;
            });
        }

        var toggle = document.getElementById('navToggle');
        var links = document.getElementById('navLinks');
        if (toggle && links) {
            function setMenu(open) {
                links.classList.toggle('open', open);
                toggle.classList.toggle('open', open);
                toggle.setAttribute('aria-expanded', String(open));
                document.body.classList.toggle('menu-open', open);
            }
            toggle.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
            links.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', function () { setMenu(false); });
            });
            window.addEventListener('keydown', function (event) {
                if (event.key === 'Escape') setMenu(false);
            });
        }

        if ('IntersectionObserver' in window) {
            var rvs = document.querySelectorAll('.rv');
            var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('vis');
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
            rvs.forEach(function (el) { obs.observe(el); });
        }

        document.querySelectorAll('.band-entry-expanded, .band-entry').forEach(function (entry, i) {
            entry.style.transitionDelay = (i * 0.08) + 's';
        });
    }

    function setupTracking() {
        document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]').forEach(function (el) {
            el.addEventListener('click', function () {
                var href = el.getAttribute('href') || '';
                var contactType = href.startsWith('tel:') ? 'phone' : 'email';
                track('contact_click', {
                    contact_type: contactType,
                    page_path: window.location.pathname
                });
                document.dispatchEvent(new CustomEvent('musicangel:contact-click', {
                    detail: {
                        currency: 'EUR',
                        value: contactType === 'phone' ? 50 : 25,
                        contact_type: contactType,
                        page_path: window.location.pathname
                    }
                }));
            });
        });

        document.querySelectorAll('a[href*="beat-boutique"], a[href*="sway-social"], a[href*="the-best-men"], a[href*="blacktye"]').forEach(function (el) {
            el.addEventListener('click', function () {
                var href = el.getAttribute('href') || '';
                var text = (el.textContent || href).replace(/\s+/g, ' ').trim();
                track('band_click', {
                    band_name: text || href,
                    link_url: href,
                    page_path: window.location.pathname
                });
            });
        });

        document.querySelectorAll('a[href="#contact"], a[href="/#contact"], a[href="#enquiry"], a[href$="#enquiry"]').forEach(function (el) {
            el.addEventListener('click', function () {
                track('enquiry_cta_click', { page_path: window.location.pathname });
            });
        });
    }

    function setupVideoEmbeds() {
        document.querySelectorAll('[data-video-src]').forEach(function (button) {
            button.addEventListener('click', function () {
                var src = button.getAttribute('data-video-src') || '';
                var title = button.getAttribute('data-video-title') || 'MusicAngel showreel video';
                if (!src) return;
                track('video_play', {
                    video_title: title,
                    page_path: window.location.pathname
                });

                var iframe = document.createElement('iframe');
                iframe.src = src + (src.indexOf('?') === -1 ? '?' : '&') + 'autoplay=1';
                iframe.title = title;
                iframe.loading = 'lazy';
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
                iframe.referrerPolicy = 'strict-origin-when-cross-origin';
                iframe.allowFullscreen = true;

                var frame = button.parentElement;
                if (frame) frame.replaceChildren(iframe);
            });
        });
    }

    function init() {
        saveSessionAttribution();
        saveCurrentAttribution();
        setupConsent();
        setupNavigation();
        setupForms();
        setupTracking();
        setupVideoEmbeds();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
