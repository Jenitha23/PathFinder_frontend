const { Builder, By, until } = require('selenium-webdriver');

async function runCompanyRegistrationCloudTest() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Pointing to your deployed Vercel frontend
        const baseUrl = "https://pathfinder-frontend-navy.vercel.app/"; 
        console.log(`🚀 Navigating to Deployed App: ${baseUrl}`);
        await driver.get(baseUrl);

        // 1. Landing Page -> Choice Page
        const getStartedBtn = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Get Started')]")), 15000);
        await driver.executeScript("arguments[0].click();", getStartedBtn);

        // 2. Choice Page -> Selecting 'Company'
        console.log("Selecting 'Company' option...");
        const companyOption = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Company')]")), 10000);
        await driver.executeScript("arguments[0].click();", companyOption);

        // 3. Fill Company Registration Form
        console.log("Waiting for form fields...");
        await driver.wait(until.elementLocated(By.xpath("//input[contains(@placeholder, 'ABC Pvt Ltd')]")), 15000);

        const uniqueId = Date.now().toString().slice(-6);
        const testEmail = `hr_dept_${uniqueId}@corporate.com`;
        const pass = "CompanyPass123!";

        console.log(`📝 Registering Company: Cloud Tech ${uniqueId}`);
        await driver.findElement(By.xpath("//input[contains(@placeholder, 'ABC Pvt Ltd')]")).sendKeys(`Cloud Tech ${uniqueId}`);
        await driver.findElement(By.xpath("//input[contains(@placeholder, 'company@example.com')]")).sendKeys(testEmail);
        await driver.findElement(By.xpath("//input[contains(@placeholder, 'At least 8 characters')]")).sendKeys(pass);
        await driver.findElement(By.xpath("//input[contains(@placeholder, 'Re-enter your password')]")).sendKeys(pass);

        // 4. Force Click the "Register Company" Button
        console.log("Clicking 'Register Company'...");
        const registerBtn = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Register Company')]")), 
            10000
        );
        await driver.executeScript("arguments[0].click();", registerBtn);

        // 5. Cloud Response Check (Handles Azure Latency)
        console.log("⏳ Waiting for Azure backend response...");
        const result = await driver.wait(async () => {
            // Check for success banner
            const successElements = await driver.findElements(By.xpath("//*[contains(text(), 'Company registered successfully')]"));
            if (successElements.length > 0) return "SUCCESS";

            // Check for Azure/Backend Errors
            const errorElements = await driver.findElements(By.xpath("//*[contains(text(), 'Something went wrong') or contains(text(), 'failed')]"));
            if (errorElements.length > 0) throw new Error("Backend rejected registration (Azure DB or CORS issue).");
            
            return false;
        }, 25000);

        console.log(`✅ CLOUD COMPANY TEST SUCCESSFUL! Registered: ${testEmail}`);

    } catch (error) {
        console.error("❌ CLOUD COMPANY TEST FAILED.");
        console.error(`Current URL: ${await driver.getCurrentUrl()}`);
        console.error(`Error Details: ${error.message}`);
    } finally {
        console.log("Closing browser in 5 seconds...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        await driver.quit();
    }
}

runCompanyRegistrationCloudTest();