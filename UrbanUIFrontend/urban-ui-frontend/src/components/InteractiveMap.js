import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as d3 from 'd3';
import L from 'leaflet';
import useDataFetch from '../hooks/useDataFetch';

const createSpikes = (data, map, scaleFactor) => {
    const svg = d3.select(map.getPanes().overlayPane).append("svg");
    const g = svg.append("g").attr("class", "leaflet-zoom-hide");

    const transform = d3.geoTransform({ point: projectPoint });
    const path = d3.geoPath().projection(transform);

    function projectPoint(x, y) {
        const point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }

    const feature = g.selectAll("path")
        .data(data)
        .enter().append("path");

    function reset() {
        const bounds = path.bounds({ type: "FeatureCollection", features: data });
        const topLeft = bounds[0];
        const bottomRight = bounds[1];

        svg.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", `${topLeft[0]}px`)
            .style("top", `${topLeft[1]}px`);

        g.attr("transform", `translate(${-topLeft[0]},${-topLeft[1]})`);

        feature.attr("d", path)
            .attr("stroke", "#FF7518")
            .attr("stroke-width", 2.5)
            .attr("fill", "none");
    }

    map.on("zoomend", reset);
    reset();
};

const InteractiveMap = ({ pollutant }) => {
    const { data, loading, error } = useDataFetch(`/api/data/${pollutant}`, {});
    const mapRef = useRef();

    useEffect(() => {
        if (!loading && !error && data.length > 0) {
            const transformedData = data.map(item => {
                const coords = [item['Sensor Centroid Longitude'], item['Sensor Centroid Latitude']];
                const value = item['Value'];
                const length = Math.log1p(value) * 100; // Scale factor for the spikes

                return {
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: [
                            coords,
                            [coords[0], coords[1] + length * 1e-5]
                        ]
                    }
                };
            });

            const map = mapRef.current;
            if (map) {
                createSpikes(transformedData, map, 100);
            }
        }
    }, [data, loading, error]);

    if (loading) return <Typography>Loading map...</Typography>;
    if (error) return <Typography>Error: {error.message}</Typography>;

    return (
        <Box>
            <Paper elevation={3} sx={{ height: '400px', width: '100%' }}>
                <MapContainer
                    center={[54.97226, -1.61731]} // Default position
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                </MapContainer>
            </Paper>
        </Box>
    );
};

export default InteractiveMap;
