"use strict";
var margin = {
  top: 80,
  right: 140,
  bottom: 40,
  left: 60
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
    xaxisShiftX = 60,
    yaxisShiftX = 60,
    xaxisShiftY = -60,
    yaxisShiftY = 0;
var infoTop = 115,
    infoLeft = w + margin.left,
    infoWidth = 12 + "em",
    infoHeight = 30 + "em";
d3.csv("/8step.io/production_data/world_data/datadev/world.csv", function(error, data) {
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
    return +d.polistab;
  };
  var dataY = function(d) {
    return 100 - +d.press;
  };
  var dataR = function(d) {
    return +d.gdphead;
  };
  console.log(dataX.toString());
  var titleX = "Political Stabtility";
  var titleY = "Press Freedom";
  var titleR = "GDP per Capita";
  var titleText = d3.select("h2#chart-title").append("text.title-text").text(titleX + " vs. " + titleY);
  var dotTips = d3.tip().attr({class: "d3-tip"}).style({
    top: infoTop,
    left: infoLeft,
    width: infoWidth,
    height: infoHeight
  }).direction('e').html(function(d) {
    return "<p id='tiphead'>" + d.country + "</p><p class='tip-subhead'>Income Group:</p><p class='tip-body'>" + (d.ig) + "</p>" + "<p class='tip-subhead'>Region:</p><p class='tip-body'>" + (d.region) + "</p>";
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
  })]).range([0, h + xaxisShiftY]).nice();
  var rScale = d3.scale.linear().domain([0, d3.max(worldData, function(d) {
    return dataR(d);
  })]).range([4, 40]).nice();
  var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
  var yAxis = d3.svg.axis().scale(yScale).orient("left");
  var guideLines = function(d) {
    svg.append("g").classed("guide", true).append("line").attr("y1", d3.select(".a-dot").attr("cy")).attr("y2", d3.select(".a-dot").attr("cy")).attr("x1", yaxisShiftX).attr("x2", d3.select(".a-dot").attr("cx")).attr("stroke", d3.select(".a-dot").attr("fill"));
    svg.append("g").classed("guide", true).append("line").attr("y1", h + xaxisShiftY).attr("y2", d3.select(".a-dot").attr("cy")).attr("x1", d3.select(".a-dot").attr("cx")).attr("x2", d3.select(".a-dot").attr("cx")).attr("stroke", d3.select(".a-dot").attr("fill"));
  };
  var mouseOn = function() {
    d3.select(this).attr("opacity", 1.0).classed("a-dot", true).classed("dots", false);
    guideLines();
    d3.selectAll("circle.dots").attr("opacity", 0.15);
  };
  var mouseOff = function() {
    d3.select(this).classed("a-dot", false).classed("dots", true);
    d3.selectAll(".guide").remove();
    d3.selectAll("circle.dots").attr("opacity", 0.85);
  };
  var dotsGroup = svg.append("g").attr({id: "dots-group"});
  var dotsFilter = dotsGroup.append("defs").append("filter").attr({
    id: "dots-filter",
    x: 0,
    y: 0,
    width: "200%",
    height: "200%"
  });
  var shadowOffset = dotsFilter.append("feOffset").attr({
    result: "offOut",
    in: "SourceGraphic",
    dx: 20,
    dy: 20
  });
  var shadowBlend = dotsFilter.append("feBlend").attr({
    in: "SourceGraphic",
    in2: "offOut",
    mode: "normal"
  });
  var dots = d3.select("#dots-group").selectAll("circle").data(worldData, key).enter().append("circle").filter(function(d) {
    return dataX(d);
  }).filter(function(d) {
    return dataY(d);
  }).filter(function(d) {
    return dataR(d);
  }).attr({
    class: "dots",
    id: function(d) {
      return d.country;
    },
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
      if (d.ig == "High income: nonOECD") {
        return "#CEE879";
      } else if (d.ig == "Low income") {
        return "#FFA700";
      } else if (d.ig == "Upper middle income") {
        return "#54EBBA";
      } else if (d.ig == "Lower middle income") {
        return "#1DC28C";
      } else if (d.ig == "High income: OECD") {
        return "#FF93D2";
      } else {
        return "black";
      }
    },
    "opacity": 0.85
  }).style({}).call(dotTips).on('mouseenter', dotTips.show).on('mouseover', mouseOn).on('mouseleave', dotTips.hide).on('mouseout', mouseOff);
  svg.append("g").attr({
    class: "xaxis",
    transform: "translate(" + xaxisShiftX + "," + (h + xaxisShiftY) + ")"
  }).call(xAxis);
  var xLabel = svg.append("text").attr({
    class: "x-label",
    "text-anchor": "middle",
    transform: function(d) {
      return "translate(" + w / 2 + "," + (h) + ")";
    }
  }).text(titleX);
  svg.append("g").attr({
    class: "yaxis",
    transform: "translate(" + yaxisShiftX + "," + 0 + ")"
  }).call(yAxis);
  var yLabel = svg.append("text").attr({
    class: "y-label",
    "text-anchor": "middle",
    transform: function(d) {
      return "translate(" + 0 + "," + (h + xaxisShiftY) / 2 + ") rotate(-90)";
    }
  }).text(titleY);
  d3.selectAll(".x-choice").on("click", function() {
    var xValue = d3.select(this).attr('value');
    console.log(xValue);
    var dataX = function(d) {
      return eval(xValue);
    };
    switch (xValue) {
      case "+d.gini":
        titleX = "Gini Index";
        break;
      case "+d.press":
        titleX = "Press Freedom";
        break;
      case "+d.mfr":
        titleX = "Male to female Ratio";
        break;
      case "+d.life_exp":
        titleX = "Life Expectancy";
        break;
      case "+d.gre":
        titleX = "Female enrollment ratio";
        break;
      case "+d.corruption":
        titleX = "Control of Corruption";
        break;
      case "+d.polistab":
        titleX = "Political Stability";
        break;
      case "+d.gdphead":
        titleX = "GDP per Capita";
        break;
    }
    var xScale = d3.scale.linear().domain([d3.min(worldData, function(d) {
      return dataX(d);
    }), d3.max(worldData, function(d) {
      return dataX(d);
    })]).range([0, w]).nice();
    d3.select("#dots-group").selectAll("circle").filter(function(d) {
      return dataX(d);
    }).transition().duration(1000).attr({cx: function(d) {
        return xScale(dataX(d));
      }});
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    xLabel.text(titleX);
    d3.select(".xaxis").transition().duration(1000).call(xAxis);
  });
  d3.selectAll(".y-choice").on("click", function() {
    var yValue = d3.select(this).attr('value');
    console.log(yValue);
    var dataY = function(d) {
      return eval(yValue);
    };
    switch (yValue) {
      case "+d.gini":
        titleY = "Gini Index";
        break;
      case "+d.press":
        titleY = "Press Freedom";
        break;
      case "+d.mfr":
        titleY = "Male to female Ratio";
        break;
      case "+d.life_exp":
        titleY = "Life Expectancy";
        break;
      case "+d.gre":
        titleY = "Female enrollment ratio";
        break;
      case "+d.corruption":
        titleY = "Control of Corruption";
        break;
      case "+d.polistab":
        titleY = "Political Stability";
        break;
      case "+d.gdphead":
        titleY = "GDP per Capita";
        break;
    }
    var yScale = d3.scale.linear().domain([d3.max(worldData, function(d) {
      return dataY(d);
    }), d3.min(worldData, function(d) {
      return dataY(d);
    })]).range([0, h + xaxisShiftY]).nice();
    d3.select("#dots-group").selectAll("circle").filter(function(d) {
      return dataY(d);
    }).transition().duration(1000).attr({cy: function(d) {
        return yScale(dataY(d));
      }});
    var yAxis = d3.svg.axis().scale(yScale).orient("left");
    yLabel.text(titleY);
    d3.select(".yaxis").transition().duration(1000).call(yAxis);
  });
});
