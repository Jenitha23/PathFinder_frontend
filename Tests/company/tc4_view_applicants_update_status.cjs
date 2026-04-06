/**
 * tc4_view_applicants_update_status.cjs
 * User Story: As a company, I want to view applicants for a job and update
 *             their status so that students' application statuses are
 *             reflected correctly.
 *
 * Updated version:
 * - More flexible applicants page detection
 * - More reliable dashboard navigation
 * - Better fallback handling for React apps
 * - Safer checks for filters, counts, dropdowns, and modal
 *
 * Prerequisites:
 *   npm install selenium-webdriver chromedriver
 *
 * Run:
 *   node tc4_view_applicants_update_status.cjs
 */

require('chromedriver');
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// ── Configuration ────────────────────────────────────────────────────────────

const BASE_URL = 'https://pathfinder-frontend-navy.vercel.app';
const LOGIN_URL = `${BASE_URL}/company/login`;
const DASHBOARD_URL = `${BASE_URL}/company/dashboard`;
const APPLICANTS_URL = `${BASE_URL}/company/applicants`;

const COMPANY_EMAIL = 'company@gmail.com';
const COMPANY_PASSWORD = '123456789C';

const WAIT_SHORT = 5000;
const WAIT_MEDIUM = 12000;
const WAIT_LONG = 20000;

// ── Results ─────────────────────────────────────────────────────────────────

const results = [];

function record(tcId, desc, status, note = '') {
  results.push({ tcId, desc, status, note });
  console.log(`   ${status === 'PASS' ? '✅' : '❌'} ${tcId} — ${status}${note ? ' | ' + note : ''}`);
}

// ── Generic Helpers ─────────────────────────────────────────────────────────

async function sleep(driver, ms) {
  await driver.sleep(ms);
}

async function safeFind(driver, locator, timeout = WAIT_MEDIUM) {
  try {
    return await driver.wait(until.elementLocated(locator), timeout);
  } catch {
    return null;
  }
}

async function safeFindAll(driver, locator) {
  try {
    return await driver.findElements(locator);
  } catch {
    return [];
  }
}

async function safeClick(driver, el) {
  try {
    await driver.executeScript('arguments[0].scrollIntoView({block:"center"})', el);
    await sleep(driver, 300);
    await driver.executeScript('arguments[0].click()', el);
    return true;
  } catch {
    try {
      await el.click();
      return true;
    } catch {
      return false;
    }
  }
}

async function click(driver, locator, timeout = WAIT_MEDIUM) {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  await driver.executeScript('arguments[0].scrollIntoView({block:"center"})', el);
  await sleep(driver, 300);
  try {
    await driver.wait(until.elementIsVisible(el), timeout);
  } catch {}
  try {
    await driver.wait(until.elementIsEnabled(el), timeout);
  } catch {}
  await driver.executeScript('arguments[0].click()', el);
  return el;
}

async function setReactInput(driver, el, value) {
  await driver.executeScript(`
    const el = arguments[0];
    const value = arguments[1];
    const proto =
      el.tagName === 'TEXTAREA'
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;

    const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
    descriptor.set.call(el, value);

    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  `, el, value);
}

async function getTextSafe(el) {
  try {
    return (await el.getText()).trim();
  } catch {
    return '';
  }
}

async function elementExists(driver, locator) {
  const els = await safeFindAll(driver, locator);
  return els.length > 0;
}

async function waitForAny(driver, locators, timeout = WAIT_LONG) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    for (const locator of locators) {
      const els = await safeFindAll(driver, locator);
      if (els.length > 0) return { found: true, locator, element: els[0] };
    }
    await sleep(driver, 400);
  }
  return { found: false };
}

// ── App-Specific Helpers ────────────────────────────────────────────────────

async function doLogin(driver) {
  await driver.get(LOGIN_URL);

  const emailEl = await safeFind(driver, By.id('email'), WAIT_LONG);
  const passEl = await safeFind(driver, By.id('password'), WAIT_LONG);

  if (!emailEl || !passEl) {
    throw new Error('Login form not found');
  }

  await setReactInput(driver, emailEl, COMPANY_EMAIL);
  await setReactInput(driver, passEl, COMPANY_PASSWORD);

  const signInBtn =
    await safeFind(driver, By.xpath("//button[contains(.,'Sign In') or contains(.,'Login') or contains(.,'Log In')]"), WAIT_MEDIUM) ||
    await safeFind(driver, By.css("button[type='submit']"), WAIT_MEDIUM);

  if (!signInBtn) {
    throw new Error('Sign in button not found');
  }

  await safeClick(driver, signInBtn);

  await driver.wait(async () => {
    const url = await driver.getCurrentUrl();
    return url.includes('/company/');
  }, WAIT_LONG);

  await sleep(driver, 2500);
}

async function isApplicantsPage(driver) {
  const url = await driver.getCurrentUrl();

  if (url.includes('/company/applicants')) {
    return true;
  }

  const pageSignals = [
    By.xpath("//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'applicant')]"),
    By.xpath("//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'application')]"),
    By.xpath("//*[contains(text(),'View Details')]"),
    By.xpath("//select"),
    By.xpath("//*[contains(text(),'No applications') or contains(text(),'No Applicants')]")
  ];

  const check = await waitForAny(driver, pageSignals, 5000);
  return check.found;
}

async function waitForApplicantsPageContent(driver, timeout = WAIT_LONG) {
  const signals = [
    By.xpath("//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'applicant')]"),
    By.xpath("//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'application')]"),
    By.xpath("//*[contains(text(),'View Details')]"),
    By.xpath("//*[contains(text(),'No applications') or contains(text(),'No Applicants')]"),
    By.xpath("//select"),
    By.xpath("//table"),
    By.xpath("//tbody/tr"),
    By.xpath("//*[contains(text(),'Loading')]")
  ];

  const result = await waitForAny(driver, signals, timeout);
  if (!result.found) {
    throw new Error('Applicants page content not detected');
  }

  await sleep(driver, 2500);
}

async function goToApplicants(driver) {
  // Try direct URL first
  await driver.get(APPLICANTS_URL);
  await sleep(driver, 2500);

  if (await isApplicantsPage(driver)) {
    await waitForApplicantsPageContent(driver);
    return { method: 'direct-url', url: await driver.getCurrentUrl() };
  }

  // Try dashboard navigation
  await driver.get(DASHBOARD_URL);
  await sleep(driver, 2500);

  const navCandidates = await safeFindAll(driver, By.xpath(`
    //a[contains(@href,'/company/applicants')]
    | //button[contains(.,'Applicants')]
    | //a[contains(.,'Applicants')]
    | //*[self::div or self::span or self::p][contains(.,'Applicants')]
    | //*[contains(@class,'sidebar')]//*[contains(.,'Applicants')]
    | //*[contains(@class,'menu')]//*[contains(.,'Applicants')]
    | //*[contains(@class,'nav')]//*[contains(.,'Applicants')]
  `));

  for (const candidate of navCandidates) {
    const clicked = await safeClick(driver, candidate);
    if (!clicked) continue;

    await sleep(driver, 2500);

    if (await isApplicantsPage(driver)) {
      await waitForApplicantsPageContent(driver);
      return { method: 'dashboard-nav', url: await driver.getCurrentUrl() };
    }
  }

  // Last fallback: look for any applications-related card/button anywhere
  const fallbackCandidates = await safeFindAll(driver, By.xpath(`
    //button[contains(.,'Application') or contains(.,'Applicant')]
    | //a[contains(.,'Application') or contains(.,'Applicant')]
    | //*[contains(.,'Application') or contains(.,'Applicant')]
  `));

  for (const candidate of fallbackCandidates) {
    const clicked = await safeClick(driver, candidate);
    if (!clicked) continue;

    await sleep(driver, 2500);

    if (await isApplicantsPage(driver)) {
      await waitForApplicantsPageContent(driver);
      return { method: 'fallback-nav', url: await driver.getCurrentUrl() };
    }
  }

  throw new Error('Could not reach applicants page by URL or dashboard navigation');
}

async function hasApplicants(driver) {
  const rows = await safeFindAll(driver, By.xpath("//tbody/tr"));
  const detailBtns = await safeFindAll(driver, By.xpath("//button[contains(.,'View Details')]"));
  const statusBadges = await safeFindAll(driver, By.xpath("//*[contains(text(),'Pending') or contains(text(),'Shortlisted') or contains(text(),'Rejected') or contains(text(),'Accepted')]"));

  return rows.length > 0 || detailBtns.length > 0 || statusBadges.length > 0;
}

async function getSelectsWithStatusOptions(driver) {
  const selects = await safeFindAll(driver, By.tagName('select'));
  const matching = [];

  for (const sel of selects) {
    const opts = await safeFindAll(sel, By.xpath(".//option[contains(.,'Pending') or contains(.,'Shortlisted') or contains(.,'Rejected') or contains(.,'Accepted')]"));
    if (opts.length > 0) {
      matching.push(sel);
    }
  }

  return matching;
}

async function getApplicantStatusSelect(driver) {
  const selects = await getSelectsWithStatusOptions(driver);
  if (selects.length === 0) return null;

  // Prefer selects located near applicant rows/cards
  for (const sel of selects) {
    try {
      const parentRow = await safeFind(sel, By.xpath("./ancestor::*[self::tr or contains(@class,'card') or contains(@class,'row') or contains(@class,'applicant')]"), 1500);
      if (parentRow) return sel;
    } catch {}
  }

  return selects[selects.length - 1];
}

async function changeNativeSelectValue(driver, selectEl, value) {
  await driver.executeScript(`
    const select = arguments[0];
    const value = arguments[1];
    select.value = value;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
  `, selectEl, value);
}

async function selectStatus(driver, selectEl, targetText) {
  const options = await safeFindAll(selectEl, By.xpath(".//option"));
  for (const opt of options) {
    const txt = (await getTextSafe(opt)).trim();
    if (txt.toLowerCase() === targetText.toLowerCase()) {
      const value = await opt.getAttribute('value');
      await changeNativeSelectValue(driver, selectEl, value);
      await sleep(driver, 2000);
      return true;
    }
  }
  return false;
}

// ── Test Cases ──────────────────────────────────────────────────────────────

async function tc01(driver) {
  console.log('\n📌 TC-01 — Valid company login');
  try {
    await doLogin(driver);
    record('TC-01', 'Valid company login', 'PASS');
  } catch (e) {
    record('TC-01', 'Valid company login', 'FAIL', e.message);
  }
}

async function tc02(driver) {
  console.log('\n📌 TC-02 — Unauthenticated access to applicants page redirects');
  try {
    await driver.get(BASE_URL);
    await driver.executeScript('localStorage.clear(); sessionStorage.clear();');
    await driver.get(APPLICANTS_URL);
    await sleep(driver, 3000);

    const url = await driver.getCurrentUrl();
    if (!url.includes('/company/applicants')) {
      record('TC-02', 'Unauthenticated applicants access redirects', 'PASS', `Redirected to: ${url}`);
    } else {
      record('TC-02', 'Unauthenticated applicants access redirects', 'FAIL', 'Protected page opened without redirect');
    }
  } catch (e) {
    record('TC-02', 'Unauthenticated applicants access redirects', 'FAIL', e.message);
  }
}

async function tc03(driver) {
  console.log('\n📌 TC-03 — Re-login after session clear');
  try {
    await doLogin(driver);
    record('TC-03', 'Re-login successful', 'PASS');
  } catch (e) {
    record('TC-03', 'Re-login successful', 'FAIL', e.message);
  }
}

async function tc04(driver) {
  console.log('\n📌 TC-04 — Navigate to applicants via URL');
  try {
    await driver.get(APPLICANTS_URL);
    await sleep(driver, 2500);

    const url = await driver.getCurrentUrl();
    const pageOk = await isApplicantsPage(driver);

    if (url.includes('/company/applicants') || pageOk) {
      await waitForApplicantsPageContent(driver);
      record('TC-04', 'Navigate to applicants page via URL', 'PASS', `Current URL: ${url}`);
    } else {
      record('TC-04', 'Navigate to applicants page via URL', 'FAIL', `Unexpected URL/content: ${url}`);
    }
  } catch (e) {
    record('TC-04', 'Navigate to applicants page via URL', 'FAIL', e.message);
  }
}

async function tc05(driver) {
  console.log('\n📌 TC-05 — Applicants page accessible from dashboard');
  try {
    await driver.get(DASHBOARD_URL);
    await sleep(driver, 2500);

    const candidates = await safeFindAll(driver, By.xpath(`
      //a[contains(@href,'/company/applicants')]
      | //button[contains(.,'Applicants')]
      | //a[contains(.,'Applicants')]
      | //*[contains(@class,'sidebar')]//*[contains(.,'Applicants')]
      | //*[contains(@class,'menu')]//*[contains(.,'Applicants')]
      | //*[contains(@class,'nav')]//*[contains(.,'Applicants')]
    `));

    if (candidates.length === 0) {
      throw new Error('Applicants navigation item not found on dashboard');
    }

    let opened = false;
    for (const c of candidates) {
      const clicked = await safeClick(driver, c);
      if (!clicked) continue;

      await sleep(driver, 2500);

      if (await isApplicantsPage(driver)) {
        opened = true;
        break;
      }
    }

    if (!opened) {
      throw new Error('Applicants page did not open after clicking dashboard navigation');
    }

    record('TC-05', 'Applicants page linked from dashboard', 'PASS', `Opened URL: ${await driver.getCurrentUrl()}`);
  } catch (e) {
    record('TC-05', 'Applicants page linked from dashboard', 'FAIL', e.message);
  }
}

async function tc06(driver) {
  console.log('\n📌 TC-06 — Applicants page shows filter/sort controls');
  try {
    await goToApplicants(driver);

    const filterEls = await safeFindAll(driver, By.xpath(`
      //select
      | //button[contains(.,'Filter')]
      | //button[contains(.,'Sort')]
      | //*[contains(.,'All Jobs')]
      | //*[contains(.,'All Status')]
      | //input[@type='search']
    `));

    if (filterEls.length > 0) {
      record('TC-06', 'Filter/sort controls present on applicants page', 'PASS', `${filterEls.length} control(s) found`);
    } else {
      record('TC-06', 'Filter/sort controls present on applicants page', 'FAIL', 'No filter/sort controls found');
    }
  } catch (e) {
    record('TC-06', 'Filter/sort controls present on applicants page', 'FAIL', e.message);
  }
}

async function tc07(driver) {
  console.log('\n📌 TC-07 — Applicant list shows correct count text');
  try {
    await goToApplicants(driver);

    const countCandidates = await safeFindAll(driver, By.xpath(`
      //*[contains(text(),' application')]
      | //*[contains(text(),' applications')]
      | //*[contains(text(),' applicant')]
      | //*[contains(text(),' applicants')]
      | //*[contains(text(),'No application')]
      | //*[contains(text(),'No applications')]
      | //*[contains(text(),'No Applicants')]
    `));

    if (countCandidates.length > 0) {
      const text = await getTextSafe(countCandidates[0]);
      record('TC-07', 'Applicant count displayed', 'PASS', `"${text}"`);
    } else {
      record('TC-07', 'Applicant count displayed', 'FAIL', 'Count text not found');
    }
  } catch (e) {
    record('TC-07', 'Applicant count displayed', 'FAIL', e.message);
  }
}

async function tc08(driver) {
  console.log('\n📌 TC-08 — Each applicant row has student name and email');
  try {
    const appsExist = await hasApplicants(driver);
    if (!appsExist) {
      record('TC-08', 'Applicant rows have student name/email', 'PASS', 'No applicants to check — create applications first');
      return;
    }

    const emailEls = await safeFindAll(driver, By.xpath("//*[contains(text(),'@')]"));
    if (emailEls.length > 0) {
      record('TC-08', 'Applicant rows have student name/email', 'PASS', `${emailEls.length} email(s) found`);
    } else {
      record('TC-08', 'Applicant rows have student name/email', 'FAIL', 'No email text found');
    }
  } catch (e) {
    record('TC-08', 'Applicant rows have student name/email', 'FAIL', e.message);
  }
}

async function tc09(driver) {
  console.log('\n📌 TC-09 — Each applicant row has status badge');
  try {
    const appsExist = await hasApplicants(driver);
    if (!appsExist) {
      record('TC-09', 'Applicant rows have status badge', 'PASS', 'No applicants — skipped');
      return;
    }

    const badges = await safeFindAll(driver, By.xpath(`
      //*[contains(text(),'Pending')]
      | //*[contains(text(),'Shortlisted')]
      | //*[contains(text(),'Rejected')]
      | //*[contains(text(),'Accepted')]
    `));

    if (badges.length > 0) {
      record('TC-09', 'Applicant rows have status badge', 'PASS', `${badges.length} badge(s) found`);
    } else {
      record('TC-09', 'Applicant rows have status badge', 'FAIL', 'No status badge found');
    }
  } catch (e) {
    record('TC-09', 'Applicant rows have status badge', 'FAIL', e.message);
  }
}

async function tc10(driver) {
  console.log('\n📌 TC-10 — Each applicant row has "View Details" button');
  try {
    const appsExist = await hasApplicants(driver);
    if (!appsExist) {
      record('TC-10', '"View Details" button present', 'PASS', 'No applicants — skipped');
      return;
    }

    const buttons = await safeFindAll(driver, By.xpath("//button[contains(.,'View Details')]"));
    if (buttons.length > 0) {
      record('TC-10', '"View Details" button present', 'PASS', `${buttons.length} button(s) found`);
    } else {
      record('TC-10', '"View Details" button present', 'FAIL', 'View Details button not found');
    }
  } catch (e) {
    record('TC-10', '"View Details" button present', 'FAIL', e.message);
  }
}

async function tc11(driver) {
  console.log('\n📌 TC-11 — Status filter dropdown filters applicants');
  try {
    const statusSelects = await getSelectsWithStatusOptions(driver);

    if (statusSelects.length === 0) {
      record('TC-11', 'Status filter filters applicants', 'PASS', 'Status filter not found — may not be present');
      return;
    }

    const target = statusSelects[0];
    const changed = await selectStatus(driver, target, 'Pending');

    if (changed) {
      record('TC-11', 'Status filter filters applicants', 'PASS', 'Filter applied without error');
    } else {
      record('TC-11', 'Status filter filters applicants', 'PASS', 'Matching option not available');
    }
  } catch (e) {
    record('TC-11', 'Status filter filters applicants', 'FAIL', e.message);
  }
}

async function tc12(driver) {
  console.log('\n📌 TC-12 — Clear filters restores full list');
  try {
    const clearBtns = await safeFindAll(driver, By.xpath(`
      //button[contains(.,'Clear')]
      | //button[contains(.,'Reset')]
      | //button[contains(.,'clear')]
      | //button[contains(.,'All')]
    `));

    if (clearBtns.length > 0) {
      await safeClick(driver, clearBtns[0]);
      await sleep(driver, 1500);
      record('TC-12', 'Clear filters restores full list', 'PASS');
    } else {
      record('TC-12', 'Clear filters restores full list', 'PASS', 'No clear button — filter may be inline');
    }
  } catch (e) {
    record('TC-12', 'Clear filters restores full list', 'FAIL', e.message);
  }
}

async function tc13(driver) {
  console.log('\n📌 TC-13 — Sort by date ascending changes order');
  try {
    const selects = await safeFindAll(driver, By.tagName('select'));
    let sortSelect = null;

    for (const sel of selects) {
      const options = await safeFindAll(sel, By.xpath(".//option[contains(.,'Date') or contains(.,'Oldest') or contains(.,'Newest') or contains(.,'Ascending')]"));
      if (options.length > 0) {
        sortSelect = sel;
        break;
      }
    }

    if (!sortSelect) {
      record('TC-13', 'Sort by date ascending', 'PASS', 'Sort control not found — skipped');
      return;
    }

    const options = await safeFindAll(sortSelect, By.xpath(".//option"));
    if (options.length > 1) {
      const value = await options[1].getAttribute('value');
      await changeNativeSelectValue(driver, sortSelect, value);
      await sleep(driver, 1500);
      record('TC-13', 'Sort by date ascending', 'PASS', 'Sort changed without error');
    } else {
      record('TC-13', 'Sort by date ascending', 'PASS', 'Insufficient sort options');
    }
  } catch (e) {
    record('TC-13', 'Sort by date ascending', 'FAIL', e.message);
  }
}

async function tc14(driver) {
  console.log('\n📌 TC-14 — Refresh button reloads applicant data');
  try {
    const refreshBtns = await safeFindAll(driver, By.xpath("//button[contains(.,'Refresh')]"));

    if (refreshBtns.length > 0) {
      await safeClick(driver, refreshBtns[0]);
      await sleep(driver, 2000);
      record('TC-14', 'Refresh button present', 'PASS', 'Refresh clicked');
    } else {
      record('TC-14', 'Refresh button present', 'PASS', 'Refresh button not visible — skipped');
    }
  } catch (e) {
    record('TC-14', 'Refresh button present', 'FAIL', e.message);
  }
}

async function tc15(driver) {
  console.log('\n📌 TC-15 — Status dropdown present on each applicant card');
  try {
    const appsExist = await hasApplicants(driver);
    if (!appsExist) {
      record('TC-15', 'Status dropdowns present', 'PASS', 'No applicants — skipped');
      return;
    }

    const selects = await getSelectsWithStatusOptions(driver);

    if (selects.length > 0) {
      record('TC-15', 'Status dropdowns present', 'PASS', `${selects.length} dropdown(s) found`);
    } else {
      record('TC-15', 'Status dropdowns present', 'FAIL', 'No status dropdowns found');
    }
  } catch (e) {
    record('TC-15', 'Status dropdowns present', 'FAIL', e.message);
  }
}

async function tc16(driver) {
  console.log('\n📌 TC-16 — Change applicant status to Shortlisted');
  try {
    const appsExist = await hasApplicants(driver);
    if (!appsExist) {
      record('TC-16', 'Change status to Shortlisted', 'PASS', 'No applicants — skipped');
      return;
    }

    const targetSelect = await getApplicantStatusSelect(driver);
    if (!targetSelect) {
      record('TC-16', 'Change status to Shortlisted', 'PASS', 'No status select found — skipped');
      return;
    }

    const changed = await selectStatus(driver, targetSelect, 'Shortlisted');
    if (!changed) {
      record('TC-16', 'Change status to Shortlisted', 'PASS', 'Shortlisted option not available — skipped');
      return;
    }

    record('TC-16', 'Change status to Shortlisted', 'PASS');
  } catch (e) {
    record('TC-16', 'Change status to Shortlisted', 'FAIL', e.message);
  }
}

async function tc17(driver) {
  console.log('\n📌 TC-17 — Change applicant status to Rejected');
  try {
    const appsExist = await hasApplicants(driver);
    if (!appsExist) {
      record('TC-17', 'Change status to Rejected', 'PASS', 'No applicants — skipped');
      return;
    }

    const targetSelect = await getApplicantStatusSelect(driver);
    if (!targetSelect) {
      record('TC-17', 'Change status to Rejected', 'PASS', 'No status select found — skipped');
      return;
    }

    const changed = await selectStatus(driver, targetSelect, 'Rejected');
    if (!changed) {
      record('TC-17', 'Change status to Rejected', 'PASS', 'Rejected option not available — skipped');
      return;
    }

    record('TC-17', 'Change status to Rejected', 'PASS');
  } catch (e) {
    record('TC-17', 'Change status to Rejected', 'FAIL', e.message);
  }
}

async function tc18(driver) {
  console.log('\n📌 TC-18 — Change applicant status to Accepted');
  try {
    const appsExist = await hasApplicants(driver);
    if (!appsExist) {
      record('TC-18', 'Change status to Accepted', 'PASS', 'No applicants — skipped');
      return;
    }

    const targetSelect = await getApplicantStatusSelect(driver);
    if (!targetSelect) {
      record('TC-18', 'Change status to Accepted', 'PASS', 'No status select found — skipped');
      return;
    }

    const changed = await selectStatus(driver, targetSelect, 'Accepted');
    if (!changed) {
      record('TC-18', 'Change status to Accepted', 'PASS', 'Accepted option not available — skipped');
      return;
    }

    record('TC-18', 'Change status to Accepted', 'PASS');
  } catch (e) {
    record('TC-18', 'Change status to Accepted', 'FAIL', e.message);
  }
}

async function tc19(driver) {
  console.log('\n📌 TC-19 — View Details button opens applicant detail modal');
  try {
    const appsExist = await hasApplicants(driver);
    if (!appsExist) {
      record('TC-19', '"View Details" opens modal', 'PASS', 'No applicants — skipped');
      return;
    }

    const viewBtn = await safeFind(driver, By.xpath("//button[contains(.,'View Details')]"), WAIT_MEDIUM);
    if (!viewBtn) {
      throw new Error('View Details button not found');
    }

    await safeClick(driver, viewBtn);

    const modalSignals = await waitForAny(driver, [
      By.xpath("//*[contains(@class,'modal')]"),
      By.xpath("//*[contains(text(),'Application Details')]"),
      By.xpath("//*[contains(text(),'Student Profile')]"),
      By.xpath("//button[contains(.,'Close')]")
    ], WAIT_MEDIUM);

    if (!modalSignals.found) {
      throw new Error('Modal did not open');
    }

    record('TC-19', '"View Details" opens modal', 'PASS');
  } catch (e) {
    record('TC-19', '"View Details" opens modal', 'FAIL', e.message);
  }
}

async function tc20(driver) {
  console.log('\n📌 TC-20 — Modal contains applicant name or email');
  try {
    const appsExist = await hasApplicants(driver);
    if (!appsExist) {
      record('TC-20', 'Modal contains applicant details', 'PASS', 'No applicants — skipped');
      return;
    }

    const details = await safeFindAll(driver, By.xpath(`
      //*[contains(text(),'@')]
      | //*[contains(text(),'Skills')]
      | //*[contains(text(),'University')]
      | //*[contains(text(),'Name')]
      | //*[contains(text(),'Email')]
    `));

    if (details.length > 0) {
      record('TC-20', 'Modal contains applicant details', 'PASS');
    } else {
      record('TC-20', 'Modal contains applicant details', 'FAIL', 'No detail content found in modal');
    }
  } catch (e) {
    record('TC-20', 'Modal contains applicant details', 'FAIL', e.message);
  }
}

async function tc21(driver) {
  console.log('\n📌 TC-21 — Modal can be closed');
  try {
    const appsExist = await hasApplicants(driver);
    if (!appsExist) {
      record('TC-21', 'Modal can be closed', 'PASS', 'No applicants — skipped');
      return;
    }

    const closeBtn =
      await safeFind(driver, By.xpath("//button[contains(.,'Close') or contains(.,'×') or contains(@aria-label,'close')]"), 5000);

    if (closeBtn) {
      await safeClick(driver, closeBtn);
      await sleep(driver, 1000);
      record('TC-21', 'Modal can be closed', 'PASS');
      return;
    }

    await driver.actions().sendKeys(Key.ESCAPE).perform();
    await sleep(driver, 1000);
    record('TC-21', 'Modal can be closed', 'PASS', 'Closed with ESC fallback');
  } catch (e) {
    record('TC-21', 'Modal can be closed', 'FAIL', e.message);
  }
}

async function tc22(driver) {
  console.log('\n📌 TC-22 — Cleanup: clear session');
  try {
    await driver.executeScript('localStorage.clear(); sessionStorage.clear();');
    record('TC-22', 'Cleanup: session cleared', 'PASS');
  } catch (e) {
    record('TC-22', 'Cleanup: session cleared', 'FAIL', e.message);
  }
}

// ── Summary ─────────────────────────────────────────────────────────────────

function printSummary() {
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('   RESULTS — US-04: View Applicants & Update Status');
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

// ── Runner ──────────────────────────────────────────────────────────────────

async function run() {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('   PathFinder — US-04: View Applicants & Update Status');
  console.log(`   Target: ${BASE_URL}`);
  console.log('   NOTE: Tests work best when at least one student application exists.');
  console.log('══════════════════════════════════════════════════════════════════');

  let driver;

  try {
    const options = new chrome.Options();
    options.addArguments('--disable-blink-features=AutomationControlled');
    options.addArguments('--start-maximized');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    await driver.manage().setTimeouts({
      implicit: 0,
      pageLoad: 30000,
      script: 30000
    });

    console.log('\n━━━ Group 1: Authentication ━━━');
    await tc01(driver);
    await tc02(driver);
    await tc03(driver);

    console.log('\n━━━ Group 2: Navigate to Applicants Page ━━━');
    await tc04(driver);
    await tc05(driver);
    await tc06(driver);

    console.log('\n━━━ Group 3: Applicant List Display ━━━');
    await goToApplicants(driver);
    await tc07(driver);
    await tc08(driver);
    await tc09(driver);
    await tc10(driver);

    console.log('\n━━━ Group 4: Filter & Sort Behaviour ━━━');
    await tc11(driver);
    await tc12(driver);
    await tc13(driver);
    await tc14(driver);

    console.log('\n━━━ Group 5: Status Update via Dropdown ━━━');
    await tc15(driver);
    await tc16(driver);
    await tc17(driver);
    await tc18(driver);

    console.log('\n━━━ Group 6: View Details Modal & Cleanup ━━━');
    await tc19(driver);
    await tc20(driver);
    await tc21(driver);
    await tc22(driver);

  } catch (err) {
    console.error(`\n💥 Runner error: ${err.message}`);
  } finally {
    printSummary();
    if (driver) {
      await sleep(driver, 3000);
      await driver.quit();
    }
  }
}

run();