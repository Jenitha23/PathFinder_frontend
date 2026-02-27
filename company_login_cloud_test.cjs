const { Builder, By, until } = require('selenium-webdriver');

async function runCompanyLoginCloudTest() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Point to the live Vercel company login page
        const loginUrl = "https://pathfinder-frontend-navy.vercel.app/company/login"; 
        console.log(`🚀 Navigating to Cloud Company Login: ${loginUrl}`);
        await driver.get(loginUrl);

        // 1. Wait for input fields to load
        await driver.wait(until.elementLocated(By.xpath("//input[contains(@placeholder, 'company@example.com')]")), 15000);

        // 2. Provide credentials (Use an email from your successful company registration)
        const testEmail = "hr_dept_888578@corporate.com"; // UPDATE THIS with a real email from your DB
        const testPassword = "CompanyPass123!"; 

        console.log(`📝 Entering Company Email: ${testEmail}`);
        await driver.findElement(By.xpath("//input[contains(@placeholder, 'company@example.com')]")).sendKeys(testEmail);
        
        console.log("📝 Entering Password...");
        await driver.findElement(By.xpath("//input[contains(@placeholder, 'Enter your password')]")).sendKeys(testPassword);

        // 3. UI Stability pause
        await driver.sleep(1500);

        // 4. Click the 'Sign In' button
        console.log("🖱️ Clicking 'Sign In'...");
        const signInBtn = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Sign In')]")), 
            10000
        );
        await driver.executeScript("arguments[0].click();", signInBtn);

       // 5. Cloud Redirection Check
console.log("⏳ Waiting for Azure authentication...");
const result = await driver.wait(async () => {
    const url = await driver.getCurrentUrl();
    
    // Updated this line to look for /dashboard instead of /home
    if (url.includes('/company/dashboard') || url.includes('/company/home')) {
        return "REDIRECTED TO DASHBOARD";
    }

    const errorMsg = await driver.findElements(By.xpath("//*[contains(text(), 'Invalid') or contains(text(), 'wrong')]"));
    if (errorMsg.length > 0) {
        const text = await errorMsg[0].getText();
        throw new Error(`Login Rejected: ${text}`);
    }
    return false;
}, 20000);
        
        console.log(`✅ COMPANY CLOUD LOGIN SUCCESSFUL! Status: ${result}`);

    } catch (error) {
        console.error("❌ COMPANY CLOUD LOGIN FAILED.");
        console.error(`Current URL: ${await driver.getCurrentUrl()}`);
        console.error(`Error Details: ${error.message}`);
    } finally {
        console.log("Closing browser in 5 seconds...");
        await driver.sleep(5000);
        await driver.quit();
    }
}

runCompanyLoginCloudTest();