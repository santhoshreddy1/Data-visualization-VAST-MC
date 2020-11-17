var svg, earthData,start_time="2020-04-06 00:00:00";
var datamap;
var mapdata;
var current_time="2020-04-06 00:00:00";
var final_data;
var cumulative;
var Mapwidth = 550;
var Mapheight =470;
var svgMap;
var divM;


document.addEventListener('DOMContentLoaded', function() {
    svg = d3.select('#map');
    Promise.all([d3.json('data/map-geo.json')]).then(function(json){
        mapdata = json
    })
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
    console.log("Final Data: ", final_data[7]);
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
     divM = d3.select("body").append("div")
     .attr("class", "tooltip-donut")
     .style("opacity", 0);

    let projection = d3.geoMercator()
    .scale(110000)
    .center([-119, 0.01])
    .translate([1900,450]);

    let path = d3.geoPath()
    .projection(projection);

    var extent = [0.0, 10.0]
     var colorScale = d3.scaleSequential(d3.interpolateBrBG)
                     .domain(extent);
    svgMap = d3.select('#worldMap')
    .attr("transform", "translate(850,-800)")
    .attr('width', Mapwidth)
    .attr('height', Mapheight);

    svgMap.selectAll("*").remove();
    svgMap.append('rect')
    .style("fill","white")
    .attr('width', Mapwidth)
    .attr('height', Mapheight);

    let g = svgMap.append('g');
    updateMapData();

     svgMap.selectAll("path")
        .data(mapdata[0].features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr('id', d => { return d.properties.Nbrhood })
        .style("stroke", "black")
        .style("stroke-width", "1")
        .style('fill', d => {
                if(isNaN(d.properties.newkey)){
                    return colorScale(0.1);
                }
                 else{ return colorScale(d.properties.newkey);}
            })
        .attr("title", function(d,i) {
        console.log(d.properties.Nbrhood)
        return d.properties.Nbrhood;
      })
       .on('mouseover', function(d,i) {
         d3.select(this).transition()
               .duration('50')
               .style('stroke','cyan')
               .attr('opacity', '.85')
               .attr('stroke-width','4');
        divM.transition()
               .duration(50)
               .style("opacity", 1);
         divM.html(d.properties.Nbrhood+i)
               .style("left", (d3.event.pageX + 10) + "px")
               .style("top", (d3.event.pageY - 15) + "px");
               if(d.properties.Nbrhood ==="Wilson Forest"){
                console.log(d.properties)
               }
           console.log('mouseover on ' + d.properties.Nbrhood);
    })
    .on('mouseout', function(d,i) {
        d3.select(this).transition()
               .duration('50')
               .style('stroke','black')
               .attr('opacity', '1')
               .attr('stroke-width','1');
        divM.transition()
              .duration('50')
              .style("opacity", 0);
      console.log('mouseout on ' + d.properties.Nbrhood);
    });


    var lineInnerHeight = 430;

    const defs = svgMap.append("defs");

    const linearGradient = defs
        .append("linearGradient")
        .attr("id", "linear-gradient");

    linearGradient
     .selectAll("stop")
     .data(
         colorScale.ticks().map((t, i, n) => ({
         offset: `${(100 * i) / n.length}%`,
         color: colorScale(t),
        }))
     )
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

  var barHeight = 20;
  var barWidth = 200;

  let legendGroup = svgMap.append("g");
  legendGroup
    .append("rect")
    .attr("x", 25)
    .attr("y", -barHeight)
    .attr("width", barWidth)
    .attr("height", barHeight)
    .style("fill", "url(#linear-gradient)");

  var legendScale = d3
    .scaleLinear()
    .domain([0, extent[1]])
    .range([25, barWidth + 25]);

  var legendAxis = d3.axisBottom(legendScale).ticks(5).tickSize(-barHeight);

  legendGroup
    .attr("class", `x-axis`)
    .attr("transform", `translate(0,${lineInnerHeight})`)
    .call(legendAxis);
}

 function updateMapData(){
    console.log(final_data.length)
    let avgsum = new Array();
    
    for(let i=1;i<=19;i++){
      var count=0
      var sum = 0
      if(!Number.isNaN(final_data[i].sewer_and_water)){count+=1;sum+=final_data[i].sewer_and_water}
      if(!Number.isNaN(final_data[i].power)){count+=1;sum+=final_data[i].power}
      if(!Number.isNaN(final_data[i].medical)){count+=1;sum+=final_data[i].medical}
      if(!Number.isNaN(final_data[i].buildings)){count+=1;sum+=final_data[i].buildings}
      if(!Number.isNaN(final_data[i].roads_and_bridges)){count+=1;sum+=final_data[i].roads_and_bridges}
        
        avgsum.push(sum/count);
    }
    console.log("AvgSum: "+ avgsum);
    for(let i=1;i<=19;i++){
        let newval = avgsum[i-1];
        mapdata[0].features[i-1].properties['newkey'] = newval;
    }
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
      // console.log("Avg: ", avg_val, final_data);
  
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
      if(grp.length==0)
      {
        d3.selectAll(".checkbox").property('checked',true);
        d3.selectAll(".checkbox").each(function(d){
          if(d3.select(this).node().checked==true)
          grp.push( d3.select(this).property("value")); 
        })
        average(grp)
      }
      else
      average(grp)
    }

 }
 
