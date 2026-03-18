/**
 * File: student_application_status_test.cjs
 * Purpose: Tests for Student Application Status Tracking user story
 *
 * User Story:
 *   As a student, I want to view the status of my applications so that I know
 *   if I'm accepted, shortlisted, or rejected.
 *
 * Acceptance Criteria:
 *   AC-1: "My Applications" page displays all jobs the student has applied for
 *   AC-2: Each application shows a clear status badge: Pending, Shortlisted, Rejected, or Accepted
 *   AC-3: Students can sort applications by "Date Applied" (latest first)
 *   AC-4: Students can filter applications by status
 *   AC-5: Empty state shows when no applications exist
 *
 * Test Groups:
 *   TC-01 to TC-03  — Authentication & Navigation
 *   TC-04 to TC-08  — Applications Page Display (AC-1)
 *   TC-09 to TC-14  — Status Badge Verification (AC-2)
 *   TC-15 to TC-18  — Sorting Functionality (AC-3)
 *   TC-19 to TC-22  — Filtering by Status (AC-4)
 *   TC-23 to TC-25  — Empty State (AC-5)
 *
 * Account:
 *   Email    : it23596566@my.sliit.lk
 *   Password : 123456789J
 *
 * Prerequisites:
 *   npm install selenium-webdriver chromedriver@133
 *   Frontend: https://pathfinder-frontend-navy.vercel.app
 *
 * Run:
 *   node student_application_status_test.cjs
 */

require('chromedriver');
const { Builder, By, until } = require('selenium-webdriver');

// ── Configuration ─────────────────────────────────────────────────────────────
const BASE_URL    = 'https://pathfinder-frontend-navy.vercel.app';
const LOGIN_URL   = BASE_URL + '/student/login';
const APPS_URL    = BASE_URL + '/student/applications';
const JOBS_URL    = BASE_URL + '/student/jobs';

const VALID_EMAIL    = 'testerjob@gmail.com';
const VALID_PASSWORD = '123456789J';
const LS_KEY         = 'pf_applied_jobs';

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
    await ef.clear(); 
    await ef.sendKeys(email);
    const pf = await driver.findElement(By.xpath("//input[@placeholder='Enter your password']"));
    await pf.clear(); 
    await pf.sendKeys(pw);
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

async function clearLS(driver) {
    await driver.executeScript("localStorage.removeItem('" + LS_KEY + "');");
}

async function waitForApplicationsPage(driver) {
    await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'My Job Applications')]")), 
        20000
    );
    await driver.wait(async () => {
        const els = await driver.findElements(
            By.xpath("//*[contains(text(),'Loading')]")
        );
        return els.length === 0;
    }, 20000);
    await driver.sleep(700);
}

// Helper to seed test data with multiple statuses
async function seedApplicationsWithStatuses(driver) {
    // This creates mock data in localStorage for testing all status types
    const now = new Date();
    const mockApplications = [
        {
            jobId: 101,
            title: 'Frontend Developer',
            companyName: 'Tech Solutions Ltd',
            location: 'Colombo',
            type: 'Full-time',
            applicationId: 1001,
            appliedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            status: 'Pending'
        },
        {
            jobId: 102,
            title: 'Backend Engineer',
            companyName: 'Innovate Systems',
            location: 'Kandy',
            type: 'Full-time',
            applicationId: 1002,
            appliedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            status: 'Shortlisted'
        },
        {
            jobId: 103,
            title: 'UI/UX Intern',
            companyName: 'Creative Studio',
            location: 'Colombo',
            type: 'Internship',
            applicationId: 1003,
            appliedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            status: 'Accepted'
        },
        {
            jobId: 104,
            title: 'QA Tester',
            companyName: 'Quality First',
            location: 'Galle',
            type: 'Contract',
            applicationId: 1004,
            appliedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            status: 'Rejected'
        }
    ];
    await driver.executeScript(
        "localStorage.setItem('" + LS_KEY + "', arguments[0]);",
        JSON.stringify(mockApplications)
    );
    return mockApplications;
}

// Helper to seed with single status for empty state testing
async function clearApplications(driver) {
    await driver.executeScript("localStorage.removeItem('" + LS_KEY + "');");
}

// Helper to get visible application cards count
async function getApplicationCards(driver) {
    return driver.findElements(By.xpath("//div[contains(@class, 'card') and .//*[contains(text(), 'Applied on')]]"));
}

// Helper to get all status badges on page
async function getStatusBadges(driver) {
    return driver.findElements(By.xpath(
        "//span[contains(@style, 'border-radius: 999') and .//*[contains(text(), 'Pending') or contains(text(), 'Shortlisted') or contains(text(), 'Accepted') or contains(text(), 'Rejected')]]"
    ));
}

// Helper to click filter tab
async function clickFilterTab(driver, status) {
    const tabs = await driver.findElements(By.xpath(
        "//button[contains(@style, 'border-radius: 999') and contains(., '" + status + "')]"
    ));
    if (tabs.length > 0) {
        await driver.executeScript('arguments[0].click();', tabs[0]);
        await driver.sleep(1000); // Wait for filter to apply
        return true;
    }
    return false;
}

// Helper to set sort order
async function setSortOrder(driver, orderValue) {
    const sortSelect = await driver.wait(
        until.elementLocated(By.xpath("//select[contains(@style, 'border-radius: 10')]")),
        8000
    );
    await sortSelect.click();
    const option = await sortSelect.findElement(By.xpath(".//option[@value='" + orderValue + "']"));
    await option.click();
    await driver.sleep(1000); // Wait for sort to apply
}

// Helper to check if dates are in descending order (latest first)
async function areDatesDescending(driver) {
    const dateElements = await driver.findElements(
        By.xpath("//*[contains(text(), 'Applied on')]")
    );
    if (dateElements.length < 2) return true;
    
    const dates = [];
    for (const el of dateElements) {
        const text = await el.getText();
        const match = text.match(/Applied on (.+)$/);
        if (match) {
            dates.push(new Date(match[1]));
        }
    }
    
    for (let i = 0; i < dates.length - 1; i++) {
        if (dates[i] < dates[i + 1]) return false;
    }
    return true;
}

// ── Group 1: Authentication & Navigation ─────────────────────────────────────

async function tc01(driver) {
    console.log('\nTC-01 — Login with valid student credentials');
    try {
        await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
        await driver.wait(until.urlContains('/student/home'), 20000);
        rec('TC-01', 'Login with valid student credentials', 'PASS');
    } catch(e) { 
        rec('TC-01', 'Login with valid student credentials', 'FAIL', e.message); 
    }
}

async function tc02(driver) {
    console.log('\nTC-02 — [AC-1] Navigate to My Applications page');
    try {
        await driver.get(APPS_URL);
        await waitForApplicationsPage(driver);
        const url = await driver.getCurrentUrl();
        if (url.includes('/student/applications')) {
            rec('TC-02', 'Navigate to My Applications page', 'PASS');
        } else {
            rec('TC-02', 'Navigate to My Applications page', 'FAIL', 'URL: ' + url);
        }
    } catch(e) { 
        rec('TC-02', 'Navigate to My Applications page', 'FAIL', e.message); 
    }
}

async function tc03(driver) {
    console.log('\nTC-03 — Applications page redirects unauthenticated users');
    try {
        await clearAuth(driver);
        await driver.get(APPS_URL);
        await driver.sleep(2500);
        const url = await driver.getCurrentUrl();
        if (!url.includes('/student/applications')) {
            rec('TC-03', 'Applications page redirects unauthenticated users', 'PASS', 'Redirected to: ' + url);
        } else {
            rec('TC-03', 'Applications page redirects unauthenticated users', 'FAIL', 'Page accessible without auth');
        }
    } catch(e) { 
        rec('TC-03', 'Applications page redirects unauthenticated users', 'FAIL', e.message); 
    }
}

// ── Group 2: Applications Page Display (AC-1) ───────────────────────────────

async function tc04(driver) {
    console.log('\nTC-04 — [AC-1] Re-login and seed test applications');
    try {
        await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
        await driver.wait(until.urlContains('/student/home'), 20000);
        await driver.get(APPS_URL);
        await waitForApplicationsPage(driver);
        await seedApplicationsWithStatuses(driver);
        await driver.navigate().refresh();
        await waitForApplicationsPage(driver);
        rec('TC-04', 'Re-login and seed test applications', 'PASS');
    } catch(e) { 
        rec('TC-04', 'Re-login and seed test applications', 'FAIL', e.message); 
    }
}

async function tc05(driver) {
    console.log('\nTC-05 — [AC-1] Page header shows "My Job Applications" title');
    try {
        const headers = await driver.findElements(
            By.xpath("//h1[contains(text(),'My Job Applications')]")
        );
        if (headers.length > 0) {
            const text = await headers[0].getText();
            rec('TC-05', 'Page header shows correct title', 'PASS', '"' + text + '"');
        } else {
            rec('TC-05', 'Page header shows correct title', 'FAIL', 'Title not found');
        }
    } catch(e) { 
        rec('TC-05', 'Page header shows correct title', 'FAIL', e.message); 
    }
}

async function tc06(driver) {
    console.log('\nTC-06 — [AC-1] Total applications count displayed');
    try {
        const countEl = await driver.findElements(
            By.xpath("//*[contains(text(), 'Total Applications') or contains(text(), 'application') and contains(text(), 'Showing')]")
        );
        if (countEl.length > 0) {
            const text = await countEl[0].getText();
            rec('TC-06', 'Total applications count displayed', 'PASS', '"' + text + '"');
        } else {
            rec('TC-06', 'Total applications count displayed', 'FAIL', 'Count not found');
        }
    } catch(e) { 
        rec('TC-06', 'Total applications count displayed', 'FAIL', e.message); 
    }
}

async function tc07(driver) {
    console.log('\nTC-07 — [AC-1] All seeded applications visible on page');
    try {
        const cards = await getApplicationCards(driver);
        if (cards.length === 4) {
            rec('TC-07', 'All 4 seeded applications visible', 'PASS', cards.length + ' cards found');
        } else {
            rec('TC-07', 'All 4 seeded applications visible', 'FAIL', 'Found ' + cards.length + ' cards, expected 4');
        }
    } catch(e) { 
        rec('TC-07', 'All seeded applications visible', 'FAIL', e.message); 
    }
}

async function tc08(driver) {
    console.log('\nTC-08 — [AC-1] Each application card shows company name and job title');
    try {
        const cards = await getApplicationCards(driver);
        let allValid = true;
        for (let i = 0; i < Math.min(cards.length, 3); i++) {
            const html = await cards[i].getAttribute('innerHTML');
            const hasCompany = html.includes('🏢') || html.includes('company');
            const hasTitle = html.includes('Frontend') || html.includes('Backend') || 
                            html.includes('UI/UX') || html.includes('QA');
            if (!hasCompany || !hasTitle) allValid = false;
        }
        if (allValid) {
            rec('TC-08', 'Each card shows company name and job title', 'PASS');
        } else {
            rec('TC-08', 'Each card shows company name and job title', 'FAIL', 'Missing required fields');
        }
    } catch(e) { 
        rec('TC-08', 'Each card shows company name and job title', 'FAIL', e.message); 
    }
}

// ── Group 3: Status Badge Verification (AC-2) ───────────────────────────────

async function tc09(driver) {
    console.log('\nTC-09 — [AC-2] Status badges are visible on application cards');
    try {
        const badges = await getStatusBadges(driver);
        if (badges.length === 4) {
            rec('TC-09', 'Status badges visible on all 4 cards', 'PASS', badges.length + ' badges found');
        } else {
            rec('TC-09', 'Status badges visible on all 4 cards', 'FAIL', 'Found ' + badges.length + ' badges, expected 4');
        }
    } catch(e) { 
        rec('TC-09', 'Status badges visible on cards', 'FAIL', e.message); 
    }
}

async function tc10(driver) {
    console.log('\nTC-10 — [AC-2] Pending badge has correct styling and icon');
    try {
        const pending = await driver.findElements(
            By.xpath("//span[contains(@style, 'border-radius: 999') and contains(., 'Pending')]")
        );
        if (pending.length > 0) {
            const style = await pending[0].getAttribute('style');
            const hasIcon = await pending[0].getAttribute('innerHTML').includes('🕐');
            if (style && hasIcon) {
                rec('TC-10', 'Pending badge has correct styling and icon', 'PASS');
            } else {
                rec('TC-10', 'Pending badge has correct styling and icon', 'FAIL', 'Style or icon missing');
            }
        } else {
            rec('TC-10', 'Pending badge has correct styling and icon', 'FAIL', 'Pending badge not found');
        }
    } catch(e) { 
        rec('TC-10', 'Pending badge styling', 'FAIL', e.message); 
    }
}

async function tc11(driver) {
    console.log('\nTC-11 — [AC-2] Shortlisted badge has correct styling and icon');
    try {
        const shortlisted = await driver.findElements(
            By.xpath("//span[contains(@style, 'border-radius: 999') and contains(., 'Shortlisted')]")
        );
        if (shortlisted.length > 0) {
            const style = await shortlisted[0].getAttribute('style');
            const hasIcon = await shortlisted[0].getAttribute('innerHTML').includes('⭐');
            if (style && hasIcon) {
                rec('TC-11', 'Shortlisted badge has correct styling and icon', 'PASS');
            } else {
                rec('TC-11', 'Shortlisted badge has correct styling and icon', 'FAIL', 'Style or icon missing');
            }
        } else {
            rec('TC-11', 'Shortlisted badge has correct styling and icon', 'FAIL', 'Shortlisted badge not found');
        }
    } catch(e) { 
        rec('TC-11', 'Shortlisted badge styling', 'FAIL', e.message); 
    }
}

async function tc12(driver) {
    console.log('\nTC-12 — [AC-2] Accepted badge has correct styling and icon');
    try {
        const accepted = await driver.findElements(
            By.xpath("//span[contains(@style, 'border-radius: 999') and contains(., 'Accepted')]")
        );
        if (accepted.length > 0) {
            const style = await accepted[0].getAttribute('style');
            const hasIcon = await accepted[0].getAttribute('innerHTML').includes('✅');
            if (style && hasIcon) {
                rec('TC-12', 'Accepted badge has correct styling and icon', 'PASS');
            } else {
                rec('TC-12', 'Accepted badge has correct styling and icon', 'FAIL', 'Style or icon missing');
            }
        } else {
            rec('TC-12', 'Accepted badge has correct styling and icon', 'FAIL', 'Accepted badge not found');
        }
    } catch(e) { 
        rec('TC-12', 'Accepted badge styling', 'FAIL', e.message); 
    }
}

async function tc13(driver) {
    console.log('\nTC-13 — [AC-2] Rejected badge has correct styling and icon');
    try {
        const rejected = await driver.findElements(
            By.xpath("//span[contains(@style, 'border-radius: 999') and contains(., 'Rejected')]")
        );
        if (rejected.length > 0) {
            const style = await rejected[0].getAttribute('style');
            const hasIcon = await rejected[0].getAttribute('innerHTML').includes('❌');
            if (style && hasIcon) {
                rec('TC-13', 'Rejected badge has correct styling and icon', 'PASS');
            } else {
                rec('TC-13', 'Rejected badge has correct styling and icon', 'FAIL', 'Style or icon missing');
            }
        } else {
            rec('TC-13', 'Rejected badge has correct styling and icon', 'FAIL', 'Rejected badge not found');
        }
    } catch(e) { 
        rec('TC-13', 'Rejected badge styling', 'FAIL', e.message); 
    }
}

async function tc14(driver) {
    console.log('\nTC-14 — [AC-2] Application reference number displayed');
    try {
        const refs = await driver.findElements(
            By.xpath("//*[contains(text(), 'Ref #') or contains(text(), 'Application #')]")
        );
        if (refs.length >= 4) {
            const text = await refs[0].getText();
            rec('TC-14', 'Application reference numbers displayed', 'PASS', refs.length + ' references, sample: "' + text + '"');
        } else {
            rec('TC-14', 'Application reference numbers displayed', 'FAIL', 'Found ' + refs.length + ' references, expected at least 4');
        }
    } catch(e) { 
        rec('TC-14', 'Application reference numbers', 'FAIL', e.message); 
    }
}

// ── Group 4: Sorting Functionality (AC-3) ───────────────────────────────────

async function tc15(driver) {
    console.log('\nTC-15 — [AC-3] Sort dropdown is present');
    try {
        const sortSelect = await driver.findElements(
            By.xpath("//select[contains(@style, 'border-radius: 10')]")
        );
        if (sortSelect.length > 0) {
            const options = await sortSelect[0].findElements(By.tagName('option'));
            rec('TC-15', 'Sort dropdown is present', 'PASS', options.length + ' options available');
        } else {
            rec('TC-15', 'Sort dropdown is present', 'FAIL', 'Sort dropdown not found');
        }
    } catch(e) { 
        rec('TC-15', 'Sort dropdown is present', 'FAIL', e.message); 
    }
}

async function tc16(driver) {
    console.log('\nTC-16 — [AC-3] Default sort is "Latest First"');
    try {
        const sortSelect = await driver.findElement(
            By.xpath("//select[contains(@style, 'border-radius: 10')]")
        );
        const selected = await sortSelect.findElement(By.xpath(".//option[@selected]"));
        const value = await selected.getAttribute('value');
        const text = await selected.getText();
        
        if (value === 'date_desc' || text.includes('Latest')) {
            rec('TC-16', 'Default sort is "Latest First"', 'PASS', 'Selected: ' + text);
        } else {
            rec('TC-16', 'Default sort is "Latest First"', 'FAIL', 'Selected: ' + text);
        }
    } catch(e) { 
        rec('TC-16', 'Default sort is "Latest First"', 'FAIL', e.message); 
    }
}

async function tc17(driver) {
    console.log('\nTC-17 — [AC-3] Applications display in descending date order (latest first)');
    try {
        const isDescending = await areDatesDescending(driver);
        if (isDescending) {
            rec('TC-17', 'Applications display in descending date order', 'PASS');
        } else {
            rec('TC-17', 'Applications display in descending date order', 'FAIL', 'Dates not in correct order');
        }
    } catch(e) { 
        rec('TC-17', 'Applications in descending date order', 'FAIL', e.message); 
    }
}

async function tc18(driver) {
    console.log('\nTC-18 — [AC-3] Sort by "Oldest First" changes order');
    try {
        await setSortOrder(driver, 'date_asc');
        
        // Check if order changed (should be ascending now)
        const dateElements = await driver.findElements(
            By.xpath("//*[contains(text(), 'Applied on')]")
        );
        
        let isAscending = true;
        const dates = [];
        for (const el of dateElements) {
            const text = await el.getText();
            const match = text.match(/Applied on (.+)$/);
            if (match) {
                dates.push(new Date(match[1]));
            }
        }
        
        for (let i = 0; i < dates.length - 1; i++) {
            if (dates[i] > dates[i + 1]) {
                isAscending = false;
                break;
            }
        }
        
        if (isAscending) {
            rec('TC-18', 'Sort by "Oldest First" works correctly', 'PASS');
        } else {
            rec('TC-18', 'Sort by "Oldest First" works correctly', 'FAIL', 'Dates not in ascending order');
        }
    } catch(e) { 
        rec('TC-18', 'Sort by Oldest First', 'FAIL', e.message); 
    }
}

// ── Group 5: Filtering by Status (AC-4) ─────────────────────────────────────

async function tc19(driver) {
    console.log('\nTC-19 — [AC-4] Status filter tabs are present');
    try {
        const tabs = await driver.findElements(
            By.xpath("//button[contains(@style, 'border-radius: 999') and (contains(., 'All') or contains(., 'Pending') or contains(., 'Shortlisted') or contains(., 'Accepted') or contains(., 'Rejected'))]")
        );
        if (tabs.length >= 5) {
            rec('TC-19', 'Status filter tabs are present', 'PASS', tabs.length + ' tabs found');
        } else {
            rec('TC-19', 'Status filter tabs are present', 'FAIL', 'Found ' + tabs.length + ' tabs, expected at least 5');
        }
    } catch(e) { 
        rec('TC-19', 'Status filter tabs are present', 'FAIL', e.message); 
    }
}

async function tc20(driver) {
    console.log('\nTC-20 — [AC-4] Filter by Pending shows only pending applications');
    try {
        await clickFilterTab(driver, 'Pending');
        
        const cards = await getApplicationCards(driver);
        const badges = await driver.findElements(
            By.xpath("//span[contains(@style, 'border-radius: 999') and contains(., 'Pending')]")
        );
        
        // All visible cards should have Pending badge
        if (cards.length === badges.length && cards.length === 1) {
            rec('TC-20', 'Filter by Pending shows only pending applications', 'PASS', cards.length + ' Pending app(s) found');
        } else {
            rec('TC-20', 'Filter by Pending shows only pending applications', 'FAIL', 
                'Cards: ' + cards.length + ', Pending badges: ' + badges.length);
        }
    } catch(e) { 
        rec('TC-20', 'Filter by Pending', 'FAIL', e.message); 
    }
}

async function tc21(driver) {
    console.log('\nTC-21 — [AC-4] Filter by Shortlisted shows only shortlisted applications');
    try {
        await clickFilterTab(driver, 'Shortlisted');
        
        const cards = await getApplicationCards(driver);
        const badges = await driver.findElements(
            By.xpath("//span[contains(@style, 'border-radius: 999') and contains(., 'Shortlisted')]")
        );
        
        if (cards.length === badges.length && cards.length === 1) {
            rec('TC-21', 'Filter by Shortlisted shows only shortlisted applications', 'PASS', cards.length + ' Shortlisted app(s) found');
        } else {
            rec('TC-21', 'Filter by Shortlisted shows only shortlisted applications', 'FAIL', 
                'Cards: ' + cards.length + ', Shortlisted badges: ' + badges.length);
        }
    } catch(e) { 
        rec('TC-21', 'Filter by Shortlisted', 'FAIL', e.message); 
    }
}

async function tc22(driver) {
    console.log('\nTC-22 — [AC-4] "All" filter shows all applications');
    try {
        await clickFilterTab(driver, 'All');
        
        const cards = await getApplicationCards(driver);
        if (cards.length === 4) {
            rec('TC-22', '"All" filter shows all 4 applications', 'PASS', cards.length + ' apps shown');
        } else {
            rec('TC-22', '"All" filter shows all applications', 'FAIL', 'Found ' + cards.length + ' apps, expected 4');
        }
    } catch(e) { 
        rec('TC-22', '"All" filter shows all applications', 'FAIL', e.message); 
    }
}

// ── Group 6: Empty State (AC-5) ─────────────────────────────────────────────

async function tc23(driver) {
    console.log('\nTC-23 — [AC-5] Clear applications to test empty state');
    try {
        await clearApplications(driver);
        await driver.navigate().refresh();
        await waitForApplicationsPage(driver);
        rec('TC-23', 'Cleared applications for empty state test', 'PASS');
    } catch(e) { 
        rec('TC-23', 'Clear applications', 'FAIL', e.message); 
    }
}

async function tc24(driver) {
    console.log('\nTC-24 — [AC-5] Empty state shows "No applications yet" message');
    try {
        const emptyMessages = await driver.findElements(
            By.xpath("//*[contains(text(), 'No applications yet') or contains(text(), 'No applications found')]")
        );
        if (emptyMessages.length > 0) {
            const text = await emptyMessages[0].getText();
            rec('TC-24', 'Empty state shows "No applications yet" message', 'PASS', '"' + text + '"');
        } else {
            rec('TC-24', 'Empty state shows "No applications yet" message', 'FAIL', 'Empty message not found');
        }
    } catch(e) { 
        rec('TC-24', 'Empty state message', 'FAIL', e.message); 
    }
}

async function tc25(driver) {
    console.log('\nTC-25 — [AC-5] Empty state shows "Browse Jobs" button');
    try {
        const browseBtn = await driver.findElements(
            By.xpath("//a[contains(@href, '/student/jobs') and contains(., 'Browse Jobs')]")
        );
        if (browseBtn.length > 0) {
            const href = await browseBtn[0].getAttribute('href');
            rec('TC-25', 'Empty state shows Browse Jobs button', 'PASS', 'href="' + href + '"');
        } else {
            rec('TC-25', 'Empty state shows Browse Jobs button', 'FAIL', 'Browse Jobs button not found');
        }
    } catch(e) { 
        rec('TC-25', 'Empty state Browse Jobs button', 'FAIL', e.message); 
    }
}

// ── Summary ───────────────────────────────────────────────────────────────────
function printSummary() {
    const passed = results.filter(function(r) { return r.status === 'PASS'; }).length;
    const failed = results.filter(function(r) { return r.status === 'FAIL'; }).length;
    const total  = results.length;

    console.log('\n');
    console.log('==================================================================');
    console.log('   FINAL TEST RESULTS — Student Application Status Tracking');
    console.log('==================================================================');
    console.log('   Total  : ' + total);
    console.log('   Passed : ' + passed + ' ✅');
    console.log('   Failed : ' + failed + ' ❌');
    console.log('   Rate   : ' + Math.round((passed / total) * 100) + '%');
    console.log('------------------------------------------------------------------');
    console.log('   Acceptance Criteria Coverage:');
    console.log('   AC-1 (Display all applications)  : TC-02, TC-05 to TC-08');
    console.log('   AC-2 (Status badges)             : TC-09 to TC-14');
    console.log('   AC-3 (Sort by date)               : TC-15 to TC-18');
    console.log('   AC-4 (Filter by status)           : TC-19 to TC-22');
    console.log('   AC-5 (Empty state)                : TC-23 to TC-25');
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
    console.log('   PathFinder — Student Application Status Tracking Test Suite');
    console.log('==================================================================');
    
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        console.log('\n--- Group 1: Authentication & Navigation ---');
        await tc01(driver);
        await tc02(driver);
        await tc03(driver);

        console.log('\n--- Group 2: Applications Page Display [AC-1] ---');
        await tc04(driver);
        await tc05(driver);
        await tc06(driver);
        await tc07(driver);
        await tc08(driver);

        console.log('\n--- Group 3: Status Badge Verification [AC-2] ---');
        await tc09(driver);
        await tc10(driver);
        await tc11(driver);
        await tc12(driver);
        await tc13(driver);
        await tc14(driver);

        console.log('\n--- Group 4: Sorting Functionality [AC-3] ---');
        await tc15(driver);
        await tc16(driver);
        await tc17(driver);
        await tc18(driver);

        console.log('\n--- Group 5: Filtering by Status [AC-4] ---');
        await tc19(driver);
        await tc20(driver);
        await tc21(driver);
        await tc22(driver);

        console.log('\n--- Group 6: Empty State [AC-5] ---');
        await tc23(driver);
        await tc24(driver);
        await tc25(driver);

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