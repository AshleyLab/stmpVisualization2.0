function renderBarchart(data, element, variantIndex, headDisplayName) { 

	console.log(arguments);

	//detail view of population level frequencies

	//possible head frequencies
	//ExAC Frequency, 

	var populationFrequencies = []; 

	switch(headDisplayName) {
		case "ExAC Frequency": 
			populationFrequencies = [
				["ExAC East Asian Frequency", ""],
				["ExAC South Asian Frequency", ""],
				["ExAC African Frequency", ""],
				["ExAC European Frequency", ""],
				["ExAC Latino Frequency", ""]
				]; 
			break; 
		case "gnomAD Max Frequency": 
			populationFrequencies = [
				//[population frequency, population frequency n (denominator)]
				["AF_EAS", "AN_EAS"],
				["AF_NFE", "AN_NFE"], 
				["AF_SAS", "AN_SAS"], 
				["AF_AMR", "AN_AMR"], 
				["AF_AFR", "AN_AFR"]
			]; 
			break; 
		default: 
			console.log("unknown head frequency " + headDisplayName)
	}

	//PREPARE THE DATA

	var nFrequencies = populationFrequencies.length;
	var frequencyData = {}; 
	var maxFreq = 0; 

	$.each(populationFrequencies, (i, pair) => { 
		var freq = parseFloat(data[variantIndex].core[pair[0]].originalValue); 
		var denominator = parseInt(data[variantIndex].core[pair[1]].originalValue);

		if (freq > maxFreq) { 
			maxFreq = freq; 
		}

		frequencyData[pair[0]] = [freq, denominator]; 
	});

	var labels = $.map(populationFrequencies, (d, i) => d[0]); 

	//LAYOUT

	var margin = {
		top: 20, bottom: 20, 
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

	//scales
	var yScale = d3.scaleLinear()
		.domain([0, maxFreq])
		.range([height, 0]);

	var xScale = d3.scaleBand()
		.domain(labels)
		.range([0, width])
		.paddingInner(.1);

	//create the bars
	g.selectAll("rect")
		.data(labels)
		.enter()
		.append("rect")
		.attr("x", (d, i) => xScale(d))
		.attr("y", (d, _) => { 
			return yScale(frequencyData[d][0]); 
		})
		.attr("width", xScale.bandwidth())
		.attr("height", (d, _) => { 
			return height - yScale(frequencyData[d][0]); 
		})
		.attr("fill", getRandomColor)
		// .on("mouseover", (d, _) => console.log(d));

	g.selectAll("text.denominator")
		.data(labels)
		.enter()
		.append("text")
		.attr("x", (d, i) => xScale(d))
		.attr("y", (d, _) => {
			return yScale(frequencyData[d][0]) - 10; 
		})
		.attr("fill", "white")
		.text((d, _) => frequencyData[d][1])

	//x axis
	var xAxis = d3.axisBottom()
		.scale(xScale)
		.tickFormat((d, i) => shortName(d));

	g.append("g")
		.attr("class", "xAxis")
		.attr("transform", "translate(0," + (height - 0) + ")")
		.call(xAxis);

	//y axis
	var yAxis = d3.axisLeft()
		.scale(yScale)
		.ticks(6);

	g.append("g")
		.attr("class", "yAxis")
		.call(yAxis);

	//add the ns to the top of the bars
	// g.selectAll("text.denominators")
	// 	.data()
}

function shortName(d) {
	return d.slice(d.indexOf("_") + 1);
}


