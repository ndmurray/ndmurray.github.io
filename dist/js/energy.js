"use strict";
var margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20
},
    w = parseInt(d3.select('#wrapper').style('width'), 10),
    w = w - margin.left - margin.right,
    h = parseInt(d3.select('#wrapper').style('height')),
    h = h - margin.top - margin.bottom;
var lineMargin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 80
},
    lineW = parseInt(d3.select('#line-div').style('width'), 10),
    lineW = lineW - lineMargin.left - lineMargin.right,
    lineH = parseInt(d3.select('#line-div').style('height'), 10),
    lineH = lineH - lineMargin.top - lineMargin.bottom;
var parseDate = d3.timeParse("%b-%y"),
    formatMonth = d3.timeFormat("%b-%y");
var xScale = d3.scaleTime().range([0, lineW]);
var yScale = d3.scaleLinear().range([lineH, 0]);
var dotRadius = "0.25em";
d3.queue().defer(d3.csv, "/8step.io/production_data/energy_data/energy_xstate.csv", function(d) {
  d.date = parseDate(d.date);
  d.mwh = +d.mwh;
  return d;
}).await(ready);
function ready(error, data) {
  if (error) {
    console.log(error);
  } else {
    console.log(data);
  }
  var timeData = data;
  var rollupData = d3.nest().key(function(d) {
    return d.date;
  }).rollup(function(d) {
    return d3.sum(d, function(g) {
      return g.mwh;
    });
  }).entries(timeData);
  console.log(rollupData);
  rollupData.forEach(function(d) {
    d.dateAgg = d.key;
    d.dateAggParse = parseDate(d.dateAgg);
    d.mwhAgg = d.value;
  });
  console.log(rollupData);
  xScale.domain(d3.extent(rollupData, function(d) {
    return d.dateAgg;
  }));
  yScale.domain(d3.extent(rollupData, function(d) {
    return d.mwhAgg;
  })).nice();
  var xAxis = d3.axisBottom().scale(xScale).tickFormat(formatMonth),
      yAxis = d3.axisLeft().scale(yScale);
  var line = d3.line().curve(d3.curveLinear).x(function(d) {
    return xScale(d.dateAgg);
  }).y(function(d) {
    return yScale(d.mwhAgg);
  });
  var svg = d3.select("#line-div").append("svg").attr("width", lineW + lineMargin.left + lineMargin.right).attr("height", lineH + lineMargin.top + lineMargin.bottom).attr("id", "line-canvas").append("g").attr("transform", "translate(" + lineMargin.left + "," + lineMargin.top + ")");
  var pathAll = svg.append("path").datum(rollupData).attr("d", line).attr("fill", "white").attr("stroke", "white");
  svg.append("g").attr("class", "axis x-axis").attr("transform", "translate(0," + lineH + ")").call(xAxis);
  svg.append("g").attr("class", "axis y-axis").call(yAxis);
}
