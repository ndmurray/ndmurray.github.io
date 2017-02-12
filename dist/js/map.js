"use strict";
var margin = {
  top: 100,
  right: 10,
  bottom: 10,
  left: 80
},
    w = parseInt(d3.select('#map-div').style('width'), 10),
    w = w - margin.left - margin.right,
    h = parseInt(d3.select('#map-div').style('height'), 10),
    h = h - margin.top - margin.bottom;
var parseDate = d3.timeParse("%Y");
var formatTime = d3.timeFormat("%Y");
var svg = d3.select("#map-div").append("svg").attr("width", w + margin.left + margin.right).attr("height", h + margin.left + margin.right).attr("id", "map-canvas").append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
d3.queue().defer(d3.json, "https://d3js.org/us-10m.v1.json").defer(d3.csv, "/8step.io/production_data/employment_data/county_8.16.csv").await(ready);
var mapPath = d3.geoPath();
function ready(error, usa, data) {
  if (error) {
    console.log(error);
  } else {
    console.log(usa);
  }
  var mapObject = {};
  var mapData = function(d) {
    +d.rate;
  };
  data.forEach(function(d) {
    mapObject[d.id] = +d.med_inc;
  });
  var cScale = d3.scaleQuantile().domain(d3.values(mapObject)).range(d3.schemeGnBu[9]);
  svg.append("g").attr("class", "county-group").selectAll("path").data(topojson.feature(usa, usa.objects.counties).features).enter().append("path").attr("class", "counties").attr("d", mapPath);
  d3.selectAll("path").attr("fill", function(d) {
    return cScale(mapObject[d.id]);
  });
  svg.append("g").attr("class", "legendQuant").attr("transform", "translate(" + 20 + "," + (h - (h / 4)) + ")");
  var legend = d3.legendColor().labelFormat(d3.format('$.2f')).shapeWidth(20).shapePadding(40).useClass(false).orient('horizontal').title("Median Household Income").titleWidth(200).scale(cScale);
  svg.select(".legendQuant").call(legend);
  d3.select("#switch").on("click", function() {
    var mapData = d3.select(this).attr('value');
    data.forEach(function(d) {
      mapObject[d.id] = eval(mapData);
    });
    cScale.domain(d3.values(mapObject));
    d3.selectAll("path").transition().duration(1000).attr("fill", function(d) {
      return cScale(mapObject[d.id]);
    });
  });
}
;
