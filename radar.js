function renderRadar() { 

	var element = "detailSVG";

	if (d3.select("#" + element).size() == 0) { 

		d3.select(outerElement)
			.append("svg")
			.attr("id", element); 

	}


	element = "#" + element;

	var radarData = getRadarData(); 

	if (radarData.length == 0) {
		return d3.select(element).selectAll("*").remove(); 
	}
	
	var formatted = $.map(radarData, function(variant, index) {
		var toPlot = []; 
		for (var key in variant.xyz) {
			toPlot.push({
				"axis" : key, 
				"value" : variant.xyz[key]
			}); 
		}

		return [toPlot]; 
	}); 

	var color = d3.scaleLinear()
				.range(["#EDC951","#CC333F","#00A0B0"]);

	var margin = {top: 50, right: 100, bottom: 100, left: 50};

	var radarChartOptions = {
		w: 200,
		h: 200,
		margin: margin,
	  	levels: 5,
	  	roundStrokes: true,
	  	color: color
	};

	RadarChart(element, formatted, radarChartOptions);

}

var lastRadarData = []; 

function getRadarData() { 

	var keys = [];

	d3.selectAll(".selectedForRadar").each(function(element, index){

		var id = d3.select(this).attr("id");
		keys.push(parseInt(id.substring(id.indexOf("e") + 1)) - 1); //TODO: actually get key

	});

	var selectedData = $.map(keys, key => data[key]); //the data actually selected by the user
	var indexOfLatestItem; 

	//make sure latest add is last in array
	var finalData = [];

	$.grep(lastRadarData, function(element) {
        if ($.inArray(element, selectedData) != -1) { 
        	finalData.push(element);
        } 
	});

	$.grep(selectedData, function(element) {
		if ($.inArray(element, lastRadarData) == -1) { //put this new element at the end
			finalData.push(element);
		};
	});

	lastRadarData = finalData; 
	return finalData;

}