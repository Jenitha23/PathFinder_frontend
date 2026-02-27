const { Builder, By, until } = require('selenium-webdriver');

async function runStudentLoginCloudTest() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Change to your Vercel URL
        const loginUrl = "https://pathfinder-frontend-navy.vercel.app/student/login"; 
        console.log(`🚀 Navigating to Cloud Login Page: ${loginUrl}`);
        await driver.get(loginUrl);

        // 1. Wait for fields
        await driver.wait(until.elementLocated(By.xpath("//input[contains(@placeholder, 'you@example.com')]")), 15000);

        // 2. Fill credentials (Using the user you just created in the cloud)
        const testEmail = "student_476135@sliit.lk"; 
        const testPassword = "Password123!"; 

        console.log(`📝 Entering Email: ${testEmail}`);
        await driver.findElement(By.xpath("//input[contains(@placeholder, 'you@example.com')]")).sendKeys(testEmail);
        
        console.log("📝 Entering Password...");
        await driver.findElement(By.xpath("//input[contains(@placeholder, 'Enter your password')]")).sendKeys(testPassword);

        // 3. Pause for UI stability
        await driver.sleep(1500);

        // 4. Click the Sign In button
        console.log("🖱️ Clicking 'Sign In'...");
        const signInBtn = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Sign In')]")), 
            10000
        );
        await driver.executeScript("arguments[0].click();", signInBtn);

        // 5. Robust Success Check
        console.log("⏳ Waiting for Azure authentication...");
        const result = await driver.wait(async () => {
            const url = await driver.getCurrentUrl();
            if (url.includes('/student/home')) return "REDIRECTED";

            // Check if an error banner appears (e.g., Invalid credentials)
            const errorMsg = await driver.findElements(By.xpath("//*[contains(text(), 'Invalid') or contains(text(), 'wrong')]"));
            if (errorMsg.length > 0) {
                const text = await errorMsg[0].getText();
                throw new Error(`Login Failed: ${text}`);
            }
            return false;
        }, 20000);
        
        console.log(`✅ CLOUD LOGIN SUCCESSFUL! Status: ${result}`);

    } catch (error) {
        console.error("❌ CLOUD LOGIN TEST FAILED.");
        console.error(`Current URL: ${await driver.getCurrentUrl()}`);
        console.error(`Error: ${error.message}`);
    } finally {
        console.log("Closing browser in 5 seconds...");
        await driver.sleep(5000);
        await driver.quit();
    }
}

runStudentLoginCloudTest();