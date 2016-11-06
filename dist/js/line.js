"use strict";
var margin = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10
},
    w = parseInt(d3.select('#line-div').style('width'), 10),
    w = w - margin.left - margin.right,
    h = parseInt(d3.select('#line-div').style('height'), 10),
    h = h - margin.top - margin.bottom;
d3.csv("/8step.io/production_data/energy_data/solar.csv", function(error, data) {
  if (error) {
    console.log(error);
  } else {
    console.log(data);
  }
  var solarData = data;
  var key = function(d, i) {
    return d.year;
  };
  var parseDate = d3.time.format("%y").parse;
  solarData.forEach(function(d) {
    d.year = parseDate(d.year);
    d.price = +d.price;
  });
  var xScale = d3.time.scale().range([0, width]);
  xScale.domain(d3.extent(function(d) {
    return d.date;
  }));
  var yScale = d3.scale.linear().domain([0, d3.max(solarData, function(d) {
    return d.price;
  })]).range([height, 0]).nice();
  var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);
  var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);
  var priceLine = d3.svg.line().x(function(d) {
    return xScale(d.date);
  }).y(function(d) {
    return yScale(d.price);
  });
  var svg = d3.select("#line-div").append("svg").attr({
    width: w + margin.left + margin.right,
    height: h + margin.top + margin.bottom,
    id: "canvas"
  }).append("g").attr({transform: "translate(" + margin.left + "," + margin.top + ")"});
  var pricePath = svg.append("path").attr("d", priceLine(solarData));
});
