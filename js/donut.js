//General use variables
	
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	margin = {top: 10, right: 20, bottom: 20, left: 60},
		w = parseInt(d3.select('#donut-div').style('width'), 10),//Get width of containing div for responsiveness
		w = w - margin.left - margin.right,
		h = parseInt(d3.select('#donut-div').style('height'),10),
		h = h - margin.top - margin.bottom,
		radius = Math.min(w, h) / 2;


	
//Transitions
	var tipDuration = 200;

//Begin data function 
d3.csv("/8step.io/production_data/ctc_data/divisions.csv",function(error,data) {
			
	if(error) {
		console.log(error);
	} else {
		console.log(data);
	}


//Key dataset-dependent variables

	//Data and key functions
	var projectData = data;
	// var	key = function(d,i) {
	// 	return d.year; //Binding row ID to year
	// };


//Holder variable for data selection
var donutData = function(d) { return +d.project_share; };
	
//Set up the canvas
	var svg = d3.select("#donut-div")
		.append("svg")
		.attr("width", w + margin.left + margin.right)
		.attr("height",h + margin.top + margin.bottom)
		.attr("id","canvas")
		.append("g") //This g element and it attributes also following bstok's margin convention. It holds all the canvas' elements.
			.attr("transform", "translate(" + ((w / 2) + margin.left)  + "," + ((h / 2) + margin.top) + ")");

//Tooltips - http://bl.ocks.org/d3noob/a22c42db65eb00d4e369

	//Donut tooltip
	var donutTip = d3.select("body").append("div")	
    .attr("class", "tooltip donut-tip")				
    .style("opacity", 0);


	//Oridinal color scheme
	var color = d3.scaleOrdinal()
	    .range(["#FBAF43", "#198F90", "#9E004D", "#F1594E", "#9BD19D"]);
		

	//Arc and pie functions
	var arcDef = d3.arc()
	    .outerRadius(radius - 10)
	    .innerRadius(radius - 80);

	var pie = d3.pie()
	    .sort(null)
	    .value(function(d) { return +d.project_share; });

	//Draw arc
	var arc = svg.selectAll(".arc")
      	.data(pie(projectData))
    	.enter()
    	.append("g")
      	.attr("class", "arc");

     //Fill arc with path?
    var arcPath = arc.append("path")
      .attr("d", arcDef)
      .attr("class","arc-path")
      .style("fill", function(d) { return color(d.data.division_clean); });
	
	//Pie labels
	var donutLabels = arc.append("text")
      .attr("transform", function(d) { return "translate(" + arcDef.centroid(d) + ")"; })
      .attr("dy", "0.35em")
      .text(function(d) { return d.data.division_clean; });


	//Show tooltips	

	arcPath.on("mouseover",function(d) {
			donutTip.transition()
				.duration(tipDuration)
				.style("opacity",0.8);

			donutTip.html("<div class='title-display'>" + d.data.division_display + ", FY17</div><br /><div class = data-display>Total Projects: " + d.data.projects +"<br />Total Revenue: $" + d3.format(',')(+d.data.revenue) +  "</div>")
				.style("left", "18em") 
				.style("top", "2em");
		})
		.on("mouseout",function(d) {
			donutTip.transition()
				.duration(tipDuration)
				.style("opacity",0);
		});




});
