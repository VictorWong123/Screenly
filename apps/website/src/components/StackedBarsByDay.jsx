import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const StackedBarsByDay = ({ data, categories, width = 500, height = 300, showCompare = false, ghostData = null }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Prepare data for stacking
    const stack = d3.stack()
      .keys(categories)
      .value((d, key) => d.byCategory[key] || 0);

    const stackedData = stack(data);

    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.day))
      .range([0, chartWidth])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))])
      .range([chartHeight, 0]);

    // Create chart group
    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add comparison overlay if enabled
    if (showCompare && ghostData) {
      const comparisonStack = d3.stack()
        .keys(categories)
        .value((d, key) => d.byCategory[key] || 0);

      const comparisonStacked = comparisonStack(ghostData);

      // Add ghosted comparison bars
      comparisonStacked.forEach((category, i) => {
        chart.selectAll('.comparison-bar')
          .data(category)
          .enter()
          .append('rect')
          .attr('class', 'comparison-bar')
          .attr('x', d => x(d.data.day))
          .attr('y', d => y(d[1]))
          .attr('width', x.bandwidth())
          .attr('height', d => y(d[0]) - y(d[1]))
          .attr('fill', colorScale(categories[i]))
          .attr('opacity', 0.2)
          .attr('stroke', colorScale(categories[i]))
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3');
      });
    }

    // Add stacked bars
    stackedData.forEach((category, i) => {
      chart.selectAll(`.bar-${categories[i]}`)
        .data(category)
        .enter()
        .append('rect')
        .attr('class', `bar-${categories[i]}`)
        .attr('x', d => x(d.data.day))
        .attr('y', d => y(d[1]))
        .attr('width', x.bandwidth())
        .attr('height', d => y(d[0]) - y(d[1]))
        .attr('fill', colorScale(categories[i]))
        .attr('opacity', 0.8)
        .on('mouseover', function (event, d) {
          d3.select(this).attr('opacity', 1);

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

          const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          };

          tooltip.html(`
            <div><strong>${formatDate(d.data.day)}</strong></div>
            <div>${categories[i]}: ${d[1] - d[0]} min</div>
            <div>Total: ${d.data.totalMinutes} min</div>
          `);
        })
        .on('mousemove', function (event) {
          const tooltip = d3.select('.tooltip');
          tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function () {
          d3.select(this).attr('opacity', 0.8);
          d3.select('.tooltip').remove();
        });
    });

    // Add X axis
    chart.append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'middle')
      .attr('dy', '0.5em')
      .text(d => {
        const date = new Date(d);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

    // Add Y axis
    chart.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .call(g => g.select('.domain').remove());

    // Add chart title
    chart.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '500')
      .text('Daily Activity by Category');

  }, [data, categories, width, height, showCompare, ghostData]);

  return (
    <div className="card p-6">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="stacked-bars-chart"
      />
    </div>
  );
};

export default StackedBarsByDay;
