import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const ViolinPlot = ({ data, width = 400, height = 200, showOutliers = true }) => {
  const svgRef = useRef();

  useEffect(() => {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.category))
      .range([0, innerWidth])
      .padding(0.05);

    const y = d3.scaleLinear()
      .domain([d3.min(data, d => d3.min(d.values)), d3.max(data, d => d3.max(d.values))])
      .range([innerHeight, 0]);

    const violin = d3.violin()
      .x(d => x(d.category))
      .y(d => y(d.value))
      .width(x.bandwidth())
      .height(innerHeight);

    svg.append('g')
      .selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('d', violin)
      .style('fill', '#69b3a2')
      .style('stroke', 'none');

    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .call(d3.axisLeft(y));

  }, [data, showOutliers, width, height]);

  return <svg ref={svgRef}></svg>;
};

export default ViolinPlot;
