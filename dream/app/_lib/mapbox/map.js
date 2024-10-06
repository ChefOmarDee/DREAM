"use client";

import React, { useRef, useState } from "react";
import Map, { Source, Layer } from "react-map-gl";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_KEY; // Use your Mapbox token here

const stateCoordinates = [
  { name: "Alabama", latitude: 32.806671, longitude: -86.791130 },
  { name: "Alaska", latitude: 61.370716, longitude: -152.404419 },
  { name: "Arizona", latitude: 33.729759, longitude: -111.431221 },
  { name: "Arkansas", latitude: 34.969704, longitude: -92.373123 },
  { name: "California", latitude: 36.116203, longitude: -119.681564 },
  { name: "Colorado", latitude: 39.059811, longitude: -105.311104 },
  { name: "Connecticut", latitude: 41.597782, longitude: -72.755371 },
  { name: "Delaware", latitude: 39.318523, longitude: -75.507141 },
  { name: "Florida", latitude: 27.766279, longitude: -81.686783 },
  { name: "Georgia", latitude: 33.040619, longitude: -83.643074 },
  { name: "Hawaii", latitude: 21.094318, longitude: -157.498337 },
  { name: "Idaho", latitude: 44.240459, longitude: -114.478828 },
  { name: "Illinois", latitude: 40.349457, longitude: -88.986137 },
  { name: "Indiana", latitude: 39.849426, longitude: -86.258278 },
  { name: "Iowa", latitude: 42.011539, longitude: -93.210526 },
  { name: "Kansas", latitude: 38.526600, longitude: -96.726486 },
  { name: "Kentucky", latitude: 37.668140, longitude: -84.670067 },
  { name: "Louisiana", latitude: 31.169546, longitude: -91.867805 },
  { name: "Maine", latitude: 44.693947, longitude: -69.381927 },
  { name: "Maryland", latitude: 39.063946, longitude: -76.802101 },
  { name: "Massachusetts", latitude: 42.230171, longitude: -71.530106 },
  { name: "Michigan", latitude: 43.326618, longitude: -84.536095 },
  { name: "Minnesota", latitude: 45.694454, longitude: -93.900192 },
  { name: "Mississippi", latitude: 32.741646, longitude: -89.678696 },
  { name: "Missouri", latitude: 38.456085, longitude: -92.288368 },
  { name: "Montana", latitude: 46.921925, longitude: -110.454353 },
  { name: "Nebraska", latitude: 41.125370, longitude: -98.268082 },
  { name: "Nevada", latitude: 38.313515, longitude: -117.055374 },
  { name: "New Hampshire", latitude: 43.452492, longitude: -71.563896 },
  { name: "New Jersey", latitude: 40.298904, longitude: -74.521011 },
  { name: "New Mexico", latitude: 34.840515, longitude: -106.248482 },
  { name: "New York", latitude: 42.165726, longitude: -74.948051 },
  { name: "North Carolina", latitude: 35.630066, longitude: -79.806419 },
  { name: "North Dakota", latitude: 47.528912, longitude: -99.784012 },
  { name: "Ohio", latitude: 40.388783, longitude: -82.764915 },
  { name: "Oklahoma", latitude: 35.565342, longitude: -96.928917 },
  { name: "Oregon", latitude: 44.572021, longitude: -122.070938 },
  { name: "Pennsylvania", latitude: 40.590752, longitude: -77.209755 },
  { name: "Rhode Island", latitude: 41.680893, longitude: -71.511780 },
  { name: "South Carolina", latitude: 33.856892, longitude: -80.945007 },
  { name: "South Dakota", latitude: 44.299782, longitude: -99.438828 },
  { name: "Tennessee", latitude: 35.747845, longitude: -86.692345 },
  { name: "Texas", latitude: 31.054487, longitude: -97.563461 },
  { name: "Utah", latitude: 40.150032, longitude: -111.862434 },
  { name: "Vermont", latitude: 44.045876, longitude: -72.710686 },
  { name: "Virginia", latitude: 37.769337, longitude: -78.169968 },
  { name: "Washington", latitude: 47.400902, longitude: -121.490494 },
  { name: "West Virginia", latitude: 38.491226, longitude: -80.954456 },
  { name: "Wisconsin", latitude: 44.268543, longitude: -89.616508 },
  { name: "Wyoming", latitude: 42.755966, longitude: -107.302490 },
];

const MapComponent = () => {
  const mapRef = useRef();
  const [stateName, setStateName] = useState("");

  // Coordinates for a larger square around Washington, DC
  const squareCoordinates = [
    [-80.41457250104, 27.55794136438],
    [-80.41457550099, 27.55789836432],
    [-80.41457050091, 27.55783236425],
  ];

  const squareGeoJSON = {
    type: "Feature",
    geometry: {
      type: "Polygon",
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

  // Function to handle state name submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Find the state coordinates by state name
    const state = stateCoordinates.find(
      (state) => state.name.toLowerCase() === stateName.toLowerCase()
    );

    if (state) {
      // Fly the map to the state's coordinates
      mapRef.current.flyTo({
        center: [state.longitude, state.latitude],
        zoom: 6, // Adjust the zoom level for better visibility
        essential: true, // Ensures smooth map animation
      });
    } else {
      alert("State not found. Please try again.");
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
          zoom: 13, // Zoom level set for better visibility
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
              "fill-color": "red", // Fill the square with red color
              "fill-opacity": 0.5, // Set opacity
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

      {/* State Name Input Popup */}
      <div className="absolute bottom-4 right-4 p-4 bg-white rounded shadow-md z-10">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Enter State Name"
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
            className="border border-gray-300 p-2 rounded w-40"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
};

export default MapComponent;
