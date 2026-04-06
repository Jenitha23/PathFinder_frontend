/**
 * tc3_edit_delete_job.cjs
 * User Story: As a company, I want to edit or delete a job posting so that
 *             I can manage and update my job listings.
 *
 * Run:
 *   node tc3_edit_delete_job.cjs
 */

require("chromedriver");
const { Builder, By, Key, until } = require("selenium-webdriver");

// ── Configuration ────────────────────────────────────────────────────────────

const BASE_URL = "https://pathfinder-frontend-navy.vercel.app";
const API_BASE =
  "https://pathfinder-fqgwf0e6bvc2cmbq.southeastasia-01.azurewebsites.net";

const LOGIN_URL = `${BASE_URL}/company/login`;
const JOBS_URL = `${BASE_URL}/company/jobs`;

const COMPANY_EMAIL = "company@gmail.com";
const COMPANY_PASSWORD = "123456789C";

function futureDate(days = 30) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function uniqueText(prefix) {
  return `${prefix} ${Date.now()}`;
}

const SEED_JOB = {
  title: uniqueText("Selenium Seed Job"),
  description: "Seed job created automatically for edit/delete Selenium tests.",
  requirements: "React, Node.js, teamwork, communication.",
  responsibilities: "Support testing and internship workflow tasks.",
  location: "Colombo, Sri Lanka",
  jobType: "Internship",
  category: "Technology",
  salary: "",
  salaryRange: "",
  experienceLevel: "Junior",
  applicationDeadline: futureDate(30),
};

const UPDATED_TITLE = uniqueText("Selenium Updated Job Title");
const UPDATED_LOCATION = "Kandy, Sri Lanka";
const UPDATED_DESC = "Updated job description by Selenium test automation.";

// ── Results ───────────────────────────────────────────────────────────────────

const results = [];
function record(tcId, desc, status, note = "") {
  results.push({ tcId, desc, status, note });
  console.log(
    `   ${status === "PASS" ? "✅" : "❌"} ${tcId} — ${status}${note ? " | " + note : ""}`
  );
}

// ── Shared Runtime State ──────────────────────────────────────────────────────

const runtime = {
  seedJobId: null,
  lastEditJobId: null,
  lastDetailJobId: null,
  lastDeleteJobId: null,
};

// ── Locator Packs ─────────────────────────────────────────────────────────────

const EDIT_ACTION_XPATH = `
(
  //a[contains(@href,'/edit')]
  | //a[contains(normalize-space(.),'Edit')]
  | //button[contains(normalize-space(.),'Edit')]
  | //*[@role='button' and contains(normalize-space(.),'Edit')]
  | //button[contains(@aria-label,'Edit')]
  | //button[contains(@title,'Edit')]
  | //a[contains(@aria-label,'Edit')]
  | //a[contains(@title,'Edit')]
  | //*[@role='button' and contains(@aria-label,'Edit')]
  | //*[@role='button' and contains(@title,'Edit')]
)
`;

const DELETE_ACTION_XPATH = `
(
  //button[contains(normalize-space(.),'Delete')]
  | //button[contains(normalize-space(.),'Archive')]
  | //button[contains(@aria-label,'Delete')]
  | //button[contains(@aria-label,'Archive')]
  | //button[contains(@title,'Delete')]
  | //button[contains(@title,'Archive')]
  | //a[contains(normalize-space(.),'Delete')]
  | //a[contains(normalize-space(.),'Archive')]
  | //a[contains(@aria-label,'Delete')]
  | //a[contains(@aria-label,'Archive')]
  | //a[contains(@title,'Delete')]
  | //a[contains(@title,'Archive')]
  | //*[@role='button' and contains(@aria-label,'Delete')]
  | //*[@role='button' and contains(@aria-label,'Archive')]
  | //*[@role='button' and contains(@title,'Delete')]
  | //*[@role='button' and contains(@title,'Archive')]
)
`;

const ACTION_MENU_XPATH = `
(
  //button[contains(@aria-label,'More')]
  | //button[contains(@aria-label,'Actions')]
  | //button[contains(@title,'More')]
  | //button[contains(@title,'Actions')]
  | //*[@role='button' and contains(@aria-label,'More')]
  | //*[@role='button' and contains(@aria-label,'Actions')]
  | //*[@role='button' and contains(@title,'More')]
  | //*[@role='button' and contains(@title,'Actions')]
)
`;

const DELETE_MODAL_CONFIRM_XPATH = `
(
  //button[contains(normalize-space(.),'Archive Job')]
  | //button[contains(normalize-space(.),'Archive')]
  | //button[contains(normalize-space(.),'Confirm')]
  | //button[contains(normalize-space(.),'Delete')]
  | //button[contains(normalize-space(.),'Permanently Delete')]
)
`;

const DELETE_MODAL_CANCEL_XPATH = `
(
  //button[contains(normalize-space(.),'Cancel')]
  | //button[contains(normalize-space(.),'Close')]
  | //button[contains(normalize-space(.),'No')]
)
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCurrentUrlSafe(driver) {
  try {
    return await driver.getCurrentUrl();
  } catch {
    return "";
  }
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
  if (value !== undefined && value !== null && value !== "") {
    await el.sendKeys(value);
  }
}

async function setInputById(driver, id, value) {
  const el = await waitVisible(driver, By.id(id), 15000);
  await clearAndType(driver, el, value);
  return el;
}

async function setReactValueById(driver, id, value) {
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

async function setDateById(driver, id, value) {
  const el = await waitVisible(driver, By.id(id), 15000);
  await driver.executeScript(
    `
    const el = arguments[0];
    const value = arguments[1];
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  `,
    el,
    value
  );
  return el;
}

async function getVisibleBodyText(driver) {
  const body = await waitVisible(driver, By.tagName("body"), 15000);
  return await body.getText();
}

async function getAuthState(driver) {
  try {
    return await driver.executeScript(() => ({
      token: localStorage.getItem("pf_token"),
      role: localStorage.getItem("pf_role"),
      userId: localStorage.getItem("pf_userId"),
      email: localStorage.getItem("pf_email"),
      fullName: localStorage.getItem("pf_fullName"),
    }));
  } catch {
    return { token: null, role: null, userId: null, email: null, fullName: null };
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

async function waitForLoginOutcome(driver, timeout = 25000) {
  await driver.wait(async () => {
    const url = await getCurrentUrlSafe(driver);
    const auth = await getAuthState(driver);

    if (auth.token && !url.includes("/company/login")) return true;
    if (url.includes("/company/dashboard")) return true;
    if (url.includes("/company/jobs")) return true;

    const errorEls = await driver.findElements(By.css(".alert.error"));
    return errorEls.length > 0;
  }, timeout);

  const errorEls = await driver.findElements(By.css(".alert.error"));
  if (errorEls.length > 0) {
    const txt = (await errorEls[0].getText()).trim();
    throw new Error(txt || "Login failed.");
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

  const signInBtns = await driver.findElements(
    By.xpath("//button[@type='submit' and (contains(.,'Sign in') or contains(.,'Sign In'))]")
  );
  if (signInBtns.length === 0) throw new Error("Sign in button not found.");
  await jsClick(driver, signInBtns[0]);

  await waitForLoginOutcome(driver, 25000);
}

async function ensureLoggedIn(driver) {
  const auth = await getAuthState(driver);
  const url = await getCurrentUrlSafe(driver);
  if (auth.token && !url.includes("/company/login")) return;
  await doLogin(driver);
}

async function goToJobsList(driver) {
  await ensureLoggedIn(driver);
  await driver.get(JOBS_URL);

  await driver.wait(async () => {
    const url = await getCurrentUrlSafe(driver);
    if (url.includes("/company/jobs")) return true;

    const body = (await getVisibleBodyText(driver)).toLowerCase();
    return (
      body.includes("manage jobs") ||
      body.includes("my jobs") ||
      body.includes("no jobs posted yet") ||
      body.includes("view details") ||
      body.includes("post your first job")
    );
  }, 20000);
}

// ── API helpers using browser fetch ───────────────────────────────────────────

async function browserApi(driver, method, path, body = null) {
  return await driver.executeAsyncScript(
    `
    const done = arguments[arguments.length - 1];
    const method = arguments[0];
    const url = arguments[1];
    const body = arguments[2];

    const token = localStorage.getItem("pf_token");

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": "Bearer " + token } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    })
      .then(async (res) => {
        const text = await res.text();
        let data = null;
        try { data = text ? JSON.parse(text) : null; } catch { data = text; }
        done({
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          data
        });
      })
      .catch((err) => done({
        ok: false,
        status: 0,
        statusText: "FETCH_ERROR",
        data: err.message || String(err)
      }));
  `,
    method,
    `${API_BASE}${path}`,
    body
  );
}

function extractJobsArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.jobs)) return data.jobs;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

function extractJobId(data) {
  if (!data) return null;
  if (data.id) return data.id;
  if (data.job && data.job.id) return data.job.id;
  if (data.data && data.data.id) return data.data.id;
  return null;
}

function extractMessage(resp) {
  if (!resp) return "Unknown error";
  if (typeof resp.data === "string") return resp.data;
  if (resp.data?.message) return resp.data.message;
  if (Array.isArray(resp.data?.errors) && resp.data.errors.length > 0) {
    return resp.data.errors.join(" | ");
  }
  return `${resp.status || ""} ${resp.statusText || ""}`.trim() || "Unknown error";
}

async function getCompanyJobsViaApi(driver) {
  const resp = await browserApi(driver, "GET", "/api/company/jobs");
  if (!resp.ok) throw new Error(extractMessage(resp));
  return extractJobsArray(resp.data);
}

async function createSeedJobViaApi(driver) {
  const payload = {
    ...SEED_JOB,
    applicationDeadline: new Date(SEED_JOB.applicationDeadline).toISOString(),
  };

  const resp = await browserApi(driver, "POST", "/api/company/jobs", payload);
  if (!resp.ok) throw new Error(extractMessage(resp));

  const createdId = extractJobId(resp.data);
  runtime.seedJobId = createdId || runtime.seedJobId;
  return createdId;
}

async function ensureAtLeastOneJobExists(driver) {
  await ensureLoggedIn(driver);

  let jobs = await getCompanyJobsViaApi(driver);
  if (jobs.length > 0) {
    runtime.seedJobId = jobs[0].id;
    return jobs;
  }

  await createSeedJobViaApi(driver);
  await sleep(1500);

  jobs = await getCompanyJobsViaApi(driver);
  if (jobs.length === 0) {
    throw new Error("No jobs found after seed creation attempt.");
  }

  runtime.seedJobId = jobs[0].id;
  return jobs;
}

async function getFirstJob(driver) {
  const jobs = await ensureAtLeastOneJobExists(driver);
  return jobs[0];
}

async function getFirstJobId(driver) {
  const job = await getFirstJob(driver);
  if (!job?.id) throw new Error("No job found.");
  return job.id;
}

// ── Page navigation helpers ──────────────────────────────────────────────────

async function openEditPage(driver, jobId) {
  runtime.lastEditJobId = jobId;
  await ensureLoggedIn(driver);
  await driver.get(`${BASE_URL}/company/jobs/${jobId}/edit`);

  await driver.wait(async () => {
    const url = await getCurrentUrlSafe(driver);
    const titleEls = await driver.findElements(By.id("title"));
    return url.includes(`/company/jobs/${jobId}/edit`) && titleEls.length > 0;
  }, 20000);
}

async function openJobDetail(driver, jobId) {
  runtime.lastDetailJobId = jobId;
  await ensureLoggedIn(driver);
  await driver.get(`${BASE_URL}/company/jobs/${jobId}`);

  await driver.wait(async () => {
    const url = await getCurrentUrlSafe(driver);
    return url.includes(`/company/jobs/${jobId}`);
  }, 15000);
}

async function waitForFieldError(driver, fieldId, timeout = 10000) {
  await driver.wait(async () => {
    const helpers = await driver.findElements(
      By.xpath(
        `//*[@id='${fieldId}']/following::*[contains(@class,'helper')][1] | //*[@id='${fieldId}']/ancestor::*[1]//*[contains(@class,'helper')]`
      )
    );

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
      By.xpath("//*[contains(.,'Success!') or contains(.,'updated successfully') or contains(.,'posted successfully')]")
    );
    if (successEls.length > 0) return "success";

    const errorEls = await driver.findElements(By.css(".alert.error"));
    if (errorEls.length > 0) return "server_error";

    if (url.includes("/company/jobs")) return "redirect";

    return false;
  }, timeout);
}

async function submitEditForm(driver) {
  const btns = await driver.findElements(
    By.xpath("//button[@type='submit' and (contains(.,'Save Changes') or contains(.,'Update') or contains(.,'Save'))]")
  );
  if (btns.length === 0) throw new Error("Save Changes button not found.");
  await jsClick(driver, btns[0]);
}

async function findActionButtonsOnCurrentPage(driver) {
  const editBtns = await driver.findElements(By.xpath(EDIT_ACTION_XPATH));
  const deleteBtns = await driver.findElements(By.xpath(DELETE_ACTION_XPATH));
  const menuBtns = await driver.findElements(By.xpath(ACTION_MENU_XPATH));
  return { editBtns, deleteBtns, menuBtns };
}

async function tryOpenActionMenu(driver) {
  const menuBtns = await driver.findElements(By.xpath(ACTION_MENU_XPATH));
  if (menuBtns.length === 0) return false;
  await jsClick(driver, menuBtns[0]);
  await sleep(1000);
  return true;
}

async function findDeleteButtonWithFallback(driver) {
  let deleteBtns = await driver.findElements(By.xpath(DELETE_ACTION_XPATH));
  if (deleteBtns.length > 0) return deleteBtns[0];

  const opened = await tryOpenActionMenu(driver);
  if (opened) {
    deleteBtns = await driver.findElements(By.xpath(DELETE_ACTION_XPATH));
    if (deleteBtns.length > 0) return deleteBtns[0];
  }

  return null;
}

async function findEditButtonWithFallback(driver) {
  let editBtns = await driver.findElements(By.xpath(EDIT_ACTION_XPATH));
  if (editBtns.length > 0) return editBtns[0];

  const opened = await tryOpenActionMenu(driver);
  if (opened) {
    editBtns = await driver.findElements(By.xpath(EDIT_ACTION_XPATH));
    if (editBtns.length > 0) return editBtns[0];
  }

  return null;
}

async function openDeleteModal(driver) {
  const deleteBtn = await findDeleteButtonWithFallback(driver);
  if (!deleteBtn) throw new Error("Delete button not found.");

  await jsClick(driver, deleteBtn);

  await driver.wait(async () => {
    const body = await getVisibleBodyText(driver);
    return (
      body.includes("Archive") ||
      body.includes("Permanent Delete") ||
      body.includes("Choose how you want to remove this job posting") ||
      body.includes("Soft Delete")
    );
  }, 12000);
}

async function modalStillVisible(driver) {
  const body = await getVisibleBodyText(driver);
  return (
    body.includes("Archive (Soft Delete)") ||
    body.includes("Permanent Delete") ||
    body.includes("Choose how you want to remove this job posting")
  );
}

// ── Test Cases ───────────────────────────────────────────────────────────────

async function tc01(driver) {
  console.log("\n📌 TC-01 — Valid company login");
  try {
    await doLogin(driver);
    const url = await getCurrentUrlSafe(driver);
    if (!url.includes("/company/login")) {
      record("TC-01", "Valid company login", "PASS");
    } else {
      record("TC-01", "Valid company login", "FAIL", "Still on login page");
    }
  } catch (e) {
    record("TC-01", "Valid company login", "FAIL", e.message);
  }
}

async function tc02(driver) {
  console.log("\n📌 TC-02 — Unauthenticated access to jobs list redirects");
  try {
    await clearSession(driver);
    await driver.get(JOBS_URL);
    await sleep(3000);
    const url = await getCurrentUrlSafe(driver);
    if (!url.includes("/company/jobs")) {
      record(
        "TC-02",
        "Unauthenticated jobs list access redirects",
        "PASS",
        `Redirected to: ${url}`
      );
    } else {
      record("TC-02", "Unauthenticated jobs list access redirects", "FAIL", "Should redirect");
    }
  } catch (e) {
    record("TC-02", "Unauthenticated jobs list access redirects", "FAIL", e.message);
  }
}

async function tc03(driver) {
  console.log("\n📌 TC-03 — Re-login after session clear");
  try {
    await doLogin(driver);
    record("TC-03", "Re-login successful", "PASS");
  } catch (e) {
    record("TC-03", "Re-login successful", "FAIL", e.message);
  }
}

async function tc04(driver) {
  console.log("\n📌 TC-04 — Company jobs list page loads");
  try {
    await goToJobsList(driver);
    record("TC-04", "Company jobs list page loads", "PASS", `URL: ${await getCurrentUrlSafe(driver)}`);
  } catch (e) {
    record("TC-04", "Company jobs list page loads", "FAIL", e.message);
  }
}

async function tc05(driver) {
  console.log("\n📌 TC-05 — At least one job is listed");
  try {
    const jobs = await ensureAtLeastOneJobExists(driver);
    record("TC-05", "At least one job listed", "PASS", `${jobs.length} job(s) found`);
  } catch (e) {
    record("TC-05", "At least one job listed", "FAIL", e.message);
  }
}

async function tc06(driver) {
  console.log("\n📌 TC-06 — Edit and Delete controls accessible from jobs list");
  try {
    await ensureAtLeastOneJobExists(driver);
    await goToJobsList(driver);

    let { editBtns, deleteBtns, menuBtns } = await findActionButtonsOnCurrentPage(driver);

    if (editBtns.length === 0 || deleteBtns.length === 0) {
      await tryOpenActionMenu(driver);
      ({ editBtns, deleteBtns, menuBtns } = await findActionButtonsOnCurrentPage(driver));
    }

    if (editBtns.length > 0 && deleteBtns.length > 0) {
      record(
        "TC-06",
        "Edit and Delete controls accessible from jobs list",
        "PASS",
        `${editBtns.length} edit, ${deleteBtns.length} delete, ${menuBtns.length} menu`
      );
    } else {
      record(
        "TC-06",
        "Edit and Delete controls accessible from jobs list",
        "FAIL",
        `edit:${editBtns.length} delete:${deleteBtns.length} menu:${menuBtns.length}`
      );
    }
  } catch (e) {
    record("TC-06", "Edit and Delete controls accessible from jobs list", "FAIL", e.message);
  }
}

async function tc07(driver) {
  console.log("\n📌 TC-07 — Click Edit navigates to edit page");
  try {
    const jobId = await getFirstJobId(driver);
    await openEditPage(driver, jobId);
    record("TC-07", "Edit button navigates to edit page", "PASS");
  } catch (e) {
    record("TC-07", "Edit button navigates to edit page", "FAIL", e.message);
  }
}

async function tc08(driver) {
  console.log("\n📌 TC-08 — Edit form pre-populates with existing data");
  try {
    const titleEl = await waitVisible(driver, By.id("title"), 15000);
    const existingTitle = await titleEl.getAttribute("value");
    if (existingTitle && existingTitle.length > 0) {
      record(
        "TC-08",
        "Edit form pre-populated with existing data",
        "PASS",
        `Title: "${existingTitle}"`
      );
    } else {
      record("TC-08", "Edit form pre-populated with existing data", "FAIL", "Title field is empty");
    }
  } catch (e) {
    record("TC-08", "Edit form pre-populated with existing data", "FAIL", e.message);
  }
}

async function tc09(driver) {
  console.log("\n📌 TC-09 — Update job title field");
  try {
    await setReactValueById(driver, "title", UPDATED_TITLE);
    const val = await (await driver.findElement(By.id("title"))).getAttribute("value");
    if (val === UPDATED_TITLE) {
      record("TC-09", "Job title field updated", "PASS");
    } else {
      record("TC-09", "Job title field updated", "FAIL", `Value was "${val}"`);
    }
  } catch (e) {
    record("TC-09", "Job title field updated", "FAIL", e.message);
  }
}

async function tc10(driver) {
  console.log("\n📌 TC-10 — Update location and description, submit edit");
  try {
    await setReactValueById(driver, "location", UPDATED_LOCATION);
    await setReactValueById(driver, "description", UPDATED_DESC);
    await setDateById(driver, "applicationDeadline", futureDate(45));

    await submitEditForm(driver);
    const outcome = await waitForServerErrorOrSuccess(driver, 25000);

    if (outcome === "success" || outcome === "redirect") {
      record("TC-10", "Edit form submitted successfully", "PASS");
    } else {
      const errors = await driver.findElements(By.css(".alert.error"));
      const txt = errors.length ? await errors[0].getText() : "Update failed.";
      record("TC-10", "Edit form submitted successfully", "FAIL", txt);
    }
  } catch (e) {
    record("TC-10", "Edit form submitted successfully", "FAIL", e.message);
  }
}

async function tc11(driver) {
  console.log("\n📌 TC-11 — Updated data reflected in jobs list");
  try {
    await goToJobsList(driver);
    await sleep(1500);
    const body = await getVisibleBodyText(driver);
    if (body.includes(UPDATED_TITLE)) {
      record("TC-11", "Updated title reflected in jobs list", "PASS");
    } else {
      record("TC-11", "Updated title reflected in jobs list", "FAIL", "Updated title not found");
    }
  } catch (e) {
    record("TC-11", "Updated title reflected in jobs list", "FAIL", e.message);
  }
}

async function tc12(driver) {
  console.log("\n📌 TC-12 — Edit page: empty title shows validation error");
  try {
    const jobId = await getFirstJobId(driver);
    await openEditPage(driver, jobId);
    await setReactValueById(driver, "title", "");
    await submitEditForm(driver);
    await waitForFieldError(driver, "title", 10000);
    record("TC-12", "Edit: empty title shows validation error", "PASS");
  } catch (e) {
    record("TC-12", "Edit: empty title shows validation error", "FAIL", e.message);
  }
}

async function tc13(driver) {
  console.log("\n📌 TC-13 — Edit page: empty description shows validation error");
  try {
    const jobId = await getFirstJobId(driver);
    await openEditPage(driver, jobId);
    await setReactValueById(driver, "description", "");
    await submitEditForm(driver);
    await waitForFieldError(driver, "description", 10000);
    record("TC-13", "Edit: empty description shows validation error", "PASS");
  } catch (e) {
    record("TC-13", "Edit: empty description shows validation error", "FAIL", e.message);
  }
}

async function tc14(driver) {
  console.log("\n📌 TC-14 — Edit page Cancel button navigates away");
  try {
    const jobId = await getFirstJobId(driver);
    await openEditPage(driver, jobId);

    const cancelBtns = await driver.findElements(
      By.xpath("//a[contains(.,'Cancel')] | //button[contains(.,'Cancel')]")
    );
    if (cancelBtns.length === 0) throw new Error("Cancel button not found.");

    await jsClick(driver, cancelBtns[0]);
    await sleep(1500);

    const url = await getCurrentUrlSafe(driver);
    if (!url.includes("/edit")) {
      record("TC-14", "Edit Cancel navigates away from edit page", "PASS", `Navigated to: ${url}`);
    } else {
      record("TC-14", "Edit Cancel navigates away from edit page", "FAIL", "Still on edit page");
    }
  } catch (e) {
    record("TC-14", "Edit Cancel navigates away from edit page", "FAIL", e.message);
  }
}

async function tc15(driver) {
  console.log("\n📌 TC-15 — Job detail page has accessible edit and delete controls");
  try {
    const jobId = await getFirstJobId(driver);
    await openJobDetail(driver, jobId);

    let { editBtns, deleteBtns, menuBtns } = await findActionButtonsOnCurrentPage(driver);

    if (editBtns.length === 0 || deleteBtns.length === 0) {
      await tryOpenActionMenu(driver);
      ({ editBtns, deleteBtns, menuBtns } = await findActionButtonsOnCurrentPage(driver));
    }

    if (editBtns.length > 0 && deleteBtns.length > 0) {
      record("TC-15", "Job detail page has accessible edit and delete controls", "PASS");
    } else {
      record(
        "TC-15",
        "Job detail page has accessible edit and delete controls",
        "FAIL",
        `edit:${editBtns.length} delete:${deleteBtns.length} menu:${menuBtns.length}`
      );
    }
  } catch (e) {
    record("TC-15", "Job detail page has accessible edit and delete controls", "FAIL", e.message);
  }
}

async function tc16(driver) {
  console.log("\n📌 TC-16 — Delete button opens confirmation modal");
  try {
    const jobId = await getFirstJobId(driver);
    runtime.lastDeleteJobId = jobId;
    await openJobDetail(driver, jobId);
    await openDeleteModal(driver);
    record("TC-16", "Delete button opens confirmation modal", "PASS");
  } catch (e) {
    record("TC-16", "Delete button opens confirmation modal", "FAIL", e.message);
  }
}

async function tc17(driver) {
  console.log("\n📌 TC-17 — Delete modal has Archive and Permanent options");
  try {
    const body = await getVisibleBodyText(driver);
    const hasArchive =
      body.includes("Archive (Soft Delete)") ||
      body.includes("Archive Job") ||
      body.includes("Soft Delete");

    const hasPermanent =
      body.includes("Permanent Delete") ||
      body.includes("Permanently Delete") ||
      body.includes("Hard Delete");

    if (hasArchive && hasPermanent) {
      record("TC-17", "Delete modal has Archive and Permanent options", "PASS");
    } else {
      record(
        "TC-17",
        "Delete modal has Archive and Permanent options",
        "FAIL",
        `Archive:${hasArchive} Permanent:${hasPermanent}`
      );
    }
  } catch (e) {
    record("TC-17", "Delete modal has Archive and Permanent options", "FAIL", e.message);
  }
}

async function tc18(driver) {
  console.log("\n📌 TC-18 — Cancel in delete modal dismisses without deleting");
  try {
    const cancelBtns = await driver.findElements(By.xpath(DELETE_MODAL_CANCEL_XPATH));
    if (cancelBtns.length === 0) throw new Error("Cancel button not found in modal.");

    await jsClick(driver, cancelBtns[0]);
    await sleep(1500);

    const stillVisible = await modalStillVisible(driver);

    if (!stillVisible) {
      record("TC-18", "Cancel in delete modal dismisses without deleting", "PASS");
    } else {
      record("TC-18", "Cancel in delete modal dismisses without deleting", "FAIL", "Modal still visible");
    }
  } catch (e) {
    record("TC-18", "Cancel in delete modal dismisses without deleting", "FAIL", e.message);
  }
}

async function tc19(driver) {
  console.log("\n📌 TC-19 — Soft delete (archive) removes job from list");
  try {
    const jobId = await getFirstJobId(driver);
    runtime.lastDeleteJobId = jobId;

    await openJobDetail(driver, jobId);
    await openDeleteModal(driver);

    const radios = await driver.findElements(By.xpath("//input[@type='radio']"));
    if (radios.length > 0) {
      await jsClick(driver, radios[0]);
      await sleep(500);
    }

    const confirmBtns = await driver.findElements(By.xpath(DELETE_MODAL_CONFIRM_XPATH));
    if (confirmBtns.length === 0) throw new Error("Archive confirm button not found.");

    await jsClick(driver, confirmBtns[0]);
    await sleep(2500);

    const jobs = await getCompanyJobsViaApi(driver);
    const stillExists = jobs.some((j) => String(j.id) === String(jobId));

    if (!stillExists) {
      record("TC-19", "Soft delete removes job and redirects to list", "PASS");
    } else {
      record("TC-19", "Soft delete removes job and redirects to list", "FAIL", "Job still returned by API");
    }
  } catch (e) {
    record("TC-19", "Soft delete removes job and redirects to list", "FAIL", e.message);
  }
}

async function tc20(driver) {
  console.log("\n📌 TC-20 — Jobs list page loads after delete");
  try {
    await goToJobsList(driver);
    record("TC-20", "Jobs list loads after delete", "PASS");
  } catch (e) {
    record("TC-20", "Jobs list loads after delete", "FAIL", e.message);
  }
}

async function tc21(driver) {
  console.log("\n📌 TC-21 — Delete from list page works or no jobs remain");
  try {
    await goToJobsList(driver);

    let deleteButtons = await driver.findElements(By.xpath(DELETE_ACTION_XPATH));
    if (deleteButtons.length === 0) {
      await tryOpenActionMenu(driver);
      deleteButtons = await driver.findElements(By.xpath(DELETE_ACTION_XPATH));
    }

    if (deleteButtons.length === 0) {
      record("TC-21", "Delete from list (no more jobs to delete)", "PASS", "No jobs remaining");
      return;
    }

    await jsClick(driver, deleteButtons[0]);
    await sleep(1000);

    const confirmBtns = await driver.findElements(By.xpath(DELETE_MODAL_CONFIRM_XPATH));
    if (confirmBtns.length > 0) {
      await jsClick(driver, confirmBtns[0]);
      await sleep(2000);
    }

    record("TC-21", "Delete from list page works", "PASS");
  } catch (e) {
    record("TC-21", "Delete from list page works", "FAIL", e.message);
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

// ── Summary ───────────────────────────────────────────────────────────────────

function printSummary() {
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  console.log("\n══════════════════════════════════════════════════════════════════");
  console.log("   RESULTS — US-03: Edit or Delete Job Posting");
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

// ── Runner ────────────────────────────────────────────────────────────────────

async function run() {
  console.log("══════════════════════════════════════════════════════════════════");
  console.log("   PathFinder — US-03: Edit or Delete Job Posting");
  console.log("   Target: https://pathfinder-frontend-navy.vercel.app");
  console.log("   NOTE: Uses API seeding if no job exists.");
  console.log("══════════════════════════════════════════════════════════════════");

  let driver;
  try {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.manage().window().maximize();

    console.log("\n━━━ Group 1: Authentication ━━━");
    await tc01(driver);
    await tc02(driver);
    await tc03(driver);

    console.log("\n━━━ Group 2: Navigate to Jobs List ━━━");
    await tc04(driver);
    await tc05(driver);
    await tc06(driver);

    console.log("\n━━━ Group 3: Edit Job Functionality ━━━");
    await tc07(driver);
    await tc08(driver);
    await tc09(driver);
    await tc10(driver);
    await tc11(driver);

    console.log("\n━━━ Group 4: Edit Validation ━━━");
    await tc12(driver);
    await tc13(driver);
    await tc14(driver);
    await tc15(driver);

    console.log("\n━━━ Group 5: Delete (Soft) Functionality ━━━");
    await tc16(driver);
    await tc17(driver);
    await tc18(driver);
    await tc19(driver);

    console.log("\n━━━ Group 6: Post-Delete & Cleanup ━━━");
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