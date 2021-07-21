/*
Load the CSV data and process it.
*/
async function init() {
    var worldData = await d3.csv("https://abhishekkhare.github.io/World_Data.csv")
    console.log(worldData);
    mortalityData = await d3.csv("https://abhishekkhare.github.io/Mortality_rate.csv")
    console.log(mortalityData);
    hoverIndex = 0
    console.log(countryNameList)
    console.log(dataCountryGDpMortality)
}