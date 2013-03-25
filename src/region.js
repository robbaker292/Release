function Circle(cx, cy, r) {
	this.cx = cx;
	this.cy = cy;
	this.r = r;
}

/*
*	A placeholder for region. Region is a rectangle
*
* 	x1 The left boundary of the region
*	x2 The right boundary of the region
*	y1 The top boundary of the region
*	y2 The botton boundary of the region
*
*/
function Region(x1, x2, y1, y2){
	this.x1 = x1;
	this.x2 = x2;
	this.y1 = y1;
	this.y2 = y2;
}

var circles = [];
var regions = [];

/*
*	Populates the array of regions based on the array of circles
*/
function generateRegions(){
	for (var i = 0; i < circles.length; i++){
		var x1 = cx - r;
		var x2 = cx + r;
		var y1 = cy - r;
		var y2 = cy + r;

		regions.push(new Region(x1, x2, y1, y2));
	}

}