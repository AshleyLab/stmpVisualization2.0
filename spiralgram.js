function renderSpiralgram(data, element) {

	var nVariants = data.length; 
	var angularStep = Math.PI * 2 / nVariants; 

	var spindleColumns = [
		"SIFT Function Prediction",
		"PolyPhen-2 Function Prediction",
		"CADD Score",
		"Phylop",
		"MutationTaster",
		"fathmm",
		"1000 Genomes Frequency", 
		"ExAC Frequency",
		"GNOMADMaxAlleleFreq"
	];

	var nSpindleColumns = spindleColumns.length; 

	var width = $(element).width(); 
	var height = $(element).height();

	var center = [width / 2, height / 2];

	var outerBuffer = 40; 
	var tracksWidth = 70; 
	var spindlesToTracksBuffer = 20; 
	var innerBuffer = 75; 

	var staffElement = "#staffElement";

	var end = Math.min(center[0], center[1]); 

	var radiusMap = { 
		"innerTracks" : [60, 75],
		"spindles" : [85, 210],
		"outerTracks" : [220, 260],
		"crescents" : [265, 285]
	};

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
			.range([180, 540]); //make the first variant starts at 12 o'clock

		var maxRadius = Math.min(width, height) / 2 - outerBuffer - tracksWidth; 

		//the lienar distance between consecutive annotations
		var radiusStep = (maxRadius - innerBuffer) / (nSpindleColumns - 1);

		//flatten the data into an array (easier to visualize with d3)
		var spindleData = $.map(data, variant => 

			[$.map(spindleColumns, column => {

				var p = variant.core[column].value;
				var iM = variant.core[column].isMissing; 
				return iM ? "???" : parseFloat(p); 

			})]
	
		);

		//create container elements for the spindles with the right rotation 
		d3.select(element)
			.selectAll("g")
			.data(spindleData)
			.enter()
			.append("g")
			.attr("transform", (_, i) => "translate(" + center[0] + "," + center[1] + ") rotate(" + (rotationScale(i) + rotationScale(i + 1)) / 2 + ")")
			.attr("variant-index", (_, i) => i);

		var y1 = radiusMap["spindles"][0]; 
		var y2 = radiusMap["spindles"][1]; 

		//render the spindles
		d3.select(element)
			.selectAll("g")
			.append("line")
			.attr("variant-index", function() { return d3.select(this.parentNode).attr("variant-index"); })
			.attr("y1", y1)
			.attr("x1", 0)
			.attr("y2", y2)
			.attr("x2", 0)
			.attr("class", "spindle")
			.attr("stroke-width", 2)
			.attr("data-clicked", 0) //0 is falsey
			.on("mouseover", function(d, i) {

				d3.select(this)
					.attr("stroke", highlightForSpindle);

				var vI = parseInt(d3.select(this).attr("variant-index"));

				//assemble words
				var vD = data[vI];
				var chromosome = vD.core["Chromosome"].value; 
				var position = vD.core["Position"].value; 
				var variationType = vD.core["Variation Type"].value;
				var translationImpact = vD.core["Translation Impact"].value; 
				var words = [[variationType, 0], [" at ", 1], [chromosome, 3], [":", 1], [position, 0]];

				displayInfo(words, translationImpact, false, false, false, true); 

				renderStaff(data, i, "#staffElement", "#spiralElement"); 
				renderTextBox(i);
				renderDeleteButton(i); 

			}).on("mouseout", function(d, i) {

				if (parseInt(d3.select(this).attr("data-clicked"))) {
					return; 
				}

				d3.select(this)
					.attr("stroke", colorForSpindle);

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

			}).attr("stroke", function() { 

				return colorForSpindle(); 

			}); 

		addCircles(spindleData); 

	}

	function addCircles(spindleData) { 

		var cyScale = d3.scaleLinear()
			.domain([0, spindleData[0].length - 1])
			.range(radiusMap["spindles"]);

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
					return 0; 
				}

				//distance between two neighboring (on consecutive spindles) points of this same annotation
				var theta = (Math.PI * 2) / (nVariants) / 2; 
				var distanceAcross = 2 * cyScale(i) * Math.sin(theta);

				//distnace between two neighboring points on the same spindle
				var distanceAlong = cyScale(1) - cyScale(0);

				var maxRadius = Math.min(distanceAcross, distanceAlong) / 2; 

				return Math.max(maxRadius * d, 2); 

			}).attr("fill", (d, i) => colorForAnnotation(i, nSpindleColumns))
			.on("mouseover", function(d, i) { 

				var variantIndex = d3.select(this).attr("variant-index"); 
				var dataIndex = d3.select(this).attr("data-index");

				var property = spindleColumns[dataIndex];

				var originalValue = getOriginalValue(variantIndex, property);
				var displayName =   getDisplayName(variantIndex, property);
				var isMissing =     getIsMissing(variantIndex, property);

				var isFrequency = $.inArray(displayName, spiralgramFrequenciesDisplayNames) !== -1; 

				displayInfo(originalValue, displayName, isFrequency, isMissing, false, false);

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
					.attr("fill", colorForAnnotation(i, nSpindleColumns)); 

				displayInfo("","", false, false, false, false);

				d3.select(staffElement)
					.select("circle[data-index=\"" + i + "\"")
					.attr("fill", colorForAnnotation(i, nSpindleColumns));

			});

		}

	

	function addTracks() { 

		var trackColumns = ["Chromosome","GNOMAD_Max_Allele_Freq_POP","Protein Variant","Protein Variant"]; 
		var colorers = [colorForChromosomeBinary, colorForPopulation, colorForProteinVariantData, colorForProteinVariantData];
		var isThin = [true, true, false, false];
		var isContiguous = [true, true, false, false]; //true --> no lines between neighboring arcs

		var innerBuffer = 2;
		var outerBuffer = .5;  

		var innerBand = radiusMap["innerTracks"];
		var mInnerBand = (innerBand[0] + innerBand[1]) / 2; 
		var outerBand = radiusMap["outerTracks"];
		var mOuterBand = (outerBand[0] + outerBand[1]) / 2; 

		var radii = [
			[innerBand[0], mInnerBand - innerBuffer], 
			[mInnerBand + innerBuffer, innerBand[1]], 
			[outerBand[0], mOuterBand - outerBuffer], 
			[mOuterBand + outerBuffer, outerBand[1]]
		];

		var trackData = $.map(data, variant => 
			[$.map(trackColumns, column => variant.core[column].value)]
		); 

		var rotationScale = d3.scaleLinear()
			.domain([0, nVariants])
			.range([0, Math.PI * 2]); 

		var angularWidth = Math.PI * 2 / nVariants; 

		d3.select(element)
			.selectAll("g.track")
			.data(trackData)
			.enter()
			.append("g")
			.attr("class", "track")
			.attr("variant-index", (_, i) => i)
			.attr("transform", "translate(" + center[0] + "," + center[1] + ")"); 

		var lastText = ""; 

		d3.select(element)
			.selectAll("g.track")
			.selectAll("path") 
			.data(d => d)
			.enter()
			.append("path")
			.attr("variant-index", function() { return d3.select(this.parentNode).attr("variant-index"); })
			.classed("contiguous", function(d, i) {

				if (isContiguous[i]) { 
					return true; 
				} 

				return false; 
			})
			.attr("data-isChromosome", (_, i) => i == 2 ? "1" : "0")
			.attr("d", function(d, i) { 

				var vI = parseInt(d3.select(this.parentNode).attr("variant-index")); 

				var iR = radii[i][0];
				var oR = radii[i][1]; 

				var sA = rotationScale(vI);
				var eA = rotationScale(vI) + angularWidth;

				var arc = d3.arc()
					.innerRadius(iR)
					.outerRadius(oR)
					.startAngle(sA)
					.endAngle(eA);

				return arc(); 

			}).attr("fill", function(d, i) {

				return colorers[i](d, i == 2);

			}).on("mouseover", function(d, i) {

				var vI = parseInt(d3.select(this.parentNode).attr("variant-index")); 
				var property = trackColumns[i]; 

				//highlight on mouseover
				d3.select(this)
					.attr("fill", highlightForTrack)

				var pV = false; 

				if (i == 2 || i == 3) {
					pV = i == 2 ? "ref" : "alt";
				}

				var displayName = getDisplayName(vI, property);
				var iM = getIsMissing(vI, property)

				displayInfo(iM ? "n/a" : d, displayName, false, false, pV, false);

			}).on("mouseout", function(d, i) {

				d3.select(this)
					.attr("fill", colorers[i](d, i == 2)); 

				displayInfo("", "", false, false, false, false)

			});

	}

	function addCrescents() { 

		var innerRadius = radiusMap["crescents"][0];
		var outerRadius = radiusMap["crescents"][1];

		var trackWidth = outerRadius - innerRadius; 

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

		var dA = .001; //avoid hairline cracks between components of crescents

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
					.endAngle(eA + dA);

				return arc(); 

			}).attr("sA", (d, i) => i * angularWidth)
			.attr("eA", (d, i) => i * angularWidth + angularWidth)
			.on("mouseover", function(datum, index) {

				var vI = d3.select(this).attr("variant-index");
				var gt = getOriginalValue(vI, "GT");

				drawPedigree(gt, element, true);

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

				var d  = "M " + innerCorner1[0] + " " + innerCorner1[1] + " ";

					d += "L " + outerCorner1[0] + " " + outerCorner1[1] + " ";

				    d += "A " + outerRadius     + " " + outerRadius     + " " + 0 + " " + 0 + " " + 0 + " " + outerCorner2[0] + " " + outerCorner2[1] + " ";

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

function getAcidSymbolFromProteinVariantData(proteinVariant, getRef) {

	var aminoAcids = proteinVariant.replace("p.", "") //remove "p."s
								   .replace(/\d+/, "") //remove positions
								   .split(";");

	var tuples = $.map(aminoAcids, (aA, index) => { 
		return aA[getRef ? 0 : 1];
	}); 

	return tuples[0]; //still don't know what to do with multiple protein variants

}

function colorForAcidSymbol(symbol) {

	return {
		"A":"#00ffd4",
		"I":"#00ffee",
		"L":"#00e1ff",
		"G":"#00c8ff",
		"P":"#00aaff",
		"V":"#0077ff",

		"F":"#2aff00",
		"W":"#00ff55",
		"Y":"#00ff7b",

		"D":"#aa00ff",
		"E":"#d500ff",

		"K":"#bbff00",
		"H":"#99ff00",
		"R":"#80ff00",

		"S":"#6600ff",
		"T":"#8000ff",

		"C":"#ff00b3",
		"M":"#ff0088",

		"N":"#ff8000",
		"Q":"#ffb300",

		"*":"red"
	}[symbol];

}

function colorForProteinVariantData(proteinVariant, getRef) {

	if (!isNaN(proteinVariant) || proteinVariant.length <= 1) { //sometimes proteinVariant is 0
		return "black";
	}

	var aminoAcids = proteinVariant.replace("p.", "") //remove "p."s
								   .replace(/\d+/, "") //remove positions
								   .split(";");

	var tuples = $.map(aminoAcids, (aA, index) => { 
		return aA[getRef ? 0 : 1];
	}); 

	var chosenAcid = tuples[0];
	
	return colorForAcidSymbol(chosenAcid);

}

function colorForGenotype(genotype) { 

	var i = d3.interpolate("white","red");

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