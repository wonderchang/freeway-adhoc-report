//Include the file system module
var fs = require("fs");

//Give the related argument values
var CAR_NUM;
var REACHABLE_RANGE = 30; 
var MSG_SUCCESSFUL_RATE = 0.8;
var COUNTER = 1;
var Pr = 0.7;
var TIMES = 1000;

//Data Declaration
var freeway = [];
var Rx_num = 0;
var receive_packet_num = new Array(CAR_NUM);
var receive_or_not = new Array(CAR_NUM);
var total_Rx_num = 0;
var total_avg_received_packet_num = 0;

fs.open("r30-ms08-ct1-pr07.tsv", 'w', function(err, fd) {
  fs.write(fd, "num\trate\n");
  for(CAR_NUM = 100; CAR_NUM <= 1000; CAR_NUM += 100) {

    //Initital data
    total_Rx_num = 0;
    total_avg_received_packet_num = 0;

    //Program start
    for(var times = 0; times < TIMES; times++) {

      freeway = [];
      //Generate the car location in 1 km freeway
      for(var i = 0; i < CAR_NUM; i++) {
	freeway.push({
	  "x": ((parseInt(Math.random() * 100000)) / 100),
	  "counter": 0
	});
      }

      //Initial data
      Rx_num = 0;
      for(var i = 0; i < CAR_NUM; i++) {
	receive_packet_num[i] = 0;
	receive_or_not[i] = 0;
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

      //console.log(freeway);

      //Give the first car the first packet
      receive_packet_num[0] = 1;
      receive_or_not[0] = 1;

      //Go passing the packet
      pass_packet(freeway[0]);

      //Calculate some data
      total_Rx_num += sum_Rx_num(CAR_NUM);
      total_avg_received_packet_num += sum_avg_received_packet_num(CAR_NUM);
    }

    var string = CAR_NUM + "\t" + ((parseInt(10000 * (total_Rx_num/TIMES))) / 10000) + "\n";
    fs.write(fd, string);
    console.log(CAR_NUM + "\t" + (total_Rx_num/TIMES));
    //console.log((parseInt(10000 * total_avg_received_packet_num/TIMES)) / 10000);
  }
});

function pass_packet(car) {
  var counter = 0;
  var enough = 0;
  var received = [];
  for(var i = 0; i < car.reachable.length; i++) {
    received.push(car.reachable[i]);
  }
  while(car.counter < COUNTER && received != null) {
    if(Math.random() <= Pr) {
      car.counter++;
      received.forEach(function(other_car) {
	receive_packet_num[other_car]++;
	if(Math.random() <= MSG_SUCCESSFUL_RATE) {
	  receive_or_not[other_car] = 1;
	  //console.log("Tx-car-" + car.id + ", counter = " + car.counter + ", " + car.id + "->" + other_car + " (success)");
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
	  //console.log("Tx-car-" + car.id + ", counter = " + car.counter + ", " + car.id + "->" + other_car + " (fail)");
	}
      });
    }
    else {
    }
  }
}


function sum_Rx_num(car_num) {
  var sum = 0;
  for(var i = 0; i < CAR_NUM; i++) {
    sum += receive_or_not[i];
  }
  return (sum / car_num);
}

function sum_avg_received_packet_num(car_num) {
  var sum = 0;
  for(var i = 0; i < CAR_NUM; i++) {
    sum += receive_packet_num[i];
  }
  return (sum / car_num);
}
