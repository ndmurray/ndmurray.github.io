"use strict";
d3.csv("datadev/crime.csv", function(error, data) {
  if (error) {
    console.log(error);
  } else {
    console.log(data);
  }
  ;
  var crimeData = data;
  var margin = {
    top: 40,
    right: 40,
    bottom: 60,
    left: 60
  };
  var w = 740 - margin.left - margin.right;
  var h = 740 - margin.left - margin.right;
  var aToR = function(a) {
    return Math.sqrt(a / 3.14);
  };
  var xAxisPadding = 30;
  var yAxisPadding = -30;
  var key = function(d) {
    return d.key;
  };
  var svg = d3.select("body").append("svg").attr({
    height: h + margin.top + margin.bottom,
    width: w + margin.left + margin.right
  }).append("g").attr({"transform": "translate(" + margin.left + "," + margin.top + ")"});
  var clippingPath = svg.append("clipPath").attr({id: "chart-area"}).append("rect").attr({
    x: 1 - xAxisPadding,
    y: 1 - yAxisPadding,
    width: w,
    height: h
  });
  var xScale = d3.scale.linear().domain([0, d3.max(crimeData, function(d) {
    return +d.rape100k;
  })]).range([0, w]);
  var yScale = d3.scale.linear().domain([0, d3.max(crimeData, function(d) {
    return +d.murder100k;
  })]).range([h, 0]);
  var rScale = d3.scale.linear().domain([d3.min(crimeData, function(d) {
    return +d.Pop;
  }), d3.max(crimeData, function(d) {
    return +d.Pop;
  })]).range([5, 50]);
  var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);
  var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);
  var bubbles = svg.append("g").attr({
    id: "bubbles-group",
    "clip-path": "url(#chart-area)"
  }).selectAll("circle").data(crimeData, key).enter().append("circle").attr({
    cx: function(d) {
      return xScale(+d.rape100k);
    },
    cy: function(d) {
      return yScale(+d.murder100k);
    },
    r: function(d) {
      return rScale(+d.Pop);
    },
    class: "bubbles",
    "fill": "rgb(179,120,211)"
  });
  svg.append("g").attr({
    class: "xaxis",
    transform: "translate(0," + (h + xAxisPadding) + ")"
  }).call(xAxis);
  svg.append("g").attr({
    class: "yaxis",
    transform: "translate(" + yAxisPadding + ",0)"
  }).call(yAxis);
});
