//General use variables
	
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	margin = {top: 10, right: 10, bottom: 10, left: 10},
		w = parseInt(d3.select('#map-div').style('width'), 10),//Get width of containing div for responsiveness
		w = w - margin.left - margin.right,
		h = parseInt(d3.select('#map-div').style('height'),10),
		h = h - margin.top - margin.bottom

	//Default values
	var legendTitle = "Median Household Income ($)";
	var legendFormat = d3.format('.2s');

	//Draw the canvas
	var svg = d3.select("#map-div").append("svg")
		.attr("class","svg")
		.attr("width", w + margin.left + margin.right)
		.attr("height", h + margin.top + margin.bottom)
		.attr("id","map-canvas")
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	//Chart title
	var titleText = legendTitle + ", USDA, 2015";
	var chartTitle = d3.select("#header-row")
		.append("div").attr("class","chart-title")
		.style("opacity",1)
		.text(titleText);

	//Define constructor functions - special functions avaialble to the elements we define below
	//See introduction to constructor functions here: https://ejb.github.io/2016/05/23/a-better-way-to-structure-d3-code.html
	//We use these to define the 'moveToFront' and 'moveToBack' functions

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
	
	//Custom filter defining drop shadow, for county hover - inspired by http://bl.ocks.org/cpbotha/5200394
	var countyFilter = d3.select("defs").append("filter").attr("id","county-filter")
			.attr("height","400%").attr("width","400%").attr("y","-80%").attr("x","-80%"); //These filter dimensions keep the shadow getting clipped by the filter area
		countyFilter.append("feOffset") //offset the shape area, call it "offOut"
				.attr("result","offOut").attr("in","SourceGraphic")
				.attr("dx","4").attr("dy","4");
		countyFilter.append("feMorphology") //Enlarge the offset area, call it bigOut
				.attr("result","bigOut").attr("in","SourceGraphic").attr("operator","dilate")
				.attr("radius","3");
		countyFilter.append("feColorMatrix") //Bring the offset image (shadow) color closer to black, call it "matrixOut" 
				.attr("result","matrixOut").attr("in","bigOut").attr("type","matrix")//Notice we're taking "bigOut" as input
				.attr("values","0.1 0 0 0 0 0 0.1 0 0 0 0 0 0.1 0 0 0 0 0 1 0");
		countyFilter.append("feGaussianBlur") //Blur the offset image, call it "blurOut"
				.attr("result","blurOut").attr("in","matrixOut")//Notice we're taking "matrixOut" as input
				.attr("stdDeviation","1");
		countyFilter.append("feBlend") //fill the shape area with the county shpae (SourceGraphic)
				.attr("in","SourceGraphic").attr("in2","blurOut")//Notice we're taking "blurOut" as input, in addition to SoureGraphic. The alternative is sourceAlpha, the blacked out version
				.attr("mode","normal");

		//state boundaries filter
	var stateFilter = d3.select("defs")
		.append("filter").attr("id","state-filter")
			.append("feGaussianBlur")
				.attr("result","blurOut").attr("stdDeviation","1");

//Mapping functions

	//Load geographic and descriptive data
	d3.queue()
		.defer(d3.json,"https://d3js.org/us-10m.v1.json")
		.defer(d3.csv,"/8step.io/production_data/employment_data/county_8.16.csv")
		//.defer(d3.csv,"/8step.io/production_data/employment_data/county_8.16.csv", function(d) { unemployment.set(d.id, +d.rate) })
		.await(ready);


	//Map zoom with projection - https://bl.ocks.org/mbostock/2206340
	// var projection = null //defing up front so we can modify on click/zoom, projection is already built in as null so we don't change it
	// 	.scale(10); //scale value
	// 	//.translate([0,0]);

	//Map boundary path
	var mapPath = d3.geoPath();
		// .projection(projection);

//Map data and its dependent elements
function ready(error, usa, data) {// my understanding is that we list usa, data in the order they appear above under d3.queue()
	
	if (error) { console.log(error); }
	else { console.log(usa);
		   console.log(data); }

	//Mapping array we'll use to assign data to counties
	//From example: https://bl.ocks.org/mbostock/3306362
	var mapObject = {};
	var mapData = function(d) { return +d.med_inc };
	//Populate that array with your target set of data values
	data.forEach(function(d) {
		mapObject[d.id] = mapData(d); 
	});
	console.log(mapObject); //you'll see in console is this just an array of key value pairs, id:+med_inc, aka id: mapData(d)

	//Color scale
	var cScale = d3.scaleQuantile()
		//.domain([d3.min(function(d) { +d.rate; }),d3.max(function(d) { +d.rate} )])
		.domain(d3.values(mapObject)) //****need an array to make quantile scale work
		//.domain( function(d) { unemployment.set(d.id, +d.rate).values(); })
		.range(d3.schemeGnBu[9]);

	//County boundaries
	var counties = svg.append("g")
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
		.attr("class","county")
		.attr("d",mapPath);

	// Not currently in use: Add county centroids to mapObject
	//  // Got it from here, it's a bit over my head:http://bit.ly/2lRPA8k
	// for(var i = 0; i < usa.objects.counties.geometries.length; i++) {
	// 	var p = usa.objects.counties.geometries[i];
	// 	var c = mapPath.centroid(p);
	// 	usa.objects.counties.geometries.x = c[0];
	// 	usa.objects.counties.geometries.y = c[1];
	// 	console.log(usa);
	// }

	// //var c = d3.selectAll("path.county")
	

	//County markup
	d3.selectAll(".county")
	.attr("fill", function(d) { return cScale(mapObject[d.id]); }) //mapObject maps id to the data in mapData, which currently is d.med_inc
	.attr("stroke",function(d) { return cScale(mapObject[d.id]); });

	//State boundaries
	svg.append("g").attr("class","states")
	.append("path")
		.datum(topojson.mesh(usa, usa.objects.states), function(a,b) { return a !== b; } )
		.attr("class","state-boundaries")
		.attr("d",mapPath)
		.attr("filter","url(#state-filter");

	//Bounding box of state boundaries aka, the map
	var mapExtent = d3.select(".states").node().getBBox();
	var mapWidth = mapExtent.width;

	//Set nav div width based on BBox
	d3.select("#nav").style("width",mapExtent.width);

	//Size info div based on map extent - INFODIV NOT CURRENTLY IN USE 
	// d3.select("#info-div")
	// 	.style("height",d3.select("#nav").style("height"))
	// 	.style("width",(mapWidth * 0.6));

	//Size buttons based on map extent
	d3.select("#button-div")
		.style("width",(mapWidth));
		//.style("width",(mapWidth * 0.2)); -to fit with infodiv

	//Map legend, based on Susie Lu's legend libary: http://d3-legend.susielu.com
	svg.append("g")
		.attr("class","legendQuant")
		.attr("opacity",1)
		.attr("transform","translate("+ (0.9 * mapWidth) +"," + (0.4 * h) + ")");

	var legend = d3.legendColor()
		.labelFormat(legendFormat)
		// .shapeWidth(20)
		.shape('circle')
		// .shapePadding(60)
		.useClass(false)
		//.orient('horizontal')
		//.title(legendTitle)
		.titleWidth(240)
		.scale(cScale);

	svg.select("g.legendQuant")
		.call(legend);

	// //Define tooltip
	var mapTip = d3.select("body").append("div")
		.attr("id","map-tip")
		.style("opacity",0);

	//Put together a toolTip data object
	var tipObject = {};
	//Populate that object  with an array of values
	data.forEach(function(d) {
		//for each item in the tipObject array (using id field simply as array index)
		tipObject[d.id] = d; // assign an array of data objects, one for each county. Because it's just d we've assigned it the entire data object for each id (you'll see in javascript console)
	});

	console.log(tipObject);

	var tipData = function(d) { return tipObject[d.id].med_inc }

	//for shifting tip position
	tipPosShift = {x: 20, y: -100}

	//County hover action
	d3.selectAll(".county").on('mouseover',function(d) {

		d3.select(this).moveToFront()
			.attr("filter","url(#county-filter)");
		
		// Tooltip
		mapTip.style("left",(d3.event.pageX + tipPosShift.x) + "px") 
			  .style("top",(d3.event.pageY + tipPosShift.y) + "px")
			.transition()
			.duration(500)
			.style("opacity",0.8);

		//for Tooltip label
		var dolla = "$"; 
		

		mapTip.html(
			//notice we need [d.id] in here to reference not really the id field but, the index of the array with the same # as the id field
			"<p class='tip-val'>" + dolla + "" + (legendFormat)(tipData(d)) + "</p>" +
			"<p class='tip-loc'>" + tipObject[d.id].county + ", " + tipObject[d.id].state + "</p>"
		);

		//Deprecated code
			// .transition()
			// .attrTween("transform", function(d, i, a) {
     		//	return d3.interpolateString(a, 'scale(1)')
			// })
			// .attr("stroke","green")
			//.attr("stroke-width","4px")
			//Drop shadow
			//Size (start by translating it to origin otherwise it will appear to change position)
			//Source: http://stackoverflow.com/questions/16945951/how-to-scale-the-element-by-keeping-the-fixed-position-in-svg
			//.classed("target-county",true) //transform-origin appears only to be a css property
			//.attr("transform","scale(2)");
		
		//d3.select(".states").moveToBack();
		//d3.select(this).append("svg")
			
	}).on('mouseout',function(d) {
		d3.select(this)
			// .attr("stroke",function(d) { return cScale(mapObject[d.id]); })
			// .attr("stroke-width","1px")
			//.classed("target-county",false) //transform-origin appears only to be a css property
			.attr("filter","none")
			.moveToBack();

		//d3.select(".states").moveToFront();

		mapTip.transition()
			.duration(500)
			.style("opacity",0);
	});


//Update map

	d3.selectAll(".choice").on("click",function() {

	//Data

		//Update target data
		var mapData = d3.select(this).attr('value');
		var tipData = function(d) { return eval("tipObject[d.id]." + mapData); }
		console.log(mapData)

		//Populate the mapObject array with your target set of values
		data.forEach(function(d) {mapObject[d.id] = eval("+d." + mapData);});

		//Update color scale
		cScale.domain(d3.values(mapObject))
		.range(d3.schemeGnBu[9]);

		//Title values
		switch (mapData) {
			case "rate":
				legendTitle = "Unemployment Rate (%)";
				break;
			case "edu":
				legendTitle = "Adults with High School Diploma (%)";
				break;
			case "med_inc":
				legendTitle = "Median household income ($)";
				break;
		}

	//Legend formatting
		switch (mapData) {
			case "rate":
				legendFormat= d3.format('.1%');
				break;
			case "edu":
				legendFormat = d3.format('.0%');
				break;
			case "med_inc":
				legendFormat = d3.format('.2s');
				break;
		}

		var titleText = legendTitle + ", USDA, 2015";

	//Map elements

		//update  map path
		d3.selectAll("path")
			.transition()
			.duration(2000)
			.attr("fill", function(d) { return cScale(mapObject[d.id]); })
			.attr("stroke",function(d) { return cScale(mapObject[d.id]); });

		//Legend and title

		//fade out

		d3.select("div.chart-title").transition()
			.duration(500)	
			.style("opacity",0)
			.on("end",function() {
				chartTitle.text(titleText);
			});

		d3.select("g.legendQuant")
			.transition()
			.duration(500)
			.attr("opacity",0)
			.on("end", function(){
				legend.labelFormat(legendFormat);
					//.title(legendTitle); 
					svg.call(legend);
				
			});	

		//fade in

		d3.select("div.chart-title")
			.transition()
			.delay(1000)
			.duration(500)
			.style("opacity",1);

		d3.select("g.legendQuant")
			.transition()
			.delay(1000)
			.duration(500)
			.attr("opacity",1);

		//Tooltip
		d3.selectAll(".county").on('mouseover',function(d) {
			d3.select(this).moveToFront()
			.attr("filter","url(#county-filter)");
		
			mapTip.style("left",(d3.event.pageX + tipPosShift.x) + "px") 
			      .style("top",(d3.event.pageY + tipPosShift.y) + "px")
				.transition()
				.duration(500)
				.style("opacity",0.8);

		if (mapData == "med_inc") { 
			dolla = "$" } else { dolla = "" }

			mapTip.html(
				//notice we need [d.id] in here to reference not really the id field but, the index of the array with the same # as the id field
				"<p class='tip-val'>" + dolla + (legendFormat)(tipData(d)) + "</p>" +
				"<p class='tip-loc'>" + tipObject[d.id].county + ", " + tipObject[d.id].state + "</p>"
			);
		});

	});

}

//Note on data:

//rate: Unemployment rate by county as of August 2016, source, BLS
//edu: % of Adults without a hs diploma, 2015 source USDA
//med_inc: median household income, best estimate, USDA, 2015

