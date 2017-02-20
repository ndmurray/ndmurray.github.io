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

	//Right panel
	svg.append("div")
		.attr("id","right-panel");

	//Define constructor functions - special functions avaialble to the elements we define below
	//See introduction to constructor functions here: https://ejb.github.io/2016/05/23/a-better-way-to-structure-d3-code.html

		//SVG element order - http://bl.ocks.org/eesur/4e0a69d57d3bfc8a82c2
		d3.selection.prototype.moveToFront = function() {  
	      return this.each(function() {
	      	this.parentNode.appendChild(this);
	      });
	    };

	    d3.selection.prototype.moveToBack = function() {
	 	  return this.each(function() { 
            var firstChild = this.parentNode.firstChild; 
            if (firstChild) { 
                this.parentNode.insertBefore(this, firstChild); 
            } 
          });
	    };

	//Special elements
	svg.append("defs");

		//County hover filter
	var countyFilter = d3.select("defs").append("filter").attr("id","county-filter");
		countyFilter.append("feOffset")
				.attr("result","offOut").attr("in","SourceGraphic")
				.attr("dx","-4").attr("dy","-4");
		countyFilter.append("feBlend")
				.attr("in","SourceGraphic").attr("in2","offOut")
				.attr("mode","normal")
				.attr("stdDeviation","100"); //how much to blur	
		countyFilter.append("feDiffuseLighting")
				.attr("in","SourceGraphic").attr("result","light")
				.attr("lighting-color","white");
		countyFilter.append("fePointLight")
				.attr("x","150").attr("y","60").attr("z","20");

			// .append("feMorphology")
			// 	.attr("operator","dilate").attr("radius","20")
			// 	.attr("in","SourceGraphic").attr("result","BEVEL_10");

		//state boundaries filter
	var stateFilter = d3.select("defs")
		.append("filter").attr("id","state-filter")
			.append("feGaussianBlur")
				.attr("result","blurOut").attr("in","offOut")
				.attr("stdDeviation","1");

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

	//County boundaries
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

	//County markup
	d3.selectAll("path")
	.attr("fill", function(d) { return cScale(mapObject[d.id]); })
	.attr("stroke",function(d) { return cScale(mapObject[d.id]); });

	//State boundaries
	svg.append("path")
		.datum(topojson.mesh(usa, usa.objects.states), function(a,b) { return a !== b; } )
		.attr("class","states")
		.attr("d",mapPath)
		.attr("filter","url(#state-filter");

	//Map legend, based on Susie Lu's legend libary: http://d3-legend.susielu.com
	svg.append("g")
		.attr("class","legendQuant")
		.attr("opacity",1)
		.attr("transform","translate("+ 20 +"," + (-margin.top + 24) + ")")

	var legendTitle = "Median Household Income";
	var legendFormat = '.2s'

	var legend = d3.legendColor()
		.labelFormat(d3.format(legendFormat))
		.shapeWidth(20)
		.shape('circle')
		.shapePadding(60)
		.useClass(false)
		.orient('horizontal')
		.title(legendTitle)
		.titleWidth(800)
		.scale(cScale);

	svg.select("g.legendQuant")
		.call(legend);

	//Map hover action
	d3.selectAll('.counties').on('mouseover',function(d) {
		d3.select(this)
			//SVG order
			.moveToFront()
			// .transition()
			// .attrTween("transform", function(d, i, a) {
     		//	return d3.interpolateString(a, 'scale(1)')
			// })
			// .attr("stroke","green")
			.attr("stroke-width","4px")
			//Drop shadow
			.attr("filter","url(#county-filter)");
			//Size (start by translating it to origin otherwise it will appear to change position)
			//Source: http://stackoverflow.com/questions/16945951/how-to-scale-the-element-by-keeping-the-fixed-position-in-svg
			//.classed("target-county",true) //transform-origin appears only to be a css property
			//.attr("transform","scale(2)");
		
		d3.select(".states").moveToBack();
			
	}).on('mouseout',function(d) {
		d3.select(this)
			// .attr("stroke",function(d) { return cScale(mapObject[d.id]); })
			// .attr("stroke-width","1px")
			//.classed("target-county",false) //transform-origin appears only to be a css property
			.attr("filter","none")
			.moveToBack();

		d3.select(".states").moveToFront();
	});


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

		//Title values
		switch (mapData) {
			case "+d.rate":
				legendTitle = "Unemployment Rate";
				break;
			case "+d.edu":
				legendTitle = "% of Adults with a High School Diploma";
				break;
			case "+d.med_inc":
				legendTitle = "Median household income";
				break;
		}

		//Legend formatting
		switch (mapData) {
			case "+d.rate":
				legendFormat= '.0%';
				break;
			case "+d.edu":
				legendFormat = '.0%';
				break;
			case "+d.med_inc":
				legendFormat = '.2s';
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
				legend.labelFormat(d3.format(legendFormat))
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

