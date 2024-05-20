import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import useDataFetch from '../hooks/useDataFetch';
import withAutoResize from './withAutoResize';
import { CircularProgress } from '@mui/material';
const D3ScatterChart = ({ width, height, pollutant = "PM2.5", days = 1, remove_outliers = true }) => {
  const theme = useTheme();
  const svgRef = useRef();

  const { data, loading, error } = useDataFetch(`/api/data/${pollutant}?days=${days}`, { remove_outliers });

  useEffect(() => {
    if (loading || error || !data) return;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('margin', '20px');

    const margin = { top: 20, right: 30, bottom: 70, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.selectAll('*').remove();

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.Timestamp)))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.Value)]).nice()
      .range([innerHeight, 0]);

    // Ensure the color scale remains consistent
    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(data, d => d.Value)])
      .interpolator(d3.interpolateRgb("purple", "orange"));

    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => d3.timeFormat(days <= 1 ? "%H:%M" : "%b %d %H:%M")(d))
      .ticks(width / 100);

    const yAxis = d3.axisLeft(yScale);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g')
      .call(xAxis)
      .attr('transform', `translate(0,${innerHeight})`)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-family', 'Roboto, sans-serif')
      .style('font-size', '12px')
      .style('color', theme.palette.text.primary);

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-family', 'Roboto, sans-serif')
      .style('font-size', '12px')
      .style('color', theme.palette.text.primary);

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Roboto, sans-serif')
      .style('font-size', '14px')
      .style('fill', theme.palette.text.primary)
      .text('Time');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -margin.left + 20)
      .attr('text-anchor', 'middle')
      .style('font-family', 'Roboto, sans-serif')
      .style('font-size', '14px')
      .style('fill', theme.palette.text.primary)
      .text('Value');

    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', theme.palette.background.paper)
      .style('border', `1px solid ${theme.palette.divider}`)
      .style('border-radius', '4px')
      .style('box-shadow', theme.shadows[3])
      .style('padding', '10px')
      .style('font-family', 'Roboto, sans-serif')
      .style('font-size', '12px')
      .style('color', theme.palette.text.primary)
      .style('pointer-events', 'none')
      .style('display', 'none');

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

        tooltip.html(`
          <strong>Time:</strong> ${d3.timeFormat("%d/%m/%Y, %H:%M:%S")(new Date(d.Timestamp))}<br/>
          <strong>${pollutant}:</strong> ${d.Value.toFixed(3)}
        `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`)
          .style('display', 'block');
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 4);

        tooltip.style('display', 'none');
      });
  }, [data, loading, error, width, height, theme, days, pollutant]);

  if (loading) return <CircularProgress />;
  if (error) return <p>Error: {error.message}</p>;
  
  if (data.length === 0) {
    return <p>No data available to plot.</p>;
  }

  return <svg ref={svgRef}></svg>;
};

export default withAutoResize(D3ScatterChart);
