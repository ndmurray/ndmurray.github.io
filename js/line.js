//General use variables
	
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	margin = {top: 10, right: 10, bottom: 10, left: 10},
		w = parseInt(d3.select('#line-div').style('width'), 10),//Get width of containing div for responsiveness
		w = w - margin.left - margin.right,
		h = parseInt(d3.select('#line-div').style('height'),10),
		h = h - margin.top - margin.bottom;


//Begin data function 
d3.csv("/8step.io/production_data/energy_data/solar.csv",function(error,data) {
			
	if(error) {
		console.log(error);
	} else {
		console.log(data);
	}


//Key dataset-dependent variables

	//Data and key functions
	var solarData = data;
	var	key = function(d,i) {
		return d.year; //Binding row ID to year
	};

//Parse date values
	var parseDate = d3.time.format("%y").parse;

//Format the numeric values in the dataset

	solarData.forEach(function(d) {
		d.year = parseDate(d.year);
		d.price = +d.price;
	});

//Define linear scales - because it's a line chart, we set ranges first, then domains

	//X range
	var xScale = d3.time.scale().range([0,width]);
	//we're including the .time method to make sure D3 handles the values as date/time entities.

	//X domain
	xScale.domain(d3.extent(function(d) { return d.date; }));

	//Y scale
	var yScale = d3.scale.linear()
		.domain([0, d3.max(solarData,function(d) { return d.price; })])
		.range([height, 0])
		.nice();

//Define Axes
	
	var xAxis = d3.svg.axis().scale(xScale)
		.orient("bottom")
		.ticks(5);

	var yAxis = d3.svg.axis().scale(yScale)
		.orient("left")
		.ticks(5);

//Define the data line (adjust data to the desired coordinates)
//Ultimately this will inform how our path gets drawn

	var priceLine = d3.svg.line()
		.x(function(d) { return xScale(d.date); })
		.y(function(d) { return yScale(d.price); });


//Set up the canvas
	var svg = d3.select("#line-div")
		.append("svg")
		.attr({
			width: w + margin.left + margin.right, 
			height: h + margin.top + margin.bottom,
			id: "canvas"
			})
		.append("g") //This g element and it attributes also following bstok's margin convention. It holds all the canvas' elements.
		.attr({
			transform: "translate(" + margin.left + "," + margin.top + ")"
		});

//Default chart elements


	var pricePath = svg.append("path")
		.attr("d", priceLine(solarData));


//Call the axes





});
