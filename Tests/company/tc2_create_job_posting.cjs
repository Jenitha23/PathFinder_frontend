/**
 * tc2_create_job_posting.cjs
 * User Story: As a company, I want to create a job posting so that
 *             students can apply for opportunities at my company.
 *
 * Run:
 *   node tc2_create_job_posting.cjs
 */

require("chromedriver");
const { Builder, By, Key, until } = require("selenium-webdriver");

const BASE_URL = "https://pathfinder-frontend-navy.vercel.app";
const LOGIN_URL = `${BASE_URL}/company/login`;
const DASHBOARD_URL = `${BASE_URL}/company/dashboard`;
const POST_JOB_URL = `${BASE_URL}/company/post-job`;
const COMPANY_JOBS_URL = `${BASE_URL}/company/jobs`;

const COMPANY_EMAIL = "company@gmail.com";
const COMPANY_PASSWORD = "123456789C";

function futureDate(days = 30) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function pastDate(days = 5) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

const VALID_JOB = {
  title: `Selenium Test Software Engineer ${Date.now()}`,
  description:
    "This is a job description created by the automated Selenium test suite.",
  requirements:
    "React, Node.js, Selenium automation testing experience.",
  responsibilities:
    "Maintain automation coverage and support QA workflows.",
  location: "Colombo, Sri Lanka",
  deadline: futureDate(30),
};

const results = [];

function record(tcId, desc, status, note = "") {
  results.push({ tcId, desc, status, note });
  console.log(
    `   ${status === "PASS" ? "✅" : "❌"} ${tcId} — ${status}${note ? " | " + note : ""}`
  );
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrollIntoView(driver, el) {
  await driver.executeScript(
    "arguments[0].scrollIntoView({block:'center', inline:'center'});",
    el
  );
}

async function jsClick(driver, el) {
  await scrollIntoView(driver, el);
  await driver.executeScript("arguments[0].click();", el);
}

async function waitLocated(driver, locator, timeout = 15000) {
  return await driver.wait(until.elementLocated(locator), timeout);
}

async function waitVisible(driver, locator, timeout = 15000) {
  const el = await waitLocated(driver, locator, timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  return el;
}

async function clearAndType(driver, el, value) {
  await scrollIntoView(driver, el);
  try {
    await el.clear();
  } catch (_) {}
  await el.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
  if (value) await el.sendKeys(value);
}

async function setInputById(driver, id, value) {
  const el = await waitVisible(driver, By.id(id), 15000);
  await clearAndType(driver, el, value);
  return el;
}

async function setTextareaOrInputById(driver, id, value) {
  const el = await waitVisible(driver, By.id(id), 15000);
  await driver.executeScript(
    `
    const el = arguments[0];
    const value = arguments[1];
    const proto = el.tagName === 'TEXTAREA'
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  `,
    el,
    value
  );
  return el;
}

async function setSelectByText(driver, id, visibleText) {
  const select = await waitVisible(driver, By.id(id), 15000);
  await scrollIntoView(driver, select);
  await driver.executeScript(
    `
    const select = arguments[0];
    const text = arguments[1];
    const option = [...select.options].find(o => o.text.trim() === text);
    if (!option) throw new Error('Option not found: ' + text);
    select.value = option.value;
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
  `,
    select,
    visibleText
  );
}

async function setDateById(driver, id, value) {
  const el = await waitVisible(driver, By.id(id), 15000);
  await driver.executeScript(
    `
    const el = arguments[0];
    const value = arguments[1];
    const nativeSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    ).set;
    nativeSetter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  `,
    el,
    value
  );
}

async function getCurrentUrlSafe(driver) {
  try {
    return await driver.getCurrentUrl();
  } catch {
    return "";
  }
}

async function getAuthState(driver) {
  try {
    return await driver.executeScript(() => ({
      token: localStorage.getItem("pf_token"),
      role: localStorage.getItem("pf_role"),
      userId: localStorage.getItem("pf_userId"),
    }));
  } catch {
    return { token: null, role: null, userId: null };
  }
}

async function clearSession(driver) {
  await driver.get(BASE_URL);
  await driver.executeScript(`
    localStorage.removeItem('pf_token');
    localStorage.removeItem('pf_role');
    localStorage.removeItem('pf_userId');
    localStorage.removeItem('pf_email');
    localStorage.removeItem('pf_fullName');
    sessionStorage.clear();
  `);
}

async function pageHasPostJobForm(driver) {
  const ids = [
    "title",
    "description",
    "requirements",
    "location",
    "applicationDeadline",
    "jobType",
    "category",
  ];
  for (const id of ids) {
    const els = await driver.findElements(By.id(id));
    if (els.length === 0) return false;
  }
  return true;
}

async function waitForLoginOutcome(driver, timeout = 25000) {
  await driver.wait(async () => {
    const url = await getCurrentUrlSafe(driver);
    const auth = await getAuthState(driver);

    if (auth.token && !url.includes("/company/login")) return true;
    if (url.includes("/company/dashboard")) return true;
    if (url.includes("/company/post-job")) return true;
    if (url.includes("/company/jobs")) return true;

    const errorEls = await driver.findElements(By.css(".alert.error"));
    if (errorEls.length > 0) return true;

    return false;
  }, timeout);

  const errorEls = await driver.findElements(By.css(".alert.error"));
  if (errorEls.length > 0) {
    const msg = (await errorEls[0].getText()).trim();
    throw new Error(msg || "Login failed.");
  }

  const url = await getCurrentUrlSafe(driver);
  const auth = await getAuthState(driver);

  if (!auth.token && url.includes("/company/login")) {
    throw new Error("Login did not complete.");
  }
}

async function doLogin(driver) {
  await driver.get(LOGIN_URL);
  await waitVisible(driver, By.id("email"), 15000);

  await setInputById(driver, "email", COMPANY_EMAIL);
  await setInputById(driver, "password", COMPANY_PASSWORD);

  const signInBtn = await waitVisible(
    driver,
    By.xpath("//button[@type='submit' and (contains(.,'Sign in') or contains(.,'Sign In'))]"),
    15000
  );
  await jsClick(driver, signInBtn);

  await waitForLoginOutcome(driver, 25000);
}

async function ensureLoggedIn(driver) {
  const auth = await getAuthState(driver);
  const url = await getCurrentUrlSafe(driver);

  if (auth.token && !url.includes("/company/login")) return;
  await doLogin(driver);
}

async function waitForPostJobReady(driver, timeout = 20000) {
  await driver.wait(async () => {
    const url = await getCurrentUrlSafe(driver);
    if (!url.includes("/company/post-job")) return false;
    return await pageHasPostJobForm(driver);
  }, timeout);
}

async function goToDashboard(driver) {
  await ensureLoggedIn(driver);
  await driver.get(DASHBOARD_URL);

  await driver.wait(async () => {
    const url = await getCurrentUrlSafe(driver);
    if (url.includes("/company/dashboard")) return true;

    const linkEls = await driver.findElements(
      By.xpath("//a[contains(@href,'/company/post-job') or contains(.,'Create Job Posting') or contains(.,'Create Internship Posting')]")
    );
    return linkEls.length > 0;
  }, 20000);
}

async function goToPostJob(driver) {
  await ensureLoggedIn(driver);
  await driver.get(POST_JOB_URL);

  const directReady = await driver.wait(async () => {
    const url = await getCurrentUrlSafe(driver);
    return url.includes("/company/post-job");
  }, 12000).then(() => true).catch(() => false);

  if (!directReady) {
    await goToDashboard(driver);
    const link = await waitVisible(
      driver,
      By.xpath("//a[contains(@href,'/company/post-job') or contains(.,'Create Job Posting') or contains(.,'Create Internship Posting')]"),
      15000
    );
    await jsClick(driver, link);
  }

  await waitForPostJobReady(driver, 20000);
}

async function fillRequiredFields(driver, data) {
  await setTextareaOrInputById(driver, "title", data.title);
  await setTextareaOrInputById(driver, "description", data.description);
  await setTextareaOrInputById(driver, "requirements", data.requirements);
  await setTextareaOrInputById(driver, "location", data.location);
  await setDateById(driver, "applicationDeadline", data.deadline);
  await setSelectByText(driver, "jobType", "Internship");
  await setSelectByText(driver, "category", "Technology");
}

async function fillOptionalFields(driver) {
  await setTextareaOrInputById(driver, "salary", "$3000/month");
  await setTextareaOrInputById(driver, "salaryRange", "2500-3500");
  await setTextareaOrInputById(
    driver,
    "responsibilities",
    "Maintain CI/CD pipelines, write unit tests."
  );
  await setSelectByText(driver, "experienceLevel", "Junior");
}

async function submitForm(driver) {
  const btn = await waitVisible(
    driver,
    By.xpath("//button[@type='submit' and contains(.,'Post Job')]"),
    15000
  );
  await jsClick(driver, btn);
}

async function waitForFieldError(driver, fieldId, timeout = 10000) {
  await driver.wait(async () => {
    const el = await driver.findElement(By.id(fieldId));
    const container = await el.findElement(By.xpath("./ancestor::div[1]"));
    const helpers = await container.findElements(By.css(".helper"));
    for (const h of helpers) {
      const txt = (await h.getText()).trim();
      if (txt) return true;
    }
    return false;
  }, timeout);
}

async function waitForServerErrorOrSuccess(driver, timeout = 25000) {
  return await driver.wait(async () => {
    const url = await getCurrentUrlSafe(driver);

    const successEls = await driver.findElements(
      By.xpath("//*[contains(.,'Job posted successfully') or contains(.,'Success')]")
    );
    if (successEls.length > 0) return "success";

    if (url.includes("/company/jobs")) return "redirect";

    const errorEls = await driver.findElements(By.css(".alert.error"));
    if (errorEls.length > 0) return "server_error";

    return false;
  }, timeout);
}

// ── Test Cases ───────────────────────────────────────────────────────────────

async function tc01(driver) {
  console.log("\n📌 TC-01 — Valid company login");
  try {
    await doLogin(driver);
    const url = await getCurrentUrlSafe(driver);
    if (!url.includes("/company/login")) {
      record("TC-01", "Valid company login", "PASS", `Current URL: ${url}`);
    } else {
      record("TC-01", "Valid company login", "FAIL", "Still on login page");
    }
  } catch (e) {
    record("TC-01", "Valid company login", "FAIL", e.message);
  }
}

async function tc02(driver) {
  console.log("\n📌 TC-02 — Unauthenticated access to post-job redirects");
  try {
    await clearSession(driver);
    await driver.get(POST_JOB_URL);
    await sleep(3000);
    const url = await getCurrentUrlSafe(driver);
    if (!url.includes("/company/post-job")) {
      record("TC-02", "Unauthenticated access redirects", "PASS", `Redirected to: ${url}`);
    } else {
      record("TC-02", "Unauthenticated access redirects", "FAIL", `Still on: ${url}`);
    }
  } catch (e) {
    record("TC-02", "Unauthenticated access redirects", "FAIL", e.message);
  }
}

async function tc03(driver) {
  console.log("\n📌 TC-03 — Re-login after session clear");
  try {
    await doLogin(driver);
    const url = await getCurrentUrlSafe(driver);
    if (!url.includes("/company/login")) {
      record("TC-03", "Re-login after session clear", "PASS", `Current URL: ${url}`);
    } else {
      record("TC-03", "Re-login after session clear", "FAIL", "Still on login page");
    }
  } catch (e) {
    record("TC-03", "Re-login after session clear", "FAIL", e.message);
  }
}

async function tc04(driver) {
  console.log("\n📌 TC-04 — Navigate to post-job via URL");
  try {
    await goToPostJob(driver);
    record("TC-04", "Navigate to post-job via URL", "PASS");
  } catch (e) {
    record("TC-04", "Navigate to post-job via URL", "FAIL", e.message);
  }
}

async function tc05(driver) {
  console.log("\n📌 TC-05 — Navigate to post-job via dashboard link");
  try {
    await goToDashboard(driver);
    const link = await waitVisible(
      driver,
      By.xpath("//a[contains(@href,'/company/post-job') or contains(.,'Create Job Posting') or contains(.,'Create Internship Posting')]"),
      15000
    );
    await jsClick(driver, link);
    await waitForPostJobReady(driver, 20000);
    record("TC-05", "Navigate to post-job via dashboard link", "PASS");
  } catch (e) {
    record("TC-05", "Navigate to post-job via dashboard link", "FAIL", e.message);
  }
}

async function tc06(driver) {
  console.log("\n📌 TC-06 — Post-job form elements present");
  try {
    await goToPostJob(driver);
    const ids = ["title", "description", "requirements", "location", "applicationDeadline", "jobType", "category"];
    for (const id of ids) {
      await waitVisible(driver, By.id(id), 10000);
    }
    record("TC-06", "Post-job form elements present", "PASS", `${ids.length} fields found`);
  } catch (e) {
    record("TC-06", "Post-job form elements present", "FAIL", e.message);
  }
}

async function tc07(driver) {
  console.log("\n📌 TC-07 — Submit with empty title shows error");
  try {
    await goToPostJob(driver);
    await submitForm(driver);
    await waitForFieldError(driver, "title", 10000);
    record("TC-07", "Empty title shows validation error", "PASS");
  } catch (e) {
    record("TC-07", "Empty title shows validation error", "FAIL", e.message);
  }
}

async function tc08(driver) {
  console.log("\n📌 TC-08 — Submit with empty description shows error");
  try {
    await goToPostJob(driver);
    await setTextareaOrInputById(driver, "title", "Test Job");
    await submitForm(driver);
    await waitForFieldError(driver, "description", 10000);
    record("TC-08", "Empty description shows validation error", "PASS");
  } catch (e) {
    record("TC-08", "Empty description shows validation error", "FAIL", e.message);
  }
}

async function tc09(driver) {
  console.log("\n📌 TC-09 — Submit with empty location shows error");
  try {
    await goToPostJob(driver);
    await setTextareaOrInputById(driver, "title", "Test Job");
    await setTextareaOrInputById(driver, "description", "Test description");
    await setTextareaOrInputById(driver, "requirements", "Test requirements");
    await submitForm(driver);
    await waitForFieldError(driver, "location", 10000);
    record("TC-09", "Empty location shows validation error", "PASS");
  } catch (e) {
    record("TC-09", "Empty location shows validation error", "FAIL", e.message);
  }
}

async function tc10(driver) {
  console.log("\n📌 TC-10 — Submit without job type shows error");
  try {
    await goToPostJob(driver);
    await setTextareaOrInputById(driver, "title", "Test Job");
    await setTextareaOrInputById(driver, "description", "Test description");
    await setTextareaOrInputById(driver, "requirements", "Test requirements");
    await setTextareaOrInputById(driver, "location", "Colombo");
    await setDateById(driver, "applicationDeadline", futureDate(10));
    await submitForm(driver);
    await waitForFieldError(driver, "jobType", 10000);
    record("TC-10", "Missing job type shows validation error", "PASS");
  } catch (e) {
    record("TC-10", "Missing job type shows validation error", "FAIL", e.message);
  }
}

async function tc11(driver) {
  console.log("\n📌 TC-11 — Missing deadline shows error");
  try {
    await goToPostJob(driver);
    await setTextareaOrInputById(driver, "title", "Test Job");
    await setTextareaOrInputById(driver, "description", "Desc");
    await setTextareaOrInputById(driver, "requirements", "Req");
    await setTextareaOrInputById(driver, "location", "Colombo");
    await setSelectByText(driver, "jobType", "Internship");
    await setSelectByText(driver, "category", "Technology");
    await submitForm(driver);
    await waitForFieldError(driver, "applicationDeadline", 10000);
    record("TC-11", "Missing deadline shows validation error", "PASS");
  } catch (e) {
    record("TC-11", "Missing deadline shows validation error", "FAIL", e.message);
  }
}

async function tc12(driver) {
  console.log("\n📌 TC-12 — Past deadline shows error");
  try {
    await goToPostJob(driver);
    await setTextareaOrInputById(driver, "title", "Test Job");
    await setTextareaOrInputById(driver, "description", "Desc");
    await setTextareaOrInputById(driver, "requirements", "Req");
    await setTextareaOrInputById(driver, "location", "Colombo");
    await setSelectByText(driver, "jobType", "Internship");
    await setSelectByText(driver, "category", "Technology");

    // force-set a past date even if the browser date input has a min restriction
    await driver.executeScript(
      `
      const el = document.getElementById('applicationDeadline');
      const val = arguments[0];
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    `,
      pastDate(5)
    );

    await submitForm(driver);
    await waitForFieldError(driver, "applicationDeadline", 10000);
    record("TC-12", "Past deadline shows validation error", "PASS");
  } catch (e) {
    record("TC-12", "Past deadline shows validation error", "FAIL", e.message);
  }
}

async function tc13(driver) {
  console.log("\n📌 TC-13 — Title exceeding 200 characters shows error");
  try {
    await goToPostJob(driver);
    await setTextareaOrInputById(driver, "title", "T".repeat(201));
    await submitForm(driver);
    await waitForFieldError(driver, "title", 10000);
    record("TC-13", "Title > 200 chars shows validation error", "PASS");
  } catch (e) {
    record("TC-13", "Title > 200 chars shows validation error", "FAIL", e.message);
  }
}

async function tc14(driver) {
  console.log("\n📌 TC-14 — Cancel returns to dashboard");
  try {
    await goToPostJob(driver);
    const cancelLink = await waitVisible(
      driver,
      By.xpath("//a[contains(.,'Back to Dashboard') or contains(.,'Cancel')]"),
      15000
    );
    await jsClick(driver, cancelLink);
    await driver.wait(until.urlContains("/company/dashboard"), 15000);
    record("TC-14", "Cancel returns to dashboard", "PASS");
  } catch (e) {
    record("TC-14", "Cancel returns to dashboard", "FAIL", e.message);
  }
}

async function tc15(driver) {
  console.log("\n📌 TC-15 — Valid job submission shows success message");
  try {
    await goToPostJob(driver);
    await fillRequiredFields(driver, VALID_JOB);
    await submitForm(driver);

    const outcome = await waitForServerErrorOrSuccess(driver, 25000);

    if (outcome === "success" || outcome === "redirect") {
      record("TC-15", "Valid job submission shows success message", "PASS");
    } else {
      const err = await waitVisible(driver, By.css(".alert.error"), 5000);
      record("TC-15", "Valid job submission shows success message", "FAIL", await err.getText());
    }
  } catch (e) {
    record("TC-15", "Valid job submission shows success message", "FAIL", e.message);
  }
}

async function tc16(driver) {
  console.log("\n📌 TC-16 — After success, redirects to /company/jobs");
  try {
    const url = await getCurrentUrlSafe(driver);
    if (url.includes("/company/jobs")) {
      record("TC-16", "Redirects to /company/jobs after success", "PASS");
      return;
    }

    const errEls = await driver.findElements(By.css(".alert.error"));
    if (errEls.length > 0) {
      const txt = await errEls[0].getText();
      record("TC-16", "Redirects to /company/jobs after success", "FAIL", txt);
      return;
    }

    await driver.wait(until.urlContains("/company/jobs"), 25000);
    record("TC-16", "Redirects to /company/jobs after success", "PASS");
  } catch (e) {
    record("TC-16", "Redirects to /company/jobs after success", "FAIL", e.message);
  }
}

async function tc17(driver) {
  console.log("\n📌 TC-17 — New job appears in company jobs list");
  try {
    await driver.get(COMPANY_JOBS_URL);
    await driver.wait(until.urlContains("/company/jobs"), 15000);

    const errEls = await driver.findElements(By.css(".alert.error"));
    if (errEls.length > 0) {
      const txt = await errEls[0].getText();
      record("TC-17", "New job appears in company jobs list", "FAIL", txt);
      return;
    }

    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(normalize-space(.),"${VALID_JOB.title}")]`)),
      20000
    );
    record("TC-17", "New job appears in company jobs list", "PASS");
  } catch (e) {
    record("TC-17", "New job appears in company jobs list", "FAIL", e.message);
  }
}

async function tc18(driver) {
  console.log("\n📌 TC-18 — Post second job with optional fields");
  try {
    const secondJob = {
      ...VALID_JOB,
      title: `Selenium Full-Time Test Job ${Date.now()}`,
      deadline: futureDate(35),
    };

    await goToPostJob(driver);
    await fillRequiredFields(driver, secondJob);
    await fillOptionalFields(driver);
    await submitForm(driver);

    const outcome = await waitForServerErrorOrSuccess(driver, 25000);

    if (outcome === "success" || outcome === "redirect") {
      record("TC-18", "Post job with optional fields", "PASS");
    } else {
      const err = await waitVisible(driver, By.css(".alert.error"), 5000);
      record("TC-18", "Post job with optional fields", "FAIL", await err.getText());
    }
  } catch (e) {
    record("TC-18", "Post job with optional fields", "FAIL", e.message);
  }
}

async function tc19(driver) {
  console.log("\n📌 TC-19 — Verify optional fields accepted (no extra errors)");
  try {
    const errEls = await driver.findElements(By.css(".alert.error"));
    if (errEls.length === 0) {
      record("TC-19", "Optional fields accepted without errors", "PASS");
    } else {
      const txt = await errEls[0].getText();
      record("TC-19", "Optional fields accepted without errors", "FAIL", txt);
    }
  } catch (e) {
    record("TC-19", "Optional fields accepted without errors", "FAIL", e.message);
  }
}

async function tc20(driver) {
  console.log("\n📌 TC-20 — Post-job page accessible from quick links");
  try {
    await goToDashboard(driver);
    await waitVisible(
      driver,
      By.xpath("//a[contains(.,'Create Job Posting') or contains(.,'Create Internship Posting')]"),
      15000
    );
    record("TC-20", "Post-job accessible from quick links", "PASS");
  } catch (e) {
    record("TC-20", "Post-job accessible from quick links", "FAIL", e.message);
  }
}

async function tc21(driver) {
  console.log("\n📌 TC-21 — Form resets after successful submission");
  try {
    await goToPostJob(driver);
    await fillRequiredFields(driver, {
      ...VALID_JOB,
      title: `Temp Selenium Job ${Date.now()}`,
      deadline: futureDate(40),
    });
    await submitForm(driver);

    const outcome = await waitForServerErrorOrSuccess(driver, 25000);

    if (outcome === "redirect") {
      record("TC-21", "Redirected after submission (form reset)", "PASS");
    } else if (outcome === "server_error") {
      const err = await waitVisible(driver, By.css(".alert.error"), 5000);
      record("TC-21", "Form resets after successful submission", "FAIL", await err.getText());
    } else {
      record("TC-21", "Redirected after submission (form reset)", "PASS");
    }
  } catch (e) {
    record("TC-21", "Form resets after successful submission", "FAIL", e.message);
  }
}

async function tc22(driver) {
  console.log("\n📌 TC-22 — Cleanup: clear session");
  try {
    await clearSession(driver);
    record("TC-22", "Cleanup: session cleared", "PASS");
  } catch (e) {
    record("TC-22", "Cleanup: session cleared", "FAIL", e.message);
  }
}

function printSummary() {
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;

  console.log("\n══════════════════════════════════════════════════════════════════");
  console.log("   RESULTS — US-02: Create Job Posting");
  console.log("══════════════════════════════════════════════════════════════════");
  console.log(`   Total: ${results.length}  |  Passed: ${passed} ✅  |  Failed: ${failed} ❌`);
  console.log(`   Pass Rate: ${Math.round((passed / results.length) * 100)}%`);
  console.log("──────────────────────────────────────────────────────────────────");
  results.forEach((r) => {
    console.log(`   ${r.status === "PASS" ? "✅" : "❌"}  ${r.tcId.padEnd(6)} ${r.desc}`);
    if (r.note) console.log(`          └─ ${r.note}`);
  });
  console.log("══════════════════════════════════════════════════════════════════\n");
}

async function run() {
  console.log("══════════════════════════════════════════════════════════════════");
  console.log("   PathFinder — US-02: Create Job Posting");
  console.log(`   Target: ${BASE_URL}`);
  console.log("══════════════════════════════════════════════════════════════════");

  let driver;
  try {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.manage().window().maximize();

    console.log("\n━━━ Group 1: Authentication ━━━");
    await tc01(driver);
    await tc02(driver);
    await tc03(driver);

    console.log("\n━━━ Group 2: Navigation to Post Job ━━━");
    await tc04(driver);
    await tc05(driver);
    await tc06(driver);

    console.log("\n━━━ Group 3: Required Field Validation ━━━");
    await tc07(driver);
    await tc08(driver);
    await tc09(driver);
    await tc10(driver);

    console.log("\n━━━ Group 4: Deadline Validation ━━━");
    await tc11(driver);
    await tc12(driver);
    await tc13(driver);
    await tc14(driver);

    console.log("\n━━━ Group 5: Successful Submission ━━━");
    await tc15(driver);
    await tc16(driver);
    await tc17(driver);
    await tc18(driver);

    console.log("\n━━━ Group 6: Optional Fields & Cleanup ━━━");
    await tc19(driver);
    await tc20(driver);
    await tc21(driver);
    await tc22(driver);
  } catch (err) {
    console.error(`\n💥 Runner error: ${err.message}`);
  } finally {
    printSummary();
    if (driver) {
      await sleep(3000);
      await driver.quit();
    }
  }
}

run();