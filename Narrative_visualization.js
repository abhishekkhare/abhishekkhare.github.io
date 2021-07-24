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
        graphTitle ="GDP per capita vs Year"
    }
    else
    {
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
        .style("fill", "none")
        .style("stroke", "#CC0000")
        .style("stroke-width", "2")
        .attr("class", line)
        .attr("d", line);

    svg.append("text")
        .attr("x", (width / 2) )
        .attr("y", (margin.top / 2) - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text(graphTitle);
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
            window.location.href = 'https://abhishekkhare.github.io/AKVisualNarration.html'
        }
    }
}