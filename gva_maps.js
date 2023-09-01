
let viewbox_width = 400;
let viewbox_height = 400;

function drawGvaMap(projection, shp, targetDiv, id="gva_map"){
    console.log(shp);
    let path = d3.geoPath().projection(projection)

    targetSvg = targetDiv
        .append("svg")
        .attr("class", "gvaSvg")
        .attr("viewBox", `0 0 ${viewbox_width} ${viewbox_height}`);

    if(shp.properties.CNTR_CODE == 'UK'){
        targetSvg.attr("viewBox", `100 0 200 ${viewbox_height}`); // This is an awful way of doing this. Ideally (TODO) I'd dynamically update viewboxes for everything 
    }

    mapG = targetSvg
        .append("g")
            .attr("id", id+"_paths")
            .selectAll("path")
                .data(shp.features)
                    .enter()
                    .append("path")
                        .attr("d", path)
                        .attr("name", function(d){return d.properties.NAME_LATN;})
                        .attr("class", "gvaMapPath")
                        .style("fill", d => {
                            if (! d.properties['2019'] > 0 ){
                                return "rgb(219, 219, 219)";
                            }
                            return gvaColourScale(d.properties['2019']);
                        })
                        .style("stroke", "black")
                        .style("stroke-width", "1px")
                    .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
    gBBox = mapG.node().getBBox();
    mapG
        .attr("viewBox", `${gBBox.x} ${gBBox.y} ${gBBox.x+gBBox.width} ${gBBox.y+gBBox.height}`);
}

var mouseover = function(d) {
    mouseOn = true;
    Tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
}
var mousemove = function(d) {
    mouseOn = true;
    //console.log(this)
    body_margin = parseFloat(window.getComputedStyle(document.body).getPropertyValue('margin-left').replace("px","")); //this is hacky, sorry :((
    Tooltip
    .html(`<b>${d.properties['NAME_LATN']}</b> </br> 2019 GVA: €${d.properties['2019']}`)
    //   .style("left", (p_x+d3.mouse(this)[0]-25) + "px")
    //   .style("top", (p_y+d3.mouse(this)[1]-15) + "px")
    .style("left", (d3.mouse(document.body)[0])+5+body_margin + "px")
    .style("top", (d3.mouse(document.body)[1]) +5+ "px")
}
var mouseleave = function(d) {
    mouseOn = false;
    setTimeout(
      function() {
          if(!mouseOn){
            Tooltip
                  .transition()
                  .duration(200)
                  .style("opacity",0);
          }
  }, 500);
}

let nuts3_shp = "GVA_nuts.geoJson"
let nuts3_data = null;
var projection = null;
let gvaColourScale = null;
let Tooltip = null;

let mouseOn = false;

function toggleMap(element){
    console.log(element);
    element = d3.select(element);
    console.log(element.empty())
    if(element.style("flex-basis")==("33%")){
        d3.selectAll('.gvaMapDiv')
            .style("flex-basis", "33%");
        element
            .transition()
            .duration(1000)
            .style("flex-basis", "80%");
    } else {
        element
            .style("flex-basis", "33%");
    }
    //console.log(element.attr("max-width"));
}

d3.json(nuts3_shp, function(data) {
    foo = data;
    nuts3_data = data;
    
    gvaColourScale = d3.scaleLinear()
        .domain([ 18500, 29450, 47880 ])
        .range([
            'rgb(166,97,26)',
            'rgb(214, 214, 214)',
            'rgb(1,133,113)'
        ]); 
    
    /* data = data.features[1]
    projection = d3.geoMercator().fitExtent([[0,0],[viewbox_width, viewbox_height]], data);

    let firstMapSvg = d3.select('#gvaMap1').append("svg")
        .attr("viewBox", `0 0 ${viewbox_width} ${viewbox_height}`);

    drawGvaMap(projection, data, firstMapSvg); */

    let mapContainer = d3.select("#gvaMapContainer");
    let countries = ['France', 'Germany', 'Italy', 'Netherlands', 'Denmark', 'United Kingdom']
    let i_order = [5,0,1,3,4]
    for(let j = 0; j<5; j++){
        i = i_order[j];
        mapDiv = mapContainer.append("div")
            .attr("class", "gvaMapDiv")
            .attr("onclick", "toggleMap(this)");
        mapData = data.features[i];
        projection = d3.geoMercator().fitExtent([[0,0],[viewbox_width, viewbox_height]], mapData);    

        drawGvaMap(projection, mapData, mapDiv);
        mapDiv.append("h4")
            .attr("class", "countryTitle")
            .text(countries[i]);
    }

    Tooltip = d3.select("body")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("position", "absolute");
        
});