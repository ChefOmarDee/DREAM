const { GetPopDensity } = require("./popdensity");

async function RetrievePopDensity(zipcode) {
    let popdens = await GetPopDensity(zipcode);
    console.log(`${zipcode}: ${popdens}`)
};

RetrievePopDensity("32968");