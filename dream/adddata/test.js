const { AddCounty } = require("./addcounty")
const { AddZipcode } = require("./addzipcode")

async function AddCountyTest(countyname, zipcodes, permitted) {
    await AddCounty(countyname, zipcodes, permitted);
};

async function AddZipcodeTest(zipcode, popdensity, lat, long, windspeed, precip, temp, humidity, geojson) {
    await AddZipcode(zipcode, popdensity, lat, long, windspeed, precip, temp, humidity, geojson)
}

// AddCountyTest("IndianRiverCounty", [32960, 32962, 32968], false);
AddZipcodeTest(32962, 800.40, 32, 32, 10, 4, 60, 4.2, [[30, 30, 30], [60, 60, 60]]);