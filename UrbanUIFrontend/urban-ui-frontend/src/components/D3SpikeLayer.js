import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import L from 'leaflet';

const D3SpikeLayer = ({ data }) => {
  const map = useMap();

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
      .attr("pointer-events", "visible")
      .on("mouseover", function (event, d) {
        const [longitude, latitude] = d.geometry.coordinates[0];
        const value = d.properties.value;
        const sensorName = d.properties.sensorName;

        const popup = L.popup()
          .setLatLng([latitude, longitude])
          .setContent(`<b>Sensor:</b> ${sensorName}<br><b>Value:</b> ${value.toFixed(2)}`);

        setTimeout(() => {
          popup.openOn(map);
        }, 100);

        event.stopPropagation();
      })
      .on("mouseout", function () {
        map.closePopup();
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
  }, [data, map]);

  return null;
};

export default D3SpikeLayer;
