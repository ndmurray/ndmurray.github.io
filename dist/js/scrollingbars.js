"use strict";
var margin = {
  top: 40,
  right: 40,
  bottom: 40,
  left: 10
},
    w = parseInt(d3.select('#barsdiv').style('width'), 10),
    w = w - margin.left - margin.right,
    h = 8000 - margin.top - margin.bottom;
var textShiftUp = -134,
    barShiftUp = -126,
    axisShiftUp = -18;
barpadding = 2, labelPaddingLeft = 4;
var labelPaddingTop = barShiftUp + 138;
var maxDelay = 10000,
    barDuration = 800,
    axisDuration = 800,
    defaultFade = 50,
    hoverDuration = 200;
var titleText = d3.select("h2#title").append("text.title-text").text("Incidents of Murder, per 100k Individuals, 2013").attr({
  class: "title-text",
  "font-size": "24px"
});
d3.csv("datadev/crime.csv", function(error, data) {
  if (error) {
    console.log(error);
  } else {
    console.log(data);
  }
  var crimeData = data;
  var key = function(d, i) {
    return i;
  };
  var locale = function(d, i) {
    return d.Loc;
  };
  var cleanLoc = function(d) {
    if (d.Loc.slice(-4) == "M.D.") {
      return d.Loc.substring(0, d.Loc.length - 5);
    } else if (d.Loc.slice(-6) == "M.S.A.") {
      return d.Loc.substring(0, d.Loc.length - 7);
    } else {
      return d.Loc.substring(0, d.Loc.length - 7);
    }
  };
  var rankLoc = function(d, i) {
    return i;
  };
  var barTips = d3.tip().attr({class: "d3-tip"}).offset([-10, 0]).html(function(d, i) {
    return "<p>" + cleanLoc(d) + "</p>";
  });
  var svg = d3.select("#barsdiv").append("svg").attr({
    width: w + margin.left + margin.right,
    height: h + margin.top + margin.bottom,
    id: "canvas"
  }).append("g").attr({transform: "translate(" + margin.left + "," + margin.top + ")"}).call(barTips);
  var xScaleR = d3.scale.linear().domain([0, d3.max(crimeData, function(d) {
    return +d.rape100k;
  })]).range([0, w]).nice();
  var xScaleM = d3.scale.linear().domain([0, d3.max(crimeData, function(d) {
    return +d.murder100k;
  })]).range([0, w]).nice();
  var xScaleV = d3.scale.linear().domain([0, d3.max(crimeData, function(d) {
    return +d.violentcrime100k;
  })]).range([0, w]).nice();
  var yScale = d3.scale.ordinal().domain(d3.range(crimeData.length)).rangeRoundBands([0, h], 0.05);
  var xAxisR = d3.svg.axis().scale(xScaleR).orient("top").ticks(5);
  var xAxisM = d3.svg.axis().scale(xScaleM).orient("top").ticks(5);
  var xAxisV = d3.svg.axis().scale(xScaleV).orient("top").ticks(5);
  var bars = svg.selectAll("rect").data(crimeData, key).enter().append("rect").attr({
    y: function(d, i) {
      return yScale(i);
    },
    x: function(d) {
      return 0;
    },
    width: function(d) {
      return xScaleM(+d.murder100k);
    },
    height: function(d, i) {
      return yScale.rangeBand();
    },
    transform: "translate(0," + barShiftUp + ")",
    class: "bars"
  }).on('mouseover', barTips.show).on('mouseout', barTips.hide);
  var locLabels = svg.selectAll("text.loclabels").data(crimeData, key).enter().append("text").text(cleanLoc).attr({
    x: function(d) {
      return labelPaddingLeft;
    },
    y: function(d, i) {
      return yScale(i) + labelPaddingTop;
    },
    transform: "translate(0," + textShiftUp + ")",
    class: "loclabels"
  });
  var valueLabels = svg.selectAll("text.valuelabels").data(crimeData, key).enter().append("text").text(function(d) {
    return d3.format(",")(+d.murder100k);
  }).attr({
    x: function(d) {
      return xScaleM(+d.murder100k) + labelPaddingLeft;
    },
    y: function(d, i) {
      return yScale(i) + labelPaddingTop;
    },
    transform: "translate(0," + textShiftUp + ")",
    class: "valuelabels"
  });
  svg.append("g").attr({
    class: "xaxis",
    transform: "translate(0," + axisShiftUp + ")"
  }).call(xAxisM);
  d3.select("button#murder").on("click", function() {
    sortBarsM();
  });
  d3.select("button#rape").on("click", function() {
    sortBarsR();
  });
  d3.select("button#violentcrime").on("click", function() {
    sortBarsV();
  });
  d3.select("button#murder").on("click", function() {
    crimeData.sort(function(a, b) {
      return d3.descending(+a.murder100k, +b.murder100k);
    });
    svg.selectAll("rect.bars").data(crimeData, key).transition().delay(function(d, i) {
      return i / crimeData.length * maxDelay;
    }).duration(barDuration).ease("cubic-in-out").attr({
      width: function(d) {
        return xScaleM(+d.murder100k);
      },
      y: function(d, i) {
        return yScale(i);
      },
      fill: "red"
    });
    d3.select("text.title-text").transition().duration(barDuration).each("start", function() {
      d3.select(this).attr({"fill-opacity": 0});
    }).text("Incidents of Murder, per 100k Individuals, 2013").each("end", function() {
      d3.select(this).attr({"fill-opacity": 1});
    });
    d3.selectAll("text.loclabels").data(crimeData, key).transition().duration(barDuration).ease("cubic-in-out").text(cleanLoc).attr({y: function(d, i) {
        return yScale(i) + labelPaddingTop;
      }});
    d3.selectAll("text.valuelabels").data(crimeData, key).transition().delay(function(d, i) {
      return i / crimeData.length * maxDelay;
    }).duration(barDuration).text(function(d) {
      return d3.format(",")(+d.murder100k);
    }).attr({
      x: function(d) {
        return xScaleM(+d.murder100k) + labelPaddingLeft;
      },
      y: function(d, i) {
        return yScale(i) + labelPaddingTop;
      }
    });
    d3.select(".xaxis").transition().duration(axisDuration).call(xAxisM);
  });
  d3.select("button#rape").on("click", function() {
    crimeData.sort(function(a, b) {
      return d3.descending(+a.rape100k, +b.rape100k);
    });
    svg.selectAll("rect.bars").data(crimeData, key).transition().delay(function(d, i) {
      return i / crimeData.length * maxDelay;
    }).duration(barDuration).ease("cubic-in-out").attr({
      width: function(d) {
        return xScaleR(+d.rape100k);
      },
      y: function(d, i) {
        return yScale(i);
      },
      fill: "rgb(73, 121, 107)"
    });
    d3.select("h2#title").transition().duration(barDuration).text("Incidents of Rape, per 100k Individuals, 2013");
    d3.selectAll("text.loclabels").data(crimeData, key).transition().duration(barDuration).ease("cubic-in-out").text(cleanLoc).attr({y: function(d, i) {
        return yScale(i) + labelPaddingTop;
      }});
    d3.selectAll("text.valuelabels").data(crimeData, key).transition().delay(function(d, i) {
      return i / crimeData.length * maxDelay;
    }).duration(barDuration).text(function(d) {
      return d3.format(",")(+d.rape100k);
    }).attr({
      x: function(d) {
        return xScaleR(+d.rape100k) + labelPaddingLeft;
      },
      y: function(d, i) {
        return yScale(i) + labelPaddingTop;
      }
    });
    d3.select(".xaxis").transition().duration(axisDuration).call(xAxisR);
  });
  d3.select("button#violentcrime").on("click", function() {
    crimeData.sort(function(a, b) {
      return d3.descending(+a.violentcrime100k, +b.violentcrime100k);
    });
    svg.selectAll("rect.bars").data(crimeData, key).transition().delay(function(d, i) {
      return i / crimeData.length * maxDelay;
    }).duration(barDuration).ease("cubic-in-out").attr({
      width: function(d) {
        return xScaleV(+d.violentcrime100k);
      },
      y: function(d, i) {
        return yScale(i);
      }
    });
    d3.select("h2#title").transition().duration(barDuration).text("Incidents of Violent Crime, per 100k Individuals, 2013");
    d3.selectAll("text.loclabels").data(crimeData, key).transition().duration(barDuration).ease("cubic-in-out").text(cleanLoc).attr({y: function(d, i) {
        return yScale(i) + labelPaddingTop;
      }});
    d3.selectAll("text.valuelabels").data(crimeData, key).transition().delay(function(d, i) {
      return i / crimeData.length * maxDelay;
    }).duration(barDuration).text(function(d) {
      return d3.format(",")(+d.violentcrime100k);
    }).attr({
      x: function(d) {
        return xScaleV(+d.violentcrime100k) + labelPaddingLeft;
      },
      y: function(d, i) {
        return yScale(i) + labelPaddingTop;
      }
    });
    d3.select(".xaxis").transition().duration(axisDuration).call(xAxisV);
  });
  var sortBarsM = function() {
    svg.selectAll("rect.bars").sort(function(a, b) {
      return d3.descending(+a.murder100k, +b.murder100k);
    }).transition().duration(barDuration).attr("y", function(d, i) {
      return yScale(i);
    });
  };
  var sortBarsR = function() {
    svg.selectAll("rect.bars").sort(function(a, b) {
      return d3.descending(+a.rape100k, +b.violentcrime100k);
    }).transition().duration(barDuration).attr("y", function(d, i) {
      return yScale(i);
    });
  };
  var sortBarsV = function() {
    svg.selectAll("rect.bars").sort(function(a, b) {
      return d3.descending(+a.violentcrime100k, +b.violentcrime100k);
    }).transition().duration(barDuration).attr("y", function(d, i) {
      return yScale(i);
    });
  };
  d3.select("svg").on('resize', resize);
  function resize() {
    w = parseInt(d3.select('#barsdiv').style('width'), 10);
    w = w - margin.left - margin.right;
    xScaleR.range([0, w]), xScaleM.range([0, w]);
  }
});
