"use client";

import React, { useRef, useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl';

const MAPBOX_TOKEN = "pk.eyJ1IjoiYnJvcDEiLCJhIjoiY20xd2YxOWcxMG04NjJsb3JwdjV6a3E0OCJ9.D_iqH_nw8cEFZMicjWPVog"; // Use your Mapbox token here

const MapComponent = () => {
  const mapRef = useRef();
  const [zipCode, setZipCode] = useState('');

  // Coordinates for a larger square around Washington, DC
  const squareCoordinates = [
    [-77.0369, 38.9072], // Point 1 (bottom-left, DC coordinates)
    [-77.0369, 38.9272], // Point 2 (top-left)
    [-77.0169, 38.9272], // Point 3 (top-right)
    [-77.0169, 38.9072], // Point 4 (bottom-right)
    [-77.0369, 38.9072], // Closing the loop (back to Point 1)
  ];

  const squareGeoJSON = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [squareCoordinates],
    },
  };

  // Function to handle zoom in
  const handleZoomIn = () => {
    mapRef.current.zoomIn();
  };

  // Function to handle zoom out
  const handleZoomOut = () => {
    mapRef.current.zoomOut();
  };

  // Function to handle zip code submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Fetch the coordinates using the Mapbox Geocoding API
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${zipCode}.json?access_token=${MAPBOX_TOKEN}`
    );
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;

      // Fly the map to the new location based on the zip code
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: 12,
        essential: true, // This ensures the map animation is smooth
      });
    } else {
      alert('Zip code not found. Please try again.');
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* The Map */}
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: 38.9072, // Washington, DC
          longitude: -77.0369, 
          zoom: 13,  // Zoom level set for better visibility
        }}
        className="absolute inset-0 w-full h-full"
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {/* Add the polygon for the square */}
        <Source id="square" type="geojson" data={squareGeoJSON}>
          <Layer
            id="square-layer"
            type="fill"
            paint={{
              'fill-color': 'red',  // Fill the square with red color
              'fill-opacity': 0.5,  // Set opacity
            }}
          />
        </Source>
      </Map>
      
      {/* Zoom Controls */}
      <div className="absolute w-10 top-6 left-4 flex flex-col space-y-2">
        <button 
          onClick={handleZoomIn} 
          className="bg-white p-2 rounded shadow hover:bg-gray-200"
        >
          <div className="font-extrabold text-gray-300">+</div>
        </button>
        <button 
          onClick={handleZoomOut} 
          className="bg-white p-2 rounded shadow hover:bg-gray-200"
        >
          <div className="font-black text-gray-300">-</div>
        </button>
      </div>

      {/* Zip Code Input Popup */}
      <div className="absolute bottom-4 right-4 p-4 bg-white rounded shadow-md z-10">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Enter Zip Code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="border border-gray-300 p-2 rounded w-40"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Enter
          </button>
        </form>
      </div>
    </div>
  );
};

export default MapComponent;

