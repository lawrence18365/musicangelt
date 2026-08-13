#!/usr/bin/env node

const crypto = require('node:crypto');
const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');

const API_VERSION = 'v24';
const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env.google-ads.local');

const RESTART_DATE = '2026-08-13';
const CAP_EUR = 398; // Hard ceiling on cumulative euro spend since RESTART_DATE, sized to sit just under the EUR400 promotional credit with a small buffer for overshoot between guard runs.
const TAPER_AT_EUR = 375; // Promotional credit expires 2026-09-16, so keep the taper threshold high to maintain the full burn rate as long as possible. Only the final stretch runs at the reduced rate, which is enough to keep the stop at CAP_EUR precise despite Google's reporting lag.
const TAPER_DAILY_MICROS = 2000000; // EUR2/day per campaign budget in micros.
const LOG_PATH = path.join(ROOT, 'reports', 'credit-cap-guard.log');

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

  async function mutateCampaignBudgets(operations, validateOnly) {
    const body = JSON.stringify({
      customerId,
      operations,
      validateOnly,
      partialFailure: false,
    });
    return requestJson(`https://googleads.googleapis.com/${API_VERSION}/customers/${customerId}/campaignBudgets:mutate`, {
      method: 'POST',
      headers: {
        ...(await headers()),
        'content-length': Buffer.byteLength(body),
      },
    }, body);
  }

  return { customerId, search, mutateCampaigns, mutateCampaignBudgets };
}

function getTodayDublin() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Dublin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

async function querySpendEur(client) {
  const today = getTodayDublin();
  const rows = await client.search(`
    SELECT metrics.cost_micros
    FROM customer
    WHERE segments.date BETWEEN '${RESTART_DATE}' AND '${today}'
  `);
  const totalMicros = rows.reduce((sum, row) => sum + Number(row.metrics?.costMicros || 0), 0);
  return totalMicros / 1e6;
}

async function queryEnabledCampaigns(client) {
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
  return rows.filter(row => row.campaign?.status === 'ENABLED');
}

async function pauseEnabledCampaigns(client) {
  const toPause = await queryEnabledCampaigns(client);
  if (!toPause.length) {
    return { pausedCampaigns: [], response: null };
  }
  const operations = toPause.map(row => ({
    update: {
      resourceName: row.campaign.resourceName,
      status: 'PAUSED',
    },
    updateMask: 'status',
  }));
  const response = await client.mutateCampaigns(operations, false);
  return {
    pausedCampaigns: toPause.map(row => row.campaign?.name).filter(Boolean),
    response,
  };
}

async function applyTaper(client) {
  const rows = await client.search(`
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign_budget.resource_name,
      campaign_budget.amount_micros
    FROM campaign
    WHERE campaign.status = 'ENABLED'
  `);

  const budgetsToLower = new Map();
  for (const row of rows) {
    const budget = row.campaignBudget;
    if (!budget) continue;
    const resourceName = budget.resourceName;
    const amountMicros = Number(budget.amountMicros || 0);
    if (resourceName && amountMicros > TAPER_DAILY_MICROS) {
      budgetsToLower.set(resourceName, amountMicros);
    }
  }

  const taperedBudgets = Array.from(budgetsToLower.keys());
  if (!taperedBudgets.length) {
    return { taperedBudgets: [], alreadyTapered: true };
  }

  const operations = taperedBudgets.map(resourceName => ({
    update: {
      resourceName,
      amountMicros: String(TAPER_DAILY_MICROS),
    },
    updateMask: 'amount_micros',
  }));

  await client.mutateCampaignBudgets(operations, false);
  return { taperedBudgets, alreadyTapered: false };
}

function writeLog(entry) {
  const dir = path.dirname(LOG_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(LOG_PATH, `${JSON.stringify(entry)}\n`, 'utf8');
}

async function main() {
  const command = process.argv[2];
  if (command !== 'check' && command !== 'enforce') {
    throw new Error('Usage: node scripts/credit-cap-guard.js check|enforce');
  }

  const client = makeClient();
  const today = getTodayDublin();
  const spentEur = await querySpendEur(client);
  const remainingEur = Math.max(0, CAP_EUR - spentEur);
  const overCap = spentEur >= CAP_EUR;

  let action = 'none';
  let pausedCampaigns = [];
  let taperedBudgets = [];
  let enabledCampaigns = [];

  if (command === 'check') {
    enabledCampaigns = (await queryEnabledCampaigns(client)).map(row => row.campaign?.name).filter(Boolean);
  } else if (command === 'enforce') {
    if (overCap) {
      const result = await pauseEnabledCampaigns(client);
      action = 'paused';
      pausedCampaigns = result.pausedCampaigns;
    } else if (spentEur >= TAPER_AT_EUR) {
      const result = await applyTaper(client);
      taperedBudgets = result.taperedBudgets;
      action = result.alreadyTapered ? 'taper_already_applied' : 'tapered';
    }
  }

  const output = {
    command,
    restartDate: RESTART_DATE,
    today,
    spentEur,
    capEur: CAP_EUR,
    taperAtEur: TAPER_AT_EUR,
    remainingEur,
    overCap,
    action,
    enabledCampaigns,
    pausedCampaigns,
    taperedBudgets,
  };

  writeLog({
    timestamp: new Date().toISOString(),
    command,
    restartDate: RESTART_DATE,
    today,
    spentEur,
    capEur: CAP_EUR,
    taperAtEur: TAPER_AT_EUR,
    overCap,
    action,
    pausedCampaigns,
    taperedBudgets,
  });

  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
});
