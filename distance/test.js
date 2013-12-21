var array = [1, 2, 3, 4, 5];

array.forEach(function(e) {
  console.log("this time is " + e);
  console.log(array);
  var index = array.indexOf(e);
  if(e == 2 || e == 4) {
    if(index > -1) {
      array.splice(index, 1);
      console.log("after splice");
      console.log(array);
    }
  }
});
