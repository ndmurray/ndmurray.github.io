//General use variables
	
	//Margin and padding
	var	margin = {top: 40, right: 10, bottom: 40, left: 10},
		w = parseInt(d3.select('#barsdiv').style('width'), 10),//Get width of containing div for responsiveness
		w = w - margin.left - margin.right,
		h = 8000 - margin.top - margin.bottom;

	//Padding between output range and edge of canvas
	var canvasPadding = {top: 0, right: 100, bottom: 0, left:0};
		
		//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563

	//Default positioning
	var textShiftUp = -134,
	    barShiftUp = -126,
	    axisShiftUp = -18;
	    barpadding = 2, //deprecated
		labelPaddingLeft = 4,
	    labelPaddingTop = barShiftUp + 138; 

	//Transitions
	var maxDelay = 10000,
	    barDuration = 800,
	    axisDuration = 800,
	    defaultFade = 50,
	    hoverDuration = 200;



//Text for title 
	var titleText = d3.select("h2#title").append("text.title-text")
		.text("Incidents of Murder, per 100k Individuals, 2013")
		.attr({
			class:"title-text",
			"font-size":"24px"
		});



//Begin Data!
d3.csv("/nickm.io/production_data/crime_data/datadev/crime.csv",function(error,data) {
			
	if(error) {
		console.log(error);
	} else {
		console.log(data);
	}

//Key dataset-dependent variables

	//Data and key functions
	var crimeData = data;
	var	key = function(d,i) {
		return i; //Simply i to remove bar-sorting on transition
		//return d.Loc; //Binding row ID to location name
	};
	var locale = function(d,i) {
		return d.Loc;
	};

	//Display variables
	var cleanLoc = function(d) {
			if (d.Loc.slice(-4) == "M.D.") {
				return d.Loc.substring(0,d.Loc.length - 5);
			} else if (d.Loc.slice(-6) == "M.S.A.") {
				return d.Loc.substring(0,d.Loc.length - 7);
			} else {
				return d.Loc.substring(0,d.Loc.length - 7);
			}
		};


//Tooltips - http://bit.ly/22HClnd
	var barTips = d3.tip()
		.attr({
			class: "d3-tip"
		})
		.offset([0, 0])
		.direction('n')
  		.html(function(d) {
  		  return "<p id='tiphead'>" + cleanLoc(d) + "</p><p id='tipbody'>Population: " + d3.format(',')(+d.Pop) + "</p>";
 		 });


//Set up the canvas
	var svg = d3.select("#barsdiv")
		.append("svg")
		.attr({
			width: w + margin.left + margin.right, 
			height: h + margin.top + margin.bottom,
			//viewBox and preserveAspect ratios set to make chart resize with window, but only shrink down to a certain point (any further shrinking and bars will be too small to read as long as we're preserving their aspect ratio)
			//The resize functoin defined in this file is also necessary to re-assign svg (viewport) dimensions on resize
			viewBox: "0 0 " + 380/*(w + margin.left + margin.right)*/ + " " + 8000/* (h + margin.top + margin.bottom)*/,
			preserveAspectRatio: "xMinYMin meet",
			id: "canvas"

			})
		.append("g") //This g element and it attributes also following bstok's margin convention. It holds all the canvas' elements.
		.attr({
			transform: "translate(" + margin.left + "," + margin.top + ")"

		})
		.call(barTips);  //must be called on canvas -  http://bit.ly/22HClnd


//Define linear x scales

	//X scale
	var xScale = d3.scale.linear()
		.domain([0, d3.max(crimeData,function(d) {
			return +d.murder100k;
		})])
		.range([0, w - canvasPadding.right])
		.nice();

//Variables for elements that resize (not just rescale with viewBox and preserveAspectRatio on the svg)

	//Bar width, text label position
	var scaledWidth = function(d) { return xScale(+d.murder100k); };
	//var scaledX = scaledWidth() + 4; //+ 4 + "px";
	var scaledX = function(d) { return scaledWidth(d) + labelPaddingLeft; };
	//Text label position 


	//Ordinal y scale
	var yScale = d3.scale.ordinal()
		.domain(d3.range(crimeData.length))
		.rangeRoundBands([0, h],0.05);

//Axes

	//Linear x axis
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("top")
		.ticks(5);

//Default chart elements

	//Bars	
	var bars = svg.selectAll("rect")
		.data(crimeData,key)
		.enter() //Entering parsed data; we'll be looping through rectangles for each row
		.append("rect")
		.attr({
			y: function(d,i) {
					return yScale(i);
					//return i * (h/crimeData.length); 
			},
			x: function(d) {
					//return margin.left;
					return 0; 
			},
			width: scaledWidth,
			height: function(d,i) {
					return yScale.rangeBand(); //specify the range bands defined in yScale's definition as the height
					//Deprecated - return h/(crimeData.length) - barpadding;
			}, //fill svg width with bars, then shave off padding
			transform: "translate(0," + barShiftUp + ")",
			//adjusting for the fact that RangeRoundBands shifted our bars 136px down (yet unexplained, although at least we know the culprit)
			class: "bars"
		})
		.on('mouseover', barTips.show)
      	.on('mouseout', barTips.hide);


	//Location labels
	var locLabels = svg.selectAll("text.loclabels")
		.data(crimeData,key)
		.enter()
		.append("text")
		.text(cleanLoc)
		.attr({
			x: function(d) { 
				return labelPaddingLeft; //left padding of 4  on labels
			},
			y: function(d,i) {
				return yScale(i) + labelPaddingTop;
				//return i * (h/crimeData.length) + 2;
				//Match positioning for title in bars + top padding of 2
			},
			transform: "translate(0," + textShiftUp + ")",
			//adjusting for the fact that RangeRoundBands shifted our bars 136px down (yet unexplained, although at least we know the culprit)
			class: "loclabels"


		});

	//Value labels
	var valueLabels = svg.selectAll("text.valuelabels")
		.data(crimeData,key)
		.enter()
		.append("text")
		.text(function(d) {
			return d3.format(",")(+d.murder100k);

		})
		.attr({
			//x: function(d) { return scaledWidth + 40 },
			x: scaledX,
			y: function(d,i) {
				return yScale(i) + labelPaddingTop;
			},
			transform: "translate(0," + textShiftUp + ")",
			class: "valuelabels"
		});

	
	//Calling Axis - At the bottom so it overlaps previously defined elements
	svg.append("g") 
		.attr({
			class:"xaxis",
			transform: "translate(0," + axisShiftUp + ")" //20px upward to avoid hugging bars
		})
		.call(xAxis); //making the g element (current selection) available to the xAxis function	


//Button handlers for data updates
	d3.select("button#violentcrime")
		.on("click",function() {
			updateV();
		});

	d3.select("button#rape")
		.on("click",function() {
			updateR();
		});

	d3.select("button#murder")
		.on("click",function() {
			updateM();
		});


//Update data functions - http://bit.ly/1VRjAwC

	//Murder update
	var updateM = function() {

		//sort data:http://bit.ly/1UoYccB 	
		crimeData
			.sort(function(a,b) {
			return d3.descending(+a.murder100k, +b.murder100k);
			});
		
		//Scale
		var xScale = d3.scale.linear()
			.domain([0, d3.max(crimeData,function(d) {
				return +d.murder100k;
			})])
			.range([0, w - canvasPadding.right])
			.nice();

		//Scaled width
		scaledWidth = function(d) { return xScale(+d.murder100k); };

		//Bars
		d3.selectAll('rect.bars')
			.data(crimeData,key)
			.transition()
			.delay(function(d,i) {
				return i/crimeData.length * maxDelay; //set max duration of overall delay, will make our delay scale to a change in number of chart rows, if necessary. 
			})
			.duration(barDuration)
			.ease("cubic-in-out")
			.attr({
					width: scaledWidth,
					y: function(d,i) {
						return yScale(i);
					}//necessary to re-scale for sort 
				});

		//title
		d3.select("h2#title")
			.transition()
			.duration(barDuration)
			.text("Incidents of Murder, per 100k Individuals, 2013");

		//location labels
		d3.selectAll("text.loclabels")
			.data(crimeData,key)
			.transition()
			// .delay(function(d,i) {
			//  	return i/crimeData.length * maxDelay;
			//  })
			.duration(barDuration)
			.ease("cubic-in-out")
			.text(cleanLoc)
			.attr({
			 	y: function(d,i) {
			 		return yScale(i) + labelPaddingTop;
			 	}
			});

		//value labels
		d3.selectAll("text.valuelabels")
			.data(crimeData,key)
			.transition()
			.delay(function(d,i) {
			 	return i/crimeData.length * maxDelay;
			 })
			.duration(barDuration)
			.text(function(d) {
				return d3.format(",")(+d.murder100k);
			})
			.attr({
				x: scaledX,
				y: function(d,i) {
					return yScale(i) + labelPaddingTop;
				}
			});

		//Redefine linear x axis
		var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("top")
			.ticks(5);

		//call x axis
			d3.select(".xaxis")
				.transition()
				.duration(axisDuration)
				.call(xAxis);

		//Resize
			var resize = function() {
				//Define new base dimensions
				var w = parseInt(d3.select('#barsdiv').style("width")) - margin.left - margin.right,
					h = 8000 - margin.top - margin.bototm;
				//xScale	
				xScale.range([0,w - canvasPadding.right]);
				//Canvas
				d3.select('svg').attr("width",w);
				//Bars
				svg.selectAll("rect.bars").attr("width",scaledWidth);
				//Value labels
				d3.selectAll("text.valuelabels").data(crimeData,key).attr("x", scaledX);
				//Axes
				d3.select(".xaxis").call(xAxis);
			};

			d3.select(window).on("resize",function() {
				resize();
			});

	};

	//Rape update
	var updateR = function() {

		//sort data:http://bit.ly/1UoYccB 	
		crimeData
			.sort(function(a,b) {
			return d3.descending(+a.rape100k, +b.rape100k);
			});
		
		//Scale
		var xScale = d3.scale.linear()
			.domain([0, d3.max(crimeData,function(d) {
				return +d.rape100k;
			})])
			.range([0, w - canvasPadding.right])
			.nice();

		//Scaled width
		scaledWidth = function(d) { return xScale(+d.rape100k); };

		//Bars
		d3.selectAll('rect.bars')
			.data(crimeData,key)
			.transition()
			.delay(function(d,i) {
				return i/crimeData.length * maxDelay; }) //set max duration of overall delay, will make our delay scale to a change in number of chart rows, if necessary. 
			.duration(barDuration)
			.ease("cubic-in-out")
			.attr({
					width: scaledWidth,
					y: function(d,i) {
						return yScale(i);
					}//necessary to re-scale for sort 
				});

		//title
		d3.select("h2#title")
			.transition()
			.duration(barDuration)
			.text("Incidents of Rape, per 100k Individuals, 2013");

		//location labels
		d3.selectAll("text.loclabels")
			.data(crimeData,key)
			.transition()
			// .delay(function(d,i) {
			//  	return i/crimeData.length * maxDelay;
			//  })
			.duration(barDuration)
			.ease("cubic-in-out")
			.text(cleanLoc)
			.attr({
			 	y: function(d,i) {
			 		return yScale(i) + labelPaddingTop;
			 	}
			});

		//value labels
		d3.selectAll("text.valuelabels")
			.data(crimeData,key)
			.transition()
			.delay(function(d,i) {
			 	return i/crimeData.length * maxDelay;
			 })
			.duration(barDuration)
			.text(function(d) {
				return d3.format(",")(+d.rape100k);
			})
			.attr({
				x: scaledX,
				y: function(d,i) {
					return yScale(i) + labelPaddingTop;
				}
			});

		//Redefine linear x axis
		var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("top")
			.ticks(5);

		//call x axis
			d3.select(".xaxis")
				.transition()
				.duration(axisDuration)
				.call(xAxis);

		//Resize
			var resize = function() {
				//Define new base dimensions
				var w = parseInt(d3.select('#barsdiv').style("width")) - margin.left - margin.right,
					h = 8000 - margin.top - margin.bototm;
				//xScale	
				xScale.range([0,w - canvasPadding.right]);
				//Canvas
				d3.select('svg').attr("width",w);
				//Bars
				svg.selectAll("rect.bars").attr("width",scaledWidth);
				//Value labels
				d3.selectAll("text.valuelabels").data(crimeData,key).attr("x", scaledX);
				//Axes
				d3.select(".xaxis").call(xAxis);
			};

			d3.select(window).on("resize",function() {
				resize();
			});

	};

	//Violent crime update
	var updateV = function() {

		//sort data:http://bit.ly/1UoYccB 	
		crimeData
			.sort(function(a,b) {
			return d3.descending(+a.violentcrime100k, +b.violentcrime100k);
			}); 
		
		//Scale
		var xScale = d3.scale.linear()
			.domain([0, d3.max(crimeData,function(d) {
				return +d.violentcrime100k;
			})])
			.range([0, w - canvasPadding.right])
			.nice();

		//Scaled width
		scaledWidth = function(d) { return xScale(+d.violentcrime100k); };	

		//Bars
		d3.selectAll('rect.bars')
			.data(crimeData,key)
			.transition()
			.delay(function(d,i) {
				return i/crimeData.length * maxDelay; //set max duration of overall delay, will make our delay scale to a change in number of chart rows, if necessary. 
			})
			.duration(barDuration)
			.ease("cubic-in-out")
			.attr({
					width: scaledWidth,
					y: function(d,i) {
						return yScale(i);
					}//necessary to re-scale for sort 
				});

		//title
		d3.select("h2#title")
			.transition()
			.duration(barDuration)
			.text("Incidents of Violent Crime, per 100k Individuals, 2013");

		//location labels
		d3.selectAll("text.loclabels")
			.data(crimeData,key)
			.transition()
			// .delay(function(d,i) {
			//  	return i/crimeData.length * maxDelay;
			//  })
			.duration(barDuration)
			.ease("cubic-in-out")
			.text(cleanLoc)
			.attr({
			 	y: function(d,i) {
			 		return yScale(i) + labelPaddingTop;
			 	}
			});

		//value labels
		d3.selectAll("text.valuelabels")
			.data(crimeData,key)
			.transition()
			.delay(function(d,i) {
			 	return i/crimeData.length * maxDelay;
			 })
			.duration(barDuration)
			.text(function(d) {
				return d3.format(",")(+d.violentcrime100k);
			})
			.attr({
				x: scaledX,
				y: function(d,i) {
					return yScale(i) + labelPaddingTop;
				}
			});

		//Redefine linear x axis
		var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("top")
			.ticks(5);	

		//Call x axis
			d3.select(".xaxis")
				.transition()
				.duration(axisDuration)
				.call(xAxis);

		//Resize
			var resize = function() {
				//Define new base dimensions
				var w = parseInt(d3.select('#barsdiv').style("width")) - margin.left - margin.right,
					h = 8000 - margin.top - margin.bototm;
				//xScale	
				xScale.range([0,w - canvasPadding.right]);
				//Canvas
				d3.select('svg').attr("width",w);
				//Bars
				svg.selectAll("rect.bars").attr("width",scaledWidth);
				//Value labels
				d3.selectAll("text.valuelabels").data(crimeData,key).attr("x", scaledX);
				//Axes
				d3.select(".xaxis").call(xAxis);
			};

			//Resize on update EXPERIMENT
			//resize();//.transition().duration(barDuration);

			//Resize on window adjust
			d3.select(window).on("resize",function() {
				resize();
			});
	};

//Resize - http://bit.ly/28qspCv

	var resize = function() {
		
		//Define new base dimensions
		var w = parseInt(d3.select('#barsdiv').style("width")) - margin.left - margin.right,
			h = 8000 - margin.top - margin.bototm;
		//xScale	
		xScale.range([0,w - canvasPadding.right]);
		//Canvas
		d3.select('svg').attr("width",w);
		//Bars
		svg.selectAll("rect.bars").attr("width",scaledWidth);
		//Value labels
		d3.selectAll("text.valuelabels").data(crimeData,key).attr("x", scaledX);
		//Axes
		d3.select(".xaxis").call(xAxis);
	};

	//Resize window on click
	d3.select(window).on("resize",function() {
		resize();
	});

});