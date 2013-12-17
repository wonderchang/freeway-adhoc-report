var car_no = 0;
var freeway = d3.select("#freeway").append("svg");

var running_car = setInterval(emit_car, 200);
//var detect_node = setInterval(show_car_info, 100);

function emit_car() {

  if(car_no == 1) {
    clearInterval(running_car);
    //clearInterval(detect_node);
  }

  var speed = parseInt(Math.random() * 1000 + 5000);
  var cy = 25 * ((parseInt(Math.random() * 100) % 3) + 1);
  var car_thread;
  var car = freeway.append("circle").attr("id", "car-" + (++car_no))
    .attr("r", 5).attr("cx", 0).attr("cy", cy)
    .transition().ease("linear").duration(speed).attr("cx", 985);
  car.each("end", function() {
    d3.select("#"+ this.id).remove();
    clearInterval(car_thread);
  });
  car.each(function() {
    var id = this.id;
    car_thread = setInterval(function() { 
      var cx = d3.select("#" + id)[0][0].cx.animVal.value;
      //console.log(id + ", cx = " + cx); 
      var car_set = freeway.selectAll("circle")[0];
      car_set.forEach(function(e) {
	if(id !== e.id) {
	  console.log(id + " to " + e.id);
	}
      });
      
    }, 5);
  });
}

function boardcast(circle) {
  setInterval(function() { console.log(circle); }, 1000);
}

function show_car_info() {
  console.log(d3.selectAll("#car-1")[0][0].cx.animVal.value);
}

