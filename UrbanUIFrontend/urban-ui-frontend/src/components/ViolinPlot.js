import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import useDataFetch from '../hooks/useDataFetch';
import withAutoResize from './withAutoResize';

const ViolinPlot = ({ pollutant, width, height, showOutliers = true, days = 1 }) => {
  const svgRef = useRef();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const { data, loading, error } = useDataFetch(`/api/data/${pollutant}?days=${days}`, { remove_outliers: !showOutliers });

  useEffect(() => {
    if (loading || error || !data) return;

    // Preprocess the data to fit the expected format for the violin plot
    const processedData = [
      {
        category: pollutant,
        values: data.map(item => item.Value)
      }
    ];

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('margin-top', '10px')
      .style('border-radius', '8px')
      .style('box-shadow', theme.shadows[1]);

    svg.selectAll('*').remove(); // Clear previous content

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const yScale = d3.scaleLinear()
      .domain([d3.min(processedData, d => d3.min(d.values)) * 0.9, d3.max(processedData, d => d3.max(d.values)) * 1.1])
      .range([innerHeight, 0]);

    const xScale = d3.scaleBand()
      .domain(processedData.map(d => d.category))
      .range([0, innerWidth])
      .padding(0.2);

    const binBuilder = d3.bin()
      .domain(yScale.domain())
      .thresholds(yScale.ticks(24)); // Adjust the number of bins

    // Define color scales for light and dark mode
    const lightColorPalette = d3.schemeSet2;
    const darkColorPalette = d3.schemeSet1; // Adjust the palette if needed for dark mode

    const colorScale = d3.scaleOrdinal()
      .domain(processedData.map(d => d.category))
      .range(isDarkMode ? darkColorPalette : lightColorPalette);

    const areaBuilder = d3.area()
      .x0(d => d.length > 0 ? -xScale.bandwidth() / 2 : 0)
      .x1(d => d.length > 0 ? xScale.bandwidth() / 2 : 0)
      .y(d => yScale(d.x0))
      .curve(d3.curveCatmullRom);

    processedData.forEach(d => {
      const bins = binBuilder(d.values);
      const maxBinCount = d3.max(bins, d => d.length);

      const scaleX = d3.scaleLinear()
        .domain([-maxBinCount, maxBinCount])
        .range([-xScale.bandwidth() / 2, xScale.bandwidth() / 2]);

      areaBuilder
        .x0(d => scaleX(-d.length))
        .x1(d => scaleX(d.length));

      g.append('path')
        .datum(bins)
        .attr('d', areaBuilder)
        .attr('transform', `translate(${xScale(d.category) + xScale.bandwidth() / 2}, 0)`)
        .style('fill', colorScale(d.category))
        .style('stroke', 'black')
        .style('opacity', 0.7);
    });

    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', margin.bottom - 10)
      .attr('fill', theme.palette.text.primary)
      .style('text-anchor', 'middle')
      .text('Pollutant');

    g.append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('x', -margin.left)
      .attr('y', -10)
      .attr('fill', theme.palette.text.primary)
      .style('text-anchor', 'middle')
      .text('Value');

    return () => {
      // Properly clean up any D3 resources or event listeners here
      svg.selectAll('*').remove();
    };

  }, [data, width, height, loading, error, pollutant, showOutliers, theme]);

  if (loading) return <CircularProgress />;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return <p>No data available.</p>;

  return <svg ref={svgRef}></svg>;
};

export default withAutoResize(ViolinPlot);
