//Include the file system module
var fs = require("fs");

//Give the related argument values
var CAR_NUM;
var DISTANCE = process.argv[2]; 
var COUNTER = process.argv[3];
var MSG_SUCCESSFUL_RATE = process.argv[4];
var Pr = process.argv[5];
var TIMES = 250;

//Data Declaration
var freeway = [];
var Rx_num = 0;
var receive_packet_num;
var receive_or_not;
var total_Rx_num = 0;
var total_received_packet_num = 0;
var filename;
var effi_output;
var cost_output;

if(process.argv.length == 6) {

  filename = "d-" + DISTANCE + "_c-" + COUNTER + "_msr-" + MSG_SUCCESSFUL_RATE + "_pr-" + Pr;
  fs.open("./data/" + filename + "_effi.tsv", 'w', function(err, fd_effi) {
    fs.open("./data/" + filename + "_cost.tsv", 'w', function(err, fd_cost) {
      fs.write(fd_effi, "num\trate\n");
      fs.write(fd_cost, "num\trate\n");
      for(CAR_NUM = 10; CAR_NUM <= 1000; CAR_NUM += 50) {
	if(CAR_NUM == 60) {
	  CAR_NUM = CAR_NUM - 10;
	}

	//Initital data
	total_Rx_num = 0;
	total_received_packet_num = 0;
	receive_packet_num = new Array(CAR_NUM);
	receive_or_not = new Array(CAR_NUM);

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
	      if((freeway[j].x - car.x) < DISTANCE) {
		list.push(j);
	      }
	    }
	    car.reachable = list;
	  });

	  //Give the first car the first packet
	  receive_packet_num[0] = 1;
	  receive_or_not[0] = 1;

	  //Go passing the packet
	  pass_packet(freeway[0]);

	  //Calculate some data
	  total_Rx_num += sum_Rx_num(CAR_NUM);
	  total_received_packet_num += sum_received_packet_num();
	}

	effi_output = parseInt(10000 * (total_Rx_num / TIMES)) / 10000;
	cost_output = parseInt(10000 * (total_received_packet_num / TIMES)) / 10000;
	fs.write(fd_effi, CAR_NUM + "\t" + effi_output + "\n");
	fs.write(fd_cost, CAR_NUM + "\t" + cost_output + "\n");
	console.log(CAR_NUM + "\t" + effi_output + "\t" + cost_output);
      }
    });
  });
}
else {
  console.log("Error input command.");
  console.log("Usage command line:\n");
  console.log("\tnode main.js [distance] [counter] [msg_success] [Pr]\n");
}

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
  return ((sum - 1) / (car_num - 1));
}

function sum_received_packet_num() {
  var sum = 0;
  var sum_received = 0;
  for(var i = 0; i < CAR_NUM; i++) {
    sum += receive_packet_num[i];
    sum_received += receive_or_not[i];
  }
  return (sum / sum_received);
}
