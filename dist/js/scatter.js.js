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
});
