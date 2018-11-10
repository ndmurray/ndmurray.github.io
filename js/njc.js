//Content to load on document ready
$(document).ready(function() {

	//Fade in the text above the fold
	$('.fade-initial').animate({'opacity':'1'},1500);

   	//Load the bar chart
	loadData();
});

//Content to load on scroll
//Inspired by: https://codepen.io/annalarson/pen/GesqK
jQuery(window).scroll(function(){

	//Fade elements on scroll
    $('.fade').each( function(i){
        
        var bottom_of_object = $(this).position().top + $(this).outerHeight();
        var bottom_of_window = $(window).scrollTop() + $(window).height();
        
        /* If the object is completely visible in the window, fade it it */
        if( bottom_of_window > bottom_of_object ){
            
            $(this).animate({'opacity':'1'},500);

        }
            
   }); 


    //Load elements on scroll, only goes for sunburst chart
        
        var bottom_of_object = $('#sunburst-chart').position().top + $('#sunburst-chart').outerHeight(); 
        var bottom_of_window = $(window).scrollTop() + $(window).height();
        
        /* If the object is completely visible in the window, fade it it */
        if( bottom_of_window > bottom_of_object ){
            
            	//Sunburst (nested) data
            	var sunData = {
				    "name": "GROUPS", "children": [
				    // {
				    //     "name": "Violent",
				    //     "children": [{"name": "white", "size": 2.29}, {"name": "black", "size": 2.85}, {"name": "hispanic", "size": 1.62}]
				    // }, 

				    //CRIME FIRST VERSION
				    // {
				    //     "name": "Property",
				    //     "children": [{"name": "white", "size": 1.09}, {"name": "black", "size": 0.78}, {"name": "hispanic", "size": 0.38}]
				    // }, 
				    // {
				    //     "name": "Drug",
				    //     "children": [{"name": "white", "size": .673}, {"name": "black", "size": .918}, {"name": "hispanic", "size": .478}]
				    // }, 
				    // {
				    //     "name": "Public Order",
				    //     "children": [{"name": "white", "size": .548}, {"name": "black", "size": .505}, {"name": "hispanic", "size": .323}]
				    // },
				    //RACE FIRST VERSION
				    {
				        "name": "White",
				        "children": [{"name": "Drug", "size": 0.673}, {"name": "Public order", "size": 0.548}, {"name": "Property", "size": 1.09} ]
				    }, 
				    {
				        "name": "Hispanic",
				        "children": [{"name": "Property", "size": .383}, {"name": "Drug", "size": .475}, {"name": "Public order", "size": .323}]
				    },
				    {
				        "name": "Black",
				        "children": [{"name": "Public order", "size": .505}, {"name": "Property", "size": .782},{"name": "Drug", "size": .918}]
				    } 
				  ]
				};

				sunBurst(sunData);
				// $('#sunburst-chart').empty();
                
        }
            

       
});



//Swag me out, with jet pack we usin f - search d3.f here:: 
var f = d3.f;

function loadData() {

	//Bar chart (drug use) data
	d3.csv('production_data/njc_data/drug_use.csv', function(d) {
		
		barData = d;
		vizBar(barData);

	});

	//Time series data
	d3.csv('production_data/njc_data/time_series.csv', function(d) {
		
		//Parse and format date functions
		var parseDate = d3.timeParse("%Y");
		var formatTime = d3.timeFormat("%Y");

		lineData = d;
		lineData.year = parseDate(lineData.year);
		lineData.black = +lineData.black;
		lineData.white = +lineData.white;

		vizLine(lineData);

	});

}

//Bar chart
function vizBar(barData) {

	//Margin, scales, and canvas
	var margin = { top: 20, right: 20, bottom: 20, left: 20 },
        width = $('#bar-chart').width(),
        height = $('#bar-chart').height(),
        width = width - margin.left - margin.right,
        height = height - margin.top - margin.bottom;

    var yScale = d3.scaleBand()
    	.domain(barData.map(f('race')))
    	.range([ height, 0])
    	.padding(0.1);

    var xScale = d3.scaleLinear()
    	.domain([0, d3.max(barData, f('value'))])
    	.range([0, width]);

    //300 flames of love: https://www.colourlovers.com/palette/2072539/300_Flames_of_Love
    var cScale = d3.scaleOrdinal()
    	.domain('white','black','other','asian')
    	.range(['#880606', '#FF8207', '#D53D0C', '#231D1E'])

    var svg = d3.select('#bar-chart').append('svg')
   		.at('id','bar-svg')
   		.at('width', width + margin.left + margin.right)
   		.at('height', height + margin.top + margin.bottom)
   		.append('g')
   			.attr("transform",
        	"translate(" + margin.left + "," + margin.top + ")");

    //Bar chart and axes
    svg.selectAll('.bar')
   		.data(barData)
   		.enter()
   		.append('rect')
   		.at({'class': 'bar',
   			 'fill': function(d) {return cScale(d.race);  },
   			 'height': yScale.bandwidth(),
   			 'x': 0,
   			 'y': function(d) { return yScale(d.race); }
   		})
   		.transition()
   		.duration(1000)
   		.at('width', function(d) { return xScale(+d.value) })

   	$('.bar').addId

   	//Chart lables
   	svg.selectAll('text.bar-label')
   		.data(barData)
   		.enter()
   		.append('text')
   		.text(function(d) { return d.race + " - " + (d3.format('.1%'))(+d.value); })
   		.at('class', 'bar-label')
   		.at('fill', 'white')
   		.at('y', function(d) { return yScale(d.race) + 35 })
   		.at('x', 10)
   		.at('width', function(d) { return xScale(+d.value); })
   		.at('text-anchor', 'start');

  

} 


//Sunburst chart, inspired by: https://bl.ocks.org/denjn5/e1cdbbe586ac31747b4a304f8f86efa5
function sunBurst(sunData) {

	//Margin
	var margin = { top: 0, right: 0, bottom: 0, left: 0 },
        w = $('#sunburst-chart').width(),
        h = $('#sunburst-chart').height(),
        w = w - margin.left - margin.right,
        h = h - margin.top - margin.bottom;

    //Default variables
    var radius = (Math.min(w, h) / 2);
    var colorScale = d3.scaleOrdinal()
    	// .domain('white','black','hispanic')
    	.range(['#231D1E', '#880606', '#D53D0C'] );

    

    //x and y for text placement
    var x = d3.scaleLinear().range([0, 2 * Math.PI]),
   		y = d3.scaleLinear().range([0, radius]); //scaleSqrt

    //Canvas
   	var svg = d3.select('#sunburst-chart').append('svg')
   		.at({'id':'sun-svg',
   			 'width': w + margin.left + margin.right,
   			 'height': h + margin.top + margin.bottom});
   	var g = svg.append('g')
   			.at("transform", //move it to the center of the canvas
        	"translate(" + (w/2) + "," + (h/2) + ")")

    //Structure data so that it fits in circular layout
    var partition = d3.partition()
    	.size([2 * Math.PI, radius]);

   	//Define root node for sunburst hierarchy
   	var root = d3.hierarchy(sunData) //JSON is strucutred in a way that lends to just feeding it the dataset (we have a dummy root node called GROUPS)
   		.sum(f('size')); //Size is most granular leaf in the tree

   	//Define the chart arcs
   	partition(root); //Combines data structure (partition) with actual data (root)
   	//calling partition on root will give the data the attribures, x0, x1, etc, that we need to define the arcs
   	//Calculate arc sizes
   	var arc = d3.arc()
   		.startAngle(function (d) { return d.x0})
        .endAngle(function (d) { return d.x1})
        .innerRadius(function (d) { return d.y0 })
        .outerRadius(function (d) { return d.y1 });

    //Draw the arcs
    g.selectAll('path.arc-path')//Drawing these a bit later in the chain
    	.data(root.descendants()) //The members of our JSON hierarchial data object
    	.enter()
    	.append('g')//Groping each arc path in g to facilitate adding text
    	.at('class','arc-node')
    	.append('path').at('class', function(d) {return 'arc-path ' + d.data.name})
    	.at('display',  function (d) { return d.depth ? null : "none"; }) //Hide the root node so we get a nice donut not pie
    	// .at('d', arc) - comment this out as the transition function later in the chain does the smooth transitional rendering, comment this in if you want it back to static
    	.attr('fill',  function (d) { return colorScale((d.children ? d : d.parent).data.name); })
    	//Fill based on the nested names in the JSON hierarchial data object
    	.transition()
 			.duration(1000)
 			.attrTween("d", function (d, i) {
      			return arcTweenPath(d, i);
      		})

    //Hack the arc slice colors

    $('.arc-node:nth-child(5) > .arc-path').attr('fill','#AA1F26');
    $('.arc-node:nth-child(6) > .arc-path').attr('fill','#AA1F26');
    $('.arc-node:nth-child(7) > .arc-path').attr('fill','#AA1F26');
    $('.arc-node:nth-child(8) > .arc-path').attr('fill','#ef501c');
    $('.arc-node:nth-child(9) > .arc-path').attr('fill','#ef501c');
    $('.arc-node:nth-child(10) > .arc-path').attr('fill','#ef501c');
    $('.arc-node:nth-child(11) > .arc-path').attr('fill','#473B3E');
    $('.arc-node:nth-child(12) > .arc-path').attr('fill','#473B3E');
    $('.arc-node:nth-child(13) > .arc-path').attr('fill','#473B3E');


    //Red - #880606
    	//Light red - #AA1F26
    	//Orange - #D53D0C
    	//Light orange - #EF4830
    	//Black - #231D1E
    	//Light black - #473B3E

    //Add the arc text
    g.selectAll('.arc-node')
    	.append('text')
    	.at("transform", function(d) {
        return "translate(" + arc.centroid(d) + ")rotate(" + computeTextRotation(d) + ")"; }) 
    	.at("dx", "0")  
    	.at("dy", "0.4em")  
    	.at('opacity', 0)
    	.at('class','node-text')
    	.at('text-anchor','middle')
    	.text(function(d) { return d.parent ? d.data.name : "" })
    	.transition()
    	.delay(1000)
    	.at('opacity', 1);
    	// .transition() //leaving out the text tweet for now
    	// 	.duration(1000)
    	// 	.attrTween("transform", function (d, i) { return arcTweenText(d, i); })
     //  			.at('text-anchor', function (d) { return d.textAngle > 180 ? "start" : "end"; })
     //  			.at("dx", function (d) { return d.textAngle > 180 ? -13 : 13; })
     //  			.at("opacity", function (e) { return e.x1 - e.x0 > 0.01 ? 1 : 0; })


     //Highlight related arcs
     d3.selectAll('.Property').on('mouseover', function(d) {
     	d3.selectAll('.arc-path').attr('opacity',0.25)
     	d3.selectAll('.Property').attr('opacity',1);
     	d3.select('.Black').attr('opacity', 1);
     	d3.select('.Hispanic').attr('opacity', 1);
     	d3.select('.White').attr('opacity', 1);
     }).on('mouseout', function(d) {
     	d3.selectAll('.arc-path').attr('opacity', 1);
     });

     d3.selectAll('.Drug').on('mouseover', function(d) {
     	d3.selectAll('.arc-path').attr('opacity',0.25)
     	d3.selectAll('.Drug').attr('opacity',1);
     	d3.select('.Black').attr('opacity', 1);
     	d3.select('.Hispanic').attr('opacity', 1);
     	d3.select('.White').attr('opacity', 1);
     }).on('mouseout', function(d) {
     	d3.selectAll('.arc-path').attr('opacity', 1);
     });

     d3.selectAll('.Public').on('mouseover', function(d) {
     	d3.selectAll('.arc-path').attr('opacity',0.25)
     	d3.selectAll('.Public').attr('opacity',1);
     	d3.select('.Black').attr('opacity', 1);
     	d3.select('.Hispanic').attr('opacity', 1);
     	d3.select('.White').attr('opacity', 1);
     }).on('mouseout', function(d) {
     	d3.selectAll('.arc-path').attr('opacity', 1);
     });


    //Text rotation calculator - not currently using
    function computeTextRotation(d) {
    	var angle = (d.x0 + d.x1) / Math.PI * 90;  // <-- 1

    	// Avoid upside-down labels
   		// return (angle < 90 || angle > 270) ? angle : angle + 180;  // <--2 "labels aligned with slices"

    	// Alternate label formatting
    	return (angle < 180) ? angle - 90 : angle + 90;  // <-- 3 "labels as spokes"
	}
    	
	//ArcTween transition functions, inspired by: http://bl.ocks.org/denjn5/00a57e89c67906897b6eede56219170e

  	// When switching data: interpolate the arcs in data space.
	function arcTweenPath(a, i) {

		var node = function(d) { return d; };
		// (a.x0s ? a.x0s : 0) -- grab the prev saved x0 or set to 0 (for 1st time through)
		// avoids the stash() and allows the sunburst to grow into being
		var oi = d3.interpolate({ x0: (a.x0s ? a.x0s : 0), x1: (a.x1s ? a.x1s : 0), y0: (a.y0s ? a.y0s : 0), y1: (a.y1s ? a.y1s : 0) }, a);
		function tween(t) {
		  var b = oi(t);
		  a.x0s = b.x0;
		  a.x1s = b.x1;
		  a.y0s = b.y0;
		  a.y1s = b.y1;
		  return arc(b);
		}
		if (i == 0 && node) {  // If we are on the first arc, adjust the x domain to match the root node at the current zoom level.
		  var xd = d3.interpolate(x.domain(), [node.x0, node.x1]);
		  var yd = d3.interpolate(y.domain(), [node.y0, 1]);
		  var yr = d3.interpolate(y.range(), [node.y0 ? 40 : 0, radius]);

		  return function (t) {
		    x.domain(xd(t));
		    y.domain(yd(t)).range(yr(t));
		    return tween(t);
		  };
		} else {
	  		return tween;
		}
	}


	//Arc text transition function
	function arcTweenText(a, i) {

	    var oi = d3.interpolate({ x0: (a.x0s ? a.x0s : 0), x1: (a.x1s ? a.x1s : 0), y0: (a.y0s ? a.y0s : 0), y1: (a.y1s ? a.y1s : 0) }, a);
	    function tween(t) {
	      var b = oi(t);
	      var ang = ((x((b.x0 + b.x1) / 2) - Math.PI / 2) / Math.PI * 180);
	      b.textAngle = (ang > 90) ? 180 + ang : ang;
	      a.centroid = arc.centroid(b);
	      //b.opacity = (b.x1 - b.x0) > 0.01 ? 0 : 0;
	      //console.log(b.data.name + " x1:" + b.x1 + " x0:" + b.x0);
	      return "translate(" + arc.centroid(b) + ")rotate(" + b.textAngle + ")";
	    }
	    return tween;
  	}


}

//"You draw it" time series, inspired by: https://bl.ocks.org/1wheel/07d9040c3422dac16bd5be741433ff1e
function vizLine(lineData) {

	//Margin
	var margin = { top: 20, right: 60, bottom: 60, left: 60 },
        w = $('#line-chart').width(),
        h = $('#line-chart').height(),
        w = w - margin.left - margin.right,
        h = h - margin.top - margin.bottom;

	//Scales
	var xScale = d3.scaleTime()
		.domain(d3.extent(lineData, f('year')))
		.range([0, w]);

	//Using fixed domain of 6% for emotional effect
	var yScale = d3.scaleLinear()
		.domain([0, 0.06])
		.range([h, 0]);


	var cScale = d3.scaleOrdinal()
    	.domain(['Total','White','Your Guess','Black'])
    	.range(['#D53D0C','#880606','#FF8207','#231D1E'])

   	//Canvas
   	var svg = d3.select('#line-chart').append('svg')
   		.attr('id','line-svg')
   		.attr('width', w + margin.left + margin.right)
   		.attr('height', h + margin.top + margin.bottom)
   		.append('g')
   			.attr("transform",
        	"translate(" + margin.left + "," + margin.top + ")");

    //Backgroung rect
   	svg.append('rect')
   		.attr('id','background-rect')
   		.attr('width', w)
   		.attr('height', h);
   		// .attr('x', -margin.left)
   		// .attr('y', -margin.top)

    //Transparent rect overlay, for drawing magic
    //using fancy d3-jetpack .at method, it's the same as .attr
    svg.append('rect').at({'width': w, 'height': h, 'opacity': 0});

    //Draw the line using the d3 area method - https://github.com/d3/d3-shape
    //fancy 
    var blackLine = d3.area()
    	.x(f('year',xScale))
    	.y(f('black',yScale));

    var blackLineArea = d3.area()
    	.x(f('year',xScale))
    	.y0(f('black',yScale))
    	.y1(f('total',yScale));

   	//Cliping mask for line drawing
   	// - will be width of canvas bc user will draw the whole line
   	//Comment this out to see what the line looks like before drawing
   	var clipRect = svg.append('clipPath#clip')
   		.append('rect')
   		.at({'width': 0, 'height': h});

   	//Add the clipping path that will reveal the real line
   	var correctSel = svg.append('g').attr('clip-path', 'url(#clip)');

   	//Add the black line and area
   	correctSel.append('path.black-line').at({d: blackLine(lineData)});
   	correctSel.append('path.area').at({d: blackLineArea(lineData)});

   	//Add the user-drawn line
   	var yourDataSel = svg.append('path.your-line');

	//Define user-drawn data
	yourData = lineData
		.map(function(d){ return {year: d.year, black: d.black, defined: 0} })
		.filter(function(d){
		    if (d.year == 1978) d.defined = true
		    return d.year >= 1978
		});

	//Drag functionality - clamp is jetpack shorthand for max/min, defined at the bottom of this file
	var completed = false;

	var drag = d3.drag()
 		.on('drag', function() {
    		var pos = d3.mouse(this);
    		var year = clamp(1978, 2011, xScale.invert(pos[0]));
    		var black = clamp(0, yScale.domain()[1], yScale.invert(pos[1]))

    		yourData.forEach(function(d){
      			if (Math.abs(d.year - year) < .5) {
        			d.black = black;
        			d.defined = true;
      			}
   			});

   			yourDataSel.at({d: blackLine.defined(f('defined'))(yourData)})

    		if (!completed && d3.mean(yourData, f('defined')) == 1) {
      			completed = true
      			clipRect.transition().duration(1000).attr('width', xScale(2011));
    		}

    		console.log(yourData)

   		});

 	//Call drag interactivity
   	svg.call(drag);

   	//Static lines - white and total pop
   	var whiteLine = d3.area()
    	.x(f('year',xScale))
    	.y(f('white',yScale));

    svg.append('path.white-line')
    	.at({d: whiteLine(lineData)})
    	.transition()
    	.duration(1000);

    var totalLine = d3.area()
    	.x(f('year',xScale))
    	.y(f('total',yScale));

    svg.append('path.total-line').at({d: totalLine(lineData)});

    //Legend: https://d3-legend.susielu.com/#color-ordinal
    svg.append("g")
    	.attr("class", "legendOrdinal")
    	.attr("transform", "translate(20,20)");

    var legendOrdinal = d3.legendColor()
    	.shape('square')
    	.useClass(false)
    	// .orient('horizontal')
    	.scale(cScale)

    svg.select('g.legendOrdinal')
    	.call(legendOrdinal);


   	//Shorthand clamp function
   	function clamp(a, b, c){ return Math.max(a, Math.min(b, c)) }

   	//Define axes
   	var xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format(".0f"));

	var yAxis = d3.axisLeft().scale(yScale).tickFormat(d3.format(".0%"));

	//Call the axes

	//X axis group
	svg.append("g")
		.attr("class","axis x-axis")
		.attr("transform","translate(0," + h + ")")
		.call(xAxis);

	d3.selectAll('.x-axis text')
		.attr("transform","rotate(-45)")
		.attr("text-anchor","end");

	//Y axis group
	svg.append("g")
		.attr("class","axis y-axis")
		.call(yAxis.ticks(3));

	
}

