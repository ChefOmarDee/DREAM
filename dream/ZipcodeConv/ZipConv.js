const zipcodes = require('zipcodes');

function coordinates(zipcode) { 
    const location = zipcodes.lookup(zipcode);

    if (location) {
        return [location.latitude, location.longitude];
    } else {
        throw new Error('Location not found for the provided zip code.');
    }
}

async function getCoordinates(zipcode) {
    const promises = [
        new Promise((resolve, reject) => {
            try {
                const [latitude, longitude] = coordinates(zipcode);
                resolve([latitude, longitude]); // Resolve with latitude and longitude
            } catch (error) {
                reject(error); // Reject in case of an error
            }
        })
    ];

    // Use Promise.all to resolve the promises and destructure the results
    const [[latitude, longitude]] = await Promise.all(promises);
    
    return [latitude, longitude]; // Return an array of latitude and longitude
}
