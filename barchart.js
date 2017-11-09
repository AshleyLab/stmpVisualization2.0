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

	console.log(data[variantIndex]);

	var frequencyData = $.map(gnomADPopulationFrequencies, (pair, i) => { 

		return parseFloat(data[variantIndex].core[pair[0]].originalValue); 

	});

	var height = $(element).height();
	var width = $(element).width();

	var n = frequencyData.length; 

	var yScale = d3.scaleLinear()
		.domain([0, Math.max(...frequencyData)])
		.range([0, height]);

	var xScale = d3.scaleLinear()
		.domain([0, frequencyData.length])
		.range([0, width]);

	d3.select(element)
		.selectAll("rect")
		.data(frequencyData)
		.enter()
		.append("rect")
		.attr("x", (_, i) => xScale(i))
		.attr("y", (d, _) => height - yScale(d))
		.attr("width", width / n)
		.attr("height", (d, _) => yScale(d))
		.attr("fill", "red")
		.on("mouseover", (d, _) => console.log(d)); 

	//xAxis
	var labels = $.map(gnomADPopulationFrequencies, (d, i) => d[0]); 
	console.log(labels);

	var labelScale = d3.scaleBand()
		.domain(labels)
		.range([0, width]);
		// .paddingInner(10);

	var xAxis = d3.axisBottom()
		.scale(labelScale)
		// .tickFormat((d, i) => { 

		// 	console.log(d + "-" + i);

		// 	return gnomADPopulationFrequencies[i]  

		// });

	d3.select(element)
		.append("g")
		.attr("class", "xAxis")
		.attr("transform", "translate(0," + (height - 40) + ")")
		.call(xAxis); 

}


