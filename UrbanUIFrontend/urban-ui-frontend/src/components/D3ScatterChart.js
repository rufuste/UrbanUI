
// D3ScatterChart.js
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import useDataFetch from '../hooks/useDataFetch';
import withAutoResize from './withAutoResize';

const D3ScatterChart = ({ width, height, pollutant = "PM2.5", days = 1, remove_outliers = true }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const svgRef = useRef();

  const { data, loading, error } = useDataFetch(`/api/data/${pollutant}?days=${days}`, { remove_outliers });

  useEffect(() => {
    if (loading || error || !data) return;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', theme.palette.background.paper)
      .style('margin-top', '10px')
      .style('border-radius', '8px')
      .style('box-shadow', theme.shadows[1]);

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.selectAll('*').remove();

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.Timestamp)))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Value)]).nice()
      .range([innerHeight, 0]);

    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(data, d => d.Value)])
      .interpolator(isDarkMode ? d3.interpolatePlasma : d3.interpolateYlOrBr);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y-%m-%d %H:%M"));
    const yAxis = d3.axisLeft(yScale);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g')
      .call(xAxis)
      .attr('transform', `translate(0,${innerHeight})`)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px')
      .style('color', theme.palette.text.primary);

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('color', theme.palette.text.primary);

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', theme.palette.text.primary)
      .text('Time');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -margin.left + 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', theme.palette.text.primary)
      .text('Value');

    g.selectAll('circle')
      .data(data)
      .enter().append('circle')
      .attr('cx', d => xScale(new Date(d.Timestamp)))
      .attr('cy', d => yScale(d.Value))
      .attr('r', 4)
      .attr('fill', d => colorScale(d.Value))
      .attr('stroke', theme.palette.background.paper)
      .attr('stroke-width', 1)
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6);

        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', theme.palette.background.paper)
          .style('padding', '5px 10px')
          .style('border', `1px solid ${theme.palette.divider}`)
          .style('border-radius', '4px')
          .style('pointer-events', 'none')
          .style('font-size', '12px')
          .style('color', theme.palette.text.primary)
          .html(`Value: ${d.Value}<br/>Time: ${new Date(d.Timestamp).toLocaleString()}`)
          .style('left', `${event.pageX + 5}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 4);

        d3.selectAll('.tooltip').remove();
      });
  }, [data, loading, error, width, height, theme, isDarkMode]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  if (data.length === 0) {
    return <p>No data available to plot.</p>;
  }

  return <svg ref={svgRef}></svg>;
};

export default withAutoResize(D3ScatterChart);