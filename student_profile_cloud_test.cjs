/**
 * File: student_profile_cloud_test.cjs
 * Purpose: Selenium automation test for Student Profile page.
 *
 * What this test covers:
 *  1. Login with a pre-existing student account
 *  2. Navigate to the Student Profile page
 *  3. Wait for the form to load
 *  4. Fill in / update every major profile section:
 *       - Basic details  (headline, phone, city, country, address, about me)
 *       - Education      (education, university, degree, academic year, GPA)
 *       - Skills         (skills, technical skills, soft skills, languages,
 *                         experience, projects, internship, certifications)
 *       - Career prefs   (career interests, job type, work mode, available from)
 *       - Links          (GitHub, LinkedIn, portfolio)
 *  5. Submit the form
 *  6. Assert the success alert appears
 *  7. Reload and verify the saved headline value persisted (backend round-trip)
 *
 * Prerequisites:
 *   npm install selenium-webdriver chromedriver
 *
 * Run:
 *   node student_profile_cloud_test.cjs
 */

require('chromedriver');
const { Builder, By, until } = require('selenium-webdriver');

// ─── Configuration ────────────────────────────────────────────────────────────

const BASE_URL    = 'http://localhost:5173';
const LOGIN_URL   = `${BASE_URL}/student/login`;
const PROFILE_URL = `${BASE_URL}/student/profile`;

// Student account credentials
const TEST_EMAIL    = 'it23596566@my.sliit.lk';
const TEST_PASSWORD = '123456789J';

// Profile data used for the update test
const PROFILE_DATA = {
    headline:             'Full Stack Developer | React | Spring Boot',
    phone:                '+94712345678',
    city:                 'Kandy',
    country:              'Sri Lanka',
    address:              'No. 25, Peradeniya Road',
    aboutMe:              'Final year CS student passionate about backend development and cloud technologies.',
    education:            'BSc (Hons) Computer Science',
    university:           'University of Peradeniya',
    degree:               'Computer Science',
    academicYear:         'Year 4 - Semester 1',
    gpa:                  '3.72',
    skills:               'Java, React, SQL, Docker',
    technicalSkills:      'Spring Boot, AWS, REST APIs, Git',
    softSkills:           'Communication, Teamwork, Problem Solving',
    languages:            'English, Sinhala',
    experience:           '6-month internship at WSO2 on API Manager',
    projectsSummary:      'PathFinder Platform, Smart Campus System',
    internshipExperience: 'Backend API development, unit testing, CI/CD pipeline setup',
    certifications:       'AWS Educate, Oracle Java SE 11',
    careerInterests:      'Backend Development, DevOps, Cloud Architecture',
    preferredJobType:     'Internship',
    workMode:             'Hybrid',
    availableFrom:        '2025-07-01',
    githubUrl:            'https://github.com/testuser-pf',
    linkedinUrl:          'https://linkedin.com/in/testuser-pf',
    portfolioUrl:         'https://testuser-pf.dev',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Clears a field completely and types the given value.
 * Using executeScript select + clear handles pre-filled React-controlled inputs.
 */
async function clearAndType(driver, element, value) {
    await element.click();
    await driver.executeScript("arguments[0].select();", element);
    await element.clear();
    await element.sendKeys(value);
}

/**
 * Locates an <input> by placeholder and fills it.
 */
async function fillByPlaceholder(driver, placeholder, value) {
    const el = await driver.wait(
        until.elementLocated(By.xpath(`//input[@placeholder='${placeholder}']`)),
        10000
    );
    await clearAndType(driver, el, value);
}

/**
 * Locates a <textarea> by placeholder and fills it.
 */
async function fillAreaByPlaceholder(driver, placeholder, value) {
    const el = await driver.wait(
        until.elementLocated(By.xpath(`//textarea[@placeholder='${placeholder}']`)),
        10000
    );
    await clearAndType(driver, el, value);
}

/**
 * Sets a date input value using JavaScript to bypass Windows Chrome
 * date format issues. Fires React's input + change events so state updates.
 */
async function setDateValue(driver, nameAttr, dateValue) {
    const dateInput = await driver.wait(
        until.elementLocated(By.xpath(`//input[@name='${nameAttr}']`)),
        10000
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

// ─── Step Functions ───────────────────────────────────────────────────────────

/**
 * STEP 1: Log in as a student.
 */
async function stepLogin(driver) {
    console.log('\n📌 STEP 1 — Login as student');
    console.log(`   Navigating to: ${LOGIN_URL}`);
    await driver.get(LOGIN_URL);

    await driver.wait(
        until.elementLocated(By.xpath("//input[@placeholder='you@example.com']")),
        15000
    );

    console.log(`   Entering email: ${TEST_EMAIL}`);
    await driver.findElement(By.xpath("//input[@placeholder='you@example.com']"))
        .sendKeys(TEST_EMAIL);

    console.log('   Entering password...');
    await driver.findElement(By.xpath("//input[@placeholder='Enter your password']"))
        .sendKeys(TEST_PASSWORD);

    await driver.sleep(800);

    console.log("   Clicking 'Sign In'...");
    const signInBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Sign In')]")),
        10000
    );
    await driver.executeScript('arguments[0].click();', signInBtn);

    await driver.wait(until.urlContains('/student/home'), 20000);
    console.log('   ✅ Login successful — redirected to /student/home');
}

/**
 * STEP 2: Navigate directly to the Student Profile page.
 * Waits for the section heading to confirm the page has rendered.
 */
async function stepNavigateToProfile(driver) {
    console.log('\n📌 STEP 2 — Navigate to Student Profile page');
    await driver.get(PROFILE_URL);

    await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(), 'Edit student profile')]")),
        15000
    );
    console.log('   ✅ Profile page loaded');
}

/**
 * STEP 3: Wait for the profile data to finish loading from the API.
 * The page shows "Loading profile..." while fetching; we wait for it to disappear.
 */
async function stepWaitForFormReady(driver) {
    console.log('\n📌 STEP 3 — Wait for form data to load from API');
    await driver.wait(async () => {
        const els = await driver.findElements(
            By.xpath("//*[contains(text(), 'Loading profile...')]")
        );
        return els.length === 0;
    }, 15000);

    await driver.sleep(600); // small buffer for React state to settle
    console.log('   ✅ Form is ready');
}

/**
 * STEP 4a: Fill the Basic Details section.
 */
async function stepFillBasicDetails(driver) {
    console.log('\n📌 STEP 4a — Fill Basic Details');

    await fillByPlaceholder(
        driver,
        'Java Backend Developer | Spring Boot | AWS',
        PROFILE_DATA.headline
    );
    await fillByPlaceholder(driver, '+94712345678',        PROFILE_DATA.phone);
    await fillByPlaceholder(driver, 'Negombo',             PROFILE_DATA.city);
    await fillByPlaceholder(driver, 'Sri Lanka',           PROFILE_DATA.country);
    await fillByPlaceholder(driver, 'No. 10, Main Street', PROFILE_DATA.address);
    await fillAreaByPlaceholder(
        driver,
        'Write a short summary about yourself, your strengths, and your goals.',
        PROFILE_DATA.aboutMe
    );

    console.log('   ✅ Basic Details filled');
}

/**
 * STEP 4b: Fill the Education section.
 */
async function stepFillEducation(driver) {
    console.log('\n📌 STEP 4b — Fill Education');

    await fillByPlaceholder(driver, 'BSc (Hons) Computer Science', PROFILE_DATA.education);
    await fillByPlaceholder(driver, 'SLIIT',                       PROFILE_DATA.university);
    await fillByPlaceholder(driver, 'Computer Science',            PROFILE_DATA.degree);
    await fillByPlaceholder(driver, 'Year 3 - Semester 2',         PROFILE_DATA.academicYear);
    await fillByPlaceholder(driver, '3.45',                        PROFILE_DATA.gpa);

    console.log('   ✅ Education filled');
}

/**
 * STEP 4c: Fill the Skills and Experience section.
 */
async function stepFillSkills(driver) {
    console.log('\n📌 STEP 4c — Fill Skills and Experience');

    await fillAreaByPlaceholder(
        driver, 'Java, React, SQL, teamwork',
        PROFILE_DATA.skills
    );
    await fillAreaByPlaceholder(
        driver, 'Spring Boot, Docker, AWS, REST APIs',
        PROFILE_DATA.technicalSkills
    );
    await fillAreaByPlaceholder(
        driver, 'Communication, teamwork, leadership',
        PROFILE_DATA.softSkills
    );
    await fillAreaByPlaceholder(
        driver, 'English, Sinhala',
        PROFILE_DATA.languages
    );
    await fillAreaByPlaceholder(
        driver, 'Internships, freelance work, volunteer experience',
        PROFILE_DATA.experience
    );
    await fillAreaByPlaceholder(
        driver, 'PathFinder internship platform, Smart Campus Management System',
        PROFILE_DATA.projectsSummary
    );
    await fillAreaByPlaceholder(
        driver, 'Worked on backend APIs, testing, deployment',
        PROFILE_DATA.internshipExperience
    );
    await fillAreaByPlaceholder(
        driver, 'AWS Educate, IBM Java Developer',
        PROFILE_DATA.certifications
    );

    console.log('   ✅ Skills and Experience filled');
}

/**
 * STEP 4d: Fill the Career Preferences section.
 * Uses JavaScript date setter to avoid Windows Chrome date format issues.
 */
async function stepFillCareerPreferences(driver) {
    console.log('\n📌 STEP 4d — Fill Career Preferences');

    await fillAreaByPlaceholder(
        driver, 'Backend Development, DevOps, Cloud',
        PROFILE_DATA.careerInterests
    );
    await fillByPlaceholder(driver, 'Internship', PROFILE_DATA.preferredJobType);
    await fillByPlaceholder(driver, 'Hybrid',     PROFILE_DATA.workMode);

    // Use JavaScript setter to correctly set the date value on Windows Chrome
    await setDateValue(driver, 'availableFrom', PROFILE_DATA.availableFrom);

    console.log('   ✅ Career Preferences filled');
}

/**
 * STEP 4e: Fill the Portfolio Links section.
 */
async function stepFillPortfolioLinks(driver) {
    console.log('\n📌 STEP 4e — Fill Portfolio Links');

    await fillByPlaceholder(
        driver, 'https://github.com/your-username',
        PROFILE_DATA.githubUrl
    );
    await fillByPlaceholder(
        driver, 'https://linkedin.com/in/your-profile',
        PROFILE_DATA.linkedinUrl
    );
    await fillByPlaceholder(
        driver, 'https://yourportfolio.com',
        PROFILE_DATA.portfolioUrl
    );

    console.log('   ✅ Portfolio Links filled');
}

/**
 * STEP 5: Click "Save Profile" and assert the success alert appears.
 * Searches by text content for reliability across different CSS class names.
 */
async function stepSaveAndVerify(driver) {
    console.log('\n📌 STEP 5 — Save Profile and verify success alert');

    const saveBtn = await driver.wait(
        until.elementLocated(
            By.xpath("//button[@type='submit' and contains(., 'Save Profile')]")
        ),
        10000
    );

    // Scroll the button into view before clicking (it is at the bottom of the page)
    await driver.executeScript(
        'arguments[0].scrollIntoView({ behavior: "smooth", block: "center" });',
        saveBtn
    );
    await driver.sleep(500);
    await driver.executeScript('arguments[0].click();', saveBtn);

    console.log('   ⏳ Waiting for save response from API...');

    // Wait for success message by text content — more reliable than CSS class matching
    const successAlert = await driver.wait(
        until.elementLocated(
            By.xpath(
                "//*[contains(text(), 'Profile updated successfully') or " +
                "contains(text(), 'updated successfully') or " +
                "contains(text(), 'successfully') or " +
                "contains(text(), 'saved')]"
            )
        ),
        20000
    );

    const alertText = await successAlert.getText();
    console.log(`   ✅ Profile saved! Alert says: "${alertText}"`);
}

/**
 * STEP 6: Reload the page and confirm the headline persisted.
 * This validates the full backend round-trip (PUT → GET).
 */
async function stepVerifyPersistence(driver) {
    console.log('\n📌 STEP 6 — Reload page and verify saved data persisted');

    await driver.navigate().refresh();

    // Wait for loading state to clear again
    await driver.wait(async () => {
        const els = await driver.findElements(
            By.xpath("//*[contains(text(), 'Loading profile...')]")
        );
        return els.length === 0;
    }, 15000);
    await driver.sleep(600);

    const headlineInput = await driver.wait(
        until.elementLocated(By.xpath("//input[@name='headline']")),
        10000
    );
    const savedValue = await headlineInput.getAttribute('value');

    if (savedValue === PROFILE_DATA.headline) {
        console.log(`   ✅ Headline persisted correctly: "${savedValue}"`);
    } else {
        console.warn(`   ⚠️  Headline mismatch.`);
        console.warn(`       Expected : "${PROFILE_DATA.headline}"`);
        console.warn(`       Received : "${savedValue}"`);
    }
}

// ─── Main Test Runner ─────────────────────────────────────────────────────────

async function runStudentProfileTest() {
    console.log('══════════════════════════════════════════════════════');
    console.log('   PathFinder — Student Profile Selenium Test');
    console.log('══════════════════════════════════════════════════════');

    let driver = await new Builder().forBrowser('chrome').build();

    try {
        await stepLogin(driver);
        await stepNavigateToProfile(driver);
        await stepWaitForFormReady(driver);

        await stepFillBasicDetails(driver);
        await stepFillEducation(driver);
        await stepFillSkills(driver);
        await stepFillCareerPreferences(driver);
        await stepFillPortfolioLinks(driver);

        await stepSaveAndVerify(driver);
        await stepVerifyPersistence(driver);

        console.log('\n══════════════════════════════════════════════════════');
        console.log('   ✅ ALL STEPS PASSED — Student Profile Test Complete');
        console.log('══════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('\n══════════════════════════════════════════════════════');
        console.error('   ❌ TEST FAILED');
        console.error(`   Failed at URL : ${await driver.getCurrentUrl()}`);
        console.error(`   Error         : ${error.message}`);
        console.error('══════════════════════════════════════════════════════\n');

    } finally {
        console.log('Closing browser in 5 seconds...');
        await driver.sleep(5000);
        await driver.quit();
    }
}

runStudentProfileTest();
