const { Builder, By, until } = require('selenium-webdriver');

async function runStudentRegistrationTest() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        const baseUrl = "https://pathfinder-frontend-navy.vercel.app/"; 
        console.log(`🚀 Navigating to Deployed App: ${baseUrl}`);
        await driver.get(baseUrl);

        // 1. Landing Page -> Choice Page
        const getStartedBtn = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Get Started')]")), 15000);
        await driver.executeScript("arguments[0].click();", getStartedBtn);

        // 2. Choice Page -> Registration Form
        console.log("🖱️ Selecting 'Student' option...");
        const studentOption = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Student')]")), 10000);
        await driver.executeScript("arguments[0].click();", studentOption);

        // 3. Fill Registration Form
        console.log("⏳ Waiting for form fields...");
        await driver.wait(until.elementLocated(By.xpath("//input[contains(@placeholder, 'John Perera')]")), 15000);

        const uniqueId = Date.now().toString().slice(-6);
        const testEmail = `student_${uniqueId}@sliit.lk`;
        const pass = "Password123!";

        console.log(`📝 Registering Student: Oshadhi Test ${uniqueId}`);
        await driver.findElement(By.xpath("//input[contains(@placeholder, 'John Perera')]")).sendKeys("Oshadhi Test User");
        await driver.findElement(By.xpath("//input[contains(@placeholder, 'you@example.com')]")).sendKeys(testEmail);
        await driver.findElement(By.xpath("//input[contains(@placeholder, 'At least 8 characters')]")).sendKeys(pass);
        await driver.findElement(By.xpath("//input[contains(@placeholder, 'Re-enter your password')]")).sendKeys(pass);
        
        await driver.sleep(1000); 

       // 4. Click Submit
        console.log("🖱️ Clicking Submit...");
        const createBtn = await driver.wait(
            until.elementLocated(By.xpath("//button[@type='submit' or contains(., 'Create Account')]")), 
            10000
        );
        await driver.executeScript("arguments[0].click();", createBtn);

        // 5. Success Check
        console.log("⏳ Waiting for backend processing...");
        await driver.wait(until.urlContains('/student/home'), 20000);
        
        console.log(`✅ DEPLOYED TEST SUCCESSFUL! Student registered: ${testEmail}`);

    } catch (error) {
        console.error("❌ TEST FAILED.");
        console.error(`Current URL: ${await driver.getCurrentUrl()}`);
        console.error(`Error: ${error.message}`);
    } finally {
        await driver.quit();
    }
}

runStudentRegistrationTest();