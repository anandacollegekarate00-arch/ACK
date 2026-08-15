// smoke-test.mjs — boots each single-file app in jsdom and asserts that the
// compiled bundle actually mounts React and renders the app (no error banner,
// #root populated). Supabase calls are network-dependent; getSession failure
// must not crash the app — it should still land on the login screen.
import { JSDOM } from 'jsdom';
import fs from 'node:fs';

const files = ['public/index.html', 'public/index-premium.html'];
const bundles = { 'public/index.html': 'public/app.bundle.js', 'public/index-premium.html': 'public/index-premium.bundle.js' };
const css = fs.readFileSync('public/app.css', 'utf8');

let failures = 0;

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8').replace('<link rel="stylesheet" href="app.css"', '<style>' + css + '</style><link data-x rel="stylesheet" href="app.css"');
  const bundle = fs.readFileSync(bundles[file], 'utf8');

  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    url: 'http://localhost:3000/' + file.replace('public/', ''),
    beforeParse(window) {
      window.fetch = globalThis.fetch;
      window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
      window.Intl = Intl;
      window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
      window.cancelAnimationFrame = clearTimeout;
      window.URL.createObjectURL = () => 'blob:fake';
      window.scrollTo = () => {};
    },
  });

  const { window } = dom;
  // stub the app-source script so the page's inline loader doesn't run Babel (we run the bundle directly)
  const appSource = window.document.getElementById('app-source');
  if (appSource) appSource.parentNode.removeChild(appSource);
  // Run the page's own inline scripts (error banner setup) first
  for (const s of [...window.document.scripts]) {
    if (s.src) continue;
    try { window.eval(s.textContent); } catch (e) { /* inline non-app scripts */ }
  }
  // Now run the production bundle
  try {
    window.eval(bundle);
  } catch (e) {
    console.log(`${file}: BUNDLE THREW AT LOAD: ${e && e.stack ? e.stack.split('\n')[0] : e}`);
    failures++;
    continue;
  }

  await new Promise((r) => setTimeout(r, 4000));

  const root = window.document.getElementById('root');
  const banner = window.document.getElementById('ack-error-banner');
  const htmlOut = root ? root.innerHTML : '';
  const mounted = htmlOut.length > 50;
  const noBanner = !banner;
  const looksLikeApp = /Ananda|Welcome|Karate|Splash|Loading/i.test(htmlOut);
  const status = mounted && noBanner ? (looksLikeApp ? 'MOUNTED OK' : 'MOUNTED (unknown content)') : 'FAILED';
  if (status === 'FAILED') failures++;
  console.log(`${file}: ${status} | root html: ${htmlOut.length} chars | error banner: ${banner ? 'PRESENT' : 'none'}`);
  if (banner) console.log('  banner text: ' + banner.textContent.slice(0, 300));
  window.close();
}

console.log(failures === 0 ? 'SMOKE TEST PASSED' : `SMOKE TEST FAILED (${failures})`);
process.exit(failures === 0 ? 0 : 1);