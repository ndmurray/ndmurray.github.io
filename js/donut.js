//BEGIN DONUT

//General use variables
	
	//Canvas margin, height, and width by Bostock's margin convention http://bl.ocks.org/mbostock/3019563
	var	donutMargin = {top: 10, right: 60, bottom: 20, left: 60},
		w = parseInt(d3.select('#donut-div').style('width'), 10),//Get width of containing div for responsiveness
		w = w - donutMargin.left - donutMargin.right,
		h = parseInt(d3.select('#donut-div').style('height'),10),
		h = h - donutMargin.top - donutMargin.bottom,
		//Radius for donut
		radius = Math.min(w, h) / 2,
		labelRadius = w/2 + 8;

		//Transitions
		var tipDuration = 200;
		var donutDuration = 600;

//Begin data function 
d3.csv("/8step.io/production_data/ctc_data/divisions.csv",function(error,data) {
			
	if(error) {
		console.log(error);
	} else {
		console.log(data);
	}


//Key dataset-dependent variables

	//Data and key functions
	var donutData = data;
	// var	key = function(d,i) {
	// 	return d.year; //Binding row ID to year
	// };


//Holder variable for data selection
var arcData = function(d) { return +d.avg_revenue; };
	
//Set up the canvas
	var svg = d3.select("#donut-div")
		.append("svg")
		.attr("width", w + donutMargin.left + donutMargin.right)
		.attr("height",h + donutMargin.top + donutMargin.bottom)
		.attr("id","canvas")
		.append("g") //This g element and it attributes also following bstok's margin convention. It holds all the canvas' elements.
			.attr("transform", "translate(" + ((w / 2) + donutMargin.left)  + "," + ((h / 2) + donutMargin.top) + ")");

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

	var arcDefLabel = d3.arc()
		.outerRadius(radius + 40)
		.innerRadius(radius);

	var pie = d3.pie()
	    .sort(null)
	    .value(function(d) { return arcData(d); });

	//Draw arc group that holds the arc path
	var arc = svg.selectAll(".arc")
      	.data(pie(donutData))
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
	//Native 8step method: Plae labels on centroid of "arcDefLabel" the definintion of a larger invisible set of arts
		.attr("transform", function(d) { return "translate(" + arcDefLabel.centroid(d) + ")"; })
	  //DEPRECATED - labels on outside of pie - http://stackoverflow.com/questions/8053424/label-outside-arc-pie-chart-d3-js
      // .attr("transform", function(d) { 
      // 		var c = arcDef.centroid(d),
      // 			x = c[0], //centriod is array of x and y
      // 			y = c[1],
      // 			//pythagoras for hypotenuse
      // 			h = Math.sqrt(x*x + y*y);
      // 		return "translate(" + (x/h * labelRadius) + "," + (y/h * labelRadius) + ")"; })
      .attr("fill","white")
      .attr("class", "arc-label")
      //this puts labels at uniform distance away from donut per the stack overflow link above, although I don't quite understand how it works
      .attr("text-anchor", function (d) {
      			return (d.endAngle + d.startAngle)/2 > Math.PI ?
      					"end" : "start";
      })
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
	d3.selectAll(".m-choice").on("change",function() {

		//Update data variable
		var arcValue = d3.select(this).attr('value');
		var arcData = function(d) {return eval(arcValue); };
		
		//Update elements, from - http://bl.ocks.org/mbostock/1346410
		pie.value(function(d) { return arcData(d); }); // the data driving pie layou
		arcPath.data(pie(donutData));// compute the new angles
		arcPath.transition().duration(donutDuration).attrTween("d",arcTween);

		//Redraw labels

		d3.selectAll(".arc-label")
			.data(pie(donutData))
			.transition().duration(donutDuration)
			.attr("transform", function(d) { return "translate(" + arcDefLabel.centroid(d) +")"; }) 
			//this puts labels at uniform distance away from donut per the deprecated stack overflow link in original label definition, although I don't quite understand how it works
	      	.attr("text-anchor", function (d) {
      					return (d.endAngle + d.startAngle)/2 > Math.PI ?
		      					"end" : "start";
		     })
		    .text(function(d) { return d.data.division_clean; });
		    	    
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


