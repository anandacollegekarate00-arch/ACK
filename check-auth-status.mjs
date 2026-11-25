import https from 'https';

const PROJECT_REF = 'velrrklvyefnpvrkidww';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

function get() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/config/auth`,
      method: 'GET',
      rejectUnauthorized: false,
      headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
    };
    const req = https.request(options, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve(JSON.parse(raw)));
    });
    req.on('error', reject);
    req.end();
  });
}

const c = await get();

console.log('\n📋 Current Supabase Auth Configuration\n');
console.log('  site_url:                  ', c.site_url);
console.log('  uri_allow_list:            ', c.uri_allow_list);
console.log('  mailer_autoconfirm:        ', c.mailer_autoconfirm, c.mailer_autoconfirm ? '(email verification OFF ✅)' : '(email verification ON ⚠️)');
console.log('  disable_signup:            ', c.disable_signup, c.disable_signup ? '(signup OFF ⚠️)' : '(signup allowed ✅)');
console.log('');
console.log('  external_google_enabled:   ', c.external_google_enabled,   c.external_google_enabled   ? '✅' : '❌ needs credentials');
console.log('  external_facebook_enabled: ', c.external_facebook_enabled, c.external_facebook_enabled ? '✅' : '❌ needs credentials');
console.log('  external_apple_enabled:    ', c.external_apple_enabled,    c.external_apple_enabled    ? '✅' : '❌ needs credentials');
console.log('');
