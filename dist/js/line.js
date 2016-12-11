"use strict";
var margin = {
  top: 10,
  right: 20,
  bottom: 20,
  left: 80
},
    w = parseInt(d3.select('#line-div').style('width'), 10),
    w = w - margin.left - margin.right,
    h = parseInt(d3.select('#line-div').style('height'), 10),
    h = h - margin.top - margin.bottom;
var parseDate = d3.timeParse("%Y");
var formatTime = d3.timeFormat("%Y");
var xScale = d3.scaleTime().range([0, w]);
var yScale = d3.scaleLinear().range([h, 0]);
var yLabelShift = margin.left / 2 - 10;
var tipDuration = 100;
d3.csv("/8step.io/production_data/energy_data/solar.csv", function(d) {
  d.year = parseDate(d.year);
  d.solar_price = +d.solar_price;
  return d;
}, function(error, data) {
  if (error) {
    console.log(error);
  } else {
    console.log(data);
  }
  var solarData = data;
  xScale.domain(d3.extent(solarData, function(d) {
    return d.year;
  }));
  yScale.domain(d3.extent(solarData, function(d) {
    return d.solar_price;
  })).nice();
  var xAxis = d3.axisBottom().scale(xScale);
  var yAxis = d3.axisLeft().scale(yScale);
  var priceLine = d3.line().x(function(d) {
    return xScale(d.year);
  }).y(function(d) {
    return yScale(d.solar_price);
  });
  var svg = d3.select("#line-div").append("svg").attr("width", w + margin.left + margin.right).attr("height", h + margin.top + margin.bottom).attr("id", "canvas").append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  var priceTip = d3.select("body").append("div").attr("class", "tooltip price-tip").style("opacity", 0);
  var pricePath = svg.append("path").datum(solarData).attr("d", priceLine).attr("class", "line");
  var priceNodes = svg.selectAll("circle").data(solarData).enter().append("circle").attr("class", "nodes price-nodes").attr("r", "0.15em").attr("cx", function(d) {
    return xScale(d.year);
  }).attr("cy", function(d) {
    return yScale(d.solar_price);
  });
  var tipLeft = function(d) {
    d3.select(this).attr("cx");
  };
  priceNodes.on("mouseover", function(d) {
    priceTip.transition().duration(tipDuration).style("opacity", 0.8);
    priceTip.html("<span class = date-display>" + formatTime(d.year) + "</span><br/><span class='value-display'>$" + d3.format('.3n')(d.solar_price) + "</span>").style("left", (d3.event.pageX + 10) + "px").style("top", (d3.event.pageY - 40) + "px");
  }).on("mouseout", function(d) {
    priceTip.transition().duration(tipDuration).style("opacity", 0);
  });
  svg.append("g").attr("class", "axis x-axis").attr("transform", "translate(0," + h + ")").call(xAxis);
  svg.append("g").attr("class", "axis y-axis").call(yAxis).append("text").text("Price, US$/Watt").attr("fill", "gray").attr("transform", "translate(" + yLabelShift + "," + (h / 2 - margin.bottom - margin.top) + "), rotate(-90)");
});
