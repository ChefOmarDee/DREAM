const { GetPopDensity } = require("./popdensity");
const { WindAllowed } = require("./regulation");

async function RetrievePopDensity(zipcode) {
    let popdens = await GetPopDensity(zipcode);
    console.log(`${zipcode}: ${popdens}`)
};

async function CheckRegulation(county) {
    let allowed = await WindAllowed(county);
    console.log(`${county}: ${allowed}`)
};

// RetrievePopDensity("32968");

CheckRegulation("Indian River County");

