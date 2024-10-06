// Function to normalize using Min-Max scaling
function normalize(value, min, max) {
    return (value - min) / (max - min);
  }
  
  // Function to calculate score factor for windmill suitability
  function calculateScoreFactor({
    Wavg,   // Average wind speed
    Gavg,   // Average wind gust
    Tfac,   // Temp. Factor
    Hfac,   // Humidity Factor
    Pfac   // Precipitation Factor
  }) {
    // Normalize each factor
    const normalizedWavg = normalize(Wavg, 3, 25); 
    const normalizedGavg = normalize(Gavg, 18, 108); 
    const normalizedTfac = normalize(Tfac, -30, 50);
    const normalizedHfac = normalize(Hfac, 0, 100);
    const normalizedPfac = normalize(Pfac, 0, 2000);
  
    // No normalization needed for percentage data (Cw, Sf) as they're already 0-1
    // const normalizedCw = Cw / 100;
    // const normalizedSf = Sf / 100;
  
    // Normalize custom factor C if needed (example range 0-100)
    // const normalizedC = normalize(C, 0, 100);
  
    // Calculate the final score using the given formula
    const score =
      0.45 * normalizedWavg +
      0.15 * normalizedGavg +
      0.10 * normalizedPfac +
      0.20 * normalizedTfac +
      0.10 * normalizedHfac;
    return score;
  }
  
  // Example of how to call the function with actual data
  // const score = calculateScoreFactor({
  //   Wavg: 10,    // Average wind speed in m/s
  //   Gavg: 30,    // Average wind gust in km/h
  //   Tfac: 15,    // Temperature in °C
  //   Hfac: 50,    // Humidity in percentage
  //   Pfac: 1000   // Precipitation in mm
  // });
  
  console.log("Suitability Score:", score);
  