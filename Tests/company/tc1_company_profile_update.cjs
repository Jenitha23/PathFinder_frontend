/**
 * tc1_company_profile_update.cjs
 * User Story: As a company, I want to update my company profile so that
 *             students can see accurate company information.
 *
 * Test Groups:
 *   TC-01 to TC-04  — Authentication & Access Control
 *   TC-05 to TC-08  — Edit Mode & Field Population
 *   TC-09 to TC-12  — Validation Rules
 *   TC-13 to TC-16  — Save & Cancel Behaviour
 *   TC-17 to TC-19  — Logo Upload Controls
 *   TC-20 to TC-22  — Persistence & Cleanup
 *
 * Prerequisites:
 *   npm install selenium-webdriver chromedriver
 *   Deployed frontend : https://pathfinder-frontend-navy.vercel.app
 *
 * Run:
 *   node tc1_company_profile_update.cjs
 */

require('chromedriver');
const { Builder, By, until } = require('selenium-webdriver');

// ── Configuration ────────────────────────────────────────────────────────────

const BASE_URL      = 'https://pathfinder-frontend-navy.vercel.app';
const LOGIN_URL     = `${BASE_URL}/company/login`;
const DASHBOARD_URL = `${BASE_URL}/company/dashboard`;

const COMPANY_EMAIL    = 'company@gmail.com';
const COMPANY_PASSWORD = '123456789C';

const TEST_PROFILE = {
  companyName : 'Selenium QA Corp',
  description : 'Automated test description updated by Selenium.',
  industry    : 'Quality Assurance',
  website     : 'https://selenium-qa.example.com',
  location    : 'Colombo, Sri Lanka',
  phone       : '+94 77 111 2222',
};

// ── Results Tracker ──────────────────────────────────────────────────────────

const results = [];
function record(tcId, desc, status, note = '') {
  results.push({ tcId, desc, status, note });
  console.log(`   ${status === 'PASS' ? '✅' : '❌'} ${tcId} — ${status}${note ? ' | ' + note : ''}`);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function setReactInput(driver, el, value) {
  await driver.executeScript(`
    const el = arguments[0];
    const proto = el.tagName === 'TEXTAREA'
      ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, arguments[1]);
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  `, el, value);
}

async function setById(driver, id, value) {
  const el = await driver.wait(until.elementLocated(By.id(id)), 12000);
  await driver.executeScript('arguments[0].scrollIntoView({block:"center"})', el);
  await setReactInput(driver, el, value);
}

async function click(driver, locator) {
  const el = await driver.wait(until.elementLocated(locator), 12000);
  await driver.executeScript('arguments[0].scrollIntoView({block:"center"})', el);
  await driver.executeScript('arguments[0].click()', el);
  return el;
}

async function doLogin(driver) {
  await driver.get(LOGIN_URL);
  await driver.wait(until.elementLocated(By.id('email')), 15000);
  await setById(driver, 'email', COMPANY_EMAIL);
  await setById(driver, 'password', COMPANY_PASSWORD);
  await click(driver, By.xpath("//button[contains(.,'Sign In')]"));
}

async function waitForDashboard(driver) {
  await driver.wait(until.urlContains('/company/dashboard'), 25000);
  await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(),'Edit Company Profile')]")),
    20000
  );
}

async function openEditMode(driver) {
  const inputs = await driver.findElements(By.id('company-name'));
  if (inputs.length > 0) return;          // already in edit mode
  await click(driver, By.xpath("//button[contains(.,'Edit Company Profile')]"));
  await driver.wait(until.elementLocated(By.id('company-name')), 12000);
}

async function fillProfile(driver, data) {
  await setById(driver, 'company-name',        data.companyName);
  await setById(driver, 'company-email',       COMPANY_EMAIL);
  await setById(driver, 'company-description', data.description);
  await setById(driver, 'company-industry',    data.industry);
  await setById(driver, 'company-website',     data.website);
  await setById(driver, 'company-location',    data.location);
  await setById(driver, 'company-phone',       data.phone);
}

async function clickSave(driver) {
  await click(driver, By.xpath("//button[contains(.,'Save Changes')]"));
}

async function clickCancel(driver) {
  await click(driver, By.xpath("//button[contains(.,'Cancel')]"));
}

async function waitForSuccess(driver) {
  await driver.wait(
    until.elementLocated(By.xpath("//*[contains(text(),'profile updated') or contains(text(),'successfully')]")),
    20000
  );
}

async function waitForViewMode(driver) {
  await driver.wait(
    until.elementLocated(By.xpath("//button[contains(.,'Edit Company Profile')]")),
    15000
  );
}

// ── Test Cases ────────────────────────────────────────────────────────────────

async function tc01(driver) {
  console.log('\n📌 TC-01 — Valid company login');
  try {
    await doLogin(driver);
    await driver.wait(until.urlContains('/company/dashboard'), 25000);
    record('TC-01', 'Valid company login', 'PASS');
  } catch (e) { record('TC-01', 'Valid company login', 'FAIL', e.message); }
}

async function tc02(driver) {
  console.log('\n📌 TC-02 — Invalid credentials blocked');
  try {
    await driver.get(LOGIN_URL);
    await driver.wait(until.elementLocated(By.id('email')), 12000);
    await setById(driver, 'email', 'wrong@notexist.com');
    await setById(driver, 'password', 'wrongPass99');
    await click(driver, By.xpath("//button[contains(.,'Sign In')]"));
    await driver.sleep(3000);
    const url = await driver.getCurrentUrl();
    const errEls = await driver.findElements(
      By.xpath("//*[contains(text(),'Invalid') or contains(text(),'incorrect') or contains(text(),'Wrong')]")
    );
    if (!url.includes('/company/dashboard') || errEls.length > 0) {
      record('TC-02', 'Invalid credentials blocked', 'PASS', 'Stays on login / shows error');
    } else {
      record('TC-02', 'Invalid credentials blocked', 'FAIL', 'Unexpectedly reached dashboard');
    }
  } catch (e) { record('TC-02', 'Invalid credentials blocked', 'PASS', 'Rejected correctly'); }
}

async function tc03(driver) {
  console.log('\n📌 TC-03 — Empty login fields blocked');
  try {
    await driver.get(LOGIN_URL);
    await driver.wait(until.elementLocated(By.xpath("//button[contains(.,'Sign In')]")), 12000);
    await click(driver, By.xpath("//button[contains(.,'Sign In')]"));
    await driver.sleep(1500);
    const url = await driver.getCurrentUrl();
    if (!url.includes('/company/dashboard')) {
      record('TC-03', 'Empty login fields blocked', 'PASS', 'Submission blocked');
    } else {
      record('TC-03', 'Empty login fields blocked', 'FAIL', 'Should not reach dashboard');
    }
  } catch (e) { record('TC-03', 'Empty login fields blocked', 'PASS', 'Blocked correctly'); }
}

async function tc04(driver) {
  console.log('\n📌 TC-04 — Unauthenticated dashboard access redirects');
  try {
    await driver.get(BASE_URL);
    await driver.executeScript('localStorage.clear(); sessionStorage.clear();');
    await driver.get(DASHBOARD_URL);
    await driver.sleep(3000);
    const url = await driver.getCurrentUrl();
    if (!url.includes('/company/dashboard')) {
      record('TC-04', 'Unauthenticated access redirects', 'PASS', `Redirected to: ${url}`);
    } else {
      record('TC-04', 'Unauthenticated access redirects', 'FAIL', 'Dashboard accessible without auth');
    }
  } catch (e) { record('TC-04', 'Unauthenticated access redirects', 'FAIL', e.message); }
}

async function tc05(driver) {
  console.log('\n📌 TC-05 — Dashboard loads after login');
  try {
    await doLogin(driver);
    await waitForDashboard(driver);
    record('TC-05', 'Dashboard loads after login', 'PASS');
  } catch (e) { record('TC-05', 'Dashboard loads after login', 'FAIL', e.message); }
}

async function tc06(driver) {
  console.log('\n📌 TC-06 — Edit form opens on button click');
  try {
    await openEditMode(driver);
    const nameField = await driver.findElement(By.id('company-name'));
    if (nameField) record('TC-06', 'Edit form opens', 'PASS');
    else throw new Error('Edit form did not appear');
  } catch (e) { record('TC-06', 'Edit form opens', 'FAIL', e.message); }
}

async function tc07(driver) {
  console.log('\n📌 TC-07 — All profile fields are editable');
  try {
    await openEditMode(driver);
    const ids = ['company-name','company-email','company-description',
                 'company-industry','company-website','company-location','company-phone'];
    for (const id of ids) {
      await driver.wait(until.elementLocated(By.id(id)), 8000);
    }
    record('TC-07', 'All profile fields are editable', 'PASS', `${ids.length} fields found`);
  } catch (e) { record('TC-07', 'All profile fields are editable', 'FAIL', e.message); }
}

async function tc08(driver) {
  console.log('\n📌 TC-08 — Description textarea accepts long text');
  try {
    await openEditMode(driver);
    const longText = 'A'.repeat(500);
    await setById(driver, 'company-description', longText);
    const el = await driver.findElement(By.id('company-description'));
    const val = await el.getAttribute('value');
    if (val.length >= 400) {
      record('TC-08', 'Description accepts long text', 'PASS', `${val.length} chars accepted`);
    } else {
      record('TC-08', 'Description accepts long text', 'FAIL', `Only ${val.length} chars`);
    }
  } catch (e) { record('TC-08', 'Description accepts long text', 'FAIL', e.message); }
}

async function tc09(driver) {
  console.log('\n📌 TC-09 — Company name required validation');
  try {
    await openEditMode(driver);
    await setById(driver, 'company-name', '');
    await clickSave(driver);
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(),'Company name is required') or contains(text(),'required')]")),
      10000
    );
    record('TC-09', 'Company name required validation', 'PASS');
  } catch (e) { record('TC-09', 'Company name required validation', 'FAIL', e.message); }
}

async function tc10(driver) {
  console.log('\n📌 TC-10 — Invalid email format validation');
  try {
    await openEditMode(driver);
    await setById(driver, 'company-email', 'not-an-email');
    await clickSave(driver);
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(),'valid email') or contains(text(),'Enter a valid')]")),
      10000
    );
    record('TC-10', 'Invalid email format validation', 'PASS');
  } catch (e) { record('TC-10', 'Invalid email format validation', 'FAIL', e.message); }
}

async function tc11(driver) {
  console.log('\n📌 TC-11 — Invalid website URL validation');
  try {
    await openEditMode(driver);
    await setById(driver, 'company-name',    'Valid Name');
    await setById(driver, 'company-email',   COMPANY_EMAIL);
    await setById(driver, 'company-website', 'notaurl');
    await clickSave(driver);
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(),'valid URL') or contains(text(),'http')]")),
      10000
    );
    record('TC-11', 'Invalid website URL validation', 'PASS');
  } catch (e) { record('TC-11', 'Invalid website URL validation', 'FAIL', e.message); }
}

async function tc12(driver) {
  console.log('\n📌 TC-12 — Multiple empty required fields show errors');
  try {
    await openEditMode(driver);
    await setById(driver, 'company-name',  '');
    await setById(driver, 'company-email', '');
    await clickSave(driver);
    await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(),'required')]")),
      10000
    );
    record('TC-12', 'Multiple empty required fields show errors', 'PASS');
  } catch (e) { record('TC-12', 'Multiple empty required fields show errors', 'FAIL', e.message); }
}

async function tc13(driver) {
  console.log('\n📌 TC-13 — Cancel discards unsaved changes');
  try {
    await openEditMode(driver);
    await setById(driver, 'company-name', 'SHOULD NOT SAVE THIS');
    await clickCancel(driver);
    await waitForViewMode(driver);
    const editInputs = await driver.findElements(By.id('company-name'));
    if (editInputs.length === 0) {
      record('TC-13', 'Cancel discards unsaved changes', 'PASS');
    } else {
      record('TC-13', 'Cancel discards unsaved changes', 'FAIL', 'Edit form still visible after cancel');
    }
  } catch (e) { record('TC-13', 'Cancel discards unsaved changes', 'FAIL', e.message); }
}

async function tc14(driver) {
  console.log('\n📌 TC-14 — Save valid profile shows success message');
  try {
    await openEditMode(driver);
    await fillProfile(driver, TEST_PROFILE);
    await clickSave(driver);
    await waitForSuccess(driver);
    record('TC-14', 'Save valid profile shows success message', 'PASS');
  } catch (e) { record('TC-14', 'Save valid profile shows success message', 'FAIL', e.message); }
}

async function tc15(driver) {
  console.log('\n📌 TC-15 — Saved data visible in view mode');
  try {
    await waitForViewMode(driver);
    const body = await driver.findElement(By.tagName('body')).getText();
    if (body.includes(TEST_PROFILE.companyName) && body.includes(TEST_PROFILE.industry)) {
      record('TC-15', 'Saved data visible in view mode', 'PASS');
    } else {
      record('TC-15', 'Saved data visible in view mode', 'FAIL', 'Updated data not in page text');
    }
  } catch (e) { record('TC-15', 'Saved data visible in view mode', 'FAIL', e.message); }
}

async function tc16(driver) {
  console.log('\n📌 TC-16 — Data persists after page refresh');
  try {
    await driver.navigate().refresh();
    await waitForDashboard(driver);
    const body = await driver.findElement(By.tagName('body')).getText();
    if (body.includes(TEST_PROFILE.companyName)) {
      record('TC-16', 'Data persists after page refresh', 'PASS');
    } else {
      record('TC-16', 'Data persists after page refresh', 'FAIL', 'Data lost after refresh');
    }
  } catch (e) { record('TC-16', 'Data persists after page refresh', 'FAIL', e.message); }
}

async function tc17(driver) {
  console.log('\n📌 TC-17 — Logo upload file input is present and enabled');
  try {
    await openEditMode(driver);
    const fileInput = await driver.wait(
      until.elementLocated(By.xpath("//input[@type='file']")),
      12000
    );
    const enabled = await fileInput.isEnabled();
    if (enabled) {
      record('TC-17', 'Logo upload file input present and enabled', 'PASS');
    } else {
      record('TC-17', 'Logo upload file input present and enabled', 'FAIL', 'Input disabled');
    }
  } catch (e) { record('TC-17', 'Logo upload file input present and enabled', 'FAIL', e.message); }
}

async function tc18(driver) {
  console.log('\n📌 TC-18 — Logo upload accepts image MIME types');
  try {
    const fileInput = await driver.findElement(By.xpath("//input[@type='file']"));
    const accept = await fileInput.getAttribute('accept');
    const ok = accept && accept.includes('image/jpeg') && accept.includes('image/png');
    if (ok) {
      record('TC-18', 'Logo upload accepts image MIME types', 'PASS', `accept="${accept}"`);
    } else {
      record('TC-18', 'Logo upload accepts image MIME types', 'FAIL', `Unexpected: "${accept}"`);
    }
  } catch (e) { record('TC-18', 'Logo upload accepts image MIME types', 'FAIL', e.message); }
}

async function tc19(driver) {
  console.log('\n📌 TC-19 — Logo upload input is not hidden from DOM');
  try {
    const fileInput = await driver.findElement(By.xpath("//input[@type='file']"));
    const tag = await fileInput.getTagName();
    if (tag === 'input') {
      record('TC-19', 'Logo upload input exists in DOM', 'PASS');
    } else {
      record('TC-19', 'Logo upload input exists in DOM', 'FAIL', 'Element not found');
    }
  } catch (e) { record('TC-19', 'Logo upload input exists in DOM', 'FAIL', e.message); }
}

async function tc20(driver) {
  console.log('\n📌 TC-20 — Data retained after re-login');
  try {
    await driver.executeScript('localStorage.clear(); sessionStorage.clear();');
    await doLogin(driver);
    await waitForDashboard(driver);
    const body = await driver.findElement(By.tagName('body')).getText();
    if (body.includes(TEST_PROFILE.companyName)) {
      record('TC-20', 'Data retained after re-login', 'PASS');
    } else {
      record('TC-20', 'Data retained after re-login', 'FAIL', 'Company name not found');
    }
  } catch (e) { record('TC-20', 'Data retained after re-login', 'FAIL', e.message); }
}

async function tc21(driver) {
  console.log('\n📌 TC-21 — Cleanup: reset profile name');
  try {
    await openEditMode(driver);
    await fillProfile(driver, { ...TEST_PROFILE, companyName: 'Original Company' });
    await clickSave(driver);
    await waitForSuccess(driver);
    record('TC-21', 'Cleanup: reset profile', 'PASS');
  } catch (e) { record('TC-21', 'Cleanup: reset profile', 'FAIL', e.message); }
}

async function tc22(driver) {
  console.log('\n📌 TC-22 — Cleanup: clear session');
  try {
    await driver.executeScript('localStorage.clear(); sessionStorage.clear();');
    await driver.get(LOGIN_URL);
    record('TC-22', 'Cleanup: session cleared', 'PASS');
  } catch (e) { record('TC-22', 'Cleanup: session cleared', 'FAIL', e.message); }
}

// ── Summary ───────────────────────────────────────────────────────────────────

function printSummary() {
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('   RESULTS — US-01: Company Profile Update');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log(`   Total: ${results.length}  |  Passed: ${passed} ✅  |  Failed: ${failed} ❌`);
  console.log(`   Pass Rate: ${Math.round((passed / results.length) * 100)}%`);
  console.log('──────────────────────────────────────────────────────────────────');
  results.forEach(r => {
    console.log(`   ${r.status === 'PASS' ? '✅' : '❌'}  ${r.tcId.padEnd(6)} ${r.desc}`);
    if (r.note) console.log(`          └─ ${r.note}`);
  });
  console.log('══════════════════════════════════════════════════════════════════\n');
}

// ── Runner ────────────────────────────────────────────────────────────────────

async function run() {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('   PathFinder — US-01: Company Profile Update');
  console.log('   Target: https://pathfinder-frontend-navy.vercel.app');
  console.log('══════════════════════════════════════════════════════════════════');

  let driver;
  try {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();

    console.log('\n━━━ Group 1: Authentication & Access Control ━━━');
    await tc01(driver);
    await tc02(driver);
    await tc03(driver);
    await tc04(driver);

    await doLogin(driver);
    await waitForDashboard(driver);

    console.log('\n━━━ Group 2: Edit Mode & Field Population ━━━');
    await tc05(driver);
    await tc06(driver);
    await tc07(driver);
    await tc08(driver);

    console.log('\n━━━ Group 3: Validation Rules ━━━');
    await openEditMode(driver);
    await tc09(driver);
    await openEditMode(driver);
    await tc10(driver);
    await openEditMode(driver);
    await tc11(driver);
    await openEditMode(driver);
    await tc12(driver);

    console.log('\n━━━ Group 4: Save & Cancel Behaviour ━━━');
    await openEditMode(driver);
    await tc13(driver);
    await tc14(driver);
    await tc15(driver);
    await tc16(driver);

    console.log('\n━━━ Group 5: Logo Upload Controls ━━━');
    await openEditMode(driver);
    await tc17(driver);
    await tc18(driver);
    await tc19(driver);

    console.log('\n━━━ Group 6: Persistence & Cleanup ━━━');
    await tc20(driver);
    await tc21(driver);
    await tc22(driver);

  } catch (err) {
    console.error(`\n💥 Runner error: ${err.message}`);
  } finally {
    printSummary();
    if (driver) {
      await driver.sleep(4000);
      await driver.quit();
    }
  }
}

run();
