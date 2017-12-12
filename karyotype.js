function renderKaryotype(element) {

	var data = window.variantData; 

	//renders chromosomes 1 - 22, X, Y
	var allChromosomes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Y"];
	var nChromosomes = allChromosomes.length; 

	var variants = $.map(data, v => [[v.core.Chromosome.value, v.core.Position.value]]);
	var chromosomes = $.map(data, v => v.core.Chromosome.value);
	var cytobands = getCytobandData();

	var lengths = getLengths(cytobands, allChromosomes);
	var maxLength = Math.max(...lengths); 

	var width = $(element).width();
	var height = $(element).height(); 

	var margin = {
		top : 20, 
		bottom : 20, 
		left: 20, 
		right: 20
	};

	var xScale = d3.scaleLinear()
		.domain([0, maxLength])
		.range([margin.left, width - margin.right]);

	var yScale = d3.scaleLinear()
		.domain([0, nChromosomes - 1])
		.range([margin.top, height - margin.bottom])

	drawCytobands(cytobands, element, xScale, yScale, margin.left, margin.right, allChromosomes);
	drawVariants(variants, element, xScale, yScale, data, allChromosomes);  

}

function drawCytobands(cytobands, element, xScale, yScale, leftBuffer, rightBuffer, allChromosomes) {

	var height = $(element).height();
	var width = $(element).width(); 

	var canvas = d3.select(element);

	var lengths = getLengths(cytobands, allChromosomes);

	window.cytobands = cytobands; 

	var rightTextBuffer = 4; 

	canvas.selectAll("g")
		.data(lengths)
		.enter()
		.append("g")
		.attr("id", function(d, i) { return "chr" + (i + 1); })
		.attr("class", "chromosome")
		.attr("transform", function(d, i) { return "translate(0, " + yScale(i) + ")"; })
		.attr("chromosome-index", (_, i) => i);

	canvas.selectAll(".chromosome")
		.append("line")
		.attr("stroke-linecap", "round") //round the ends of the lines
		.attr("x1", xScale(0))
		.attr("y1", 0)
		.attr("x2", (d, _) => xScale(d))
		.attr("y2", 0)
		.attr("stroke", (d, i) => {

			if (isNaN(allChromosomes[i])) {
				return "#F05F40";
			}

			return i % 2 == 0 ? "white" : "#d1d1d1";

		}).attr("stroke-width", 2);

	canvas.selectAll(".chromosome")
		.append("text")
		.attr("x", (d, i) => i % 2 == 0 ? leftBuffer / 2 : xScale(d) + rightBuffer / 2)
		.attr("y", 0)
		.attr("fill", (d, i) => i % 2 == 0 ? "white" : "#d1d1d1")
		.attr("text-anchor", (_, i) => i % 2 == 0 ? "end" : "start") 
		.attr("dominant-baseline", "central") //centers text vertically at this y position
		.attr("font-size", 9)
		.text((d, i) => allChromosomes[i])

}

function drawVariants(SNPs, element, xScale, yScale, data, allChromosomes) { // SNPs is expected to be of the format [[chr, pos], [chr, pos]]

	// var hoverColor = "#ff0000"; 
	var hoverColor = "red";
	var colorForSNPs = "#27A4A8"
	var highlightColor = "#007fff"; 

	var height = $(element).height();
	var canvas = d3.select(element);

	var SNPHeight = 8;
	var SNPWidth = 3; 

	var colorForSNPs1 = "#27A4A8";
	var colorForSNPs2 = "#1f8b8e";

	canvas.selectAll(".chromosome")
		.append("g")
		.attr("id", function(element, index) { return "SNPs" + d3.select(this.parentNode).attr("id"); })
		.attr("chromosome-index", function() { return d3.select(this.parentNode).attr("chromosome-index"); })
		.selectAll("rect")
		.data((d, i) => getSNPsForChromosome(SNPs, i, allChromosomes))
		.enter()
		.append("rect")
		.attr("variant-index", function(element, index) { return getVariantIndex(SNPs, element); })
		.attr("fill", function() { 

			if (d3.select(this).attr("variant-index") == window.variantIndex) {
				return hoverColor;
			}

			var i = parseInt(d3.select(this.parentNode).attr("chromosome-index")); 
			return i % 2 == 0 ? colorForSNPs1 : colorForSNPs2;

		}).attr("id", function(element, index) { return "SNP" + element[0] + "_" + element[1]; })
		.attr("x", (d, i) => xScale(d[1]))
		.attr("y", (d, i) => 0 - SNPHeight / 2)
		.attr("width", SNPWidth)
		.attr("height", SNPHeight)
		.on("mouseover", function(element, index) {

			d3.select(this).attr("fill", "red");

			var vI = d3.select(this).attr("variant-index");

			renderStaff("#staffElement", "#spiralElement");
			window.variantIndex = d3.select(this).attr("variant-index");
			updateAncillaryVisualizations(); 

		}).on("mouseout", function(element, index) {

			d3.select(this).attr("fill", colorForSNPs);	
			
		});

}

function getVariantIndex(SNPs, element) {

	var index = $.map(SNPs, (d, i) => {

		if (d[0] == element[0] && d[1] == element[1]) { 
			return i; 
		}

	});

	return index[0];

}

function getSNPsForChromosome(SNPs, index, allChromosomes) { 

	var chromosome = allChromosomes[index];

	return $(SNPs).filter(function(index, element) {
		return element[0] == chromosome; 
	}); 

}

function isCent(band) {
	return band[4] === "acen";
}

function getPrevious(band) { 

	return $(window.cytobands).filter(function(index, element) {
		return element[0] === band[0] && element[2] == band[1];
	});

}

function getNext(band) {

	return $(window.cytobands).filter(function(index, element) {
		return element[0] === band[0] && element[1] == band[2];
	});

}

function getCytobandsForChromosome(cytobands, chromosome) {

	return $(cytobands).filter(function(index, element) { 
		return element[0] === chromosome; 
	});
}

function getLengths(cytobands, allChromosomes) {

	var lengths = [];
	
	for (var i = 0; i <= allChromosomes.length - 1; i++) {

		var chromosomeName = "chr" + allChromosomes[i]

		lengths[i] = Math.max(...$(cytobands).filter(function(index, element) {
				return element[0] === chromosomeName;
			}).map(function(index, element) {
				return parseInt(element[2]); 
			})
		);
	}

	return lengths;
}