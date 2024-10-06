const { AddCounty } = require("./addcounty")

async function AddCountyTest(countyname, zipcodes, permitted) {
    await AddCounty(countyname, zipcodes, permitted);
};

AddCountyTest("IndianRiverCounty", [32960, 32962, 32968], false);