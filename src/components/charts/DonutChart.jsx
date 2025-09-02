import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const formatMinutes = (minutes) => {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
};

const DonutChart = ({ activities, sessions }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!activities.length || !sessions.length) return;

        // Clear previous chart
        d3.select(svgRef.current).selectAll("*").remove();

        // Process data: group by category and activity
        const categoryData = {};

        sessions.forEach(session => {
            const activity = activities.find(a => a.id === session.activity_id);
            if (!activity) return;

            // Category data
            if (!categoryData[activity.category]) {
                categoryData[activity.category] = {
                    category: activity.category,
                    totalMinutes: 0,
                    activities: {}
                };
            }
            categoryData[activity.category].totalMinutes += session.duration_minutes || 0;

            // Activity data within category
            if (!categoryData[activity.category].activities[activity.id]) {
                categoryData[activity.category].activities[activity.id] = {
                    name: activity.name,
                    totalMinutes: 0
                };
            }
            categoryData[activity.category].activities[activity.id].totalMinutes += session.duration_minutes || 0;
        });

        // Convert to array and sort by total minutes
        const chartData = Object.values(categoryData)
            .filter(item => item.totalMinutes > 0)
            .sort((a, b) => b.totalMinutes - a.totalMinutes);

        if (chartData.length === 0) return;

        // Set up dimensions
        const width = 400;
        const height = 400;
        const radius = Math.min(width, height) / 2 - 40;
        const innerRadius = radius * 0.6;

        // Create SVG
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        // Color scale for categories - using distinct colors for each category
        const categoryColors = {
            'Work': '#3B82F6',      // Blue
            'Study': '#10B981',     // Green
            'Exercise': '#F59E0B',  // Orange
            'Entertainment': '#EF4444', // Red
            'Social': '#8B5CF6',    // Purple
            'Health': '#EC4899',    // Pink
            'Finance': '#06B6D4',   // Cyan
            'Travel': '#84CC16',    // Lime
            'Other': '#6B7280'      // Gray
        };

        // Create a dynamic color scale for any categories not in the predefined list
        const allCategories = [...new Set(chartData.map(d => d.category))];
        const additionalColors = ['#F97316', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#EAB308', '#A3E635', '#F43F5E'];

        allCategories.forEach((category, index) => {
            if (!categoryColors[category]) {
                categoryColors[category] = additionalColors[index % additionalColors.length];
            }
        });

        // Create pie generator for categories
        const pie = d3.pie()
            .value(d => d.totalMinutes)
            .sort(null);

        // Create arc generator
        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(radius);

        // Create arcs group
        const arcs = svg.append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        // Add category slices
        const slices = arcs.selectAll('.slice')
            .data(pie(chartData))
            .enter()
            .append('g')
            .attr('class', 'slice');

        // Add category paths
        const categoryPaths = slices.append('path')
            .attr('d', arc)
            .attr('fill', d => categoryColors[d.data.category] || categoryColors['Other'])
            .attr('opacity', 0.8)
            .attr('stroke', '#374151')
            .attr('stroke-width', 1)
            .on('mouseover', function (event, d) {
                // Fade out other categories
                categoryPaths.attr('opacity', 0.3);
                d3.select(this).attr('opacity', 1).attr('stroke-width', 2);

                // Show activity slices for this category
                showActivitySlices(d.data, d);

                // Show tooltip
                const tooltip = d3.select('body').append('div')
                    .attr('class', 'tooltip')
                    .style('position', 'absolute')
                    .style('background', '#1F2937')
                    .style('color', '#ffffff')
                    .style('padding', '12px')
                    .style('border-radius', '6px')
                    .style('font-size', '12px')
                    .style('pointer-events', 'none')
                    .style('z-index', '1000')
                    .style('border', '1px solid #4B5563')
                    .style('max-width', '250px');

                const activitiesList = Object.values(d.data.activities)
                    .sort((a, b) => b.totalMinutes - a.totalMinutes)
                    .map(activity =>
                        `${activity.name}: ${formatMinutes(activity.totalMinutes)}`
                    )
                    .join('<br/>');

                tooltip.html(`
                    <strong>${d.data.category}</strong><br/>
                    <span style="color: #9CA3AF;">Total: ${formatMinutes(d.data.totalMinutes)}</span><br/>
                    <br/>
                    <strong>Activities:</strong><br/>
                    ${activitiesList}
                `);
            })
            .on('mousemove', function (event) {
                const tooltip = d3.select('.tooltip');
                tooltip
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');
            })
            .on('mouseout', function () {
                // Restore all categories to normal opacity
                categoryPaths.attr('opacity', 0.8).attr('stroke-width', 1);

                // Hide activity slices
                hideActivitySlices();

                d3.select('.tooltip').remove();
            });

        // Function to show activity slices
        function showActivitySlices(categoryData, categorySlice) {
            // Create activity data for the hovered category
            const activityData = Object.values(categoryData.activities)
                .filter(item => item.totalMinutes > 0)
                .sort((a, b) => b.totalMinutes - a.totalMinutes);

            if (activityData.length === 0) return;

            // Create pie generator for activities
            const activityPie = d3.pie()
                .value(d => d.totalMinutes)
                .sort(null);

            // Create arc generator for activities (smaller radius)
            const activityArc = d3.arc()
                .innerRadius(innerRadius + 10)
                .outerRadius(radius - 10);

            // Get the category slice angles
            const categoryAngle = categorySlice.startAngle;
            const categoryArcLength = categorySlice.endAngle - categorySlice.startAngle;

            // Create activity slices
            const activitySlices = arcs.append('g')
                .attr('class', 'activity-slices');

            // Add activity paths
            activitySlices.selectAll('.activity-slice')
                .data(activityPie(activityData))
                .enter()
                .append('path')
                .attr('class', 'activity-slice')
                .attr('d', d => {
                    // Adjust the angles to fit within the category slice
                    const adjustedStartAngle = categoryAngle + (d.startAngle * categoryArcLength / (2 * Math.PI));
                    const adjustedEndAngle = categoryAngle + (d.endAngle * categoryArcLength / (2 * Math.PI));

                    return d3.arc()
                        .innerRadius(innerRadius + 10)
                        .outerRadius(radius - 10)
                        .startAngle(adjustedStartAngle)
                        .endAngle(adjustedEndAngle)();
                })
                .attr('fill', (d, i) => {
                    // Use distinct colors for activities within the category
                    const activityColors = [
                        '#3B82F6', // Blue
                        '#10B981', // Green
                        '#F59E0B', // Orange
                        '#EF4444', // Red
                        '#8B5CF6', // Purple
                        '#EC4899', // Pink
                        '#06B6D4', // Cyan
                        '#84CC16', // Lime
                        '#F97316', // Orange
                        '#A3E635', // Lime Green
                        '#F43F5E', // Rose
                        '#6366F1'  // Indigo
                    ];
                    return activityColors[i % activityColors.length];
                })
                .attr('opacity', 0.9)
                .attr('stroke', '#374151')
                .attr('stroke-width', 1)
                .on('mouseover', function (event, d) {
                    d3.select(this).attr('opacity', 1).attr('stroke-width', 2);

                    // Show activity tooltip
                    const tooltip = d3.select('body').append('div')
                        .attr('class', 'activity-tooltip')
                        .style('position', 'absolute')
                        .style('background', '#1F2937')
                        .style('color', '#ffffff')
                        .style('padding', '8px')
                        .style('border-radius', '4px')
                        .style('font-size', '11px')
                        .style('pointer-events', 'none')
                        .style('z-index', '1001')
                        .style('border', '1px solid #4B5563');

                    tooltip.html(`
                        <strong>${d.data.name}</strong><br/>
                        <span style="color: #9CA3AF;">${formatMinutes(d.data.totalMinutes)}</span>
                    `);
                })
                .on('mousemove', function (event) {
                    const tooltip = d3.select('.activity-tooltip');
                    tooltip
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 10) + 'px');
                })
                .on('mouseout', function () {
                    d3.select(this).attr('opacity', 0.9).attr('stroke-width', 1);
                    d3.select('.activity-tooltip').remove();
                });

            // Add activity labels
            activitySlices.selectAll('.activity-label')
                .data(activityPie(activityData))
                .enter()
                .append('text')
                .attr('class', 'activity-label')
                .attr('transform', d => {
                    const adjustedAngle = categoryAngle + (d.startAngle + (d.endAngle - d.startAngle) / 2) * categoryArcLength / (2 * Math.PI);
                    const x = (radius - 30) * Math.cos(adjustedAngle - Math.PI / 2);
                    const y = (radius - 30) * Math.sin(adjustedAngle - Math.PI / 2);
                    return `translate(${x}, ${y})`;
                })
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .style('fill', '#ffffff')
                .style('font-size', '10px')
                .style('font-weight', '600')
                .style('pointer-events', 'none')
                .text(d => {
                    const percentage = ((d.data.totalMinutes / categoryData.totalMinutes) * 100).toFixed(1);
                    return percentage > 15 ? d.data.name.substring(0, 8) : '';
                });

            // Add activity time labels
            activitySlices.selectAll('.activity-time')
                .data(activityPie(activityData))
                .enter()
                .append('text')
                .attr('class', 'activity-time')
                .attr('transform', d => {
                    const adjustedAngle = categoryAngle + (d.startAngle + (d.endAngle - d.startAngle) / 2) * categoryArcLength / (2 * Math.PI);
                    const x = (radius - 45) * Math.cos(adjustedAngle - Math.PI / 2);
                    const y = (radius - 45) * Math.sin(adjustedAngle - Math.PI / 2);
                    return `translate(${x}, ${y})`;
                })
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .style('fill', '#9CA3AF')
                .style('font-size', '8px')
                .style('font-weight', '500')
                .style('pointer-events', 'none')
                .text(d => {
                    const percentage = ((d.data.totalMinutes / categoryData.totalMinutes) * 100).toFixed(1);
                    return percentage > 20 ? formatMinutes(d.data.totalMinutes) : '';
                });
        }

        // Function to hide activity slices
        function hideActivitySlices() {
            d3.selectAll('.activity-slices').remove();
            d3.selectAll('.activity-label').remove();
            d3.selectAll('.activity-time').remove();
        }

        // Add category labels
        slices.append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('fill', '#ffffff')
            .style('font-size', '12px')
            .style('font-weight', '600')
            .style('pointer-events', 'none')
            .text(d => {
                const percentage = ((d.data.totalMinutes / d3.sum(chartData, d => d.totalMinutes)) * 100).toFixed(1);
                return percentage > 5 ? `${d.data.category}\n${percentage}%` : '';
            });

        // Add center text
        const totalMinutes = d3.sum(chartData, d => d.totalMinutes);
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height / 2 - 10)
            .attr('text-anchor', 'middle')
            .style('fill', '#ffffff')
            .style('font-size', '16px')
            .style('font-weight', '600')
            .text('Total Time');

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height / 2 + 10)
            .attr('text-anchor', 'middle')
            .style('fill', '#9CA3AF')
            .style('font-size', '14px')
            .text(formatMinutes(totalMinutes));

        // Add legend
        const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${width + 20}, 20)`);

        chartData.forEach((item, i) => {
            const legendItem = legend.append('g')
                .attr('transform', `translate(0, ${i * 25})`);

            legendItem.append('rect')
                .attr('width', 12)
                .attr('height', 12)
                .attr('fill', categoryColors[item.category] || categoryColors['Other']);

            legendItem.append('text')
                .text(`${item.category} (${formatMinutes(item.totalMinutes)})`)
                .attr('x', 18)
                .attr('y', 9)
                .attr('font-size', '12px')
                .attr('fill', '#ffffff');
        });

        // Add title
        svg.append('text')
            .text('Time Distribution by Category')
            .attr('x', width / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .attr('font-weight', '600')
            .attr('fill', '#ffffff');

    }, [activities, sessions]);

    return (
        <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Category Breakdown</h3>
            <div className="flex justify-center">
                <svg ref={svgRef} className="w-full max-w-lg"></svg>
            </div>
        </div>
    );
};

export default DonutChart;
