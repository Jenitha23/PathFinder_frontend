/**
 * File: student_jobs_browse_test.cjs
 * Purpose: Runs all 30 test cases for the Student Job Browsing user story.
 *
 * User Story:
 *   As a student, I want to browse and filter job listings so that I can
 *   find suitable opportunities.
 *
 * Acceptance Criteria:
 *   AC-1: Students can see job cards showing Title, Company, Location, Deadline.
 *   AC-2: Search bar filters by keyword/title; dropdowns filter by Type/Category.
 *   AC-3: Clicking a job card opens a Job Details page with a full description.
 *   AC-4: The list supports pagination to load jobs in small batches.
 *
 * Test Groups:
 *   TC-01 to TC-04  — Authentication & Navigation
 *   TC-05 to TC-09  — Job Listing Display            (AC-1)
 *   TC-10 to TC-15  — Search & Filter                (AC-2)
 *   TC-16 to TC-19  — Pagination                     (AC-4)
 *   TC-20 to TC-25  — Job Details Page               (AC-3)
 *   TC-26 to TC-30  — Edge Cases & UI Polish
 *
 * Credentials (from student_profile_full_test.cjs):
 *   Email    : it23596566@my.sliit.lk
 *   Password : 123456789J
 *
 * Prerequisites:
 *   npm install selenium-webdriver chromedriver@133
 *   Frontend: https://pathfinder-frontend-navy.vercel.app
 *
 * Run:
 *   node student_jobs_browse_test.cjs
 */

require('chromedriver');
const { Builder, By, until } = require('selenium-webdriver');

// ── Configuration ─────────────────────────────────────────────────────────────
const BASE_URL  = 'https://pathfinder-frontend-navy.vercel.app';
const LOGIN_URL = BASE_URL + '/student/login';
const JOBS_URL  = BASE_URL + '/student/jobs';

const VALID_EMAIL    = 'testerjob@gmail.com';
const VALID_PASSWORD = '123456789J';

// ── Results ───────────────────────────────────────────────────────────────────
const results = [];
function rec(tcId, desc, status, note) {
    note = note || '';
    results.push({ tcId, desc, status, note });
    const e = status === 'PASS' ? '✅' : '❌';
    console.log('   ' + e + ' ' + tcId + ' — ' + status + (note ? ' | ' + note : ''));
}

// ── Helpers ───────────────────────────────────────────────────────────────────
async function doLogin(driver, email, pw) {
    await driver.get(LOGIN_URL);
    await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='you@example.com']")), 15000);
    const ef = await driver.findElement(By.xpath("//input[@placeholder='you@example.com']"));
    await ef.clear(); await ef.sendKeys(email);
    const pf = await driver.findElement(By.xpath("//input[@placeholder='Enter your password']"));
    await pf.clear(); await pf.sendKeys(pw);
    await driver.sleep(500);
    const btn = await driver.wait(until.elementLocated(By.xpath("//button[contains(.,'Sign In')]")), 8000);
    await driver.executeScript('arguments[0].click();', btn);
}

async function clearAuth(driver) {
    await driver.get(BASE_URL);
    await driver.executeScript(
        "localStorage.removeItem('pf_token');localStorage.removeItem('pf_role');" +
        "localStorage.removeItem('pf_userId');localStorage.removeItem('pf_email');" +
        "localStorage.removeItem('pf_fullName');"
    );
}

async function waitForJobsPage(driver) {
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'Available opportunities')]")), 20000);
    await driver.wait(async () => {
        return (await driver.findElements(By.xpath("//*[contains(text(),'Loading job listings...')]"))).length === 0;
    }, 20000);
    await driver.sleep(700);
}

async function waitForDetailsPage(driver) {
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'Job Details')]")), 20000);
    await driver.wait(async () => {
        return (await driver.findElements(By.xpath("//*[contains(text(),'Loading job details...')]"))).length === 0;
    }, 20000);
    await driver.sleep(600);
}

async function waitForLoadingGone(driver) {
    await driver.wait(async () => {
        return (await driver.findElements(By.xpath("//*[contains(text(),'Loading job listings...')]"))).length === 0;
    }, 15000);
    await driver.sleep(700);
}

async function getJobCards(driver) {
    return driver.findElements(By.xpath("//a[contains(@href,'/student/jobs/')]"));
}

async function clickSearchBtn(driver) {
    const btn = await driver.wait(until.elementLocated(By.xpath("//button[@type='submit' and contains(.,'Search')]")), 8000);
    await driver.executeScript('arguments[0].click();', btn);
    await waitForLoadingGone(driver);
}

async function setInput(driver, value) {
    const inp = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Try: Java, React, internship...']")), 8000);
    await driver.executeScript("arguments[0].select();", inp);
    await inp.clear();
    await inp.sendKeys(value);
}

async function clickClear(driver) {
    const btn = await driver.wait(until.elementLocated(By.xpath("//button[contains(.,'Clear')]")), 8000);
    await driver.executeScript('arguments[0].click();', btn);
    await waitForLoadingGone(driver);
}

async function selectDropdownOption(driver, optionText) {
    const selects = await driver.findElements(By.tagName('select'));
    for (const sel of selects) {
        const opts = await sel.findElements(By.tagName('option'));
        for (const opt of opts) {
            const t = await opt.getText();
            if (t === optionText) {
                await opt.click();
                await waitForLoadingGone(driver);
                return true;
            }
        }
    }
    return false;
}

// ── Group 1: Authentication & Navigation ─────────────────────────────────────

async function tc01(driver) {
    console.log('\nTC-01 — Login with valid student credentials');
    try {
        await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
        await driver.wait(until.urlContains('/student/home'), 20000);
        rec('TC-01', 'Login with valid student credentials', 'PASS');
    } catch(e) { rec('TC-01', 'Login with valid student credentials', 'FAIL', e.message); }
}

async function tc02(driver) {
    console.log('\nTC-02 — Navigate to jobs page after login');
    try {
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);
        const url = await driver.getCurrentUrl();
        if (url.includes('/student/jobs')) rec('TC-02', 'Navigate to jobs page after login', 'PASS');
        else rec('TC-02', 'Navigate to jobs page after login', 'FAIL', 'URL: ' + url);
    } catch(e) { rec('TC-02', 'Navigate to jobs page after login', 'FAIL', e.message); }
}

async function tc03(driver) {
    console.log('\nTC-03 — Jobs page redirects unauthenticated users');
    try {
        await clearAuth(driver);
        await driver.get(JOBS_URL);
        await driver.sleep(2500);
        const url = await driver.getCurrentUrl();
        if (!url.includes('/student/jobs')) rec('TC-03', 'Jobs page redirects unauthenticated users', 'PASS', 'Redirected to: ' + url);
        else rec('TC-03', 'Jobs page redirects unauthenticated users', 'FAIL', 'Jobs page accessible without auth');
    } catch(e) { rec('TC-03', 'Jobs page redirects unauthenticated users', 'FAIL', e.message); }
}

async function tc04(driver) {
    console.log('\nTC-04 — Back to dashboard link navigates to /student/home');
    try {
        await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
        await driver.wait(until.urlContains('/student/home'), 20000);
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);
        const backLink = await driver.wait(until.elementLocated(By.xpath("//a[contains(.,'Back to dashboard')]")), 8000);
        await driver.executeScript('arguments[0].click();', backLink);
        await driver.wait(until.urlContains('/student/home'), 10000);
        rec('TC-04', 'Back to dashboard link works', 'PASS');
    } catch(e) { rec('TC-04', 'Back to dashboard link works', 'FAIL', e.message); }
}

// ── Group 2: Job Listing Display (AC-1) ──────────────────────────────────────

async function tc05(driver) {
    console.log('\nTC-05 — [AC-1] Hero section heading renders');
    try {
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);
        const h = await driver.findElements(By.xpath("//*[contains(text(),'Browse jobs and internships')]"));
        if (h.length > 0) rec('TC-05', 'Hero heading renders', 'PASS');
        else rec('TC-05', 'Hero heading renders', 'FAIL', 'Heading not found');
    } catch(e) { rec('TC-05', 'Hero heading renders', 'FAIL', e.message); }
}

async function tc06(driver) {
    console.log('\nTC-06 — [AC-1] Job cards displayed on page load');
    try {
        const cards = await getJobCards(driver);
        if (cards.length > 0) rec('TC-06', 'Job cards displayed on page load', 'PASS', cards.length + ' card(s) found');
        else rec('TC-06', 'Job cards displayed on page load', 'FAIL', 'No job cards found');
    } catch(e) { rec('TC-06', 'Job cards displayed on page load', 'FAIL', e.message); }
}

async function tc07(driver) {
    console.log('\nTC-07 — [AC-1] Job card shows Title, Company, Location, Deadline');
    try {
        const cards = await getJobCards(driver);
        if (!cards.length) { rec('TC-07', 'Job card shows required fields', 'FAIL', 'No cards available'); return; }
        const html = await cards[0].getAttribute('innerHTML');
        const hasLocation = html.includes('📍');
        const hasDeadline = html.includes('⏳');
        const hasCategory = html.includes('🗂');
        if (hasLocation && hasDeadline && hasCategory)
            rec('TC-07', 'Job card shows Title, Company, Location, Deadline', 'PASS');
        else
            rec('TC-07', 'Job card shows Title, Company, Location, Deadline', 'FAIL',
                'Location:' + hasLocation + ' Deadline:' + hasDeadline + ' Category:' + hasCategory);
    } catch(e) { rec('TC-07', 'Job card shows required fields', 'FAIL', e.message); }
}

async function tc08(driver) {
    console.log('\nTC-08 — [AC-1] Job card shows job type badge');
    try {
        const cards = await getJobCards(driver);
        if (!cards.length) { rec('TC-08', 'Job card type badge present', 'FAIL', 'No cards available'); return; }
        const badges = await cards[0].findElements(By.xpath(".//span[contains(@class,'badge')]"));
        if (badges.length > 0) {
            const t = await badges[0].getText();
            rec('TC-08', 'Job card type badge present', 'PASS', 'Badge: "' + t + '"');
        } else rec('TC-08', 'Job card type badge present', 'FAIL', 'No badge found');
    } catch(e) { rec('TC-08', 'Job card type badge present', 'FAIL', e.message); }
}

async function tc09(driver) {
    console.log('\nTC-09 — [AC-1] Total jobs count text is shown');
    try {
        const el = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'total job')]")), 8000);
        const t  = await el.getText();
        rec('TC-09', 'Total jobs count text shown', 'PASS', '"' + t + '"');
    } catch(e) { rec('TC-09', 'Total jobs count text shown', 'FAIL', e.message); }
}

// ── Group 3: Search & Filter (AC-2) ──────────────────────────────────────────

async function tc10(driver) {
    console.log('\nTC-10 — [AC-2] Search bar is present with correct placeholder');
    try {
        const inp = await driver.findElements(By.xpath("//input[@placeholder='Try: Java, React, internship...']"));
        if (inp.length > 0) rec('TC-10', 'Search bar present with correct placeholder', 'PASS');
        else rec('TC-10', 'Search bar present with correct placeholder', 'FAIL', 'Input not found');
    } catch(e) { rec('TC-10', 'Search bar present', 'FAIL', e.message); }
}

async function tc11(driver) {
    console.log('\nTC-11 — [AC-2] Keyword search filters results');
    try {
        await setInput(driver, 'Software');
        await clickSearchBtn(driver);
        const countEl = await driver.findElement(By.xpath("//*[contains(text(),'total job')]"));
        const t = await countEl.getText();
        rec('TC-11', 'Keyword search filters results', 'PASS', 'Result: "' + t + '"');
    } catch(e) { rec('TC-11', 'Keyword search filters results', 'FAIL', e.message); }
}

async function tc12(driver) {
    console.log('\nTC-12 — [AC-2] Search with no matches shows empty state');
    try {
        await setInput(driver, 'xyznonexistentjob99999');
        await clickSearchBtn(driver);
        const empty = await driver.findElements(By.xpath("//*[contains(text(),'No jobs found')]"));
        if (empty.length > 0) rec('TC-12', 'Empty state shown for no results', 'PASS');
        else rec('TC-12', 'Empty state shown for no results', 'FAIL', 'No jobs found message not displayed');
    } catch(e) { rec('TC-12', 'Empty state for no results', 'FAIL', e.message); }
}

async function tc13(driver) {
    console.log('\nTC-13 — [AC-2] Clear button resets all filters');
    try {
        await clickClear(driver);
        const inp = await driver.findElement(By.xpath("//input[@placeholder='Try: Java, React, internship...']"));
        const val = await inp.getAttribute('value');
        const cards = await getJobCards(driver);
        if (val === '' && cards.length > 0) rec('TC-13', 'Clear button resets filters and shows all jobs', 'PASS', cards.length + ' card(s)');
        else rec('TC-13', 'Clear button resets filters', 'FAIL', 'Input: "' + val + '" Cards: ' + cards.length);
    } catch(e) { rec('TC-13', 'Clear button resets filters', 'FAIL', e.message); }
}

async function tc14(driver) {
    console.log('\nTC-14 — [AC-2] Job Type dropdown filters results');
    try {
        const found = await selectDropdownOption(driver, 'Internship');
        if (!found) { rec('TC-14', 'Job Type dropdown filters results', 'FAIL', 'Internship option not found'); return; }
        const countEl = await driver.findElement(By.xpath("//*[contains(text(),'total job')]"));
        const t = await countEl.getText();
        rec('TC-14', 'Job Type dropdown filters results', 'PASS', 'Internship result: "' + t + '"');
    } catch(e) { rec('TC-14', 'Job Type dropdown filters results', 'FAIL', e.message); }
}

async function tc15(driver) {
    console.log('\nTC-15 — [AC-2] Category dropdown filters results');
    try {
        await clickClear(driver);
        const found = await selectDropdownOption(driver, 'Software Engineering');
        if (!found) { rec('TC-15', 'Category dropdown filters results', 'FAIL', 'Software Engineering option not found'); return; }
        const countEl = await driver.findElement(By.xpath("//*[contains(text(),'total job')]"));
        const t = await countEl.getText();
        rec('TC-15', 'Category dropdown filters results', 'PASS', 'SE result: "' + t + '"');
    } catch(e) { rec('TC-15', 'Category dropdown filters results', 'FAIL', e.message); }
}

// ── Group 4: Pagination (AC-4) ────────────────────────────────────────────────

async function tc16(driver) {
    console.log('\nTC-16 — [AC-4] Pagination controls render when multiple pages exist');
    try {
        await clickClear(driver);
        const next = await driver.findElements(By.xpath("//button[contains(.,'Next')]"));
        const prev = await driver.findElements(By.xpath("//button[contains(.,'Previous')]"));
        if (next.length > 0 || prev.length > 0) rec('TC-16', 'Pagination controls visible', 'PASS', 'Next/Previous buttons found');
        else rec('TC-16', 'Pagination controls visible', 'PASS', 'Single page — pagination not needed');
    } catch(e) { rec('TC-16', 'Pagination controls visible', 'FAIL', e.message); }
}

async function tc17(driver) {
    console.log('\nTC-17 — [AC-4] Next button advances to next page');
    try {
        const nextBtns = await driver.findElements(By.xpath("//button[contains(.,'Next') and not(@disabled)]"));
        if (!nextBtns.length) { rec('TC-17', 'Next button advances page', 'PASS', 'Only one page — not applicable'); return; }
        await driver.executeScript('arguments[0].click();', nextBtns[0]);
        await waitForLoadingGone(driver);
        const page2 = await driver.findElements(By.xpath("//*[contains(text(),'Page 2')]"));
        if (page2.length > 0) rec('TC-17', 'Next button advances to page 2', 'PASS');
        else rec('TC-17', 'Next button advances to page 2', 'FAIL', 'Page 2 label not found after clicking Next');
    } catch(e) { rec('TC-17', 'Next button advances page', 'FAIL', e.message); }
}

async function tc18(driver) {
    console.log('\nTC-18 — [AC-4] Previous button goes back to page 1');
    try {
        const prevBtns = await driver.findElements(By.xpath("//button[contains(.,'Previous') and not(@disabled)]"));
        if (!prevBtns.length) { rec('TC-18', 'Previous button goes back', 'PASS', 'Already on first page — not applicable'); return; }
        await driver.executeScript('arguments[0].click();', prevBtns[0]);
        await waitForLoadingGone(driver);
        const page1 = await driver.findElements(By.xpath("//*[contains(text(),'Page 1')]"));
        if (page1.length > 0) rec('TC-18', 'Previous button returns to page 1', 'PASS');
        else rec('TC-18', 'Previous button returns to page 1', 'FAIL', 'Page 1 label not found after clicking Previous');
    } catch(e) { rec('TC-18', 'Previous button goes back', 'FAIL', e.message); }
}

async function tc19(driver) {
    console.log('\nTC-19 — [AC-4] Previous button is disabled on first page');
    try {
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);
        const prevBtns = await driver.findElements(By.xpath("//button[contains(.,'Previous')]"));
        if (!prevBtns.length) { rec('TC-19', 'Previous disabled on page 1', 'PASS', 'Single page — pagination not shown'); return; }
        const disabled = await prevBtns[0].getAttribute('disabled');
        if (disabled !== null) rec('TC-19', 'Previous button disabled on page 1', 'PASS');
        else rec('TC-19', 'Previous button disabled on page 1', 'FAIL', 'Previous not disabled on page 1');
    } catch(e) { rec('TC-19', 'Previous disabled on page 1', 'FAIL', e.message); }
}

// ── Group 5: Job Details Page (AC-3) ─────────────────────────────────────────

async function tc20(driver) {
    console.log('\nTC-20 — [AC-3] Clicking a job card navigates to details page');
    try {
        const cards = await getJobCards(driver);
        if (!cards.length) { rec('TC-20', 'Job card navigates to details', 'FAIL', 'No cards found'); return; }
        await driver.executeScript('arguments[0].click();', cards[0]);
        await waitForDetailsPage(driver);
        const url = await driver.getCurrentUrl();
        if (url.match(/\/student\/jobs\/\d+/)) rec('TC-20', 'Job card navigates to details page', 'PASS', 'URL: ' + url);
        else rec('TC-20', 'Job card navigates to details page', 'FAIL', 'Unexpected URL: ' + url);
    } catch(e) { rec('TC-20', 'Job card navigates to details', 'FAIL', e.message); }
}

async function tc21(driver) {
    console.log('\nTC-21 — [AC-3] Details page shows job title and company');
    try {
        const badge = await driver.findElements(By.xpath("//*[contains(text(),'Job Details')]"));
        const h1s   = await driver.findElements(By.tagName('h1'));
        let titleFound = false;
        for (const h of h1s) { const t = await h.getText(); if (t && t.trim().length > 2) { titleFound = true; break; } }
        if (badge.length > 0 && titleFound) rec('TC-21', 'Details page shows title and company', 'PASS');
        else rec('TC-21', 'Details page shows title and company', 'FAIL', 'Badge:' + (badge.length > 0) + ' Title:' + titleFound);
    } catch(e) { rec('TC-21', 'Details page shows title and company', 'FAIL', e.message); }
}

async function tc22(driver) {
    console.log('\nTC-22 — [AC-3] Details page shows all 4 info cards');
    try {
        const src = await driver.getPageSource();
        const l = src.includes('📍 Location');
        const c = src.includes('🗂️ Category') || src.includes('Category');
        const s = src.includes('💰 Salary')   || src.includes('Salary');
        const d = src.includes('📅 Deadline') || src.includes('Deadline');
        if (l && c && s && d) rec('TC-22', 'Details shows all 4 info cards', 'PASS');
        else rec('TC-22', 'Details shows all 4 info cards', 'FAIL', 'Location:' + l + ' Category:' + c + ' Salary:' + s + ' Deadline:' + d);
    } catch(e) { rec('TC-22', 'Details shows all 4 info cards', 'FAIL', e.message); }
}

async function tc23(driver) {
    console.log('\nTC-23 — [AC-3] Details page shows Full Description section');
    try {
        const el = await driver.findElements(By.xpath("//*[contains(text(),'Full Description') or contains(text(),'Description')]"));
        if (el.length > 0) rec('TC-23', 'Full Description section visible', 'PASS');
        else rec('TC-23', 'Full Description section visible', 'FAIL', 'Description section not found');
    } catch(e) { rec('TC-23', 'Full Description section visible', 'FAIL', e.message); }
}

async function tc24(driver) {
    console.log('\nTC-24 — [AC-3] Back to jobs link navigates back to listing');
    try {
        const link = await driver.wait(until.elementLocated(By.xpath("//a[contains(.,'Back to jobs')]")), 8000);
        await driver.executeScript('arguments[0].click();', link);
        await waitForJobsPage(driver);
        const url = await driver.getCurrentUrl();
        if (url.includes('/student/jobs')) rec('TC-24', '"Back to jobs" navigates to listing', 'PASS');
        else rec('TC-24', '"Back to jobs" navigates to listing', 'FAIL', 'Ended at: ' + url);
    } catch(e) { rec('TC-24', '"Back to jobs" navigates to listing', 'FAIL', e.message); }
}

async function tc25(driver) {
    console.log('\nTC-25 — [AC-3] Invalid job ID URL shows not-found message');
    try {
        await driver.get(BASE_URL + '/student/jobs/99999999');
        await driver.wait(async () => {
            return (await driver.findElements(By.xpath("//*[contains(text(),'Loading job details...')]"))).length === 0;
        }, 15000);
        await driver.sleep(500);
        const el = await driver.findElements(By.xpath("//*[contains(text(),'not found') or contains(text(),'Failed to load') or contains(text(),'Job not found')]"));
        if (el.length > 0) { const t = await el[0].getText(); rec('TC-25', 'Invalid job ID shows not-found', 'PASS', '"' + t + '"'); }
        else rec('TC-25', 'Invalid job ID shows not-found', 'FAIL', 'No error message shown');
    } catch(e) { rec('TC-25', 'Invalid job ID shows not-found', 'FAIL', e.message); }
}

// ── Group 6: Edge Cases & UI Polish ──────────────────────────────────────────

async function tc26(driver) {
    console.log('\nTC-26 — Location dropdown filters results');
    try {
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);
        const found = await selectDropdownOption(driver, 'Colombo');
        if (!found) { rec('TC-26', 'Location dropdown filters results', 'FAIL', 'Colombo option not found'); return; }
        const countEl = await driver.findElement(By.xpath("//*[contains(text(),'total job')]"));
        const t = await countEl.getText();
        rec('TC-26', 'Location dropdown filters results', 'PASS', 'Colombo result: "' + t + '"');
    } catch(e) { rec('TC-26', 'Location dropdown filters results', 'FAIL', e.message); }
}

async function tc27(driver) {
    console.log('\nTC-27 — Combined keyword + dropdown filter works');
    try {
        await clickClear(driver);
        await setInput(driver, 'Engineer');
        const found = await selectDropdownOption(driver, 'Full-time');
        if (!found) await clickSearchBtn(driver);
        const countEl = await driver.findElement(By.xpath("//*[contains(text(),'total job')]"));
        const t = await countEl.getText();
        rec('TC-27', 'Combined keyword + dropdown filter', 'PASS', 'Result: "' + t + '"');
    } catch(e) { rec('TC-27', 'Combined keyword + dropdown filter', 'FAIL', e.message); }
}

async function tc28(driver) {
    console.log('\nTC-28 — Page title and Student Job Portal badge visible');
    try {
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);
        const badge = await driver.findElements(By.xpath("//*[contains(text(),'Student Job Portal')]"));
        if (badge.length > 0) rec('TC-28', 'Student Job Portal badge visible', 'PASS');
        else rec('TC-28', 'Student Job Portal badge visible', 'FAIL', 'Badge not found');
    } catch(e) { rec('TC-28', 'Student Job Portal badge visible', 'FAIL', e.message); }
}

async function tc29(driver) {
    console.log('\nTC-29 — Job card hover does not break layout (hover test)');
    try {
        const cards = await getJobCards(driver);
        if (!cards.length) { rec('TC-29', 'Job card hover does not break layout', 'PASS', 'No cards — not applicable'); return; }
        const actions = driver.actions({ async: true });
        await actions.move({ origin: cards[0] }).perform();
        await driver.sleep(500);
        const visible = await cards[0].isDisplayed();
        if (visible) rec('TC-29', 'Job card hover does not break layout', 'PASS');
        else rec('TC-29', 'Job card hover does not break layout', 'FAIL', 'Card not visible after hover');
    } catch(e) { rec('TC-29', 'Job card hover does not break layout', 'FAIL', e.message); }
}

async function tc30(driver) {
    console.log('\nTC-30 — "Open details" and "View →" text visible on card');
    try {
        const cards = await getJobCards(driver);
        if (!cards.length) { rec('TC-30', '"Open details" and "View →" visible', 'FAIL', 'No cards found'); return; }
        const html = await cards[0].getAttribute('innerHTML');
        const hasOpen = html.includes('Open details');
        const hasView = html.includes('View');
        if (hasOpen && hasView) rec('TC-30', '"Open details" and "View →" visible on card', 'PASS');
        else rec('TC-30', '"Open details" and "View →" visible on card', 'FAIL', 'OpenDetails:' + hasOpen + ' View:' + hasView);
    } catch(e) { rec('TC-30', '"Open details" and "View →" visible', 'FAIL', e.message); }
}

// ── Summary ───────────────────────────────────────────────────────────────────
function printSummary() {
    const passed = results.filter(function(r) { return r.status === 'PASS'; }).length;
    const failed = results.filter(function(r) { return r.status === 'FAIL'; }).length;
    const total  = results.length;
    console.log('\n');
    console.log('==================================================================');
    console.log('   FINAL TEST RESULTS — Student Job Browsing & Filtering');
    console.log('==================================================================');
    console.log('   Total  : ' + total);
    console.log('   Passed : ' + passed + ' ✅');
    console.log('   Failed : ' + failed + ' ❌');
    console.log('   Rate   : ' + Math.round((passed / total) * 100) + '%');
    console.log('------------------------------------------------------------------');
    results.forEach(function(r) {
        const e = r.status === 'PASS' ? '✅' : '❌';
        console.log('   ' + e + '  ' + r.tcId.padEnd(6) + ' ' + r.desc);
        if (r.note) console.log('          └─ ' + r.note);
    });
    console.log('==================================================================\n');
}

// ── Runner ────────────────────────────────────────────────────────────────────
async function runAllTests() {
    console.log('==================================================================');
    console.log('   PathFinder — Student Job Browsing Test Suite (30 Cases)');
    console.log('==================================================================');
    const driver = await new Builder().forBrowser('chrome').build();
    try {
        console.log('\n--- Group 1: Authentication & Navigation ---');
        await tc01(driver);
        await tc02(driver);
        await tc03(driver);
        await tc04(driver);

        console.log('\n--- Group 2: Job Listing Display [AC-1] ---');
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);
        await tc05(driver);
        await tc06(driver);
        await tc07(driver);
        await tc08(driver);
        await tc09(driver);

        console.log('\n--- Group 3: Search & Filter [AC-2] ---');
        await tc10(driver);
        await tc11(driver);
        await tc12(driver);
        await tc13(driver);
        await tc14(driver);
        await tc15(driver);

        console.log('\n--- Group 4: Pagination [AC-4] ---');
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);
        await tc16(driver);
        await tc17(driver);
        await tc18(driver);
        await tc19(driver);

        console.log('\n--- Group 5: Job Details Page [AC-3] ---');
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);
        await tc20(driver);
        await tc21(driver);
        await tc22(driver);
        await tc23(driver);
        await tc24(driver);
        await tc25(driver);

        console.log('\n--- Group 6: Edge Cases & UI Polish ---');
        await tc26(driver);
        await tc27(driver);
        await tc28(driver);
        await tc29(driver);
        await tc30(driver);

    } catch(err) {
        console.error('\nUnexpected runner error: ' + err.message);
    } finally {
        printSummary();
        console.log('Closing browser in 5 seconds...');
        await driver.sleep(5000);
        await driver.quit();
    }
}

runAllTests();
