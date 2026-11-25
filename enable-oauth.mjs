/**
 * Run this after you have credentials from Google/Facebook/Apple.
 * 
 * Usage:
 *   node enable-oauth.mjs --google --id YOUR_ID --secret YOUR_SECRET
 *   node enable-oauth.mjs --facebook --id YOUR_ID --secret YOUR_SECRET
 *   node enable-oauth.mjs --apple --id YOUR_ID --secret YOUR_SECRET
 */
import https from 'https';

const PROJECT_REF = 'velrrklvyefnpvrkidww';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

const args = process.argv.slice(2);
const provider = args.find(a => ['--google','--facebook','--apple'].includes(a))?.slice(2);
const clientId = args[args.indexOf('--id') + 1];
const clientSecret = args[args.indexOf('--secret') + 1];

if (!ACCESS_TOKEN || !provider || !clientId || !clientSecret) {
  console.log('Usage:');
  console.log('  SUPABASE_ACCESS_TOKEN=sbp_xxx node enable-oauth.mjs --google --id CLIENT_ID --secret CLIENT_SECRET');
  console.log('  SUPABASE_ACCESS_TOKEN=sbp_xxx node enable-oauth.mjs --facebook --id APP_ID --secret APP_SECRET');
  console.log('  SUPABASE_ACCESS_TOKEN=sbp_xxx node enable-oauth.mjs --apple --id SERVICES_ID --secret PRIVATE_KEY');
  process.exit(1);
}

function patch(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/config/auth`,
      method: 'PATCH',
      rejectUnauthorized: false,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(raw) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const payloads = {
  google:   { external_google_enabled: true,   external_google_client_id: clientId,   external_google_secret: clientSecret },
  facebook: { external_facebook_enabled: true, external_facebook_client_id: clientId, external_facebook_secret: clientSecret },
  apple:    { external_apple_enabled: true,     external_apple_client_id: clientId,    external_apple_secret: clientSecret },
};

const { status, data } = await patch(payloads[provider]);
if (status === 200) {
  console.log(`✅ ${provider} OAuth enabled successfully!`);
  console.log(`   ${provider}_enabled:`, data[`external_${provider}_enabled`]);
} else {
  console.error(`❌ Failed (${status}):`, data);
}
