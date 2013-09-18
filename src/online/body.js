function Time(time) {
	this.time = time;
	queues = new Array();
	activities = new Array();
}
		
function Queue(id, order) {
	this.id = id;
	this.order = order;
	usage = 0;
	takenSpots = new Array();
	sharedNodes = new Array();
}

function Process(a,b,c) {
	this.a = a;
	this.b = b;
	this.c = c;
	queues = new Array();
	previousQueue = -1;
}

function Activity(process, queue){
	this.process = process;
	this.queue = queue;
	thisGap = 0;
}

var resolution = 1000; //the number of divisions of a second to make each iteration. e.g. 1000 = 1000th or 0.001s
var intervalTimer = 200; //number of milliseconds between each iteration on display

var testing = false;

//order of the queues on the screen

if (testing){
	//var order = [1,13,3,15,5,17,7,19,9,21,11,23,26,27,0,12,2,14,4,16,6,18,8,20,10,22,25,24];
	//var nodeGroupings = [[1,13],[3,15],[5,17],[7,19],[9,21],[11,23],[26,27],[0,12],[2,14],[4,16],[6,18],[8,20],[10,22],[24,25]];

	var order = [1,13,3,15,5,17,7,19,9,21,11,23,26,0,12,2,14,4,16,6,18,8,20,10,22,25,24]; //list of queueIDs.
	var nodeGroupings = [[1,13],[3,15],[5],[17,7],[19],[9,21],[11,23,26],[0,12],[2,14],[4,16],[6,18],[8,20],[10,22],[24,25]];
} else {
	var order = [1,13,3,15,5,17,7,19,9,21,11,23,0,12,2,14,4,16,6,18,8,20,10,22]; //list of queueIDs.
	var nodeGroupings = [[1,13],[3,15],[5,17],[7,19],[9,21],[11,23],[0,12],[2,14],[4,16],[6,18],[8,20],[10,22]];

}

/*
*	Finds a time object given a value for that time. Returns null if one not found
*/
function getTime(time){
	//console.log(time);
	for (var i = 0; i < times.length; i++){
		if (times[i].time == time){
			//console.log(times[i].time);
			return times[i];
		}
	}
	return null;
}

/*
* Finds a process object given the 3 process id values
*/
function findProcess(a,b,c) {
	for (var i = 0; i < processes.length; i++){
		if ((processes[i].a == a) && (processes[i].b == b) && (processes[i].c == c)){
			//console.log(processes[i].a, processes[i].b, processes[i].c);
			return processes[i];
		}
	}
	return null;

}

/*
*	Finds a queue with the id qId in the collection queues
*/
function getQueue(queues, qId){
	for (var i = 0; i < queues.length; i++){
		if (queues[i].id == qId){
			return queues[i];
		}
	}
	return null;
}

/*
*	Finds a queue order given a id number
*/
function findOrder(id){
	for (var i = 0; i < order.length; i++){
		if (order[i] == id){
			return i;
		}
	}
	return -1;
}

function getQueueFromOrder(orderID){
	return order[orderID];
}

/*
* Performs a logical exclsuive OR
*/
function XOR(a, b){
	return ( a || b ) && !( a && b );
}

/**
*	Removes the given value from the given array
*/
function removeFromArray(arr, value){
	console.log(arr, value);
	var index = arr.indexOf(value);
	if (index != undefined){
		arr.splice(index,1);
		return arr;
	}
	return arr;
}

/*
* Calculates the X cooridnate for a point on the circle 
*/
function calcXValue(cx, rx, ry, order, length, boxSize){
	//return cx + (rx * Math.cos(id * ((2 * Math.PI) / length))) ; //circle
	
	//d = id * ((2 * Math.PI) / length);
	d = calculateAngle(order, length);
	if ((d < (Math.PI / 2)) ||  (d > (3 *Math.PI / 2 ))){
		m = 1;
	} else {
		m = -1;
	}
	//console.log("calcX", order, d, ( m * rx * ry ), Math.sqrt( (rx * rx * Math.tan(d) *  Math.tan(d)) + (ry * ry) ), (( m * rx * ry ) / Math.sqrt( (rx * rx * Math.tan(d) *  Math.tan(d)) + (ry * ry) )) + cx - (boxSize/2));
	return (( m * rx * ry ) / Math.sqrt( (rx * rx * Math.tan(d) *  Math.tan(d)) + (ry * ry) )) + cx - (boxSize/2);
}
			
/*
* Calculates the Y cooridnate for a point on the circle 
*/			
function calcYValue(cy, rx, ry, order, length, boxSize){
	//return cy + (ry * Math.sin(id * ((2 * Math.PI) / length))) - (boxSize/2); //circle
	
	//d = id * ((2 * Math.PI) / length);
	d = calculateAngle(order, length);
	//console.log(id, d);
	if ((d > Math.PI/2) && (d <= (3*Math.PI)/2 ) ){
		m = 1;
	} else {
		m = -1;
	}
	return (( m * rx * ry * Math.tan(d) ) / Math.sqrt( (rx * rx * Math.tan(d) *  Math.tan(d)) + (ry * ry) )) + cy - (boxSize/2);
}


/**
*	-----------------------------------------------------------------------------------------------------
*
*	Actual code
*
*/

function prepareDrawing() {
	d3.select("#loading").remove();
	
	//console.log("preparing");
	//var svg = d3.select("#svgdiv")
	//var svg = d3.select("div")
	var svg = d3.select("#svgdiv")
		.append("svg")
		.attr("width", originalWidth)
		.attr("height", originalHeight)
		.attr("xmlns","http://www.w3.org/2000/svg")
		.attr("version","1.1")
		.attr("id","canvas");

//the following may need modifying

	svg = d3.select("svg");

	var gEnter = svg.selectAll("g")
		.data(order)
		.enter()
		.append("g")
		.attr("id", function(d){
			return "group"+d;
		});
	
	/* 
	*	process id labels
	*/
	gEnter.append("text")
		.text(function (d, i) {
			//console.log(d, i);
			return d; // + " a:" + calculateAngle(d.order,order.length);
		})
		.attr("x", function(d,i) {
			return parseInt(calcXValue(cx, rx+(boxSize/2), ry+(boxSize/2), i, order.length, 0));
		})
		.attr("y", function(d,i) {
			return parseInt(calcYValue(cy, rx+(boxSize/2), ry+(boxSize/2), i, order.length, 0));
		})
		.attr("width",40)
		.attr("height",40)
		.attr("text-anchor", "middle")
		.attr("class","queue")
		.attr("id",function(d){
			return "label"+d;
		})
		.append("svg:title")
		.text(function(d) {
			return "Queue: "+d;
		});

	/**
	*	node grouping labels
	*/

	svg.selectAll("ellipse")
		.data(nodeGroupings)
		.enter()
		.append("ellipse")
		.attr("cx",function (d) {
			//console.log(d.length);
			var firstX = parseInt(d3.select("#label"+d[0]).attr("x"));
			var secondX = parseInt(d3.select("#label"+d[d.length-1]).attr("x"));
			//console.log("x", d[0],firstX,d[1],secondX,(firstX - secondX),((firstX - secondX)/2)+parseFloat(secondX));
		
			//var firstX =  calcXValue(cx, rx, ry, d[0], order.length, boxSize);
			//var secondX =  calcXValue(cx, rx, ry, d[1], order.length, boxSize);
			return parseInt(((firstX - secondX)/2)+parseFloat(secondX))+"";
		})
		.attr("cy",function (d) {
			var firstY = parseInt(d3.select("#label"+d[0]).attr("y"));
			var secondY = parseInt(d3.select("#label"+d[d.length-1]).attr("y"));
			//console.log("y",d[0],firstY,d[1],secondY,(firstY - secondY),((firstY - secondY)/2)+parseFloat(secondY));
			return parseInt(((firstY - secondY)/2)+parseFloat(secondY))+"";
			//return calcYValue(cy, rx, ry, d[0], order.length, boxSize);
		})
		.attr("rx",function (d) {
			return (960/order.length) * (d.length/2);
		})
		.attr("ry",480/order.length)
		.attr("class","grouping")
		.attr("id",function(d) {
			return d[0] + " " + d[1];
		})
		.attr("transform",function(d){
			//return "rotate(" + calculateAngle(d.order,order.length) +  ")";
			var firstAngle = parseInt(90 - ((180/Math.PI)*calculateAngle(findOrder(d[0]),order.length)) );
			var secondAngle = parseInt(90 - ((180/Math.PI)*calculateAngle(findOrder(d[d.length-1]),order.length)) );
			//console.log("id"+d[0], "order"+findOrder(d[0]), firstAngle, "id"+d[1], "order"+findOrder(d[1]), secondAngle, (firstAngle-secondAngle)/2, ((firstAngle - secondAngle)/2)+secondAngle);
			var angle = ((firstAngle - secondAngle)/2)+secondAngle;
			//var angle = secondAngle;
			
			var centreX = ((d3.select("#label"+d[0]).attr("x") - d3.select("#label"+d[d.length-1]).attr("x"))/2)+parseFloat(d3.select("#label"+d[d.length-1]).attr("x"));
			var centreY = ((d3.select("#label"+d[0]).attr("y") - d3.select("#label"+d[d.length-1]).attr("y"))/2)+parseFloat(d3.select("#label"+d[d.length-1]).attr("y"));

			//console.log(d[0], d[1], angle);

			return "rotate(" + angle + "," + parseInt(centreX) + "," + parseInt(centreY) + ")";
		});	
	var xAdjust = 25;
	var yAdjust = 20;
	//Highlighting Each individual node (semi-circles)
	svg.append("svg:path")
		.attr("d",function(d) {
			
			//var startValue = order.length/2;
			//console.log(nodes[0][0], nodes[0][1], nodes[1][0], nodes[1][1]);
			//console.log(getQueueFromOrder(0), parseInt((order.length/2)-1), getQueueFromOrder((order.length/2)-1), getQueueFromOrder((order.length/2)), getQueueFromOrder(order.length-1));
			//console.log(startValue-2, getQueueFromOrder(startValue-2),  order[startValue-2]);

			var startX = parseInt(d3.select("#label"+getQueueFromOrder(0)).attr("x"))+xAdjust; //12
			var startY = parseInt(d3.select("#label"+getQueueFromOrder(0)).attr("y"))+yAdjust;
			
			var endX = parseInt(d3.select("#label"+getQueueFromOrder(parseInt(order.length/2)-1)).attr("x"))-xAdjust; //10
			var endY = parseInt(d3.select("#label"+getQueueFromOrder(parseInt(order.length/2)-1)).attr("y"))+yAdjust;
			
			return "M" + startX + " " + startY + " A " + (rx) + "," + (ry) + " 0 1,0 " + endX + "," + endY + " z";
			
			
			//"M50 50 a 60,60 0 1,0 110,100 z"
		})
		.attr("class","nodeArea");
	svg.append("svg:path")
		.attr("d",function(d) {
			
			//var startValue = (order.length/2)+1;

			var startX = parseInt(d3.select("#label"+getQueueFromOrder(parseInt(order.length/2))).attr("x"))-xAdjust; //13
			var startY = parseInt(d3.select("#label"+getQueueFromOrder(parseInt(order.length/2))).attr("y"))-yAdjust;
			
			var endX = parseInt(d3.select("#label"+getQueueFromOrder(order.length-1)).attr("x"))+xAdjust; //11
			var endY = parseInt(d3.select("#label"+getQueueFromOrder(order.length-1)).attr("y"))-yAdjust;
			
			return "M" + startX + " " + startY + " A " + (rx) + "," + (ry) + " 0 1,0 " + endX + "," + endY + " z";
			
			
			//"M50 50 a 60,60 0 1,0 110,100 z"
		})
		.attr("class","nodeArea");
		

	/*
	*	Display time area
	*/
	svg.append("text")
		.text(" ")
		.attr("x", 20)
		.attr("y", 40)
		.attr("id", "time");

}

/*
* Returns the angle for a given queue - in radians
*/
function calculateAngle(itemNum, totalItems){
	return (itemNum * ((2 * Math.PI) / totalItems)) + (Math.PI / totalItems); //+0.13
}

/*
* Calculates the height of a queue box
*/
function calcHeight(usage){
	usage = parseInt(usage);
	if (usage == 0) {
		return 0;
	} else if (usage > 100) {
		useage = 100
	}
	//return (10*Math.log(parseInt(usage)))+5;
	return usage*2;
}

/**
*	Initial start
*/
function start(){
	prepareDrawing();


}

//the current time
var time = 0;

/*
*	Parses the input and decides which type of data this is
*/
function parse(input){

	var text = input.split(",");

	alterTime(text[1]);

	//queueLength
	if (text[0] == "{queueLength") {
		//assuming data is {queueLength, time, queueID, size}
		//console.log("queueLength found", text[1], text[2].substring(0,text[2].length-1));
		alterQueueSize(text[2], text[3].substring(0,text[3].length-1));
	}
	//console.log(input);

}

function alterTime(time){
	d3.select("#time")
		.text(function() {
			return "time: " + time + "s";
		})
		.attr("x", 20)
		.attr("y", 40)
		.attr("id", "time");

}

function alterQueueSize(queueID, size){
	console.log(queueID, size);

	d3.select("#num"+queueID).remove();

	/*
	*	Highlight Process Usage
	*/
	d3.select("#group"+queueID)
		.append("rect")
		.attr("width",boxSize)
		.attr("height",function(d) {
			return calcHeight(size);
		})
		.attr("x", function(d) {
			return parseInt(calcXValue(cx, rx+boxSize, ry+boxSize, findOrder(queueID), order.length, boxSize));
			
		})
		.attr("y", function(d) {
		
			return parseInt(calcYValue(cy, rx+boxSize, ry+boxSize, findOrder(queueID), order.length, boxSize) + boxSize); //- calcHeight(d.usage) 

		})
		.attr("id",function(d) {
			return "num"+d;
		})
		.attr("fill",function(d){
			var red = (size * 2);
			if (red > 255) {
				red = 255;
			}
			var green = 255-(size * 2);
			if (green < 0) {
				green = 0;
			}
			return d3.rgb(red,green,0);
			//return "#" + red.toString(16) + "" + green.toString(16) + "00";
		})
		.attr("transform",function(d){
			//return "rotate(" + calculateAngle(d.order,dataset.length) +  ")";
			
			return "rotate(" + (270 - ((180/Math.PI)*calculateAngle( findOrder(queueID),order.length)) ) + "," + 
			parseInt(calcXValue(cx, rx+boxSize, ry+boxSize, findOrder(queueID), order.length, boxSize)+(boxSize/2)) + "," + 
			parseInt(calcYValue(cy, rx+boxSize, ry+boxSize, findOrder(queueID), order.length, boxSize)+(boxSize/2)) + ")";
		})
		.append("svg:title")
		.text(function(d) {
			return ""+parseInt(size);
		});

}