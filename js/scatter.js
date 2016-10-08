//General use variables
	
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	margin = {top: 40, right: 140, bottom: 40, left: 60},
		w = parseInt(d3.select('#scatter-div').style('width'), 10),//Get width of containing div for responsiveness
		w = w - margin.left - margin.right,
		h = parseInt(d3.select('#scatter-div').style('height'),10),
		h = h - margin.top - margin.bottom;

	//Deprecated, margin works instead - Padding between output range and edge of canvas
	var canvasPadding = {top: 10, right: 10, bottom: 10, left:60};
		
	//Default positioning of chart elements
	var textShift = 0,
	    dotsShift = 0,
	    xaxisShiftX = 0,
	    yaxisShiftX = 0,
	    xaxisShiftY = h,
	    yaxisShiftY = 0;

	//Positioning of hover information
	var infoTop = 115,
		infoLeft = w + margin.left,
		infoWidth = 12 + "em",
		infoHeight = 30 + "em"; 

	//Transitions
	// var maxDelay = 10000,
	//     barDuration = 800,
	//     axisDuration = 800,
	//     defaultFade = 50,
	//     hoverDuration = 200;


//Text for title  
	var titleText = d3.select("h2#chart-title").append("text.title-text")
		.text("Political Stability (X) vs Control of Corruption(Y)");


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


//Tooltips - http://bit.ly/22HClnd
	var dotTips = d3.tip()
		.attr({class: "d3-tip"})
		.style({top: infoTop, left: infoLeft,
				width: infoWidth, height: infoHeight})
		//size and positioning values in .style not .attr bc tooltip is a div, not svg.
		.direction('e')
  		.html(function(d) {
  		  return "<p id='tiphead'>" + d.country  + "</p><p id='tipbody'><p class='tip-subhead'>Income Group:</p> " + (d.ig) + "</p>"
  		   + "</p><p id='tipbody'><p class='tip-subhead'>Region:</p> " + (d.region) + "</p>";
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
		.range([0, w])
		.nice();

	//Y scale
	var yScale = d3.scale.linear()
		.domain([d3.max(worldData,function(d) { return dataY(d); }),d3.min(worldData,function(d) { return dataY(d); })])
		.range([0, h]);

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
				.attr("x1",0)
				.attr("x2",d3.select(".a-dot").attr("cx"))
				.attr("stroke",d3.select(".a-dot").attr("fill"));

		//vertical
		svg.append("g")
			.classed("guide",true)
			.append("line")
				.attr("y1", h)
				.attr("y2",d3.select(".a-dot").attr("cy"))
				.attr("x1",d3.select(".a-dot").attr("cx"))
				.attr("x2",d3.select(".a-dot").attr("cx"))
				.attr("stroke",d3.select(".a-dot").attr("fill"));

	};


//Mouseover events

	var mouseOn = function() {
		var current = this;
		d3.select(current)
			.attr("opacity",1.0)
			.classed("a-dot",true)
			.classed("dots",false);

		guideLines();
	
		d3.selectAll("circle.dots").attr("opacity", 0.15);

	};
	
	var mouseOff = function() {
		var current = this;
		d3.select(current)
			.classed("a-dot",false)
			.classed("dots",true);

		d3.selectAll(".guide")
			.remove();
			

		d3.selectAll("circle.dots").attr("opacity", 0.85);
	};

//Default chart elements

	//Dots	
	var dots = svg.append("g")
		.attr({
			id: "dots-group"
		})
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
					//colors comaination of the following third party palletes
					//http://www.colourlovers.com/palette/360922/u.make.me.happy
					//http://www.colourlovers.com/palette/1689724/%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D1%8F					
					if (d.ig == "High income: nonOECD") { return "#CEE879"; } //yelllow green
					else if (d.ig == "Low income") { return "#FFA700"; }// yellow
					else if (d.ig == "Upper middle income") { return "#54EBBA"; } //light teal
					else if (d.ig == "Lower middle income") { return "#1DC28C"; } //blue
					else if (d.ig == "High income: OECD") { return "#FF93D2"; } //light pink
					// else if (d.ig == "East Asia & Pacific") { return "#8CD19D"; } //sea foam
					// else if (d.ig == "Latin America & Caribbean") { return "#FF0D00"; } //red
					else { return "black"; }
				},
				"opacity": 0.85
			})
			.call(dotTips) // http://bit.ly/22HClnd
			//using enter and leave as opposed to over and out because mouseenter and mouesleave don't bubble up to the dots group 
			.on('mouseenter',dotTips.show)
			//for opacity on hover, for some reason two 'mouseenter' listeners doesn't work
			.on('mouseover',mouseOn)
			.on('mouseleave',dotTips.hide)
			.on('mouseout',mouseOff);

//Update data on dropdown select - http://bit.ly/2dFOIho
	var selectX = d3.select("#dropdown-x li a").on("click", function() {
		UpdateX();
	});

//function(d) { return +d.polistab; };

//Call axes

	//X axis
	svg.append("g") 
		.attr({
			class:"xaxis",
			transform: "translate(" + xaxisShiftX + "," + xaxisShiftY + ")" //20px upward to avoid hugging bars
		})
		.call(xAxis); //making the g element (current selection) available to the xAxis function

	//Y axis
	svg.append("g") 
		.attr({
			class:"yaxis",
			transform: "translate(" + yaxisShiftX + "," + yaxisShiftY + ")" 
		})
		.call(yAxis); //making the g element (current selection) available to the xAxis function	

//Update X

	var UpdateX = function() {

		//Update dataX variable
		var xValue = d3.select(".x-choice").attr('value');
		console.log(xValue);

		var dataX = function(d) { return eval(xValue) }; //eval to evaluate the string pulled from the HTML element

		//Update Xscale
		var xScale = d3.scale.linear()
			.domain([d3.min(worldData,function(d) { return dataX(d); }), d3.max(worldData,function(d) { return dataX(d); })])
			//Using min as min values in our data in some cases are negative
			.range([0, w])
			.nice();

		//Update Dot placement
		d3.select("#dots-group").selectAll("circle")
			.filter(function(d) { return dataX(d); }) //filters out nulls
			.transition()
			.duration(1000)
			.attr({
					cx: function(d) { return xScale(dataX(d)); }
				})
			


			
	};



});
