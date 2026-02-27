const { Builder, By, until } = require('selenium-webdriver');

async function runAdminLoginCloudTest() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Point to the live Vercel admin login page
        const loginUrl = "https://pathfinder-frontend-navy.vercel.app/admin/login"; 
        console.log(`🚀 Navigating to Cloud Admin Login: ${loginUrl}`);
        await driver.get(loginUrl);

        // 1. Wait for email and password fields
        console.log("⏳ Waiting for login fields...");
        await driver.wait(until.elementLocated(By.xpath("//input[@type='email' or contains(@placeholder, 'Email')]")), 15000);

       // 2. Provide Admin credentials (Case-Sensitive Update)
        const testEmail = "Admin@pathfinder.com"; 
        const testPassword = "Admin@123"; 

        console.log(`📝 Entering Admin Email: ${testEmail}`);
        // ... rest of the code remains the same
        await driver.findElement(By.xpath("//input[@type='email' or contains(@placeholder, 'Email')]")).sendKeys(testEmail);
        
        console.log("📝 Entering Password...");
        await driver.findElement(By.xpath("//input[@type='password' or contains(@placeholder, 'Password')]")).sendKeys(testPassword);

        // 3. UI stability pause
        await driver.sleep(1500);

        // 4. Click the 'Sign In' button
        console.log("🖱️ Clicking 'Sign In'...");
        const signInBtn = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(., 'Sign In')]")), 
            10000
        );
        await driver.executeScript("arguments[0].click();", signInBtn);

        // 5. Success Check (Looking for Admin Dashboard)
        console.log("⏳ Waiting for Admin dashboard redirection...");
        const result = await driver.wait(async () => {
            const url = await driver.getCurrentUrl();
            
            // Checking for common admin paths like /admin/dashboard or /admin/home
            if (url.includes('/admin/dashboard') || url.includes('/admin/home')) {
                return "REDIRECTED TO ADMIN DASHBOARD";
            }

            // Catch invalid credential messages
            const errorMsg = await driver.findElements(By.xpath("//*[contains(text(), 'Invalid') or contains(text(), 'access denied')]"));
            if (errorMsg.length > 0) {
                const text = await errorMsg[0].getText();
                throw new Error(`Admin Login Rejected: ${text}`);
            }
            return false;
        }, 20000);
        
        console.log(`✅ ADMIN CLOUD LOGIN SUCCESSFUL! Status: ${result}`);

    } catch (error) {
        console.error("❌ ADMIN CLOUD LOGIN FAILED.");
        console.error(`Current URL: ${await driver.getCurrentUrl()}`);
        console.error(`Error Details: ${error.message}`);
    } finally {
        console.log("Closing browser in 5 seconds...");
        await driver.sleep(5000);
        await driver.quit();
    }
}

runAdminLoginCloudTest();