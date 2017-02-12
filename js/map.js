//General use variables
	
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	margin = {top: 10, right: 10, bottom: 10, left: 80},
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

	//Populate that array with your target set of values
	data.forEach(function(d) {mapObject[d.id] = +d.rate;});

	//Color scale
	var cScale = d3.scaleQuantile()
		//.domain([d3.min(function(d) { +d.rate; }),d3.max(function(d) { +d.rate} )])
		.domain(d3.values(mapObject))
		//.domain( function(d) { unemployment.set(d.id, +d.rate).values(); })
		.range(d3.schemeBlues[9]);

	svg.append("g")
			.attr("class","counties")
		.selectAll("path")
		//Taken from the d3 topojson library - see example: https://bl.ocks.org/mbostock/4060606
		//Make sure the topojson reference is in your html file
		//from what I can tell topojson.feature() lets us specify
		//dataset (usa), then the object properties we want to draw, aka usa.objects.counties
		//later, topojosn.mesh() will let us draw state buondaries based on county boundaries
		.data(topojson.feature(usa, usa.objects.counties).features)
		.enter()
		.append("path")
		.attr("d",mapPath);

	// unemployment.remove();
	// upDate = function (d) { unemployment.set(d.id, +d.edu);}
	// upDate();

	// cScale.domain(unemployment.values());

	d3.selectAll("path")
	.attr("fill", function(d) { return cScale(mapObject[d.id]); });

	//Update map
	d3.select("#switch").on("click",function() {

		//Populate that array with your target set of values
		data.forEach(function(d) {mapObject[d.id] = +d.edu;});

		//Update color scale
		cScale.domain(d3.values(mapObject));

		//update fill color
		d3.selectAll("path")
		.transition()
		.duration(1000)
		.attr("fill", function(d) { return cScale(mapObject[d.id]); });

	});

};	