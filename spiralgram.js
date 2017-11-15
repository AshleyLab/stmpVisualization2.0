function renderSpiralgram(data, element) {

	var nVariants = data.length; 

	var spindleColumns = [
		"SIFT Function Prediction",
		"PolyPhen-2 Function Prediction",
		"CADD Score",
		"Phylop",
		"MutationTaster",
		"fathmm",
		// "Sift",
		"1000 Genomes Frequency", 
		"ExAC Frequency",
		"GNOMADMaxAlleleFreq"
	];

	var nSpindleColumns = spindleColumns.length; 

	var trackColumns = ["Reference Allele", "Sample Allele", "Chromosome"];
	var nTrackColumns = trackColumns.length; 

	var width = $(element).width(); 
	var height = $(element).height();

	var center = [width / 2, height / 2];

	var outerBuffer = 40; 
	var tracksWidth = 70; 
	var spindlesToTracksBuffer = 20; 
	var innerBuffer = 50; 

	function addText() {

		d3.select(element)
			.append("text")
			.attr("id", "valueInfo")
			.attr("x", center[0])
			.attr("y", center[1] - 10)
			.attr("text-anchor", "middle")
			.attr("font-family", "sans-serif")
			.attr("font-size", "20px")
			.attr("fill", "white")
			.attr("dominant-baseline","central");

		d3.select(element)
			.append("text")
			.attr("id", "kindInfo")
			.attr("x", center[0])
			.attr("y", center[1] + 10)
			.attr("text-anchor", "middle")
			.attr("font-family", "sans-serif")
			.attr("font-size", "10px")
			.attr("fill", "grey")
			.attr("dominant-baseline","central");

	}

	function addSpindles() {

		var rotationScale = d3.scaleLinear()
			.domain([0, nVariants])
			.range([180, 540]); //some acrobatics to make the first variant starts at 12 o'clock

		var maxRadius = Math.min(width, height) / 2 - outerBuffer - tracksWidth; 

		//part of spindle there's no circles on
		var tailLength = 0; 

		//the angular distance between consecutive spindles
		var radiusStep = (maxRadius - innerBuffer - tailLength) / (nSpindleColumns - 1);

		//flatten the data into an array (easier to visualize with d3)
		var spindleData = $.map(data, variant => 

			[$.map(spindleColumns, column => {

				var p = variant.core[column].value;
				var iM = variant.core[column].isMissing; 
				return iM ? "???" : parseFloat(p); 

			})]
	
		);

		console.log(spindleData);

		var angularWidth = 2 * Math.PI / nVariants; 

		//create container elements for the spindles with the right rotation 
		d3.select(element)
			.selectAll("g")
			.data(spindleData)
			.enter()
			.append("g")
			.attr("transform", (_, i) => "translate(" + center[0] + "," + center[1] + ") rotate(" + (rotationScale(i) + rotationScale(i + 1)) / 2 + ")")
			.attr("variant-index", (_, i) => i);

		var staffElement = "#staffElement";

		//render the spindles
		d3.select(element)
			.selectAll("g")
			.append("line")
			.attr("variant-index", function() { return d3.select(this.parentNode).attr("variant-index"); })
			.attr("y1", innerBuffer) //since the spindles' parents gs are tilted, we can just draw a straight line
			.attr("x1", 0)
			.attr("y2", maxRadius)
			.attr("x2", 0)
			.attr("class", "spindle")
			.attr("stroke", colorForSpindle)
			.attr("stroke-width", 2)
			.attr("data-clicked", 0) //0 is falsey
			.on("mouseover", function(d, i) {

				d3.select(this)
					.attr("stroke", highlightForSpindle);

				renderStaff(data, i, "#staffElement", "#spiralElement"); 

			}).on("mouseout", function(d, i) {

				if (parseInt(d3.select(this).attr("data-clicked"))) {
					return; 
				}

				d3.select(this)
					.attr("stroke", colorForSpindle);

				//find a way to go back to data staff was showing before
				// renderStaff(lastStaffData, "#staffElement"); 
				// and higlight that last variant

			}).on("click", function(d, i) {

				var clicked = parseInt(d3.select(this).attr("data-clicked"));

				d3.select(this)
					.attr("stroke", clicked ? colorForSpindle : highlightForSpindle); 

				d3.select(element)
					.selectAll("line")
					.filter((_, index) => index != i)
					.attr("data-clicked", 0)
					.attr("stroke", colorForSpindle);

				d3.select(this).attr("data-clicked", 1 - clicked)

				renderStaff(data, i, "#staffElement", "#spiralElement");

			}); 

		var cyScale = d3.scaleLinear()
			.domain([0, spindleData[0].length - 1])
			.range([innerBuffer, maxRadius]);

		var spiralgramFrequenciesDisplayNames = [
			"1000 Genomes Frequency", 
			"ExAC Frequency",
			"gnomAD Max Frequency"
		];

		var spiralgramHeadFrequenciesDisplayNames = [
			"ExAC Frequency",
			"gnomAD Max Frequency"
		];

		//render the circles on the spindles
		d3.select(element)
			.selectAll("g")
			.selectAll("circle")
			.data(d => d)
			.enter()
			.append("circle")
			.attr("variant-index", function() { return d3.select(this.parentNode).attr("variant-index"); })
			.attr("data-index", (_, i) => i)
			.attr("cy", (_, i) => cyScale(i))
			.attr("cx", 0)
			.attr("r", (d, i) => {

				if (d == "???") {
					console.log("detected ???");
					return 0; 
				}

				//maximum radius for an annotation should depend on number of annotations and distance from center

				//distance between two neighboring (on consecutive spindles) points of this annotation
				var theta = (Math.PI * 2) / (nVariants) / 2; 
				var distanceAcross = 2 * cyScale(i) * Math.sin(theta);

				//distnace between two neighboring points on the same spindle
				var distanceAlong = cyScale(1) - cyScale(0);

				var maxRadius = Math.min(distanceAcross, distanceAlong) / 2; 

				return Math.max(maxRadius * d, 2); 

			})
			.attr("fill", (d, i) => colorForAnnotation(d, i, nSpindleColumns))
			.on("mouseover", function(d, i) { 

				var variantIndex = d3.select(this).attr("variant-index"); 
				var dataIndex = d3.select(this).attr("data-index");

				var property = spindleColumns[dataIndex];

				var originalValue = getOriginalValue(variantIndex, property);
				var displayName = getDisplayName(variantIndex, property);
				var isMissing = getIsMissing(variantIndex, property);

				var isFrequency = $.inArray(displayName, spiralgramFrequenciesDisplayNames) !== -1; 

				displayInfo(originalValue, displayName, isFrequency, isMissing);

				d3.select(element)
					.selectAll("g")
					.selectAll("circle")
					.filter((_, index) => i == index)
					.attr("fill", highlightForCircle); 

				d3.select(staffElement)
					.select("circle[data-index=\"" + i + "\"")
					.attr("fill", highlightForSpindle);

				//if it's a "head frequency" (one that has population-level subfrequencies), render it in the barchart
				var isHeadFrequency = $.inArray(displayName, spiralgramHeadFrequenciesDisplayNames) !== -1; 

				if (isHeadFrequency) {
					renderBarchart(data, "#barchartElement", variantIndex, displayName);
				}

			}).on("mouseout", function(d, i) {

				d3.select(element)
					.selectAll("g")
					.selectAll("circle")
					.filter((_, index) => i == index)
					.attr("fill", colorForAnnotation(d, i, nSpindleColumns)); 

				displayInfo("","", false, false);

				d3.select(staffElement)
					.select("circle[data-index=\"" + i + "\"")
					.attr("fill", colorForAnnotation(d, i, nSpindleColumns));

			});

	}

	function addTracks() { 

		var trackColumns = ["Protein Variant", "Protein Variant", "Chromosome"];

		var innerRadius = Math.min(width, height) / 2 - outerBuffer - tracksWidth + spindlesToTracksBuffer; 
		var outerRadius = Math.min(width, height) / 2 - outerBuffer;    

		var nTracks = 3; 

		var trackWidth = (outerRadius - innerRadius) / nTracks; 

		var innerRadiusScale = d3.scaleLinear()
			.domain([0, nTracks])
			.range([innerRadius, outerRadius]);

		var trackData = $.map(data, variant => 

			[$.map(trackColumns, column => variant.core[column].value)]

		); 

		console.log(trackData); 

		var rotationScale = d3.scaleLinear()
			.domain([0, nVariants])
			.range([0, Math.PI * 2]); //IS THIS RIGHT

		var angularWidth = Math.PI * 2 / nVariants; 

		d3.select(element)
			.selectAll("g.track")
			.data(trackData)
			.enter()
			.append("g")
			.attr("class", "track")
			// .attr("variant-index", function() { return d3.select(this.parentNode).attr("variant-index"); })
			.attr("data-index", (_, i) => i)
			.attr("transform", "translate(" + center[0] + "," + center[1] + ")"); 

		var lastText = ""; 

		d3.select(element)
			.selectAll("g.track")
			.selectAll("path") 
			.data(d => d)
			.enter()
			.append("path")
			.attr("variant-index", function() { return d3.select(this.parentNode).attr("variant-index"); })
			.attr("data-isChromosome", (_, i) => i == 2 ? "1" : "0")
			.attr("d", function(d, index) { //manually specify the shape of the path

				var i = parseInt(d3.select(this.parentNode).attr("data-index")); 

				var iR = innerRadiusScale(index); 
				var oR = innerRadiusScale(index) + trackWidth; 

				var sA = rotationScale(i);
				var eA = rotationScale(i) + angularWidth;

				var arc = d3.arc()
					.innerRadius(iR)
					.outerRadius(oR)
					.startAngle(sA)
					.endAngle(eA);

				return arc(); 

			}).attr("fill", function(d, i) {

				if (i == 2) {

					return colorForChromosome(d)

				} else { 

					console.log("finding fill for " + d + ": " + i); 

					if (d == 0) {
						return "black";
					}

					var fill = colorForProteinVariantData(d, i == 1);

					console.log(fill);

					return fill; 

					// return colorForNucleotide(d);

				}

			}).on("mouseover", function(d, i) {

				//highlight on mouseover
				d3.select(this)
					.attr("fill", highlightForTrack)

				displayInfo(d, trackColumns[i], false, false);

			}).on("mouseout", function(d, i) {

				if (isChromosome(this)) {

					d3.select(this)
						.attr("fill", colorForChromosome)

				} else { 

					console.log("finding fill for " + d + ": " + i); 

					if (d == 0) {
						return d3.select(this)
							.attr("fill", "black")
					}

					var fill = colorForProteinVariantData(d, i == 1);

					console.log(fill);

					d3.select(this)
						.attr("fill", fill);


				}

				displayInfo("", "", false, false)

			});

	}

	function addCrescents() { 

		var innerRadius = Math.min(width, height) / 2 - outerBuffer + 10;  
		var outerRadius = innerRadius + 20; 

		var trackWidth = outerRadius - innerRadius; 

		// var rotationScale = d3.scaleLinear()
		// 	.domain([0, nVariants])
		// 	.range([0, Math.PI * 2]);

		var gRotationScale = d3.scaleLinear()
			.domain([0, nVariants])
			.range([0, 360]);


		var angularWidth = Math.PI * 2 / (nVariants * 3); 

		var rawGenotypes = getGenotypes();

		//genotypes are currently [[proband, dad, mom], [proband, dad, mom], ...]
		//switch them to be [[dad, proband, mom], [dad, proband, mom], ...]

		var genotypes = $.map(rawGenotypes, (g, i) => [[g[1], g[0], g[2]]])

		d3.select(element)
			.selectAll("g.crescent")
			.data(genotypes)
			.enter()
			.append("g")
			.attr("class", "crescent")
			.attr("variant-index", (_, i) => i)
			.attr("transform", (d, i) => "translate(" + center[0] + "," + center[1] + ") rotate(" + gRotationScale(i) + ")"); 

		d3.select(element)
			.selectAll("g.crescent")
			.selectAll("path")
			.data(d => d)
			.enter()
			.append("path")
			.attr("fill", (d, _) => colorForGenotype(d))
			.attr("variant-index", function() { return d3.select(this.parentNode).attr("variant-index"); })
			.attr("d", function(d, i) {

				var sA = i * angularWidth; 
				var eA = sA + angularWidth; 

				var arc = d3.arc()
					.innerRadius(innerRadius)
					.outerRadius(outerRadius)
					.startAngle(sA)
					.endAngle(eA);

				return arc(); 

			}).attr("sA", (d, i) => i * angularWidth)
			.attr("eA", (d, i) => i * angularWidth + angularWidth)
			.on("mouseover", function(datum, index) {

				var vI = d3.select(this).attr("variant-index");

				var gt = getOriginalValue(vI, "GT");

				drawPedigree(gt, element);

			}).on("mouseout", () => {

				//remove any shapes associated with the pedigree
				d3.select(element)
					.selectAll(".pedigree")
					.remove();

			});

		//apply a mask to "cut out" the crescents——or just make them ring-band type things? //mask could just be arc //actually don't even need mask
		d3.select(element)
			.selectAll("g.crescent")
			.append("path")
			.attr("class","mask")
			.attr("fill","#22262e")
			.attr("variant-index", function() { return d3.select(this.parentNode).attr("variant-index"); })
			.attr("d", function(d, i) {

				var sA = 0; 

				sA -= (Math.PI / 2); //WHY? IDK

				var eA = angularWidth * 3;

				eA -= (Math.PI / 2); 

				var mA = (sA + eA) / 2; 


				var innerCorner1 = [innerRadius * Math.cos(sA), innerRadius * Math.sin(sA)];
				var innerCorner2 = [innerRadius * Math.cos(eA), innerRadius * Math.sin(eA)];

				var oR = outerRadius + 1; //eliminate edge effects

				var outerCorner1 = [oR * Math.cos(sA), oR * Math.sin(sA)];
				var outerCorner2 = [oR * Math.cos(eA), oR * Math.sin(eA)];

				var controlPointRadius = innerRadius + (outerRadius - innerRadius) / 1;
				var controlPoint = [controlPointRadius * Math.cos(mA), controlPointRadius * Math.sin(mA)]

				var d = "M " + innerCorner1[0] + " " + innerCorner1[1] + " ";

					d += "L " + outerCorner1[0] + " " + outerCorner1[1] + " ";

				   d += "A " + outerRadius + " " + outerRadius + " " + 0 + " " + 0 + " " + 0 + " " + outerCorner2[0] + " " + outerCorner2[1] + " ";

				   d += "L " + innerCorner2[0] + " " + innerCorner2[1] + " ";

				   d += "Q " + controlPoint[0] + " " + controlPoint[1] + " " + innerCorner1[0] + " " + innerCorner1[1] + " "; 

				   d += "Z";

				return d; 

			}).attr("sA", (d, i) => { 

				return 0;  

			}).attr("eA", angularWidth * 3); 

	}

	addText(); 
	addSpindles(); 
	addTracks(); 
	addCrescents(); 
	
}

function drawPedigree(gt, element) { 

	var parsed = parseGenotype(gt); 

	var probandColor = colorForGenotype(parsed[0]); 
	var fatherColor = colorForGenotype(parsed[1]);
	var motherColor = colorForGenotype(parsed[2]);

	var strokeWidthForUnknownGenotype = 1; //thickness of the outline of the shape be when we don't the genotype

	var radius = 10; 

	//this should be the halfway point of the vertical line that connects the proband and the parents line
	var centerX = $(element).width() / 2; 
	var centerY = $(element).height() / 2; 

	//draw a square for the father
	var squareCenterX = centerX - radius * 2; 
	var squareCenterY = centerY - radius;  

	d3.select(element)
		.append("rect")
		.attr("class", "pedigree")
		.attr("x", squareCenterX - radius)
		.attr("y", squareCenterY - radius)
		.attr("width", radius * 2)
		.attr("height", radius * 2)
		.attr("fill", fatherColor)
		.attr("stroke", "white")
		.attr("stroke-width", parsed[1] == -1 ? strokeWidthForUnknownGenotype : 0);

	//draw a circle for the mother
	var circleCenterX = centerX + radius * 2; 
	var circleCenterY = centerY - radius; 

	d3.select(element)
		.append("circle")
		.attr("class", "pedigree")
		.attr("cx", circleCenterX)
		.attr("cy", circleCenterY)
		.attr("r", radius)
		.attr("fill", motherColor)
		.attr("stroke", "white")
		.attr("stroke-width", parsed[2] == -1 ? strokeWidthForUnknownGenotype : 0);

	//draw a diamond for the proband 
	var diamondCenterX = centerX; 
	var diamondCenterY = centerY + radius * 2; 

	d3.select(element)
		.append("path")
		.attr("class", "pedigree")
		.attr("d", () => {

			var d = "M " + diamondCenterX + " " + (diamondCenterY - radius) + " "; 

				d += "l " + radius + " " + radius + " "; 

				d += "l " + -radius + " " + radius + " "; 

				d += "l " + -radius + " " + -radius + " "; 

				d += "Z";

			return d;	

		}).attr("fill", probandColor)
		.attr("stroke", "white")
		.attr("stroke-width", parsed[0] == -1 ? strokeWidthForUnknownGenotype : 0);

	//draw a line connecting the mother and the father
	d3.select(element)
		.append("line")
		.attr("class", "pedigree")
		.attr("x1", squareCenterX + radius)
		.attr("y1", squareCenterY)
		.attr("x2", circleCenterX - radius)
		.attr("y2", squareCenterY)
		.attr("stroke", "white")
		.attr("stroke-radius", 5);

	//draw a line connecting the proband to the line between the mother and the father
	d3.select(element)
		.append("line")
		.attr("class", "pedigree")
		.attr("x1", (squareCenterX + circleCenterX) / 2)
		.attr("y1", squareCenterY)
		.attr("x2", (squareCenterX + circleCenterX) / 2)
		.attr("y2", diamondCenterY - radius)
		.attr("stroke", "white")
		.attr("stroke-radius", 5);
}

function colorForProteinVariantData(proteinVariant, getRef) {

	console.log(proteinVariant);

	var aminoAcids = proteinVariant.replace("p.", "") //remove "p."s
								   .replace(/\d+/, "") //remove positions
								   .split(";");

	var tuples = $.map(aminoAcids, (aA, index) => { 
		return aA[getRef ? 0 : 1];
	}); 

	var colors = {
		"#20A39E" : ["A", "G", "I", "L", "P", "V"], //Ala, Gly, Ile, Leu, Pro, VaL: Aliphatic
		"#98CE00" : ["F", "W", "Y"], //Phe, Trp Tyr: Aromatic
		"#FF715B" : ["D", "E"], //Asp, Glu: Acidic
		"#F0386B" : ["R", "H", "K"], //Arg, His, Lys: Basic
		"#93E5AB" : ["S", "T"], //Ser, Thr: Hydroxylic
		"#FB8B24" : ["C", "M"], //Cys, Met: Sulfur-containing
		"#FB8B24" : ["N", "Q"], //Asn, Gln: Amidic
		"red" : ["*", "Stop"] //Stop
	}

	var chosenAcid = tuples[0];
	var color = "black";

	$.each(colors, function(key, value) {

		if ($.inArray(chosenAcid, value) !== -1) { 
			color = key; 
		} 

	});

	return color; 

	// console.log(tuples);

}

function colorForGenotype(genotype) { 

	var i = d3.interpolate("black","white");

	if (genotype == "0") {
		return i(0); 
	} else if (genotype == "1") { 
		return i(.5);
	} else if (genotype == "2") { 
		return i(1);
	} else { 
		return "#22262e";
	}

 
}

function getGenotypes() {

	return $.map(variantData, (variant, index) => {

		return [parseGenotype(variant.core["GT"].value)];

	}); 

}

function parseGenotype(genotype) { //e.g., 0/1|./.|1/1

	return $.map(genotype.split("|"), (g, i) => {

		if (g === "0/0") { 
			return 0; 
		} else if (g === "0/1" || g === "1/0") {
			return 1; 
		} else if (g === "1/1") {
			return 2; 
		} else if (g === "./.") {
			return -1; 
		} else {
			console.log("don't understand " + g + " in " + genotype);
		}

	}); 

}