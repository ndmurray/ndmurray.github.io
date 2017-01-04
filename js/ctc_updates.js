d3.selectAll(".m-choice").on("click", function() {


//Update lines!
		//Update data variable
		var lineValue = d3.select(this).attr('value');
		var lineData = function(d) { return eval(lineValue); };

		//Update yScale domain
		yScale.domain(d3.extent(timeData, function(d) { return lineData(d); })).nice();

		//Redefine line y attribute
		var line = d3.line()
			.x(function(d) { return xScale(d.date); })
	    	.y(function(d) { return yScale(lineData(d)); });

	    //Redraw paths and nodes

	    //USH
	    pathUSH.transition().duration(lineDuration).attr("d", line);
		nodesUSH.transition().duration(lineDuration).attr("cy", function(d) { return yScale(lineData(d)); });

		//SEP
		pathSEP.transition().duration(lineDuration).attr("d", line);
		nodesSEP.transition().duration(lineDuration).attr("cy", function(d) { return yScale(lineData(d)); });

		//IHD
		pathIHD.transition().duration(lineDuration).attr("d", line);
		nodesIHD.transition().duration(lineDuration).attr("cy", function(d) { return yScale(lineData(d)); });

		//IEG
		pathIEG.transition().duration(lineDuration).attr("d", line);
		nodesIEG.transition().duration(lineDuration).attr("cy", function(d) { return yScale(lineData(d)); });

		//ENR
		pathENR.transition().duration(lineDuration).attr("d", line);
		nodesENR.transition().duration(lineDuration).attr("cy", function(d) { return yScale(lineData(d)); });

//Update donut!

		//Update data variable
		var arcValue = d3.select(this).attr('value');
		var arcData = function(d) {return eval(arcValue); };
		
		//Update elements, from - http://bl.ocks.org/mbostock/1346410
		pie.value(function(d) { return arcData(d); }); // the data driving pie layou
		arcPath.data(pie(donutData));// compute the new angles
		arcPath.transition().duration(donutDuration).attrTween("d",arcTween);

		//Redraw labels

		d3.selectAll(".arc-label")
			.data(pie(donutData))
			.transition().duration(donutDuration)
			.attr("transform", function(d) { return "translate(" + arcDefLabel.centroid(d) +")"; }) 
			//this puts labels at uniform distance away from donut per the deprecated stack overflow link in original label definition, although I don't quite understand how it works
	      	.attr("text-anchor", function (d) {
      					return (d.endAngle + d.startAngle)/2 > Math.PI ?
		      					"end" : "start";
		     })
		    .text(function(d) { return d.data.division_clean; });
		    	    
		});

	//Tween function for smooth transition, also from Bostock
	// Store the displayed angles in _current.
	// Then, interpolate from _current to the new angles.
		// During the transition, _current is updated in-place by d3.interpolate.
	function arcTween(a) {
	  var i = d3.interpolate(this._current, a);
	  this._current = i(0);
	  return function(t) {
	    return arcDef(i(t));
	  };
	}

