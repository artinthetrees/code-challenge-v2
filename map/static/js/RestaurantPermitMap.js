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
        // console.log('Updated State:', currentYearData);
      })
      .catch(error => console.error('Error:', error)); // Log errors
  }, [testyearlyDataEndpoint])

  useEffect(() => {
    console.log('Updated State:', currentYearData);
  }, [currentYearData]);

  // Get total number of permits across all community areas in the selected year
  const totalPermits = currentYearData.reduce((accumulator, currentItem) => {
    return accumulator + currentItem.num_permits;
  }, 0); // 0 is the initialValue
  console.log('Total Permits:', totalPermits); 

  // Get max number of permits in a single community area in the selected year
  const maxPermits = Math.max(...currentYearData.map(item => item.num_permits));
  console.log('Max Permits:', maxPermits); 

  // Get quartiles of percent permits 
  const getQuartiles = (arr, key) => {
    // 1. Extract key values from each dictionary in array of dictionaries and sort values numerically
    const values = arr.map(item => item[key]).sort((a, b) => a - b);
    
    const quantile = (sortedArr, q) => {
      const pos = (sortedArr.length - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;
      if (sortedArr[base + 1] !== undefined) {
        return sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base]);
      } else {
        return sortedArr[base];
      }
    };

    return {
      "q1": quantile(values, 0.25),
      "q2": quantile(values, 0.50), // Median
      "q3": quantile(values, 0.75)
    };
  };

  const permitPercentQuartiles = getQuartiles(currentYearData,'percent_permits')
  console.log('Percent Permits Quartiles:', permitPercentQuartiles);

  function getColor(percentageOfPermits) {
    /**
     * TODO: Use this function in setAreaInteraction to set a community 
     * area's color using the communityAreaColors constant above
     */
    console.log('check percentageOfPermits:', percentageOfPermits);
    console.log('check permitPercentQuartiles:', permitPercentQuartiles.q1);
    console.log('check permitPercentQuartiles:', permitPercentQuartiles.q2);
    console.log('check permitPercentQuartiles:', permitPercentQuartiles.q3);
    if (percentageOfPermits <= permitPercentQuartiles.q1) {
      console.log('check:', '1');
      return communityAreaColors[0];
    } else if (percentageOfPermits <= permitPercentQuartiles.q2) {
      console.log('check:', '2');
      return communityAreaColors[1];
    } else if (percentageOfPermits <= permitPercentQuartiles.q3) {
      console.log('check:', '3');
      return communityAreaColors[2];
    } else {
      console.log('check:', '4');
      return communityAreaColors[3];
    }

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
    console.log('ca name:', ca_name); 
    const ca_model_data = currentYearData.find(ca_entry => ca_entry.name === ca_name);
    console.log('ca model data:', ca_model_data);
    const ca_model_data_str = JSON.stringify(ca_model_data, null, 2)
    
    console.log('Percent Permits Quartiles:', permitPercentQuartiles);
    let ca_color = getColor(ca_model_data.percent_permits)
    console.log('ca color:', ca_color);
    // const ca_model_data = currentYearData.at(0);
    // const result = ca_model_data ?? "Default String"; 
    // const result2 = currentYearData?.length ?? 0;
    // const ca_raw_permit_count = ca_model_data.num_permits;
    // const ca_raw_permit_count_str = ca_raw_permit_count.toString();
    // const ca_popup = `${ca_name}, ${ca_raw_permit_count_str}`;
    layer.setStyle({
      // fillColor: '#ff0000', // Red fill color for shading
      fillColor: ca_color, // Red fill color for shading
      fillOpacity: 0.5,    // Semi-transparent
      color: '#000000',    // Border color
      weight: 2            // Border weight
    })
    layer.on("mouseover", () => {
      // layer.bindPopup(result2.toString())
      layer.bindPopup(ca_model_data_str)
      layer.openPopup()
    })
  }

  return (
    <>
      <YearSelect filterVal={year} setFilterVal={setYear} />
      <p className="fs-4">
        Restaurant permits issued this year: { totalPermits }
      </p>
      <p className="fs-4">
        Maximum number of restaurant permits in a single area: { maxPermits }
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
        {/* <GeoJSON 
          data={RAW_COMMUNITY_AREAS} 
          onEachFeature={setAreaInteraction}
          key={maxPermits}
        /> */}
        {currentYearData.length > 0 ? (
          <GeoJSON
            data={RAW_COMMUNITY_AREAS}
            onEachFeature={setAreaInteraction}
            key={maxPermits}
          />
        ) : null}
      </MapContainer>
    </>
  )
}
