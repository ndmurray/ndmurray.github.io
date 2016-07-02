//General use variables
	
	//Margin and padding
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	margin = {top: 10, right: 10, bottom: 10, left: 10},
		w = parseInt(d3.select('#scatter-div').style('width'), 10),//Get width of containing div for responsiveness
		w = w - margin.left - margin.right,
		h = parseInt(d3.select('#scatter-div').style('width'),10),
		h = h - margin.top - margin.bottom;

	//Padding between output range and edge of canvas
	var canvasPadding = {top: 0, right: 0, bottom: 0, left:0};
		
	//Default positioning
	var textShiftUp = 0,
	    circShiftUp = 0,
	    axisShiftUp = 0;

	//Transitions
	// var maxDelay = 10000,
	//     barDuration = 800,
	//     axisDuration = 800,
	//     defaultFade = 50,
	//     hoverDuration = 200;



//Text for title 
	var titleText = d3.select("h2#title").append("text.title-text")
		.text("Scattered data")
		.attr({
			class:"title-text",
			"font-size":"24px"
		});


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
		return i; //Simply i to remove bar-sorting on transition
		//return d.country; //Binding row ID to country name
	};


//Set up the canvas
	var svg = d3.select("#scatter-div")
		.append("svg")
		.attr({
			width: w + margin.left + margin.right, 
			height: h + margin.top + margin.bottom,
			viewBox: "0 0 " + 380/*(w + margin.left + margin.right)*/ + " " + 8000/* (h + margin.top + margin.bottom)*/,
			preserveAspectRatio: "xMinYMin meet",
			id: "canvas"
			})

		.append("g") //This g element and it attributes also following bstok's margin convention. It holds all the canvas' elements.
		.attr({
			transform: "translate(" + margin.left + "," + margin.top + ")"

		});
		//.call(circTips);  //must be called on canvas -  http://bit.ly/22HClnd

//Define linear scales

	//X scale
	var xScale = d3.scale.linear()
		.domain([0, d3.max(worldData,function(d) {
			return +d.life_exp;
		})])
		.range([0, w - canvasPadding.right])
		.nice();

	//Y scale
	var yScale = d3.scale.linear()
		.domain([0,d3.max(worldData,function(d)  {
			return +d.gdphead;
		})])
		.range([0, h - canvasPadding.bottom]);

//Axes

	//X axis
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.ticks(5);

	//Y axis
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("top")
		.ticks(5);



});
