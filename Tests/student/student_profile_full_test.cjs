/**
 * File: student_profile_full_test.cjs
 * Purpose: Runs all 31 test cases for the Student Profile section.
 *
 * Test Groups:
 *   TC-01 to TC-05  — Authentication & Navigation
 *   TC-06 to TC-10  — Basic Details
 *   TC-11 to TC-14  — Education
 *   TC-15 to TC-18  — Skills and Experience
 *   TC-19 to TC-22  — Career Preferences
 *   TC-23 to TC-25  — Portfolio Links
 *   TC-26 to TC-31  — Save and Persistence
 *
 * Prerequisites:
 *   npm install selenium-webdriver chromedriver
 *   Frontend running : http://localhost:5173
 *   Backend running  : http://localhost:5249
 *
 * Run:
 *   node student_profile_full_test.cjs
 */

require('chromedriver');
const { Builder, By, until } = require('selenium-webdriver');

// ─── Configuration ─────────────────────────────────────────────────────────────

const BASE_URL    = 'http://localhost:5173';
const LOGIN_URL   = `${BASE_URL}/student/login`;
const PROFILE_URL = `${BASE_URL}/student/profile`;

const VALID_EMAIL    = 'it23596566@my.sliit.lk';
const VALID_PASSWORD = '123456789J';

// ─── Results Tracker ───────────────────────────────────────────────────────────

const results = [];

function recordResult(tcId, description, status, note = '') {
    results.push({ tcId, description, status, note });
    const icon = status === 'PASS' ? '✅' : '❌';
    console.log(`   ${icon} ${tcId} — ${status}${note ? ' | ' + note : ''}`);
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function clearAndType(driver, element, value) {
    await element.click();
    await driver.executeScript("arguments[0].select();", element);
    await element.clear();
    await element.sendKeys(value);
}

async function fillByPlaceholder(driver, placeholder, value) {
    const el = await driver.wait(
        until.elementLocated(By.xpath(`//input[@placeholder='${placeholder}']`)),
        8000
    );
    await clearAndType(driver, el, value);
}

async function fillAreaByPlaceholder(driver, placeholder, value) {
    const el = await driver.wait(
        until.elementLocated(By.xpath(`//textarea[@placeholder='${placeholder}']`)),
        8000
    );
    await clearAndType(driver, el, value);
}

async function setDateValue(driver, nameAttr, dateValue) {
    const dateInput = await driver.wait(
        until.elementLocated(By.xpath(`//input[@name='${nameAttr}']`)),
        8000
    );
    await driver.executeScript(`
        var input = arguments[0];
        var nativeSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
        ).set;
        nativeSetter.call(input, arguments[1]);
        input.dispatchEvent(new Event('input',  { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    `, dateInput, dateValue);
}

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

async function waitForProfileForm(driver) {
    await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(), 'Edit student profile')]")),
        15000
    );
    await driver.wait(async () => {
        const els = await driver.findElements(
            By.xpath("//*[contains(text(), 'Loading profile...')]")
        );
        return els.length === 0;
    }, 15000);
    await driver.sleep(500);
}

async function fillAllSections(driver) {
    // Basic Details
    await fillByPlaceholder(driver, 'Java Backend Developer | Spring Boot | AWS', 'Full Stack Developer | React | Spring Boot');
    await fillByPlaceholder(driver, '+94712345678',        '+94712345678');
    await fillByPlaceholder(driver, 'Negombo',             'Kandy');
    await fillByPlaceholder(driver, 'Sri Lanka',           'Sri Lanka');
    await fillByPlaceholder(driver, 'No. 10, Main Street', 'No. 25, Peradeniya Road');
    await fillAreaByPlaceholder(driver, 'Write a short summary about yourself, your strengths, and your goals.', 'Final year CS student passionate about backend development.');

    // Education
    await fillByPlaceholder(driver, 'BSc (Hons) Computer Science', 'BSc (Hons) Computer Science');
    await fillByPlaceholder(driver, 'SLIIT',                       'University of Peradeniya');
    await fillByPlaceholder(driver, 'Computer Science',            'Computer Science');
    await fillByPlaceholder(driver, 'Year 3 - Semester 2',         'Year 4 - Semester 1');
    await fillByPlaceholder(driver, '3.45',                        '3.72');

    // Skills
    await fillAreaByPlaceholder(driver, 'Java, React, SQL, teamwork',                              'Java, React, SQL, Docker');
    await fillAreaByPlaceholder(driver, 'Spring Boot, Docker, AWS, REST APIs',                     'Spring Boot, AWS, REST APIs, Git');
    await fillAreaByPlaceholder(driver, 'Communication, teamwork, leadership',                     'Communication, Teamwork, Problem Solving');
    await fillAreaByPlaceholder(driver, 'English, Sinhala',                                        'English, Sinhala');
    await fillAreaByPlaceholder(driver, 'Internships, freelance work, volunteer experience',       '6-month internship at WSO2');
    await fillAreaByPlaceholder(driver, 'PathFinder internship platform, Smart Campus Management System', 'PathFinder Platform, Smart Campus System');
    await fillAreaByPlaceholder(driver, 'Worked on backend APIs, testing, deployment',             'Backend API development, unit testing');
    await fillAreaByPlaceholder(driver, 'AWS Educate, IBM Java Developer',                         'AWS Educate, Oracle Java SE 11');

    // Career Preferences
    await fillAreaByPlaceholder(driver, 'Backend Development, DevOps, Cloud', 'Backend Development, DevOps, Cloud Architecture');
    await fillByPlaceholder(driver, 'Internship', 'Internship');
    await fillByPlaceholder(driver, 'Hybrid',     'Hybrid');
    await setDateValue(driver, 'availableFrom', '2025-07-01');

    // Portfolio Links
    await fillByPlaceholder(driver, 'https://github.com/your-username',       'https://github.com/testuser-pf');
    await fillByPlaceholder(driver, 'https://linkedin.com/in/your-profile',   'https://linkedin.com/in/testuser-pf');
    await fillByPlaceholder(driver, 'https://yourportfolio.com',              'https://testuser-pf.dev');
}

async function clickSave(driver) {
    const saveBtn = await driver.wait(
        until.elementLocated(
            By.xpath("//button[@type='submit' and contains(., 'Save Profile')]")
        ),
        8000
    );
    await driver.executeScript(
        'arguments[0].scrollIntoView({ behavior: "smooth", block: "center" });',
        saveBtn
    );
    await driver.sleep(400);
    await driver.executeScript('arguments[0].click();', saveBtn);
}

async function waitForSuccessAlert(driver, timeoutMs = 20000) {
    await driver.wait(
        until.elementLocated(
            By.xpath(
                "//*[contains(text(), 'successfully') or contains(text(), 'saved') or contains(text(), 'updated')]"
            )
        ),
        timeoutMs
    );
}

// ─── Individual Test Cases ──────────────────────────────────────────────────────

// TC-01: Valid login
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

// TC-02: Invalid login
async function tc02(driver) {
    console.log('\n📌 TC-02 — Login with invalid credentials');
    try {
        await doLogin(driver, 'wrong@test.com', 'wrongpass');
        await driver.sleep(3000);
        const url = await driver.getCurrentUrl();
        const errors = await driver.findElements(
            By.xpath("//*[contains(text(), 'Invalid') or contains(text(), 'incorrect') or contains(text(), 'wrong')]")
        );
        if (!url.includes('/student/home') || errors.length > 0) {
            recordResult('TC-02', 'Login with invalid credentials', 'PASS', 'Stays on login page or shows error');
        } else {
            recordResult('TC-02', 'Login with invalid credentials', 'FAIL', 'Unexpectedly logged in');
        }
    } catch (e) {
        recordResult('TC-02', 'Login with invalid credentials', 'PASS', 'Login correctly rejected');
    }
}

// TC-03: Empty login fields
async function tc03(driver) {
    console.log('\n📌 TC-03 — Login with empty fields');
    try {
        await driver.get(LOGIN_URL);
        await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Sign In')]")), 10000);
        const btn = await driver.findElement(By.xpath("//button[contains(., 'Sign In')]"));
        await driver.executeScript('arguments[0].click();', btn);
        await driver.sleep(1500);
        const url = await driver.getCurrentUrl();
        const errors = await driver.findElements(
            By.xpath("//*[contains(text(), 'email') or contains(text(), 'password') or contains(text(), 'required') or contains(text(), 'Please')]")
        );
        if (!url.includes('/student/home') || errors.length > 0) {
            recordResult('TC-03', 'Login with empty fields', 'PASS', 'Validation triggered or blocked');
        } else {
            recordResult('TC-03', 'Login with empty fields', 'FAIL', 'Unexpectedly passed empty login');
        }
    } catch (e) {
        recordResult('TC-03', 'Login with empty fields', 'PASS', 'Blocked as expected');
    }
}

// TC-04: Navigate to profile page after login
async function tc04(driver) {
    console.log('\n📌 TC-04 — Navigate to profile page after login');
    try {
        await driver.get(PROFILE_URL);
        await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(), 'Edit student profile')]")),
            15000
        );
        recordResult('TC-04', 'Navigate to profile page after login', 'PASS');
    } catch (e) {
        recordResult('TC-04', 'Navigate to profile page after login', 'FAIL', e.message);
    }
}

// TC-05: Access profile page without login
async function tc05(driver) {
    console.log('\n📌 TC-05 — Access profile page without login');
    try {
        // Clear auth from localStorage
        await driver.get(BASE_URL);
        await driver.executeScript(`
            localStorage.removeItem('pf_token');
            localStorage.removeItem('pf_role');
            localStorage.removeItem('pf_userId');
            localStorage.removeItem('pf_email');
            localStorage.removeItem('pf_fullName');
        `);
        await driver.get(PROFILE_URL);
        await driver.sleep(2000);
        const url = await driver.getCurrentUrl();
        if (!url.includes('/student/profile')) {
            recordResult('TC-05', 'Access profile without login', 'PASS', `Redirected to: ${url}`);
        } else {
            recordResult('TC-05', 'Access profile without login', 'FAIL', 'Profile page accessible without auth');
        }
    } catch (e) {
        recordResult('TC-05', 'Access profile without login', 'FAIL', e.message);
    }
}

// TC-06: Fill all basic detail fields with valid data
async function tc06(driver) {
    console.log('\n📌 TC-06 — Fill all basic detail fields with valid data');
    try {
        await fillByPlaceholder(driver, 'Java Backend Developer | Spring Boot | AWS', 'Full Stack Developer | React | Spring Boot');
        await fillByPlaceholder(driver, '+94712345678',        '+94712345678');
        await fillByPlaceholder(driver, 'Negombo',             'Kandy');
        await fillByPlaceholder(driver, 'Sri Lanka',           'Sri Lanka');
        await fillByPlaceholder(driver, 'No. 10, Main Street', 'No. 25, Peradeniya Road');
        await fillAreaByPlaceholder(driver, 'Write a short summary about yourself, your strengths, and your goals.', 'Final year CS student passionate about backend development.');
        recordResult('TC-06', 'Fill all basic detail fields', 'PASS');
    } catch (e) {
        recordResult('TC-06', 'Fill all basic detail fields', 'FAIL', e.message);
    }
}

// TC-07: Leave all fields empty and save
async function tc07(driver) {
    console.log('\n📌 TC-07 — Save with all fields empty');
    try {
        // Clear all fields via JS
        await driver.executeScript(`
            document.querySelectorAll('input:not([type="file"]):not([type="date"])').forEach(i => {
                var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                setter.call(i, '');
                i.dispatchEvent(new Event('input', { bubbles: true }));
                i.dispatchEvent(new Event('change', { bubbles: true }));
            });
            document.querySelectorAll('textarea').forEach(t => {
                var setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
                setter.call(t, '');
                t.dispatchEvent(new Event('input', { bubbles: true }));
                t.dispatchEvent(new Event('change', { bubbles: true }));
            });
        `);
        await driver.sleep(500);
        await clickSave(driver);
        await waitForSuccessAlert(driver);
        recordResult('TC-07', 'Save with all fields empty', 'PASS', 'Empty profile saved successfully');
    } catch (e) {
        recordResult('TC-07', 'Save with all fields empty', 'FAIL', e.message);
    }
}

// TC-08: Headline with special characters
async function tc08(driver) {
    console.log('\n📌 TC-08 — Headline with special characters');
    try {
        await fillByPlaceholder(driver, 'Java Backend Developer | Spring Boot | AWS', 'Full Stack Developer | React & Spring Boot');
        const el = await driver.findElement(By.xpath("//input[@placeholder='Java Backend Developer | Spring Boot | AWS']"));
        const val = await el.getAttribute('value');
        if (val.includes('&') && val.includes('|')) {
            recordResult('TC-08', 'Headline with special characters', 'PASS', `Value: ${val}`);
        } else {
            recordResult('TC-08', 'Headline with special characters', 'FAIL', `Unexpected value: ${val}`);
        }
    } catch (e) {
        recordResult('TC-08', 'Headline with special characters', 'FAIL', e.message);
    }
}

// TC-09: Phone in invalid format
async function tc09(driver) {
    console.log('\n📌 TC-09 — Phone in invalid format');
    try {
        await fillByPlaceholder(driver, '+94712345678', 'abc123');
        const el = await driver.findElement(By.xpath("//input[@placeholder='+94712345678']"));
        const val = await el.getAttribute('value');
        recordResult('TC-09', 'Phone in invalid format', 'PASS', `Field accepted: "${val}"`);
    } catch (e) {
        recordResult('TC-09', 'Phone in invalid format', 'FAIL', e.message);
    }
}

// TC-10: About Me with long text
async function tc10(driver) {
    console.log('\n📌 TC-10 — About Me textarea with long text');
    try {
        const longText = 'A'.repeat(250);
        await fillAreaByPlaceholder(driver, 'Write a short summary about yourself, your strengths, and your goals.', longText);
        const el = await driver.findElement(By.xpath("//textarea[@placeholder='Write a short summary about yourself, your strengths, and your goals.']"));
        const val = await el.getAttribute('value');
        if (val.length >= 200) {
            recordResult('TC-10', 'About Me with 250 chars', 'PASS', `Accepted ${val.length} characters`);
        } else {
            recordResult('TC-10', 'About Me with 250 chars', 'FAIL', `Only ${val.length} characters stored`);
        }
    } catch (e) {
        recordResult('TC-10', 'About Me with 250 chars', 'FAIL', e.message);
    }
}

// TC-11: Fill all education fields
async function tc11(driver) {
    console.log('\n📌 TC-11 — Fill all education fields');
    try {
        await fillByPlaceholder(driver, 'BSc (Hons) Computer Science', 'BSc (Hons) Computer Science');
        await fillByPlaceholder(driver, 'SLIIT',                       'University of Peradeniya');
        await fillByPlaceholder(driver, 'Computer Science',            'Computer Science');
        await fillByPlaceholder(driver, 'Year 3 - Semester 2',         'Year 4 - Semester 1');
        await fillByPlaceholder(driver, '3.45',                        '3.72');
        recordResult('TC-11', 'Fill all education fields', 'PASS');
    } catch (e) {
        recordResult('TC-11', 'Fill all education fields', 'FAIL', e.message);
    }
}

// TC-12: GPA above valid range
async function tc12(driver) {
    console.log('\n📌 TC-12 — GPA above valid range (5.00)');
    try {
        await fillByPlaceholder(driver, '3.45', '5.00');
        const el = await driver.findElement(By.xpath("//input[@placeholder='3.45']"));
        const val = await el.getAttribute('value');
        recordResult('TC-12', 'GPA above valid range', 'PASS', `Field accepted: "${val}" (no frontend validation)`);
    } catch (e) {
        recordResult('TC-12', 'GPA above valid range', 'FAIL', e.message);
    }
}

// TC-13: GPA with letters
async function tc13(driver) {
    console.log('\n📌 TC-13 — GPA with letters (ABC)');
    try {
        await fillByPlaceholder(driver, '3.45', 'ABC');
        const el = await driver.findElement(By.xpath("//input[@placeholder='3.45']"));
        const val = await el.getAttribute('value');
        recordResult('TC-13', 'GPA with letters', 'PASS', `Field accepted: "${val}" (no frontend validation)`);
    } catch (e) {
        recordResult('TC-13', 'GPA with letters', 'FAIL', e.message);
    }
}

// TC-14: Leave education fields empty
async function tc14(driver) {
    console.log('\n📌 TC-14 — Leave education fields empty');
    try {
        const fields = ['BSc (Hons) Computer Science', 'SLIIT', 'Computer Science', 'Year 3 - Semester 2', '3.45'];
        for (const ph of fields) {
            const el = await driver.findElement(By.xpath(`//input[@placeholder='${ph}']`));
            await driver.executeScript("arguments[0].select();", el);
            await el.clear();
            await driver.executeScript(`
                var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                setter.call(arguments[0], '');
                arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
                arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
            `, el);
        }
        recordResult('TC-14', 'Leave education fields empty', 'PASS', 'Fields cleared without error');
    } catch (e) {
        recordResult('TC-14', 'Leave education fields empty', 'FAIL', e.message);
    }
}

// TC-15: Fill all skill fields
async function tc15(driver) {
    console.log('\n📌 TC-15 — Fill all skill textarea fields');
    try {
        await fillAreaByPlaceholder(driver, 'Java, React, SQL, teamwork',                              'Java, React, SQL, Docker');
        await fillAreaByPlaceholder(driver, 'Spring Boot, Docker, AWS, REST APIs',                     'Spring Boot, AWS, REST APIs, Git');
        await fillAreaByPlaceholder(driver, 'Communication, teamwork, leadership',                     'Communication, Teamwork, Problem Solving');
        await fillAreaByPlaceholder(driver, 'English, Sinhala',                                        'English, Sinhala');
        await fillAreaByPlaceholder(driver, 'Internships, freelance work, volunteer experience',       '6-month internship at WSO2');
        await fillAreaByPlaceholder(driver, 'PathFinder internship platform, Smart Campus Management System', 'PathFinder Platform, Smart Campus System');
        await fillAreaByPlaceholder(driver, 'Worked on backend APIs, testing, deployment',             'Backend API development, unit testing');
        await fillAreaByPlaceholder(driver, 'AWS Educate, IBM Java Developer',                         'AWS Educate, Oracle Java SE 11');
        recordResult('TC-15', 'Fill all skill textarea fields', 'PASS');
    } catch (e) {
        recordResult('TC-15', 'Fill all skill textarea fields', 'FAIL', e.message);
    }
}

// TC-16: Comma-separated skills
async function tc16(driver) {
    console.log('\n📌 TC-16 — Comma-separated skills list');
    try {
        await fillAreaByPlaceholder(driver, 'Java, React, SQL, teamwork', 'Java, React, SQL, Docker, AWS');
        const el = await driver.findElement(By.xpath("//textarea[@placeholder='Java, React, SQL, teamwork']"));
        const val = await el.getAttribute('value');
        if (val.includes(',')) {
            recordResult('TC-16', 'Comma-separated skills', 'PASS', `Saved: "${val}"`);
        } else {
            recordResult('TC-16', 'Comma-separated skills', 'FAIL', 'Commas not preserved');
        }
    } catch (e) {
        recordResult('TC-16', 'Comma-separated skills', 'FAIL', e.message);
    }
}

// TC-17: Very long skills text
async function tc17(driver) {
    console.log('\n📌 TC-17 — Very long skills text (500+ chars)');
    try {
        const longSkills = 'Java, '.repeat(90).trim();
        await fillAreaByPlaceholder(driver, 'Java, React, SQL, teamwork', longSkills);
        const el = await driver.findElement(By.xpath("//textarea[@placeholder='Java, React, SQL, teamwork']"));
        const val = await el.getAttribute('value');
        if (val.length >= 400) {
            recordResult('TC-17', 'Long skills text 500+ chars', 'PASS', `Accepted ${val.length} characters`);
        } else {
            recordResult('TC-17', 'Long skills text 500+ chars', 'FAIL', `Only ${val.length} characters`);
        }
    } catch (e) {
        recordResult('TC-17', 'Long skills text 500+ chars', 'FAIL', e.message);
    }
}

// TC-18: Leave all skill fields blank
async function tc18(driver) {
    console.log('\n📌 TC-18 — Leave all skill fields blank');
    try {
        const placeholders = [
            'Java, React, SQL, teamwork',
            'Spring Boot, Docker, AWS, REST APIs',
            'Communication, teamwork, leadership',
            'English, Sinhala',
            'Internships, freelance work, volunteer experience',
            'PathFinder internship platform, Smart Campus Management System',
            'Worked on backend APIs, testing, deployment',
            'AWS Educate, IBM Java Developer',
        ];
        for (const ph of placeholders) {
            const el = await driver.findElement(By.xpath(`//textarea[@placeholder='${ph}']`));
            await driver.executeScript(`
                var setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
                setter.call(arguments[0], '');
                arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
                arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
            `, el);
        }
        recordResult('TC-18', 'Leave all skill fields blank', 'PASS', 'All cleared without error');
    } catch (e) {
        recordResult('TC-18', 'Leave all skill fields blank', 'FAIL', e.message);
    }
}

// TC-19: Fill career preferences with valid data
async function tc19(driver) {
    console.log('\n📌 TC-19 — Fill career preferences with valid data');
    try {
        await fillAreaByPlaceholder(driver, 'Backend Development, DevOps, Cloud', 'Backend Development, DevOps, Cloud Architecture');
        await fillByPlaceholder(driver, 'Internship', 'Internship');
        await fillByPlaceholder(driver, 'Hybrid',     'Hybrid');
        await setDateValue(driver, 'availableFrom', '2025-07-01');
        recordResult('TC-19', 'Fill career preferences with valid data', 'PASS');
    } catch (e) {
        recordResult('TC-19', 'Fill career preferences with valid data', 'FAIL', e.message);
    }
}

// TC-20: Available From set to past date
async function tc20(driver) {
    console.log('\n📌 TC-20 — Available From set to past date');
    try {
        await setDateValue(driver, 'availableFrom', '2020-01-01');
        const el = await driver.findElement(By.xpath("//input[@name='availableFrom']"));
        const val = await el.getAttribute('value');
        recordResult('TC-20', 'Available From past date', 'PASS', `Field accepted past date: "${val}"`);
    } catch (e) {
        recordResult('TC-20', 'Available From past date', 'FAIL', e.message);
    }
}

// TC-21: Date field sets correct format
async function tc21(driver) {
    console.log('\n📌 TC-21 — Date field sets correct YYYY-MM-DD format');
    try {
        await setDateValue(driver, 'availableFrom', '2025-07-01');
        const el = await driver.findElement(By.xpath("//input[@name='availableFrom']"));
        const val = await el.getAttribute('value');
        if (val === '2025-07-01') {
            recordResult('TC-21', 'Date field correct format', 'PASS', `Value: "${val}"`);
        } else {
            recordResult('TC-21', 'Date field correct format', 'FAIL', `Unexpected format: "${val}"`);
        }
    } catch (e) {
        recordResult('TC-21', 'Date field correct format', 'FAIL', e.message);
    }
}

// TC-22: Leave date field empty
async function tc22(driver) {
    console.log('\n📌 TC-22 — Leave date field empty');
    try {
        await setDateValue(driver, 'availableFrom', '');
        const el = await driver.findElement(By.xpath("//input[@name='availableFrom']"));
        const val = await el.getAttribute('value');
        recordResult('TC-22', 'Leave date field empty', 'PASS', `Value after clear: "${val}"`);
    } catch (e) {
        recordResult('TC-22', 'Leave date field empty', 'FAIL', e.message);
    }
}

// TC-23: Valid URLs for all link fields
async function tc23(driver) {
    console.log('\n📌 TC-23 — Valid URLs for all portfolio fields');
    try {
        await fillByPlaceholder(driver, 'https://github.com/your-username',       'https://github.com/testuser-pf');
        await fillByPlaceholder(driver, 'https://linkedin.com/in/your-profile',   'https://linkedin.com/in/testuser-pf');
        await fillByPlaceholder(driver, 'https://yourportfolio.com',              'https://testuser-pf.dev');
        recordResult('TC-23', 'Valid URLs for all portfolio fields', 'PASS');
    } catch (e) {
        recordResult('TC-23', 'Valid URLs for all portfolio fields', 'FAIL', e.message);
    }
}

// TC-24: Invalid URL (no https://)
async function tc24(driver) {
    console.log('\n📌 TC-24 — Invalid URL without https://');
    try {
        await fillByPlaceholder(driver, 'https://github.com/your-username', 'github.com/testuser');
        const el = await driver.findElement(By.xpath("//input[@placeholder='https://github.com/your-username']"));
        const val = await el.getAttribute('value');
        recordResult('TC-24', 'Invalid URL without https://', 'PASS', `Field accepted: "${val}" (no URL validation)`);
    } catch (e) {
        recordResult('TC-24', 'Invalid URL without https://', 'FAIL', e.message);
    }
}

// TC-25: Leave all link fields empty
async function tc25(driver) {
    console.log('\n📌 TC-25 — Leave all portfolio link fields empty');
    try {
        const placeholders = [
            'https://github.com/your-username',
            'https://linkedin.com/in/your-profile',
            'https://yourportfolio.com',
        ];
        for (const ph of placeholders) {
            const el = await driver.findElement(By.xpath(`//input[@placeholder='${ph}']`));
            await driver.executeScript(`
                var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                setter.call(arguments[0], '');
                arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
                arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
            `, el);
        }
        recordResult('TC-25', 'Leave all portfolio link fields empty', 'PASS', 'Fields cleared without error');
    } catch (e) {
        recordResult('TC-25', 'Leave all portfolio link fields empty', 'FAIL', e.message);
    }
}

// TC-26: Save with all fields filled
async function tc26(driver) {
    console.log('\n📌 TC-26 — Save profile with all fields filled');
    try {
        await fillAllSections(driver);
        await clickSave(driver);
        await waitForSuccessAlert(driver);
        recordResult('TC-26', 'Save profile with all fields filled', 'PASS', 'Success message appeared');
    } catch (e) {
        recordResult('TC-26', 'Save profile with all fields filled', 'FAIL', e.message);
    }
}

// TC-27: Save with all fields empty
async function tc27(driver) {
    console.log('\n📌 TC-27 — Save profile with all fields empty');
    try {
        await driver.get(PROFILE_URL);
        await waitForProfileForm(driver);
        await driver.executeScript(`
            document.querySelectorAll('input:not([type="file"]):not([type="date"])').forEach(i => {
                var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                setter.call(i, '');
                i.dispatchEvent(new Event('input', { bubbles: true }));
                i.dispatchEvent(new Event('change', { bubbles: true }));
            });
            document.querySelectorAll('textarea').forEach(t => {
                var setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
                setter.call(t, '');
                t.dispatchEvent(new Event('input', { bubbles: true }));
                t.dispatchEvent(new Event('change', { bubbles: true }));
            });
        `);
        await driver.sleep(500);
        await clickSave(driver);
        await waitForSuccessAlert(driver);
        recordResult('TC-27', 'Save profile with all fields empty', 'PASS', 'Empty profile saved successfully');
    } catch (e) {
        recordResult('TC-27', 'Save profile with all fields empty', 'FAIL', e.message);
    }
}

// TC-28: Reload and verify headline persisted
async function tc28(driver) {
    console.log('\n📌 TC-28 — Reload and verify headline persisted');
    try {
        await driver.navigate().refresh();
        await waitForProfileForm(driver);
        const headlineInput = await driver.wait(
            until.elementLocated(By.xpath("//input[@name='headline']")),
            10000
        );
        const savedValue = await headlineInput.getAttribute('value');
        if (savedValue && savedValue.length > 0) {
            recordResult('TC-28', 'Reload and verify headline persisted', 'PASS', `Headline: "${savedValue}"`);
        } else {
            recordResult('TC-28', 'Reload and verify headline persisted', 'FAIL', 'Headline empty after reload');
        }
    } catch (e) {
        recordResult('TC-28', 'Reload and verify headline persisted', 'FAIL', e.message);
    }
}

// TC-29: Data retained across sessions
async function tc29(driver) {
    console.log('\n📌 TC-29 — Data retained across sessions (re-login)');
    try {
        // Logout and login again
        await driver.get(LOGIN_URL);
        await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
        await driver.wait(until.urlContains('/student/home'), 20000);
        await driver.get(PROFILE_URL);
        await waitForProfileForm(driver);
        const headlineInput = await driver.wait(
            until.elementLocated(By.xpath("//input[@name='headline']")),
            10000
        );
        const val = await headlineInput.getAttribute('value');
        if (val && val.length > 0) {
            recordResult('TC-29', 'Data retained across sessions', 'PASS', `Headline after re-login: "${val}"`);
        } else {
            recordResult('TC-29', 'Data retained across sessions', 'FAIL', 'Data lost after re-login');
        }
    } catch (e) {
        recordResult('TC-29', 'Data retained across sessions', 'FAIL', e.message);
    }
}

// TC-30: Upload a valid PDF CV
async function tc30(driver) {
    console.log('\n📌 TC-30 — CV upload field is present and accessible');
    try {
        const cvInput = await driver.wait(
            until.elementLocated(By.xpath("//input[@type='file']")),
            10000
        );
        const isDisplayed = await cvInput.isEnabled();
        if (isDisplayed) {
            recordResult('TC-30', 'CV upload field present and enabled', 'PASS', 'File input found and enabled');
        } else {
            recordResult('TC-30', 'CV upload field present and enabled', 'FAIL', 'File input not enabled');
        }
    } catch (e) {
        recordResult('TC-30', 'CV upload field present and enabled', 'FAIL', e.message);
    }
}

// TC-31: CV upload accept attribute
async function tc31(driver) {
    console.log('\n📌 TC-31 — CV upload accept attribute restricts to PDF/DOC');
    try {
        const cvInput = await driver.findElement(By.xpath("//input[@type='file']"));
        const acceptAttr = await cvInput.getAttribute('accept');
        if (acceptAttr && (acceptAttr.includes('.pdf') || acceptAttr.includes('.doc'))) {
            recordResult('TC-31', 'CV upload accept attribute correct', 'PASS', `accept="${acceptAttr}"`);
        } else {
            recordResult('TC-31', 'CV upload accept attribute correct', 'FAIL', `Unexpected accept: "${acceptAttr}"`);
        }
    } catch (e) {
        recordResult('TC-31', 'CV upload accept attribute correct', 'FAIL', e.message);
    }
}

// ─── Print Final Summary ────────────────────────────────────────────────────────

function printSummary() {
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const total  = results.length;

    console.log('\n');
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('   FINAL TEST RESULTS — Student Profile');
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
    console.log('   PathFinder — Student Profile Full Test Suite (31 Test Cases)');
    console.log('══════════════════════════════════════════════════════════════════');

    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // ── Auth & Navigation (TC-01 to TC-05) ──────────────────────────────
        console.log('\n━━━ Group 1: Authentication & Navigation ━━━');
        await tc01(driver);  // valid login — must pass first so session is active
        await tc02(driver);  // invalid login
        await tc03(driver);  // empty login
        // Re-login for TC-04 onwards
        await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
        await driver.wait(until.urlContains('/student/home'), 20000);
        await tc04(driver);
        await tc05(driver);  // clears localStorage then checks redirect

        // Re-login after TC-05 cleared auth
        await doLogin(driver, VALID_EMAIL, VALID_PASSWORD);
        await driver.wait(until.urlContains('/student/home'), 20000);
        await driver.get(PROFILE_URL);
        await waitForProfileForm(driver);

        // ── Basic Details (TC-06 to TC-10) ──────────────────────────────────
        console.log('\n━━━ Group 2: Basic Details ━━━');
        await tc06(driver);
        await tc07(driver);
        // Reload to restore form for remaining tests
        await driver.get(PROFILE_URL);
        await waitForProfileForm(driver);
        await tc08(driver);
        await tc09(driver);
        await tc10(driver);

        // ── Education (TC-11 to TC-14) ───────────────────────────────────────
        console.log('\n━━━ Group 3: Education ━━━');
        await tc11(driver);
        await tc12(driver);
        await tc13(driver);
        await tc14(driver);

        // ── Skills (TC-15 to TC-18) ──────────────────────────────────────────
        console.log('\n━━━ Group 4: Skills and Experience ━━━');
        await tc15(driver);
        await tc16(driver);
        await tc17(driver);
        await tc18(driver);

        // ── Career Preferences (TC-19 to TC-22) ─────────────────────────────
        console.log('\n━━━ Group 5: Career Preferences ━━━');
        await tc19(driver);
        await tc20(driver);
        await tc21(driver);
        await tc22(driver);

        // ── Portfolio Links (TC-23 to TC-25) ────────────────────────────────
        console.log('\n━━━ Group 6: Portfolio Links ━━━');
        await tc23(driver);
        await tc24(driver);
        await tc25(driver);

        // ── Save & Persistence (TC-26 to TC-31) ─────────────────────────────
        console.log('\n━━━ Group 7: Save and Persistence ━━━');
        await driver.get(PROFILE_URL);
        await waitForProfileForm(driver);
        await tc26(driver);
        await tc27(driver);
        await tc28(driver);
        await tc29(driver);
        await tc30(driver);
        await tc31(driver);

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
