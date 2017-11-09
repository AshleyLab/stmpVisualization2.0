function renderBarchart(data, element, variantIndex) { 

	//detail view of population level frequencies

	//possible head frequencies
	//ExAC Frequency, 


	var gnomADPopulationFrequencies = [
		//population frequency : population frequency n (denominator)
		["AF_EAS", "AN_EAS"],
		["AF_NFE", "AN_NFE"], 
		["AF_SAS", "AN_SAS"], 
		["AF_AMR", "AN_AMR"], 
		["AF_AFR", "AN_AFR"]
	]; 

	var frequencyData = {}; 
	var maxFreq = 0; 

	$.each(gnomADPopulationFrequencies, (i, pair) => { 
		var freq = parseFloat(data[variantIndex].core[pair[0]].originalValue); 

		if (freq > maxFreq) { 
			maxFreq = freq; 
		}

		frequencyData[pair[0]] = freq; 
	});

	console.log(frequencyData);

	var labels = $.map(gnomADPopulationFrequencies, (d, i) => d[0]); 

	var nFrequencies = gnomADPopulationFrequencies.length;

	//setup

	var margin = {
		top: 20, bottom: 20, 
		left: 40, right: 20
	};


	var outerHeight = $(element).height();
	var outerWidth = $(element).width();

	var height = outerHeight - margin.top - margin.bottom; 
	var width = outerWidth - margin.left - margin.right; 

	var g = d3.select(element)
		.append("g")
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
			return yScale(frequencyData[d]); 
		})
		.attr("width", xScale.bandwidth())
		.attr("height", (d, _) => { 
			return height - yScale(frequencyData[d]); 
		})
		.attr("fill", "red")
		.on("mouseover", (d, _) => console.log(d)); 

	//x axis
	var xAxis = d3.axisBottom()
		.scale(xScale)

	g.append("g")
		.attr("class", "xAxis")
		.attr("transform", "translate(0," + (height - 0) + ")")
		.call(xAxis);

	//y axis
	var yAxis = d3.axisLeft()
		.scale(yScale);

	g.append("g")
		.attr("class", "yAxis")
		.call(yAxis);
}


