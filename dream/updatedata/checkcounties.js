const { ConnectToDatabase } = require("../mongodb/connection/db");
const { WindAllowed } = require("../scraping/regulation");
const mongoose = require('mongoose');

const County = require('../mongodb/models/counties');

async function CheckCounties() {
    await ConnectToDatabase();

    try {
        const counties = await County.find({});

        for (const county of counties) {
            if (county.permitted) {
                console.log(`${county.countyname}: ${county.permitted}`);

                try {
                    const windallowed = await WindAllowed(county.countyname);
                    console.log(windallowed);

                    if (!windallowed) {
                        await County.findByIdAndUpdate(
                            county._id,
                            { permitted: false },
                            { new: true }
                        );
                    }
                } catch (err) {
                    console.error(`Error checking wind allowance for ${county.countyname}:`, err);
                    
                    continue;
                }
            }
        }
    } catch (err) {
        console.error("Error fetching counties:", err);
    }
}

CheckCounties();