import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import L from 'leaflet';
import { useTheme } from '@mui/material/styles';
import useDataFetch from '../hooks/useDataFetch';

// Fix spikes, add winsorization, add tooltips

const D3Layer = ({ data }) => {
  const map = useMap();
  const theme = useTheme();

  useEffect(() => {
    const svg = d3.select(map.getPanes().overlayPane).append("svg");
    const g = svg.append("g").attr("class", "leaflet-zoom-hide");

    const transform = d3Geo.geoTransform({
      point: projectPoint,
    });
    const path = d3Geo.geoPath().projection(transform);

    const scaleFactor = 100;

    const createSpikes = (data) => {
      return data.map((item) => {
        const coords = [item['Sensor Centroid Longitude'], item['Sensor Centroid Latitude']];
        const value = item['Value'];
        const length = Math.log1p(value) * scaleFactor;

        return {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              coords,
              [coords[0], coords[1] + length * 1e-5],
            ],
          },
          properties: {
            value,
            sensorName: item['Sensor Name'],
          },
        };
      });
    };

    const spikesData = createSpikes(data);

    const colorScale = d3.scaleSequential(d3.interpolateOranges).domain([0, d3.max(data, (d) => d['Value'])]);

    const format = d3.format(",.0f");
    const d3_features = g.selectAll("g")
    .data(spikesData)
    .enter()
    .append("path")
    .attr("d", (d) => {
      const start = map.latLngToLayerPoint(new L.LatLng(d.geometry.coordinates[0][1], d.geometry.coordinates[0][0]));
      const end = map.latLngToLayerPoint(new L.LatLng(d.geometry.coordinates[1][1], d.geometry.coordinates[1][0]));
      return `M${start.x},${start.y}L${end.x},${end.y}`;
    })
    .attr("stroke", (d) => colorScale(d.properties.value))
    .attr("stroke-width", 2.5)
    .attr("fill", "none")
    .attr("pointer-events","visible")
    .on("mouseover", function (event, d) {
      console.log("Mouseover")
      const [longitude, latitude] = d.geometry.coordinates[0];
      const value = d.properties.value;
      const sensorName = d.properties.sensorName;

      const popup = L.popup()
        .setLatLng([latitude, longitude])
        .setContent(`<b>Sensor:</b> ${sensorName}<br><b>Value:</b> ${value.toFixed(2)}`);

      // Open the popup with a slight delay to improve user experience
      setTimeout(() => {
        popup.openOn(map);
      }, 100);

      // Prevent event propagation to ensure Leaflet handles it correctly
      event.stopPropagation();
    })
    .on("mouseout", function () {
      // Close the popup on mouseout
      map.closePopup();
      d3.select(this).append("title").text((d) => `${d.properties.sensorName}, ${d.properties.value}`);
    });


    const reset = () => {
      const bounds = path.bounds({ type: "FeatureCollection", features: spikesData });
      const topLeft = bounds[0];
      const bottomRight = bounds[1];

      svg
        .attr("width", bottomRight[0] - topLeft[0])
        .attr("height", bottomRight[1] - topLeft[1])
        .style("left", `${topLeft[0]}px`)
        .style("top", `${topLeft[1]}px`);

      g.attr("transform", `translate(${-topLeft[0]},${-topLeft[1]})`);

      d3_features.attr("d", path);
    };

    map.on("viewreset", reset);
    map.on("zoomend", reset);
    map.on("moveend", reset);
    reset();

    function projectPoint(x, y) {
      const point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    return () => {
      svg.remove();
    };
  }, [data, map, theme]);

  return null;
};

const InteractiveMap = ({ pollutant }) => {
  const { data, loading, error } = useDataFetch(`/api/data/${pollutant}`, { remove_outliers: false });
  const center = [54.97226, -1.61731];

  if (loading) return <p>Loading map...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <MapContainer center={center} zoom={13} style={{ height: "500px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
      <D3Layer data={data} />
    </MapContainer>
  );
};

export default InteractiveMap;
