import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import D3SpikeLayer from './D3SpikeLayer';
import useDataFetch from '../hooks/useDataFetch';
import CircularProgress from '@mui/material/CircularProgress';

const SpikeMap = ({ pollutant, days }) => {
  const { data, loading, error } = useDataFetch(`/api/data/${pollutant}?days=${days}`, { remove_outliers: false });
  const center = [54.97226, -1.61731];

  if (loading) return <CircularProgress />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <MapContainer center={center} zoom={13} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
      />
      <D3SpikeLayer data={data} />
    </MapContainer> 
  );
};

export default SpikeMap;
