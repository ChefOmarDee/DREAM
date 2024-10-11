"use client"
import React, { useRef, useState } from "react";
import Map, { Source, Layer } from "react-map-gl";
import axios from 'axios';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

const MapComponent = () => {
  const mapRef = useRef();
  const [countyName, setCountyName] = useState("");
  const [zipcodeData, setZipcodeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchZipcodeData = async () => {
    if (!countyName.trim()) {
      setError("Please enter a county name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/getZipcodeData", { countyname: countyName.trim() });
      
      if (response.data && Array.isArray(response.data)) {
        setZipcodeData(response.data);
        console.log(response.data[0])
        // If we have data, zoom to the first zipcode's coordinates
        if (response.data.length > 0 && response.data[0].lat && response.data[0].long) {
          mapRef.current.flyTo({
            center: [response.data[0].long, response.data[0].lat],
            zoom: 10,
            essential: true,
          });
        }
      }
    } catch (error) {
      setError(error.response?.data?.error || "Error fetching data");
      console.error("Error fetching zipcode data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setZipcodeData([]);
    setCountyName("");
    setError("");
    mapRef.current.flyTo({
      center: [-98.5795, 39.8283],
      zoom: 3,
      essential: true,
    });
  };

  const getColor = (lucidscore) => {
    if (lucidscore === undefined || lucidscore === null) return 'rgb(255,255,255)'; // White for undefined
    if (lucidscore === 0) return 'rgb(255,0,0)'; // Red for 0
  
    const score = Math.max(0, Math.min(1, lucidscore));
  
    if (score < 0.2) {
      // Red to orange-red
      return `rgb(255,${Math.floor(score * 5 * 255)},0)`;
    } else if (score < 0.4) {
      // Orange-red to yellow
      return `rgb(255,${Math.floor(128 + score * 2.5 * 127)},0)`;
    } else if (score < 0.6) {
      // Yellow to light green
      return `rgb(${Math.floor(255 - (score - 0.4) * 5 * 255)},255,0)`;
    } else if (score < 0.8) {
      // Light green to green
      return `rgb(0,255,${Math.floor((0.8 - score) * 5 * 255)})`;
    } else {
      // Green to dark green
      return `rgb(0,${Math.floor(255 - (score - 0.8) * 5 * 255)},0)`;
    }
  };

  const createGeoJsonData = () => {
    if (!zipcodeData || zipcodeData.length === 0) return null;

    return {
      type: "FeatureCollection",
      features: zipcodeData
        .filter(zipcode => zipcode && zipcode.geojson)
        .map((zipcode) => ({
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [zipcode.geojson],
          },
          properties: {
            color: getColor(zipcode.score),
            zipcode: zipcode.zipcode,
            score: zipcode.score
          },
        })),
    };
  };

  const zipcodeLayer = {
    id: "zipcode-layer",
    type: "fill",
    paint: {
      "fill-color": ["get", "color"],
      "fill-opacity": 0.7,
    },
  };

  const zipcodeOutlineLayer = {
    id: "zipcode-outline",
    type: "line",
    paint: {
      "line-color": "#000",
      "line-width": 1,
    },
  };

  const geoJsonData = createGeoJsonData();

  return (
    <div className="relative w-full h-screen">
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: 39.8283,
          longitude: -98.5795,
          zoom: 3,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v10"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {geoJsonData && (
          <Source id="zipcode-data" type="geojson" data={geoJsonData}>
            <Layer {...zipcodeLayer} />
            <Layer {...zipcodeOutlineLayer} />
          </Source>
        )}
      </Map>

      <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded shadow-md space-y-2">
        <div className="space-y-2">
          <input
            type="text"
            value={countyName}
            onChange={(e) => setCountyName(e.target.value)}
            placeholder="Enter county name"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button
            onClick={fetchZipcodeData}
            disabled={loading}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? "Loading..." : "Search"}
          </button>
          <button
            onClick={handleReset}
            className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reset Map
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        {zipcodeData.length > 0 && (
          <div className="text-sm text-gray-600">
            Found {zipcodeData.length} zipcodes
          </div>
        )}
      </div>

      <div className="absolute w-10 top-20 left-4 flex flex-col space-y-2">
        <button
          onClick={() => mapRef.current.zoomIn()}
          className="bg-white p-2 rounded shadow hover:bg-gray-200"
        >
          <div className="font-extrabold text-gray-300">+</div>
        </button>
        <button
          onClick={() => mapRef.current.zoomOut()}
          className="bg-white p-2 rounded shadow hover:bg-gray-200"
        >
          <div className="font-black text-gray-300">-</div>
        </button>
      </div>

    </div>
  );
};


export default MapComponent;