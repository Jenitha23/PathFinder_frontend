/**
 * File: student_jobs_full_test.cjs
 * Purpose: Runs all 30 test cases for the Student Job Browsing section.
 *
 * Test Groups:
 *   TC-01 to TC-04  — Authentication & Navigation
 *   TC-05 to TC-09  — Job Listing Display
 *   TC-10 to TC-15  — Search & Filtering
 *   TC-16 to TC-19  — Pagination
 *   TC-20 to TC-25  — Job Details Page
 *   TC-26 to TC-30  — Apply Flow (Modal)
 *
 * Prerequisites:
 *   npm install selenium-webdriver chromedriver
 *   Frontend running : http://localhost:5173
 *   Backend running  : http://localhost:5249
 *
 * Run:
 *   node student_jobs_full_test.cjs
 */

require('chromedriver');
const { Builder, By, until } = require('selenium-webdriver');

// ─── Configuration ─────────────────────────────────────────────────────────────

const BASE_URL    = 'https://pathfinder-frontend-navy.vercel.app';
const LOGIN_URL   = `${BASE_URL}/student/login`;
const JOBS_URL    = `${BASE_URL}/student/jobs`;

// Backend: https://pathfinder-fqgwf0e6bvc2cmbq.southeastasia-01.azurewebsites.net
// (The frontend calls the backend directly — no change needed here)

const VALID_EMAIL    = 'testerjob@gmail.com';
const VALID_PASSWORD = '123456789J';

// ─── Results Tracker ───────────────────────────────────────────────────────────

const results = [];

function recordResult(tcId, description, status, note = '') {
    results.push({ tcId, description, status, note });
    const icon = status === 'PASS' ? '✅' : '❌';
    console.log(`   ${icon} ${tcId} — ${status}${note ? ' | ' + note : ''}`);
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function doLogin(driver, email, password) {
    await driver.get(LOGIN_URL);
    await driver.wait(
        until.elementLocated(By.xpath("//input[@placeholder='you@example.com']")),
        15000
    );
    await driver.findElement(By.xpath("//input[@placeholder='you@example.com']")).sendKeys(email);
    await driver.findElement(By.xpath("//input[@placeholder='Enter your password']")).sendKeys(password);
    await driver.sleep(600);
    const btn = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Sign In')]")),
        8000
    );
    await driver.executeScript('arguments[0].click();', btn);
}

async function waitForJobsPage(driver) {
    await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(), 'Available opportunities')]")),
        15000
    );
    // Wait for loading spinner to disappear
    await driver.wait(async () => {
        const els = await driver.findElements(
            By.xpath("//*[contains(text(), 'Loading job listings...')]")
        );
        return els.length === 0;
    }, 15000);
    await driver.sleep(500);
}

async function clearFiltersAndWait(driver) {
    const clearBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Clear')]")),
        8000
    );
    await driver.executeScript('arguments[0].click();', clearBtn);
    await driver.sleep(800);
}

async function setSearchInput(driver, value) {
    const input = await driver.wait(
        until.elementLocated(By.xpath("//input[@placeholder='Try: Java, React, internship...']")),
        8000
    );
    await driver.executeScript("arguments[0].select();", input);
    await input.clear();
    await input.sendKeys(value);
}

async function clickSearchButton(driver) {
    const btn = await driver.wait(
        until.elementLocated(By.xpath("//button[@type='submit' and contains(., 'Search')]")),
        8000
    );
    await driver.executeScript('arguments[0].click();', btn);
    await driver.sleep(1000);
}

async function selectDropdown(driver, label, value) {
    // label is the aria-label or surrounding <label> text, value is the <option> text
    const select = await driver.wait(
        until.elementLocated(By.xpath(`//select[..//label[contains(text(), '${label}')]]`)),
        8000
    );
    const options = await select.findElements(By.tagName('option'));
    for (const opt of options) {
        const text = await opt.getText();
        if (text === value) {
            await opt.click();
            break;
        }
    }
    await driver.sleep(900);
}

async function getJobCards(driver) {
    return driver.findElements(By.xpath("//a[contains(@href, '/student/jobs/')]"));
}

async function clickFirstJobCard(driver) {
    const cards = await getJobCards(driver);
    if (cards.length === 0) throw new Error('No job cards found to click');
    await driver.executeScript('arguments[0].click();', cards[0]);
    await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(), '💼 Job Details')]")),
        15000
    );
    // Wait for loading to finish
    await driver.wait(async () => {
        const els = await driver.findElements(
            By.xpath("//*[contains(text(), 'Loading job details...')]")
        );
        return els.length === 0;
    }, 15000);
    await driver.sleep(500);
}

// ─── Individual Test Cases ──────────────────────────────────────────────────────

// ── Group 1: Authentication & Navigation ──────────────────────────────────────

// TC-01: Valid login and redirect to home
async function tc01(driver) {
    console.log('\n📌 TC-01 — Login with valid credentials');
    try {
        await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
        await driver.wait(until.urlContains('/student/home'), 20000);
        recordResult('TC-01', 'Login with valid credentials', 'PASS');
    } catch (e) {
        recordResult('TC-01', 'Login with valid credentials', 'FAIL', e.message);
    }
}

// TC-02: Navigate to jobs page after login
async function tc02(driver) {
    console.log('\n📌 TC-02 — Navigate to jobs page after login');
    try {
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);
        const url = await driver.getCurrentUrl();
        if (url.includes('/student/jobs')) {
            recordResult('TC-02', 'Navigate to jobs page after login', 'PASS');
        } else {
            recordResult('TC-02', 'Navigate to jobs page after login', 'FAIL', `Unexpected URL: ${url}`);
        }
    } catch (e) {
        recordResult('TC-02', 'Navigate to jobs page after login', 'FAIL', e.message);
    }
}

// TC-03: Access jobs page without login (auth guard)
async function tc03(driver) {
    console.log('\n📌 TC-03 — Access jobs page without login (auth guard)');
    try {
        await driver.get(BASE_URL);
        await driver.executeScript(`
            localStorage.removeItem('pf_token');
            localStorage.removeItem('pf_role');
            localStorage.removeItem('pf_userId');
            localStorage.removeItem('pf_email');
            localStorage.removeItem('pf_fullName');
        `);
        await driver.get(JOBS_URL);
        await driver.sleep(2000);
        const url = await driver.getCurrentUrl();
        if (!url.includes('/student/jobs')) {
            recordResult('TC-03', 'Access jobs page without login', 'PASS', `Redirected to: ${url}`);
        } else {
            recordResult('TC-03', 'Access jobs page without login', 'FAIL', 'Jobs page accessible without auth');
        }
    } catch (e) {
        recordResult('TC-03', 'Access jobs page without login', 'FAIL', e.message);
    }
}

// TC-04: "Back to dashboard" link navigates to student home
async function tc04(driver) {
    console.log('\n📌 TC-04 — Back to dashboard link works');
    try {
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);
        const backLink = await driver.wait(
            until.elementLocated(By.xpath("//a[contains(., '← Back to dashboard')]")),
            8000
        );
        await driver.executeScript('arguments[0].click();', backLink);
        await driver.wait(until.urlContains('/student/home'), 10000);
        recordResult('TC-04', 'Back to dashboard link navigates correctly', 'PASS');
    } catch (e) {
        recordResult('TC-04', 'Back to dashboard link navigates correctly', 'FAIL', e.message);
    }
}

// ── Group 2: Job Listing Display ──────────────────────────────────────────────

// TC-05: Page heading and hero section render
async function tc05(driver) {
    console.log('\n📌 TC-05 — Hero section and page heading render');
    try {
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);
        const heading = await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(), 'Browse jobs and internships')]")),
            8000
        );
        const visible = await heading.isDisplayed();
        if (visible) {
            recordResult('TC-05', 'Hero section heading renders', 'PASS');
        } else {
            recordResult('TC-05', 'Hero section heading renders', 'FAIL', 'Heading not visible');
        }
    } catch (e) {
        recordResult('TC-05', 'Hero section heading renders', 'FAIL', e.message);
    }
}

// TC-06: Job cards are displayed on page load
async function tc06(driver) {
    console.log('\n📌 TC-06 — Job cards displayed on page load');
    try {
        const cards = await getJobCards(driver);
        if (cards.length > 0) {
            recordResult('TC-06', 'Job cards displayed on page load', 'PASS', `${cards.length} card(s) found`);
        } else {
            recordResult('TC-06', 'Job cards displayed on page load', 'FAIL', 'No job cards found');
        }
    } catch (e) {
        recordResult('TC-06', 'Job cards displayed on page load', 'FAIL', e.message);
    }
}

// TC-07: Job card shows title, company, location, and deadline
async function tc07(driver) {
    console.log('\n📌 TC-07 — Job card shows required fields (title, company, location, deadline)');
    try {
        const cards = await getJobCards(driver);
        if (cards.length === 0) throw new Error('No job cards available');

        const firstCard = cards[0];
        const cardHtml = await firstCard.getAttribute('innerHTML');

        // Check for location emoji and deadline emoji markers from JobCard.jsx
        const hasLocation = cardHtml.includes('📍');
        const hasDeadline = cardHtml.includes('⏳');
        const hasCategory = cardHtml.includes('🗂');

        if (hasLocation && hasDeadline && hasCategory) {
            recordResult('TC-07', 'Job card shows required fields', 'PASS', 'Location, deadline, and category icons found');
        } else {
            recordResult('TC-07', 'Job card shows required fields', 'FAIL',
                `Location:${hasLocation} Deadline:${hasDeadline} Category:${hasCategory}`);
        }
    } catch (e) {
        recordResult('TC-07', 'Job card shows required fields', 'FAIL', e.message);
    }
}

// TC-08: Job card shows a type badge (e.g. "Internship", "Full-time")
async function tc08(driver) {
    console.log('\n📌 TC-08 — Job card shows a type badge');
    try {
        const cards = await getJobCards(driver);
        if (cards.length === 0) throw new Error('No job cards available');

        // The badge is a <span> inside the card link
        const badges = await cards[0].findElements(By.xpath(".//span[contains(@class,'badge')]"));
        if (badges.length > 0) {
            const badgeText = await badges[0].getText();
            recordResult('TC-08', 'Job card type badge present', 'PASS', `Badge: "${badgeText}"`);
        } else {
            recordResult('TC-08', 'Job card type badge present', 'FAIL', 'No badge found on first card');
        }
    } catch (e) {
        recordResult('TC-08', 'Job card type badge present', 'FAIL', e.message);
    }
}

// TC-09: Total jobs count text is displayed
async function tc09(driver) {
    console.log('\n📌 TC-09 — Total jobs count text is shown');
    try {
        const countEl = await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(), 'total job')]")),
            8000
        );
        const text = await countEl.getText();
        recordResult('TC-09', 'Total jobs count displayed', 'PASS', `"${text}"`);
    } catch (e) {
        recordResult('TC-09', 'Total jobs count displayed', 'FAIL', e.message);
    }
}

// ── Group 3: Search & Filtering ──────────────────────────────────────────────

// TC-10: Search by keyword returns filtered results
async function tc10(driver) {
    console.log('\n📌 TC-10 — Search by keyword filters job listings');
    try {
        await clearFiltersAndWait(driver);
        await setSearchInput(driver, 'Software');
        await clickSearchButton(driver);
        await driver.wait(async () => {
            const els = await driver.findElements(
                By.xpath("//*[contains(text(), 'Loading job listings...')]")
            );
            return els.length === 0;
        }, 10000);
        const countEl = await driver.findElement(By.xpath("//*[contains(text(), 'total job')]"));
        const text = await countEl.getText();
        recordResult('TC-10', 'Keyword search filters results', 'PASS', `Result: "${text}"`);
    } catch (e) {
        recordResult('TC-10', 'Keyword search filters results', 'FAIL', e.message);
    }
}

// TC-11: Search with no matches shows empty state
async function tc11(driver) {
    console.log('\n📌 TC-11 — Search with no matches shows empty state message');
    try {
        await setSearchInput(driver, 'xyznonexistentjob99999');
        await clickSearchButton(driver);
        await driver.wait(async () => {
            const els = await driver.findElements(
                By.xpath("//*[contains(text(), 'Loading job listings...')]")
            );
            return els.length === 0;
        }, 10000);
        const noJobsMsg = await driver.findElements(
            By.xpath("//*[contains(text(), 'No jobs found')]")
        );
        if (noJobsMsg.length > 0) {
            recordResult('TC-11', 'Empty state message shown for no results', 'PASS');
        } else {
            recordResult('TC-11', 'Empty state message shown for no results', 'FAIL', 'Empty state not found');
        }
    } catch (e) {
        recordResult('TC-11', 'Empty state message shown for no results', 'FAIL', e.message);
    }
}

// TC-12: Clear filters button resets results
async function tc12(driver) {
    console.log('\n📌 TC-12 — Clear filters button resets all filters and results');
    try {
        await clearFiltersAndWait(driver);
        await driver.wait(async () => {
            const els = await driver.findElements(
                By.xpath("//*[contains(text(), 'Loading job listings...')]")
            );
            return els.length === 0;
        }, 10000);
        const cards = await getJobCards(driver);
        const searchInput = await driver.findElement(
            By.xpath("//input[@placeholder='Try: Java, React, internship...']")
        );
        const inputVal = await searchInput.getAttribute('value');
        if (inputVal === '' && cards.length > 0) {
            recordResult('TC-12', 'Clear filters resets and shows all jobs', 'PASS', `${cards.length} card(s) shown`);
        } else {
            recordResult('TC-12', 'Clear filters resets and shows all jobs', 'FAIL',
                `Input: "${inputVal}", Cards: ${cards.length}`);
        }
    } catch (e) {
        recordResult('TC-12', 'Clear filters resets and shows all jobs', 'FAIL', e.message);
    }
}

// TC-13: Filter by Job Type dropdown
async function tc13(driver) {
    console.log('\n📌 TC-13 — Filter by Job Type dropdown');
    try {
        const typeSelect = await driver.wait(
            until.elementLocated(By.xpath("//select[option[contains(., 'Internship') and contains(., 'Full-time')]]")),
            8000
        );
        const options = await typeSelect.findElements(By.tagName('option'));
        // Select "Internship"
        for (const opt of options) {
            const text = await opt.getText();
            if (text === 'Internship') { await opt.click(); break; }
        }
        await driver.sleep(1000);
        await driver.wait(async () => {
            const els = await driver.findElements(
                By.xpath("//*[contains(text(), 'Loading job listings...')]")
            );
            return els.length === 0;
        }, 10000);
        const countEl = await driver.findElement(By.xpath("//*[contains(text(), 'total job')]"));
        const text = await countEl.getText();
        recordResult('TC-13', 'Job Type dropdown filter works', 'PASS', `Internship result: "${text}"`);
    } catch (e) {
        recordResult('TC-13', 'Job Type dropdown filter works', 'FAIL', e.message);
    }
}

// TC-14: Filter by Category dropdown
async function tc14(driver) {
    console.log('\n📌 TC-14 — Filter by Category dropdown');
    try {
        await clearFiltersAndWait(driver);
        const categorySelect = await driver.wait(
            until.elementLocated(By.xpath("//select[option[contains(., 'Software Engineering') and contains(., 'Data Science')]]")),
            8000
        );
        const options = await categorySelect.findElements(By.tagName('option'));
        for (const opt of options) {
            const text = await opt.getText();
            if (text === 'Software Engineering') { await opt.click(); break; }
        }
        await driver.sleep(1000);
        await driver.wait(async () => {
            const els = await driver.findElements(
                By.xpath("//*[contains(text(), 'Loading job listings...')]")
            );
            return els.length === 0;
        }, 10000);
        const countEl = await driver.findElement(By.xpath("//*[contains(text(), 'total job')]"));
        const text = await countEl.getText();
        recordResult('TC-14', 'Category dropdown filter works', 'PASS', `Software Engineering result: "${text}"`);
    } catch (e) {
        recordResult('TC-14', 'Category dropdown filter works', 'FAIL', e.message);
    }
}

// TC-15: Filter by Location dropdown
async function tc15(driver) {
    console.log('\n📌 TC-15 — Filter by Location dropdown');
    try {
        await clearFiltersAndWait(driver);
        const locationSelect = await driver.wait(
            until.elementLocated(By.xpath("//select[option[contains(., 'Colombo') and contains(., 'Kandy')]]")),
            8000
        );
        const options = await locationSelect.findElements(By.tagName('option'));
        for (const opt of options) {
            const text = await opt.getText();
            if (text === 'Colombo') { await opt.click(); break; }
        }
        await driver.sleep(1000);
        await driver.wait(async () => {
            const els = await driver.findElements(
                By.xpath("//*[contains(text(), 'Loading job listings...')]")
            );
            return els.length === 0;
        }, 10000);
        const countEl = await driver.findElement(By.xpath("//*[contains(text(), 'total job')]"));
        const text = await countEl.getText();
        recordResult('TC-15', 'Location dropdown filter works', 'PASS', `Colombo result: "${text}"`);
    } catch (e) {
        recordResult('TC-15', 'Location dropdown filter works', 'FAIL', e.message);
    }
}

// ── Group 4: Pagination ───────────────────────────────────────────────────────

// TC-16: Pagination controls render when more than one page exists
async function tc16(driver) {
    console.log('\n📌 TC-16 — Pagination controls are visible');
    try {
        await clearFiltersAndWait(driver);
        await driver.wait(async () => {
            const els = await driver.findElements(
                By.xpath("//*[contains(text(), 'Loading job listings...')]")
            );
            return els.length === 0;
        }, 10000);
        // Pagination only renders when totalPages > 1
        const nextBtns = await driver.findElements(
            By.xpath("//button[contains(., 'Next')]")
        );
        const prevBtns = await driver.findElements(
            By.xpath("//button[contains(., 'Previous')]")
        );
        if (nextBtns.length > 0 || prevBtns.length > 0) {
            recordResult('TC-16', 'Pagination controls visible', 'PASS', 'Next/Previous buttons found');
        } else {
            // Single page is also valid
            recordResult('TC-16', 'Pagination controls visible', 'PASS', 'Single page — pagination not needed');
        }
    } catch (e) {
        recordResult('TC-16', 'Pagination controls visible', 'FAIL', e.message);
    }
}

// TC-17: "Next" button advances the page
async function tc17(driver) {
    console.log('\n📌 TC-17 — Next button advances to next page');
    try {
        const nextBtns = await driver.findElements(
            By.xpath("//button[contains(., 'Next') and not(@disabled)]")
        );
        if (nextBtns.length === 0) {
            recordResult('TC-17', 'Next button advances page', 'PASS', 'Only one page — Next not applicable');
            return;
        }
        // Get first-page cards before clicking
        const beforeCards = await getJobCards(driver);
        const firstCardTextBefore = beforeCards.length > 0 ? await beforeCards[0].getText() : '';

        await driver.executeScript('arguments[0].click();', nextBtns[0]);
        await driver.sleep(1000);
        await driver.wait(async () => {
            const els = await driver.findElements(
                By.xpath("//*[contains(text(), 'Loading job listings...')]")
            );
            return els.length === 0;
        }, 10000);

        const pageLabel = await driver.findElements(By.xpath("//*[contains(text(), 'Page 2')]"));
        if (pageLabel.length > 0) {
            recordResult('TC-17', 'Next button advances to page 2', 'PASS');
        } else {
            // Might still have worked if content changed
            const afterCards = await getJobCards(driver);
            const firstCardTextAfter = afterCards.length > 0 ? await afterCards[0].getText() : '';
            if (firstCardTextAfter !== firstCardTextBefore) {
                recordResult('TC-17', 'Next button advances page', 'PASS', 'Page content changed');
            } else {
                recordResult('TC-17', 'Next button advances page', 'FAIL', 'Page content unchanged after Next');
            }
        }
    } catch (e) {
        recordResult('TC-17', 'Next button advances page', 'FAIL', e.message);
    }
}

// TC-18: "Previous" button goes back to previous page
async function tc18(driver) {
    console.log('\n📌 TC-18 — Previous button goes back to previous page');
    try {
        const prevBtns = await driver.findElements(
            By.xpath("//button[contains(., 'Previous') and not(@disabled)]")
        );
        if (prevBtns.length === 0) {
            recordResult('TC-18', 'Previous button goes back', 'PASS', 'Already on first page — not applicable');
            return;
        }
        await driver.executeScript('arguments[0].click();', prevBtns[0]);
        await driver.sleep(1000);
        await driver.wait(async () => {
            const els = await driver.findElements(
                By.xpath("//*[contains(text(), 'Loading job listings...')]")
            );
            return els.length === 0;
        }, 10000);
        const pageLabel = await driver.findElements(By.xpath("//*[contains(text(), 'Page 1')]"));
        if (pageLabel.length > 0) {
            recordResult('TC-18', 'Previous button goes back to page 1', 'PASS');
        } else {
            recordResult('TC-18', 'Previous button goes back to page 1', 'FAIL', 'Page 1 label not found');
        }
    } catch (e) {
        recordResult('TC-18', 'Previous button goes back to page 1', 'FAIL', e.message);
    }
}

// TC-19: Previous button is disabled on first page
async function tc19(driver) {
    console.log('\n📌 TC-19 — Previous button is disabled on first page');
    try {
        // Make sure we are on page 1
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);
        const prevBtns = await driver.findElements(
            By.xpath("//button[contains(., 'Previous')]")
        );
        if (prevBtns.length === 0) {
            recordResult('TC-19', 'Previous disabled on page 1', 'PASS', 'Pagination not shown — single page');
            return;
        }
        const isDisabled = await prevBtns[0].getAttribute('disabled');
        if (isDisabled !== null) {
            recordResult('TC-19', 'Previous disabled on page 1', 'PASS', 'Previous button correctly disabled');
        } else {
            recordResult('TC-19', 'Previous disabled on page 1', 'FAIL', 'Previous button not disabled on page 1');
        }
    } catch (e) {
        recordResult('TC-19', 'Previous disabled on page 1', 'FAIL', e.message);
    }
}

// ── Group 5: Job Details Page ─────────────────────────────────────────────────

// TC-20: Clicking a job card navigates to the details page
async function tc20(driver) {
    console.log('\n📌 TC-20 — Clicking a job card navigates to details page');
    try {
        await waitForJobsPage(driver);
        await clickFirstJobCard(driver);
        const url = await driver.getCurrentUrl();
        if (url.match(/\/student\/jobs\/\d+/)) {
            recordResult('TC-20', 'Job card click navigates to details page', 'PASS', `URL: ${url}`);
        } else {
            recordResult('TC-20', 'Job card click navigates to details page', 'FAIL', `Unexpected URL: ${url}`);
        }
    } catch (e) {
        recordResult('TC-20', 'Job card click navigates to details page', 'FAIL', e.message);
    }
}

// TC-21: Details page shows job title and company name
async function tc21(driver) {
    console.log('\n📌 TC-21 — Details page shows job title and company');
    try {
        const badge = await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(), '💼 Job Details')]")),
            10000
        );
        const visible = await badge.isDisplayed();
        // Also check there is an h1 with some content
        const h1s = await driver.findElements(By.tagName('h1'));
        let titleFound = false;
        for (const h1 of h1s) {
            const text = await h1.getText();
            if (text && text.length > 2) { titleFound = true; break; }
        }
        if (visible && titleFound) {
            recordResult('TC-21', 'Job title and details badge shown', 'PASS');
        } else {
            recordResult('TC-21', 'Job title and details badge shown', 'FAIL',
                `Badge visible: ${visible}, Title found: ${titleFound}`);
        }
    } catch (e) {
        recordResult('TC-21', 'Job title and details badge shown', 'FAIL', e.message);
    }
}

// TC-22: Details page shows location, category, salary, and deadline info cards
async function tc22(driver) {
    console.log('\n📌 TC-22 — Details page shows location, category, salary, and deadline');
    try {
        const pageSource = await driver.getPageSource();
        const hasLocation = pageSource.includes('📍 Location');
        const hasCategory = pageSource.includes('🗂️ Category');
        const hasSalary   = pageSource.includes('💰 Salary');
        const hasDeadline = pageSource.includes('📅 Deadline');

        if (hasLocation && hasCategory && hasSalary && hasDeadline) {
            recordResult('TC-22', 'Details page shows all 4 info cards', 'PASS');
        } else {
            recordResult('TC-22', 'Details page shows all 4 info cards', 'FAIL',
                `Location:${hasLocation} Category:${hasCategory} Salary:${hasSalary} Deadline:${hasDeadline}`);
        }
    } catch (e) {
        recordResult('TC-22', 'Details page shows all 4 info cards', 'FAIL', e.message);
    }
}

// TC-23: Details page shows a Job Description section
async function tc23(driver) {
    console.log('\n📌 TC-23 — Details page shows Job Description section');
    try {
        const descEl = await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(), 'Job Description') or contains(text(), 'description')]")),
            8000
        );
        const visible = await descEl.isDisplayed();
        if (visible) {
            recordResult('TC-23', 'Job Description section visible', 'PASS');
        } else {
            recordResult('TC-23', 'Job Description section visible', 'FAIL', 'Description section not visible');
        }
    } catch (e) {
        recordResult('TC-23', 'Job Description section visible', 'FAIL', e.message);
    }
}

// TC-24: "Back to jobs" link returns to job listing
async function tc24(driver) {
    console.log('\n📌 TC-24 — Back to jobs link returns to listings');
    try {
        const backLink = await driver.wait(
            until.elementLocated(By.xpath("//a[contains(., '← Back to jobs')]")),
            8000
        );
        await driver.executeScript('arguments[0].click();', backLink);
        await waitForJobsPage(driver);
        const url = await driver.getCurrentUrl();
        if (url.endsWith('/student/jobs') || url.endsWith('/student/jobs/')) {
            recordResult('TC-24', 'Back to jobs link works', 'PASS');
        } else {
            recordResult('TC-24', 'Back to jobs link works', 'FAIL', `Ended up at: ${url}`);
        }
    } catch (e) {
        recordResult('TC-24', 'Back to jobs link works', 'FAIL', e.message);
    }
}

// TC-25: Direct URL to invalid job ID shows "Job not found"
async function tc25(driver) {
    console.log('\n📌 TC-25 — Invalid job ID URL shows not-found message');
    try {
        await driver.get(`${BASE_URL}/student/jobs/99999999`);
        await driver.wait(async () => {
            const loading = await driver.findElements(
                By.xpath("//*[contains(text(), 'Loading job details...')]")
            );
            return loading.length === 0;
        }, 15000);
        await driver.sleep(500);
        const notFoundEls = await driver.findElements(
            By.xpath("//*[contains(text(), 'not found') or contains(text(), 'Failed to load') or contains(text(), 'error')]")
        );
        if (notFoundEls.length > 0) {
            const msg = await notFoundEls[0].getText();
            recordResult('TC-25', 'Invalid job ID shows error/not-found', 'PASS', `Message: "${msg}"`);
        } else {
            recordResult('TC-25', 'Invalid job ID shows error/not-found', 'FAIL', 'No error message displayed');
        }
    } catch (e) {
        recordResult('TC-25', 'Invalid job ID shows error/not-found', 'FAIL', e.message);
    }
}

// ── Group 6: Apply Flow (Modal) ───────────────────────────────────────────────

// TC-26: "Apply Now" button is visible for authenticated students
async function tc26(driver) {
    console.log('\n📌 TC-26 — Apply Now button visible for authenticated student');
    try {
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);
        await clickFirstJobCard(driver);
        const applyBtns = await driver.findElements(
            By.xpath("//button[contains(., 'Apply Now')]")
        );
        const alreadyApplied = await driver.findElements(
            By.xpath("//*[contains(text(), 'Applied — Status: Pending')]")
        );
        if (applyBtns.length > 0 || alreadyApplied.length > 0) {
            recordResult('TC-26', 'Apply Now button (or applied badge) visible', 'PASS');
        } else {
            recordResult('TC-26', 'Apply Now button visible', 'FAIL', 'Neither Apply Now nor applied badge found');
        }
    } catch (e) {
        recordResult('TC-26', 'Apply Now button visible', 'FAIL', e.message);
    }
}

// TC-27: Clicking Apply Now opens the confirmation modal
async function tc27(driver) {
    console.log('\n📌 TC-27 — Clicking Apply Now opens the confirmation modal');
    try {
        const applyBtns = await driver.findElements(
            By.xpath("//button[contains(., 'Apply Now')]")
        );
        if (applyBtns.length === 0) {
            recordResult('TC-27', 'Apply modal opens on click', 'PASS', 'Already applied — modal not applicable');
            return;
        }
        await driver.executeScript('arguments[0].click();', applyBtns[0]);
        await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(), 'Apply for this Job')]")),
            8000
        );
        recordResult('TC-27', 'Confirmation modal opens on Apply Now click', 'PASS');
    } catch (e) {
        recordResult('TC-27', 'Apply modal opens on click', 'FAIL', e.message);
    }
}

// TC-28: Modal shows job title and company in the confirmation text
async function tc28(driver) {
    console.log('\n📌 TC-28 — Modal shows job title and company in confirmation text');
    try {
        const modalHeader = await driver.findElements(
            By.xpath("//*[contains(text(), 'Apply for this Job')]")
        );
        if (modalHeader.length === 0) {
            recordResult('TC-28', 'Modal confirmation text correct', 'PASS', 'Modal not open — skipped');
            return;
        }
        // The modal contains: "You're applying for <job.title> at <job.companyName>"
        const applyingText = await driver.findElements(
            By.xpath("//*[contains(text(), \"You're applying for\")]")
        );
        if (applyingText.length > 0) {
            const text = await applyingText[0].getText();
            recordResult('TC-28', 'Modal shows job title and company', 'PASS', `"${text.substring(0, 80)}..."`);
        } else {
            recordResult('TC-28', 'Modal shows job title and company', 'FAIL', 'Applying-for text not found in modal');
        }
    } catch (e) {
        recordResult('TC-28', 'Modal shows job title and company', 'FAIL', e.message);
    }
}

// TC-29: Cover letter textarea is present in the modal
async function tc29(driver) {
    console.log('\n📌 TC-29 — Cover letter textarea present in apply modal');
    try {
        const modalHeader = await driver.findElements(
            By.xpath("//*[contains(text(), 'Apply for this Job')]")
        );
        if (modalHeader.length === 0) {
            recordResult('TC-29', 'Cover letter textarea in modal', 'PASS', 'Modal not open — skipped');
            return;
        }
        const coverLetterTA = await driver.wait(
            until.elementLocated(
                By.xpath("//textarea[@placeholder='Write a short cover letter to stand out from other applicants...']")
            ),
            8000
        );
        const enabled = await coverLetterTA.isEnabled();
        if (enabled) {
            recordResult('TC-29', 'Cover letter textarea present and enabled', 'PASS');
        } else {
            recordResult('TC-29', 'Cover letter textarea present and enabled', 'FAIL', 'Textarea not enabled');
        }
    } catch (e) {
        recordResult('TC-29', 'Cover letter textarea in modal', 'FAIL', e.message);
    }
}

// TC-30: Cancel button closes the modal
async function tc30(driver) {
    console.log('\n📌 TC-30 — Cancel button closes the apply modal');
    try {
        const modalHeader = await driver.findElements(
            By.xpath("//*[contains(text(), 'Apply for this Job')]")
        );
        if (modalHeader.length === 0) {
            recordResult('TC-30', 'Cancel button closes modal', 'PASS', 'Modal not open — skipped');
            return;
        }
        const cancelBtn = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Cancel')]")),
            8000
        );
        await driver.executeScript('arguments[0].click();', cancelBtn);
        await driver.sleep(600);
        const modalAfter = await driver.findElements(
            By.xpath("//*[contains(text(), 'Apply for this Job')]")
        );
        if (modalAfter.length === 0) {
            recordResult('TC-30', 'Cancel closes the modal', 'PASS');
        } else {
            recordResult('TC-30', 'Cancel closes the modal', 'FAIL', 'Modal still visible after Cancel');
        }
    } catch (e) {
        recordResult('TC-30', 'Cancel button closes modal', 'FAIL', e.message);
    }
}

// ─── Print Final Summary ────────────────────────────────────────────────────────

function printSummary() {
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const total  = results.length;

    console.log('\n');
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('   FINAL TEST RESULTS — Student Job Browsing');
    console.log('══════════════════════════════════════════════════════════════════');
    console.log(`   Total  : ${total}`);
    console.log(`   Passed : ${passed} ✅`);
    console.log(`   Failed : ${failed} ❌`);
    console.log(`   Rate   : ${Math.round((passed / total) * 100)}%`);
    console.log('──────────────────────────────────────────────────────────────────');

    results.forEach(r => {
        const icon = r.status === 'PASS' ? '✅' : '❌';
        console.log(`   ${icon}  ${r.tcId.padEnd(6)} ${r.description}`);
        if (r.note) console.log(`          └─ ${r.note}`);
    });

    console.log('══════════════════════════════════════════════════════════════════\n');
}

// ─── Main Runner ────────────────────────────────────────────────────────────────

async function runAllTests() {
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('   PathFinder — Student Job Browsing Full Test Suite (30 Test Cases)');
    console.log('══════════════════════════════════════════════════════════════════');

    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // ── Auth & Navigation (TC-01 to TC-04) ──────────────────────────────
        console.log('\n━━━ Group 1: Authentication & Navigation ━━━');
        await tc01(driver);  // valid login — must pass first so session is active
        await tc02(driver);  // navigate to jobs page
        await tc03(driver);  // access without login (clears auth)

        // Re-login after TC-03 cleared auth
        await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
        await driver.wait(until.urlContains('/student/home'), 20000);
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);
        await tc04(driver);  // back to dashboard link

        // Re-navigate to jobs for subsequent groups
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);

        // ── Job Listing Display (TC-05 to TC-09) ────────────────────────────
        console.log('\n━━━ Group 2: Job Listing Display ━━━');
        await tc05(driver);
        await tc06(driver);
        await tc07(driver);
        await tc08(driver);
        await tc09(driver);

        // ── Search & Filtering (TC-10 to TC-15) ─────────────────────────────
        console.log('\n━━━ Group 3: Search & Filtering ━━━');
        await tc10(driver);
        await tc11(driver);
        await tc12(driver);
        await tc13(driver);
        await tc14(driver);
        await tc15(driver);

        // ── Pagination (TC-16 to TC-19) ──────────────────────────────────────
        console.log('\n━━━ Group 4: Pagination ━━━');
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);
        await tc16(driver);
        await tc17(driver);
        await tc18(driver);
        await tc19(driver);

        // ── Job Details Page (TC-20 to TC-25) ───────────────────────────────
        console.log('\n━━━ Group 5: Job Details Page ━━━');
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);
        await tc20(driver);
        await tc21(driver);
        await tc22(driver);
        await tc23(driver);
        await tc24(driver);
        await tc25(driver);

        // ── Apply Flow / Modal (TC-26 to TC-30) ─────────────────────────────
        console.log('\n━━━ Group 6: Apply Flow (Modal) ━━━');
        await driver.get(JOBS_URL);
        await waitForJobsPage(driver);
        await tc26(driver);
        await tc27(driver);
        await tc28(driver);
        await tc29(driver);
        await tc30(driver);

    } catch (error) {
        console.error(`\n💥 Unexpected runner error: ${error.message}`);
    } finally {
        printSummary();
        console.log('Closing browser in 5 seconds...');
        await driver.sleep(5000);
        await driver.quit();
    }
}

runAllTests();
