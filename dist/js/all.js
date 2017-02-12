d3.csv("datadev/crime.csv",function(error,data) {

			
			if(error) {
				console.log(error)
			} else {
				console.log(data)
			};

			//General use variables

			var crimeData = data;
			//Margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
			var margin = {top: 40, right: 40, bottom: 60, left: 60};
			var w = 740 - margin.left - margin.right;
			var h = 740 - margin.left - margin.right;
			var aToR = function(a) {
				return Math.sqrt(a/3.14)
			}; //converts value we want to use as area to radius. It was defined by hubris, and by mistake, notice it's never used.
			var xAxisPadding = 30;
			var yAxisPadding = -30;
			//Object constancy
			var key = function(d) {
				return d.key;
			};

			//Canvas

			var svg = d3.select("body").append("svg")
				.attr({
					height: h + margin.top + margin.bottom,
					width: w + margin.left + margin.right
				})
			.append("g") //see http://bl.ocks.org/mbostock/3019563
				.attr({
					"transform": "translate(" + margin.left + "," + margin.top + ")"
				});

			//Clipping path

			var clippingPath = svg.append("clipPath")
				.attr({
					id: "chart-area"
				})
				.append("rect")
					.attr({
						x: 1 - xAxisPadding,
						y: 1 - yAxisPadding, //1 - axis padding to cut of elements not at axis, but 1px before
						width: w,
						height: h
					});
			
			//Scales

			var xScale = d3.scale.linear()
				.domain([0,d3.max(crimeData,function(d) {
					return +d.rape100k;
				})])
				.range([0, w]);
				//min of 20 to stick with our 20px left margin, same goes for right margin (w - 20)

			var yScale = d3.scale.linear()
				.domain([0,d3.max(crimeData,function(d) {
					return +d.murder100k;
				})])
				.range([h, 0])
				//Padding applied similar to xScale

			var rScale = d3.scale.linear()
				.domain([d3.min(crimeData,function(d) {
							return +d.Pop;
					  }),d3.max(crimeData,function(d) {
					  		return +d.Pop;
					  })])
				.range([5,50]);//arbitrary output range		

			//Define Axes

			var xAxis = d3.svg.axis()	
				.scale(xScale)
				.orient("bottom")
				.ticks(5);

			var yAxis = d3.svg.axis()
				.scale(yScale)
				.orient("left")
				.ticks(5);	

			//Bubbles

			var bubbles = svg.append("g")
				.attr({
					id: "bubbles-group",
					"clip-path": "url(#chart-area)"
				})
					.selectAll("circle")
					.data(crimeData,key)
					.enter()
					.append("circle")
					.attr({
						cx: function(d) {
							return xScale(+d.rape100k);
						},
						cy: function(d) {
							return yScale(+d.murder100k);
						},
						r: function(d) {
							return rScale(+d.Pop);
						},
						class: "bubbles",
						"fill": "rgb(179,120,211)"

					});

			//Call x Axis

			svg.append("g")
				.attr({
					class: "xaxis",
					transform: "translate(0," + (h + xAxisPadding) + ")" //offset padding from the minimum y posiiton of bubble
				})
				.call(xAxis);

			//Call y Axis

			svg.append("g")
				.attr({
					class: "yaxis",
					transform: "translate(" + yAxisPadding + ",0)" //offset 26 px from minimum x position of bubble
				})
				.call(yAxis);





		});
//Combined Line and Donut Chart. Implemented in an interesting way; may not be the industry standard:
//1. We write the line chart script
//2. Within the data 'holder' function, we write the donut script, with it's own data 'holder function'
//3. Within the donut data 'holder' function we define the update on click event. Because it's defined in this donut holder function 
//nested within the line holder function, it has access to both sets of data dependent variables, for line and donut
//4. However, this confuses the definition of d. To make it work, we set up a NEW line data holder function within the on click event listener
//Notice in the listener arcValue and lineValue are the same (because data fields have the same name) although lineValue and arcValue are different, because they reference
//columns in different dataset, even though these columns have the same name

//BEGIN LINE based on Bostock's example - https://bl.ocks.org/mbostock/3884955

//General use variables
	
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	lineMargin = {top: 60, right: 40, bottom: 70, left: 80},
		lineW = parseInt(d3.select('#line-div').style('width'), 10),//Get width of containing div for responsiveness
		lineW = lineW - lineMargin.left - lineMargin.right,
		lineH = parseInt(d3.select('#line-div').style('height'),10),
		lineH = lineH - lineMargin.top - lineMargin.bottom;

	//Transitions
	var lineDuration = 600;
	var tipDuration = 200;

	//Dates

	//Parse date values functions
	//var parseDate = d3.timeParse("%Y");
	var parseDate = d3.timeParse("%d-%b-%y");
	var formatTimeWeek = d3.timeFormat("%d-%b-%y");
	var formatTimeMonth = d3.timeFormat("%b");
	var formatTimeYear = d3.timeFormat("%Y");

	//X range
	var xScale = d3.scaleTime().range([0,lineW]);
	//we're including the .scaleTime method to make sure D3 handles the values as date/time entities.

	//Y range
	var yScale = d3.scaleLinear().range([lineH, 0]);

	//Size
	var dotRadius = "0.25em"

	//Positioning

	//Dynamic text
	var dataTitle = "Total Revenue ($US)";

	
//Begin data function 
d3.csv("/8step.io/production_data/ctc_data/ctc_lines.csv",
//parsing data as an argument within the .csv method https://bl.ocks.org/mbostock/3883245
function(d) {
		d.date = parseDate(d.date);
		d.division_clean = d.division_clean;
		d.avg_revenue = +d.avg_revenue;
		d.projects_share = +d.projects_share;
		d.projects_total = +d.projects_total;
		d.revenue_share = +d.revenue_share;
		d.revenue_total = +d.revenue_total;
		return d;
	},function(error,data) {
			
	if(error) {
		console.log(error);
	} else {
		console.log(data);
	}


//Key dataset-dependent variables

	//Data functions
	var timeData = data;
	var ushData = data.filter(function(d) { return d.division_clean == "USH"; });
	var sepData = data.filter(function(d) { return d.division_clean == "SEP"; });
	var ihdData = data.filter(function(d) { return d.division_clean == "IHD"; });
	var iegData = data.filter(function(d) { return d.division_clean == "IEG"; });
	var enrData = data.filter(function(d) { return d.division_clean == "ENR"; });

	var lineData = function(d) { return d.revenue_total; };

//Define linear scales - because it's a line chart, we set ranges first, then domains

	//X domain
	xScale.domain(d3.extent(timeData, function(d) { return d.date; }));

	//Y domain
	yScale.domain(d3.extent(timeData, function(d) { return lineData(d); })).nice();

//Define Axes
	
	var xAxis = d3.axisBottom().scale(xScale).tickFormat(formatTimeMonth);

	var yAxis = d3.axisLeft().scale(yScale);

//Define the lines
	//v4 curves defined - https://bl.ocks.org/d3noob/ced1b9b18bd8192d2c898884033b5529
	var line = d3.line()
	    .curve(d3.curveLinear)
	    .x(function(d) { return xScale(d.date); })
	    .y(function(d) { return yScale(lineData(d)); });

//Chart title
	var titleText = d3.select("#chart-title").append("text")
		.attr("class","title-text")
		.text(dataTitle + " by Division, CTC, FY17");

//Set up the canvas
	var svg = d3.select("#line-div")
		.append("svg")
		.attr("width", lineW + lineMargin.left + lineMargin.right)
		.attr("height",lineH + lineMargin.top + lineMargin.bottom)
		.attr("id","line-canvas")
		.append("g") //This g element and it attributes also following bstok's margin convention. It holds all the canvas' elements.
			.attr("transform", "translate(" + lineMargin.left + "," + lineMargin.top + ")");

//Default chart elements

	//Division Paths
	var pathUSH = svg.append("path")
		.datum(ushData)
		.attr("d", line)
		.attr("class", "path")
		.attr("id","ush-path");

	var nodesUSH = svg.selectAll("circle.ush-nodes")
		.data(ushData)
		.enter()
		.append("circle")
			.attr("class","nodes ush-nodes")
			.attr("r",dotRadius)
			.attr("cx", function(d) { return xScale(d.date); } )
			.attr("cy", function(d) { return yScale(lineData(d)); });

	var pathSEP = svg.append("path")
		.datum(sepData)
		.attr("d", line)
		.attr("class", "path")
		.attr("id","sep-path");

	var nodesSEP = svg.selectAll("circle.sep-nodes")
		.data(sepData)
		.enter()
		.append("circle")
			.attr("class","nodes sep-nodes")
			.attr("r",dotRadius)
			.attr("cx", function(d) { return xScale(d.date); } )
			.attr("cy", function(d) { return yScale(lineData(d)); });

	var pathIHD = svg.append("path")
		.datum(ihdData)
		.attr("d", line)
		.attr("class", "path")
		.attr("id","ihd-path");

	var nodesIHD = svg.selectAll("circle.ihd-nodes")
		.data(ihdData)
		.enter()
		.append("circle")
			.attr("class","nodes ihd-nodes")
			.attr("r",dotRadius)
			.attr("cx", function(d) { return xScale(d.date); } )
			.attr("cy", function(d) { return yScale(lineData(d)); });

	var pathIEG = svg.append("path")
		.datum(iegData)
		.attr("d", line)
		.attr("class", "path")
		.attr("id","ieg-path");

	var nodesIEG = svg.selectAll("circle.ieg-nodes")
		.data(iegData)
		.enter()
		.append("circle")
			.attr("class","nodes ieg-nodes")
			.attr("r",dotRadius)
			.attr("cx", function(d) { return xScale(d.date); } )
			.attr("cy", function(d) { return yScale(lineData(d)); });

	var pathENR = svg.append("path")
		.datum(enrData)
		.attr("d", line)
		.attr("class", "path")
		.attr("id","enr-path");

	var nodesENR = svg.selectAll("circle.enr-nodes")
		.data(enrData)
		.enter()
		.append("circle")
			.attr("class","nodes enr-nodes")
			.attr("r",dotRadius)
			.attr("cx", function(d) { return xScale(d.date); } )
			.attr("cy", function(d) { return yScale(lineData(d)); });

//Define line tooltips

	var lineTip = d3.select("#line-div").append("div")
		.attr("id", "line-tip")
		.style("display","none");

//Call tooltips on line hover
	d3.selectAll(".nodes").on("mouseover",function(d){
		lineTip.transition()
			.duration(tipDuration)
			.style("display","inline-block");
		lineTip.html(
			"<p><span class='line-val-display'>" + d3.format(",.2f")(lineData(d)) + "</span><br /><span class='time-display'>" + formatTimeMonth(d.date) + " " + formatTimeYear(d.date) + "</span></p>")
			.style("left", d3.select(this).attr("cx"))
			.style("top", d3.select(this).attr("cy"));
	})
	.on("mouseout",function() {
		lineTip.transition()
			.duration(tipDuration)
			.style("display","none");
	});


//Call the axes

	//X axis group

	svg.append("g")
		.attr("class","axis x-axis")
		.attr("transform","translate(0," + lineH + ")")
		.call(xAxis);

	d3.selectAll(".x-axis text")
		.attr("transform","rotate(-90)")
		.attr("text-anchor","end");

	//Y axis group
	svg.append("g")
		.attr("class","axis y-axis")
		.call(yAxis)
	
	//Get bounding box of y label text
	var yLabelBox = d3.select(".y-axis text").node().getBBox();

	//Define y label shift
	var yLabelShift = yLabelBox.x - 50;

	//Y axis label
	var yLabel = svg.append("text")
		.text(dataTitle)
			.attr("fill","gray")
			.attr("text-anchor","middle")
			.attr("transform","translate(" + yLabelShift + "," + (lineH/2) + "), rotate(-90)");

//END LINE

//BEGIN DONUT
	//General use variables
		
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	donutMargin = {top: 0, right: 30, bottom: 0, left: 30},
		w = parseInt(d3.select('#donut-div').style('width'), 10),//Get width of containing div for responsiveness
		w = w - donutMargin.left - donutMargin.right,
		h = parseInt(d3.select('#donut-div').style('height'),10),
		h = h - donutMargin.top - donutMargin.bottom,
		//Radius for donut
		outerRadius = (w/2 * 0.88), /*88% of the way to from center to edge*/
		innerRadius = (w/2 * 0.64),
		labelRadius = (w/2 * 0.98);
		//Transitions
		var tipDuration = 200;
		var donutDuration = 600;

	//Begin data function 
	d3.csv("/8step.io/production_data/ctc_data/divisions.csv",function(error,data) {
				
		if(error) {
			console.log(error);
		} else {
			console.log(data);
		}


	//Key dataset-dependent variables

		//Data and key functions
		var donutData = data;
		// var	key = function(d,i) {
		// 	return d.year; //Binding row ID to year
		// };


	//Holder variable for data selection
	var arcData = function(d) { return +d.revenue_total; };
		
	//Set up the canvas
		var svg = d3.select("#donut-div")
			.append("svg")
			.attr("width", w + donutMargin.left + donutMargin.right)
			.attr("height",h + donutMargin.top + donutMargin.bottom)
			.attr("id","donut-canvas")
			.append("g") //This g element and it attributes also following bstok's margin convention. It holds all the canvas' elements.
				.attr("transform", "translate(" + ((w / 2) + donutMargin.left)  + "," + ((h / 2) + donutMargin.top) + ")");

		//Oridinal color scheme
		var color = d3.scaleOrdinal()
		    .range(["#FBAF43", "#198F90", "#9E004D", "#F1594E", "#9BD19D"]);
			

		//Arc and pie functions
		var arcDef = d3.arc()
		    .outerRadius(outerRadius)
		    .innerRadius(innerRadius);

		var arcDefLabel = d3.arc()
			.outerRadius(labelRadius)
			.innerRadius(outerRadius);

		var pie = d3.pie()
		    .sort(null)
		    .value(function(d) { return arcData(d); });

		//Draw each arc group that holds each arc path
		var arc = svg.selectAll("g.arc")
	      	.data(pie(donutData))
	    	.enter()
	    	.append("g")
	      	.attr("class", "arc");

	     //Fill arc groups with arc path
	    var arcPath = arc.append("path")
	      .attr("d", arcDef)
	      .attr("class","arc-path")
	      .style("fill", function(d) { return color(d.data.division_clean); })
	      .each(function(d) { this._current = d; }); // store the initial angles, for transition
		
		//Donut labels
		var donutLabels = arc.append("text")
		//Native 8step method: Plae labels on centroid of "arcDefLabel" the definintion of a larger invisible set of arts
			.attr("transform", function(d) { return "translate(" + arcDefLabel.centroid(d) + ")"; })
	
	      .attr("fill","white")
	      .attr("class", "arc-label")
	      //this puts labels at uniform distance away from donut per the stack overflow link above, although I don't quite understand how it works
	      .attr("text-anchor", function (d) {
	      			return (d.endAngle + d.startAngle)/2 > Math.PI ?
	      					"end" : "start";
	      })
	      .text(function(d) { return d.data.division_clean; });

		//Tooltips - http://bl.ocks.org/d3noob/a22c42db65eb00d4e369

		//Define Donut tooltip
		var donutTip = d3.select("#donut-div").append("div")	
		    .attr("class", "tooltip donut-tip")
		    //Position in center of donut
		    .style("position", "absolute")
		    .style("left", ((w + donutMargin.left + donutMargin.right)/2))
				//added margins because we're appending to div, not to the svg
		    .style("top", ((h / 2) + donutMargin.top))
		    //Anchor in middle, rather than top left
		    .style("opacity", 0);


		//Show tooltips	
		arcPath.on("mouseover",function(d) {
				donutTip.transition()
					.duration(tipDuration)
					.style("opacity",1);

				donutTip.html("<div class='title-display'>" + d.data.division_display + ", FY17</div><br /><div class = data-display>Total Projects:<strong> " + d.data.projects_total +"</strong><br />Total Revenue: <strong>$" + d3.format(',.2f')(d.data.revenue_total) + "</strong><br />Avg Revenue/Project:<strong> $" + d3.format(',.2f')(d.data.avg_revenue) + "</strong></div>") //the .data bit keeps you from having to wrap the whole thing in a function.
			})
			.on("mouseout",function(d) {
				donutTip.transition()
					.duration(tipDuration)
					.style("opacity",0);
			});



//Update lines and donut data - 
	d3.selectAll(".m-choice").on("click", function() {

	
	//Lines
		//Update line (and donut) data variable
		var lineValue = d3.select(this).attr('value');
		var arcValue = lineValue;
		var lineData = function(d) { return eval(lineValue); };


	//Display values
	switch (lineValue) {
			case "d.projects_total":
				dataTitle = "Total Projects";
				break;
			case "d.revenue_total":
				dataTitle = "Total Revenue ($US)";
				break;
			case "d.avg_revenue":
				dataTitle = "Avg. Revenue / Project ($US)";
				break;
		}

	//Chart Title
	titleText.text(dataTitle + " by Division, CTC, FY17");


	d3.csv("/8step.io/production_data/ctc_data/ctc_lines.csv",
		//parsing data as an argument within the .csv method https://bl.ocks.org/mbostock/3883245
		function(d) {
				d.date = parseDate(d.date);
				d.division_clean = d.division_clean;
				d.avg_revenue = +d.avg_revenue;
				d.projects_share = +d.projects_share;
				d.projects_total = +d.projects_total;
				d.revenue_share = +d.revenue_share;
				d.revenue_total = +d.revenue_total;
				return d;
			},function(error,data) {
					
			if(error) {
				console.log(error);
			} else {
				// console.log(data);
			}


		//redefine Y range
		var yScale = d3.scaleLinear().range([lineH, 0]);

		//Update yScale domain
		yScale.domain(d3.extent(timeData, function(d) { return lineData(d); })).nice();

		//Redefine line y attribute
		var line = d3.line()
			.x(function(d) { return xScale(d.date); })
	    	.y(function(d) { return yScale(lineData(d)); });

	    //Recall tooltip values
	    d3.selectAll(".nodes").on("mouseover",function(d){
		lineTip.transition()
			.duration(tipDuration)
			.style("display","inline-block");
		lineTip.html(
			"<p><span class='line-val-display'>" + d3.format(",.2f")(lineData(d)) + "</span><br /><span class='time-display'>" + formatTimeMonth(d.date) + " " + formatTimeYear(d.date) + "</span></p>")
			.style("left", d3.select(this).attr("cx"))
			.style("top", d3.select(this).attr("cy"));
		})
		.on("mouseout",function() {
			lineTip.transition()
				.duration(tipDuration)
				.style("display","none");
		});

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

		//Update Axes - redefine
		var yAxis = d3.axisLeft().scale(yScale);

		//Update Axes - call
		d3.select(".y-axis")
			.transition()
			.duration(lineDuration)
			.call(yAxis);

		//Axes labels
		
		//Get bounding box of y label text
		var yLabelBox = d3.select(".y-axis text").node().getBBox();

		//Update text
		yLabel.text(dataTitle)
			.transition()
			.duration(lineDuration)
			.attr("transform","translate(" + yLabelShift + "," + (lineH/2) + "), rotate(-90)");

	});
	//Update Donut
		
		//Update donut data variable
	//	var arcValue = d3.select(this).attr('value');
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



	});


//END DONUT

//END LINE DATA WRAPPER
});
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


//BEGIN DONUT

//General use variables
	
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	donutMargin = {top: 10, right: 60, bottom: 20, left: 60},
		w = parseInt(d3.select('#donut-div').style('width'), 10),//Get width of containing div for responsiveness
		w = w - donutMargin.left - donutMargin.right,
		h = parseInt(d3.select('#donut-div').style('height'),10),
		h = h - donutMargin.top - donutMargin.bottom,
		//Radius for donut
		radius = Math.min(w, h) / 2,
		labelRadius = w/2 + 8;

		//Transitions
		var tipDuration = 200;
		var donutDuration = 600;

//Begin data function 
d3.csv("/8step.io/production_data/ctc_data/divisions.csv",function(error,data) {
			
	if(error) {
		console.log(error);
	} else {
		console.log(data);
	}


//Key dataset-dependent variables

	//Data and key functions
	var donutData = data;
	// var	key = function(d,i) {
	// 	return d.year; //Binding row ID to year
	// };


//Holder variable for data selection
var arcData = function(d) { return +d.avg_revenue; };
	
//Set up the canvas
	var svg = d3.select("#donut-div")
		.append("svg")
		.attr("width", w + donutMargin.left + donutMargin.right)
		.attr("height",h + donutMargin.top + donutMargin.bottom)
		.attr("id","canvas")
		.append("g") //This g element and it attributes also following bstok's margin convention. It holds all the canvas' elements.
			.attr("transform", "translate(" + ((w / 2) + donutMargin.left)  + "," + ((h / 2) + donutMargin.top) + ")");

//Tooltips - http://bl.ocks.org/d3noob/a22c42db65eb00d4e369

	//Donut tooltip
	var donutTip = d3.select("body").append("div")	
    .attr("class", "tooltip donut-tip")				
    .style("opacity", 0);


	//Oridinal color scheme
	var color = d3.scaleOrdinal()
	    .range(["#FBAF43", "#198F90", "#9E004D", "#F1594E", "#9BD19D"]);
		

	//Arc and pie functions
	var arcDef = d3.arc()
	    .outerRadius(radius - 10)
	    .innerRadius(radius - 80);

	var arcDefLabel = d3.arc()
		.outerRadius(radius + 40)
		.innerRadius(radius);

	var pie = d3.pie()
	    .sort(null)
	    .value(function(d) { return arcData(d); });

	//Draw arc group that holds the arc path
	var arc = svg.selectAll(".arc")
      	.data(pie(donutData))
    	.enter()
    	.append("g")
      	.attr("class", "arc");

     //Fill arc with path?
    var arcPath = arc.append("path")
      .attr("d", arcDef)
      .attr("class","arc-path")
      .style("fill", function(d) { return color(d.data.division_clean); })
      .each(function(d) { this._current = d; }); // store the initial angles, for transition
	
	//Pie labels
	var donutLabels = arc.append("text")
	//Native 8step method: Plae labels on centroid of "arcDefLabel" the definintion of a larger invisible set of arts
		.attr("transform", function(d) { return "translate(" + arcDefLabel.centroid(d) + ")"; })
	  //DEPRECATED - labels on outside of pie - http://stackoverflow.com/questions/8053424/label-outside-arc-pie-chart-d3-js
      // .attr("transform", function(d) { 
      // 		var c = arcDef.centroid(d),
      // 			x = c[0], //centriod is array of x and y
      // 			y = c[1],
      // 			//pythagoras for hypotenuse
      // 			h = Math.sqrt(x*x + y*y);
      // 		return "translate(" + (x/h * labelRadius) + "," + (y/h * labelRadius) + ")"; })
      .attr("fill","white")
      .attr("class", "arc-label")
      //this puts labels at uniform distance away from donut per the stack overflow link above, although I don't quite understand how it works
      .attr("text-anchor", function (d) {
      			return (d.endAngle + d.startAngle)/2 > Math.PI ?
      					"end" : "start";
      })
      .text(function(d) { return d.data.division_clean; });


	//Show tooltips	

	arcPath.on("mouseover",function(d) {
			donutTip.transition()
				.duration(tipDuration)
				.style("opacity",1);

			donutTip.html("<div class='title-display'>" + d.data.division_display + ", FY17</div><br /><div class = data-display>Total Projects: " + d.data.projects +"<br />Total Revenue: $" + d3.format(',')(+d.data.revenue) +  "</div>")
				.style("left", "18em") 
				.style("top", "2em");
		})
		.on("mouseout",function(d) {
			donutTip.transition()
				.duration(tipDuration)
				.style("opacity",0);
		});

 //Update donut!
	d3.selectAll(".m-choice").on("click",function() {

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

});



//General use variables
	
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	margin = {top: 10, right: 20, bottom: 20, left: 80},
		w = parseInt(d3.select('#line-div').style('width'), 10),//Get width of containing div for responsiveness
		w = w - margin.left - margin.right,
		h = parseInt(d3.select('#line-div').style('height'),10),
		h = h - margin.top - margin.bottom;


	//Parse date values function
	var parseDate = d3.timeParse("%Y");
	var formatTime = d3.timeFormat("%Y");

	//X range
	var xScale = d3.scaleTime().range([0,w]);
	//we're including the .time method to make sure D3 handles the values as date/time entities.

	//Y range
	var yScale = d3.scaleLinear().range([h, 0]);

	//Positioning
	var yLabelShift = margin.left/2 - 10;

	//Transitions
	var tipDuration = 100;

//Begin data function 
d3.csv("/8step.io/production_data/energy_data/solar.csv",
//parsing data as an argument within the .csv method https://bl.ocks.org/mbostock/3883245
function(d) {
		d.year = parseDate(d.year);
		d.solar_price = +d.solar_price;
		return d;
	}
,function(error,data) {
			
	if(error) {
		console.log(error);
	} else {
		console.log(data);
	}


//Key dataset-dependent variables

	//Data and key functions
	var solarData = data;
	// var	key = function(d,i) {
	// 	return d.year; //Binding row ID to year
	// };


//Define linear scales - because it's a line chart, we set ranges first, then domains

	//X domain
	xScale.domain(d3.extent(solarData, function(d) { return d.year; }));

	//Y domain
	yScale.domain(d3.extent(solarData, function(d) { return d.solar_price; })).nice();

//Define Axes
	
	var xAxis = d3.axisBottom().scale(xScale);

	var yAxis = d3.axisLeft().scale(yScale);

//Define the data line (adjust data to the desired coordinates)
//Ultimately this will inform how our path gets drawn

	var priceLine = d3.line()
		.x(function(d) { return xScale(d.year); })
		.y(function(d) { return yScale(d.solar_price); });


//Set up the canvas
	var svg = d3.select("#line-div")
		.append("svg")
		.attr("width", w + margin.left + margin.right)
		.attr("height",h + margin.top + margin.bottom)
		.attr("id","canvas")
		.append("g") //This g element and it attributes also following bstok's margin convention. It holds all the canvas' elements.
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Tooltips - http://bl.ocks.org/d3noob/a22c42db65eb00d4e369

	//Price tooltip
	var priceTip = d3.select("body").append("div")	
    .attr("class", "tooltip price-tip")				
    .style("opacity", 0);


//Default chart elements

	//Path
	var pricePath = svg.append("path")
		.datum(solarData)
		.attr("d", priceLine)
		.attr("class","line");

	//Nodes
	var priceNodes = svg.selectAll("circle")
		.data(solarData)
		.enter()
		.append("circle")
			.attr("class","nodes price-nodes")
			.attr("r","0.15em")
			.attr("cx", function(d) { return xScale(d.year); } )
			.attr("cy", function(d) { return yScale(d.solar_price); } );
	
	//Show tooltips	

	priceNodes.on("mouseover",function(d) {
			priceTip.transition()
				.duration(tipDuration)
				.style("opacity",0.8);
			priceTip.html("<span class='value-display'>$" + d3.format('.3n')(d.solar_price) + "</span><br /><span class = date-display>" + formatTime(d.year) + "</span>")
				.style("left", d3.select(this).attr("cx") + "px") //positioned based on mouse, not on dot
				.style("top", d3.select(this).attr("cy") + "px");
		})
		.on("mouseout",function(d) {
			priceTip.transition()
				.duration(tipDuration)
				.style("opacity",0);
		});

//Call the axes

	//X axis group

	svg.append("g")
		.attr("class","axis x-axis")
		.attr("transform","translate(0," + h + ")")
		.call(xAxis);

	//Y axis group
	svg.append("g")
		.attr("class","axis y-axis")
		.call(yAxis)
		.append("text")
		.text("Price, US$/Watt")
			.attr("fill","gray")
			.attr("transform","translate(" + yLabelShift + "," + (h/2 - margin.bottom - margin.top) + "), rotate(-90)");


});

//General use variables
	
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	margin = {top: 100, right: 10, bottom: 10, left: 80},
		w = parseInt(d3.select('#map-div').style('width'), 10),//Get width of containing div for responsiveness
		w = w - margin.left - margin.right,
		h = parseInt(d3.select('#map-div').style('height'),10),
		h = h - margin.top - margin.bottom;


	//Parse date values function
	var parseDate = d3.timeParse("%Y");
	var formatTime = d3.timeFormat("%Y");

//Mapping functions

//Boundaries and data maps elements

	//Draw the canvas
	var svg = d3.select("#map-div").append("svg")
		.attr("width", w + margin.left + margin.right)
		.attr("height", h + margin.left + margin.right)
		.attr("id","map-canvas")
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Load geographic and descriptive data

	d3.queue()
		.defer(d3.json,"https://d3js.org/us-10m.v1.json")
		.defer(d3.csv,"/8step.io/production_data/employment_data/county_8.16.csv")
		//.defer(d3.csv,"/8step.io/production_data/employment_data/county_8.16.csv", function(d) { unemployment.set(d.id, +d.rate) })
		.await(ready);

	//Map boundary path
	var mapPath = d3.geoPath();

//Map data and its dependent elements
function ready(error, usa, data) {
	
	if (error) { console.log(error); }
	else { console.log(usa) }

	//Mapping array we'll use to assign data to counties
	//From example: https://bl.ocks.org/mbostock/3306362
	var mapObject = {};
	var mapData = function(d) { +d.rate; };
	//Populate that array with your target set of values
	data.forEach(function(d) {mapObject[d.id] = +d.med_inc;});

	//Color scale
	var cScale = d3.scaleQuantile()
		//.domain([d3.min(function(d) { +d.rate; }),d3.max(function(d) { +d.rate} )])
		.domain(d3.values(mapObject))
		//.domain( function(d) { unemployment.set(d.id, +d.rate).values(); })
		.range(d3.schemeGnBu[9]);

	svg.append("g")
			.attr("class","county-group")
		.selectAll("path")
		//Taken from the d3 topojson library - see example: https://bl.ocks.org/mbostock/4060606
		//Make sure the topojson reference is in your html file
		//from what I can tell topojson.feature() lets us specify
		//dataset (usa), then the object properties we want to draw, aka usa.objects.counties
		//later, topojosn.mesh() will let us draw state buondaries based on county boundaries
		.data(topojson.feature(usa, usa.objects.counties).features)
		.enter()
		.append("path")
		.attr("class","counties")
		.attr("d",mapPath);

	d3.selectAll("path")
	.attr("fill", function(d) { return cScale(mapObject[d.id]); });


	//Map legend, based on Susie Lu's legend libary: http://d3-legend.susielu.com
	svg.append("g")
		.attr("class","legendQuant")
		.attr("transform","translate("+ 20 +"," + (-margin.top + 24) + ")")

	var legend = d3.legendColor()
		.labelFormat(d3.format('.4s'))
		.shapeWidth(20)
		.shapePadding(40)
		.useClass(false)
		.orient('horizontal')
		.title("Median Household Income")
		.titleWidth(200)
		.scale(cScale);

	svg.select(".legendQuant")
		.call(legend);


	//Update map
	d3.select("#switch").on("click",function() {

		//Update target data
		var mapData = d3.select(this).attr('value');
		//Populate that array with your target set of values
		data.forEach(function(d) {mapObject[d.id] = eval(mapData);});

		//Update color scale
		cScale.domain(d3.values(mapObject));

		//update fill color
		d3.selectAll("path")
		.transition()
		.duration(1000)
		.attr("fill", function(d) { return cScale(mapObject[d.id]); });

	});

};	

//Note on data:

//rate: Unemployment rate by county as of August 2016, source, BLS
//edu: % of Adults without a hs diploma, 2015 source USDA
//med_inc: median household income, best estimate, USDA, 2015


//General use variables
	
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	margin = {top: 80, right: 140, bottom: 40, left: 60},
		w = parseInt(d3.select('#scatter-div').style('width'), 10),//Get width of containing div for responsiveness
		w = w - margin.left - margin.right,
		h = parseInt(d3.select('#scatter-div').style('height'),10),
		h = h - margin.top - margin.bottom;

	//Deprecated, margin works instead - Padding between output range and edge of canvas
	var canvasPadding = {top: 10, right: 10, bottom: 10, left:60};
		
	//Default positioning of chart elements
	var textShift = 0,
	    dotsShiftX = 0,
	    dotsShiftY = 0, 
	    xaxisShiftX = 60,
	    yaxisShiftX = 60,
	    xaxisShiftY = -60,
	    yaxisShiftY = 0;

	//Positioning of hover information
	var infoTop = 115,
		infoLeft = w + margin.left,
		infoWidth = 12 + "em",
		infoHeight = 24 + "em"; 

	//Transitions
	// var maxDelay = 10000,
	//     barDuration 800,
	//     axisDuration = 800,
	//     defaultFade = 50,
	//     hoverDuration = 200;



//Begin data function 
d3.csv("/8step.io/production_data/world_data/datadev/world.csv",function(error,data) {
			
	if(error) {
		console.log(error);
	} else {
		console.log(data);
	}


//Key dataset-dependent variables

	//Data and key functions
	var worldData = data;
	var	key = function(d,i) {
		//return i; //Simply i to remove bar-sorting on transition
		return d.country; //Binding row ID to country name
	};

	//Variables for cx, cy, and r data fields
	
	var dataX = function(d) { return +d.polistab; };
	//var dataX = function(d) { return 100 - +d.press; };
	//var dataX = function(d) { return 1 - +d.gini/100; };
	var dataY = function(d) { return 100 - +d.press; };
	//var dataY = function(d) { return 100 - +d.press; };
	var dataR = function(d) { return +d.gdphead; };
	console.log(dataX.toString());
	//Variable display names

	var titleX = "Political Stabtility";
	var titleY = "Press Freedom";
	var titleR = "GDP per Capita";

//Chart title

	var titleText = d3.select("h2#chart-title").append("text")
		.attr("class", "title-text")
		.text(titleX + " vs. " + titleY);

//Tooltips - http://bit.ly/22HClnd
	var dotTips = d3.tip()
		.attr("class", "d3-tip")
		.style({top: infoTop, left: infoLeft,
				width: infoWidth, height: infoHeight})
		//size and positioning values in .style not .attr bc tooltip is a div, not svg.
		.direction('e')
  		.html(function(d) {
  		  return "<p id='tiphead'>" + d.country  + "</p><p class='tip-subhead'>Income Group:</p><p class='tip-body'>" + (d.ig) + "</p>"
  		   + "<p class='tip-subhead'>Region:</p><p class='tip-body'>" + (d.region) + "</p>";
 		 });


//Set up the canvas
	var svg = d3.select("#scatter-div")
		.append("svg")
		.attr({
			width: w + margin.left + margin.right, 
			height: h + margin.top + margin.bottom,
			//viewBox: "0 0 " + 380/*(w + margin.left + margin.right)*/ + " " + 8000/* (h + margin.top + margin.bottom)*/,
			//preserveAspectRatio: "xMinYMin meet",
			id: "canvas"
			})
		.append("g") //This g element and it attributes also following bstok's margin convention. It holds all the canvas' elements.
		.attr({
			transform: "translate(" + margin.left + "," + margin.top + ")"
		});

//Define linear scales

	//X scale
	var xScale = d3.scale.linear()
		.domain([d3.min(worldData,function(d) { return dataX(d); }), d3.max(worldData,function(d) { return dataX(d); })])
		//Using min as min values in our data in some cases are negative
		.range([xaxisShiftX, w])
		.nice();

	//Y scale
	var yScale = d3.scale.linear()
		.domain([d3.max(worldData,function(d) { return dataY(d); }),d3.min(worldData,function(d) { return dataY(d); })])
		.range([0, h + xaxisShiftY])
		.nice();

	//Radius scale
	var rScale = d3.scale.linear()
		.domain([0, d3.max(worldData,function(d) { return dataR(d); })])
		.range([4, 40])
		.nice();

//Define axes

	//X axis
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

	//Y axis
	var yAxis = d3.svg.axis().scale(yScale).orient("left");


//Guide lines from: http://bit.ly/29FRNP1
	var guideLines = function(d) { 

		//horizontal
		svg.append("g")
			.classed("guide",true)
			.append("line")
				.attr("y1",d3.select(".a-dot").attr("cy"))
				.attr("y2",d3.select(".a-dot").attr("cy"))
				.attr("x1",yaxisShiftX)
				.attr("x2",d3.select(".a-dot").attr("cx"))
				.attr("stroke",d3.select(".a-dot").attr("fill"));

		//vertical
		svg.append("g")
			.classed("guide",true)
			.append("line")
				.attr("y1", h + xaxisShiftY)
				.attr("y2",d3.select(".a-dot").attr("cy"))
				.attr("x1",d3.select(".a-dot").attr("cx"))
				.attr("x2",d3.select(".a-dot").attr("cx"))
				.attr("stroke",d3.select(".a-dot").attr("fill"));

	};


//Mouseover events

	var mouseOn = function() {
		d3.select(this)
			.attr("opacity",1.0)
			.classed("a-dot",true)
			.classed("dots",false);

		guideLines();
	
		d3.selectAll("circle.dots").attr("opacity", 0.15);

	};
	
	var mouseOff = function() {
		d3.select(this)
			.classed("a-dot",false)
			.classed("dots",true);

		d3.selectAll(".guide")
			.remove();
			

		d3.selectAll("circle.dots").attr("opacity", 0.85);
	};

//Default chart elements

	//Dots	
	var dotsGroup = svg.append("g")
		.attr({
			id: "dots-group"
		});

	var dotsFilter = dotsGroup.append("defs").append("filter")
			.attr({
				id: "dots-filter",
				x: 0,
				y: 0,
				width: "200%",
				height: "200%"
			});

	var shadowOffset = dotsFilter.append("feOffset")
			.attr({ result: "offOut", in: "SourceGraphic", dx: 20, dy: 20 });
		
	var shadowBlend = dotsFilter.append("feBlend")
			.attr({ in: "SourceGraphic", in2: "offOut", mode: "normal" });

	var dots = d3.select("#dots-group")
		.selectAll("circle")
			.data(worldData,key)
		  	.enter()
			.append("circle")
			.filter(function(d) { return dataX(d); }) //filters out nulls
			.filter(function(d) { return dataY(d); }) 
			.filter(function(d) { return dataR(d); }) 
			.attr({
				class: "dots",
				id: function(d) { return d.country; },
				cx: function(d) { return xScale(dataX(d)); },
				cy: function(d) { return yScale(dataY(d)); },
				r: function(d) { return rScale(dataR(d)); },
				"pointer-events": "all",
				"fill": function(d) {
					//colors inspired by "irredescent sunset" palette: http://www.colourlovers.com/palette/765305/japan9
					if (d.ig == "High income: nonOECD") { return "#FF6E27"; } //yelllow green
					else if (d.ig == "Low income") { return "#991766"; }// yellow
					else if (d.ig == "Upper middle income") { return "#F34739"; } //light teal
					else if (d.ig == "Lower middle income") { return "#D90F5A"; } //blue
					else if (d.ig == "High income: OECD") { return "#FFB627"; } //light pink
					else { return "black"; }
					},
				"opacity": 0.85
			})
			.style({
				//filter: "url(#dots-filter)"
			})
			.call(dotTips) // http://bit.ly/22HClnd
			//using enter and leave as opposed to over and out because mouseenter and mouesleave don't bubble up to the dots group 
			.on('mouseenter',dotTips.show)
			//for opacity on hover, for some reason two 'mouseenter' listeners doesn't work
			.on('mouseover',mouseOn)
			.on('mouseleave',dotTips.hide)
			.on('mouseout',mouseOff);


//Call axes

	//X axis
	svg.append("g") 
		.attr({
			class:"xaxis",
			transform: "translate(" + 0 + "," + (h + xaxisShiftY) + ")"
		})
		.call(xAxis); //making the g element (current selection) available to the xAxis function

	// http://bl.ocks.org/phoebebright/3061203

	var xLabel = svg.append("text")
		.attr({
			class: "x-label",
			"text-anchor": "middle",
			transform: function(d) { return "translate(" + (w/2) + "," + (h) + ")"; }
		})
		.text(titleX);

	//Y axis
	svg.append("g") 
		.attr({
			class:"yaxis",
			transform: "translate(" + yaxisShiftX + "," + 0 + ")" 
		})
		.call(yAxis); //making the g element (current selection) available to the xAxis function

	var yLabel = svg.append("text")
		.attr({
			class:"y-label",
			"text-anchor": "middle",
			transform: function(d) { return "translate(" + 0 + "," + (h + xaxisShiftY)/2 + ") rotate(-90)"; }
		})
		.text(titleY);	



//Update data on dropdown select - http://bit.ly/2dFOIho


//Update X
	d3.selectAll(".x-choice").on("click", function() {

		//Update dataX variable
		var xValue = d3.select(this).attr('value');
		console.log(xValue);

		var dataX = function(d) { return eval(xValue); }; //eval to evaluate the string pulled from the HTML element

		//Define X display values
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


		//Update xScale
		var xScale = d3.scale.linear()
			.domain([d3.min(worldData,function(d) { return dataX(d); }), d3.max(worldData,function(d) { return dataX(d); })])
			//Using min as min values in our data in some cases are negative
			.range([xaxisShiftX, w])
			.nice();

		//Update dot placement
		d3.select("#dots-group").selectAll("circle")
			.filter(function(d) { return dataX(d); }) //filters out nulls
			.transition()
			.duration(1000)
			.attr({
					cx: function(d) { return xScale(dataX(d)); }
				});
			

		//Update x axis
		var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

		//Update x axis label
		xLabel.text(titleX);

		//Update title
		titleText.text(titleX + " vs. " + titleY);

		//Call x axis
		d3.select(".xaxis")
			.transition()
			.duration(1000)
			.call(xAxis);

		
	});

//Update Y
	d3.selectAll(".y-choice").on("click", function() {

		//Update dataY variable
		var yValue = d3.select(this).attr('value');
		console.log(yValue);

		var dataY = function(d) { return eval(yValue); }; //eval to evaluate the string pulled from the HTML element

		//Define Y display values
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

		//Update yScale
		var yScale = d3.scale.linear()
			.domain([d3.max(worldData,function(d) { return dataY(d); }),d3.min(worldData,function(d) { return dataY(d); })])
			.range([0, h + xaxisShiftY])
			.nice();

		//Update dot placement
		d3.select("#dots-group").selectAll("circle")
			.filter(function(d) { return dataY(d); }) //filters out nulls
			.transition()
			.duration(1000)
			.attr({
					cy: function(d) { return yScale(dataY(d)); }
				});

		//Update y axis
		var yAxis = d3.svg.axis().scale(yScale).orient("left");

		//Update y axis label
		yLabel.text(titleY);

		//Update title
		titleText.text(titleX + " vs. " + titleY);

		//Call y axis
		d3.select(".yaxis")
			.transition()
			.duration(1000)
			.call(yAxis);
		
	});




});

//General use variables
	
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	margin = {top: 80, right: 140, bottom: 40, left: 60},
		w = parseInt(d3.select('#scatter-div').style('width'), 10),//Get width of containing div for responsiveness
		w = w - margin.left - margin.right,
		h = parseInt(d3.select('#scatter-div').style('height'),10),
		h = h - margin.top - margin.bottom;

	//Deprecated, margin works instead - Padding between output range and edge of canvas
	var canvasPadding = {top: 10, right: 10, bottom: 10, left:60};
		
	//Default positioning of chart elements
	var textShift = 0,
	    dotsShiftX = 0,
	    dotsShiftY = 0, 
	    xaxisShiftX = 60,
	    yaxisShiftX = 60,
	    xaxisShiftY = -60,
	    yaxisShiftY = 0;

	//Positioning of hover information
	var infoTop = 115,
		infoLeft = w + margin.left,
		infoWidth = 12 + "em",
		infoHeight = 24 + "em"; 

	//Transitions
	// var maxDelay = 10000,
	//     barDuration 800,
	//     axisDuration = 800,
	//     defaultFade = 50,
	//     hoverDuration = 200;



//Begin data function 
d3.csv("/8step.io/production_data/world_data/datadev/world.csv",function(error,data) {
			
	if(error) {
		console.log(error);
	} else {
		console.log(data);
	}


//Key dataset-dependent variables

	//Data and key functions
	var worldData = data;
	var	key = function(d,i) {
		//return i; //Simply i to remove bar-sorting on transition
		return d.country; //Binding row ID to country name
	};

	//Variables for cx, cy, and r data fields
	
	var dataX = function(d) { return +d.polistab; };
	//var dataX = function(d) { return 100 - +d.press; };
	//var dataX = function(d) { return 1 - +d.gini/100; };
	var dataY = function(d) { return 100 - +d.press; };
	//var dataY = function(d) { return 100 - +d.press; };
	var dataR = function(d) { return +d.gdphead; };
	console.log(dataX.toString());
	//Variable display names

	var titleX = "Political Stabtility";
	var titleY = "Press Freedom";
	var titleR = "GDP per Capita";

//Chart title

	var titleText = d3.select("h2#chart-title").append("text.title-text")
		.text(titleX + " vs. " + titleY);

//Tooltips - http://bit.ly/22HClnd
	var dotTips = d3.tip()
		.attr("class", "d3-tip")
		.style({top: infoTop, left: infoLeft,
				width: infoWidth, height: infoHeight})
		//size and positioning values in .style not .attr bc tooltip is a div, not svg.
		.direction('e')
  		.html(function(d) {
  		  return "<p id='tiphead'>" + d.country  + "</p><p class='tip-subhead'>Income Group:</p><p class='tip-body'>" + (d.ig) + "</p>"
  		   + "<p class='tip-subhead'>Region:</p><p class='tip-body'>" + (d.region) + "</p>";
 		 });


//Set up the canvas
	var svg = d3.select("#scatter-div")
		.append("svg")
		.attr({
			width: w + margin.left + margin.right, 
			height: h + margin.top + margin.bottom,
			//viewBox: "0 0 " + 380/*(w + margin.left + margin.right)*/ + " " + 8000/* (h + margin.top + margin.bottom)*/,
			//preserveAspectRatio: "xMinYMin meet",
			id: "canvas"
			})
		.append("g") //This g element and it attributes also following bstok's margin convention. It holds all the canvas' elements.
		.attr({
			transform: "translate(" + margin.left + "," + margin.top + ")"
		});

//Define linear scales

	//X scale
	var xScale = d3.scale.linear()
		.domain([d3.min(worldData,function(d) { return dataX(d); }), d3.max(worldData,function(d) { return dataX(d); })])
		//Using min as min values in our data in some cases are negative
		.range([xaxisShiftX, w])
		.nice();

	//Y scale
	var yScale = d3.scale.linear()
		.domain([d3.max(worldData,function(d) { return dataY(d); }),d3.min(worldData,function(d) { return dataY(d); })])
		.range([0, h + xaxisShiftY])
		.nice();

	//Radius scale
	var rScale = d3.scale.linear()
		.domain([0, d3.max(worldData,function(d) { return dataR(d); })])
		.range([4, 40])
		.nice();

//Define axes

	//X axis
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

	//Y axis
	var yAxis = d3.svg.axis().scale(yScale).orient("left");


//Guide lines from: http://bit.ly/29FRNP1
	var guideLines = function(d) { 

		//horizontal
		svg.append("g")
			.classed("guide",true)
			.append("line")
				.attr("y1",d3.select(".a-dot").attr("cy"))
				.attr("y2",d3.select(".a-dot").attr("cy"))
				.attr("x1",yaxisShiftX)
				.attr("x2",d3.select(".a-dot").attr("cx"))
				.attr("stroke",d3.select(".a-dot").attr("fill"));

		//vertical
		svg.append("g")
			.classed("guide",true)
			.append("line")
				.attr("y1", h + xaxisShiftY)
				.attr("y2",d3.select(".a-dot").attr("cy"))
				.attr("x1",d3.select(".a-dot").attr("cx"))
				.attr("x2",d3.select(".a-dot").attr("cx"))
				.attr("stroke",d3.select(".a-dot").attr("fill"));

	};


//Mouseover events

	var mouseOn = function() {
		d3.select(this)
			.attr("opacity",1.0)
			.classed("a-dot",true)
			.classed("dots",false);

		guideLines();
	
		d3.selectAll("circle.dots").attr("opacity", 0.15);

	};
	
	var mouseOff = function() {
		d3.select(this)
			.classed("a-dot",false)
			.classed("dots",true);

		d3.selectAll(".guide")
			.remove();
			

		d3.selectAll("circle.dots").attr("opacity", 0.85);
	};

//Default chart elements

	//Dots	
	var dotsGroup = svg.append("g")
		.attr({
			id: "dots-group"
		});

	var dotsFilter = dotsGroup.append("defs").append("filter")
			.attr({
				id: "dots-filter",
				x: 0,
				y: 0,
				width: "200%",
				height: "200%"
			});

	var shadowOffset = dotsFilter.append("feOffset")
			.attr({ result: "offOut", in: "SourceGraphic", dx: 20, dy: 20 });
		
	var shadowBlend = dotsFilter.append("feBlend")
			.attr({ in: "SourceGraphic", in2: "offOut", mode: "normal" });

	var dots = d3.select("#dots-group")
		.selectAll("circle")
			.data(worldData,key)
		  	.enter()
			.append("circle")
			.filter(function(d) { return dataX(d); }) //filters out nulls
			.filter(function(d) { return dataY(d); }) 
			.filter(function(d) { return dataR(d); }) 
			.attr({
				class: "dots",
				id: function(d) { return d.country; },
				cx: function(d) { return xScale(dataX(d)); },
				cy: function(d) { return yScale(dataY(d)); },
				r: function(d) { return rScale(dataR(d)); },
				"pointer-events": "all",
				"fill": function(d) {
					//colors inspired by "irredescent sunset" palette: http://www.colourlovers.com/palette/765305/japan9
					if (d.ig == "High income: nonOECD") { return "#FF6E27"; } //yelllow green
					else if (d.ig == "Low income") { return "#991766"; }// yellow
					else if (d.ig == "Upper middle income") { return "#F34739"; } //light teal
					else if (d.ig == "Lower middle income") { return "#D90F5A"; } //blue
					else if (d.ig == "High income: OECD") { return "#FFB627"; } //light pink
					else { return "black"; }
					},
				"opacity": 0.85
			})
			.style({
				//filter: "url(#dots-filter)"
			})
			.call(dotTips) // http://bit.ly/22HClnd
			//using enter and leave as opposed to over and out because mouseenter and mouesleave don't bubble up to the dots group 
			.on('mouseenter',dotTips.show)
			//for opacity on hover, for some reason two 'mouseenter' listeners doesn't work
			.on('mouseover',mouseOn)
			.on('mouseleave',dotTips.hide)
			.on('mouseout',mouseOff);


//Call axes

	//X axis
	svg.append("g") 
		.attr({
			class:"xaxis",
			transform: "translate(" + 0 + "," + (h + xaxisShiftY) + ")"
		})
		.call(xAxis); //making the g element (current selection) available to the xAxis function

	// http://bl.ocks.org/phoebebright/3061203

	var xLabel = svg.append("text")
		.attr({
			class: "x-label",
			"text-anchor": "middle",
			transform: function(d) { return "translate(" + (w/2) + "," + (h) + ")"; }
		})
		.text(titleX);

	//Y axis
	svg.append("g") 
		.attr({
			class:"yaxis",
			transform: "translate(" + yaxisShiftX + "," + 0 + ")" 
		})
		.call(yAxis); //making the g element (current selection) available to the xAxis function

	var yLabel = svg.append("text")
		.attr({
			class:"y-label",
			"text-anchor": "middle",
			transform: function(d) { return "translate(" + 0 + "," + (h + xaxisShiftY)/2 + ") rotate(-90)"; }
		})
		.text(titleY);	



//Update data on dropdown select - http://bit.ly/2dFOIho


//Update X
	d3.selectAll(".x-choice").on("click", function() {

		//Update dataX variable
		var xValue = d3.select(this).attr('value');
		console.log(xValue);

		var dataX = function(d) { return eval(xValue); }; //eval to evaluate the string pulled from the HTML element

		//Define X display values
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


		//Update xScale
		var xScale = d3.scale.linear()
			.domain([d3.min(worldData,function(d) { return dataX(d); }), d3.max(worldData,function(d) { return dataX(d); })])
			//Using min as min values in our data in some cases are negative
			.range([xaxisShiftX, w])
			.nice();

		//Update dot placement
		d3.select("#dots-group").selectAll("circle")
			.filter(function(d) { return dataX(d); }) //filters out nulls
			.transition()
			.duration(1000)
			.attr({
					cx: function(d) { return xScale(dataX(d)); }
				});
			

		//Update x axis
		var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

		//Update x axis label
		xLabel.text(titleX);

		//Update title
		titleText.text(titleX + " vs. " + titleY);

		//Call x axis
		d3.select(".xaxis")
			.transition()
			.duration(1000)
			.call(xAxis);

		
	});

//Update Y
	d3.selectAll(".y-choice").on("click", function() {

		//Update dataY variable
		var yValue = d3.select(this).attr('value');
		console.log(yValue);

		var dataY = function(d) { return eval(yValue); }; //eval to evaluate the string pulled from the HTML element

		//Define Y display values
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

		//Update yScale
		var yScale = d3.scale.linear()
			.domain([d3.max(worldData,function(d) { return dataY(d); }),d3.min(worldData,function(d) { return dataY(d); })])
			.range([0, h + xaxisShiftY])
			.nice();

		//Update dot placement
		d3.select("#dots-group").selectAll("circle")
			.filter(function(d) { return dataY(d); }) //filters out nulls
			.transition()
			.duration(1000)
			.attr({
					cy: function(d) { return yScale(dataY(d)); }
				});

		//Update y axis
		var yAxis = d3.svg.axis().scale(yScale).orient("left");

		//Update y axis label
		yLabel.text(titleY);

		//Update title
		titleText.text(titleX + " vs. " + titleY);

		//Call y axis
		d3.select(".yaxis")
			.transition()
			.duration(1000)
			.call(yAxis);
		
	});




});

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
d3.csv("/8step.io/production_data/crime_data/datadev/crime.csv",function(error,data) {
			
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