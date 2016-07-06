"use strict";
var margin = {
  top: 40,
  right: 140,
  bottom: 40,
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
var infoTop = 115,
    infoLeft = w + margin.left,
    infoWidth = 12 + "em",
    infoHeight = 30 + "em";
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
    return 100 - +d.press;
  };
  var dataY = function(d) {
    return +d.corruption;
  };
  var dataR = function(d) {
    return +d.gdphead;
  };
  var dotTips = d3.tip().attr({class: "d3-tip"}).style({
    top: infoTop,
    left: infoLeft,
    width: infoWidth,
    height: infoHeight
  }).direction('e').html(function(d) {
    return "<p id='tiphead'>" + d.country + "</p><p id='tipbody'><p class='tip-subhead'>Income Group:</p> " + (d.ig) + "</p>" + "</p><p id='tipbody'><p class='tip-subhead'>Region:</p> " + (d.region) + "</p>";
  });
  var svg = d3.select("#scatter-div").append("svg").attr({
    width: w + margin.left + margin.right,
    height: h + margin.top + margin.bottom,
    id: "canvas"
  }).append("g").attr({transform: "translate(" + margin.left + "," + margin.top + ")"});
  var xScale = d3.scale.linear().domain([d3.min(worldData, function(d) {
    return dataX(d);
  }), d3.max(worldData, function(d) {
    return dataX(d);
  })]).range([0, w]).nice();
  var yScale = d3.scale.linear().domain([d3.max(worldData, function(d) {
    return dataY(d);
  }), d3.min(worldData, function(d) {
    return dataY(d);
  })]).range([0, h]);
  var rScale = d3.scale.linear().domain([0, d3.max(worldData, function(d) {
    return dataR(d);
  })]).range([4, 40]).nice();
  var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
  var yAxis = d3.svg.axis().scale(yScale).orient("left");
  var dots = svg.append("g").attr({id: "dots-group"}).selectAll("circle").data(worldData, key).enter().append("circle").filter(function(d) {
    return dataX(d);
  }).filter(function(d) {
    return dataY(d);
  }).filter(function(d) {
    return dataR(d);
  }).attr({
    class: "dots",
    cx: function(d) {
      return xScale(dataX(d));
    },
    cy: function(d) {
      return yScale(dataY(d));
    },
    r: function(d) {
      return rScale(dataR(d));
    },
    "pointer-events": "all",
    "fill": function(d) {
      if (d.region == "Europe & Central Asia") {
        return "#CEE879";
      } else if (d.region == "Middle East & North Africa") {
        return "#FFA700";
      } else if (d.region == "Sub-Saharan Africa") {
        return "#54EBBA";
      } else if (d.region == "North America") {
        return "#1DC28C";
      } else if (d.region == "South Asia") {
        return "#FF93D2";
      } else if (d.region == "East Asia & Pacific") {
        return "#8CD19D";
      } else if (d.region == "Latin America & Caribbean") {
        return "#FF0D00";
      } else {
        return "black";
      }
    }
  }).call(dotTips).on('mouseenter', dotTips.show).on('mouseover', function() {
    var current = this;
    d3.select(current).classed("active-dot", true).classed("dots", false);
    d3.selectAll("circle.dots").attr("opacity", 0.15);
  }).on('mouseleave', dotTips.hide).on('mouseout', function() {
    var current = this;
    d3.select(current).classed("active-dot", false).classed("dots", true);
    d3.selectAll("circle.dots").attr("opacity", 0.85);
  });
  svg.select("line.xline").append("line").attr("y1", d3.selectAll("circle.dots").attr("cy")).attr("y2", d3.selectAll("circle.dots").attr("cy")).attr("x1", margin.left).attr("x2", d3.selectAll("circle.dots").attr("cx")).attr("class", "xline").attr("stroke", "white").attr("stroke-width", 10);
  svg.append("g").attr({
    class: "xaxis",
    transform: "translate(" + xaxisShiftX + "," + xaxisShiftY + ")"
  }).call(xAxis);
  svg.append("g").attr({
    class: "yaxis",
    transform: "translate(" + yaxisShiftX + "," + yaxisShiftY + ")"
  }).call(yAxis);
});
