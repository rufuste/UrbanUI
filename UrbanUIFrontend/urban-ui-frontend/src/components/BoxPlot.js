import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import useDataFetch from '../hooks/useDataFetch';
import withAutoResize from './withAutoResize';

const BoxPlot = ({ pollutant, width, height, showOutliers = true, days = 1 }) => {
  const svgRef = useRef();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const { data, loading, error } = useDataFetch(`/api/data/${pollutant}?days=${days}`, { remove_outliers: !showOutliers });

  useEffect(() => {
    if (loading || error || !data) return;

    // Preprocess the data to compute quartiles, median, etc.
    const values = data.map(d => d.Value).sort(d3.ascending);
    const q1 = d3.quantile(values, 0.25);
    const median = d3.quantile(values, 0.5);
    const q3 = d3.quantile(values, 0.75);
    const interQuantileRange = q3 - q1;
    const min = Math.max(d3.min(values), q1 - 1.5 * interQuantileRange);
    const max = Math.min(d3.max(values), q3 + 1.5 * interQuantileRange);

    const margin = { top: 20, right: 30, bottom: 50, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', theme.palette.background.paper)
      .style('margin-top', '10px')
      .style('border-radius', '8px')
      .style('box-shadow', theme.shadows[1]);

    svg.selectAll('*').remove(); // Clear previous content

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const yScale = d3.scaleLinear()
      .domain([d3.min([min, d3.min(values)]), d3.max([max, d3.max(values)])])
      .range([innerHeight, 0]);

    const xScale = d3.scaleBand()
      .domain([pollutant])
      .range([0, innerWidth])
      .padding(0.2);

    const color = isDarkMode ? '#90caf9' : '#1e88e5';

    // Draw whiskers
    g.append('line')
      .attr('x1', xScale(pollutant) + xScale.bandwidth() / 2)
      .attr('x2', xScale(pollutant) + xScale.bandwidth() / 2)
      .attr('y1', yScale(min))
      .attr('y2', yScale(q1))
      .attr('stroke', 'black');

    g.append('line')
      .attr('x1', xScale(pollutant) + xScale.bandwidth() / 2)
      .attr('x2', xScale(pollutant) + xScale.bandwidth() / 2)
      .attr('y1', yScale(max))
      .attr('y2', yScale(q3))
      .attr('stroke', 'black');

    g.append('line')
      .attr('x1', xScale(pollutant) + xScale.bandwidth() / 2 - 5)
      .attr('x2', xScale(pollutant) + xScale.bandwidth() / 2 + 5)
      .attr('y1', yScale(min))
      .attr('y2', yScale(min))
      .attr('stroke', 'black');

    g.append('line')
      .attr('x1', xScale(pollutant) + xScale.bandwidth() / 2 - 5)
      .attr('x2', xScale(pollutant) + xScale.bandwidth() / 2 + 5)
      .attr('y1', yScale(max))
      .attr('y2', yScale(max))
      .attr('stroke', 'black');

    // Draw box
    g.append('rect')
      .attr('x', xScale(pollutant))
      .attr('y', yScale(q3))
      .attr('height', yScale(q1) - yScale(q3))
      .attr('width', xScale.bandwidth())
      .attr('fill', color)
      .attr('opacity', 0.7)
      .attr('stroke', 'black');

    // Draw median
    g.append('line')
      .attr('x1', xScale(pollutant))
      .attr('x2', xScale(pollutant) + xScale.bandwidth())
      .attr('y1', yScale(median))
      .attr('y2', yScale(median))
      .attr('stroke', 'black');

    // Draw outliers
    if (showOutliers) {
      g.selectAll('.outlier')
        .data(values.filter(d => d < min || d > max))
        .enter()
        .append('circle')
        .attr('class', 'outlier')
        .attr('cx', xScale(pollutant) + xScale.bandwidth() / 2)
        .attr('cy', d => yScale(d))
        .attr('r', 3)
        .attr('fill', 'red')
        .attr('stroke', 'black');
    }

    // Draw x-axis
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', margin.bottom - 10)
      .attr('fill', theme.palette.text.primary)
      .style('text-anchor', 'middle')
      .text('Pollutant');

    // Draw y-axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('x', -margin.left)
      .attr('y', -10)
      .attr('fill', theme.palette.text.primary)
      .style('text-anchor', 'middle')
      .text('Value');

    // Add plot title
    svg.append('text')
      .attr('x', (width / 2))             
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')  
      .style('font-size', '16px') 
      .style('text-decoration', 'underline')  
      .text(`Distribution of ${pollutant} over the last ${days} days`);

    return () => {
      svg.selectAll('*').remove();
    };

  }, [data, width, height, loading, error, pollutant, showOutliers, theme]);

  if (loading) return <CircularProgress />;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return <p>No data available.</p>;

  return <svg ref={svgRef}></svg>;
};

export default withAutoResize(BoxPlot);
