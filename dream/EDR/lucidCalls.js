const https = require('https');

// Function to get the average wind speed between specified dates and coordinates
function getAverageWindSpeed(startDate, endDate, latitude, longitude) {
    // Define the Open-Meteo API endpoint
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&start=${startDate}&end=${endDate}&hourly=wind_speed_10m&timezone=auto`;

    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';

            // Collect the data chunks
            response.on('data', (chunk) => {
                data += chunk;
            });

            // Handle the end of the response
            response.on('end', () => {
                if (response.statusCode === 200) {
                    const jsonData = JSON.parse(data);
                    const windSpeeds = jsonData.hourly.wind_speed_10m;

                    // Calculate the average wind speed
                    const averageWindSpeed = windSpeeds.length ? (windSpeeds.reduce((sum, speed) => sum + speed, 0) / windSpeeds.length) : 0;
                    resolve(averageWindSpeed);
                } else {
                    reject(`Error: ${response.statusCode}, ${data}`);
                }
            });
        }).on('error', (err) => {
            reject(`Fetch error: ${err.message}`);
        });
    });
}

// Average Wind Gust
function getAverageWindGust(startDate, endDate, latitude, longitude) {
    // Define the Open-Meteo API endpoint for wind gust
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&start=${startDate}&end=${endDate}&hourly=wind_gusts_10m&timezone=auto`;

    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';

            // Collect the data chunks
            response.on('data', (chunk) => {
                data += chunk;
            });

            // Handle the end of the response
            response.on('end', () => {
                if (response.statusCode === 200) {
                    const jsonData = JSON.parse(data);
                    const windGusts = jsonData.hourly.wind_gusts_10m;

                    // Calculate the average wind gust
                    const averageWindGust = windGusts.length ? (windGusts.reduce((sum, gust) => sum + gust, 0) / windGusts.length) : 0;
                    resolve(averageWindGust);
                } else {
                    reject(`Error: ${response.statusCode}, ${data}`);
                }
            });
        }).on('error', (err) => {
            reject(`Fetch error: ${err.message}`);
        });
    });
}

// Get Avg. Temp
function getAverageTemp(startDate, endDate, latitude, longitude) {
    // Define the Open-Meteo API endpoint for temperature
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&start=${startDate}&end=${endDate}&hourly=temperature_2m&timezone=auto`;

    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';

            // Collect the data chunks
            response.on('data', (chunk) => {
                data += chunk;
            });

            // Handle the end of the response
            response.on('end', () => {
                if (response.statusCode === 200) {
                    const jsonData = JSON.parse(data);
                    const temperatures = jsonData.hourly.temperature_2m;

                    // Calculate the average temperature
                    const averageTemperature = temperatures.length ? (temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length) : 0;
                    resolve(averageTemperature);
                } else {
                    reject(`Error: ${response.statusCode}, ${data}`);
                }
            });
        }).on('error', (err) => {
            reject(`Fetch error: ${err.message}`);
        });
    });
}

// Get Avg. Humidity
function getAverageHumidity(startDate, endDate, latitude, longitude) {
    // Define the Open-Meteo API endpoint for humidity
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&start=${startDate}&end=${endDate}&hourly=relative_humidity_2m&timezone=auto`;

    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';

            // Collect the data chunks
            response.on('data', (chunk) => {
                data += chunk;
            });

            // Handle the end of the response
            response.on('end', () => {
                if (response.statusCode === 200) {
                    const jsonData = JSON.parse(data);
                    
                    // Check if the expected data is present
                    if (jsonData.hourly && jsonData.hourly.relative_humidity_2m) {
                        const humidity = jsonData.hourly.relative_humidity_2m;

                        // Calculate the average humidity
                        const averageHumidity = humidity.length ? (humidity.reduce((sum, hum) => sum + hum, 0) / humidity.length) : 0;
                        resolve(averageHumidity);
                    } else {
                        reject(`Error: Expected data not found in response. Data: ${JSON.stringify(jsonData)}`);
                    }
                } else {
                    reject(`Error: ${response.statusCode}, ${data}`);
                }
            });
        }).on('error', (err) => {
            reject(`Fetch error: ${err.message}`);
        });
    });
}

// Get Avg. Precipitation
function getAveragePrecipitation(startDate, endDate, latitude, longitude) {
    // Define the Open-Meteo API endpoint for hourly precipitation
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&start=${startDate}&end=${endDate}&hourly=precipitation&timezone=auto`;

    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';

            // Collect the data chunks
            response.on('data', (chunk) => {
                data += chunk;
            });

            // Handle the end of the response
            response.on('end', () => {
                if (response.statusCode === 200) {
                    const jsonData = JSON.parse(data);

                    // Check if the expected data is present
                    if (jsonData.hourly && jsonData.hourly.precipitation) {
                        const precipitation = jsonData.hourly.precipitation;

                        // Calculate the average precipitation
                        const averagePrecipitation = precipitation.length ? (precipitation.reduce((sum, precip) => sum + precip, 0) / precipitation.length) : 0;
                        resolve(averagePrecipitation);
                    } else {
                        reject(`Error: Expected data not found in response. Data: ${JSON.stringify(jsonData)}`);
                    }
                } else {
                    reject(`Error: ${response.statusCode}, ${data}`);
                }
            });
        }).on('error', (err) => {
            reject(`Fetch error: ${err.message}`);
        });
    });
}



async function getEnvData(startDate, endDate, latitude, longitude) {
    const promises = [
        getAverageWindSpeed(startDate, endDate, latitude, longitude),
        getAverageWindGust(startDate, endDate, latitude, longitude),
        getAverageTemp(startDate, endDate, latitude, longitude),
        getAverageHumidity(startDate, endDate, latitude, longitude),
        getAveragePrecipitation(startDate, endDate, latitude, longitude),
    ];

    // Update destructuring to match the number of promises
    const [avgWS, avgWG, avgTemp, avgHumidity, avgPrecipitation] = await Promise.all(promises);

    const score = {
        avgWS, // In km/h
        avgWG, //  In km/h
        avgTemp, // In C
        avgHumidity, // In % According to Doc.
        avgPrecipitation,  // In mm
    };

    return score;
}



//const startDate = "2023-10-01T00:00:00Z";
//const endDate = "2024-10-02T00:00:00Z";
//const latitude = 27.6388;  // Vero Beach, Florida
//const longitude = -80.3970;


// Call the function and log the results
// functionCalls(startDate, endDate, latitude, longitude)
    //.then(score => console.log(score))
    //.catch(err => console.error(err));