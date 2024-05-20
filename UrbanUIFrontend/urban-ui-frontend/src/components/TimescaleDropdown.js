import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const TimescaleDropdown = ({ timescale, setTimescale }) => {
  return (
    <FormControl size="small" sx={{ minWidth: 120, marginRight: 2 }}>
      <InputLabel id="timescale-select-label">Timescale</InputLabel>
      <Select
        labelId="timescale-select-label"
        id="timescale-select"
        value={timescale}
        label="Timescale"
        onChange={(e) => setTimescale(e.target.value)}
      >
        <MenuItem value={1}>1 Day</MenuItem>
        <MenuItem value={3}>3 Days</MenuItem>
        <MenuItem value={7}>1 Week</MenuItem>
        <MenuItem value={30}>1 Month</MenuItem>
      </Select>
    </FormControl>
  );
};

export default TimescaleDropdown;
