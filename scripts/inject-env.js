/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
'use strict';

/**
 * Injects Vercel environment variables into the built env.js asset.
 * Run after `ng build` so the static env.js picks up runtime config.
 *
 * Required Vercel env vars:
 *   GATEWAY_URL      - Full URL of the API gateway (e.g. https://api.example.com)
 *
 * Optional Vercel env vars:
 *   GATEWAY_URLS          - Comma-separated list of gateway URLs for the server switcher
 *   FINERACT_TENANT_ID    - Fineract tenant identifier (default: "default")
 *   FINERACT_TENANT_IDS   - Comma-separated tenant list for the tenant selector
 */

const fs = require('fs');
const path = require('path');

const envJsPath = path.join(__dirname, '..', 'dist', 'web-app', 'browser', 'assets', 'env.js');

if (!fs.existsSync(envJsPath)) {
  console.warn('[inject-env] env.js not found at', envJsPath, '— skipping injection');
  process.exit(0);
}

const gatewayUrl = process.env.GATEWAY_URL || '';
const gatewayUrls = process.env.GATEWAY_URLS || gatewayUrl;
const tenantId = process.env.FINERACT_TENANT_ID || 'default';
const tenantIds = process.env.FINERACT_TENANT_IDS || tenantId;

const replacements = {
  fineractApiUrl: gatewayUrl,
  fineractApiUrls: gatewayUrls,
  fineractPlatformTenantId: tenantId,
  fineractPlatformTenantIds: tenantIds,
};

let content = fs.readFileSync(envJsPath, 'utf-8');

for (const [key, value] of Object.entries(replacements)) {
  content = content.replace(
    new RegExp(`(window\\["env"\\]\\["${key}"\\]\\s*=\\s*)'[^']*'`),
    `$1'${value}'`
  );
}

fs.writeFileSync(envJsPath, content, 'utf-8');
console.log('[inject-env] Injected into env.js:', replacements);
