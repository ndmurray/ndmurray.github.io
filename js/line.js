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
