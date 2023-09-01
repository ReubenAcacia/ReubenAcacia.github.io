let box_svg = d3.select("#boxplotContainer").append("svg")
    .attr("viewBox", "-25 -5 320 210") 
    .attr("id", "boxplotSvg");

//Options
let width = 300;
let height = 200;
let ax_font_size = "5px";
let ax_weight = "0.25px";

let countries = ['United Kingdom', 'France', 'Germany', 'Netherlands', 'Denmark'];

let quantiles_unweighted = {"Germany": {"q1": 0.8357348703170029, "q2": 1.0, "q3": 1.207492795389049}, "Denmark": {"q1": 0.8851351351351351, "q2": 1.0, "q3": 1.170045045045045}, "Spain": {"q1": 0.9140969162995595, "q2": 1.0, "q3": 1.2422907488986783}, "France": {"q1": 0.9330855018587361, "q2": 1.0, "q3": 1.1561338289962826}, "Italy": {"q1": 0.75, "q2": 1.0, "q3": 1.2055555555555555}, "Netherlands": {"q1": 0.9056356487549148, "q2": 1.0, "q3": 1.1448230668414154}, "Poland": {"q1": 0.8691588785046729, "q2": 1.0, "q3": 1.1869158878504673}, "United Kingdom": {"q1": 0.8297737408453009, "q2": 1.0, "q3": 1.2350763062067838}}
let quantiles_nuts3 = {"Denmark": {"q1": 0.8988690497909927, "q2": 1.0, "q3": 1.13170729487961}, "United Kingdom": {"q1": 0.8311065295003994, "q2": 1.0, "q3": 1.269002889661404}, "Germany": {"q1": 0.8243325937477065, "q2": 1.0, "q3": 1.2231540469082363}, "Spain": {"q1": 0.867438950828485, "q2": 0.9999999999999999, "q3": 1.3005108376290155}, "France": {"q1": 0.8590398412733005, "q2": 1.0, "q3": 1.1848432276233725}, "Italy": {"q1": 0.6560532777725007, "q2": 1.0, "q3": 1.137537424904338}, "Netherlands": {"q1": 0.8913022005356929, "q2": 1.0, "q3": 1.1697285766015968}, "Poland": {"q1": 0.8793245800999343, "q2": 1.0, "q3": 1.2534860963329633}}
let quantiles = {"Denmark": {"q0": 0.7837115870276402, "q1": 0.9292826828363121, "q2": 1.0, "q3": 1.108973573827493, "q4": 1.4378495250000438}, "United Kingdom": {"q0": 0.7427471006375937, "q1": 0.8984282105613345, "q2": 1.0, "q3": 1.1867895123556627, "q4": 7.0833425837297534}, "Germany": {"q0": 0.7234930666776918, "q1": 0.8607400932574523, "q2": 1.0, "q3": 1.1226466890965092, "q4": 1.667502855733173}, "Spain": {"q0": 0.8114258649711136, "q1": 0.8877807712514793, "q2": 1.0, "q3": 1.288207453111353, "q4": 1.521423496820838}, "France": {"q0": 0.31004071867460153, "q1": 0.9221135537254428, "q2": 1.0, "q3": 1.0992283677237773, "q4": 1.96572208231835}, "Italy": {"q0": 0.538119021270963, "q1": 0.5949945638921474, "q2": 1.0, "q3": 1.0769938440042504, "q4": 1.4798273084951483}, "Netherlands": {"q0": 0.7268778255432972, "q1": 0.9000524799047096, "q2": 1.0000000000000002, "q3": 1.0793279807089393, "q4": 1.4264122846084766}, "Poland": {"q0": 0.7523232880599361, "q1": 0.8733495734086678, "q2": 1.0, "q3": 1.123267534993915, "q4": 2.4232729068035836}}
//our x axis scale - not the axis itself
let x_scale = d3.scalePoint()
    .domain(countries)
    .range([0, width])
    .padding(0.4)
    .align(0.5);

let firstStageScale = d3.scaleLog()
    .domain([ 7200*0.9, 454347 ]) //Hardcoding this, sorry
    .range(
        [height,0]
    ); 

let secondStageScale = d3.scaleLog()
    .domain([ 0.3,1,17 ]) //Hardcoding this, sorry
    .range(
        [200,100,0]
    );

let sizeScale = d3.scaleLinear()
    .domain([84689.0,12252917.0])     //.domain([22025, 3644826])
    .range([1,13]) //TODO link to area not radius

let countryScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(countries);

let plotData = 'boxplotdata.json'

let foo = null

box_data = null

let plotArea, y, points_group, points_gs, points, boxplotTooltip;

// let median_Sections = ["DK013", "DE269", "ES416", "FRB01", "ITH56", "NL337", "PL618", "UKJ35"]
let median_section_names_nuts3 = ["DK042", "DE128", "FR102", "NL221", "UKM92"]
let median_section_names = ['DK03', 'UKM92', 'DE22', 'ES11', 'FRI1', 'ITC3', 'NL11', 'PL21']


// Tooltip Funcs
let boxplotMouseover = function(d) {
    console.log('mouseon');
    boxplotTooltip
       .style("opacity", 1)
    d3.select(this)
       .style("stroke", "black")
       .style("opacity", 1)
  }
let boxplotMousemove = function(d) {
    body_margin = parseFloat(window.getComputedStyle(document.body).getPropertyValue('margin-left').replace("px","")); //this is hacky, sorry :((
    
    console.log(d);
    boxplotTooltip
      .html(`<b> ${d['GEO_name']} </b> </br> Population: ${d['pop_2019']} </br> GVA Pc: ${d['2019']}</b>`)
      .style("left", (d3.mouse(document.body)[0])+5+body_margin + "px")
      .style("top", (d3.mouse(document.body)[1]) +5+ "px")  
    
  }
let boxplotMouseleave = function(d) {
    boxplotTooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }


d3.json(plotData, function (data) {
    box_data = data;
    //Defining the Plot Area
    plotArea = box_svg.append("g")
        .attr("id", "plotArea");
    foo = x_scale;

    y_scale = firstStageScale;

    //drawing the points
    points_gs = plotArea
        .append("g")
        .attr("id", "points")
            .selectAll('point')
            .data(data)
            .enter()
            .append("g")
                .attr("class", function(d){
                    if(d.Country == 'United Kingdom'){return "firstStage scatterPoint"}
                    return "secondStage scatterPoint"
                })
                .attr("GEO", d => d.GEO)
                .attr("transform", d => `translate(${x_scale(d.Country) -15 + Math.random()*30}, ${y_scale(d['2019'])})`)

    points = points_gs
        .append("circle")
            //.attr("cx", d => x(d.Country) -15 + Math.random()*30)
            //.attr("cy", d => y(d['2019']))
            .attr("r", 2)
            .attr("GEO", d => d.GEO)
            .style("fill", d => countryScale(d.Country))
            .style("stroke", "black")
            .style("stroke-width", 0.25)
            .style("opacity", 0.7)
            .on("mouseover", boxplotMouseover)
            .on("mousemove", boxplotMousemove)
            .on("mouseleave", boxplotMouseleave);

    
    //Scale the plot area
    //plotArea.style("transform", "scale(0.8)")


    // First Stage
    // Make only the UK's Label visible
    drawAxes()

    d3.select('#box_x_ax').selectAll('.tick')
        .style('opacity', function(d,i){if(i!=0){
                return(0)
            }
            return(1)
        });

    // Draw the tooltip 

    boxplotTooltip = d3.select("body")
            .append("div")
            .attr('id', 'boxplotTooltip')
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("position", "absolute");
    
    plotSectionFunctions[0]();

});

function drawAxes(){
    //Appending the x axis 
    let x_ax = d3.axisBottom(x_scale)
        .tickSize(0)
        .tickSizeOuter(0);


    plotArea.append("g")
        .attr("transform", "translate(0," + (height-8) + ")")
        .attr("id", "box_x_ax")
        .style("font-size", ax_font_size)
        .call(x_ax);

    // ... and the y axis
    let y_ax = d3.axisLeft(y_scale)
        .tickSizeOuter(0)
        .tickValues([8000, 20000, 100000, 200000])
        .tickFormat("r")
        .tickSize(0)
        .tickFormat(d3.format(",.0f"));

    plotArea.append("g")
        .attr("id", "box_y_ax")
        .style("font-size", ax_font_size)
        .style("stroke-width", ax_weight)
        .call(y_ax);

    // ... and the y axis title
    y_axis_label_group = box_svg
        .append("g")
        .attr("id", "y_axis_label_group")
        .attr("transform", `translate(-125 ${height/2})`);
    
    y_axis_label_group.append("text")
        .attr("id", "y_axis_scale")
        .attr("class", "y_axis_label")
        .style("font-size", ax_font_size)
        .text("Regional GVA Per Capita, 2019 €")
        .attr("y", height/2)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)");

}

function updateSize(attr='pop_2019', r=null){
    console.log(r)
    console.log(r>0);
    let size = d => sizeScale(d['pop_2019']);
    if(r){
        console.log('foo');
        size = r;
    }
    points
        .transition()
        .duration(600)
        .attr("r", size);
}

function updatePosition(attr="2019_rel", scale=secondStageScale){
    points_gs
        .transition()
        .duration(1200)
        .attr("transform", function(d){
            current_transform_first = d3.select(this).attr('transform').split(",")[0];
            return(`${current_transform_first}, ${scale(d[attr])})`)
        })
    let y_ax = d3.axisLeft(scale)
        .tickSizeOuter(0)
        .ticks(6)
        //.tickValues([0.3, 0.7, 1, 10])
        .tickSize(0)
        .tickFormat(d3.format(","));
    d3.select('#box_y_ax')
        .transition()
        .duration(1200)
        .call(y_ax);
}

function medians_focus(focus=true){
    if(!focus){
        // unfocus
        // Add borders to median regions and labels
        let median_circles = d3.selectAll("circle").filter(function () {
            return median_section_names.includes(d3.select(this).attr("GEO")); // filter by single attribute
        });
        median_circles.raise().attr('stroke-width', 0);
        d3.selectAll('.median_label').remove();
        return null
    }


    // Add borders to median regions and labels
    let median_circles = d3.selectAll("circle")
        .filter(function() {
            return median_section_names.includes(d3.select(this).attr("GEO")); // filter by single attribute
        })
        median_circles.attr("class", median_circles.attr("class") + " median_region")

    median_circles
        .raise()
        .style('opacity', 1)
        .style('stroke', 'rgba(26, 26, 26, 1)')
        .style('stroke-width', 2)
        
    let median_groups = d3.selectAll("g")
        .filter(function() {
            return median_section_names.includes(d3.select(this).attr("GEO")); // filter by single attribute
        })
    median_groups.attr("class", median_groups.attr("class") + " median_region")

    median_groups
        .raise()
        .append('text')
        .attr('class', 'median_label')
        .text("MEDIAN")
        .style("font-weight", "bold")
        .style("font-size", ax_font_size)
        .style("fill", 'black')
        .style("opacity", 1)
}

function drawBoxPlots(){
    let boxWidth = 35;
    countries.forEach(country => {
        /** Draw a Rect with properties
            - x: x_scale(country)-0.5*boxWidth
            - y: secondStageScale( quantiles.Q3[country] )
            - height: secondStageScale( quantiles.Q1[country] ) -  secondStageScale( quantiles.Q3[country] )
            - width: boxWidth
        
            - fill: countryScale(country)
        */
        console.log(country);
        plotArea.insert('rect', ":first-child")
            .attr("x", x_scale(country)-0.5*boxWidth)
            .attr("y", secondStageScale( quantiles[country].q3))
            .attr("height", secondStageScale( quantiles[country].q1 ) -  secondStageScale( quantiles[country].q3 ))
            .attr("width", boxWidth)
            .style("stroke", countryScale(country))
            .style("stroke-width", 0.5)
            .style("fill", "rgb(200,200,200)")
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .style("opacity", 1)



        // the upper whisker
        plotArea.append('line')
            .attr('x1', x_scale(country)-0.5*boxWidth)
            .attr('x2', x_scale(country)+0.5*boxWidth)
            .attr('y1', secondStageScale( quantiles[country].q0))
            .attr('y2', secondStageScale( quantiles[country].q0))
            .style("stroke", countryScale(country))
            .style("stroke-width", 1)
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .style("opacity", 1);


        // the upper whisker
        plotArea.append('line')
            .attr('x1', x_scale(country)-0.5*boxWidth)
            .attr('x2', x_scale(country)+0.5*boxWidth)
            .attr('y1', secondStageScale( quantiles[country].q4))
            .attr('y2', secondStageScale( quantiles[country].q4))
            .style("stroke", countryScale(country))
            .style("stroke-width", 1)
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .style("opacity", 1);

        //and the central lines
        plotArea.insert('line', ":first-child")
            .attr('x1', x_scale(country))
            .attr('x2', x_scale(country))
            .attr('y1', secondStageScale( quantiles[country].q0))
            .attr('y2', secondStageScale( quantiles[country].q4))
            .style("stroke", countryScale(country))
            .style("stroke-width", 1)
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .style("opacity", 1);

    });
}