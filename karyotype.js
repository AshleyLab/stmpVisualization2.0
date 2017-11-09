
var nPairs = 22; //autosomal only?
var hoverColor = "#ff0000"; 
var colorForSNPs = "#27A4A8"
var highlightColor = "#007fff"; 

function renderKaryotype(data, element) {

	console.log(data);
	var variants = $.map(data, v => [[v.core.Chromosome.value, v.core.Position.value]]);

	var cytobands = getCytobandData();

	var lengths = getLengths(cytobands);
	var maxLength = Math.max(...lengths); 

	var width = $(element).width();

	var xScale = d3.scaleLinear()
		.domain([0, maxLength])
		.range([0,  width]);

	var includesY

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
		.selectAll("path")
		.data(function() { return getCytobandsForChromosome(cytobands, d3.select(this).attr("id")); })
		.enter()
		.append("path")
		.attr("fill", function(element, index) { return colorForStain(element[4]); })
		.attr("d", function(element, index) {

			var isLeftRounded = roundLeft(element, lengths); 
			var isRightRounded = roundRight(element, lengths);

			return rounded_rect(
				xScale(element[1]), 
				((height / nPairs - chromosomeHeight) / 2), 
				xScale(parseInt(element[2]) - parseInt(element[1])), 
				chromosomeHeight, 
				(chromosomeHeight / 2), 
				isLeftRounded, 
				isRightRounded 
			);
		});
}

function drawVariants(SNPs, element, xScale, data) { // SNPs is expected to be of the foramt [[chr, pos], [chr, pos]]

	var height = $(element).height();
	var width = $(element).width();
	var canvas = d3.select(element);

	var SNPHeight = 10;
	var SNPWidth = 4; 

	var colorForSNPs = "#27A4A8";

	canvas.selectAll(".chromosome")
		.append("g")
		.attr("id", function(element, index) { return "SNPs" + d3.select(this.parentNode).attr("id"); })
		.selectAll("path")
		.data(function() { return getSNPsForChromosome(SNPs, d3.select(this).attr("id")); })
		.enter()
		.append("path")
		.attr("fill", colorForSNPs)
		.attr("variant-index", function(element, index) { return getVariantIndex(SNPs, element); })
		.attr("id", function(element, index) { return "SNP" + element[0] + "_" + element[1]; })
		.attr("d", function(element, index) {

			return rounded_rect(
				xScale(element[1]), 
				((height / nPairs - SNPHeight) / 2), 
				SNPWidth, 
				SNPHeight, 
				0, 
				false, 
				false 
			);

		}).on("mouseover", function(element, index) {

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

			$("#H3" + id.slice(3)).click(); 
		})

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

	var SNPs = $(SNPs).filter(function(index, element) {
		return element[0] == chromosome; 
	}); 

	return SNPs;

}

function colorForStain(stain) {

	//simplified
	if (stain == "acen") { 
		return "#832226";
	}

	return "#7f7f7f"; 

	// switch (stain) {
	// 	case "gneg": 
	// 		return "#DDDDDD";
	// 	case "gvar": 
	// 		return "#000000";
	// 	case "gpos25":
	// 		return "#7B7B7B";
	// 	case "gpos50":
	// 		return "#444444"; 
	// 	case "gpos75":
	// 		return "#2B2B2B";
	// 	case "gpos100":
	// 		return "#000000";
	// 	case "acen":
	// 		return "#2B2B2B";
	// 	case "stalk":
	// 		return "#2B2B2B";
	// 	default: 
	// 		return "#0061ff";
	// }

}

function rounded_rect(x, y, width, height, radius, roundLeft, roundRight) {

    var path  = "M" + (x + radius) + "," + y;
    path += "h" + (width - 2 * radius);

    if (roundRight) { 
    	path += "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius; 
    	path += "v" + (height - 2 * radius);
    	path += "a" + radius+ "," + radius + " 0 0 1 " + -radius + "," + radius;
    } else { 
    	path += "h" + radius; path += "v" + radius; 
    	path += "v" + (height - 2 * radius);
    	path += "v" + radius; path += "h" + -radius;
    }

    path += "h" + (2 * radius - width);

    if (roundLeft) { 
    	path += "a" + radius + "," + radius + " 0 0 1 " + -radius+ "," + -radius; 
    	path += "v" + (2 * radius - height);
    	path += "a" + radius + "," + radius + " 0 0 1 " + radius + "," + -radius;
    } else { 
    	path += "h" + -radius; path += "v" + -radius; 
    	path += "v" + (2 * radius - height);
    	path += "v" + -radius; path += "h" + radius;
    }

    path += "z";

    return path;
}

function roundLeft(band, lengths) {

	var previous = getPrevious(band);

	if (previous.length == 0) {
		return true; //this is the first band in the cytoband; there is no previous band
	} 

	if (isCent(band) && isCent(previous.get(0))) {
		return true; 
	}

	return false; 

	
}

function roundRight(band, lengths) {

	var chromosome = parseInt(band[0].slice(3));

	var next = getNext(band);

	if (next.length == 0) { 
		return true; 
	}

	if (isCent(band) && isCent(next.get(0))) {
		return true; 
	}

	return false; 

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

	return cyts = $(cytobands).filter(function(index, element) { 
		return element[0] === chromosome; 
	});
}

function randomColor() { 
	return '#'+Math.floor(Math.random()*16777215).toString(16);
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