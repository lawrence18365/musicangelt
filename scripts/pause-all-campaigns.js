#!/usr/bin/env node

const crypto = require('node:crypto');
const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');

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

async function getAccessToken(serviceAccountPath, scope = 'https://www.googleapis.com/auth/adwords') {
  const key = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: key.client_email,
    scope,
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

  async function mutateCampaigns(operations, validateOnly) {
    const body = JSON.stringify({
      customerId,
      operations,
      validateOnly,
      partialFailure: false,
    });
    return requestJson(`https://googleads.googleapis.com/${API_VERSION}/customers/${customerId}/campaigns:mutate`, {
      method: 'POST',
      headers: {
        ...(await headers()),
        'content-length': Buffer.byteLength(body),
      },
    }, body);
  }

  return { customerId, search, mutateCampaigns };
}

async function pauseAllCampaigns(client, validateOnly) {
  const rows = await client.search(`
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.resource_name
    FROM campaign
    WHERE campaign.status IN ('ENABLED', 'PAUSED')
    ORDER BY campaign.name ASC
  `);

  const toPause = rows.filter(row => row.campaign?.status === 'ENABLED');

  if (!toPause.length) {
    console.log(JSON.stringify({
      result: 'no_active_campaigns',
      validateOnly,
      total: rows.length,
      already_paused: rows.filter(row => row.campaign?.status === 'PAUSED').length,
    }, null, 2));
    return;
  }

  const operations = toPause.map(row => ({
    update: {
      resourceName: row.campaign.resourceName,
      status: 'PAUSED',
    },
    updateMask: 'status',
  }));

  console.error(JSON.stringify({
    validateOnly,
    candidateCount: toPause.length,
    campaigns: toPause.map(row => ({
      id: row.campaign?.id,
      name: row.campaign?.name,
      status: row.campaign?.status,
    })),
  }, null, 2));

  const response = await client.mutateCampaigns(operations, validateOnly);

  console.log(JSON.stringify({
    validateOnly,
    paused: toPause.length,
    already_paused: rows.filter(row => row.campaign?.status === 'PAUSED').length,
    total_campaigns: rows.length,
    response,
  }, null, 2));
}

async function main() {
  const command = process.argv[2];
  const client = makeClient();

  if (command === 'pause-validate') {
    await pauseAllCampaigns(client, true);
  } else if (command === 'pause-apply') {
    await pauseAllCampaigns(client, false);
  } else {
    throw new Error('Usage: node scripts/pause-all-campaigns.js pause-validate|pause-apply');
  }
}

main().catch((error) => {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
});
