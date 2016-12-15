"use strict";
var margin = {
  top: 10,
  right: 60,
  bottom: 20,
  left: 60
},
    w = parseInt(d3.select('#donut-div').style('width'), 10),
    w = w - margin.left - margin.right,
    h = parseInt(d3.select('#donut-div').style('height'), 10),
    h = h - margin.top - margin.bottom,
    radius = Math.min(w, h) / 2;
labelRadius = w / 2 + 8;
var tipDuration = 200;
d3.csv("/8step.io/production_data/ctc_data/divisions.csv", function(error, data) {
  if (error) {
    console.log(error);
  } else {
    console.log(data);
  }
  var projectData = data;
  var donutData = function(d) {
    return +d.avg_revenue;
  };
  var svg = d3.select("#donut-div").append("svg").attr("width", w + margin.left + margin.right).attr("height", h + margin.top + margin.bottom).attr("id", "canvas").append("g").attr("transform", "translate(" + ((w / 2) + margin.left) + "," + ((h / 2) + margin.top) + ")");
  var donutTip = d3.select("body").append("div").attr("class", "tooltip donut-tip").style("opacity", 0);
  var color = d3.scaleOrdinal().range(["#FBAF43", "#198F90", "#9E004D", "#F1594E", "#9BD19D"]);
  var arcDef = d3.arc().outerRadius(radius - 10).innerRadius(radius - 80);
  var pie = d3.pie().sort(null).value(function(d) {
    return donutData(d);
  });
  var arc = svg.selectAll(".arc").data(pie(projectData)).enter().append("g").attr("class", "arc");
  var arcPath = arc.append("path").attr("d", arcDef).attr("class", "arc-path").style("fill", function(d) {
    return color(d.data.division_clean);
  }).each(function(d) {
    this._current = d;
  });
  var donutLabels = arc.append("text").attr("transform", function(d) {
    var c = arcDef.centroid(d),
        x = c[0],
        y = c[1],
        h = Math.sqrt(x * x + y * y);
    return "translate(" + (x / h * labelRadius) + "," + (y / h * labelRadius) + ")";
  }).attr("fill", "white").attr("class", "arc-label").attr("text-anchor", function(d) {
    return (d.endAngle + d.startAngle) / 2 > Math.PI ? "end" : "start";
  }).text(function(d) {
    return d.data.division_clean;
  });
  arcPath.on("mouseover", function(d) {
    donutTip.transition().duration(tipDuration).style("opacity", 1);
    donutTip.html("<div class='title-display'>" + d.data.division_display + ", FY17</div><br /><div class = data-display>Total Projects: " + d.data.projects + "<br />Total Revenue: $" + d3.format(',')(+d.data.revenue) + "</div>").style("left", "18em").style("top", "2em");
  }).on("mouseout", function(d) {
    donutTip.transition().duration(tipDuration).style("opacity", 0);
  });
  d3.selectAll(".m-choice").on("click", function() {
    var donutValue = d3.select(this).attr('value');
    var donutData = function(d) {
      return eval(donutValue);
    };
    pie.value(function(d) {
      return donutData(d);
    });
    arcPath.data(pie(projectData));
    arcPath.transition().duration(600).attrTween("d", arcTween);
    d3.selectAll(".arc-label").data(pie(projectData)).transition().duration(600).attr("transform", function(d) {
      var c = arcDef.centroid(d),
          x = c[0],
          y = c[1],
          h = Math.sqrt(x * x + y * y);
      return "translate(" + (x / h * labelRadius) + "," + (y / h * labelRadius) + ")";
    }).attr("text-anchor", function(d) {
      return (d.endAngle + d.startAngle) / 2 > Math.PI ? "end" : "start";
    }).text(function(d) {
      return d.data.division_clean;
    });
  });
  function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
      return arcDef(i(t));
    };
  }
});
