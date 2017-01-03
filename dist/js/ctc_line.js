"use strict";
var lineMargin = {
  top: 60,
  right: 40,
  bottom: 70,
  left: 60
},
    lineW = parseInt(d3.select('#line-div').style('width'), 10),
    lineW = lineW - lineMargin.left - lineMargin.right,
    lineH = parseInt(d3.select('#line-div').style('height'), 10),
    lineH = lineH - lineMargin.top - lineMargin.bottom;
var parseDate = d3.timeParse("%d-%b-%y");
var formatTimeWeek = d3.timeFormat("%d-%b-%y");
var formatTimeMonth = d3.timeFormat("%b");
var xScale = d3.scaleTime().range([0, lineW]);
var yScale = d3.scaleLinear().range([lineH, 0]);
var yLabelShift = -lineMargin.left / 2 - 20;
d3.csv("/8step.io/production_data/ctc_data/ctc_lines.csv", function(d) {
  d.date = parseDate(d.date);
  d.division_clean = d.division_clean;
  d.avg_revenue = +d.avg_revenue;
  d.projects_share = +d.projects_share;
  d.projects_total = +d.projects_total;
  d.revenue_share = +d.revenue_share;
  d.revenue_total = +d.revenue_total;
  return d;
}, function(error, data) {
  if (error) {
    console.log(error);
  } else {
    console.log(data);
  }
  var timeData = data;
  var ushData = data.filter(function(d) {
    return d.division_clean == "USH";
  });
  var sepData = data.filter(function(d) {
    return d.division_clean == "SEP";
  });
  var ihdData = data.filter(function(d) {
    return d.division_clean == "IHD";
  });
  var iegData = data.filter(function(d) {
    return d.division_clean == "IEG";
  });
  var enrData = data.filter(function(d) {
    return d.division_clean == "ENR";
  });
  var lineData = function(d) {
    return d.revenue_share;
  };
  xScale.domain(d3.extent(timeData, function(d) {
    return d.date;
  }));
  yScale.domain(d3.extent(timeData, function(d) {
    return lineData(d);
  })).nice();
  var xAxis = d3.axisBottom().scale(xScale).tickFormat(formatTimeMonth);
  var yAxis = d3.axisLeft().scale(yScale);
  var line = d3.line().curve(d3.curveLinear).x(function(d) {
    return xScale(d.date);
  }).y(function(d) {
    return yScale(lineData(d));
  });
  var svg = d3.select("#line-div").append("svg").attr("width", lineW + lineMargin.left + lineMargin.right).attr("height", lineH + lineMargin.top + lineMargin.bottom).attr("id", "canvas").append("g").attr("transform", "translate(" + lineMargin.left + "," + lineMargin.top + ")");
  var pathUSH = svg.append("path").datum(ushData).attr("d", line).attr("class", "path").attr("id", "ush-path");
  var nodesUSH = svg.selectAll("circle.ush-nodes").data(ushData).enter().append("circle").attr("class", "nodes ush-nodes").attr("r", "0.15em").attr("cx", function(d) {
    return xScale(d.date);
  }).attr("cy", function(d) {
    return yScale(lineData(d));
  });
  var pathSEP = svg.append("path").datum(sepData).attr("d", line).attr("class", "path").attr("id", "sep-path");
  var nodesSEP = svg.selectAll("circle.sep-nodes").data(sepData).enter().append("circle").attr("class", "nodes sep-nodes").attr("r", "0.15em").attr("cx", function(d) {
    return xScale(d.date);
  }).attr("cy", function(d) {
    return yScale(lineData(d));
  });
  var pathIHD = svg.append("path").datum(ihdData).attr("d", line).attr("class", "path").attr("id", "ihd-path");
  var nodesIHD = svg.selectAll("circle.ihd-nodes").data(ihdData).enter().append("circle").attr("class", "nodes ihd-nodes").attr("r", "0.15em").attr("cx", function(d) {
    return xScale(d.date);
  }).attr("cy", function(d) {
    return yScale(lineData(d));
  });
  var pathIEG = svg.append("path").datum(iegData).attr("d", line).attr("class", "path").attr("id", "ieg-path");
  var nodesIEG = svg.selectAll("circle.ieg-nodes").data(iegData).enter().append("circle").attr("class", "nodes ieg-nodes").attr("r", "0.15em").attr("cx", function(d) {
    return xScale(d.date);
  }).attr("cy", function(d) {
    return yScale(lineData(d));
  });
  var pathENR = svg.append("path").datum(enrData).attr("d", line).attr("class", "path").attr("id", "enr-path");
  var nodesENR = svg.selectAll("circle.enr-nodes").data(enrData).enter().append("circle").attr("class", "nodes enr-nodes").attr("r", "0.15em").attr("cx", function(d) {
    return xScale(d.date);
  }).attr("cy", function(d) {
    return yScale(lineData(d));
  });
  svg.append("g").attr("class", "axis x-axis").attr("transform", "translate(0," + lineH + ")").call(xAxis);
  d3.selectAll(".x-axis text").attr("transform", "rotate(-45)").attr("text-anchor", "end");
  svg.append("g").attr("class", "axis y-axis").call(yAxis).append("text").text("Average Revenue ($US)").attr("fill", "gray").attr("transform", "translate(" + yLabelShift + "," + (h / 2 - lineMargin.bottom - lineMargin.top) + "), rotate(-90)");
});
