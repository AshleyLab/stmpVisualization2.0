//always renders chromosomes 1 - 22, X, Y
var allChromosomes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Y"];

var nPairs = 22; //autosomal only?
var hoverColor = "#ff0000"; 
var colorForSNPs = "#27A4A8"
var highlightColor = "#007fff"; 


function renderKaryotype(data, element) {

	console.log(data);
	var variants = $.map(data, v => [[v.core.Chromosome.value, v.core.Position.value]]);
	var chromosomes = $.map(data, v => v.core.Chromosome.value);

	var cytobands = getCytobandData();

	var lengths = getLengths(cytobands);
	var maxLength = Math.max(...lengths); 

	var width = $(element).width();

	var leftBuffer = 20; //for chromosome labels

	var xScale = d3.scaleLinear()
		.domain([0, maxLength])
		.range([leftBuffer,  width]);

	drawCytobands(cytobands, element, xScale);
	drawVariants(variants, element, xScale, data);  

}

function drawCytobands(cytobands, element, xScale) {

	var height = $(element).height();
	var width = $(element).width();

	var canvas = d3.select(element);

	var lengths = getLengths(cytobands);

	var chromosomeHeight = 4; 
	radius = chromosomeHeight / 2; 

	window.cytobands = cytobands; 

	canvas.selectAll("g")
		.data(lengths)
		.enter()
		.append("g")
		.attr("id", function(d, i) { return "chr" + (i + 1); })
		.attr("class", "chromosome")
		.attr("transform", function(d, i) { return "translate(0, " + i * (height / nPairs) + ")"; }); 

	canvas.selectAll(".chromosome")
		.append("line")
		.attr("stroke-linecap", "round") //round the ends of the lines
		.attr("x1", xScale(0))
		.attr("y1", 0)
		.attr("x2", (d, _) => xScale(d))
		.attr("y2", 0)
		.attr("stroke", "white")
		.attr("stroke-width", 2);

	canvas.selectAll(".chromosome")
		.append("text")
		.text((_, i) => allChromosomes[i])
		.attr("x", 0)
		.attr("y", 0)
		.attr("fill", "white")
		.attr("dominant-baseline", "central") //centers text vertically at this y position
		.attr("font-size", 10);

}

function drawVariants(SNPs, element, xScale, data) { // SNPs is expected to be of the foramt [[chr, pos], [chr, pos]]

	var height = $(element).height();
	var width = $(element).width();
	var canvas = d3.select(element);

	var SNPHeight = 10;
	var SNPWidth = 4; 

	var bandWidth = 2; 

	var colorForSNPs = "#27A4A8";

	canvas.selectAll(".chromosome")
		.append("g")
		.attr("id", function(element, index) { return "SNPs" + d3.select(this.parentNode).attr("id"); })
		.selectAll("path")
		.data(function() { return getSNPsForChromosome(SNPs, d3.select(this).attr("id")); })
		.enter()
		.append("rect")
		.attr("fill", colorForSNPs)
		.attr("variant-index", function(element, index) { return getVariantIndex(SNPs, element); })
		.attr("id", function(element, index) { return "SNP" + element[0] + "_" + element[1]; })
		.attr("x", (d, i) => xScale(d[1]))
		.attr("y", (d, i) => 0 - SNPHeight / 2)
		.attr("width", SNPWidth)
		.attr("height", SNPHeight)
		.on("mouseover", function(element, index) {

			if (!d3.select(this).classed("presentedSNP")) {
				d3.select(this).attr("fill", hoverColor);
			}

			var vI = d3.select(this).attr("variant-index");

			renderStaff(data, vI, "#staffElement", "#spiralElement");

		}).on("mouseout", function(element, index) {

			if (!d3.select(this).classed("presentedSNP")) {
				d3.select(this).attr("fill", colorForSNPs);
			}
			
		}).on("click", function(element, index) {

			d3.selectAll(".chromosome g path").attr("fill", colorForSNPs);
			d3.selectAll(".chromosome g path").classed("presentedSNP", false);

			d3.select(this).attr("fill", highlightColor);
			d3.select(this).attr("class", "presentedSNP");

			var id = d3.select(this).attr("id");

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

function setSNPColor(identifier, highlight) { 

	var thisIdentifier = "SNP" + identifier; 

	d3.select("#" + thisIdentifier).attr("fill", highlight);
	d3.select("#" + thisIdentifier).attr("class", highlight === colorForSNPs ? "" : "presentedSNP");
	
}

function getSNPsForChromosome(SNPs, id) { 

	var chromosome = parseInt(id.slice(7));

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

function getLengths(cytobands) {

	var lengths = [];

	for (var i = 1; i <= nPairs; i++) {

		var chromosomeName = "chr" + i; 

		lengths[i - 1] = Math.max(...$(cytobands).filter(function(index, element) {
				return element[0] === chromosomeName;
			}).map(function(index, element) {
				return parseInt(element[2]); 
			})
		);
	}

	return lengths;
}