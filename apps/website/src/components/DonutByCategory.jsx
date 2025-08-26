import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { formatMinutes, getCategoryColor } from '../lib/format';

const DonutByCategory = ({ data, width = 300, height = 300 }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const radius = Math.min(chartWidth, chartHeight) / 2;

    // Prepare data
    const pieData = Object.entries(data)
      .filter(([, value]) => value > 0)
      .map(([category, value]) => ({ category, value }));

    if (pieData.length === 0) return;

    // Create chart group
    const chart = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Create pie generator
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(radius * 0.4)
      .outerRadius(radius * 0.8);

    const outerArc = d3.arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    // Create pie slices
    const slices = chart.selectAll('.slice')
      .data(pie(pieData))
      .enter()
      .append('g')
      .attr('class', 'slice');

    slices.append('path')
      .attr('d', arc)
      .attr('fill', d => getCategoryColor(d.data.category))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke-width', 3)
          .attr('stroke', '#000');
        
        // Show tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', 1000);
        
        tooltip.html(`
          <div><strong>${d.data.category}</strong></div>
          <div>${formatMinutes(d.data.value)}</div>
          <div>${((d.data.value / d3.sum(pieData, d => d.value)) * 100).toFixed(1)}%</div>
        `);
      })
      .on('mousemove', function(event) {
        const tooltip = d3.select('.tooltip');
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke-width', 2)
          .attr('stroke', 'white');
        d3.select('.tooltip').remove();
      });

    // Add labels
    const labelRadius = radius * 0.9;
    
    slices.append('text')
      .attr('transform', d => {
        const pos = outerArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = labelRadius * (midAngle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style('text-anchor', d => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midAngle < Math.PI ? 'start' : 'end';
      })
      .style('font-size', '12px')
      .style('font-weight', '500')
      .text(d => d.data.category);

    // Add value labels
    slices.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .style('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', '500')
      .style('fill', 'white')
      .text(d => formatMinutes(d.data.value));

    // Add center text
    const totalMinutes = d3.sum(pieData, d => d.value);
    chart.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('font-size', '16px')
      .style('font-weight', '600')
      .text('Total');
    
    chart.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.5em')
      .style('font-size', '14px')
      .style('font-weight', '400')
      .style('fill', '#6b7280')
      .text(formatMinutes(totalMinutes));

  }, [data, width, height]);

  return (
    <div className="card p-6">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="donut-chart"
      />
    </div>
  );
};

export default DonutByCategory;
