var margin = {top: 20, right: 20, bottom: 30, left: 50};
//var width = 960 - margin.left - margin.right;
//var height = 500 - margin.top - margin.bottom;
var width = 380;
var height = 300;

var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);
var xAxis = d3.svg.axis().scale(x).orient("bottom");
var yAxis = d3.svg.axis().scale(y).orient("left");

var line = d3.svg.line().x(function(d) { return x(d.num); }).y(function(d) { return y(d.rate); });

var svg = d3.select("body").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


function draw_line(node, filename, color, color_index, label) {

d3.tsv(filename, function(error, data) {
  data.forEach(function(d) {
    console.log(d);
    d.num = +d.num;
    d.rate = +d.rate;
  });

  //y.domain(d3.extent(data, function(d) { return d.rate; }));
  x.domain(d3.extent(data, function(d) { return d.num; }));
  if(label) {
    y.domain([0, label]);
  }
  else {
    y.domain([0, 1]);
  }

  node.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);

  node.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em");
    //.style("text-anchor", "end")
    //.text("Probability");

  node.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", color(color_index));
});

}

