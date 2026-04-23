import React, { useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';

export const D3LineChart = React.memo(({ data, width = 600, height = 300, color = "#4f46e5" }) => {
  const svgRef = useRef();

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((d, i) => ({ x: i, y: d.value }));
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scaleLinear()
      .domain([0, chartData.length - 1])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.y) || 1])
      .range([innerHeight, 0]);

    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveMonotoneX);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0))
      .attr("color", "#94a3b8")
      .style("font-size", "10px");

    // Add Y axis
    g.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .attr("color", "#94a3b8")
      .style("font-size", "10px");

    // Add line with animation
    const path = g.append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line);

    const length = path.node().getTotalLength();

    path.attr("stroke-dasharray", length + " " + length)
      .attr("stroke-dashoffset", length)
      .transition()
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);

  }, [chartData, width, height, color]);

  return (
    <div className="w-full flex justify-center">
      <svg ref={svgRef} width={width} height={height} className="overflow-visible" />
    </div>
  );
});

export const D3BarChart = React.memo(({ data, width = 600, height = 300, color = "#4f46e5" }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scaleBand()
      .domain(data.map((_, i) => i))
      .range([0, innerWidth])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 1])
      .range([innerHeight, 0]);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(i => data[i].label).tickSizeOuter(0))
      .attr("color", "#94a3b8")
      .style("font-size", "10px");

    g.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .attr("color", "#94a3b8")
      .style("font-size", "10px");

    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", (_, i) => x(i))
      .attr("y", innerHeight)
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", color)
      .attr("rx", 4)
      .transition()
      .duration(800)
      .delay((_, i) => i * 50)
      .ease(d3.easeCubicOut)
      .attr("y", d => y(d.value))
      .attr("height", d => innerHeight - y(d.value));

  }, [data, width, height, color]);

  return (
    <div className="w-full flex justify-center">
      <svg ref={svgRef} width={width} height={height} className="overflow-visible" />
    </div>
  );
});

export const D3DonutChart = React.memo(({ data, size = 200 }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const radius = size / 2;
    const innerRadius = radius * 0.7;
    
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(["#4f46e5", "#10b981", "#f59e0b", "#ef4444"]);

    const pie = d3.pie().value(d => d.value).sort(null);
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);

    const g = svg.append("g")
      .attr("transform", `translate(${radius},${radius})`);

    const path = g.selectAll("path")
      .data(pie(data))
      .enter().append("path")
      .attr("fill", d => color(d.data.label))
      .attr("d", arc)
      .each(function(d) { this._current = d; });

    path.transition()
      .duration(800)
      .attrTween("d", function(d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function(t) {
          return arc(interpolate(t));
        };
      });

  }, [data, size]);

  return (
    <div className="w-full flex justify-center">
      <svg ref={svgRef} width={size} height={size} className="overflow-visible" />
    </div>
  );
});
