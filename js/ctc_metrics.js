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
d3.csv("/nickm.io/production_data/ctc_data/ctc_lines.csv",
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
	d3.csv("/nickm.io/production_data/ctc_data/divisions.csv",function(error,data) {
				
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


	d3.csv("/nickm.io/production_data/ctc_data/ctc_lines.csv",
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