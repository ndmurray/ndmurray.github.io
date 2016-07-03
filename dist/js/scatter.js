"use strict";
var margin = {
  top: 10,
  right: 10,
  bottom: 20,
  left: 40
},
    w = parseInt(d3.select('#scatter-div').style('width'), 10),
    w = w - margin.left - margin.right,
    h = parseInt(d3.select('#scatter-div').style('height'), 10),
    h = h - margin.top - margin.bottom;
var canvasPadding = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 60
};
var textShift = 0,
    dotsShift = 0,
    xaxisShiftX = 0,
    yaxisShiftX = 0,
    xaxisShiftY = h,
    yaxisShiftY = 0;
var titleText = d3.select("h2#title").append("text.title-text").text("Scatter!");
d3.csv("datadev/world.csv", function(error, data) {
  if (error) {
    console.log(error);
  } else {
    console.log(data);
  }
  var worldData = data;
  var key = function(d, i) {
    return d.country;
  };
  var dataX = function(d) {
    return +d.gini;
  };
  var dataY = function(d) {
    return +d.press;
  };
  var dataR = function(d) {
    return +d.gdphead;
  };
  var dotTips = d3.tip().attr({class: "d3-tip"}).offset([0, 0]).direction('e').html(function(d) {
    return "<p id='tiphead'>" + d.country + "</p><p id='tipbody'>GDP/capita: $" + d3.format(',')(+d.gdphead) + "<br />" + +d.gdphead_year + "</p>";
  });
  var svg = d3.select("#scatter-div").append("svg").attr({
    width: w + margin.left + margin.right,
    height: h + margin.top + margin.bottom,
    id: "canvas"
  }).append("g").attr({transform: "translate(" + margin.left + "," + margin.top + ")"}).call(dotTips);
  var xScale = d3.scale.linear().domain([0, d3.max(worldData, function(d) {
    return dataX(d);
  })]).range([0, w]).nice();
  var yScale = d3.scale.linear().domain([d3.max(worldData, function(d) {
    return dataY(d);
  }), 0]).range([0, h]);
  var rScale = d3.scale.linear().domain([0, d3.max(worldData, function(d) {
    return dataR(d);
  })]).range([4, 24]).nice();
  var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);
  var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);
  var dots = svg.append("g").attr({id: "dots-group"}).selectAll("circle").data(worldData, key).enter().append("circle").filter(function(d) {
    return dataX(d);
  }).filter(function(d) {
    return dataY(d);
  }).filter(function(d) {
    return dataR(d);
  }).attr({
    cx: function(d) {
      return xScale(dataX(d));
    },
    cy: function(d) {
      return yScale(dataY(d));
    },
    r: function(d) {
      return rScale(dataR(d));
    },
    class: "dots",
    "fill": "rgb(179,120,211)"
  }).on('mouseover', dotTips.show).on('mouseout', dotTips.hide);
  svg.append("g").attr({
    class: "xaxis",
    transform: "translate(" + xaxisShiftX + "," + xaxisShiftY + ")"
  }).call(xAxis);
  svg.append("g").attr({
    class: "yaxis",
    transform: "translate(" + yaxisShiftX + "," + yaxisShiftY + ")"
  }).call(yAxis);
});
