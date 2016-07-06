//General use variables
	
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	margin = {top: 40, right: 140, bottom: 40, left: 40},
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
	var titleText = d3.select("h2#title").append("text.title-text")
		.text("Scatter!");


//Begin data function
d3.csv("datadev/world.csv",function(error,data) {
			
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
	var dataX = function(d) { return 100 - +d.press; };
	//var dataX = function(d) { return 1 - +d.gini/100; };
	var dataY = function(d) { return +d.corruption; };
	//var dataY = function(d) { return 100 - +d.press; };
	var dataR = function(d) { return +d.gdphead; };

//Tooltips - http://bit.ly/22HClnd
	var dotTips = d3.tip()
		.attr({class: "d3-tip"})
		.style({top: infoTop, left: infoLeft, width: infoWidth, height: infoHeight})
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
				cx: function(d) { return xScale(dataX(d)); },
				cy: function(d) { return yScale(dataY(d)); },
				r: function(d) { return rScale(dataR(d)); },
				"pointer-events": "all",
				"fill": function(d) {
					//colors comaination of the following third party palletes
					//http://www.colourlovers.com/palette/360922/u.make.me.happy
					//http://www.colourlovers.com/palette/1689724/%D0%A0%D0%BE%D1%81%D1%81%D0%B8%D1%8F					
					if (d.region == "Europe & Central Asia") { return "#CEE879"; } //yelllow green
					else if (d. region == "Middle East & North Africa") { return "#FFA700"; }// yellow
					else if (d. region == "Sub-Saharan Africa") { return "#54EBBA"; } //light teal
					else if (d.region == "North America") { return "#1DC28C"; } //blue
					else if (d.region == "South Asia") { return "#FF93D2"; } //light pink
					else if (d.region == "East Asia & Pacific") { return "#8CD19D"; } //sea foam
					else if (d.region == "Latin America & Caribbean") { return "#FF0D00"; } //red
					else { return "black"; }
				}
			})
					.call(dotTips) //must be called on canvas -  http://bit.ly/22HClnd

			//using enter and leave as opposed to over and out because mouseenter and mouesleave don't bubble up to the dots group 
			.on('mouseenter',dotTips.show)
			//for opacity on hover, for some reason two 'mouseenter' listeners doesn't work
			.on('mouseover',function() {
				var current = this;
				d3.select(current)
					.classed("active-dot",true)
					.classed("dots",false);
					
				d3.selectAll("circle.dots").attr("opacity", 0.15);
			})
			.on('mouseleave',dotTips.hide)
			.on('mouseout',function() {
				var current = this
				d3.select(current)
					.classed("active-dot",false)
					.classed("dots",true);

				d3.selectAll("circle.dots").attr("opacity", 0.85);
			});

	
	//Lines connecting dots to axes
	svg.select("line.xline")
		.append("line")
		.attr("y1",d3.selectAll("circle.dots").attr("cy"))
		.attr("y2",d3.selectAll("circle.dots").attr("cy"))
		.attr("x1",margin.left)
		.attr("x2",d3.selectAll("circle.dots").attr("cx"))
		.attr("class","xline")
		.attr("stroke", "white")
		.attr("stroke-width", 10);
			



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




});