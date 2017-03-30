
//Zoom Part 3: FAQ - https://www.dashingd3js.com/lessons/important-d3-zoom-faq

//Notice how in zoom part two you can only zoom on the that are children on innerSpace, nothing else, like the svg for example

//Fix this by adding an svg rect that covers the whole canvas, as a child to the inner space element. This will make everything zoom/pan when you select empty space as well  (code in his example)



// DIGRESSION Example of selections from zoom part 2 - 

originalCircle = {"cx": 100, "cy": 100, "radius": 20},

var circle = innerSpace.selectAll("circle")
  .data([originalCircle]) //**
  .enter().append("circle")
    .attr("cx", function(d) { return xAxisScale(d.cx); })
    .attr("cy", function(d) { return yAxisScale(d.cy); })
    .attr("r",  function(d) { return d.radius; })
    .style("fill", "green");


//Zoom part 2  https://www.dashingd3js.com/lessons/d3-zoom-behavior-part-two

//So, all together

//zoom gets called on the container group within the svg from Botosk's margin convention. 
var innerSpace = svg.append("g")
	.attr("class","inner-space")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	.call(zoom);//***The important part, call zoom on the container group

var zoom = d3.behavior.zoom()
	.x(xScale)
	.y(yScale)
	.scaleExtent([0.2, 10])
	.on ("zoom", zoomFunction); //Notice not zoomFunction(), b/c zoomFunction is a named function and not a function expression e.g. var foo = function () {}; 

	//Named fucntions are hoisted and so therefore can be called ahead of their declaration in the code

//NM annotated version of DashingD3's example: zoom on scatterplot. This is an example of the function that runs in .on("zoom",function(){});

function zoomFunction() {
  
    // Select All Circles
    //NM the circles are now the selection, you'll see below their properteies can be accessed with function(d) { d.property }
    var circles = d3.select("svg").selectAll("circle");

    // Pan Vector
    //NM Getting variables to pass to the html readout
    var panVector = d3.event.translate;
    var panX = panVector[0];
    var panY = panVector[1];

    // Scaling Multiplier
    //NM for radius, we multiple the radius by the current zoom scale (e.g. as zoom scale doubles, radius doubles) 
    var scaleMultiplier = d3.event.scale;

    // Tell us in HTML what is going on
    d3.select("#pan_x_span").text(panX);
    d3.select("#pan_y_span").text(panY);
    d3.select("#v_scale_val").text(scaleMultiplier);

    // Redraw the Axis
    //NM innerSpace is just the group from bostok's margin convention
    innerSpace.select(".x.axis").call(xAxis);
    innerSpace.select(".y.axis").call(yAxis);

    // Redraw the Circle
    //NM Notice ciricle attribles called as d.cx, for example
    circles
        .attr("cx", function(d, i) { return xAxisScale(d.cx); })
        .attr("cy", function(d, i) { return yAxisScale(d.cy); })
        .attr("r",  function(d, i) { return (d.radius * scaleMultiplier); });    
}

//Binding to the zoom event

zoom.on("zoom", function() { //will only be on "zoom", although "drag has more properties"
//d3 has two properties built into this "zoom" listener
	d3.event.scale //current zoom scale of the canvas
	d3.event.translate //a js array with x and y posisitions as it's elemnts, e.g. [x, y] 


});

//"types" includes "zoom" it's the only one





//Zoom behavior part 1 - https://www.dashingd3js.com/lessons/d3-zoom-behavior-part-one

var zoom = d3.behavior.zoom() //The event listener with an ear to zoom events, includes mouse and touch pinch. Also includes panning
//IN reality, you can't really zoom without panning to make sure your zoom point stays in the picture
//Listens for finger and mouse zoom, and doubleclick to zoom (doubleclick DOES NOT zoom out)
//Remember that mousewheel event varies by user depending on their mouse configuration

var zoom = d3.behavior.zoom()
	.x(xScale)
	.y(yScale) //rescale your axes wtih zoom

	.scale(1) //Default
	.scale(2) //2x the default view
	//Scale cannot be negative!

	.scaleExtent([minValue,maxValue]) //Limit the extent to which the user can zoom
	//Works like regular old d3.extent()






//Dashing D3.js - D3 Transition Basics - http://bit.ly/2mZNKzk

//Why transitions don't work if you don't use a quantitative value

//d3.transition is really d3.interpolate(a,b) (transition from state a to state be)
//d3.transitino first checks if a,b is a number, then color (rgb string), then geometries, then simply strings with embedded numbers (e.g. 'font-size: 12px;')
//these two values must have intermediate values if you want things like fade transitions to work, hence your
//use of opacity being the only way you've been able to apply duration to text transitions



//Dashing D3.js - Data Manipulation

//(1) Anonymous vs named functions

/*named function: You can name a function so that it can be called later with*/

function heyfunc(x) { return x * 2;}
heyFunc(10); //will evaluate

//Assigning a function to a variable is not technically a named function, but assinging an anonymous function to a variable

var lineFunc = function(d) { return yScale(d); }

//you can invoke anonymous functions on the spot by using parens at the end to pass them values.

( function(x) { return x * 2;} )(2)
//evaluates to 2

//(2) JS Anonymous functions, assignment to variable

var lineFunc = function(d) { return yScale(d);} 

//lineFunc isn't the name of the function, it's the variable that stores the function's syntax

//The only difference being that you can pass lineFunc parameters as if it were a named function

//(3) JS Anonymous functions, passed as a paramater. 

//Most commonly seen in assigning properties and manipulating data arrays

d3.selctAll(".dots")
	.attr("cx",function(d) { return xScale(d.date); });

//Or

[1, 2, 3, 4, 5].map( function(x) { return x * 2;} );

//(4) JS function declaration veresus JS function operator

//Aka, named functions vs functions assigned to variables

//This is important as it determines how the browser executes the function

//JS function declaration 

function bareBack(x) { return x * 2;}

//JS function Expression 

var slapJack = function (x) { return x * 2; };

//This is storing an anonymous function in a variable.

//Also known as using the js 'function operator' to create the anonymous function 

//(X) More on function delcarations and expressions - https://javascriptweblog.wordpress.com/2010/07/06/function-declarations-vs-function-expressions/

//Function declarations

function bareBack(x) { return x * 2;}

//Cannot be nested in non-function blocks, think of them as siblings to variable declarations. Like, "function" instead of "var"

//It's visible within it's own scope, and the scope of it's parent

//Because it's visible to the scope of its parent it gets 'hoisted'

//'hoisted being lifted up to the top of the highest scope that recognizes them'

//Function expressions 

//Can be anonymous functions
var slapJack = function (x) { return x * 2; };

//Or named
var wetFlaps = function hotLather(x) { return x * 2; };

//Difference here is tha the function name is not visible outside its own scope, unlike function declaration

//Hoisting and function expressions

//in te slapJack example above, the variable itself, slapJack, is hosted tothe top of its scope, but it's assignemnt doesn't. SO slapJack is an empty variable until it reachs the line in the code where it's assigned the function

//Takeaway: Although the hoisting thing is nice with function declarations, function expressions are preferreed as they're more versatile, and cleaner













