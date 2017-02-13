//General use variables
	
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	margin = {top: 100, right: 10, bottom: 10, left: 80},
		w = parseInt(d3.select('#map-div').style('width'), 10),//Get width of containing div for responsiveness
		w = w - margin.left - margin.right,
		h = parseInt(d3.select('#map-div').style('height'),10),
		h = h - margin.top - margin.bottom;

	//Draw the canvas
	var svg = d3.select("#map-div").append("svg")
		.attr("width", w + margin.left + margin.right)
		.attr("height", h + margin.left + margin.right)
		.attr("id","map-canvas")
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Mapping functions

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
	.attr("fill", function(d) { return cScale(mapObject[d.id]); })
	.attr("stroke",function(d) { return cScale(mapObject[d.id]); });



	//Map legend, based on Susie Lu's legend libary: http://d3-legend.susielu.com
	svg.append("g")
		.attr("class","legendQuant")
		.attr("opacity",1)
		.attr("transform","translate("+ 20 +"," + (-margin.top + 24) + ")")

	var legendTitle = "Median Household Income";

	var legend = d3.legendColor()
		.labelFormat(d3.format('.2s'))
		.shapeWidth(20)
		.shapePadding(60)
		.useClass(false)
		.orient('horizontal')
		.title(legendTitle)
		.titleWidth(800)
		.scale(cScale);

	svg.select("g.legendQuant")
		.call(legend);


//Update map

	d3.selectAll(".choice").on("click",function() {

	//Data

		//Update target data
		var mapData = d3.select(this).attr('value');

		//Populate that array with your target set of values
		data.forEach(function(d) {mapObject[d.id] = eval(mapData);});

		//Update color scale
		cScale.domain(d3.values(mapObject))
		.range(d3.schemeGnBu[9]);

		//Display values
		switch (mapData) {
			case "+d.rate":
				legendTitle = "Unemployment Rate";
				break;
			case "+d.edu":
				legendTitle = "% of Adults without a High School Diploma";
				break;
			case "+d.med_inc":
				legendTitle = "Median household income";
				break;
		}


	//Map elements

		//update  map path
		d3.selectAll("path")
			.transition()
			.duration(2000)
			.attr("fill", function(d) { return cScale(mapObject[d.id]); })
			.attr("stroke",function(d) { return cScale(mapObject[d.id]); });

		//Legend

		//fade out, then call new legend
		svg.select("g.legendQuant")
			.transition()
			.duration(500)
			.attr("opacity",0)
			.on("end", function(){
				legend.labelFormat(d3.format('.0%'))
					.title(legendTitle);
					svg.call(legend);
			});		

		//fade in
		svg.select("g.legendQuant")
			.transition()
			.delay(1000)
			.duration(500)
			.attr("opacity",1);
	});

};	

//Note on data:

//rate: Unemployment rate by county as of August 2016, source, BLS
//edu: % of Adults without a hs diploma, 2015 source USDA
//med_inc: median household income, best estimate, USDA, 2015

