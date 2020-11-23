var colors = ["#66e045", "#0000ff", "#ff0000"];
var IntensityArray = ["Low", "Medium", "High"];
var mapdata;
var datamap; 


document.addEventListener('DOMContentLoaded', function() {
    svg = d3.select('#map');
    Promise.all([d3.json('data/map-geo.json')]).then(function(json){
        mapdata = json
    })
    Promise.all([d3.csv('data/uncertainty_mc1_data.csv')]).then(function(val){
      uncerData = val;
      uncerData=uncerData[0];
  })
    Promise.all([d3.csv('data/aggregated_mc1_data.csv')]).then(function(values){
    datamap = values;
    // drawallCharts();
    })
  });

  console.log(mapdata);
  console.log(datamap);

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
 }

function gridData() {
	var data = new Array();
	var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
	var ypos = 1;
	var width = 60;
	var height = 60;
	var click = 0;
	var cityNumber = 1 ; 
	// iterate for rows	
	for (var row = 0; row < 4; row++) {
		data.push( new Array() );
		// iterate for cells/columns inside rows
		for (var column = 0; column < 5; column++) {
			var index = (column+row)%3;
			data[row].push({
				x: xpos,
				y: ypos,
				width: width,
				height: height,
				click: click,
				city: cityNumber,
				color: colors[index],
				intensity:index,
			})
			// increment the x position. I.e. move it over by 50 (width variable)
			cityNumber++;
			xpos += width;
		}
		// reset the x position after a row is complete
		xpos = 1;
		// increment the y position for the next row. Move it down 50 (height variable)
		ypos += height;	
	}
	return data;
}

var gridData = gridData();	
// I like to log the data to the console for quick debugging
console.log(gridData);

// var svg = d3.select('svg').attr("width","500px").attr("height","500px");


var grid = d3.select("body")
	.append("svg")
	.attr("width","510px")
	.attr("height","510px")
	
var row = grid.selectAll(".row")
	.data(gridData)
	.enter()
	.append("g")
	.attr("class", "row");


var tooltip = d3.select("body").append("div").attr("class", "tooltip-donut").style("opacity", 0);

var column = row.selectAll(".square")
	.data(function(d) { return d; })
	.enter()
	.append("rect")
	// .append('text').text(function(d){ return d.city})
	.attr("class","square")
	.attr("x", function(d) { return d.x ; })
	.attr("y", function(d) { return d.y ; })
	.attr("width", function(d) { return d.width; })
	.attr("height", function(d) { return d.height; })
	.style("fill", function(d){return d.color })
	.style("stroke", "#222")
	.style("cursor", "pointer")
    // .attr("transform", `translate(${-100} ${-100}) scale(0.1) rotate(-360)`).attr("stroke-width", 0).attr("stroke", "black")
    .on('mouseover', function(d,i) 
    {
      d3.select(this).attr('class','hoverCountryMap');
    })
    .on('mousemove',function(d)
    {
		tooltip.style("opacity", 1).transition().duration(50);
	//  var title = "Restaurant Name: "+ name  + "<br>" + "Latitude: " + lat +"<br>"+"Longitude: " + long +"<br>" +  "Google Rating: " + googleRatings +  "<br>" + "Yelp Rating: " + yelpRatings + "<br>" + "Average Rating: " + averageRatings;
	var title = "City: " + d.city + "<br>" + "Intensity: " + IntensityArray[d.intensity] + "<br>";
	tooltip.html(title).style("top", (d3.event.pageY - 15) + "px").style("left", (d3.event.pageX + 10) + "px");
   }).on('mouseout', function(d,i)
   {
     d3.select(this).attr('class','countrymap')
     tooltip.style("opacity", 0).transition().duration('50');
   })
	// .on('click', function(d) {
    //    d.click ++;
    //    if ((d.click)%4 == 0 ) { d3.select(this).style("fill","#fff"); }
	//    if ((d.click)%4 == 1 ) { d3.select(this).style("fill","#2C93E8"); }
	//    if ((d.click)%4 == 2 ) { d3.select(this).style("fill","#F56C4E"); }
	//    if ((d.click)%4 == 3 ) { d3.select(this).style("fill","#838690"); }
	// });

	// var text = row.selectAll(".square")
	// .data(function(d) { return d; })
	// .enter()
	// .append("text").text("Hello How are you?")
	// .attr("class","square")
	// .attr("x", function(d) { return d.x ; })
	// .attr("y", function(d) { return d.y ; })
	// .style("fill", function(d){return d.color })
	// .style("stroke", "#222")

	// var rect = grid.append("rect").attr("x",100).attr("y",100).attr("width",100).attr("height",100);
	// var text = rect.append("text").text("Hi there").attr("stroke", "red").attr("stroke-width",5);