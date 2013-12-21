//Include the file system module
var fs = require("fs");

//Give 4 related argument values that will effect the system
var DISTANCE = process.argv[2]; 
var COUNTER = process.argv[3];
var PR = process.argv[5];
var MS_RATE = process.argv[4];

//Run times variable
var CAR_NUM;
var TIMES = 250;

//Data Declaration
var freeway;
var receive_packet_num;
var receive_or_not;
var total_Rx_num = 0;
var total_received_packet_num = 0;
var filename;
var effi_output;
var cost_output;

if(process.argv.length == 6) {

  //Give the output filename
  filename = "d-" + DISTANCE + "_c-" + COUNTER + "_msr-" + MSG_SUCCESSFUL_RATE + "_pr-" + PR;

  //Open the file to write, write two file concurrently, one is the efficiency, the other is cost
  fs.open("./data/" + filename + "_effi.tsv", 'w', function(err, fd_effi) {
    fs.open("./data/" + filename + "_cost.tsv", 'w', function(err, fd_cost) {

      //Write the class name of row in the file header
      fs.write(fd_effi, "num\trate\n");
      fs.write(fd_cost, "num\trate\n");

      //Program start, run the number of car from 10 to 1000 by incrementing 50
      for(CAR_NUM = 10; CAR_NUM <= 1000; CAR_NUM += 50) {
	if(CAR_NUM == 60) {
	  CAR_NUM = CAR_NUM - 10;
	}

	//Initital data, for each car_num
	receive_packet_num = new Array(CAR_NUM);	//The total packets that each car node get
	receive_or_not = new Array(CAR_NUM);		//Mark the car node has received the packet or not
	total_Rx_num = 0;				//The total number of the car nodes which has received the packet
	total_received_packet_num = 0;			//The total number of the received packets

	//Run the several times, to get the average results
	for(var times = 0; times < TIMES; times++) {

	  //Initial data, for each time
	  freeway = [];					//the car node list
	  for(var i = 0; i < CAR_NUM; i++) {
	    receive_packet_num[i] = 0;
	    receive_or_not[i] = 0;
	  }

	  //Generate the car location in 1 km freeway
	  for(var i = 0; i < CAR_NUM; i++) {
	    freeway.push({
	      "x": ((parseInt(Math.random() * 100000)) / 100),
	      "counter": 0
	    });
	  }

	  //Sort the car list by there x position
	  freeway.sort(function(a, b) { return a.x - b.x; });

	  //Give the car id by the ordering number
	  freeway.forEach(function(car, i) { car.id = i; });


	  //Find the reachable car for each car nodes
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

	  //Calculate the average result after running serverl times, and accumulate it
	  total_Rx_num += avg_Rx_num(received_or_not);
	  total_received_packet_num += avg_received_packet_num(received_packet_num);
	}

	//Average the total num of severl times running
	effi_output = parseInt(10000 * (total_Rx_num / TIMES)) / 10000;
	cost_output = parseInt(10000 * (total_received_packet_num / TIMES)) / 10000;

	//Write the result to two file, one is efficiency, the other is cost
	fs.write(fd_effi, CAR_NUM + "\t" + effi_output + "\n");
	fs.write(fd_cost, CAR_NUM + "\t" + cost_output + "\n");

	//Print to screen to check
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
    if(Math.random() <= PR) {
      car.counter++;
      received.forEach(function(other_car) {
	receive_packet_num[other_car]++;
	if(Math.random() <= MS_RATE) {
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


function avg_Rx_num(received_or_not) {
  var sum = 0;
  var length = received_or_not.length - 1;
  for(var i = 0; i < CAR_NUM; i++) {
    sum += receive_or_not[i];
  }
  return ((sum - 1) / length);
}

function avg_received_packet_num(received_packet_num) {
  var sum = 0;
  var sum_received = 0;
  for(var i = 0; i < CAR_NUM; i++) {
    sum += receive_packet_num[i];
    sum_received += receive_or_not[i];
  }
  return (sum / sum_received);
}
