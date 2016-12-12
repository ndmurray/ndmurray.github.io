"use strict";
var margin = {
  top: 10,
  right: 20,
  bottom: 20,
  left: 80
},
    w = parseInt(d3.select('#donut-div').style('width'), 10),
    w = w - margin.left - margin.right,
    h = parseInt(d3.select('#donut-div').style('height'), 10),
    h = h - margin.top - margin.bottom,
    radius = Math.min(w, h) / 2;
var tipDuration = 200;
d3.csv("/8step.io/production_data/ctc_data/divisions.csv", function(error, data) {
  if (error) {
    console.log(error);
  } else {
    console.log(data);
  }
  var projectData = data;
  var donutData = function(d) {
    return +d.project_share;
  };
  var svg = d3.select("#donut-div").append("svg").attr("width", w + margin.left + margin.right).attr("height", h + margin.top + margin.bottom).attr("id", "canvas").append("g").attr("transform", "translate(" + ((w / 2) + margin.left) + "," + ((h / 2) + margin.top) + ")");
  var donutTip = d3.select("body").append("div").attr("class", "tooltip donut-tip").style("opacity", 0);
  var color = d3.scaleOrdinal().range(["#FBAF43", "#198F90", "#9E004D", "#F1594E", "#9BD19D"]);
  var arcDef = d3.arc().outerRadius(radius - 10).innerRadius(radius - 120);
  var pie = d3.pie().sort(null).value(function(d) {
    return +d.project_share;
  });
  var arc = svg.selectAll(".arc").data(pie(projectData)).enter().append("g").attr("class", "arc");
  var arcPath = arc.append("path").attr("d", arcDef).attr("class", "arc-path").style("fill", function(d) {
    return color(d.data.division_clean);
  });
  var donutLabels = arc.append("text").attr("transform", function(d) {
    return "translate(" + arcDef.centroid(d) + ")";
  }).attr("dy", ".35em").text(function(d) {
    return d.data.division_clean;
  });
  arcPath.on("mouseover", function(d) {
    donutTip.transition().duration(tipDuration).style("opacity", 0.8);
    donutTip.html("<span class='value-display'>$" + donutData(d) + "</span><br /><span class = date-display>FY2017</span>").style("left", d3.event.pageX + "px").style("top", d3.event.pageY + "px");
  }).on("mouseout", function(d) {
    donutTip.transition().duration(tipDuration).style("opacity", 0);
  });
});
