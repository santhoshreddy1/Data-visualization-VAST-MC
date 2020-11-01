var svg, earthData,time="2020-04-06 00:00:00";

document.addEventListener('DOMContentLoaded', function() {
    svg = d3.select('#map');
    Promise.all([d3.csv('data/aggregated_mc1_data.csv')]).then(function(values){
    earthData=values[0] ;

    drawallCharts();
    })
  });
function  drawallCharts()
{
heatMap();
pieChart();
lineChart();
gridChart();
innovativeChart();
}
var myTimer;
function changebuttuon()
{
  var elem = document.getElementById("action").value;
  if(elem=="Play"){
  
  clearInterval (myTimer);
  myTimer = setInterval (function() {
      var b= d3.select("#rangeSlider");
      var t = (+b.property("value") + 300) % (+b.property("max") + 300);
      time=formatDT(new Date(t*1000));
      drawallCharts();
      if (t == 0) { t = +b.property("min"); }
      b.property("value", t);
    }, 1000);
    document.getElementById("action").value="Pause";
  }
  else{
    clearInterval (myTimer);
    document.getElementById("action").value="Play";
    
  }
}
function changeslider()
{
  clearInterval (myTimer);
  myTimer = setInterval (function() {
      var b= d3.select("#rangeSlider");
      var t = (+b.property("value") + 300) % (+b.property("max") + 300);
      time=formatDT(new Date(t*1000));
      drawallCharts();
      if (t == 0) { t = +b.property("max");
      clearInterval (myTimer); }
      b.property("value", t);
      
    }, 1000);
    document.getElementById("action").value="Pause";
}

 function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }
  function formatDT(__dt) {
      var year = __dt.getFullYear();
      var month = zeroPad(__dt.getMonth()+1, 2);
      var date = zeroPad(__dt.getDate(), 2);
      var hours = zeroPad(__dt.getHours(), 2);
      var minutes = zeroPad(__dt.getMinutes(), 2);
      var seconds = zeroPad(__dt.getSeconds(), 2);
      return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
  }
  
 function heatMap()
 {

 }
 function pieChart()
 {

 }
 function lineChart()
 {

 }
 function gridChart()
 {

 }
 function innovativeChart()
 {

 }
 
