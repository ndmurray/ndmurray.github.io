"use strict";
var margin = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10
},
    w = parseInt(d3.select('#scatter-div').style('width'), 10),
    w = w - margin.left - margin.right,
    h = parseInt(d3.select('#scatter-div').style('width'), 10),
    h = h - margin.top - margin.bottom;
var canvasPadding = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};
var textShiftUp = 0,
    circShiftUp = 0,
    axisShiftUp = 0;
var titleText = d3.select("h2#title").append("text.title-text").text("Scattered data").attr({
  class: "title-text",
  "font-size": "24px"
});
d3.csv("datadev/world.csv", function(error, data) {
  if (error) {
    console.log(error);
  } else {
    console.log(data);
  }
  var worldData = data;
  var key = function(d, i) {
    return i;
  };
  var svg = d3.select("#scatter-div").append("svg").attr({
    width: w + margin.left + margin.right,
    height: h + margin.top + margin.bottom,
    viewBox: "0 0 " + 380 + " " + 8000,
    preserveAspectRatio: "xMinYMin meet",
    id: "canvas"
  }).append("g").attr({transform: "translate(" + margin.left + "," + margin.top + ")"});
  var xScale = d3.scale.linear().domain([0, d3.max(worldData, function(d) {
    return +d.life_exp;
  })]).range([0, w - canvasPadding.right]).nice();
  var yScale = d3.scale.linear().domain([0, d3.max(worldData, function(d) {
    return +d.gdphead;
  })]).range([0, h - canvasPadding.bottom]);
  var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);
  var yAxis = d3.svg.axis().scale(yScale).orient("top").ticks(5);
});
