import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import D3BubbleLayer from './D3BubbleLayer';
import useDataFetch from '../hooks/useDataFetch';
import CircularProgress from '@mui/material/CircularProgress';

const BubbleMap = ({ pollutant, days }) => {
  const { data, loading, error } = useDataFetch(`/api/data/${pollutant}?days=${days}`, { remove_outliers: false });
  const center = [54.97226, -1.61731];

  if (loading) return <CircularProgress />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <MapContainer center={center} zoom={13} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
      />
      <D3BubbleLayer data={data} />
    </MapContainer>
  );
};

export default BubbleMap;
