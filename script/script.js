var svg;
var start_time="2020-04-06 00:00:00";
var datamap;
var mapdata;
var current_time="2020-04-06 00:00:00";
var last_time="2020-04-06 00:00:00"
var final_data;
var cumulative;
var Mapwidth = 550;
var Mapheight = 470;
var svgMap;
var divM;
var line_data;
var dictt={}
var uncerData,barData;
var colors = ["#ffff94", "#e59400", "#a52a2a", "#000000"];
var IntensityArray = ["Low", "Medium", "High"];
var extent = [0.0, 10.0]
var colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
                     .domain(extent);
var border=1; var bordercolor='black';
var cnt = 0 ;

document.addEventListener('DOMContentLoaded', function() {
    // svg = d3.select('#map');
    Promise.all([d3.json('data/map-geo.json')]).then(function(json){
        mapdata = json
    })
    Promise.all([d3.csv('data/uncertainty_mc1_data.csv')]).then(function(val){
      uncerData = val;
      uncerData=uncerData[0];
  })
    Promise.all([d3.csv('data/aggregated_mc1_data.csv')]).then(function(values){
    datamap = values;
    drawallCharts();
    })
  });


function getCumalativeValues(){

    let D1 = new Date(current_time)
    final_data = new Array()
    // create an array of Objects o size equal to total number of cities
    for( let x = 0; x<20; x++){
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
                if(data[k].time<=current_time && data[k].time>=last_time){// find all rows of values <= D1 date
                    cumulative_map.push(data[k])
                }
            }
    line_data=cumulative_map;
    console.log(current_time,line_data);
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
                // final_data[k].app_responses/=total;
                final_data[k].sewer_and_water/=total;
                final_data[k].power/=total;
                final_data[k].medical/=total;
                final_data[k].shake_intensity/=total;
                final_data[k].roads_and_bridges/=total;
                final_data[k].buildings/=total;
        }
        final_data[k].location = k;
    }

}


function  drawallCharts()
{
    // svg.selectAll("*").remove();
    getCumalativeValues();
    heatMap();
    pieChart();
    // lineChart();
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
      var t1= (+b.property("value") - 3300) % (+b.property("max") - 3300)
      last_time=formatDT(new Date(t1*1000));
      current_time=formatDT(new Date(t*1000));
      document.getElementById("date").value=current_time;
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
      var t1= (+b.property("value") - 3300) % (+b.property("max") - 3300)
      last_time=formatDT(new Date(t1*1000));
      current_time=formatDT(new Date(t*1000));
      document.getElementById("date").value=current_time;
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

    svgMap = d3.select('#worldMap')
    .attr("transform", "translate(50,-280)")
    .attr('width', Mapwidth)
    .attr('height', Mapheight);

    svgMap.selectAll("*").remove();

    svgMap.append('rect')
    .style("fill","white")
    .attr('width', Mapwidth)
    .attr('height', Mapheight);

    let g = svgMap.append('g');
    updateMapData();
    ////console.log("------------")
     ////console.log(mapdata[0].features);
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
        return d.properties.Nbrhood;
      });

     svgMap.selectAll(".parish-labels")
        .data(mapdata[0].features)
        .enter()
        .append("text")
        .attr("transform", function(d)  { return "translate(" + path.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .style("fill", "black")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.properties.Id; });

//       .on('mouseover', function(d,i) {
//         d3.select(this).transition()
//               .duration('50')
//               .style('stroke','cyan')
//               .attr('opacity', '.85')
//               .attr('stroke-width','4');
//        divM.transition()
//               .duration(50)
//               .style("opacity", 1);
//         divM.html(d.properties.Nbrhood)
//               .style("left", (d3.event.pageX + 10) + "px")
//               .style("top", (d3.event.pageY - 15) + "px");
//               if(d.properties.Nbrhood ==="Wilson Forest"){
//                ////console.log(d.properties)
//               }
//           ////console.log('mouseover on ' + d.properties.Nbrhood);
//    })
//    .on('mouseout', function(d,i) {
//        d3.select(this).transition()
//               .duration('50')
//               .style('stroke','black')
//               .attr('opacity', '1')
//               .attr('stroke-width','1');
//        divM.transition()
//              .duration('50')
//              .style("opacity", 0);
//      ////console.log('mouseout on ' + d.properties.Nbrhood);
//    });

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

  legendGroup
       .append("text")
       .attr("x", 100)
        .attr("y", -30)
        .style("fill", "black")
        .text("Reported Damage Intensity Levels")

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

    for(let i=1;i<=19;i++){
        let newval = avgsum[i-1];
        mapdata[0].features[i-1].properties['newkey'] = newval;
    }
    ////console.log("mapdata = ")
    ////console.log(mapdata[0].features);
 }
 function pieChart()

 {
d3.select("#piechart").selectAll("svg").remove();
  console.log("Inside Pie Chart");
  console.log(final_data);

// use final_data map to get access to all cumalative values. Index of Final Data is Location no. Ignore Index zero.
var width = 600
    height = 600
    margin = 40

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
//var radius = Math.min(width, height) / 2 - margin
var val=[1,1,1,1,1];
var radius = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];


// append the svg object to the div called 'my_dataviz'
var svg = d3.select("#piechart")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


var count1 = 0
var count2 = 0
var count3 = 0
var count4 = 0
var count5 = 0
var sum1 = 0
var sum2 = 0
var sum3 = 0
var sum4 = 0
var sum5 = 0
console.log("final",final_data);
for(let i=1;i<=19;i++){
      if(!Number.isNaN(final_data[i].sewer_and_water)){count1+=1;sum1+=final_data[i].sewer_and_water}
      if(!Number.isNaN(final_data[i].power)){count2+=1;sum2+=final_data[i].power}
      if(!Number.isNaN(final_data[i].medical)){count3+=1;sum3+=final_data[i].medical}
      if(!Number.isNaN(final_data[i].buildings)){count4+=1;sum4+=final_data[i].buildings}
      if(!Number.isNaN(final_data[i].roads_and_bridges)){count5+=1;sum5+=final_data[i].roads_and_bridges}     
    }
  var pie_sum = []
  pie_sum.push(sum1/count1,sum2/count2,sum3/count3,sum4/count4,sum5/count5);
  console.log("data",pie_sum,val);

var pie = d3.pie()
.value(function(d) {return d; });
// console.log("hi",val)
var data_ready = pie(val);
var color = ["red","blue","pink","orange","yellow"]
var pie1 = [{data: 1, index: 0, value: 1, startAngle: 0, endAngle: 1.2566370614359172, padAngle: 0},
{data: 1, index: 1, value: 1, startAngle: 1.2566370614359172, endAngle: 2.5132741228718345, padAngle: 0},
{data: 1, index: 2, value: 1, startAngle: 2.5132741228718345, endAngle: 3.7699111843077517, padAngle: 0},
{data: 1, index: 3, value: 1, startAngle: 3.7699111843077517, endAngle: 5.026548245743669, padAngle: 0},
{data: 1, index: 4, value: 1, startAngle: 5.026548245743669, endAngle: 6.283185307179586, padAngle: 0}]

// console.log("yoshi",pie1)
// console.log("amy",data_ready)
for(i=0;i<pie1.length;i++)
{
  pie1[i].data=pie_sum[i];
  pie1[i].value=pie_sum[i];
}
svg
  .selectAll('whatever')
  .data(pie1) 
  .enter()
  .append('path')
  .attr('d', d3.arc()
    .innerRadius(0)
    .outerRadius(function(d,i){
         //console.log("radius",i,radius[i]);
      return 35*pie_sum[i];})  
    )
  .attr('fill', function(d,i){
    return color[i];
  })
  .attr("stroke", "black")
  .style("stroke-width", "2px")
  .style("opacity", 0.7)
 }
 function lineChart(line_avg,dictt)
 {

 var lheight=400;
 var lwidth=550;
 var lmargin={top:60,right:30,bottom:20,left: 150};

 var div = d3.select("body").append("div")
      .attr("class", "tooltip-donut")
      .style("opacity", 0);
 //d3.select("#linechart").selectAll("svg").remove();


 var lsvg = d3.select("#linechart")
     .attr("width", lwidth + lmargin.left + lmargin.right+400)
     .attr("height", lheight + lmargin.top + lmargin.bottom+300)

  lsvg.selectAll("*").remove()

  var lsvg = d3.select("#linechart")
      .attr("width", lwidth + lmargin.left + lmargin.right+300)
      .attr("height", lheight + lmargin.top + lmargin.bottom+300)
       .append("g")
       .attr("transform",
             "translate(" + lmargin.left + "," + lmargin.top + ")");

 //lsvg.selectAll("*").remove()
 //d3.select("#linechart").selectAll("svg").remove()

  avg_copy =[];
  line_avg.forEach((e)=>!isNaN(e)?avg_copy.push(e):avg_copy.push(0))

  avg_copy.sort(function(a, b){return a - b});
  var first = line_avg.indexOf(avg_copy[avg_copy.length-1])+1;

  var top=[]
  top=[first]
  console.log('cc',first,line_avg,avg_copy);

  time_map = new Array();
  datamap.forEach(function(data){
          for( k in data){
            time_map.push(data[k].time)
          }})
 // ////////////console.log(time_map);


////////////console.log('time',time_five);
var plot_data=[]

var fin_data=[];
var time_x=[]
line_data.forEach(function(d){
  time_x.push(new Date([d.time]));
  if(d.location==first){
fin_data.push([new Date(d.time),d.location,'roads_and_bridges',d.roads_and_bridges]);
fin_data.push([new Date(d.time),d.location,'power',d.power]);
fin_data.push([new Date(d.time),d.location,'sewer_and_water',d.sewer_and_water]);
fin_data.push([new Date(d.time),d.location,'medical',d.medical]);
fin_data.push([new Date(d.time),d.location,'buildings',d.buildings]);

}
})
//console.log('loc',first);
//////console.log(fin_data,current_time,first);

//console.log(first,line_avg,avg_copy,fin_data);
var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
  .key(function(d) {  return d[2];})
  .entries(fin_data);

//////console.log(sumstat);
var res = sumstat.map(function(d){ return d.key})

  var x = d3.scaleTime()
      .domain(d3.extent(time_x, function(d) {return d; }))
      .range([0,lwidth-30]);

      lsvg.append("g")
      .attr("transform", `translate(0,${lheight - lmargin.bottom+20})`)
      .attr("class","axisGray")
      .call(d3.axisBottom(x)
        .ticks(12))
      .style("stroke","gray")
      .style("opacity",0.6)
      .call(g => g.select(".domain")
          .remove())

    lsvg.append("g")
    .style("stroke","grey")
    .attr("transform", "translate(0," + lheight + ")")
    .call(x);



// list of group names
lsvg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - lmargin.left+65)
    .attr("x",0 - (lheight / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Impact")
    .style("font-family","sans-serif")
    .attr("fill","gray")
    .style("opacity",0.6)
    .style("font-weight",600)
;


  ////////////console.log(res);
  var y = d3.scaleLinear()
    .domain([0,10])
    .range([ lheight, 0 ]);

  lsvg.append("g")
    .style("stroke","grey")
    .style("opacity",0.65)
    .call(d3.axisRight(y)
          .tickSize(lwidth - lmargin.left - lmargin.right+150))
    .call(g => g.select(".domain")
      .remove())
    .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-dasharray", "5,10"))
    .call(g => g.selectAll(".tick text")
        .attr("x", -30)
        .attr("dy", 4))
        .style("color","grey");

  lsvg.append("g")
  .call(x);



lsvg.append("circle").attr("cx",530).attr("cy",30).attr("r", 6).style("fill", '#e41a1c')
lsvg.append("circle").attr("cx",530).attr("cy",60).attr("r", 6).style("fill", '#377eb8')
lsvg.append("circle").attr("cx",530).attr("cy",90).attr("r", 6).style("fill", '#4daf4a')
lsvg.append("circle").attr("cx",530).attr("cy",120).attr("r", 6).style("fill", '#984ea3')
lsvg.append("circle").attr("cx",530).attr("cy",150).attr("r", 6).style("fill", '#ff7f00')
lsvg.append("text").attr("x", 550).attr("y", 30).text("roads_and_bridges").style("font-size", "15px").attr("alignment-baseline","middle")
lsvg.append("text").attr("x", 550).attr("y", 60).text("power").style("font-size", "15px").attr("alignment-baseline","middle")
lsvg.append("text").attr("x", 550).attr("y", 90).text("sewer_and_water").style("font-size", "15px").attr("alignment-baseline","middle")
lsvg.append("text").attr("x", 550).attr("y", 120).text("medical").style("font-size", "15px").attr("alignment-baseline","middle")
lsvg.append("text").attr("x", 550).attr("y", 150).text("buildings").style("font-size", "15px").attr("alignment-baseline","middle")




  lsvg.append("text")
      .attr("transform",
            "translate(" + (lwidth/2) + " ," +
                           (lheight + 40) + ")")
      .style("text-anchor", "middle")
      .text("Time")
      .style("font-family","sans-serif")
      .attr("font-size",18)
      .style("fill","gray")
      .style("opacity",0.7)
      .style("font-weight",600);

  // Add the line

      var bisect = d3.bisector(function(d) { return d[0]; }).left;

      // Create the circle that travels along the curve of chart
      var focus = lsvg
        .append('g')
        .append('circle')
          .style("fill", "none")
          .attr("stroke", "black")
          .attr('r', 10)
          .style("opacity", 0)

      var focusText = lsvg
        .append('g')
        .append('text')
          .style("opacity", 0)
          .attr("text-anchor", "left")
          .attr("alignment-baseline", "middle")


  var color = d3.scaleOrdinal()
    .domain(res)
    .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00'])


    lsvg.selectAll(".line")
        .data(sumstat)
        .enter()
        .append("path")
          .attr("fill", "none")
          //.attr("shape-rendering" , "crispEdges")
          .attr("stroke", function(d){
            return color(d.key) ;
            })
          .attr("stroke-width", 2)
          .attr("stroke-dasharray","5,5")
          .attr("d", function(d){
          return d3.line()
              .x(function(d) { return x(d[0]); })
              .y(function(d) { return y(+d[3]); })
              (d.values)
          })


          lsvg
            .append('rect')
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('width', lwidth)
            .attr('height', lheight)
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseout', mouseout);

          // What happens when the mouse move -> show the annotations at the right positions.
          function mouseover() {
            focus.style("opacity", 1)
            focusText.style("opacity",1)
          }

          function mousemove() {
            // recover coordinate we need
            var x0 = x.invert(d3.mouse(this)[0]);
            var i = bisect(fin_data, x0, 1);
            selectedData = fin_data[i]
            focus
              .attr("cx", x(selectedData[0]))
              .attr("cy", y(selectedData[3]))

            div.transition()
                .duration(50)
                .style("opacity", 1);

           div.html("Tim: "+selectedData[0]+
                                              "</br>" +
                                              "Impact: "+ selectedData[3])
              .style("left", (d3.event.pageX +8) + "px")
              .style("top", (d3.event.pageY - 15) + "px");

            }
          function mouseout() {
            //div.select("svg").remove();
            div.transition()
                .duration(50)
                .style("opacity", 0);
            focus.style("opacity",0);
          }
 }



// create grid.
 function createGrid() {

	var data = new Array();
	var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
	var ypos = 1;
	var width = 60;
	var height = 60;
	var click = 0;
  var cityNumber = 0;
  var allKeys = [];
  var maxi = 0 ;
  for(let i = 0 ; i<final_data.length ; i++)
  {
     if(final_data[i].app_responses > maxi)
         maxi = final_data[i].app_responses;
  }

  var range = maxi/3;

  var low = range;
  var mid = low + range;

  var responseArray  = []

  for(let i = 1 ; i<=19 ; i++)
  responseArray.push(final_data[i].app_responses);

  cityNumber = 0 ;

  if(mapdata[0].features){

  for (var row = 0; row < 4; row++)
  {
    data.push( new Array());
    for (var column = 0; column < 5; column++)
    {
      var index  = 3;
      if(responseArray[cityNumber] <= low)
        index = 0;
      else if(responseArray[cityNumber] > low && responseArray[cityNumber] <= mid)
        index = 1 ;
      else if(responseArray[cityNumber] > mid)
        index = 2;

			data[row].push({
				x: xpos,
				y: ypos,
				width: width,
				height: height,
				click: click,
				city: cityNumber+1,
				color: colors[index],
        intensity:index,
        appResponse: responseArray[cityNumber],
			})
      // increment the x position. I.e. move it over by 50 (width variable)
      if(cityNumber < 19)
       cityNumber++;

      xpos += width;
		}
		// reset the x position after a row is complete
		xpos = 1;
		// increment the y position for the next row. Move it down 50 (height variable)
		ypos += height;
  }
}
	return data;
}

 function gridChart()
 {
   ////console.log("Inside Grid Chart");
   ////console.log(final_data);

 // use final_data map to get access to all cumalative values. Index of Final Data is Location no. Ignore Index zero.

d3.selectAll("#tool").remove();
updateMapData();

var gridData = createGrid();

var grid = d3.select("#grid")
	        .attr("width","510px")
          .attr("height","510px")
          .attr("transform", "translate(190,-150)")

grid.selectAll("*").remove();

grid.append("rect")
.attr("width",156)
.attr("height",56)
.style("fill",colors[0])
.attr("transform", "translate(-100,290)")

grid.append("text")
.text("Low")
.style("stroke","black")
.attr("transform", "translate(13.5,323)")

grid.append("rect")
.attr("width",60)
.attr("height",56)
.style("fill",colors[1])
.attr("transform", "translate(120,290)")

grid.append("text")
.text("Medium")
.style("stroke","black")
.attr("transform", "translate(123.5,323)")

grid.append("rect")
.attr("width",60)
.attr("height",56)
.style("fill",colors[2])
.attr("transform", "translate(245,290)")

grid.append("text")
.text("High")
.style("stroke","black")
.attr("transform", "translate(257,323)")

var row = grid.selectAll(".row")
	.data(gridData)
	.enter()
	.append("g")
	.attr("class", "row");

var tooltip = d3.select("body").append("div").attr("class", "tooltip-donut").style("opacity", 0).attr("id","tool");

var column = row.selectAll(".square")
	.data(function(d) { return d; })
	.enter()
	.append("rect")
	.attr("class","square")
	.attr("x", function(d) { return d.x ; })
  .attr("y", function(d) { return d.y ; })
  .attr("title", function(d){return d.city})
	.attr("width", function(d) { return d.width;})
	.attr("height", function(d) { return d.height; })
	.style("fill", function(d){
    return d.color
  })
	.style("stroke", "#222")
	.style("cursor", "pointer")
    .on('mouseover', function(d,i)
    {
      d3.select(this).attr('class','hoverCountryMap');
    })
    .on('mousemove',function(d)
    {
      if(d.city != 20)
      {
		tooltip.style("opacity", 1).transition().duration(50);
    var title = "Location: " + d.city + "<br>" +  "Response: " + d.appResponse;
    tooltip.html(title).style("top", (d3.event.pageY - 15) + "px").style("left", (d3.event.pageX + 10) + "px");
      }
  }).on('mouseout', function(d,i)
   {
    if(d.city != 20)
    {
     d3.select(this).attr('class','countrymap')
     if(d.city != 20)
     tooltip.style("opacity", 0).transition().duration('50');
    }
   })

var currentCity = 1;
var x = 25;
var y  = 35;
var gap = 60 ;
for(let i = 0 ; i<4 ; i++)
{
  x = 25 ;
  for(let j = 0 ; j<5 ; j++)
  {
    grid.append("text")
    .text(currentCity)
    .style("stroke","black")
    .attr("transform", "translate(" + x + "," + y + ")")
    currentCity++;
    x += gap ;
  }
  y += gap ;
}
}

 function innovativeChart()
 {
 // use final_data map to get access to all cumalative values. Index of Final Data is Location no. Ignore Index zero.
 var iheight=150;
 var iwidth=600;
 var imargin={top: 20, right: 20, bottom: 20, left: 60};

 var avg_val=[];
 var loc=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];

  isvg = d3.select('#imap')
  .attr("transform", "translate(700,0)")
  .attr('width', iwidth)
  .attr('height', iheight*2);

  // var isvg = insvg.append("g")
  //                 .attr("id", "iplot");

  isvg.selectAll("*").remove()

  // Add border to isvg
  isvg.append("rect")
      .attr("x", imargin.left)
      .attr("y", imargin.top)
      .attr("rx", '0.25em').attr("ry", '0.25em')
      .attr("height", (iheight - imargin.top)*2)
      .attr("width", iwidth-imargin.left-5)
      .style("stroke", bordercolor)
      .style("stroke-linecap", "round")
      .style("fill", "none")
      .style("stroke-width", border);

  xScale = d3.scalePoint()
            .domain([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19])
            .range([imargin.left,iwidth-imargin.right]);
  yScale = d3.scaleLinear()
            .domain([10, 0])
            // .range([iheight-imargin.top, 0]);
            .range([iheight, 0]);

  const xaxis = d3.axisBottom(xScale);
  const yaxis = d3.axisLeft(yScale);

  update();

  isvg.append("g")
  .attr("class", "xAxis")
  .attr("transform", "translate(0,"+ (iheight-imargin.bottom)+ ")")
  .call(xaxis);

  isvg.append("g")
  .attr("class", "yAxis")
  .attr("transform", "translate("+imargin.left+","+ (iheight-imargin.bottom)+ ")")
  .call(yaxis)

  // Uncertainty Label
  isvg.append("text")
  .attr("class", "yAxisLabel")
  .attr("transform", "rotate(-90)")
  .attr("x", -iheight-imargin.left)
  .attr("y", imargin.right)
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Uncertainty")
  .style("font-family","sans-serif")
  .attr("fill","black")
  .style("opacity",0.9)
  .style("font-weight",200)

  // Damage Intensity Label
  damageLabel = isvg.append("text")
  .attr("class", "yAxisLabel")
  .attr("transform", "rotate(-90)")
  .attr("x", -iheight+imargin.left+10)
  .attr("y", imargin.right-10)
  .attr("dy", "1em")
  .style("text-anchor", "middle");

  damageLabel.append("tspan")
            .attr("x", -iheight+imargin.left+10)
            .attr("dy", "1.2em")
            .text("Damage");

  damageLabel.append("tspan")
            .attr("x", -iheight+imargin.left+10)
            .attr("dy", "1.2em")
            .text("Intensity")
  
  d3.selectAll('tspan')
    .style("font-family","sans-serif")
    .attr("fill","black")
    .style("opacity",0.9)
    .style("font-weight",200)


  isvg.select('.xAxis').selectAll(".tick")
    .each(function (d, i) {
        if ( d == 0 ) {
            this.remove();
        }
    });


    //Amy:
    d3.selectAll(".checkbox").on("change",update);

    function average(grp)
    { isvg.append("g").attr("id", "bars");
      velScale=d3.scaleLinear().domain([0,10]).range([1000,10]);
     l=grp.length;
     avg_val=[];
     isvg.selectAll("circle").remove()
     isvg.selectAll("bars").remove()
     var circle = isvg.selectAll("circle").data(loc).enter()
     .append("circle")
     .attr("r", 10);
      barData=[];
     circle.interrupt();

      for(j=0;j<final_data.length-1;j++)
      {
        var val=0,uncertval=0;
      for(i=0;i<l;i++)
      {
        val+=final_data[j+1][grp[i]];
        if(final_data[j][grp[i]]<uncerData[j][grp[i]+"_low"])
        {
          uncertval+=(uncerData[j][grp[i]+"_low"]-final_data[j][grp[i]]);
        }
        if(final_data[j][grp[i]]>uncerData[j][grp[i]+"_high"])
        {
          uncertval+=(final_data[j][grp[i]]-uncerData[j][grp[i]+"_low"]);
        }
      }

      barData.push(uncertval/l)

      avg_val.push((val/l))
      }



  var bars = isvg.select("#bars")
  .selectAll("rect")
  .data(barData);

bars.enter().append("rect")
.attr("class", "bar")
.attr("width", 20)
.attr("x", function(d, i) {
  return xScale(i+1) - (imargin.right/2)
})
.attr("y", iheight)
.attr("height", function(d) {
  return yScale(d);
});

    circle
      .each(function transition(d){
        d3.select(this)
    .attr("cy", (iheight-imargin.bottom-10))
    .attr("cx",  xScale(d) )
    .style('fill', d => {

      return colorScale(avg_val[d-1]);
  })
  .attr("stroke","black")
    .transition()

    .duration(function (params) {

              return velScale(avg_val[d-1])
    })
    .attr("cy", (iheight-imargin.bottom-100))
    .attr("cx", xScale(d))
    .transition()
    .duration( velScale(avg_val[d-1]))
    .attr("cy", iheight-imargin.bottom-10)
    .attr("cx", xScale(d))
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
//d3.select("#linechart").selectAll("svg").remove();
lineChart(avg_val);
 }
