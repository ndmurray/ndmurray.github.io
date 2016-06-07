//General use variables
	
	//Margin and padding
	var	margin = {top: 40, right: 40, bottom: 40, left: 10},
		w = parseInt(d3.select('#barsdiv').style('width'), 10),//Get width of containing div for responsiveness
		w = w - margin.left - margin.right,
		h = 8000 - margin.top - margin.bottom;
		
		//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563

	//Default positioning
	var textShiftUp = -134,
	    barShiftUp = -126,
	    axisShiftUp = -18;
	    barpadding = 2, //deprecated
		labelPaddingLeft = 4;
	var	labelPaddingTop = barShiftUp + 138; 

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
d3.csv("datadev/crime.csv",function(error,data) {
			
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

	//Tooltips - http://bit.ly/22HClnd
	var barTips = d3.tip()
		.attr({
			class: "d3-tip"
		})
		.offset([-10, 0])
  		.html(function(d) {
  		  return "<p>Locale:" + d.Loc + "</p>";
 		 })


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

	var rankLoc = function(d,i) {
		return i;
	}

//Set up the canvas
	var svg = d3.select("#barsdiv").append("svg")
		.attr({
			width: w + margin.left + margin.right, 
			height: h + margin.top + margin.bottom,
			id: "canvas"

			})
		.append("g") //This g element and it attributes also following bostok's margin convention. It holds all the canvas' elements.
		.attr({
			transform: "translate(" + margin.left + "," + margin.top + ")"

		})
		.call(barTips);  //must be called on canvas -  http://bit.ly/22HClnd

//Define linear x scales

	//Rape scale
	var xScaleR = d3.scale.linear()
		.domain([0, d3.max(crimeData,function(d) {
			return +d.rape100k;
		})])
		.range([0, w])
		.nice();

	//Murder scale
	var xScaleM = d3.scale.linear()
		.domain([0, d3.max(crimeData,function(d) {
			return +d.murder100k;
		})])
		.range([0, w])
		.nice();

	//Violent crime scale
	var xScaleV	= d3.scale.linear()
		.domain([0,d3.max(crimeData,function(d) {
			return +d.violentcrime100k;
		})])
		.range([0,w])
		.nice();

	//Ordinal y scale
	var yScale = d3.scale.ordinal()
		.domain(d3.range(crimeData.length))
		.rangeRoundBands([0, h],0.05);

//Axes

	//Linear x axis - rape
	var xAxisR = d3.svg.axis()
		.scale(xScaleR)
		.orient("top")
		.ticks(5);

	//Linear x axis - murder
	var xAxisM = d3.svg.axis()
		.scale(xScaleM)
		.orient("top")
		.ticks(5);

	//Linear x axis - violent crime
	var xAxisV = d3.svg.axis()
		.scale(xScaleV)
		.orient("top")
		.ticks(5);
	




//Chart Elements

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
			width: function(d) {
					return xScaleM(+d.murder100k);
			},
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
				//return margin.left + 4; 
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
			x: function(d) { 
				return xScaleM(+d.murder100k) + labelPaddingLeft;

			},
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
		.call(xAxisM); //making the g element (current selection) available to the xAxis function	

	
//Start saved div tooltip

	// svg.selectAll("rect.bars")
	// 	.on("mouseover",function(d) {
	// 		var xPosition = parseFloat(d3.select(this).attr("x")) / 2 + w / 2;
	// 		var yPosition = parseFloat(d3.select(this).attr("y")) + yScale.rangeBand() / 2;

		// 	//Position and populate on hover
		// 	d3.select("div#tooltip")
		// 		.style({
		// 			"left": xPosition + "px",
		// 			"top": yPosition + "px"
		// 		})
		// 		.select("#toolheader")
		// 		.append("text")
		// 		.text(cleanLoc.locale)
		// 		.attr({
		// 			class: "tooltext-h"
		// 		});

		// 	//Show tooltip div by removing "hidden" class
		// 	d3.select("div#tooltip")
		// 		.classed("hidden",false);

		// })
		// .on("mouseout",function() {
		// 	d3.select("div#tooltip")
		// 		.classed("hidden",true)
		// 		.selectAll("text.tooltext-h");

//End saved div tooltop

				// .remove();

 		// });



//Event Listeners for buttons

	//Sort on Click
	d3.select("button#murder")
		.on("click",function() {
			sortBarsM();
		});

	d3.select("button#rape")
		.on("click",function() {
			sortBarsR();
		});

	d3.select("button#violentcrime")
		.on("click",function() {
			sortBarsV();
		});

	//Murder button
	d3.select("button#murder")
		.on("click",function() {
			//sort data:http://bit.ly/1UoYccB 	
			crimeData.sort(function(a,b) {
				return d3.descending(+a.murder100k, +b.murder100k);
			});

			//bars
			svg.selectAll("rect.bars")
				.data(crimeData,key)
				.transition()
				 .delay(function(d,i) {
				 	return i/crimeData.length * maxDelay;
				 })
				.duration(barDuration)
				.ease("cubic-in-out")
				.attr({
					width: function(d) {
						return xScaleM(+d.murder100k);
					},
					y: function(d,i)	{
						return yScale(i);
					}, //necessary to re-scale for sort 
					fill:"red"
				});
				
			
				
			//title
			d3.select("text.title-text")
				.transition()
				.duration(barDuration)
				.each("start",function() {
					d3.select(this)
						.attr({
							"fill-opacity": 0
						});
				})
				.text("Incidents of Murder, per 100k Individuals, 2013")
				.each("end",function()	{
					d3.select(this)
						.attr({
							"fill-opacity": 1
						});
				});
				
				

			//Location labels
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

			//Value labels
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
					x: function(d) {
						return xScaleM(+d.murder100k) + labelPaddingLeft;
					},
					y: function(d,i) {
					 	return yScale(i) + labelPaddingTop;
					}
				});

			//x axis
			d3.select(".xaxis")
				.transition()
				.duration(axisDuration)
				.call(xAxisM);


		});

	
	//Rape button
	d3.select("button#rape")
		.on("click",function() {
			//sort data:http://bit.ly/1UoYccB 	
			crimeData
				.sort(function(a,b) {
				return d3.descending(+a.rape100k, +b.rape100k);
				});

			//bars
			svg.selectAll("rect.bars")
				.data(crimeData,key)
				.transition()
				.delay(function(d,i) {
					return i/crimeData.length * maxDelay; //set max duration of overall delay, will make our delay scale to a change in number of chart rows, if necessary. 
				})
				.duration(barDuration)
				.ease("cubic-in-out")
				.attr({
					width: function(d) {
						return xScaleR(+d.rape100k);
					},
					y: function(d,i) {
						return yScale(i);
					},//necessary to re-scale for sort 
					fill:"rgb(73, 121, 107)"
					//class: "rape-bars"

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
					x: function(d) {
						return xScaleR(+d.rape100k) + labelPaddingLeft;
					},
					 y: function(d,i) {
					 	return yScale(i) + labelPaddingTop;
					 }

				});

			//x axis
			d3.select(".xaxis")
				.transition()
				.duration(axisDuration)
				.call(xAxisR);

				
		});

	//Violent crime button
	d3.select("button#violentcrime")
		.on("click",function() {
			//sort data:http://bit.ly/1UoYccB 	
			crimeData
				.sort(function(a,b) {
				return d3.descending(+a.violentcrime100k, +b.violentcrime100k);
				});

			//bars
			svg.selectAll("rect.bars")
				.data(crimeData,key)
				.transition()
				.delay(function(d,i) {
					return i/crimeData.length * maxDelay; //set max duration of overall delay, will make our delay scale to a change in number of chart rows, if necessary. 
				})
				.duration(barDuration)
				.ease("cubic-in-out")
				.attr({
					width: function(d) {
						return xScaleV(+d.violentcrime100k);
					},
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
					x: function(d) {
						return xScaleV(+d.violentcrime100k) + labelPaddingLeft;
					},
					y: function(d,i) {
						return yScale(i) + labelPaddingTop;
					}
				});

			//x axis
			d3.select(".xaxis")
				.transition()
				.duration(axisDuration)
				.call(xAxisV);
		});	
	

	//Sorting functions

	var sortBarsM = function() {
		svg.selectAll("rect.bars")
			.sort(function(a,b) {
				return d3.descending(+a.murder100k,+b.murder100k);
			})
			.transition()
			.duration(barDuration)
			.attr("y", function(d,i) {
				return yScale(i);
			});
	};

	var sortBarsR = function() {
		svg.selectAll("rect.bars")
			.sort(function(a,b) {
				return d3.descending(+a.rape100k,+b.violentcrime100k);
			})
			.transition()
			.duration(barDuration)
			.attr("y", function(d,i) {
				return yScale(i);
			});
	};

	var sortBarsV = function() {
		svg.selectAll("rect.bars")
			.sort(function(a,b) {
				return d3.descending(+a.violentcrime100k,+b.violentcrime100k);
			})
			.transition()
			.duration(barDuration)
			.attr("y", function(d,i) {
				return yScale(i);
			});
	};

	//Resize with window, see http://bit.ly/1U4Ys4I
	d3.select("svg").on('resize', resize);

	function resize() {
		//Update width to new width of containing div
		w = parseInt(d3.select('#barsdiv').style('width'), 10);
		w = w - margin.left - margin.right;

		//Update x scales to fit new window size
		xScaleR.range([0,w]),
		xScaleM.range([0,w]);

		//Here we'll need to include the rest of hte elements we'll want to resize

		//Resize canvas


	}

});