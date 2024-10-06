const playwright = require("playwright");

export async function ScrapeCounties() {
    let browser = null;
    try {
        browser = await playwright.chromium.launch({ headless: false });
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto("https://en.wikipedia.org/wiki/List_of_United_States_counties_and_county_equivalents#Table");

        // Wait for the table to load
        await page.waitForSelector('#mw-content-text > div.mw-content-ltr.mw-parser-output > table > tbody');

        // Extract the titles
        const titles = await page.evaluate(() => {
            const rows = document.querySelectorAll('#mw-content-text > div.mw-content-ltr.mw-parser-output > table > tbody > tr');
            return Array.from(rows).map(row => {
                const firstTd = row.querySelector('td');
                if (firstTd) {
                    const aTag = firstTd.querySelector('a');
                    return aTag ? aTag.getAttribute('title') : null;
                }
                return null;
            }).filter(title => title !== null);
        });

        // Filter out territories
        const territoriesToExclude = [
            "Puerto Rico", "U.S. Virgin Islands", "American Samoa", "Guam",
            "Northern Mariana Islands", "U.S. Minor Outlying Islands"
        ];

        const filteredTitles = titles.filter(title => 
            !territoriesToExclude.some(territory => title.includes(territory))
        );

        console.log(filteredTitles);
        console.log(`Total counties: ${filteredTitles.length}`);
        return filteredTitles;

    } catch (error) {
        console.error("An error occurred:", error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

