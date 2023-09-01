//firstMap options - these are for the viewBox, which is now divorced from the svg element options
const mapWidth = 300;
const mapHeight = 600;

const mapSvg = d3.select("#ukMapSvg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("viewBox", `0 0 ${mapWidth} ${mapHeight}`);

const map_margin = 10; //margin from edges of firstMap BBox to svg

//legend options
const legWidth = 200
const legHeight =100

const legSvg = d3.select("#legSvg")
  .attr("viewBox", `0 0 ${legWidth} ${legHeight}`);


let colourScale = d3
    .scaleLinear()
    .domain([ 13381, 21866, 30351 ])
    .range([
        'rgb(166,97,26)', // <= the lightest shade we want
        'rgb(214, 214, 214)',
        'rgb(1,133,113)'
    ]); 


function drawMap(projection, shp){
    //if (err) throw err
    //var projection = d3.geoMercator().fitExtent([[0,0],[mapWidth, mapHeight]], shp);
    path = d3.geoPath().projection(projection)
    
    //update the colour scale:
    updateColourScale(colourScale, "GDHI_2019");

    mapSvg.append("g")
        .attr("id", "mapG")
        .append("g")
        .attr("id", "mapPaths")
        .selectAll("path")
        .data(shp.features)
        .enter().append("path")
        .attr("d", path)
        .attr("id", function(d){return d.properties.LAD21NM.replace(/ /g,"_").replace(/,/g, "");})
        .attr("class", "region mapPath")
        .attr("region_name", function(d){return d.properties.LAD21NM;})
        .attr("value",function(d){return d.properties.GDHI_2019})
        .style("fill", function(d) { 
            //return d3.interpolateWarm( (d.properties.GDHI_2019)/20000 ); 
            return colourScale((d.properties.GDHI_2019));
            ;})
        .on("mouseover", regionMouseOver)
        .on("mouseleave", regionMouseLeave);

    //TODO: Workout firstMap Border
    //This is broken:
    /*
    mapSvg.append("rect") //the border
        .attr("width", mapWidth-1) //TODO: This is hacky and will only work with 0.5 borders
        .attr("height", legHeight-1)
        .attr("x",0.5)
        .attr("y",0.5)
        .attr("class", "map_border");
    */
    //center firstMap in svg
}


quants = {"GDHI_1997": [5875, 8106, 8446, 8738, 8937, 9164, 9349, 9599, 9798, 10126, 10329, 10701, 11009, 11404, 11698, 12121, 12545, 13593, 14506, 15885, 89249], "GDHI_1998": [6385, 8297, 8536, 8871, 9069, 9321, 9505, 9738, 10016, 10249, 10544, 10871, 11236, 11652, 11927, 12295, 12990, 14026, 15013, 16264, 98239], "GDHI_1999": [7091, 8636, 8988, 9323, 9525, 9720, 9886, 10126, 10420, 10649, 11077, 11361, 11774, 12045, 12397, 12727, 13314, 14463, 15609, 17103, 90832], "GDHI_2000": [7747, 9148, 9479, 9828, 10079, 10309, 10504, 10725, 10954, 11260, 11668, 11989, 12362, 12638, 13196, 13508, 14027, 15208, 16577, 18176, 95511], "GDHI_2001": [8114, 9473, 9939, 10256, 10504, 10675, 10918, 11071, 11398, 11772, 12034, 12306, 12789, 13130, 13568, 14030, 14678, 15646, 17034, 18478, 94159], "GDHI_2002": [8838, 9753, 10211, 10608, 10810, 11046, 11234, 11477, 11772, 12127, 12340, 12684, 13277, 13604, 14016, 14450, 15025, 16032, 17457, 18859, 95878], "GDHI_2003": [9181, 10015, 10562, 10879, 11128, 11405, 11619, 11815, 12125, 12444, 12682, 13092, 13594, 13922, 14280, 14711, 15428, 16388, 17775, 18927, 101359], "GDHI_2004": [9497, 10557, 10961, 11286, 11523, 11859, 12105, 12294, 12617, 12924, 13219, 13610, 13983, 14497, 14834, 15228, 15843, 16981, 18399, 19744, 109234], "GDHI_2005": [9936, 10941, 11347, 11702, 11924, 12179, 12524, 12709, 13032, 13368, 13666, 14067, 14542, 15043, 15411, 15902, 16464, 17597, 19327, 20421, 122565], "GDHI_2006": [10128, 11378, 11671, 12061, 12295, 12602, 12927, 13252, 13484, 13852, 14137, 14600, 14981, 15728, 16079, 16493, 17227, 18286, 20019, 21339, 130110], "GDHI_2007": [10589, 11830, 12243, 12582, 12801, 13160, 13520, 13731, 14058, 14490, 14790, 15207, 15717, 16364, 16730, 17227, 17990, 19031, 20939, 22188, 139733], "GDHI_2008": [10690, 12039, 12495, 12866, 13204, 13578, 13827, 14215, 14630, 14897, 15272, 15711, 16159, 16748, 17293, 17755, 18508, 19685, 21409, 22591, 155363], "GDHI_2009": [10804, 12428, 12889, 13316, 13519, 13873, 14210, 14492, 14898, 15374, 15716, 16037, 16413, 17008, 17435, 17896, 18676, 19786, 21452, 22553, 151219], "GDHI_2010": [10809, 12563, 13074, 13516, 13725, 14164, 14406, 14765, 15122, 15608, 15934, 16310, 16736, 17255, 17693, 18111, 18749, 19806, 21552, 22665, 147841], "GDHI_2011": [10874, 12843, 13352, 13739, 14038, 14355, 14730, 15050, 15381, 15824, 16248, 16610, 17042, 17479, 17888, 18413, 19174, 20217, 21824, 22936, 144611], "GDHI_2012": [11180, 13318, 13795, 14208, 14502, 14821, 15270, 15520, 15883, 16299, 16731, 17137, 17550, 18152, 18631, 18993, 19877, 20922, 22716, 23975, 175447], "GDHI_2013": [11777, 13652, 14075, 14568, 14871, 15241, 15663, 16122, 16377, 16817, 17157, 17705, 18097, 18739, 19155, 19710, 20328, 21579, 23697, 25034, 216630], "GDHI_2014": [12081, 14084, 14406, 14926, 15284, 15572, 15982, 16418, 16763, 17226, 17581, 18000, 18450, 19240, 19733, 20322, 21020, 22213, 24421, 25678, 226826], "GDHI_2015": [12590, 14635, 15157, 15429, 15889, 16330, 16765, 17118, 17625, 18100, 18453, 18899, 19537, 20174, 20845, 21480, 22206, 23855, 26205, 27624, 227294], "GDHI_2016": [12658, 14668, 15160, 15592, 15929, 16462, 16890, 17323, 17731, 18264, 18584, 19156, 19920, 20355, 21086, 21743, 22395, 24047, 26490, 27743, 220644], "GDHI_2017": [12723, 14941, 15600, 16004, 16344, 16851, 17301, 17698, 18134, 18598, 18950, 19476, 20298, 20881, 21392, 22192, 22773, 24485, 26859, 28362, 212614], "GDHI_2018": [13021, 15451, 16133, 16611, 16960, 17529, 18089, 18372, 18725, 19309, 19766, 20315, 21111, 21763, 22244, 23026, 23750, 25458, 27900, 29522, 211104], "GDHI_2019": [13381, 15867, 16485, 17000, 17337, 17942, 18511, 18828, 19318, 19817, 20236, 20743, 21519, 22196, 22888, 23570, 24607, 26320, 28577, 30351, 200903]};

function updateColourScale(colScale, attribute){
    //updates the color scale according to the attribute to target
    relQuants = quants[attribute];
    colScale.domain([relQuants[0],relQuants[2],(relQuants[0]+relQuants[19])/2,relQuants[17],relQuants[19]]);
    colScale.range([
        'rgb(166,97,26)', // <= the lightest shade we want
        '#b8926b',
        'rgb(214, 214, 214)',
        '#3da495',
        'rgb(1,133,113)'
    ])
    colourScale = colScale;
}

function monoScaleUpdate(colScale, attribute){
    //updates the color scale according to the attribute to target
    relQuants = quants[attribute];
    colScale.domain([relQuants[0],relQuants[2],(relQuants[0]+relQuants[19])/2,relQuants[17],relQuants[19]]);
    colScale.range([
        'rgb(239,243,255)', // <= the lightest shade we want
        'rgb(189,215,231)',
        'rgb(214, 214, 214)',
        'rgb(107,174,214)',
        'rgb(8,81,156)'
    ])
    colourScale = colScale;
}

function resetMapDims(firstMap, duration=0){
    //resets the maps zoom and centers it in the svg element
    //firstMap must be a d3 selection
    //TODO: center vertically
    
    let targetGWidth=mapSvg.attr("width")-2*map_margin; //size to resize the firstMap group to
    let targetGHeight=mapSvg.attr("height")-2*map_margin;

    //TODO make this not reliant on there being only one mapG
    let mapG = d3.select("#mapG");
    let currentGWidth = d3.select("#mapG").node().getBBox().width;
    let currentGHeight = d3.select("#mapG").node().getBBox().height;
    let currentGx = d3.select("#mapG").node().getBBox().x;
    let currentGy = d3.select("#mapG").node().getBBox().y;

    scaleF = Math.min( (targetGWidth/currentGWidth), (targetGHeight/currentGHeight));

    mapG.transition()
        .duration(duration)
        .attr("transform","translate("+(map_margin-currentGx)+" "+(map_margin-currentGy)+") scale("+scaleF+ ")");


}

function drawLabel(firstMap,LAD21NM, fontSize=9, fadeDuration=500, delay=0, class_name=null){
  //Draws label for Region by ID which is its LAD21NM
  //d3.select()
    pruned = LAD21NM.replace(/ /g,"_").replace(/,/g, "");

    regionPath = d3.select('#'+pruned);
    regionBBox = regionPath.node().getBBox();
    x = regionBBox.x+(regionBBox.width/2);
    y = regionBBox.y+(regionBBox.height/2);

    labelGroup = firstMap
        .append("g")
            .attr("class", class_name)
            .style("opacity",0);

    textSelection = labelGroup.append("text")
        .attr("x",x)
        .attr("y",y)
        .style("font-weight", "bold")
        .style("letter-spacing", "+1")
        .attr("class","map_label")
        .text(LAD21NM.toUpperCase())
        .style("font-size",fontSize+"px");

    textBBox = textSelection.node().getBBox();

    labelBox = labelGroup
        .insert("rect",":first-child")
        .attr("x", textBBox.x)
        .attr("y", textBBox.y)
        .attr("width", textBBox.width)
        .attr("height", textBBox.height)
        .style("fill", "white");


    labelGroup.transition()
        .duration(500)
        .delay(delay)
        .style("opacity",1);

}

//Mouseover Effects
let inRegion = false; 

function regionMouseOver(){
    inRegion = true;
    d3.selectAll(".region")
        .transition()
        .duration(200)
        .style("opacity",0.6);
    d3.select(this)
        .transition()
        .duration(200)
        .style("opacity",1)
    updateInfoPanel(d3.select(this),colourScale);
}

function regionMouseLeave(region){
    inRegion = false;
    d3.selectAll(".region")
        .transition(200)
        .duration(200)
        .style("opacity",1);
    setTimeout( //hides the bar after 2 seconds if not hovering
        function() {
            if(!inRegion){
                d3.select('#legendBar')
                    .transition()
                    .duration(500)
                    .attr("opacity",0);
            }
    }, 2000);
}

function sample(){
    drawLabel(firstMap,"Westminster", 2, 1000, 500) ;
    drawLabel(firstMap,"Hackney", 2, 1000, 500) ;
    drawLabel(firstMap,"Croydon", 2, 1000, 500) ;
    
    camCoords = projection([-0.1426,51.5390])
    firstMap
        .append("circle")
        .attr("class", "mapPath")
        .attr("cx", camCoords[0])
        .attr("cy", camCoords[1])
        .attr("fill", "red")
        .attr("opacity", 0.8)
        .attr("r", 2);
    firstMap
        .append("circle")
        .attr("id", "boi")
        .attr("cx", camCoords[0])
        .attr("cy", camCoords[1])
        .attr("fill", "red")
        .attr("opacity", 1)
        .attr("r", 1);
    d3.selectAll(".mapPath").transition().duration(2000).attr("transform","translate(-1300 -2800) scale(6)");  
}

//////////////////////New Legend Code /////////////////////////
function createLegend(targetDiv, colourScale){

    /*Creates an SVG containing the legend within the D3 Selection targetDiv
    Args:
        - targetDiv: a d3 selection containing the div in which the legend svg is to be drawn
        - colourScale: a d3 scale with a domain of the data visualised and a range of colours
    Returns: its axisScale */
    let legendSVG = targetDiv
        .append("svg")
            .attr("id", "legendSVG")
            .attr("viewBox", "0 0 200 120"); //important: we're using a 200 by 100 viewbox but this is scaled
    
    legendSVG //appends a <defs> to legendSVG which appendGradient will append to by ID
        .append("defs")
            .attr("id", "legendDefs");
    appendGradient(colourScale, "legendDefs", "mapGradient"); //calls appendGradient to create a <linearGradient> and append it to the just created defs tag
    
    let legendGroup = //d3 selection containing the group which will contain the legend - BUT not the info
        legendSVG
            .append("g")
                .attr("id", "legendGroup");
    let legendRect =
        legendGroup
            .append("rect")
                .attr("x",15)
                .attr("y", 10)
                .attr("width", "170") //these are svg coordinates 
                .attr("height", "15") // and not DOM px coords
                .style("fill", "url(#mapGradient)");

    legendGroup.append("text")
        .attr("x",0)
        .attr("y", 65)
        .attr("font-size", "0.75em")
        .attr("id", "instructionText")
        .text('Hover Over a Region to See Details');
    
    
    //the d3 axes take a scale with a domain that is the domain of the data and a range that is the width - it maps values to pixels along a dimension
    //so we need a new scale with the domain of the colourScale and a range of the width
    let axisScale = axisScaleFromColourScale(colourScale, 170); 
    
    let legendAxis = d3.axisBottom(axisScale) //creates the axis
        .tickValues([ // we want ticks at the start, end and middle
            colourScale.domain()[0],
            (colourScale.domain()[0]+colourScale.domain()[colourScale.domain().length-1])/2,
            colourScale.domain()[colourScale.domain().length-1]])
        .tickFormat(function(d){
            return "£" + Math.round(d/100)/10+"K";
        });
    
    legendGroup
        .append("g")
            .attr("class", "axis")
            .call(legendAxis)
            .attr("transform","translate(15,25)");
    
    return axisScale;
}

function updateInfoPanel(region, colourScale=colourScale, legendID = "legendSVG"){
    /* Updates the descriptive info and the legendBar in the info panel. Calls createInfoPanel and createRegionDesc if they do not exist.
    Args:
        -region: a d3 selection of the path that was selected (mourover or tap)
        -colourScale: the d3 scale with which to colour the legend's Bar and the selected Region Indicator
        -legendID: string, the svg containing the info panel
    Returns: nothing
    */

    d3.selectAll('#instructionText')
        .transition()
        .duration(200)
        .style("opacity", 0);

    //styling options:
    const legendBarHeight = 30;

    const axisScale = axisScaleFromColourScale(colourScale,170); //maps values to x position
    
    const regionValue = region.attr("value"); //the value to update the Bar and info to

    let legendSVG = d3.select(`#${legendID}`) 
    if(d3.select('#legendBar').empty()){ //checks if the legendBar exists
        createLegendBar(legendSVG, "legendBar", legendBarHeight); //... and if it doesn't, calls createLegendBar to create it
        let regionDescriptionGroup = legendSVG //creates the group where we will append our text and the indicator
            .append("g")
                .attr("id", "regionDescriptionGroup")
                .attr("transform", "translate(100 65)"); 
        createRegionDescriptionText(regionDescriptionGroup, "regionDescriptionGroup");
        createRegionDescriptionLabel(regionDescriptionGroup, "regionLabelGroup", "regionDescriptionLabel", "regionLabelRect");
    }
    
    let legendBar = d3.select("#legendBar");
    let RegionDescriptionText = d3.select("#RegionDescriptionText");
    let regionDescriptionGroup = d3.select("#regionDescriptionGroup");
    let regionLabelGroup = d3.select("#regionLabelGroup");
    let regionDescriptionLabel = d3.select("#regionDescriptionLabel");
    let regionLabelRect = d3.select("#regionLabelRect");

    //first moves the legend bar
    legendBar 
        .transition()
        .duration(200)
        .attr("x", Math.min(axisScale(regionValue),182))
        .attr("opacity",1)
        .attr("fill", colourScale(regionValue))
        .attr("transform","translate(0 -"+(legendBarHeight-15)/2+")");

    //next update the text and center the text
    d3.select('#incomeText')
        .text(` £${parseInt(region.attr("value")).toLocaleString()} `);

    d3.select('#percentageText')
        .text(` ${Math.round((region.attr("value")/quants["GDHI_2019"][11])*100)}% `);

    //next update the label and its rect
    regionDescriptionLabel
        .text(region.attr("region_name").toUpperCase());
    
    let regionLabelBBox = regionDescriptionLabel.node().getBBox();

    regionLabelRect
        .transition()
        .duration(200)
        .attr("width", regionLabelBBox.width)
        .attr("height", regionLabelBBox.height)
        .attr("x", regionLabelBBox.x)
        .attr("y", regionLabelBBox.y)
        .attr("fill", colourScale(regionValue));
        
    regionLabelGroup
        .transition()
        .duration(200)
        .attr("transform", `translate(${-0.5*regionLabelBBox.width} 0)`);
    

}

function createLegendBar(legendSVG, legendBarID, height=30){
    /* Appends a legendBar to legendSVG and gives it an ID of legendBarID
    args:
        - legendSVG, a d3 selection, contains the svg to draw to
        - legendBarID, the id to apply
        - height, of the bar
    */
    legendBar = legendSVG
        .select("#legendGroup")
        .append('rect')
            .attr("id", legendBarID)
            .attr("height",height)
            .attr("y", 10)
            .attr("width", 3)
            .attr("stroke", "black")
            .attr("stroke-width", 1);
}

function axisScaleFromColourScale(colourScale, width=170){
    /*Takes a colourScale and returns an axisScale scaleLinear */
    return d3.scaleLinear()
        .domain(
            [colourScale.domain()[0],
            colourScale.domain()[colourScale.domain().length-1]]
        )
        .range([0,width]); 
    
}

function createRegionDescriptionLabel(regionDescriptionGroup, regionLabelGroupID = "regionLabelGroup", regionDescriptionLabelID = 'regionDescriptionLabel', regionLabelRectID = "regionLabelRect"){
    /*Appends a <g> to regionDescriptionGroup containing a rect and a label*/
    let labelGroup = regionDescriptionGroup
        .append("g")
            .attr("id", "regionLabelGroup");
    labelGroup
        .append("text")
            .attr("id", regionDescriptionLabelID)
            .style("font-weight", "bold")
            .attr("fill", "white")
            .attr("font-size",11);
    labelGroup 
        .insert("rect",":first-child")
            .attr("id", regionLabelRectID)
            .attr("rx", 3)
            .attr("ry", 3);
}

function createRegionDescriptionText(regionDescriptionGroup, regionDescriptionTextID = 'regionDescriptionText'){
    /* Appends a tspan to regionDescriptionGroup containing the region description text */

    //using a weird system for multiline text with structure of [text, [optiosn - can be "b" for bold and "nl" to place the text on a newline], id]
    text = [["has an average household"], [`income of `, ['nl']], ["£ ",["b"],"incomeText"], ["which is "], ["% ", ["b","nl"], "percentageText"], ["the average area."]];
    regionDescriptionGroup
        .append("text")
            .attr("transform", "translate(0 15)")
            .attr("font-size",13)
            .attr("text-anchor", "middle")
            .selectAll("tspan")
                .data(text)
                .enter()
                    .append("tspan")
                        .attr("id", function(d){return d[2]})
                        .text(function(d){return d[0]})
                        .attr("font-weight", function(d){
                            if(d.length >= 2 && d[1].includes("b")){
                                return "bold";
                            }
                            return "normal";
                        })
                        .attr("dy", function(d){
                            if(d.length >= 2 && d[1].includes("nl")){
                                return "1.1em";
                            }
                            return 0;
                        })
                        .attr("x", function(d){
                            if(d.length >= 2 && d[1].includes("nl")){
                                return "0";
                            }
                            
                        })
}

let appendGradient = function(colourScale, defsID = 'legendDefs', gradientID = "mapGradient"){
    /*args: 
        - colourScale: a d3 scale
        - defsID: string, the id of the <defs> tag to append to
        - gradientID:, string, id to apply to the newly created <lineargradient>
    //returns: a linearGradient d3 selection
    //Side Effects: Appends a linearGradient tag to the element with the ID defsID */

    let linGrad = d3.select('#'+defsID)
        .append("linearGradient")
        .attr("id", gradientID);

    //first make a single obj which contains the domain and range
    let domain = colourScale.domain();
    let dHigh = domain[domain.length-1];
    let dLow = domain[0];
    let offsets = []; //contains offsets in % terms rather than nominal nums
    domain.forEach((point)=> offsets.push(Math.round(((point-dLow)/(dHigh-dLow))*10000)/100 + "%"));
    
    let range = colourScale.range();

    let stopsData = [] 
    offsets.forEach((offset, i) => stopsData.push({"offset": offset, colour: range[i]})) 

    //next sets linGrad's attributes, of where to start and end(?)
    linGrad
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

    //next creates stops using d3's fucky-but-powerful selectAll on elements that don't exist yet
    linGrad.selectAll("stop")
        .data(stopsData)
        .enter()
        .append("stop")
        .attr("offset", function(d){return d.offset})
        .attr("stop-color", function(d){return d.colour});
    
    return linGrad;
}

////////// zooming behaviour /////////

function centerOn(coordinates){
    /*
        Centers the firstMap on coordinate [lat, lon]
    */
    let projected_coordinates = projection(coordinates);
   
    firstMap.append("circle")
        .attr("cx", projected_coordinates[0])
        .attr("cy", projected_coordinates[1])
        .attr("r", 2)
        .attr("fill", "red");


    //get current center
    let BBox = d3.select("#mapG").node().getBBox();
    let currentX = BBox.width/2;
    let currentY = BBox.height/2;

    d3.select("#mapG").transition().duration(2000).attr("transform",`scale(1) translate(${(currentX-projected_coordinates[0])*1} ${(currentY-projected_coordinates[1])*1})`);


}

//centerOn([-2.587,51.45])















//TODO: Workout promises to get 

var shp_file = "lowpoly.json";
var projection = null;
let path = null;
d3.json(shp_file, function(data) {
    window.type1Data = data;
    projection = d3.geoMercator().fitExtent([[0,0],[mapWidth, mapHeight]], data);
    drawMap(projection, data);
    firstMap = d3.select("#mapG");
    //drawLabel(firstMap, "Liverpool")
    //d3.select("#mapG").transition().duration(500).attr("transform","translate(100 50) scale(0.5)");
    //resetMapDims(firstMap);
    //targetSvg = d3.select('#legSvg');
    //drawLegend(colourScale, targetSvg);
    createLegend(d3.select("#mapLegend"),colourScale);
}); 