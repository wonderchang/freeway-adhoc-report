var CAR_NO = 0;
var REACHABLE_DISTANCE = 100;
var freeway = d3.select("#freeway").append("svg");

var running_car = setInterval(emit_car, 250);

function emit_car() {

  /*
  if(CAR_NO == 2000) {
    clearInterval(running_car);
  }
  else {
  */
    //The car speed, constant speed. 983 / time (px/ms)
    var time = parseInt(Math.random() * 1000 + 5000);
    //Decide three of one car way
    var cy = 25 * ((parseInt(Math.random() * 100) % 3) + 1);
    //Define the process thread for each car
    var car_thread;
    //Create the car and emit it
    var car = freeway.append("circle")
      .attr("id", "car-" + (++CAR_NO))
      .attr("r", 3)
      .attr("cx", 0)
      .attr("cy", cy)
      .transition().ease("linear")
      .duration(time)
      .attr("cx", 983);

    //When the car run out of the visible area, remove it.
    car.each("end", function() {
      //Remove the car
      d3.select("#" + this.id).remove();
      //Remove all the link line of the car.
      d3.selectAll(".line-from-" + this.id).remove();
      //Stop the car running processes.
      clearInterval(car_thread);
    });

    //When the car is running, go below and create links.
    car.each(function() {
      //Get this car id, all the records will base on this info.
      var id = this.id;
      //Check all the distance from others car per millisecond, and decide the range.
      car_thread = setInterval(function() { 
	//Find the self cordinates.
	var self_cx = d3.select("#" + id)[0][0].cx.animVal.value;
	var self_cy = d3.select("#" + id)[0][0].cy.animVal.value;
	//Find all the car in the freeway.
	var car_set = freeway.selectAll("circle")[0];
	//Before drawing the line, clean the previous drawn lines.
	d3.selectAll(".line-from-" + id).remove();
	//For each car, decide whether make a line or not.
	car_set.forEach(function(other_car) {
	  if(id !== other_car.id) {
	    //Get the other car cordinates
	    var other_cx = other_car.cx.animVal.value;
	    var other_cy = other_car.cy.animVal.value;
	    //Calculate the distance between two cars
	    var distance = distance_calculate(self_cx, self_cy, other_cx, other_cy);
	    if(distance <= REACHABLE_DISTANCE) {
	      freeway.append("line")
		.attr("class", "line-from-" + id)
		.attr("x1", self_cx)
		.attr("y1", self_cy)
		.attr("x2", other_cx)
		.attr("y2", other_cy)
		.attr("stroke", "red")
		.attr("stroke-width", 1);
	    }
	  }
	});
      }, 1);
    });
    d3.select("#car_no").text(CAR_NO);
  //}
}

function distance_calculate(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}


