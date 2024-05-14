import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import L from 'leaflet';

const D3BubbleLayer = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    const svg = d3.select(map.getPanes().overlayPane).append("svg");
    const g = svg.append("g").attr("class", "leaflet-zoom-hide");

    const transform = d3Geo.geoTransform({
      point: projectPoint,
    });
    const path = d3Geo.geoPath().projection(transform);

    const createBubbles = (data) => {
      return data.map((item) => {
        const coords = [item['Sensor Centroid Longitude'], item['Sensor Centroid Latitude']];
        const value = item['Value'];
        const radius = Math.log1p(value) * 5; // Adjust the scale factor for better visualization

        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: coords,
          },
          properties: {
            value,
            sensorName: item['Sensor Name'],
            radius,
          },
        };
      });
    };

    const bubblesData = createBubbles(data);

    const colorScale = d3.scaleSequential(d3.interpolateOranges).domain([0, d3.max(data, (d) => d['Value'])]);

    const d3_features = g.selectAll("circle")
      .data(bubblesData)
      .enter()
      .append("circle")
      .attr("cx", (d) => map.latLngToLayerPoint(new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0])).x)
      .attr("cy", (d) => map.latLngToLayerPoint(new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0])).y)
      .attr("r", (d) => d.properties.radius)
      .attr("fill", (d) => colorScale(d.properties.value))
      .attr("fill-opacity", 0.6)
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .on("mouseover", function (event, d) {
        const [longitude, latitude] = d.geometry.coordinates;
        const value = d.properties.value;
        const sensorName = d.properties.sensorName;

        const popup = L.popup()
          .setLatLng([latitude, longitude])
          .setContent(`<b>Sensor:</b> ${sensorName}<br><b>Value:</b> ${value.toFixed(2)}`)
          .openOn(map);

        event.stopPropagation();
      })
      .on("mouseout", function () {
        map.closePopup();
      });

    const reset = () => {
      const bounds = path.bounds({ type: "FeatureCollection", features: bubblesData });
      const topLeft = bounds[0];
      const bottomRight = bounds[1];

      svg
        .attr("width", bottomRight[0] - topLeft[0])
        .attr("height", bottomRight[1] - topLeft[1])
        .style("left", `${topLeft[0]}px`)
        .style("top", `${topLeft[1]}px`);

      g.attr("transform", `translate(${-topLeft[0]},${-topLeft[1]})`);

      d3_features
        .attr("cx", (d) => map.latLngToLayerPoint(new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0])).x)
        .attr("cy", (d) => map.latLngToLayerPoint(new L.LatLng(d.geometry.coordinates[1], d.geometry.coordinates[0])).y);
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

export default D3BubbleLayer;
