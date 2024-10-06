const playwright = require("playwright");
const { CanUseWind } = require("../ai/interpreter")

async function WindAllowed(county) {
    if (!county) {
        return
    }
    let browser = null;
    try {
        console.log("starting");
        browser = await playwright.chromium.launch({ headless: false });
        const context = await browser.newContext();
        const page = await context.newPage();
        const timeout = 1800000;
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Operation timed out")), timeout)
        );

        const typeText = async (selector, text, delay = 100) => {
            for (const letter of text) {
                await page.type(selector, letter);
                await page.waitForTimeout(delay); // Adjust delay between each letter
            }
        };

        await page.goto("https://library.municode.com/#:~:text=Jump%20To.%20MunicodeNEXT,%20the%20industry's%20leading");
        await page.waitForSelector('input[name="headerSearch"]', { state: 'visible' });
        await typeText('input[name="headerSearch"]', county, 50);
        await page.click('li.auto-complete-item.auto-complete-item-selected[data-index="0"]');
        await page.waitForTimeout(3000);

        await page.waitForSelector('input[name="headerSearch"]', { state: 'visible'})
        await typeText('input[name="headerSearch"]', "Wind energy", 50);
        await page.click('input[name="headerSearch"]');
        await page.keyboard.press("Enter");

        const text = await page.textContent('div[ng-bind-html="::hit.ContentFragment"]');

        return CanUseWind(text);

    } catch (error) {
        console.error("Error during scraping:", error);
        return -1;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { WindAllowed };