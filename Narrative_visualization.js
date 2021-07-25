sceneData = []
sceneData.push([])
sceneData.push([])
sceneIndex = 0

/*
Load the CSV data and process it.
*/
async function init() {
    var worldData = await d3.csv("https://abhishekkhare.github.io/World_Data.csv")
    console.log(worldData);
    processDataSet(worldData, 0)//Page 1
    mortalityData = await d3.csv("https://abhishekkhare.github.io/Mortality_rate.csv")
    console.log(mortalityData);
    processDataSet(mortalityData, 1)//Page 2
    sceneIndex = 0
    showScene(sceneData[0])
}

/*
Process data to create object like:
{"Year":"1990", "Value":1234, "HoverText":"This is cool"}
*/
function processDataSet(data, dataIndex) {
    var keys = Object.keys(data[0])
    var count = 0;
    var text = populateHoverText(dataIndex)
    while (count < data.length) {
        sceneData[dataIndex].push({
            "Year": data[count].Year, 
            "Value": Number(data[count].World), 
            "HoverText": text
        })
        count++;
    }
}

function populateHoverText(dataIndex) {
    if (dataIndex == 1) {
        return "Mortality";
    } else {
        return "GDP Per Capita";
    }
}

function showScene(dataSet) {
    if(sceneIndex == 0)
    {
        dot_color="dot_orange";
        line_color = "line_orange";
        graphTitle ="GDP per capita vs Year"
    }
    else
    {
        dot_color="dot_blue";
        line_color = "line_blue";
        graphTitle ="Mortality vs Year"
    }


	//clear the svg before showing the scene
	d3.select("#chartBoxId")
        .select("svg").selectAll("g").remove();

    var xScale = d3.scaleLinear()
     	.range([0, width])
        .domain([1990, 2020]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(dataSet, function (d) {
            return d.Value;
        })]).range([height, 0]);

    var line = d3.line()
        .x(function (d, i) {
            return xScale(d.Year);
        })
        .y(function (d) {
            return yScale(d.Value);
        }).curve(d3.curveMonotoneX)

    var svg = d3.select("#chartBoxId").select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));//converts number to year

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));

    svg.append("path")
        .datum(dataSet)
        .attr("class", line_color)
        .attr("d", line);

    svg.append("text")
        .attr("x", (width / 2) )
        .attr("y", (margin.top / 2) - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text(graphTitle);
    
    var tooltip = d3.select("#chartBoxId")
        .append("div")
        .style("position", "absolute")
        .attr("class", "tooltip")
        .style("visibility", "hidden");


    svg.selectAll(".dot")
        .data(dataSet.filter(line.defined()))
        .enter().append("circle")
        .attr("class", dot_color)
        .attr("cx", function (d, i) {
            return xScale(d.Year)
        })
        .attr("cy", function (d) {
            return yScale(d.Value)
        }).attr("r", 5)
        .on("mousemove", function (d) {
            hoverTextValue = d.Value;
            return tooltip.style("top", (event.pageY-50) + "px").
            style("left", (event.pageX) + "px").
            html("<div class='hoverText'>" +d.HoverText+ ':' + hoverTextValue+ "</div>" +
                "<div class='hoverText'>" +"Year :"+ d.Year +"</div>");
        })
        .on("mouseout", function () {
            return tooltip.style("visibility", "hidden");
        })
        .on("mouseover", function () {
            return tooltip.style("visibility", "visible");
        });

        showAnnotation(sceneIndex, dataSet, xScale, yScale)
}

function showAnnotation(sceneIndex, dataSet, xAxis, yAxis) {
    parent = d3.select("#chartBoxId")
        .select("svg")
        .append("g")

    if (sceneIndex == 0) {
        parent.append("rect")
            .attr("x", xAxis(2009) - 430)
            .attr("y", yAxis(17024.25) + 20 )
            .attr("fill", "lightgrey")
            .attr("class", "annotationBox")

        parent.append("text")
            .attr("x", xAxis(2009) - 410)
            .attr("y", yAxis(17024.25) + 45)
            .attr("class", "annotationText")
            .text("GDP Dip due to Great Recession in 2008-2009");

        d3.select("#chartBoxId")
            .select("svg")
            .append("g")
            .append("line")
            .attr("opacity", 1)
            .attr("style", "stroke:rgb(0,0,0);stroke-width:0.5px")
            .attr("x1", margin.left + xAxis(2009) - 310)
            .attr("y1", yAxis(17024.25) + 70 )
            .attr("x2", margin.left + xAxis(2009))
            .attr("y2", yAxis(17024.25) + 130)

        parent.append("rect")
            .attr("x", xAxis(2020) - 200)
            .attr("y", yAxis(17109.45142) + 200)
            .attr("fill", "lightgrey")
            .attr("class", "annotationBox")

        parent.append("text")
            .attr("x", xAxis(2020) - 190)
            .attr("y", yAxis(17109.45142) + 230)
            .attr("class", "annotationText")
            .text("GDP Dip due to Covid-19 Pandemic 2020");

        d3.select("#chartBoxId")
            .select("svg")
            .append("g")
            .append("line")
            .attr("opacity", 1)
            .attr("style", "stroke:rgb(0,0,0);stroke-width:0.5px")
            .attr("x1", margin.left + xAxis(2020) - 200)
            .attr("y1", yAxis(17109.45142) + 200)
            .attr("x2", margin.left + xAxis(2020))
            .attr("y2", yAxis(17109.45142) + 25)
    } else if (sceneIndex == 1) {
        parent.append("rect")
            .attr("x", xAxis(2003) - 70)
            .attr("y", yAxis(28.25))
            .attr("fill", "lightgrey")
            .attr("class", "annotationBox")

        parent.append("text")
            .attr("class", "annotation_text")
            .attr("x", xAxis(2003) - 30)
            .attr("y", yAxis(28.25) + 30)
            .text("Largest Decline in Mortality Rate by 1.8%");

        d3.select("#chartBoxId")
            .select("svg")
            .append("g")
            .append("line")
            .attr("opacity", 1)
            .attr("style", "stroke:rgb(0,0,0);stroke-width:0.5px")
            .attr("x1", margin.left + xAxis(2003))
            .attr("y1", yAxis(28.9) - 100)
            .attr("x2", margin.left + xAxis(2003))
            .attr("y2", yAxis(28.9) + 10)

        parent.append("rect")
            .attr("x", xAxis(2020) - 280)
            .attr("y", yAxis(29.046) - 180)
            .attr("fill", "lightgrey")
            .attr("class", "annotationBox")

        parent.append("text")
            .attr("class", "annotation_text")
            .attr("x", xAxis(2020) - 270)
            .attr("y", yAxis(29.046) - 150)
            .text("Mortality Rate increased due to Covid-19 Pandemic");

        d3.select("#chartBoxId")
            .select("svg")
            .append("g")
            .append("line")
            .attr("opacity", 1)
            .attr("style", "stroke:rgb(0,0,0);stroke-width:0.5px")
            .attr("x1", margin.left + xAxis(2020)-100)
            .attr("y1", yAxis(29.046) - 130)
            .attr("x2", margin.left + xAxis(2020))
            .attr("y2", yAxis(29.046) + 20)
    }
}

function moveToScene(direction) {
    var x = document.getElementById("next");
    x.style.display = "block";
    if (direction == 'Next') {
        sceneIndex++;

        if (sceneIndex == 1) {
            console.log(sceneIndex)
            showScene(sceneData[1])
        }
    } else {
        sceneIndex--;
        if (sceneIndex == 0) {
            showScene(sceneData[0])
        }
        else if (sceneIndex == 1) {
            showScene(sceneData[1])
        }else if (sceneIndex == -1) {
            window.location.href = 'file:///Users/ak670612/Downloads/Project/Code/AKVisualNarration.html'
        }
    }
}