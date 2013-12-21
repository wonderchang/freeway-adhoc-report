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
var filename;
var total_Rx_num;
var total_Rx_cost;
var freeway;
var effi_output;
var cost_output;

//Check the input command argument is correct or not
if(process.argv.length == 6) {

  //Give the output filename
  filename = "d-" + DISTANCE + "_c-" + COUNTER + "_msr-" + MS_RATE + "_pr-" + PR;

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
	total_Rx_num = 0;	//The total number of the car nodes which has received the packet
	total_Rx_cost = 0;	//The total number of the received packets

	//Run the several times, to get the average results
	for(var times = 0; times < TIMES; times++) {

	  //Initial data, for each time
	  freeway = [];					//Clean the freeway

	  //Generate the car location in 1 km freeway
	  for(var i = 0; i < CAR_NUM; i++) {
	    freeway.push({
	      "x": ((parseInt(Math.random() * 100000)) / 100),
	      "counter": 0,
	      "received": 0,
	      "cost": 0
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
	  freeway[0].received = 1;
	  freeway[0].cost = 1;

	  //Go passing the packet
	  pass_packet(freeway[0]);

	  //Calculate the average result after running serverl times, and accumulate it
	  total_Rx_num += avg_Rx_num(freeway);
	  total_Rx_cost += avg_Rx_cost(freeway);
	}

	//Average the total num of severl times running
	effi_output = parseInt(10000 * (total_Rx_num / TIMES)) / 10000;
	cost_output = parseInt(10000 * (total_Rx_cost / TIMES)) / 10000;

	//Write the result to two file, one is efficiency, the other is cost
	fs.write(fd_effi, CAR_NUM + "\t" + effi_output + "\n");
	fs.write(fd_cost, CAR_NUM + "\t" + cost_output + "\n");

	//Print to screen for viewing check
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

  //Data declaration
  var receiver = [];
  var receiver_num;

  //Push the reachable car id
  for(var i = 0; i < car.reachable.length; i++) {
    receiver.push(car.reachable[i]);
  }

  receiver_num = receiver.length;

  //Start boradcasting
  while(car.counter < COUNTER && receiver_num != 0) {

    //Dice PR
    if(Math.random() <= PR) {

      //Now mean the transimssion terminal work fine, counter++ for boardcasting once
      car.counter++;

      //Send the package to the reachable car nodes one by one
      receiver.forEach(function(other_car) {
	if(other_car != null) {

	  //Record the packet cost for it
	  freeway[other_car].cost++;

	  //Dice MS_RATE
	  if(Math.random() <= MS_RATE) {

	    //Now mean the receiver has get the packet successfully
	    freeway[other_car].received = 1;

	    //Clean the received car out of the reachable array list
	    var index = receiver.indexOf(other_car);
	    receiver[index] = null;
	    receiver_num -= 1;

	    //Go through passing next car
	    pass_packet(freeway[other_car]);
	  }
	}
      });
    }
  }
}

//Calculate the averageo of the efficiency
function avg_Rx_num(car_list) {
  var sum = 0;
  var length = car_list.length;
  for(var i = 1; i < length; i++) {
    sum += car_list[i].received;
  }
  return (sum / (length - 1));
}

//Calculate the averageo of the cost
function avg_Rx_cost(car_list) {
  var sum_num = 0;
  var sum_cost = 0;
  for(var i = 1; i < car_list.length; i++) {
    sum_cost += car_list[i].cost;
    sum_num += car_list[i].received;
  }
  return ((sum_num != 0) ? (sum_cost / sum_num) : 0);
}
