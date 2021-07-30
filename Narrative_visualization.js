sceneIndex = 0;
countryNameList = [];
sceneData = [];
sceneData.push([]);
sceneData.push([]);
dataCountryGDpMortality = [];
dataCountryGDpMortality.push([]);
dataCountryGDpMortality.push([]);
hoverIndex = 0;
selectedText = "";


/*
Load the CSV data and process it.
*/
async function init() {
    var worldData = await d3.csv("https://abhishekkhare.github.io/World_Data.csv")
    processDataSet(worldData, 0)//Page 1
    mortalityData = await d3.csv("https://abhishekkhare.github.io/Mortality_rate.csv")
    processDataSet(mortalityData, 1)//Page 2
    hoverIndex = 0
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
    processPerCountryData(data, dataIndex)
    if (dataIndex == 0) {
        getCountyNameList(data);
    }
}


function processPerCountryData(data, dataIndex) {
    var text = populateHoverText(dataIndex)
    var keys = Object.keys(data[0])
    var keyCount = 2;
    while (keyCount < keys.length) {
        keyDb = []
        for (count = 0; count < data.length; count++) {
            var Year = data[count].Year
            keyDb.push({
                "Year": Year, 
                "Value": Number(data[count][keys[keyCount]]), 
                "HoverText": text
            })
        }
        dataCountryGDpMortality[dataIndex].push(keyDb);
        keyCount++;
    }
}


function populateHoverText(dataIndex) {
    if (dataIndex == 1) {
        return "Mortality";
    } else {
        return "GDP Per Capita";
    }
}

function getCountyNameList(data) {
    var countryList = Object.keys(data[0])
    for (var c1 = 2; c1 < countryList.length; c1++) {
        countryNameList.push(countryList[c1])
    }
}

function myFunction(object, index, array) {
    return object.Value !== 0;
}


function showScene(dataSet) {
    var previous = document.getElementById("previous");
    var next = document.getElementById("next");
    var notes = document.getElementById("notes");
    var commonText = "<br> To get the exact data values, move the mouse over each data point to show tooltip with details"
    if (sceneIndex == 0) {
        previous.style.visibility = "hidden";
        next.style.visibility = "visible";
        notes.innerHTML = "<b>World GDP per Capita:</b> Notice a sudden dip in world gdp in 2008-2009 due to <i>Great Recession<i/> and another dip in 2020 due to the <i>Covid-19 Pandemic</i>.<br><i>" +commonText +"</i>"
    }else if(sceneIndex == 1){
        previous.style.visibility = "visible";
        next.style.visibility = "visible";
        notes.innerHTML = "<b>World Mortality rate, infant (per 1,000 live births):</b> Year <i>2002-2003</i> shows the largest decline in mortality rate, however a sharp increase is noticed during 2020 due to the <i>Covid-19 Pandemic</i>.<br><i>" +commonText +"</i>"
    }else if(sceneIndex == 2){
        previous.style.visibility = "visible";
        next.style.visibility = "hidden";
        flag = dataSet.filter(myFunction);
        if(flag.length == 0){
            if(hoverIndex == 0){
                notes.innerHTML = "<p style=\"color:red\"> GDP data for <b>"+selectedText+"</b> is not available </p> @ <a href=\"https://data.worldbank.org/indicator/NY.GDP.PCAP.PP.CD\" target=\"_blank\">GDP per capita, PPP</a>"
            }else{
                notes.innerHTML = "<p style=\"color:red\"> Mortality data for <b>"+selectedText+"</b> is not available </p> @ <a href=\"https://data.worldbank.org/indicator/SP.DYN.IMRT.IN\" target=\"_blank\">Mortality rate, infant</a>"
            }    
        } else {
            if(hoverIndex == 0){
                notes.innerHTML = "GDP data for <b>"+selectedText+"</b> <br><i>" +commonText +"</i>"
            }else{
                notes.innerHTML = "Mortality data for <b>"+selectedText+"</b> <br><i>" +commonText +"</i>"
            }
        }
    }

    if(hoverIndex == 0)
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
    d3.select("select")
        .on("change", loadFinalScene);
    d3.select("#radioButtonId")
        .on("change", loadFinalScene);
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
        .defined(function (d) { 
            return d.Value !== 0; 
        })
        .x(function (d, i) {
            return xScale(d.Year);
        })
        .y(function (d) {
            return yScale(d.Value);
        })
        .curve(d3.curveMonotoneX)

    var svg = d3.select("#chartBoxId").select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));

    svg.append("path")
        .datum(dataSet.filter(line.defined()))
        .attr("class", line_color)
        .attr("d", line);

    svg.append("text")
        .attr("x", (width / 2) )
        .attr("y", (margin.top / 2) - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text(graphTitle);

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

    svg.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(dataSet[hoverIndex].HoverText);

    var tooltip = d3.select("#chartBoxId")
        .append("div")
        .style("position", "absolute")
        .attr("class", "tooltip")
        .style("visibility", "hidden");

    if (sceneIndex != 2) {
        showAnnotation(sceneIndex, dataSet, xScale, yScale)
    }
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

function loadDropDown() {
    var selectTag = d3.select("select");
    d3.select(".scene3box").style("visibility", "visible");
    var options = selectTag.selectAll('option')
        .data(countryNameList);
    options.enter()
        .append('option')
        .attr('value', function (d, i) {
            return i
        })
        .text(function (d) {
            return d
        })
}

function moveToScene(direction) {
    if (direction == 'Next') {
        sceneIndex++;
        if (sceneIndex == 1) {
            d3.select(".scene3box")
                .style("visibility", "hidden")
            hoverIndex = 1;
            showScene(sceneData[1])

        }
        else if (sceneIndex == 2) {
            loadFinalScene()
        }
    } else {
        sceneIndex--;
        if (sceneIndex == 0) {
            hoverIndex = 0;
            showScene(sceneData[0])
            d3.select(".scene3box")
                .style("visibility", "hidden")
        }
        else if (sceneIndex == 1) {
            hoverIndex = 1;
            showScene(sceneData[1])
            d3.select(".scene3box")
                .style("visibility", "hidden")
        }
    }
}

function loadFinalScene() {
    loadDropDown();
    var selected = d3.select("#dropDownId").node().value;
    selectedText = d3.select("#dropDownId option:checked").text();
    var index = -1;
    if (document.getElementById("radioButtonId").elements["gdpmortality"].value == '0') {
        hoverIndex = 0
        index = 0;
    } else {
        hoverIndex = 1
        index = 1;
    }
    data1 = dataCountryGDpMortality[index][selected]
    showScene(data1)
}

function getMaxIndex(dataset) {
    var counter = 1;
    var max = 0;
    for (counter; counter < dataset.length; counter++) {
        if (dataset[max].Value < dataset[counter].Value) {
            max = counter;
        }
    }
    return max;
}