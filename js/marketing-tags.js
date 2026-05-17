/*!
 * marketing-tags.js
 *
 * Loads Meta Pixel + LinkedIn Insight Tag, gated by Google Consent Mode v2
 * (ad_storage = granted). Each tag only loads if its ID is configured.
 *
 * To activate, set the relevant ID on `window` BEFORE this script runs
 * (in a small inline <script> in <head>):
 *
 *   window.META_PIXEL_ID = '123456789012345';        // 15-digit Meta pixel ID
 *   window.LINKEDIN_PARTNER_ID = '1234567';           // 7-digit LinkedIn partner ID
 *   window.GOOGLE_ADS_CONVERSION_ID = 'AW-XXXXXXX';   // Google Ads (optional)
 *   window.GOOGLE_ADS_LEAD_LABEL = 'AbCdEfGhIjk';     // Google Ads lead conversion label
 *   window.HOTJAR_SITE_ID = '1234567';                // Hotjar (heatmaps + recordings)
 *   window.CLARITY_PROJECT_ID = 'abcdef1234';         // Microsoft Clarity (free heatmaps + recordings)
 *
 * The script listens for a `consent:granted` event that the cookie banner
 * fires when the user accepts. It will also auto-fire if consent was
 * previously granted (read from localStorage 'mc:consent:v1').
 */
(function () {
    'use strict';

    var STATE = { loaded: { meta: false, linkedin: false, googleAds: false, hotjar: false, clarity: false } };

    function consentGranted() {
        try { return localStorage.getItem('mc:consent:v1') === 'accept'; }
        catch (e) { return false; }
    }

    function loadScript(src, attrs) {
        var s = document.createElement('script');
        s.src = src;
        s.async = true;
        if (attrs) { for (var k in attrs) s.setAttribute(k, attrs[k]); }
        var first = document.getElementsByTagName('script')[0];
        first.parentNode.insertBefore(s, first);
        return s;
    }

    function loadMetaPixel(id) {
        if (STATE.loaded.meta || !id) return;
        STATE.loaded.meta = true;
        // Standard Meta Pixel snippet, slightly compacted.
        !function (f, b, e, v, n, t, s) {
            if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
            if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
            t = b.createElement(e); t.async = !0; t.src = v;
            s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
        }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        window.fbq('init', id);
        window.fbq('track', 'PageView');
    }

    function loadLinkedInInsight(partnerId) {
        if (STATE.loaded.linkedin || !partnerId) return;
        STATE.loaded.linkedin = true;
        window._linkedin_partner_id = String(partnerId);
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push(window._linkedin_partner_id);
        (function (l) {
            if (!l) {
                window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); };
                window.lintrk.q = [];
            }
            loadScript('https://snap.licdn.com/li.lms-analytics/insight.min.js');
        })(window.lintrk);
    }

    function loadGoogleAds(awId) {
        if (STATE.loaded.googleAds || !awId || typeof gtag !== 'function') return;
        STATE.loaded.googleAds = true;
        loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(awId));
        gtag('config', awId);
    }

    function loadHotjar(siteId) {
        if (STATE.loaded.hotjar || !siteId) return;
        STATE.loaded.hotjar = true;
        (function (h, o, t, j, a, r) {
            h.hj = h.hj || function () { (h.hj.q = h.hj.q || []).push(arguments); };
            h._hjSettings = { hjid: siteId, hjsv: 6 };
            a = o.getElementsByTagName('head')[0];
            r = o.createElement('script'); r.async = 1;
            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
            a.appendChild(r);
        })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
    }

    function loadClarity(projectId) {
        if (STATE.loaded.clarity || !projectId) return;
        STATE.loaded.clarity = true;
        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
            t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
            y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, document, 'clarity', 'script', projectId);
    }

    function maybeLoadAll() {
        if (!consentGranted()) return;
        loadMetaPixel(window.META_PIXEL_ID);
        loadLinkedInInsight(window.LINKEDIN_PARTNER_ID);
        loadGoogleAds(window.GOOGLE_ADS_CONVERSION_ID);
        loadHotjar(window.HOTJAR_SITE_ID);
        loadClarity(window.CLARITY_PROJECT_ID);
    }

    function fireGoogleAdsLead(event) {
        var awId = window.GOOGLE_ADS_CONVERSION_ID || '';
        var label = window.GOOGLE_ADS_LEAD_LABEL || '';
        if (!awId || !label || typeof gtag !== 'function' || !consentGranted()) return;
        loadGoogleAds(awId);
        var detail = event && event.detail || {};
        gtag('event', 'conversion', {
            send_to: awId + '/' + label,
            value: detail.value || 500,
            currency: detail.currency || 'EUR',
            event_callback: function () {}
        });
    }

    document.addEventListener('consent:granted', maybeLoadAll, { once: false });
    document.addEventListener('musicangel:lead', fireGoogleAdsLead, { once: false });
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', maybeLoadAll);
    } else {
        maybeLoadAll();
    }
})();
