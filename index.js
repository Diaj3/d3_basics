//d3.select('div').style('color','yellow')
//.attr('class','head' )

// ---------------------------------------------------- Testing d3.select interactions ------------------------------------------------------------------


var dataset = [80, 140, 170, 200, 80, 70, 160];

//d3.select('#test')  Selects using the id

d3.select('div') //Selects the first one from the whole that meets the requirement (So it selects the first div)
    .selectAll('p') //Selects all that meet the requirement
    .data(dataset)
    .enter() //takes data items and performs 
    .append('p') //appends paragraph for each data element
    //.text('Trying, pls work')
    .text(function(d) {return d+2;});

// ---------------------------------------------------- BARCHART ------------------------------------------------------------------

var dataset = [80, 140, 170, 200, 80, 70, 160];

var svgWidth = 500, svgHeight = 300, barPadding = 5;
var barWidth = (svgWidth/ dataset.length);

//Give our svg the measures
var svg = d3.select('#barchart')
    .attr("width", svgWidth)
    .attr("height", svgHeight);


//Takes in to account the scale of our chart compared to our values, we don't want the bars to be 
//extremly small (For example if our default chart height is 500 and an entry is 5)
//This leads to a bug if you want to add text to the top of each collum since the height is defined by the maximum entry
//we are left with no space to add more text

var yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset)]) //we get the maximum number of our dataset
    .range([0, svgHeight]); //our range is conditioned by our svg height


//Creating the barchart
var barChart = svg.selectAll("rect") //returns an empty selection since we dont have a rect in the html so far
    .data(dataset)
    .enter() //takes the dataset and performs further operations, it will call ALL the following methods for each dataset entry
    .append("rect")
    .attr("y", function(d) {
        return svgHeight - yScale(d)
    })
    .attr("height", function(d) {
        return yScale(d);
    })
    .attr("width", barWidth - barPadding)
    .attr("transform", function(d, i){
        var translate = [barWidth * i, 0];
        return "translate("+ translate +")"; //We don't want the bars to start at the same position, so we need to translate them one after another
    });

//adding the text
var text = svg.selectAll("text") //just like above, since we don't have any text element, so far this will return an empty selection
    .data(dataset)
    .enter()
    .append("text")
    .text(function(d){ //Either takes a string or a function as a parameter
        return d;
    })
    .attr("y", function(d, i){
        return svgHeight - yScale(d) - 2; //We subtract 2 because we want our number to be slightly above the bar
    })
    .attr("x", function(d, i){
        return barWidth * i;
    })

// ------------------------------------------------------------ AXES -------------------------------------------------------------------------------

//d3 provides default axes d3.axistop(), bottom(), right(), left()
var data = [80, 100, 56, 120 ,30 ,155, 120, 160];
var svgWidth = 500, svgHeight = 300;

var svg = d3.select('#axes')
    .attr("width", svgWidth)
    .attr("height", svgHeight);

//Scale is same as above
var xScale = d3.scaleLinear()
    .domain([0, d3.max(data)])
    .range([0, svgWidth]);

var yScale = d3.scaleLinear()
    .domain([0, d3.max(data)])
    .range([svgHeight, 0]);

//Default d3.js axes
var x_axis = d3.axisBottom()
    .scale(xScale);

var y_axis = d3.axisLeft()
    .scale(yScale);

 //Append group element
svg.append("g")
    .attr("transform", "translate(50, 10)")
    .call(y_axis);

var xAxisTranslate = svgHeight - 20;

svg.append("g")
    .attr("transform", "translate(50, " + xAxisTranslate +")")
    .call(x_axis);

// ------------------------------------------------------------ PIE CHART ------------------------------------------------------------------------------

//Collection of objects with name of the platform and each share
var data = [
    {"platform": "Android", "percentage": 40.11},
    {"platform": "Windows", "percentage": 36.69},
    {"platform": "iOS", "percentage": 13.06}
];

var svgWidth = 500, svgHeight = 300, radius = Math.min(svgWidth, svgHeight) / 2;

var sgv = d3.select('#pie')
    .attr("width", svgWidth)
    .attr("height", svgHeight);

//Create a group element to hold pie chart
var g = svg.append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")"); //We translate it to the center of our svg container

//Select the range of colors provided by d3
var color = d3.scaleOrdinal(d3.schemeCategory10);

//Prepare the data to be compatible to drawing a pie chart we use the d3.pie() method
var pie = d3.pie().value(function(d){
    return d.percentage;
});

//Create part elements using the ac data, uses outer and inner Radius to define the boundaries of our chart
var path = d3.arc()
    .outerRadius(radius)
    .innerRadius(0);

//We enter the info into our chart
var arc = g.selectAll("arc")
    .data(pie(data))
    .enter()
    .append("g");

//Append the elements
arc.append("path")
    .attr("d", path)
    .attr("fill", function(d) { return color(d.data.percentage); })

// ------------------------------------------------------------ LINE CHART ------------------------------------------------------------------------------

//API to fetch historical data of Bitcoin Price Index
//Sample Request
const api = 'https://api.coindesk.com/v1/bpi/historical/close.json?start=2017-12-31&end=2018-04-01';

//Sample JSON Response:
//{"bpi":{"2013-09-01":128.2597,"2013-09-02":127.3648,"2013-09-03":127.5915,"2018-09-04":120.5738,"2019-09-05":120.5333},"disclaimer":"This data was produced from the CoinDesk Bitcoin Price Index. BPI value data returned as USD.","time":{"updated":"Sep 6, 2013 00:03:00 UTC","updatedISO":"2013-09-06T00:03:00+00:00"}}

//EventListener that gets fired when the DOM has been loaded for converting data for the lineChart
document.addEventListener("DOMContentLoaded", function(event) {
fetch(api)
    .then(function(response) { return response.json(); })
    .then(function(data) {
        var parsedData = parseData(data);
        drawChart(parsedData);
    })
    .catch(function(err) { console.log(err); })
});

//Makes an array of obj that contains the date and price associated
function parseData(data) {
    var arr = [];
    for (var i in data.bpi) {
        arr.push({
            date: new Date(i), //date
            value: +data.bpi[i] //convert string to number
        });
    }
    return arr;
}

//Function responsible for creating the line chart
function drawChart(data) {
    //Variables to define width and height of the chart
    var svgWidth = 600, svgHeight = 400;
    var margin = { top: 20, right: 20, bottom: 30, left: 50 };
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var svg = d3.select('.line-chart')
        .attr("width", svgWidth)
        .attr("height", svgHeight);
    
    //Pushes the group foward and down by the amount provided
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //defining the scales like in the examples prior
    var x = d3.scaleTime()
        .rangeRound([0, width]);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    //d3.line is a function that returns another function that creates the line
    var line = d3.line()
        //each attribute is passed through the scale method
        .x(function(d) { return x(d.date)})
        .y(function(d) { return y(d.value)})
        //the domain function is designed to let d3 know about the scope of the data when it is passed through the scale function
        //the extent method takes an anonymous function which returns a data value and in the end returns the min and max values of the date/value
        x.domain(d3.extent(data, function(d) { return d.date }));
        y.domain(d3.extent(data, function(d) { return d.value }));


    //STILL NOT UNDESTANDING THIS PART 100% CHECK LATER
    g.append("g")
        //apply some transformations to the group
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)) //when we are using the call function we are actually calling d3.axisBottom(x) on our newly created group element
        .select(".domain") //Select any classes of domain and remove it
        .remove();

    //This block of code generates the y Axis
    g.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Price ($)");

    //The line we see in the chart
    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line); //Creates the line for the "d" attribute
}


