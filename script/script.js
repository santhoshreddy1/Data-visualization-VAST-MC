var svg, earthData,start_time="2020-04-06 00:00:00";
var datamap;
var current_time="2020-04-06 00:00:00";
var final_data;
var cumulative;
document.addEventListener('DOMContentLoaded', function() {
    svg = d3.select('#map');
    Promise.all([d3.csv('data/aggregated_mc1_data.csv')]).then(function(values){
    earthData = values[0] ;
    datamap = values;
    drawallCharts();
    })
  });
function getCumalativeValues(){
    let D1 = new Date(current_time)
    final_data = new Array()
    // create an array of Objects o size equal to total number of cities
    for( let x = 0; x<21; x++){
            final_data.push({
            app_responses:0,
            sewer_and_water:0,
            power:0,
            medical:0,
            shake_intensity:0,
            roads_and_bridges:0,
            buildings:0,
            count:0,
      });
    }
    cumulative_map = new Array();
    datamap.forEach(function(data){
            for( k in data){
                if(new Date(data[k].time)<=D1){// find all rows of values <= D1 date
                    cumulative_map.push(data[k])
                }
            }
    });
  // here we finally compute a cumulative sum of all values per city
  // index of final data array ie 1,2,3...19 gives the cumulative sum per attribute like app response
     for( let k =0 ; k< cumulative_map.length;k++){
       let ind = +cumulative_map[k].location;
        final_data[ind].app_responses +=  +cumulative_map[k].app_responses
        final_data[ind].sewer_and_water+=  +cumulative_map[k].sewer_and_water
        final_data[ind].power+= +cumulative_map[k].power
        final_data[ind].medical+= +cumulative_map[k].medical
        final_data[ind].shake_intensity+= +cumulative_map[k].shake_intensity
        final_data[ind].roads_and_bridges+= parseFloat(cumulative_map[k].roads_and_bridges)
        final_data[ind].buildings+= parseFloat(cumulative_map[k].buildings)
        final_data[ind].count+=1
    }
    // now finding mean of all values
    for(let k=0;k<20;k++){
        if(final_data[k].count>0){
                let total = final_data[k].count;
                final_data[k].app_responses/=total;
                final_data[k].sewer_and_water/=total;
                final_data[k].power/=total;
                final_data[k].medical/=total;
                final_data[k].shake_intensity/=total;
                final_data[k].roads_and_bridges/=total;
                final_data[k].buildings/=total;
        }
        final_data[k].location = k;
    }
    console.log("Final Data: ", final_data);
}
    

function  drawallCharts()
{
    svg.selectAll("*").remove();
    getCumalativeValues();
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
      current_time=formatDT(new Date(t*1000));
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
      current_time=formatDT(new Date(t*1000));
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
 // use final_data map to get access to all cumalative values. Index of Final Data is Location no. Ignore Index zero.
 }
 function pieChart()
 {
// use final_data map to get access to all cumalative values. Index of Final Data is Location no. Ignore Index zero.
 }
 function lineChart()
 {
 // use final_data map to get access to all cumalative values. Index of Final Data is Location no. Ignore Index zero.
 }
 function gridChart()
 {
 // use final_data map to get access to all cumalative values. Index of Final Data is Location no. Ignore Index zero.
 }
 function innovativeChart()
 {
 // use final_data map to get access to all cumalative values. Index of Final Data is Location no. Ignore Index zero.
  // svg.selectAll("*").remove();
  var isvg = svg.append("g")
                .attr("id", "iplot");

  var iheight=300;
  var iwidth=600;
  var imargin={top: 20, right: 20, bottom: 20, left: 20};

  var avg_val=[];
  var loc=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];

  xScale = d3.scalePoint()
            .domain([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19])
            .range([imargin.left,iwidth-imargin.right]);
  yScale = d3.scaleLinear()
            .domain([10, 0])
            // .range([iheight-imargin.top, 0]);
            .range([iheight-imargin.bottom-100, 0]);

  const xaxis = d3.axisBottom(xScale);
  const yaxis = d3.axisLeft(yScale);

  update();

  isvg.append("g")
  .attr("class", "xAxis")
  .attr("transform", "translate("+0+","+ (iheight-imargin.bottom)+ ")")
  .call(xaxis);

  isvg.append("g")
  .attr("class", "yAxis")
  .attr("transform", "translate("+imargin.left+","+ (iheight-imargin.bottom)+ ")")
  .call(yaxis)
  
  isvg.append("g").attr("id", "bars");

  var bars = isvg.select("#bars")
                   .selectAll("rect")
                   .data(final_data);

  bars.enter().append("rect")
    .attr("class", "bar")
    .attr("width", imargin.left)
    .attr("x", function(d, i) {
      return xScale(d.location) - (imargin.left/2);
    })
    .attr("y", iheight)
    .attr("height", function(d) {
      return yScale(d.sewer_and_water);
    });

    //Amy:
    d3.selectAll(".checkbox").on("change",update);

    function average(grp)
    {
      velScale=d3.scaleLinear().domain([0,10]).range([1000,10]);
     l=grp.length;
     avg_val=[];

     var circle = isvg.selectAll("circle").data(loc).enter()
     .append("circle")
     .attr("r", 10);

     circle.interrupt();
    //  .selectAll("*").interrupt();

      for(j=0;j<final_data.length;j++)
      {
        var val=0;
      for(i=0;i<l;i++)
      {
        val+=final_data[j][grp[i]];
      }
      avg_val.push((val/l))
      }
      console.log("Avg: ", avg_val, final_data);
  
      circle
        .each(function transition(d){
          d3.select(this)
      .attr("cy", (iheight-imargin.bottom-10))
      .attr("cx",  xScale(loc[d-1]) )
      .transition()
  
      .duration(function (params) {
        // console.log("avg: ", d, avg_val[d],  velScale(avg_val[d]))
        return velScale(avg_val[d]) 
      })
  
      .attr("cy", (iheight-imargin.bottom-100))
      .attr("cx", xScale(loc[d-1]))
      .transition()
      .duration( velScale(avg_val[d]))
      .attr("cy", iheight-imargin.bottom-10)
      .attr("cx", xScale(loc[d-1]))
      .on("end",transition);
     })
    }

    function update(){

      // For each check box:
      var grp=[]
      d3.selectAll(".checkbox").each(function(d){
        if(d3.select(this).node().checked==true)
        grp.push( d3.select(this).property("value")); 
      })
      average(grp)
    }

 }
 
