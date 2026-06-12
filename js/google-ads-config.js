/*!
 * Google Ads conversion configuration.
 *
 * Google tag ID from Google Ads Data Manager:
 * - MusicAngel: AW-18182768048
 *
 * The account currently uses GA4-imported conversion actions for
 * `generate_lead` and `contact_click`. Direct Google Ads event-snippet labels
 * are intentionally blank until direct website conversion actions exist in the
 * Ads UI. Do not guess labels; Google labels are opaque IDs.
 */
(function () {
    'use strict';

    window.MUSICANGEL_GOOGLE_ADS = {
        conversionId: 'AW-18182768048',
        leadLabel: '',
        contactLabel: ''
    };

    window.GOOGLE_ADS_CONVERSION_ID = window.MUSICANGEL_GOOGLE_ADS.conversionId || window.GOOGLE_ADS_CONVERSION_ID || '';
    window.GOOGLE_ADS_LEAD_LABEL = window.MUSICANGEL_GOOGLE_ADS.leadLabel || window.GOOGLE_ADS_LEAD_LABEL || '';
    window.GOOGLE_ADS_CONTACT_LABEL = window.MUSICANGEL_GOOGLE_ADS.contactLabel || window.GOOGLE_ADS_CONTACT_LABEL || '';
})();
