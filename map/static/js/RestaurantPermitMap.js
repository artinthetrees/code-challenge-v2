import React, { useEffect, useState } from "react"

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet"

import "leaflet/dist/leaflet.css"

import RAW_COMMUNITY_AREAS from "../../../data/raw/community-areas.geojson"

function YearSelect({ setFilterVal }) {
  // Filter by the permit issue year for each restaurant
  const startYear = 2026
  const years = [...Array(11).keys()].map((increment) => {
    return startYear - increment
  })
  const options = years.map((year) => {
    return (
      <option value={year} key={year}>
        {year}
      </option>
    )
  })

  return (
    <>
      <label htmlFor="yearSelect" className="fs-3">
        Filter by year:{" "}
      </label>
      <select
        id="yearSelect"
        className="form-select form-select-lg mb-3"
        onChange={(e) => setFilterVal(e.target.value)}
      >
        {options}
      </select>
    </>
  )
}

export default function RestaurantPermitMap() {
  const communityAreaColors = ["#eff3ff", "#bdd7e7", "#6baed6", "#2171b5"]

  const [currentYearData, setCurrentYearData] = useState([])
  const [year, setYear] = useState(2026)

  const yearlyDataEndpoint = `/map-data/?year=${year}`
  const testyearlyDataEndpoint = `http://localhost:8000/map-data/?year=${year}`

  useEffect(() => {
    fetch(testyearlyDataEndpoint)
      .then((res) => {
        console.log('Status:', res.status);
        // console.log('Data:', res.json());
        return res.json()
      })  
      .then((data) => {
        /**
         * TODO: Fetch the data needed to supply to map with data
         */
        console.log('Data:', data);
        setCurrentYearData(data);
      })
      .catch(error => console.error('Error:', error)); // Log errors
  }, [testyearlyDataEndpoint])

  // useEffect(() => {
  //   // 1. Add error handling and return the promise
  //   fetch(testyearlyDataEndpoint)
  //     .then((res) => {
  //       if (!res.ok) {
  //         throw new Error('Network response was not ok');
  //       }
  //       return res.json(); // <--- CRITICAL FIX: Return the promise
  //     })
  //     .then((data) => {
  //       setCurrentYearData(data); // Set state with the parsed data
  //     })
  //     .catch((error) => {
  //       console.error('Fetch error:', error);
  //       // Optional: Set an error state here to display to the user
  //     });
  // }, [testyearlyDataEndpoint]); // Runs when 'year' changes


  function getColor(percentageOfPermits) {
    /**
     * TODO: Use this function in setAreaInteraction to set a community 
     * area's color using the communityAreaColors constant above
     */
  }

  function setAreaInteraction(feature, layer) {
    /**
     * TODO: Use the methods below to:
     * 1) Shade each community area according to what percentage of 
     * permits were issued there in the selected year
     * 2) On hover, display a popup with the community area's raw 
     * permit count for the year
     */
    const ca_name = feature?.properties?.community || "Unknown";
    // const ca_model_data = currentYearData.find(ca_entry => ca_entry.name === ca_name);
    const ca_model_data = currentYearData.at(0);
    const result = ca_model_data ?? "Default String"; 
    const result2 = currentYearData?.length ?? 0;
    // const ca_raw_permit_count = ca_model_data.num_permits;
    // const ca_raw_permit_count_str = ca_raw_permit_count.toString();
    // const ca_popup = `${ca_name}, ${ca_raw_permit_count_str}`;
    layer.setStyle({
      fillColor: '#ff0000', // Red fill color for shading
      fillOpacity: 0.5,    // Semi-transparent
      color: '#000000',    // Border color
      weight: 2            // Border weight
    })
    layer.on("mouseover", () => {
      // layer.bindPopup(result2.toString())
      layer.bindPopup(result2.toString())
      layer.openPopup()
    })
  }

  return (
    <>
      <YearSelect filterVal={year} setFilterVal={setYear} />
      <p className="fs-4">
        Restaurant permits issued this year: {/* TODO: display this value */}
      </p>
      <p className="fs-4">
        Maximum number of restaurant permits in a single area:
        {  testyearlyDataEndpoint  }
      </p>
      <MapContainer
        id="restaurant-map"
        center={[41.88, -87.62]}
        zoom={10}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"
        />
        <GeoJSON 
          data={RAW_COMMUNITY_AREAS} 
          onEachFeature={setAreaInteraction}
        />
        {/* {currentYearData.length > 0 ? (
          <GeoJSON
            data={RAW_COMMUNITY_AREAS}
            onEachFeature={setAreaInteraction}
            key={maxNumPermits}
          />
        ) : null} */}
      </MapContainer>
    </>
  )
}
