import { generateLogoHTML } from './generator.js';

function assert(cond, name) {
  if (!window.__testResults) window.__testResults = { pass: 0, fail: 0, cases: [] };
  if (cond) {
    window.__testResults.pass += 1;
    window.__testResults.cases.push({ name, result: 'pass' });
  } else {
    window.__testResults.fail += 1;
    window.__testResults.cases.push({ name, result: 'fail' });
  }
}

export async function runSignatureLinkTests() {
  const config = { base64Images: { defaultLogo: 'images/logo_cip.png' } };
  const baseFields = {
    logoType: 'logo1',
    logoColor: '#FF0000',
    enableDigitalSignature: true,
    digitalSignatureUrl: 'https://www.cipsa.com.pe/',
  };
  const htmlFull = await generateLogoHTML('images/logo_cip.png', config, baseFields, 'full');
  assert(/<a\s+href="https:\/\/www\.cipsa\.com\.pe\/"/.test(htmlFull), 'full: anchor wraps logo');
  assert(/<img\s+src=/.test(htmlFull), 'full: image present inside anchor');

  const fieldsOff = { ...baseFields, enableDigitalSignature: false };
  const htmlFullOff = await generateLogoHTML('images/logo_cip.png', config, fieldsOff, 'full');
  assert(!/<a\s+href=/.test(htmlFullOff), 'full off: no anchor');
  assert(/<img\s+src=/.test(htmlFullOff), 'full off: image present');

  const htmlMedium = await generateLogoHTML('images/logo_cip.png', config, baseFields, 'medium');
  assert(/<a\s+href="https:\/\/www\.cipsa\.com\.pe\/"/.test(htmlMedium), 'medium: anchor wraps logo when enabled');

  const htmlShort = await generateLogoHTML('images/logo_cip.png', config, baseFields, 'short');
  assert(/<a\s+href="https:\/\/www\.cipsa\.com\.pe\/"/.test(htmlShort), 'short: anchor wraps logo when enabled');

  console.log('Signature Link Tests:', window.__testResults);
}

if (typeof window !== 'undefined') {
  runSignatureLinkTests();
}
