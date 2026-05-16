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

    function track(eventName, params) {
        if (typeof window.gtag !== 'function') return;
        window.gtag('event', eventName, params || {});
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

    function enrichPayload(data) {
        data._t = FORM_LOADED_AT;
        data.page = window.location.href;
        data.referrer = document.referrer || '';

        var params = new URLSearchParams(window.location.search);
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(function (key) {
            if (params.has(key)) data[key] = params.get(key);
        });
        return data;
    }

    function buildMailto(data) {
        var subject = encodeURIComponent('Wedding enquiry: MusicAngel' + (data.band ? ' - ' + data.band : ''));
        var body = [
            'Name: ' + (data.name || ''),
            "Partner: " + (data.partner || ''),
            'Email: ' + (data.email || ''),
            'Wedding Date: ' + (data.date || ''),
            'Venue: ' + (data.venue || ''),
            'Band: ' + (data.band || ''),
            '',
            'Message:',
            data.message || '',
            '',
            'Source page: ' + (data.page || window.location.href),
            'Referrer: ' + (data.referrer || '')
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
            form.addEventListener('submit', async function (event) {
                event.preventDefault();

                var btn = form.querySelector('button[type="submit"]');
                var status = form.querySelector('.form-status') || document.getElementById('formStatus');
                var original = btn ? btn.innerHTML : '';
                var data = enrichPayload(Object.fromEntries(new FormData(form).entries()));
                var formId = form.getAttribute('id') || form.getAttribute('data-enquiry') || 'enquiry';

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
                        track('form_submit', {
                            form_id: formId,
                            enquiry_band: data.band || '',
                            enquiry_venue: data.venue || '',
                            page_path: window.location.pathname
                        });
                        track('generate_lead', {
                            currency: 'EUR',
                            value: 500,
                            form_id: formId,
                            enquiry_band: data.band || '',
                            enquiry_venue: data.venue || ''
                        });
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
                track('contact_click', {
                    contact_type: href.startsWith('tel:') ? 'phone' : 'email',
                    page_path: window.location.pathname
                });
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

    function init() {
        setupConsent();
        setupNavigation();
        setupForms();
        setupTracking();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
