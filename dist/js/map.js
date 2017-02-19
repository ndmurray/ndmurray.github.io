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
var svg = d3.select("#map-div").append("svg").attr("width", w + margin.left + margin.right).attr("height", h + margin.left + margin.right).attr("id", "map-canvas").append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
svg.append("div").attr("id", "right-panel");
d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {
  return this.each(function() {
    var firstChild = this.parentNode.firstChild;
    if (firstChild) {
      this.parentNode.insertBefore(this, firstChild);
    }
  });
};
svg.append("defs").append("filter").attr("id", "county-filter").append("feOffset").attr("result", "offOut").attr("in", "SourceGraphic").attr("dx", "-4").attr("dy", "-4").append("feBlend").attr("in", "SourceGraphic").attr("in2", "offOut").attr("mode", "normal").append("feGaussianBlur").attr("result", "blurOut").attr("in", "offOut").attr("stdDeviation", "100");
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
  }).attr("stroke", function(d) {
    return cScale(mapObject[d.id]);
  });
  svg.append("path").datum(topojson.mesh(usa, usa.objects.states), function(a, b) {
    return a !== b;
  }).attr("class", "states").attr("d", mapPath);
  svg.append("g").attr("class", "legendQuant").attr("opacity", 1).attr("transform", "translate(" + 20 + "," + (-margin.top + 24) + ")");
  var legendTitle = "Median Household Income";
  var legendFormat = '.2s';
  var legend = d3.legendColor().labelFormat(d3.format(legendFormat)).shapeWidth(20).shape('circle').shapePadding(60).useClass(false).orient('horizontal').title(legendTitle).titleWidth(800).scale(cScale);
  svg.select("g.legendQuant").call(legend);
  d3.selectAll('.counties').on('mouseover', function(d) {
    d3.select(this).moveToFront().attr("stroke-width", "4px").attr("filter", "url(#county-filter)");
    ;
  }).on('mouseout', function(d) {
    d3.select(this).attr("filter", "none").moveToBack();
  });
  d3.selectAll(".choice").on("click", function() {
    var mapData = d3.select(this).attr('value');
    data.forEach(function(d) {
      mapObject[d.id] = eval(mapData);
    });
    cScale.domain(d3.values(mapObject)).range(d3.schemeGnBu[9]);
    switch (mapData) {
      case "+d.rate":
        legendTitle = "Unemployment Rate";
        break;
      case "+d.edu":
        legendTitle = "% of Adults with a High School Diploma";
        break;
      case "+d.med_inc":
        legendTitle = "Median household income";
        break;
    }
    switch (mapData) {
      case "+d.rate":
        legendFormat = '.0%';
        break;
      case "+d.edu":
        legendFormat = '.0%';
        break;
      case "+d.med_inc":
        legendFormat = '.2s';
        break;
    }
    d3.selectAll("path").transition().duration(2000).attr("fill", function(d) {
      return cScale(mapObject[d.id]);
    }).attr("stroke", function(d) {
      return cScale(mapObject[d.id]);
    });
    svg.select("g.legendQuant").transition().duration(500).attr("opacity", 0).on("end", function() {
      legend.labelFormat(d3.format(legendFormat)).title(legendTitle);
      svg.call(legend);
    });
    svg.select("g.legendQuant").transition().delay(1000).duration(500).attr("opacity", 1);
  });
}
;
