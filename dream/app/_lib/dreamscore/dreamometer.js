// Function to normalize using Min-Max scaling
function normalize(value, min, max) {
    return (value - min) / (max - min);
  }
  
  // Function to calculate score factor for windmill suitability
  function calculateScoreFactor({
    Wavg,   // Average wind speed
    Gavg,   // Average wind gust
    Pfac,   // Precipitation Factor
    Tfac,   // Temp. Factor
    Hfac,   // Humidity Factor
  }) {
    // Normalize each factor
    const normalizedWavg = normalize(); 
    const normalizedGavg = normalize(); 
    const normalizedPfac = normalize();
  
    // No normalization needed for percentage data (Cw, Sf) as they're already 0-1
    const normalizedCw = Cw / 100;
    const normalizedSf = Sf / 100;
  
    // Normalize custom factor C if needed (example range 0-100)
    const normalizedC = normalize(C, 0, 100);
  
    // Calculate the final score using the given formula
    const score =
      0.35 * normalizedWavg +
      0.20 * normalizedCw +
      0.10 * normalizedH +
      0.10 * normalizedT +
      0.10 * normalizedAob +
      0.05 * normalizedC +
      0.05 * normalizedSg +
      0.05 * normalizedSf;
  
    return score;
  }
  
  // Example of how to call the function with actual data
  const score = calculateScoreFactor({
    Wavg: 10,  // Average wind speed in mph
    Cw: 80,    // Wind consistency as percentage
    H: 500,    // Elevation in meters
    T: 'hilly', // Terrain type
    Aob: 30,   // Proximity to grid in miles
    C: 50,     // Custom factor
    Sg: 70,    // Soil quality
    Sf: 20     // Snowfall as percentage
  });
  
  console.log("Suitability Score:", score);
  