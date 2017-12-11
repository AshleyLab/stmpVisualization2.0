function renderBarchart(element) {

	//modeleed on 
	//https://bl.ocks.org/mbostock/3887051

	var data = window.variantData[window.variantIndex];

	var populations = ["EAS","NFE","SAS","AMR","AFR"];
	var columnHeaders = [

		//ExAC
		["ExAC East Asian Frequency", "ExAC South Asian Frequency", "ExAC African Frequency", "ExAC European Frequency", "ExAC Latino Frequency"],

		//gnomAD
		["AF_EAS","AF_NFE","AF_SAS", "AF_AMR", "AF_AFR"]

	];

	var freqData = $.map(populations, (p, i) => {

		var headersToGetDataFrom = $.map(columnHeaders, (cH, _) => cH[i]);
		console.log(headersToGetDataFrom);

		var frequencyData = $.map(headersToGetDataFrom, (h, _) => parseFloat(data.core[h].originalValue));
		console.log(frequencyData);

		return [[p].concat(frequencyData)];

	});

	console.log(freqData);

	var margin = {
		top: 20, bottom: 40, 
		left: 40, right: 20
	};

	var outerHeight = $(element).height();
	var outerWidth = $(element).width();

	var height = outerHeight - margin.top - margin.bottom; 
	var width = outerWidth - margin.left - margin.right; 

	var x0 = d3.scaleBand()
	    .rangeRound([0, width])
	    .paddingInner(0.1);

	var x1 = d3.scaleBand()
	    .padding(0.05);

	var y = d3.scaleLinear()
	    .rangeRound([height, 0]);

	var z = d3.scaleOrdinal()
	    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

	//set scales
	var keys = ["ExAC", "gnomAD"];

	x0.domain(populations);
	x1.domain(keys).rangeRound([0, x0.bandwidth()]);

	var maxFreq = d3.max(freqData, (d, _) => d3.max(d, (e, i) => i == 0 ? 0 : e));
	console.log(maxFreq);

	y.domain([0, maxFreq]); 

	var g = d3.select(element)
		.append("g")
		.attr("class", "barchart")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	g.selectAll("g")
		.data(freqData)
		.enter()
		.append("g")
		.attr("transform", function(d, i) { return "translate(" + x0(populations[i]) + ",0)"; })
		.selectAll("rect")
		.data((d, _) => { 

			var innerData = $.map(keys, (p, i) => {

				// return {key: p, value: d[i + 1]}
				return {key: p, value: maxFreq}

			}); 

			console.log(innerData);
			return innerData; 

		}).enter()
		.append("rect")
		.attr("x", (d, _) => x1(d.key))
		.attr("y", (d, _) => y(d.value))
		.attr("width", x1.bandwidth())
		.attr("height", (d, _) => height - y(d.value))
		.attr("fill", (d, _) => z(d.key));

	g.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(d3.axisBottom(x0));

	g.append("g")
    	.attr("class", "axis")
      	.call(d3.axisLeft(y).ticks(null, "s"))
    	.append("text")
     	.attr("x", 2)
      	.attr("y", y(y.ticks().pop()) + 0.5)
      	.attr("dy", "0.32em")
      	.attr("fill", "#000")
      	.attr("font-weight", "bold")
      	.attr("text-anchor", "start")
      	.text("Population");

}

function deprecated_renderBarchart(element, headDisplayName) { 

	var data = window.variantData; 
	var variantIndex = window.variantIndex; 

	//detail view of population level frequencies
	//possible head frequencies
	var populationFrequencies = []; 

	// switch(headDisplayName) {
	// 	case "ExAC Frequency": 
	// 		populationFrequencies = [
	// 			["ExAC East Asian Frequency", ""],
	// 			["ExAC South Asian Frequency", ""],
	// 			["ExAC African Frequency", ""],
	// 			["ExAC European Frequency", ""],
	// 			["ExAC Latino Frequency", ""]
	// 			]; 
	// 		break; 
	// 	case "gnomAD Max Frequency": 
	// 		populationFrequencies = [
	// 			//[population frequency, population frequency n (denominator)]
	// 			["AF_EAS", "AN_EAS"],
	// 			["AF_NFE", "AN_NFE"], 
	// 			["AF_SAS", "AN_SAS"], 
	// 			["AF_AMR", "AN_AMR"], 
	// 			["AF_AFR", "AN_AFR"]
	// 		]; 
	// 		break; 
	// 	default: 
	// 		console.log("unknown head frequency " + headDisplayName)
	// }

	//right now just gnomAD frequencies //wait but we have ExAC pop freqs, we just don't have their denominators
	populationFrequencies = [
		["AF_EAS", "AN_EAS"],
		["AF_NFE", "AN_NFE"], 
		["AF_SAS", "AN_SAS"], 
		["AF_AMR", "AN_AMR"], 
		["AF_AFR", "AN_AFR"]
	]; 

	//PREPARE THE DATAs
	var frequencyData = {}; 
	var maxFreq = 0; 

	var denominators = []; 

	$.each(populationFrequencies, (i, pair) => { 

		var freq = parseFloat(data[variantIndex].core[pair[0]].originalValue); 
		var denominator = parseInt(data[variantIndex].core[pair[1]].originalValue); 

		if (freq > maxFreq) { 
			maxFreq = freq; 
		}

		denominators.push(denominator);

		frequencyData[pair[0]] = [freq, denominator]; 
	});

	var labels = $.map(populationFrequencies, (d, i) => d[0]); 

	//LAYOUT
	var margin = {
		top: 20, bottom: 40, 
		left: 40, right: 20
	};

	var outerHeight = $(element).height();
	var outerWidth = $(element).width();

	var height = outerHeight - margin.top - margin.bottom; 
	var width = outerWidth - margin.left - margin.right; 

	//CLEAR ANY PREEXISTING BAR CHART SVG ELEMENTS
	d3.select("g.barchart")
		.remove(); 

	var g = d3.select(element)
		.append("g")
		.attr("class", "barchart")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	//MAKE SCALES
	var yScale = d3.scaleLinear()
		.domain([0, maxFreq])
		.range([height, 0]);

	var xScale = d3.scaleBand()
		.domain(labels)
		.range([0, width])
		.paddingInner(.1);

	//CREATE BARS
	g.selectAll("rect")
		.data(labels)
		.enter()
		.append("rect")
		.attr("x", (d, i) => xScale(d))
		.attr("y", (d, _) => { 

			return yScale(frequencyData[d][0]); 

		}).attr("width", xScale.bandwidth())
		.attr("height", (d, _) => { 

			return height - yScale(frequencyData[d][0]); 

		}).attr("fill", (d, _) => colorForPopulation(d));


	//X AXIS FOR LABELS
	var xAxis = d3.axisBottom()
		.scale(xScale)
		.tickFormat((d, i) => axisLabel(d, frequencyData));

	g.append("g")
		.attr("class", "xAxis")
		.attr("transform", "translate(0," + (height - 0) + ")")
		.call(xAxis);

	//X AXIS FOR NS
	var xAxis2 = d3.axisBottom()
		.scale(xScale)
		.tickFormat((d, i) => denominators[i]);

	g.append("g")
		.attr("class", "xAxis2")
		.attr("transform", "translate(0," + (height + 10) + ")")
		.call(xAxis2)

	//remove the actual lines, so just the labels remain
	d3.select(".xAxis2")
		.selectAll("line")
		.remove(); 

	//Y AXIS
	var yAxis = d3.axisLeft()
		.scale(yScale)
		.ticks(6);

	g.append("g")
		.attr("class", "yAxis")
		.call(yAxis);
}

function axisLabel(d, frequencyData) {
	var shortName = shortNameForPopulation(d);
	var denominator = frequencyData[d][1];
	return shortName;
}