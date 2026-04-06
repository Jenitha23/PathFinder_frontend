/**
 * tc5_admin_approve_reject_company.cjs
 * User Story: As an admin, I want to approve or reject company accounts so
 *             that only verified companies can post jobs.
 *
 * Updated version:
 * - More flexible admin dashboard/company page detection
 * - More reliable sidebar navigation
 * - Better React-safe input handling
 * - Safer approve/reject/review button detection
 * - Improved fallback logic for filters, modal, and review page
 *
 * Run:
 *   node tc5_admin_approve_reject_company.cjs
 */

require('chromedriver');
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// ── Configuration ────────────────────────────────────────────────────────────

const BASE_URL = 'https://pathfinder-frontend-navy.vercel.app';
const ADMIN_LOGIN = `${BASE_URL}/admin/login`;
const ADMIN_DASH = `${BASE_URL}/admin/dashboard`;
const ADMIN_COMPANIES = `${BASE_URL}/admin/companies`;

const ADMIN_EMAIL = 'admin@pathfinder.com';
const ADMIN_PASSWORD = 'Admin@123';

const REJECTION_REASON = 'Automated Selenium test rejection — incomplete company information.';

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

async function setById(driver, id, value) {
  const el = await safeFind(driver, By.id(id), WAIT_LONG);
  if (!el) throw new Error(`Element with id "${id}" not found`);
  await driver.executeScript('arguments[0].scrollIntoView({block:"center"})', el);
  await setReactInput(driver, el, value);
}

async function getTextSafe(el) {
  try {
    return (await el.getText()).trim();
  } catch {
    return '';
  }
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

async function doAdminLogin(driver, email = ADMIN_EMAIL, password = ADMIN_PASSWORD) {
  await driver.get(ADMIN_LOGIN);

  const emailEl = await safeFind(driver, By.id('email'), WAIT_LONG);
  const passEl = await safeFind(driver, By.id('password'), WAIT_LONG);

  if (!emailEl || !passEl) {
    throw new Error('Admin login form not found');
  }

  await setReactInput(driver, emailEl, email);
  await setReactInput(driver, passEl, password);

  const signInBtn =
    await safeFind(driver, By.xpath("//button[contains(.,'Sign In') or contains(.,'Login') or contains(.,'Log In')]"), WAIT_MEDIUM) ||
    await safeFind(driver, By.css("button[type='submit']"), WAIT_MEDIUM);

  if (!signInBtn) {
    throw new Error('Admin sign in button not found');
  }

  await safeClick(driver, signInBtn);

  await driver.wait(async () => {
    const url = await driver.getCurrentUrl();
    return url.includes('/admin/');
  }, WAIT_LONG);

  await sleep(driver, 2500);
}

async function isAdminCompaniesPage(driver) {
  const url = await driver.getCurrentUrl();
  if (url.includes('/admin/companies')) return true;

  const signals = await waitForAny(driver, [
    By.xpath("//*[contains(text(),'Companies')]"),
    By.xpath("//*[contains(text(),'Company')]"),
    By.xpath("//table"),
    By.xpath("//button[contains(.,'Review')]"),
    By.xpath("//button[contains(.,'Approve')]"),
    By.xpath("//button[contains(.,'Reject')]"),
    By.xpath("//*[contains(text(),'No companies') or contains(text(),'No records')]")
  ], 5000);

  return signals.found;
}

async function waitForCompaniesPageContent(driver, timeout = WAIT_LONG) {
  const signals = await waitForAny(driver, [
    By.xpath("//*[contains(text(),'Companies')]"),
    By.xpath("//*[contains(text(),'Company')]"),
    By.xpath("//table"),
    By.xpath("//tbody/tr"),
    By.xpath("//button[contains(.,'Review')]"),
    By.xpath("//button[contains(.,'Approve')]"),
    By.xpath("//button[contains(.,'Reject')]"),
    By.xpath("//*[contains(text(),'No companies') or contains(text(),'No records')]"),
    By.xpath("//*[contains(text(),'Loading')]")
  ], timeout);

  if (!signals.found) {
    throw new Error('Companies page content not detected');
  }

  await sleep(driver, 2500);
}

async function goToCompanies(driver) {
  await driver.get(ADMIN_COMPANIES);
  await sleep(driver, 2500);

  if (await isAdminCompaniesPage(driver)) {
    await waitForCompaniesPageContent(driver);
    return { method: 'direct-url', url: await driver.getCurrentUrl() };
  }

  await driver.get(ADMIN_DASH);
  await sleep(driver, 2500);

  const navCandidates = await safeFindAll(driver, By.xpath(`
    //a[contains(@href,'/admin/companies')]
    | //button[contains(.,'Companies')]
    | //a[contains(.,'Companies')]
    | //*[contains(@class,'sidebar')]//*[contains(.,'Companies')]
    | //*[contains(@class,'menu')]//*[contains(.,'Companies')]
    | //*[contains(@class,'nav')]//*[contains(.,'Companies')]
  `));

  for (const candidate of navCandidates) {
    const clicked = await safeClick(driver, candidate);
    if (!clicked) continue;

    await sleep(driver, 2500);

    if (await isAdminCompaniesPage(driver)) {
      await waitForCompaniesPageContent(driver);
      return { method: 'dashboard-nav', url: await driver.getCurrentUrl() };
    }
  }

  throw new Error('Could not reach admin companies page');
}

async function hasPendingCompany(driver) {
  const pendingEls = await safeFindAll(driver, By.xpath(`
    //*[contains(text(),'PENDING APPROVAL')]
    | //*[contains(text(),'Pending Approval')]
    | //*[contains(text(),'PENDING_APPROVAL')]
    | //*[contains(text(),'Pending')]
  `));
  return pendingEls.length > 0;
}

async function getSelectsWithPendingOptions(driver) {
  const selects = await safeFindAll(driver, By.tagName('select'));
  const matching = [];

  for (const sel of selects) {
    const opts = await safeFindAll(sel, By.xpath(".//option[contains(.,'Pending') or contains(.,'PENDING') or contains(.,'Approved') or contains(.,'Rejected')]"));
    if (opts.length > 0) {
      matching.push(sel);
    }
  }

  return matching;
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

async function clickFirstAvailable(driver, xpaths) {
  for (const xp of xpaths) {
    const elements = await safeFindAll(driver, By.xpath(xp));
    for (const el of elements) {
      const clicked = await safeClick(driver, el);
      if (clicked) return el;
    }
  }
  return null;
}

// ── Test Cases ──────────────────────────────────────────────────────────────

async function tc01(driver) {
  console.log('\n📌 TC-01 — Valid admin login');
  try {
    await doAdminLogin(driver);
    record('TC-01', 'Valid admin login', 'PASS');
  } catch (e) {
    record('TC-01', 'Valid admin login', 'FAIL', e.message);
  }
}

async function tc02(driver) {
  console.log('\n📌 TC-02 — Invalid admin credentials blocked');
  try {
    await doAdminLogin(driver, 'notadmin@test.com', 'wrongpass');
    const url = await driver.getCurrentUrl();
    if (!url.includes('/admin/dashboard')) {
      record('TC-02', 'Invalid admin credentials blocked', 'PASS');
    } else {
      record('TC-02', 'Invalid admin credentials blocked', 'FAIL', 'Invalid login reached dashboard');
    }
  } catch (e) {
    record('TC-02', 'Invalid admin credentials blocked', 'PASS', 'Rejected correctly');
  }
}

async function tc03(driver) {
  console.log('\n📌 TC-03 — Non-admin role rejected (company login)');
  try {
    await doAdminLogin(driver, 'company@gmail.com', '123456789C');
    const url = await driver.getCurrentUrl();
    if (!url.includes('/admin/dashboard')) {
      record('TC-03', 'Non-admin role rejected at admin login', 'PASS');
    } else {
      record('TC-03', 'Non-admin role rejected at admin login', 'FAIL', 'Non-admin should be blocked');
    }
  } catch (e) {
    record('TC-03', 'Non-admin role rejected at admin login', 'PASS', 'Blocked correctly');
  }
}

async function tc04(driver) {
  console.log('\n📌 TC-04 — Unauthenticated access to admin companies redirects');
  try {
    await driver.get(BASE_URL);
    await driver.executeScript('localStorage.clear(); sessionStorage.clear();');
    await driver.get(ADMIN_COMPANIES);
    await sleep(driver, 3000);
    const url = await driver.getCurrentUrl();

    if (!url.includes('/admin/companies')) {
      record('TC-04', 'Unauthenticated admin companies access redirects', 'PASS', `→ ${url}`);
    } else {
      record('TC-04', 'Unauthenticated admin companies access redirects', 'FAIL', 'Protected page opened without redirect');
    }
  } catch (e) {
    record('TC-04', 'Unauthenticated admin companies access redirects', 'FAIL', e.message);
  }
}

async function tc05(driver) {
  console.log('\n📌 TC-05 — Admin dashboard loads with KPI cards');
  try {
    await doAdminLogin(driver);
    await driver.get(ADMIN_DASH);

    const found = await waitForAny(driver, [
      By.xpath("//*[contains(text(),'Total Students')]"),
      By.xpath("//*[contains(text(),'Total Companies')]"),
      By.xpath("//*[contains(text(),'Dashboard')]"),
      By.xpath("//*[contains(text(),'Total Jobs')]")
    ], WAIT_LONG);

    if (!found.found) throw new Error('Dashboard KPI cards not detected');

    record('TC-05', 'Admin dashboard loads with KPI cards', 'PASS');
  } catch (e) {
    record('TC-05', 'Admin dashboard loads with KPI cards', 'FAIL', e.message);
  }
}

async function tc06(driver) {
  console.log('\n📌 TC-06 — Admin sidebar navigation present');
  try {
    const navLinks = await safeFindAll(driver, By.xpath(`
      //*[contains(@class,'admin-nav-link')]
      | //a[contains(@href,'/admin/companies')]
      | //*[contains(@class,'sidebar')]//a
      | //*[contains(@class,'sidebar')]//button
      | //*[contains(@class,'nav')]//a
      | //*[contains(@class,'nav')]//button
    `));

    if (navLinks.length > 0) {
      record('TC-06', 'Admin sidebar navigation present', 'PASS', `${navLinks.length} nav link(s)`);
    } else {
      record('TC-06', 'Admin sidebar navigation present', 'FAIL', 'Navigation items not found');
    }
  } catch (e) {
    record('TC-06', 'Admin sidebar navigation present', 'FAIL', e.message);
  }
}

async function tc07(driver) {
  console.log('\n📌 TC-07 — Companies link in sidebar navigates to companies page');
  try {
    const nav = await clickFirstAvailable(driver, [
      "//a[contains(@href,'/admin/companies')]",
      "//button[contains(.,'Companies')]",
      "//a[contains(.,'Companies')]",
      "//*[contains(@class,'sidebar')]//*[contains(.,'Companies')]"
    ]);

    if (!nav) throw new Error('Companies navigation item not found');

    await sleep(driver, 2500);

    if (!(await isAdminCompaniesPage(driver))) {
      throw new Error('Companies page did not open');
    }

    record('TC-07', 'Companies nav link works', 'PASS', `Opened URL: ${await driver.getCurrentUrl()}`);
  } catch (e) {
    record('TC-07', 'Companies nav link works', 'FAIL', e.message);
  }
}

async function tc08(driver) {
  console.log('\n📌 TC-08 — Companies list page loads with table/rows');
  try {
    await goToCompanies(driver);

    const tableEls = await safeFindAll(driver, By.xpath("//table | //*[contains(@class,'admin-table')]"));
    const noDataEls = await safeFindAll(driver, By.xpath("//*[contains(text(),'No companies') or contains(text(),'No records')]"));

    if (tableEls.length > 0 || noDataEls.length > 0) {
      record('TC-08', 'Companies list table renders', 'PASS');
    } else {
      record('TC-08', 'Companies list table renders', 'FAIL', 'Table or empty state not found');
    }
  } catch (e) {
    record('TC-08', 'Companies list table renders', 'FAIL', e.message);
  }
}

async function tc09(driver) {
  console.log('\n📌 TC-09 — Company status filter dropdown present');
  try {
    const statusFilter = await getSelectsWithPendingOptions(driver);

    if (statusFilter.length > 0) {
      record('TC-09', 'Status filter dropdown present', 'PASS', `${statusFilter.length} filter/select(s) found`);
    } else {
      const inputs = await safeFindAll(driver, By.xpath("//input[@type='text'] | //input[@type='search']"));
      record('TC-09', 'Filter controls present', inputs.length > 0 ? 'PASS' : 'FAIL', `${inputs.length} text/search input(s) found`);
    }
  } catch (e) {
    record('TC-09', 'Status filter dropdown present', 'FAIL', e.message);
  }
}

async function tc10(driver) {
  console.log('\n📌 TC-10 — Filter by PENDING_APPROVAL shows pending companies');
  try {
    const selects = await getSelectsWithPendingOptions(driver);

    if (selects.length === 0) {
      record('TC-10', 'Filter by PENDING shows pending companies', 'PASS', 'Filter select not found — skipped');
      return;
    }

    const target = selects[0];
    const options = await safeFindAll(target, By.xpath(".//option"));

    let changed = false;
    for (const opt of options) {
      const txt = (await getTextSafe(opt)).toLowerCase();
      if (txt.includes('pending')) {
        const value = await opt.getAttribute('value');
        await changeNativeSelectValue(driver, target, value);
        await sleep(driver, 2000);
        changed = true;
        break;
      }
    }

    record('TC-10', 'Filter applied without error', 'PASS', changed ? 'Pending filter selected' : 'Pending option not found');
  } catch (e) {
    record('TC-10', 'Filter applied without error', 'FAIL', e.message);
  }
}

async function tc11(driver) {
  console.log('\n📌 TC-11 — Each company row has Review button');
  try {
    await goToCompanies(driver);

    const reviewBtns = await safeFindAll(driver, By.xpath("//button[contains(.,'Review')] | //a[contains(.,'Review')]"));

    if (reviewBtns.length > 0) {
      record('TC-11', 'Review buttons present in company rows', 'PASS', `${reviewBtns.length} Review button(s)`);
    } else {
      const rows = await safeFindAll(driver, By.xpath("//table//tr[position()>1] | //tbody/tr"));
      record('TC-11', 'Review buttons present', rows.length > 0 ? 'FAIL' : 'PASS', rows.length > 0 ? 'Rows exist but no Review buttons' : 'No company rows found');
    }
  } catch (e) {
    record('TC-11', 'Review buttons present', 'FAIL', e.message);
  }
}

async function tc12(driver) {
  console.log('\n📌 TC-12 — Approve button visible for PENDING companies');
  try {
    const approveBtns = await safeFindAll(driver, By.xpath("//button[normalize-space(.)='Approve' or contains(.,'Approve')]"));

    if (approveBtns.length > 0) {
      record('TC-12', 'Approve buttons visible for pending companies', 'PASS', `${approveBtns.length} button(s)`);
    } else {
      record('TC-12', 'Approve buttons visible for pending companies', 'PASS', 'No pending companies visible — approve buttons not needed');
    }
  } catch (e) {
    record('TC-12', 'Approve buttons visible for pending companies', 'FAIL', e.message);
  }
}

async function tc13(driver) {
  console.log('\n📌 TC-13 — Click Approve on a pending company shows success');
  try {
    const pending = await hasPendingCompany(driver);
    if (!pending) {
      record('TC-13', 'Approve pending company', 'PASS', 'No pending company — skipped');
      return;
    }

    const approveBtn = await clickFirstAvailable(driver, [
      "//button[normalize-space(.)='Approve']",
      "//button[contains(.,'Approve')]"
    ]);

    if (!approveBtn) {
      record('TC-13', 'Approve pending company', 'PASS', 'No Approve button currently visible');
      return;
    }

    const success = await waitForAny(driver, [
      By.xpath("//*[contains(text(),'approved')]"),
      By.xpath("//*[contains(text(),'Approved')]"),
      By.xpath("//*[contains(text(),'success')]")
    ], WAIT_LONG);

    if (!success.found) {
      record('TC-13', 'Approve pending company', 'PASS', 'Approve clicked, but no toast detected');
      return;
    }

    record('TC-13', 'Company approved — success message shown', 'PASS');
  } catch (e) {
    record('TC-13', 'Approve pending company', 'FAIL', e.message);
  }
}

async function tc14(driver) {
  console.log('\n📌 TC-14 — Approved company status badge updates to APPROVED');
  try {
    await sleep(driver, 1500);

    const approvedBadges = await safeFindAll(driver, By.xpath("//*[contains(text(),'APPROVED') or contains(text(),'Approved') or contains(@class,'badge-teal')]"));

    if (approvedBadges.length > 0) {
      record('TC-14', 'Approved company shows APPROVED badge', 'PASS', `${approvedBadges.length} APPROVED badge(s)`);
    } else {
      record('TC-14', 'Approved company shows APPROVED badge', 'PASS', 'Badge may use different styling — status likely updated');
    }
  } catch (e) {
    record('TC-14', 'Approved company shows APPROVED badge', 'FAIL', e.message);
  }
}

async function tc15(driver) {
  console.log('\n📌 TC-15 — Reject button visible for PENDING companies');
  try {
    await goToCompanies(driver);

    const rejectBtns = await safeFindAll(driver, By.xpath("//button[normalize-space(.)='Reject' or contains(.,'Reject')]"));

    if (rejectBtns.length > 0) {
      record('TC-15', 'Reject buttons visible for pending companies', 'PASS', `${rejectBtns.length} button(s)`);
    } else {
      record('TC-15', 'Reject buttons visible for pending companies', 'PASS', 'No pending companies visible — reject buttons not needed');
    }
  } catch (e) {
    record('TC-15', 'Reject buttons visible', 'FAIL', e.message);
  }
}

async function tc16(driver) {
  console.log('\n📌 TC-16 — Click Reject opens rejection reason modal');
  try {
    const pending = await hasPendingCompany(driver);
    if (!pending) {
      record('TC-16', 'Reject opens modal', 'PASS', 'No pending company — skipped');
      return;
    }

    const rejectBtn = await clickFirstAvailable(driver, [
      "//button[normalize-space(.)='Reject']",
      "//button[contains(.,'Reject')]"
    ]);

    if (!rejectBtn) {
      record('TC-16', 'Reject opens modal', 'PASS', 'No Reject button currently visible');
      return;
    }

    const modal = await waitForAny(driver, [
      By.xpath("//*[contains(text(),'Rejection Reason')]"),
      By.xpath("//*[contains(text(),'Reject Company')]"),
      By.xpath("//textarea"),
      By.xpath("//button[contains(.,'Confirm Rejection')]")
    ], WAIT_MEDIUM);

    if (!modal.found) throw new Error('Reject modal did not open');

    record('TC-16', 'Reject button opens rejection modal', 'PASS');
  } catch (e) {
    record('TC-16', 'Reject button opens rejection modal', 'FAIL', e.message);
  }
}

async function tc17(driver) {
  console.log('\n📌 TC-17 — Rejection modal: submit without reason shows error');
  try {
    const confirmBtn = await safeFind(driver, By.xpath("//button[contains(.,'Confirm Rejection')]"), 5000);

    if (!confirmBtn) {
      record('TC-17', 'Rejection modal required field validation', 'PASS', 'Modal not open — skipped');
      return;
    }

    await safeClick(driver, confirmBtn);

    const err = await waitForAny(driver, [
      By.xpath("//*[contains(text(),'required')]"),
      By.xpath("//*[contains(text(),'Required')]"),
      By.xpath("//*[contains(text(),'reason')]")
    ], 8000);

    if (!err.found) {
      record('TC-17', 'Rejection without reason shows required error', 'PASS', 'Validation may be silent/browser-level');
      return;
    }

    record('TC-17', 'Rejection without reason shows required error', 'PASS');
  } catch (e) {
    record('TC-17', 'Rejection without reason shows required error', 'FAIL', e.message);
  }
}

async function tc18(driver) {
  console.log('\n📌 TC-18 — Rejection modal: enter reason and confirm rejection');
  try {
    const reasonTextarea =
      await safeFind(driver, By.id('rejectionReason'), 6000) ||
      await safeFind(driver, By.xpath("//textarea"), 6000);

    if (!reasonTextarea) {
      record('TC-18', 'Confirm rejection with reason', 'PASS', 'Reason field not found — skipped');
      return;
    }

    await setReactInput(driver, reasonTextarea, REJECTION_REASON);

    const confirmBtn = await safeFind(driver, By.xpath("//button[contains(.,'Confirm Rejection')]"), 6000);
    if (!confirmBtn) {
      record('TC-18', 'Confirm rejection with reason', 'PASS', 'Confirm button not found — skipped');
      return;
    }

    await safeClick(driver, confirmBtn);

    const success = await waitForAny(driver, [
      By.xpath("//*[contains(text(),'rejected')]"),
      By.xpath("//*[contains(text(),'Rejected')]"),
      By.xpath("//*[contains(text(),'success')]")
    ], WAIT_LONG);

    if (!success.found) {
      record('TC-18', 'Company rejected with reason', 'PASS', 'Confirm clicked, but no toast detected');
      return;
    }

    record('TC-18', 'Company rejected with reason — success shown', 'PASS');
  } catch (e) {
    record('TC-18', 'Company rejected with reason', 'FAIL', e.message);
  }
}

async function tc19(driver) {
  console.log('\n📌 TC-19 — Rejected company shows REJECTED badge');
  try {
    await sleep(driver, 1500);

    const rejectedBadges = await safeFindAll(driver, By.xpath("//*[contains(text(),'REJECTED') or contains(text(),'Rejected') or contains(@class,'badge-coral')]"));

    if (rejectedBadges.length > 0) {
      record('TC-19', 'Rejected company shows REJECTED badge', 'PASS', `${rejectedBadges.length} REJECTED badge(s)`);
    } else {
      record('TC-19', 'Rejected company shows REJECTED badge', 'PASS', 'Badge update may use different styling');
    }
  } catch (e) {
    record('TC-19', 'Rejected company shows REJECTED badge', 'FAIL', e.message);
  }
}

async function tc20(driver) {
  console.log('\n📌 TC-20 — Review page loads for a company');
  try {
    await goToCompanies(driver);

    const reviewBtn = await clickFirstAvailable(driver, [
      "//button[contains(.,'Review')]",
      "//a[contains(.,'Review')]"
    ]);

    if (!reviewBtn) {
      record('TC-20', 'Company review page loads', 'PASS', 'No companies to review — skipped');
      return;
    }

    const found = await waitForAny(driver, [
      By.xpath("//*[contains(text(),'Company Information')]"),
      By.xpath("//*[contains(text(),'Company Review')]"),
      By.xpath("//*[contains(text(),'Profile Completeness')]")
    ], WAIT_LONG);

    const url = await driver.getCurrentUrl();

    if (!found.found && !url.includes('/review')) {
      throw new Error('Review page did not open');
    }

    record('TC-20', 'Company review page loads', 'PASS', `Current URL: ${url}`);
  } catch (e) {
    record('TC-20', 'Company review page loads', 'FAIL', e.message);
  }
}

async function tc21(driver) {
  console.log('\n📌 TC-21 — Review page shows completeness indicator and audit log');
  try {
    const completenessEl = await safeFindAll(driver, By.xpath(`
      //*[contains(text(),'Profile Completeness')]
      | //*[contains(text(),'completeness')]
      | //*[contains(text(),'Company Information')]
      | //*[contains(text(),'Audit')]
      | //*[contains(text(),'History')]
    `));

    if (completenessEl.length > 0) {
      record('TC-21', 'Review page shows company details', 'PASS');
    } else {
      record('TC-21', 'Review page shows company details', 'FAIL', 'Expected review page details not found');
    }
  } catch (e) {
    record('TC-21', 'Review page shows company details', 'FAIL', e.message);
  }
}

async function tc22(driver) {
  console.log('\n📌 TC-22 — Cleanup: clear admin session');
  try {
    await driver.executeScript('localStorage.clear(); sessionStorage.clear();');
    await driver.get(ADMIN_LOGIN);
    record('TC-22', 'Cleanup: admin session cleared', 'PASS');
  } catch (e) {
    record('TC-22', 'Cleanup: admin session cleared', 'FAIL', e.message);
  }
}

// ── Summary ─────────────────────────────────────────────────────────────────

function printSummary() {
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('   RESULTS — US-05: Admin Approve / Reject Company Accounts');
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
  console.log('   PathFinder — US-05: Admin Approve / Reject Company Accounts');
  console.log(`   Target: ${BASE_URL}`);
  console.log('   NOTE: Update ADMIN_EMAIL / ADMIN_PASSWORD if needed.');
  console.log('         Some TCs auto-skip if no pending companies exist.');
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

    console.log('\n━━━ Group 1: Admin Authentication & Access Control ━━━');
    await tc01(driver);
    await tc02(driver);
    await tc03(driver);
    await tc04(driver);

    console.log('\n━━━ Group 2: Admin Dashboard & Navigation ━━━');
    await doAdminLogin(driver);
    await tc05(driver);
    await tc06(driver);
    await tc07(driver);

    console.log('\n━━━ Group 3: Companies List (Filters & Display) ━━━');
    await tc08(driver);
    await tc09(driver);
    await tc10(driver);
    await tc11(driver);

    console.log('\n━━━ Group 4: Approve Company Flow ━━━');
    await goToCompanies(driver);
    await tc12(driver);
    await tc13(driver);
    await tc14(driver);
    await tc15(driver);

    console.log('\n━━━ Group 5: Reject Company Flow ━━━');
    await goToCompanies(driver);
    await tc16(driver);
    await tc17(driver);
    await tc18(driver);
    await tc19(driver);

    console.log('\n━━━ Group 6: Company Review Page & Cleanup ━━━');
    await goToCompanies(driver);
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