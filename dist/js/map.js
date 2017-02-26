"use strict";
var margin = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 80
},
    w = parseInt(d3.select('#map-div').style('width'), 10),
    w = w - margin.left - margin.right,
    h = parseInt(d3.select('#map-div').style('height'), 10),
    h = h - margin.top - margin.bottom;
var legendTitle = "Median Household Income";
var legendFormat = '.2s';
var svg = d3.select("#map-div").append("svg").attr("class", "svg").attr("width", w + margin.left + margin.right).attr("height", h + margin.top + margin.bottom).attr("id", "map-canvas").append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var titleText = legendTitle + ", USDA, 2015";
var chartTitle = d3.select("#header-row").append("div").attr("class", "chart-title").style("opacity", 1).text(titleText);
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
svg.append("defs");
var countyFilter = d3.select("defs").append("filter").attr("id", "county-filter").attr("height", "400%").attr("width", "400%").attr("y", "-80%").attr("x", "-80%");
countyFilter.append("feOffset").attr("result", "offOut").attr("in", "SourceGraphic").attr("dx", "4").attr("dy", "4");
countyFilter.append("feMorphology").attr("result", "bigOut").attr("in", "SourceGraphic").attr("operator", "dilate").attr("radius", "3");
countyFilter.append("feColorMatrix").attr("result", "matrixOut").attr("in", "bigOut").attr("type", "matrix").attr("values", "0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.1 0 0 0 0 0 1 0");
countyFilter.append("feGaussianBlur").attr("result", "blurOut").attr("in", "matrixOut").attr("stdDeviation", "1");
countyFilter.append("feBlend").attr("in", "SourceGraphic").attr("in2", "blurOut").attr("mode", "normal");
var stateFilter = d3.select("defs").append("filter").attr("id", "state-filter").append("feGaussianBlur").attr("result", "blurOut").attr("stdDeviation", "1");
d3.queue().defer(d3.json, "https://d3js.org/us-10m.v1.json").defer(d3.csv, "/8step.io/production_data/employment_data/county_8.16.csv").await(ready);
var mapPath = d3.geoPath();
function ready(error, usa, data) {
  if (error) {
    console.log(error);
  } else {
    console.log(usa);
    console.log(data);
  }
  var mapObject = {};
  data.forEach(function(d) {
    mapObject[d.id] = +d.med_inc;
  });
  var cScale = d3.scaleQuantile().domain(d3.values(mapObject)).range(d3.schemeGnBu[9]);
  var counties = svg.append("g").attr("class", "counties").selectAll("path").data(topojson.feature(usa, usa.objects.counties).features).enter().append("path").attr("class", "county").attr("d", mapPath);
  d3.selectAll(".county").attr("fill", function(d) {
    return cScale(mapObject[d.id]);
  }).attr("stroke", function(d) {
    return cScale(mapObject[d.id]);
  });
  svg.append("g").attr("class", "states").append("path").datum(topojson.mesh(usa, usa.objects.states), function(a, b) {
    return a !== b;
  }).attr("class", "state-boundaries").attr("d", mapPath).attr("filter", "url(#state-filter");
  var mapExtent = d3.select(".states").node().getBBox();
  var mapWidth = mapExtent.width;
  d3.select("#nav").style("width", mapExtent.width);
  d3.select("#info-div").style("height", d3.select("#nav").style("height")).style("width", (mapWidth * 0.6));
  d3.select("#button-div").style("width", (mapWidth * 0.2));
  svg.append("g").attr("class", "legendQuant").attr("opacity", 1).attr("transform", "translate(" + (0.9 * mapWidth) + "," + (0.33 * h) + ")");
  var legend = d3.legendColor().labelFormat(d3.format(legendFormat)).shape('circle').useClass(false).title(legendTitle).titleWidth(200).scale(cScale);
  svg.select("g.legendQuant").call(legend);
  var mapTip = d3.select("body").append("div").attr("id", "map-tip").style("opacity", 0);
  var tipObject = {};
  data.forEach(function(d) {
    tipObject[d.id] = d;
  });
  console.log(tipObject);
  d3.selectAll(".county").on('mouseover', function(d) {
    d3.select(this).moveToFront().attr("filter", "url(#county-filter)");
    mapTip.style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 40) + "px").transition().duration(500).style("opacity", 1);
    mapTip.html("<p>fuckyou!" + tipObject[d.id] + "</p>");
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
        legendTitle = "% Adults with High School Diploma";
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
    var titleText = legendTitle + ", USDA, 2015";
    d3.selectAll("path").transition().duration(2000).attr("fill", function(d) {
      return cScale(mapObject[d.id]);
    }).attr("stroke", function(d) {
      return cScale(mapObject[d.id]);
    });
    d3.select("div.chart-title").transition().duration(500).style("opacity", 0).on("end", function() {
      chartTitle.text(titleText);
    });
    d3.select("g.legendQuant").transition().duration(200).attr("opacity", 0).on("end", function() {
      legend.labelFormat(d3.format(legendFormat)).title(legendTitle);
      svg.call(legend);
    });
    d3.select("div.chart-title").transition().delay(1000).duration(500).style("opacity", 1);
    d3.select("g.legendQuant").transition().delay(1000).duration(500).attr("opacity", 1);
  });
}
