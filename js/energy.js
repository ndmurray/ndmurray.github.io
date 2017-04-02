//General Use Variables

//Canvas Margin and dimensions 
var margin = {top: 20, right: 20, bottom: 20, left: 20}, 
	w = parseInt(d3.select('#wrapper').style('width'), 10), //get dimensions of container
	w = w - margin.left - margin.right,
	h = parseInt(d3.select('#wrapper').style('height')),
	h = h - margin.top - margin.bottom; 

//Line chart margin and dimensinos
var lineMargin = {top: 20, right: 20, bottom: 20, left: 20},
	lineW = parseInt(d3.select('#line-div').style('width'),10),
	lineW = lineW - lineMargin.left - lineMargin.right,
	lineH = parseInt(d3.select('#line-div').style('height'),10),
	lineH = lineH - lineMargin.top - lineMargin.bottom;

//Parse dates
var parseDate = d3.timeParse("%m-%Y"),
    formatMonth = d3.timeFormat("%b-%Y");

//Range X
var xScale = d3.scaleTime().range([0,lineW]);

//Range Y 
var yScale = d3.scaleTime().range([lineH,0]);

//Dot Size
var dotRadius = "0.25em"


//Begin data function

d3.queue()
	.defer(d3.csv,"/8step.io/production_data/energy_data/energy_xstate.csv")
	.await(ready);

function ready(error, data) {
	if (error) { console.log(error) } 
		else { console.log(data) }

	function set(d) {
		d.date = parseDate(d.date);
		d.mwh = +d.mwh;
		return d;
	}

	//Data functions - fill this in later, there may be a better way than what you have in ctc metrics

	var timeData = data;

	//Add domains to scales

	xScale.domain(d3.extent(timeData, function(d) { return d.date; }));
	yScale.domain(d3.extent(timeData, function(d) { return d.mwh; })).nice();

	//Define Axes
	var xAxis = d3.axisBottom().scale(xScale).tickFormat(formatMonth),
		yAxis = d3.axisLeft().scale(yScale);

}







