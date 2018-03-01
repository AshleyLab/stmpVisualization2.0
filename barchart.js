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

		var frequencyData = $.map(headersToGetDataFrom, (h, _) => {

			var f = parseFloat(data.core[h].originalValue); 

			if (isNaN(f)) {
				f = 0; 
			}; 

			return f; 

		});

		return [[p].concat(frequencyData)];

	});

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
	    .padding(0.2);

	var y = d3.scalePow()
		.exponent(.25)
	    .rangeRound([height, 0]);

	//set scales
	var keys = ["ExAC", "gnomAD"];

	x0.domain(populations);
	x1.domain(keys).rangeRound([0, x0.bandwidth()]);

	var maxFreq = d3.max(freqData, (d, _) => d3.max(d, (e, i) => i == 0 ? 0 : e));

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

			return $.map(keys, (p, i) => {
				return {key: p, value: d[i + 1], population: d[0]};
			}); 

		}).enter()
		.append("rect")
		.attr("x", (d, _) => x1(d.key))
		.attr("y", (d, _) => y(d.value))
		.attr("width", x1.bandwidth())
		.attr("height", (d, _) => height - y(d.value))
		.attr("fill", (d, _) => { 

			return colorForPopulation(d.population); 

		}).attr("stroke", (d, _) => colorForPopulation(d.population))
		.attr("fill-opacity", (d, _) => d.key == "ExAC" ? 1 : 0)
		.attr("stroke-width", 2)

	g.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(d3.axisBottom(x0));

	g.append("g")
    	.attr("class", "axis")
      	.call(
      		d3.axisLeft(y).ticks(4)
      		//.ticks(null, "s")
      		)
    	.append("text")
     	.attr("x", 2)
      	.attr("y", y(y.ticks().pop()) + 0.5)
      	.attr("dy", "0.32em")
      	.attr("fill", "#000")
      	.attr("font-weight", "bold")
      	.attr("text-anchor", "start")
      	// .text("Population");

    //add legend
    var legend = g.append("g")
    	.attr("font-family", "sans-serif")
    	.attr("font-size", 10)
      	.attr("text-anchor", "end")
    	.selectAll("g")
    	.data(keys.slice())
    	.enter()
    	.append("g")
      	.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  	legend.append("rect")
      	.attr("x", width - 19)
      	.attr("width", 19)
      	.attr("height", 19)
      	.attr("fill", "white")
      	.attr("stroke", "white")
      	.attr("stroke-width", 2)
      	.attr("fill-opacity", (d, _) => d == "ExAC" ? 1 : 0);

  	legend.append("text")
      	.attr("x", width - 24)
      	.attr("y", 9.5)
      	.attr("dy", "0.32em")
      	.attr("fill", "white")
      	.text((d, _) => d);

}

function deprecated_renderBarchart(element, headDisplayName) { 

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