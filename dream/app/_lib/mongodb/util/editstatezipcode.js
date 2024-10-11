import { ZipCode } from '../models/zipcodes';

const stateAcronyms = ['KY', 'FL', 'VT', 'CT', 'TN'];

export async function AlterZipByState() {
    try {
        // Update all zip codes for the specified states
        const result = await ZipCode.updateMany(
            { state: { $in: stateAcronyms } },  // Match zipcodes in the specified states
            { $set: { permitted: false, score: 0 } }  // Set permitted to false and score to 0
        );

        console.log(`Updated ${result.modifiedCount} zip codes for states: ${stateAcronyms.join(', ')}`);
        console.log('Set permitted to false and score to 0 for these zip codes');
    } catch (error) {
        console.error("Error updating zip codes:", error);
    }
}

// Example usage: run the function to update zip codes for specified states
// updateZipcodesForSpecifiedStates();