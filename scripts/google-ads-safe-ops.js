#!/usr/bin/env node

const crypto = require('node:crypto');
const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const API_VERSION = 'v24';
const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env.google-ads.local');

function loadEnv(filePath) {
  const env = {};
  const text = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function requestJson(url, options = {}, body = undefined) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let parsed = null;
        if (text) {
          try {
            parsed = JSON.parse(text);
          } catch (error) {
            reject(new Error(`Non-JSON response ${res.statusCode}: ${text.slice(0, 500)}`));
            return;
          }
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed, null, 2)}`));
          return;
        }
        resolve(parsed);
      });
    });
    req.on('error', reject);
    if (body !== undefined) req.write(body);
    req.end();
  });
}

async function getAccessToken(serviceAccountPath) {
  const key = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/adwords',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(unsigned)
    .sign(key.private_key);
  const assertion = `${unsigned}.${base64url(signature)}`;
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  }).toString();
  const result = await requestJson('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'content-length': Buffer.byteLength(body),
    },
  }, body);
  return result.access_token;
}

function makeClient() {
  const env = loadEnv(ENV_PATH);
  const customerId = (env.GOOGLE_ADS_CLIENT_CUSTOMER_ID || '').replace(/\D/g, '');
  const loginCustomerId = (env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || '').replace(/\D/g, '');
  const developerToken = env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const serviceAccountPath = env.GOOGLE_ADS_JSON_KEY_FILE_PATH || env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!customerId || !developerToken || !serviceAccountPath) {
    throw new Error('Missing Google Ads customer ID, developer token, or service account path in .env.google-ads.local');
  }

  let tokenPromise = null;
  async function headers() {
    tokenPromise ||= getAccessToken(serviceAccountPath);
    const token = await tokenPromise;
    const h = {
      authorization: `Bearer ${token}`,
      'developer-token': developerToken,
      'content-type': 'application/json',
    };
    if (loginCustomerId) h['login-customer-id'] = loginCustomerId;
    return h;
  }

  async function search(query) {
    const body = JSON.stringify({ query });
    const response = await requestJson(`https://googleads.googleapis.com/${API_VERSION}/customers/${customerId}/googleAds:searchStream`, {
      method: 'POST',
      headers: {
        ...(await headers()),
        'content-length': Buffer.byteLength(body),
      },
    }, body);
    return response.flatMap((batch) => batch.results || []);
  }

  async function mutateAdGroupCriteria(operations, validateOnly) {
    const body = JSON.stringify({
      customerId,
      operations,
      validateOnly,
      partialFailure: false,
    });
    return requestJson(`https://googleads.googleapis.com/${API_VERSION}/customers/${customerId}/adGroupCriteria:mutate`, {
      method: 'POST',
      headers: {
        ...(await headers()),
        'content-length': Buffer.byteLength(body),
      },
    }, body);
  }

  async function mutateConversionActions(operations, validateOnly) {
    const body = JSON.stringify({
      customerId,
      operations,
      validateOnly,
      partialFailure: false,
    });
    return requestJson(`https://googleads.googleapis.com/${API_VERSION}/customers/${customerId}/conversionActions:mutate`, {
      method: 'POST',
      headers: {
        ...(await headers()),
        'content-length': Buffer.byteLength(body),
      },
    }, body);
  }

  async function uploadClickConversions(conversions, validateOnly) {
    const body = JSON.stringify({
      customerId,
      conversions,
      partialFailure: true,
      validateOnly,
    });
    return requestJson(`https://googleads.googleapis.com/${API_VERSION}/customers/${customerId}:uploadClickConversions`, {
      method: 'POST',
      headers: {
        ...(await headers()),
        'content-length': Buffer.byteLength(body),
      },
    }, body);
  }

  return { customerId, search, mutateAdGroupCriteria, mutateConversionActions, uploadClickConversions };
}

const SAXOPHONE_NEGATIVE = {
  campaignName: 'Search - Wedding Bands Ireland',
  adGroupName: 'Wedding bands Ireland',
  adGroup: 'customers/8732162982/adGroups/194701048257',
  text: 'wedding saxophone player ireland',
  matchType: 'EXACT',
};

const QUALIFIED_LEAD_ACTION_NAME = 'MusicAngel D1 qualified_lead';
const WRANGLER_BIN = process.env.WRANGLER_BIN || '/Users/lawrence/.npm/_npx/d77349f55c2be1c0/node_modules/wrangler/bin/wrangler.js';

const BRAND_ROUTES = new Map([
  ['the beat boutique wedding band', 'https://musicangel.ie/the-beat-boutique/'],
  ['beat boutique band', 'https://musicangel.ie/the-beat-boutique/'],
  ['sway social wedding band', 'https://musicangel.ie/sway-social/'],
  ['sway social band', 'https://musicangel.ie/sway-social/'],
  ['the best men wedding band', 'https://musicangel.ie/the-best-men/'],
  ['the best men band', 'https://musicangel.ie/the-best-men/'],
  ['blacktye wedding band', 'https://musicangel.ie/blacktye/'],
  ['blacktye band', 'https://musicangel.ie/blacktye/'],
]);

function keywordQuery() {
  return `
    SELECT
      campaign.name,
      ad_group.name,
      ad_group_criterion.resource_name,
      ad_group_criterion.criterion_id,
      ad_group_criterion.status,
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      ad_group_criterion.final_urls
    FROM keyword_view
    WHERE campaign.name = 'Search - Brand & Bands'
      AND ad_group.name = 'Band names'
      AND ad_group_criterion.status != 'REMOVED'
  `;
}

async function landingCheck(client) {
  const query = `
    SELECT
      segments.date,
      landing_page_view.resource_name,
      landing_page_view.unexpanded_final_url,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions
    FROM landing_page_view
    WHERE segments.date BETWEEN '2026-06-17' AND '2026-06-17'
    ORDER BY segments.date DESC, metrics.clicks DESC
  `;
  const rows = await client.search(query);
  const summary = {
    dateRange: '2026-06-17',
    rows: rows.length,
    clicks: 0,
    costMicros: 0,
    conversions: 0,
    ignoreRows: 0,
    ignoreClicks: 0,
    cleanRows: 0,
    cleanClicks: 0,
  };
  const urls = [];
  for (const row of rows) {
    const clicks = Number(row.metrics?.clicks || 0);
    const costMicros = Number(row.metrics?.costMicros || 0);
    const conversions = Number(row.metrics?.conversions || 0);
    const url = row.landingPageView?.unexpandedFinalUrl || '';
    const hasIgnore = url.includes('{ignore}');
    summary.clicks += clicks;
    summary.costMicros += costMicros;
    summary.conversions += conversions;
    if (hasIgnore) {
      summary.ignoreRows += 1;
      summary.ignoreClicks += clicks;
    } else {
      summary.cleanRows += 1;
      summary.cleanClicks += clicks;
    }
    urls.push({
      date: row.segments?.date,
      clicks,
      costEur: +(costMicros / 1000000).toFixed(2),
      conversions,
      hasIgnore,
      url,
    });
  }
  console.log(JSON.stringify({ summary, urls }, null, 2));
}

async function brandSnapshot(client) {
  const rows = await client.search(keywordQuery());
  const mapped = rows.map((row) => ({
    campaign: row.campaign?.name,
    adGroup: row.adGroup?.name,
    resourceName: row.adGroupCriterion?.resourceName,
    criterionId: row.adGroupCriterion?.criterionId,
    status: row.adGroupCriterion?.status,
    keyword: row.adGroupCriterion?.keyword?.text,
    matchType: row.adGroupCriterion?.keyword?.matchType,
    finalUrls: row.adGroupCriterion?.finalUrls || [],
    proposedUrl: BRAND_ROUTES.get((row.adGroupCriterion?.keyword?.text || '').toLowerCase()) || null,
  }));
  console.log(JSON.stringify(mapped, null, 2));
}

function buildBrandOperations(rows) {
  const operations = [];
  const skipped = [];
  for (const row of rows) {
    const criterion = row.adGroupCriterion || {};
    const keyword = (criterion.keyword?.text || '').toLowerCase();
    const targetUrl = BRAND_ROUTES.get(keyword);
    if (!targetUrl) {
      skipped.push({ keyword: criterion.keyword?.text, reason: 'no explicit route' });
      continue;
    }
    const currentUrls = criterion.finalUrls || [];
    if (currentUrls.length === 1 && currentUrls[0] === targetUrl) {
      skipped.push({ keyword: criterion.keyword?.text, reason: 'already routed' });
      continue;
    }
    operations.push({
      update: {
        resourceName: criterion.resourceName,
        finalUrls: [targetUrl],
      },
      updateMask: 'final_urls',
    });
  }
  return { operations, skipped };
}

async function routeBrand(client, validateOnly) {
  const rows = await client.search(keywordQuery());
  const { operations, skipped } = buildBrandOperations(rows);
  console.error(JSON.stringify({
    validateOnly,
    candidateOperationCount: operations.length,
    skipped,
    operations: operations.map((operation) => ({
      resourceName: operation.update.resourceName,
      finalUrls: operation.update.finalUrls,
      updateMask: operation.updateMask,
    })),
  }, null, 2));
  if (!operations.length) {
    console.log(JSON.stringify({ result: 'no_changes_needed' }, null, 2));
    return;
  }
  const response = await client.mutateAdGroupCriteria(operations, validateOnly);
  console.log(JSON.stringify(response, null, 2));
}

async function addSaxophoneNegative(client, validateOnly) {
  const existing = await client.search(`
    SELECT
      campaign.name,
      ad_group.name,
      ad_group_criterion.resource_name,
      ad_group_criterion.status,
      ad_group_criterion.negative,
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type
    FROM ad_group_criterion
    WHERE campaign.name = '${SAXOPHONE_NEGATIVE.campaignName}'
      AND ad_group.name = '${SAXOPHONE_NEGATIVE.adGroupName}'
      AND ad_group_criterion.type = KEYWORD
      AND ad_group_criterion.negative = true
      AND ad_group_criterion.keyword.text = '${SAXOPHONE_NEGATIVE.text}'
  `);
  if (existing.length) {
    console.log(JSON.stringify({
      result: 'already_exists',
      validateOnly,
      existing: existing.map((row) => ({
        resourceName: row.adGroupCriterion?.resourceName,
        status: row.adGroupCriterion?.status,
        text: row.adGroupCriterion?.keyword?.text,
        matchType: row.adGroupCriterion?.keyword?.matchType,
      })),
    }, null, 2));
    return;
  }

  const operations = [{
    create: {
      adGroup: SAXOPHONE_NEGATIVE.adGroup,
      status: 'ENABLED',
      negative: true,
      keyword: {
        text: SAXOPHONE_NEGATIVE.text,
        matchType: SAXOPHONE_NEGATIVE.matchType,
      },
    },
  }];

  console.error(JSON.stringify({
    validateOnly,
    operation: {
      campaignName: SAXOPHONE_NEGATIVE.campaignName,
      adGroupName: SAXOPHONE_NEGATIVE.adGroupName,
      text: SAXOPHONE_NEGATIVE.text,
      matchType: SAXOPHONE_NEGATIVE.matchType,
    },
  }, null, 2));
  const response = await client.mutateAdGroupCriteria(operations, validateOnly);
  console.log(JSON.stringify(response, null, 2));
}

async function getQualifiedLeadAction(client) {
  const rows = await client.search(`
    SELECT
      conversion_action.id,
      conversion_action.resource_name,
      conversion_action.name,
      conversion_action.status,
      conversion_action.type,
      conversion_action.category,
      conversion_action.primary_for_goal,
      conversion_action.include_in_conversions_metric
    FROM conversion_action
    WHERE conversion_action.name = '${QUALIFIED_LEAD_ACTION_NAME}'
  `);
  return rows[0]?.conversionAction || null;
}

async function createQualifiedLeadAction(client, validateOnly) {
  const existing = await getQualifiedLeadAction(client);
  if (existing) {
    console.log(JSON.stringify({ result: 'already_exists', validateOnly, existing }, null, 2));
    return;
  }
  const operations = [{
    create: {
      name: QUALIFIED_LEAD_ACTION_NAME,
      status: 'ENABLED',
      type: 'UPLOAD_CLICKS',
      category: 'QUALIFIED_LEAD',
      countingType: 'ONE_PER_CLICK',
      primaryForGoal: false,
      valueSettings: {
        defaultValue: 250,
        alwaysUseDefaultValue: false,
      },
      clickThroughLookbackWindowDays: 90,
    },
  }];
  console.error(JSON.stringify({
    validateOnly,
    operation: {
      name: QUALIFIED_LEAD_ACTION_NAME,
      type: 'UPLOAD_CLICKS',
      category: 'QUALIFIED_LEAD',
      countingType: 'ONE_PER_CLICK',
      primaryForGoal: false,
      defaultValue: 250,
    },
  }, null, 2));
  const response = await client.mutateConversionActions(operations, validateOnly);
  console.log(JSON.stringify(response, null, 2));
}

function parseWranglerJson(text) {
  const start = text.indexOf('[\n');
  if (start === -1) throw new Error(`Unable to parse Wrangler JSON output: ${text.slice(0, 500)}`);
  return JSON.parse(text.slice(start));
}

function d1Query(sql) {
  const output = execFileSync(process.execPath, [
    WRANGLER_BIN,
    'd1',
    'execute',
    'musicangel_leads',
    '--remote',
    '--command',
    sql,
  ], {
    cwd: ROOT,
    env: {
      ...process.env,
      CI: '1',
      WRANGLER_SEND_METRICS: 'false',
      WRANGLER_SEND_ERROR_REPORTS: 'false',
    },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return parseWranglerJson(output)[0]?.results || [];
}

function adsDateTime(iso) {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) throw new Error(`Invalid date: ${iso}`);
  return d.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '+00:00');
}

function buildClickConversion(row, conversionActionResourceName) {
  const conversion = {
    conversionAction: conversionActionResourceName,
    conversionDateTime: adsDateTime(row.conversion_created_at),
    conversionValue: Number(row.conversion_value || 0),
    currencyCode: row.currency_code || 'EUR',
    orderId: row.order_id,
  };
  if (row.click_id_type === 'gclid') conversion.gclid = row.click_id;
  if (row.click_id_type === 'gbraid') conversion.gbraid = row.click_id;
  if (row.click_id_type === 'wbraid') conversion.wbraid = row.click_id;
  return conversion;
}

function redactedConversionSummary(row) {
  return {
    leadId: row.lead_id,
    stage: row.conversion_stage,
    conversionDateTime: adsDateTime(row.conversion_created_at),
    conversionValue: Number(row.conversion_value || 0),
    currencyCode: row.currency_code || 'EUR',
    clickIdType: row.click_id_type,
    campaign: row.campaign,
    adGroup: row.ad_group,
    keyword: row.keyword,
  };
}

async function uploadD1QualifiedLeads(client, validateOnly) {
  const action = await getQualifiedLeadAction(client);
  if (!action?.resourceName) {
    throw new Error(`Missing conversion action: ${QUALIFIED_LEAD_ACTION_NAME}. Create it first.`);
  }
  const rows = d1Query(`
    SELECT *
    FROM google_ads_conversion_import_candidates
    WHERE conversion_stage = 'qualified_lead'
      AND NOT EXISTS (
        SELECT 1
        FROM google_ads_conversion_uploads u
        WHERE u.lead_id = google_ads_conversion_import_candidates.lead_id
          AND u.conversion_stage = google_ads_conversion_import_candidates.conversion_stage
          AND u.validate_only = ${validateOnly ? 1 : 0}
          AND u.upload_status = 'uploaded'
      )
    ORDER BY conversion_created_at ASC
  `);
  const conversions = rows.map((row) => buildClickConversion(row, action.resourceName));
  console.error(JSON.stringify({
    validateOnly,
    conversionAction: action.resourceName,
    candidateCount: rows.length,
    candidates: rows.map(redactedConversionSummary),
  }, null, 2));
  if (!conversions.length) {
    console.log(JSON.stringify({ result: 'no_candidates', validateOnly }, null, 2));
    return;
  }
  const response = await client.uploadClickConversions(conversions, validateOnly);
  console.log(JSON.stringify(response, null, 2));
}

function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    process.stdin.on('error', reject);
  });
}

async function main() {
  const command = process.argv[2];
  const client = makeClient();
  if (command === 'landing-check') {
    await landingCheck(client);
  } else if (command === 'brand-snapshot') {
    await brandSnapshot(client);
  } else if (command === 'brand-validate') {
    await routeBrand(client, true);
  } else if (command === 'brand-apply') {
    await routeBrand(client, false);
  } else if (command === 'negative-sax-validate') {
    await addSaxophoneNegative(client, true);
  } else if (command === 'negative-sax-apply') {
    await addSaxophoneNegative(client, false);
  } else if (command === 'qualified-lead-action-validate') {
    await createQualifiedLeadAction(client, true);
  } else if (command === 'qualified-lead-action-apply') {
    await createQualifiedLeadAction(client, false);
  } else if (command === 'upload-d1-qualified-leads-validate') {
    await uploadD1QualifiedLeads(client, true);
  } else if (command === 'upload-d1-qualified-leads-apply') {
    await uploadD1QualifiedLeads(client, false);
  } else if (command === 'query') {
    const query = (await readStdin()).trim();
    if (!query) throw new Error('GAQL query expected on stdin');
    const rows = await client.search(query);
    console.log(JSON.stringify({ results: rows }, null, 2));
  } else {
    throw new Error('Usage: node scripts/google-ads-safe-ops.js landing-check|brand-snapshot|brand-validate|brand-apply|negative-sax-validate|negative-sax-apply|qualified-lead-action-validate|qualified-lead-action-apply|upload-d1-qualified-leads-validate|upload-d1-qualified-leads-apply|query');
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
