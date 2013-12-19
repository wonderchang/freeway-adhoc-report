//Give the related argument values
var CAR_NUM = 10;
var REACHABLE_RANGE = 100; 
var MSG_SUCCESSFUL_RATE = 0.8;
var COUNTER = 3;
var Pr = 0.7;

//Data Declaration
var freeway = [];
var Rx_num = 0;
var receive_packet_num = new Array(CAR_NUM);
var tmp_car_info = new Array(CAR_NUM);

//Initial data
for(var i = 0; i < CAR_NUM; i++) {
  receive_packet_num[i] = 0;
  tmp_car_info[i] = [];
}

//Generate the car location in 1 km freeway
for(var i = 0; i < CAR_NUM; i++) {
  freeway.push({
    "x": ((parseInt(Math.random() * 100000)) / 100)
  });
}

//Sort the car list by there x position
freeway.sort(function(a, b) { return a.x - b.x; });

//Give the car id by the ordering number
freeway.forEach(function(car, i) { car.id = i; });

//Find the reachable car for each car
freeway.forEach(function(car, i) {
  var list = [];
  for(var j = i + 1; j < CAR_NUM; j++) {
    if((freeway[j].x - car.x) < REACHABLE_RANGE) {
      list.push(j);
    }
  }
  car.reachable = list;
});

console.log(freeway);

pass_packet(freeway[0]);


function pass_packet(car) {
  var counter = 0;
  var enough = 0;
  var received = [];
  for(var i = 0; i < car.reachable.length; i++) {
    received.push(car.reachable[i]);
  }
  while(counter < COUNTER && received != null) {
    if(Math.random() <= Pr) {
      counter++;
      received.forEach(function(other_car) {
	if(Math.random() <= MSG_SUCCESSFUL_RATE) {
	  Rx_num++;
	  console.log("Tx-car-" + car.id + ", counter = " + counter + ", " + car.id + "->" + other_car + " (success), Rx_num = " + Rx_num);
	  var index = received.indexOf(other_car);
	  if(index > -1) {
	    received.splice(index, 1);
	  }
	  else {
	    console.log("The unexpected error occured.");
	  }
	  pass_packet(freeway[other_car]);
	}
	else {
	  console.log("Tx-car-" + car.id + ", counter = " + counter + ", " + car.id + "->" + other_car + " (fail), Rx_num = " + Rx_num);
	}
      });
    }
    else {
    }
  }
}


