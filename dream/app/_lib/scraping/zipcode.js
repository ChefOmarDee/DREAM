const fs = require('fs');
const csv = require('csv-parser');

// Hashmap of valid states
const validStates = {
  'AL': true, 'AK': true, 'AZ': true, 'AR': true, 'CA': true, 'CO': true, 'CT': true, 
  'DE': true, 'FL': true, 'GA': true, 'HI': true, 'ID': true, 'IL': true, 'IN': true, 
  'IA': true, 'KS': true, 'KY': true, 'LA': true, 'ME': true, 'MD': true, 'MA': true, 
  'MI': true, 'MN': true, 'MS': true, 'MO': true, 'MT': true, 'NE': true, 'NV': true, 
  'NH': true, 'NJ': true, 'NM': true, 'NY': true, 'NC': true, 'ND': true, 'OH': true, 
  'OK': true, 'OR': true, 'PA': true, 'RI': true, 'SC': true, 'SD': true, 'TN': true, 
  'TX': true, 'UT': true, 'VT': true, 'VA': true, 'WA': true, 'WV': true, 'WI': true, 'WY': true
};

export function CSVToCountyObjects() {
  return new Promise((resolve, reject) => {
    const countyData = {};

    fs.createReadStream("./app/_lib/scraping/zip.csv")
      .pipe(csv())
      .on('data', (row) => {
        const state = row.state;
        if (validStates[state]) {
          const county = `${row.county}, ${state}`;
          const zip = row.zip;

          if (!countyData[county]) {
            countyData[county] = new Set();
          }
          countyData[county].add(zip);
        }
      })
      .on('end', () => {
        const result = {
          counties: Object.entries(countyData).map(([countyName, zipCodes]) => ({
            countyName,
            isAllowed: true,
            zipCodes: Array.from(zipCodes).sort((a, b) => a - b)
          }))
        };
        resolve(result);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}