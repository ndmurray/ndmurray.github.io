//General use variables
	
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	margin = {top: 10, right: 10, bottom: 20, left: 40},
		w = parseInt(d3.select('#scatter-div').style('width'), 10),//Get width of containing div for responsiveness
		w = w - margin.left - margin.right,
		h = parseInt(d3.select('#scatter-div').style('height'),10),
		h = h - margin.top - margin.bottom;

	//Deprecated, margin works instead - Padding between output range and edge of canvas
	var canvasPadding = {top: 10, right: 10, bottom: 10, left:60};
		
	//Default positioning
	var textShift = 0,
	    dotsShift = 0,
	    xaxisShiftX = 0,
	    yaxisShiftX = 0,
	    xaxisShiftY = h,
	    yaxisShiftY = 0;
	    //Using 4 as this is the minimum radius of the dots

	//Transitions
	// var maxDelay = 10000,
	//     barDuration = 800,
	//     axisDuration = 800,
	//     defaultFade = 50,
	//     hoverDuration = 200;



//Text for title 
	var titleText = d3.select("h2#title").append("text.title-text")
		.text("Scatter!")


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
	var dataX = function(d) { return +d.gini; };
	var dataY = function(d) { return +d.press; };
	var dataR = function(d) { return +d.gdphead; };

//Tooltips - http://bit.ly/22HClnd
	var dotTips = d3.tip()
		.attr({class: "d3-tip"})
		.offset([0, 0])
		.direction('e')
  		.html(function(d) {
  		  return "<p id='tiphead'>" + d.country + "</p><p id='tipbody'>GDP/capita: $" + d3.format(',')(+d.gdphead) + 
  		 "<br />" + +d.gdphead_year  + "</p>";
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
		})
		.call(dotTips);  //must be called on canvas -  http://bit.ly/22HClnd

//Define linear scales

	//X scale
	var xScale = d3.scale.linear()
		.domain([0, d3.max(worldData,function(d) { return dataX(d); })])
		.range([0, w])
		.nice();

	//Y scale
	var yScale = d3.scale.linear()
		.domain([d3.max(worldData,function(d) { return dataY(d); }),0])
		.range([0, h]);

	//Radius scale
	var rScale = d3.scale.linear()
		.domain([0, d3.max(worldData,function(d) { return dataR(d); })])
		.range([4, 24])
		.nice();

//Define axes

	//X axis
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(5);

	//Y axis
	var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);

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
				cx: function(d) { return xScale(dataX(d)); },
				cy: function(d) { return yScale(dataY(d)); },
				r: function(d) { return rScale(dataR(d)); },
				class: "dots",
				"fill": "rgb(179,120,211)"
			})
			.on('mouseover',dotTips.show)
			.on('mouseout',dotTips.hide);


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
