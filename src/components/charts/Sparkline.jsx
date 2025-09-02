import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const Sparkline = ({ data, width = 60, height = 20, color = '#6b7280' }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 2, right: 2, bottom: 2, left: 2 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const x = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, chartWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data)])
      .range([chartHeight, 0]);

    const line = d3.line()
      .x((d, i) => x(i))
      .y(d => y(d))
      .curve(d3.curveMonotoneX);

    // Create the line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 1.5)
      .attr('d', line);

    // Add subtle gradient fill
    const area = d3.area()
      .x((d, i) => x(i))
      .y0(chartHeight)
      .y1(d => y(d))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', color)
      .attr('opacity', 0.1)
      .attr('d', area);

  }, [data, width, height, color]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="sparkline"
    />
  );
};

export default Sparkline;
