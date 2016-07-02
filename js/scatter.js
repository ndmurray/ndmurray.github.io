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











});
