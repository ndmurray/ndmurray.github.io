"use strict";
var lineMargin = {
  top: 60,
  right: 40,
  bottom: 70,
  left: 60
},
    lineW = parseInt(d3.select('#line-div').style('width'), 10),
    lineW = lineW - lineMargin.left - lineMargin.right,
    lineH = parseInt(d3.select('#line-div').style('height'), 10),
    lineH = lineH - lineMargin.top - lineMargin.bottom;
var lineDuration = 600;
var tipDuration = 200;
var parseDate = d3.timeParse("%d-%b-%y");
var formatTimeWeek = d3.timeFormat("%d-%b-%y");
var formatTimeMonth = d3.timeFormat("%b");
var formatTimeYear = d3.timeFormat("%Y");
var xScale = d3.scaleTime().range([0, lineW]);
var yScale = d3.scaleLinear().range([lineH, 0]);
var dotRadius = "0.25em";
var yLabelShift = -lineMargin.left / 2 - 20;
d3.csv("/8step.io/production_data/ctc_data/ctc_lines.csv", function(d) {
  d.date = parseDate(d.date);
  d.division_clean = d.division_clean;
  d.avg_revenue = +d.avg_revenue;
  d.projects_share = +d.projects_share;
  d.projects_total = +d.projects_total;
  d.revenue_share = +d.revenue_share;
  d.revenue_total = +d.revenue_total;
  return d;
}, function(error, data) {
  if (error) {
    console.log(error);
  } else {
    console.log(data);
  }
  var timeData = data;
  var ushData = data.filter(function(d) {
    return d.division_clean == "USH";
  });
  var sepData = data.filter(function(d) {
    return d.division_clean == "SEP";
  });
  var ihdData = data.filter(function(d) {
    return d.division_clean == "IHD";
  });
  var iegData = data.filter(function(d) {
    return d.division_clean == "IEG";
  });
  var enrData = data.filter(function(d) {
    return d.division_clean == "ENR";
  });
  var lineData = function(d) {
    return d.revenue_share;
  };
  xScale.domain(d3.extent(timeData, function(d) {
    return d.date;
  }));
  yScale.domain(d3.extent(timeData, function(d) {
    return lineData(d);
  })).nice();
  var xAxis = d3.axisBottom().scale(xScale).tickFormat(formatTimeMonth);
  var yAxis = d3.axisLeft().scale(yScale);
  var line = d3.line().curve(d3.curveLinear).x(function(d) {
    return xScale(d.date);
  }).y(function(d) {
    return yScale(lineData(d));
  });
  var svg = d3.select("#line-div").append("svg").attr("width", lineW + lineMargin.left + lineMargin.right).attr("height", lineH + lineMargin.top + lineMargin.bottom).attr("id", "line-canvas").append("g").attr("transform", "translate(" + lineMargin.left + "," + lineMargin.top + ")");
  var pathUSH = svg.append("path").datum(ushData).attr("d", line).attr("class", "path").attr("id", "ush-path");
  var nodesUSH = svg.selectAll("circle.ush-nodes").data(ushData).enter().append("circle").attr("class", "nodes ush-nodes").attr("r", dotRadius).attr("cx", function(d) {
    return xScale(d.date);
  }).attr("cy", function(d) {
    return yScale(lineData(d));
  });
  var pathSEP = svg.append("path").datum(sepData).attr("d", line).attr("class", "path").attr("id", "sep-path");
  var nodesSEP = svg.selectAll("circle.sep-nodes").data(sepData).enter().append("circle").attr("class", "nodes sep-nodes").attr("r", dotRadius).attr("cx", function(d) {
    return xScale(d.date);
  }).attr("cy", function(d) {
    return yScale(lineData(d));
  });
  var pathIHD = svg.append("path").datum(ihdData).attr("d", line).attr("class", "path").attr("id", "ihd-path");
  var nodesIHD = svg.selectAll("circle.ihd-nodes").data(ihdData).enter().append("circle").attr("class", "nodes ihd-nodes").attr("r", dotRadius).attr("cx", function(d) {
    return xScale(d.date);
  }).attr("cy", function(d) {
    return yScale(lineData(d));
  });
  var pathIEG = svg.append("path").datum(iegData).attr("d", line).attr("class", "path").attr("id", "ieg-path");
  var nodesIEG = svg.selectAll("circle.ieg-nodes").data(iegData).enter().append("circle").attr("class", "nodes ieg-nodes").attr("r", dotRadius).attr("cx", function(d) {
    return xScale(d.date);
  }).attr("cy", function(d) {
    return yScale(lineData(d));
  });
  var pathENR = svg.append("path").datum(enrData).attr("d", line).attr("class", "path").attr("id", "enr-path");
  var nodesENR = svg.selectAll("circle.enr-nodes").data(enrData).enter().append("circle").attr("class", "nodes enr-nodes").attr("r", dotRadius).attr("cx", function(d) {
    return xScale(d.date);
  }).attr("cy", function(d) {
    return yScale(lineData(d));
  });
  var lineTip = d3.select("#line-div").append("div").attr("id", "line-tip").style("display", "none");
  d3.selectAll(".nodes").on("mouseover", function(d) {
    lineTip.transition().duration(tipDuration).style("display", "inline-block");
    lineTip.html("<p><span class='line-val-display'>" + d3.format(".1%")(lineData(d)) + "</span><br /><span class='time-display'>" + formatTimeMonth(d.date) + " " + formatTimeYear(d.date) + "</span></p>").style("left", d3.select(this).attr("cx")).style("top", d3.select(this).attr("cy"));
  }).on("mouseout", function() {
    lineTip.transition().duration(tipDuration).style("display", "none");
  });
  svg.append("g").attr("class", "axis x-axis").attr("transform", "translate(0," + lineH + ")").call(xAxis);
  d3.selectAll(".x-axis text").attr("transform", "rotate(-45)").attr("text-anchor", "end");
  svg.append("g").attr("class", "axis y-axis").call(yAxis).append("text").text("Average Revenue ($US)").attr("fill", "gray").attr("transform", "translate(" + yLabelShift + "," + (lineH / 2 - lineMargin.bottom - lineMargin.top) + "), rotate(-90)");
  var donutMargin = {
    top: 0,
    right: 60,
    bottom: 0,
    left: 60
  },
      w = parseInt(d3.select('#donut-div').style('width'), 10),
      w = w - donutMargin.left - donutMargin.right,
      h = parseInt(d3.select('#donut-div').style('height'), 10),
      h = h - donutMargin.top - donutMargin.bottom,
      radius = Math.min(w, h) / 2,
      labelRadius = w / 2 + 8;
  var tipDuration = 200;
  var donutDuration = 600;
  d3.csv("/8step.io/production_data/ctc_data/divisions.csv", function(error, data) {
    if (error) {
      console.log(error);
    } else {
      console.log(data);
    }
    var donutData = data;
    var arcData = function(d) {
      return +d.revenue_share;
    };
    var svg = d3.select("#donut-div").append("svg").attr("width", w + donutMargin.left + donutMargin.right).attr("height", h + donutMargin.top + donutMargin.bottom).attr("id", "donut-canvas").append("g").attr("transform", "translate(" + ((w / 2) + donutMargin.left) + "," + ((h / 2) + donutMargin.top) + ")");
    var color = d3.scaleOrdinal().range(["#FBAF43", "#198F90", "#9E004D", "#F1594E", "#9BD19D"]);
    var arcDef = d3.arc().outerRadius(radius - 10).innerRadius(radius - 80);
    var arcDefLabel = d3.arc().outerRadius(radius + 40).innerRadius(radius);
    var pie = d3.pie().sort(null).value(function(d) {
      return arcData(d);
    });
    var arc = svg.selectAll(".arc").data(pie(donutData)).enter().append("g").attr("class", "arc");
    var arcPath = arc.append("path").attr("d", arcDef).attr("class", "arc-path").style("fill", function(d) {
      return color(d.data.division_clean);
    }).each(function(d) {
      this._current = d;
    });
    var donutLabels = arc.append("text").attr("transform", function(d) {
      return "translate(" + arcDefLabel.centroid(d) + ")";
    }).attr("fill", "white").attr("class", "arc-label").attr("text-anchor", function(d) {
      return (d.endAngle + d.startAngle) / 2 > Math.PI ? "end" : "start";
    }).text(function(d) {
      return d.data.division_clean;
    });
    var donutTip = d3.select("#donut-div").append("div").attr("class", "tooltip donut-tip").style("position", "absolute").style("left", ((w + donutMargin.left + donutMargin.right) / 2)).style("top", ((h / 2) + donutMargin.top)).style("opacity", 0);
    arcPath.on("mouseover", function(d) {
      donutTip.transition().duration(tipDuration).style("opacity", 1);
      donutTip.html("<div class='title-display'>" + d.data.division_display + ", FY17</div><br /><div class = data-display>Total Projects:<strong> " + d.data.projects_total + "</strong><br />Total Revenue: <strong>$" + d3.format(',.2f')(d.data.revenue_total) + "</strong><br />Avg Revenue/Project:<strong> $" + d3.format(',.2f')(d.data.avg_revenue) + "</strong></div>");
    }).on("mouseout", function(d) {
      donutTip.transition().duration(tipDuration).style("opacity", 0);
    });
    d3.selectAll(".m-choice").on("click", function() {
      var lineValue = d3.select(this).attr('value');
      var arcValue = lineValue;
      var lineData = function(d) {
        return eval(lineValue);
      };
      d3.csv("/8step.io/production_data/ctc_data/ctc_lines.csv", function(d) {
        d.date = parseDate(d.date);
        d.division_clean = d.division_clean;
        d.avg_revenue = +d.avg_revenue;
        d.projects_share = +d.projects_share;
        d.projects_total = +d.projects_total;
        d.revenue_share = +d.revenue_share;
        d.revenue_total = +d.revenue_total;
        return d;
      }, function(error, data) {
        if (error) {
          console.log(error);
        } else {}
        var yScale = d3.scaleLinear().range([lineH, 0]);
        yScale.domain(d3.extent(timeData, function(d) {
          return lineData(d);
        })).nice();
        var line = d3.line().x(function(d) {
          return xScale(d.date);
        }).y(function(d) {
          return yScale(lineData(d));
        });
        pathUSH.transition().duration(lineDuration).attr("d", line);
        nodesUSH.transition().duration(lineDuration).attr("cy", function(d) {
          return yScale(lineData(d));
        });
        pathSEP.transition().duration(lineDuration).attr("d", line);
        nodesSEP.transition().duration(lineDuration).attr("cy", function(d) {
          return yScale(lineData(d));
        });
        pathIHD.transition().duration(lineDuration).attr("d", line);
        nodesIHD.transition().duration(lineDuration).attr("cy", function(d) {
          return yScale(lineData(d));
        });
        pathIEG.transition().duration(lineDuration).attr("d", line);
        nodesIEG.transition().duration(lineDuration).attr("cy", function(d) {
          return yScale(lineData(d));
        });
        pathENR.transition().duration(lineDuration).attr("d", line);
        nodesENR.transition().duration(lineDuration).attr("cy", function(d) {
          return yScale(lineData(d));
        });
      });
      var arcData = function(d) {
        return eval(arcValue);
      };
      pie.value(function(d) {
        return arcData(d);
      });
      arcPath.data(pie(donutData));
      arcPath.transition().duration(donutDuration).attrTween("d", arcTween);
      d3.selectAll(".arc-label").data(pie(donutData)).transition().duration(donutDuration).attr("transform", function(d) {
        return "translate(" + arcDefLabel.centroid(d) + ")";
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
});
