//General use variables
	
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	margin = {top: 10, right: 20, bottom: 20, left: 60},
		w = parseInt(d3.select('#donut-div').style('width'), 10),//Get width of containing div for responsiveness
		w = w - margin.left - margin.right,
		h = parseInt(d3.select('#donut-div').style('height'),10),
		h = h - margin.top - margin.bottom,
		//Radius for donut
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
var donutData = function(d) { return +d.avg_revenue; };
	
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
	    .value(function(d) { return donutData(d); });

	//Draw arc group that holds the arc path
	var arc = svg.selectAll(".arc")
      	.data(pie(projectData))
    	.enter()
    	.append("g")
      	.attr("class", "arc");

     //Fill arc with path?
    var arcPath = arc.append("path")
      .attr("d", arcDef)
      .attr("class","arc-path")
      .style("fill", function(d) { return color(d.data.division_clean); })
      .each(function(d) { this._current = d; }); // store the initial angles, for transition
	
	//Pie labels
	var donutLabels = arc.append("text")
	//Placing labels outside of chart by redefining the radii of our arcDefinition, bu only within the scope of this labelling function (the radius of the arcs themselves doesn't actually change)
	//http://bl.ocks.org/Guerino1/2295263
      .attr("transform", function(d) { 
      		d.outerRadius = radius + 500;
      		d.innerRadius = radius + 495;
      		return "translate(" + arcDef.centroid(d) + ")"; })
      .attr("fill","white")
      .text(function(d) { return d.data.division_clean; });


	//Show tooltips	

	arcPath.on("mouseover",function(d) {
			donutTip.transition()
				.duration(tipDuration)
				.style("opacity",1);

			donutTip.html("<div class='title-display'>" + d.data.division_display + ", FY17</div><br /><div class = data-display>Total Projects: " + d.data.projects +"<br />Total Revenue: $" + d3.format(',')(+d.data.revenue) +  "</div>")
				.style("left", "18em") 
				.style("top", "2em");
		})
		.on("mouseout",function(d) {
			donutTip.transition()
				.duration(tipDuration)
				.style("opacity",0);
		});

//Update donut!
	d3.selectAll(".m-choice").on("click",function() {

		//Update data variable
		var donutValue = d3.select(this).attr('value');
		var donutData = function(d) {return eval(donutValue); };
		console.log(donutValue);
		console.log(donutData);
		
		//Update elements, from - http://bl.ocks.org/mbostock/1346410
		pie.value(function(d) { return donutData(d); }); // the data driving pie
		arcPath.data(pie(projectData));// compute the new angles
		arcPath.transition().duration(600).attrTween("d",arcTween);

		//Redraw labels

	});

	//Tween function for smooth transition, also from Bostock
	// Store the displayed angles in _current.
	// Then, interpolate from _current to the new angles.
		// During the transition, _current is updated in-place by d3.interpolate.
	function arcTween(a) {
	  var i = d3.interpolate(this._current, a);
	  this._current = i(0);
	  return function(t) {
	    return arcDef(i(t));
	  };
	}

});
