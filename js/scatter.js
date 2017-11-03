//General use variables
	
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	margin = {top: 20, right: 140, bottom: 60, left: 60},
		w = parseInt(d3.select('#scatter-div').style('width'), 10),//Get width of containing div for responsiveness
		w = w - margin.left - margin.right,
		h = parseInt(d3.select('#scatter-div').style('height'),10),
		h = h - margin.top - margin.bottom;

	//Deprecated, margin works instead - Padding between output range and edge of canvas
	var canvasPadding = {top: 10, right: 10, bottom: 10, left:60};
		
	//Default positioning of chart elements
	var textShift = 0,
	    dotsShiftX = 0,
	    dotsShiftY = 0, 
	    xaxisShiftX = 60,
	    yaxisShiftX = 50,
	    xaxisShiftY = -50,
	    yaxisShiftY = 0;

	//Positioning of hover information
	var infoTop = 115,
		infoLeft = w + margin.left,
		infoWidth = 13 + "em",
		infoHeight = 26.65 + "em"; 

	//Transitions
	// var maxDelay = 10000,
	//     barDuration 800,
	//     axisDuration = 800,
	//     defaultFade = 50,
	//     hoverDuration = 200;



//Begin data function 
d3.csv("/nickm.io/production_data/world_data/datadev/world.csv",function(error,data) {
			
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
	var dataY = function(d) { return +d.press; };
	//var dataY = function(d) { return 100 - +d.press; };
	var dataR = function(d) { return +d.gdphead; };
	console.log(dataX.toString());
	//Variable display names

	var titleX = "Political Stabtility";
	var titleY = "Press Freedom";
	var titleR = "GDP per Capita";
	var citeX = "An index from -2.5 to 2.5, 2.5 being the most stable, sourced from the Word Bank's <a href='http://databank.worldbank.org/data/reports.aspx?source=world-development-indicators' target='_blank'>World development indicators</a>.";
	var citeY = "An annual rating of press freedom at the country level, 1 being the most free, 100 being the least. Sourced from <a href='https://.org/en/ranking' target='_blank'>Reporters Without Borders</a>.";

//Chart title

	var titleText = d3.select("h3#chart-subhead").append("text")
		.attr("class", "title-text")
		.text(titleX + " vs. " + titleY + ", dots sized by GDP per capita.");

//Tooltips - http://bit.ly/22HClnd
	var dotTips = d3.tip()
		.attr("class", "d3-tip")
		.style({top: infoTop, left: infoLeft,
				width: infoWidth, 'background-color'
				:'transparent', 'opacity':0})
		//size and positioning values in .style not .attr bc tooltip is a div, not svg.
		.direction('e')
  		.html(function(d) {
  		  return "<p id='tiphead'>" + d.country  + "</p><p id='region'>" + d.region + "</span></p><p>" + titleX + "<p class='tip-value'>" + dataX(d) + "</p><p>" + titleY + "</p>"
  		   + "<p class='tip-value'>" + dataY(d) + "</p><div id='citation'><div class='citation-title'>" + titleX + "</div><br />" + citeX + "<br /><br /><div class='citation-title'>" + titleY + "</div><br />" + citeY + "</div>";
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

//Define scales

	//X scale
	var xScale = d3.scale.linear()
		.domain([d3.min(worldData,function(d) { return dataX(d); }), d3.max(worldData,function(d) { return dataX(d); })])
		//Using min as min values in our data in some cases are negative
		.range([xaxisShiftX, w])
		.nice();

	//Y scale
	var yScale = d3.scale.linear()
		.domain([d3.max(worldData,function(d) { return dataY(d); }),d3.min(worldData,function(d) { return dataY(d); })])
		.range([0, h + xaxisShiftY])
		.nice();

	//Radius scale
	var rScale = d3.scale.linear()
		.domain([0, d3.max(worldData,function(d) { return dataR(d); })])
		.range([4, 40])
		.nice();

	//Ordinal scale for colors, should also be used for colors too although it isn't
	var colorScale = d3.scale.ordinal()
		 .domain(["Low", "Lower Middle", "Upper Middle", "High, Non-OECD", "High, OECD"])
 		 .range([ "#991766", "#D90F5A", "#F34739", "#FF6E27", "#FFB627"]);


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
				.attr("x1",yaxisShiftX)
				.attr("x2",d3.select(".a-dot").attr("cx"))
				.attr("stroke",d3.select(".a-dot").attr("fill"));

		//vertical
		svg.append("g")
			.classed("guide",true)
			.append("line")
				.attr("y1", h + xaxisShiftY)
				.attr("y2",d3.select(".a-dot").attr("cy"))
				.attr("x1",d3.select(".a-dot").attr("cx"))
				.attr("x2",d3.select(".a-dot").attr("cx"))
				.attr("stroke",d3.select(".a-dot").attr("fill"));

	};

//Function to hide dots if any data element is NaN
//Here's how to do to for loops in ES6: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
	// var hideNulls = function() {
	// 	let iterable = d3.selectAll('circle.dots');
	// 	for (let dot in iterable) {
	// 		if (typeof dataX == 'number' && dataY == 'number') {
	// 			return dot.attr({
	// 				'opacity': 0.85,
	// 				'pointer-events': 'all'
	// 			});
	// 		} else {
	// 			return dot.attr({
	// 				'opacity': 0,
	// 				'pointer-events': 'none'
	// 			});
	// 		}
	// 	}
	// };


//Mouseover events
	var mouseOn = function() {
		d3.select(this)
			.attr("opacity",1.0)
			.classed("a-dot",true)
			.classed("dots",false);

		guideLines();
	
		//Hover specific tip styling
		d3.select('.d3-tip')
		.style("background-color", d3.select(".a-dot").attr("fill"))
		.style("color", d3.select(".a-dot").attr("stroke"))
		.style('opacity',0.5);

		d3.selectAll('circle.dots').filter(function(d) { return isNaN(dataX(d)); })
				.attr({"opacity": 0, "pointer-events":"none"})
				.attr("opacity", 0.15);
	};
	
	var mouseOff = function() {
		d3.select(this)
			.classed("a-dot",false)
			.classed("dots",true);

		d3.selectAll(".guide")
			.remove();
			

		d3.selectAll("circle.dots").filter(function(d) { return isNaN(dataX(d)); })
				.attr({"opacity": 0, "pointer-events":"none"})
				.attr("opacity", 0.85);
	};

//Default chart elements

	//Dots	
	var dotsGroup = svg.append("g")
		.attr({
			id: "dots-group"
		});

	var dotsFilter = dotsGroup.append("defs").append("filter")
			.attr({
				id: "dots-filter",
				x: 0,
				y: 0,
				width: "200%",
				height: "200%"
			});

	var shadowOffset = dotsFilter.append("feOffset")
			.attr({ result: "offOut", in: "SourceGraphic", dx: 20, dy: 20 });
		
	var shadowBlend = dotsFilter.append("feBlend")
			.attr({ in: "SourceGraphic", in2: "offOut", mode: "normal" });

	var dots = d3.select("#dots-group")
		.selectAll("circle")
			.data(worldData,key)
		  	.enter()
			.append("circle")
			.filter(function(d) {return dataX(d); })
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
					//colors inspired by "irredescent sunset" palette: http://www.colourlovers.com/palette/765305/japan9
					if (d.ig == "High income: nonOECD") { return "#FF6E27"; } //yelllow green
					else if (d.ig == "Low income") { return "#991766"; }// yellow
					else if (d.ig == "Upper middle income") { return "#F34739"; } //light teal
					else if (d.ig == "Lower middle income") { return "#D90F5A"; } //blue
					else if (d.ig == "High income: OECD") { return "#FFB627"; } //light pink
					else { return "black"; }
					},
				"stroke": function(d) {
					//colors inspired by "irredescent sunset" palette: http://www.colourlovers.com/palette/765305/japan9
					if (d.ig == "High income: nonOECD") { return "#1A1F1E"; } //night sweat
					else if (d.ig == "Low income") { return "#c5c1b9"; }// also night sweat...
					else if (d.ig == "Upper middle income") { return "#1A1F1E"; } //night sweat
					else if (d.ig == "Lower middle income") { return "#1A1F1E"; } //night sweat
					else if (d.ig == "High income: OECD") { return "#1A1F1E"; } //night sweat
					else { return "black"; }
					},
				"stroke-width": 0,
				"opacity": 0.85
			})
			.style({
				//filter: "url(#dots-filter)"
			})
			.call(dotTips) // http://bit.ly/22HClnd
			//using enter and leave as opposed to over and out because mouseenter and mouesleave don't bubble up to the dots group 
			.on('mouseenter',dotTips.show)
			//for opacity on hover, for some reason two 'mouseenter' listeners doesn't work
			.on('mouseover',mouseOn)
			.on('mouseleave',dotTips.hide)
			.on('mouseout',mouseOff);

			d3.selectAll('circle.dots').filter(function(d) { return typeof dataX(d) != 'number'; }).remove();//filters out nulls


//Call axes

	//X axis
	svg.append("g") 
		.attr({
			class:"xaxis",
			transform: "translate(" + 0 + "," + (h + xaxisShiftY) + ")"
		})
		.call(xAxis); //making the g element (current selection) available to the xAxis function

	// http://bl.ocks.org/phoebebright/3061203

	var xLabel = svg.append("text")
		.attr({
			class: "x-label",
			"text-anchor": "middle",
			transform: function(d) { return "translate(" + (w/2) + "," + (h) + ")"; }
		})
		.text(titleX);

	//Y axis
	svg.append("g") 
		.attr({
			class:"yaxis",
			transform: "translate(" + yaxisShiftX + "," + 0 + ")" 
		})
		.call(yAxis); //making the g element (current selection) available to the xAxis function

	var yLabel = svg.append("text")
		.attr({
			class:"y-label",
			"text-anchor": "middle",
			transform: function(d) { return "translate(" + 10 + "," + (h + xaxisShiftY)/2 + ") rotate(-90)"; }
		})
		.text(titleY);	



//Update data on dropdown select - http://bit.ly/2dFOIho


//Update X
	d3.selectAll(".x-choice").on("click", function() {

		//Update dataX variable
		var xValue = d3.select(this).attr('value');
		console.log(xValue);

		var dataX = function(d) { return eval(xValue); }; //eval to evaluate the string pulled from the HTML element


		//Define X display values
		switch (xValue) {
			case "+d.gini":
				titleX = "Gini Index";
				citeX = "A measure of country level inequality, with 1 being the most unequal sourced from the World Bank's <a href='https://data.worldbank.org/indicator/SI.POV.GINI' target='_blank'>World Development Indicators</a>.";
				break;
			case "+d.press":
				titleX = "Press Freedom";
				citeX = "An annual rating of press freedom at the country level, 1 being the most free, 100 being the least. Sourced from <a href='https://.org/en/ranking' target='_blank'>Reporters Without Borders</a>.";
				break;
			case "+d.mfr":
				titleX = "Population, % Female";
				citeX = "Sourced from the World Bank's <a href='https://data.worldbank.org/indicator/SP.POP.TOTL.FE.ZS' target='_blank'>World Development Indicators</a>.";
				break;
			case "+d.life_exp":
				titleX = "Life Expectancy";
				citeX = "Life expectancy in years sourced from the World Bank's <a href='https://data.worldbank.org/indicator/SP.DYN.LE00.IN' target='_blank'>World Development Indicators</a>.";
				break;
			case "+d.gre":
				titleX = "Female enrollment ratio";
				citeX = "Total enrollment as a percent of the female population, adjusted for age grou. Sourced from the World Bank's <a href='https://data.worldbank.org/indicator/SE.SEC.ENRR.FE' target='_blank'>World Development Indicators</a>.";
				break;
			case "+d.corruption":
				titleX = "Control of Corruption";
				citeX = "An index from -2.5 to 2.5, 2.5 being the most stable, sourced from the Word Bank's <a href='http://databank.worldbank.org/data/databases/control-of-corruption' target='_blank'>World development indicators</a>.";
				break;
			case "+d.polistab":
				titleX = "Political Stability";
				citeX = "An index from -2.5 to 2.5, 2.5 being the most stable, sourced from the Word Bank's <a href='http://databank.worldbank.org/data/reports.aspx?source=world-development-indicators' target='_blank'>World development indicators</a>.";
				break;
			case "+d.gdphead":
				titleX = "GDP per Capita";
				citeX = "GDP / Total Population, sourced from the World Bank's <a href='https://data.worldbank.org/indicator/NY.GDP.PCAP.CD' target='_blank'>World Development Indicators</a>.";
				break;
		}

		//Update xScale
		var xScale = d3.scale.linear()
			.domain([d3.min(worldData,function(d) { return dataX(d); }), d3.max(worldData,function(d) { return dataX(d); })])
			//Using min as min values in our data in some cases are negative
			.range([xaxisShiftX, w])
			.nice();

		//Update dot placement
		d3.select("#dots-group").selectAll("circle")
			.filter(function(d) { return dataX(d); }) //filters out nulls
			.transition()
			.duration(1000)
			.attr({
					cx: function(d) { return xScale(dataX(d)); },
					"opacity": 0.85,
					"pointer-events":"all"
				});
			
		//Hide circles with null data
		d3.selectAll('circle.dots').filter(function(d) { return isNaN(dataX(d)); })
				.transition()
				.duration(1000)
				.attr({"opacity": 0, "pointer-events":"none"});

		//Update x axis
		var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

		//Update x axis label
		xLabel.text(titleX);

		//Update title
		titleText.text(titleX + " vs. " + titleY);

		//Call x axis
		d3.select(".xaxis")
			.transition()
			.duration(1000)
			.call(xAxis);

		//Update tooltip
		dotTips.html(function(d) {
  		  return "<p id='tiphead'>" + d.country  + "</p><p id='region'>" + d.region + "</span></p><p>" + titleX + "<p class='tip-value'>" + dataX(d) + "</p><p>" + titleY + "</p>"
  		   + "<p class='tip-value'>" + dataY(d) + "</p><div id='citation'><div class='citation-title'>" + titleX + "</div><br />" + citeX + "<br /><br /><div class='citation-title'>" + titleY + "</div><br />" + citeY + "</div>";
 		 });		
	});

//Update Y
	d3.selectAll(".y-choice").on("click", function() {

		//Update dataY variable
		var yValue = d3.select(this).attr('value');
		console.log(yValue);

		var dataY = function(d) { return eval(yValue); }; //eval to evaluate the string pulled from the HTML element

		//Define Y display values
		switch (yValue) {
			case "+d.gini":
				titleY = "Gini Index";
				citeY = "A measure of country level inequality, with 1 being the most unequal sourced from the World Bank's <a href='https://data.worldbank.org/indicator/SI.POV.GINI' target='_blank'>World Development Indicators</a>.";
				break;
			case "+d.press":
				titleY = "Press Freedom";
				citeY = "An annual rating of press freedom at the country level, 1 being the most free, 100 being the least. Sourced from <a href='https://.org/en/ranking' target='_blank'>Reporters Without Borders</a>.";
				break;
			case "+d.mfr":
				titleY = "Population, % Female";
				citeY = "Sourced from the World Bank's <a href='https://data.worldbank.org/indicator/SP.POP.TOTL.FE.ZS' target='_blank'>World Development Indicators</a>.";
				break;
			case "+d.life_exp":
				titleY = "Life Expectancy";
				citeY = "Life expectancy in years sourced from the World Bank's <a href='https://data.worldbank.org/indicator/SP.DYN.LE00.IN' target='_blank'>World Development Indicators</a>.";
				break;
			case "+d.gre":
				titleY = "Female enrollment ratio";
				citeY = "Total enrollment as a percent of the female population, adjusted for age grou. Sourced from the World Bank's <a href='https://data.worldbank.org/indicator/SE.SEC.ENRR.FE' target='_blank'>World Development Indicators</a>.";
				break;
			case "+d.corruption":
				titleY = "Control of Corruption";
				citeY = "An index from -2.5 to 2.5, 2.5 being the most stable, sourced from the Word Bank's <a href='http://databank.worldbank.org/data/databases/control-of-corruption' target='_blank'>World development indicators</a>.";
				break;
			case "+d.polistab":
				titleY = "Political Stability";
				citeY = "An index from -2.5 to 2.5, 2.5 being the most stable, sourced from the Word Bank's <a href='http://databank.worldbank.org/data/reports.aspx?source=world-development-indicators' target='_blank'>World development indicators</a>.";
				break;
			case "+d.gdphead":
				titleY = "GDP per Capita";
				citeY = "GDP / Total Population, sourced from the World Bank's <a href='https://data.worldbank.org/indicator/NY.GDP.PCAP.CD' target='_blank'>World Development Indicators</a>.";
				break;
		}

		//Update yScale
		var yScale = d3.scale.linear()
			.domain([d3.max(worldData,function(d) { return dataY(d); }),d3.min(worldData,function(d) { return dataY(d); })])
			.range([0, h + xaxisShiftY])
			.nice();

		//Update dot placement
		d3.select("#dots-group").selectAll("circle")
			.filter(function(d) { return dataY(d); }) //filters out nulls
			.transition()
			.duration(1000)
			.attr({
					cy: function(d) { return yScale(dataY(d)); },
					"opacity": 0.85,
					"pointer-events":"all"
				});

		//Hide circles with null data
		d3.selectAll('circle.dots').filter(function(d) { return isNaN(dataY(d)); })
				.transition()
				.duration(1000)
				.attr({"opacity": 0, "pointer-events":"none"});

		//Update y axis
		var yAxis = d3.svg.axis().scale(yScale).orient("left");

		//Update y axis label
		yLabel.text(titleY);

		//Update title
		titleText.text(titleX + " vs. " + titleY);

		//Call y axis
		d3.select(".yaxis")
			.transition()
			.duration(1000)
			.call(yAxis);
		//Update tooltip
		dotTips.html(function(d) {
  		  return "<p id='tiphead'>" + d.country  + "</p><p id='region'>" + d.region + "</span></p><p>" + titleX + "<p class='tip-value'>" + dataX(d) + "</p><p>" + titleY + "</p>"
  		   + "<p class='tip-value'>" + dataY(d) + "</p><div id='citation'><div class='citation-title'>" + titleX + "</div><br />" + citeX + "<br /><br /><div class='citation-title'>" + titleY + "</div><br />" + citeY + "</div>";
 		 });
	});




});
