"use strict";
d3.selectAll(".m-choice").on("click", function() {
  var lineValue = d3.select(this).attr('value');
  var lineData = function(d) {
    return eval(lineValue);
  };
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
  var arcValue = d3.select(this).attr('value');
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
