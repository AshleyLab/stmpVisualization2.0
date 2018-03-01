function renderSpiralgram(element) {

	var staffElement = "#staffElement";

	var data = window.variantData; 
	var nVariants = data.length; 

	var width = $(element).width(); 
	var height = $(element).height();
	var center = [width / 2, height / 2];
	var end = Math.min(center[0], center[1]); 

	var radiusMap = { 
		"innerTracks" : [60, 75],
		"spindles" : [85, 210],
		"outerTracks" : [220, 260],
		"crescents" : [265, 285]
	};

	var deleteds = $.map(data, d => d.metadata.isDeleted);

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

		var spindleColumns = [
			"SIFT Function Prediction",
			"PolyPhen-2 Function Prediction",
			"MutationTaster",
			"CADD Score",
			"phyloP",
			"fathmm",
			"1000 Genomes Frequency", 
			"ExAC Frequency",
			"GNOMADMaxAlleleFreq"
		];

		var nSpindleColumns = spindleColumns.length; 

		var rotationScale = d3.scaleLinear()
			.domain([0, nVariants])
			.range([180, 540]); //make the first variant starts at 12 o'clock

		//prepare data
		//flatten the data into an array
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
			.attr("variant-index", (_, i) => i)
			.each(function(d, i) {

				if (deleteds[i]) {
					this.classList.add("deleted");
				} 

			});

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
			.on("mouseover", function(d, i) {

				// d3.select(this)
				// 	.classed("stroke", highlightForSpindle);

				var vI = parseInt(d3.select(this).attr("variant-index"));

				//get data to present
				var words = getWordsForInfo(data, vI);
				var translationImpact = data[vI].core["Translation Impact"].value; 

				displayInfo(words, translationImpact, false, false, false, true); 

				//don't loop: don't rerender spiralgram
				window.variantIndex = vI; 
				updateAncillaryVisualizations(); 

			}).on("mouseout", function(d, i) {

				d3.select(this)
					.attr("stroke", colorForSpindle);

			}).attr("stroke", colorForSpindle); 

		addCircles(spindleData, spindleColumns);

	}

	function addCircles(spindleData, spindleColumns) { 

		var nSpindleColumns = spindleColumns.length; 

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
					console.log("radius: " + 0); 
					return 0; 
				}

				//distance between two neighboring (on consecutive spindles) points of this same annotation
				var theta = (Math.PI * 2) / (nVariants) / 2; 
				var distanceAcross = 2 * cyScale(i) * Math.sin(theta);

				//distance between two neighboring points on the same spindle
				var distanceAlong = cyScale(1) - cyScale(0);

				var maxRadius = Math.min(distanceAcross, distanceAlong) / 2; 
				// var minRadiusForKnownData = 2; 
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

				d3.select(this)
					.attr("fill", highlightForCircle);

				window.variantIndex = variantIndex; 
				updateAncillaryVisualizations(); 

			}).on("mouseout", function(d, i) {

				d3.select(this)
					.attr("fill", colorForAnnotation(i, nSpindleColumns)); 

				displayInfo("","", false, false, false, false);

			}).on("contextmenu", function(d, i) { //when right clicked: open menu for manipulating

				addContextMenu(this);
				d3.event.preventDefault(); //don't show the browser's context menu

			}); 

	}

	function idk() { }

	function deleteVariantFromContextMenuWrapper(data, index) { // --> tools.js?

		return function() { 
			deleteVariant(data, index); //deleteVariant() is from tools.js
		}

	}

	function addContextMenu(circle) {

		var items = ["a", "b", "delete"];

		var vI = parseInt(d3.select(circle).attr("variant-index"));
		var deleter = deleteVariantFromContextMenuWrapper(data, vI)
		var actions = [idk, idk, deleter];

		var dy = 20; 
		var dx = 40; 
		var heightBleed = 1; //overlap contextMenuItems by this much vertically so there's no crack between them
		var cornerRadius = 4;
		var strokeWidth = 2; 

		//where should we put the top-left corner of the contextMenu?
		var coords = getCircleCoordinates(circle);
		var x = coords.x;
		var y = coords.y; 

		//remove the previous contextmenu (probably this should be done somewhere else)
		d3.select("#contextMenu").remove(); 

		//draw contextMenu
		d3.select(element)
			.append("g")
			.attr("id", "contextMenu")
			.selectAll("rect")
			.data(items)
			.enter()
			.append("path")
			.attr("d", function(d, i) {

				console.log("i: " + i); 
				var finalX = x; 
				var finalY = y + i * dy; 

				var roundTL = false; 
				var roundTR = i == 0; //round top-right corner only of first item in context menu
				var roundBL = i == items.length - 1; //round bottom-right and -left corners only of last item in context menu
				var roundBR = i == items.length - 1; 

				return roundedRect(finalX, finalY, dx, dy + heightBleed, cornerRadius, roundTL, roundTR, roundBL, roundBR);

			}).attr("class", "contextMenuPath")
			.attr("data-index", (_, i) => i) //for handling contextMenuText and contextMenuRect mouse events below
			.attr("fill", "orange")
			.attr("stroke-width", strokeWidth); 

		//add text to contextMenu
		d3.select("#contextMenu")
			.append("g")
			.attr("id", "contextMenuTextG")
			.selectAll("text")
			.data(items)
			.enter()
			.append("text")
			.attr("class", "contextMenuText")
			.attr("x", x + dx / 2)
			.attr("y", (d, i) => y + i * dy + dy / 2)
			.text(d => d)
			.style("fill", "white")
			.attr("data-index", (_, i) => i) //for handling contextMenuText and contextMenuRect mouse events below
			.attr("dominant-baseline","central") //center text vertically at y
			.attr("text-anchor", "middle") //center text horizontally at xting
			.attr("font-size", "10px"); 

		//since text is sometimes in front of rectangle 
			//and thus prevents mouseover and mousexit from being triggered
		//handle events together
		d3.selectAll(".contextMenuText,.contextMenuPath")
			.on("mouseover", function(d, i) {

				var dataIndex = d3.select(this).attr("data-index");

				//find the path with this data-index
				var path = d3.select("path[data-index = \"" + dataIndex + "\"]");

				path.attr("fill", "red");

			}).on("mouseout", function(d, i) {

				var dataIndex = d3.select(this).attr("data-index");

				//find the path with this data-index
				var path = d3.select("path[data-index = \"" + dataIndex + "\"]");

				path.attr("fill", "orange");

			}).on("click", function() {

				console.log("clicked");
				var dataIndex = parseInt(d3.select(this).attr("data-index"));

				var action = actions[dataIndex];
				console.log(action);

				action();

			});

	}

	function roundedRect(x, y, width, height, radius, roundTL, roundTR, roundBL, roundBR) { //https://stackoverflow.com/a/13505624/2809263

	    console.log(arguments);

	    var path = "M" + (x + radius) + "," + y;
	    path += "h" + (width - 2 * radius);

	    if (roundTR) { 
	    	path += "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius; 
	    } else { 
	    	path += "h" + radius; 
	    	path += "v" + radius; 
	    }

	    path += "v" + (height - 2 * radius);

	    if (roundBR) { 
	    	path += "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius; 
	    } else { 
	    	path += "v" + radius; 
	    	path += "h" + -radius; 
	    }

	    path += "h" + (2 * radius - width);

	    if (roundBL) { 
	    	path += "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + -radius; 
	    } else { 
	    	path += "h" + -radius; 
	    	path += "v" + -radius; 
	    }

	    path += "v" + (2 * radius - height);

	    if (roundTL) { 
	    	path += "a" + radius + "," + radius + " 0 0 1 " + radius + "," + -radius; 
	    } else { 
	    	path += "v" + -radius; 
	    	path += "h" + radius; 
	    }

	    path += "z";
	    return path;
	}

	function getCircleCoordinates(circle) { //https://stackoverflow.com/a/18561829/2809263

		console.log(circle);

		var cx = d3.select(circle).attr("cx");
		var cy = d3.select(circle).attr("cy");

		var ctm = circle.getCTM(); 
		var x = ctm.e + cx * ctm.a + cy * ctm.c; 
		var y = ctm.f + cx * ctm.b + cy * ctm.d;

		return {"x" : x, "y" : y};

	}
	
	function addTracks() { 

		var trackColumns = ["Chromosome", "GNOMAD_Max_Allele_Freq_POP", "Protein Variant", "Protein Variant"]; 
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

		var angularWidth = Math.PI * 2 / nVariants; 

		var trackData = $.map(data, variant => 
			[$.map(trackColumns, column => variant.core[column].value)]
		); 

		console.log(trackData);

		var rotationScale = d3.scaleLinear()
			.domain([0, nVariants])
			.range([0, Math.PI * 2]); 

		d3.select(element)
			.selectAll("g.track")
			.data(trackData)
			.enter()
			.append("g")
			.attr("class", "track")
			.attr("variant-index", (_, i) => i)
			.attr("transform", "translate(" + center[0] + "," + center[1] + ")"); 

		var lastText = ""; 

		var strokeWidth = 1.5; //currently set in CSS

		d3.select(element)
			.selectAll("g.track")
			.selectAll("path") 
			.data(d => d)
			.enter()
			.append("path")
			.attr("variant-index", function() { return d3.select(this.parentNode).attr("variant-index"); })
			.classed("contiguous", (_, i) => {

				return isContiguous[i];

			}).attr("data-isChromosome", (_, i) => i == 2 ? "1" : "0")
			.attr("d", function(d, i) { 

				var vI = parseInt(d3.select(this.parentNode).attr("variant-index")); 
				var property = trackColumns[i]; 
				var iM = getIsMissing(vI, property)

				var iR = radii[i][0];
				var oR = radii[i][1]; 

				var sA = rotationScale(vI);
				var eA = sA + angularWidth;

				var contractIM = true; 
				if (contractIM && iM) { //make arcs for which data is missing slightly smaller so that can use stroke as outline and still have space between neighboring arcs
					angleContract = 0.01
					iR += strokeWidth; 
					oR -= strokeWidth; 
					sA += angleContract; 
					eA -= angleContract;  
				}

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

				window.variantIndex = vI; 
				updateAncillaryVisualizations(); 

			}).on("mouseout", function(d, i) {

				d3.select(this)
					.attr("fill", colorers[i](d, i == 2)); 

				displayInfo("", "", false, false, false, false)

			}).each(function(d, i) {

				var vI = d3.select(this.parentNode).attr("variant-index"); 

				if (deleteds[vI]) {
					this.classList.add("deleted");
				}

				var property = trackColumns[i]; 
				var iM = getIsMissing(vI, property)

				if (iM) {
					this.classList.add("isMissing");
				}

			}).attr("stroke", "white")
			.attr("stroke-width", function(d, i) {

				// var vI = parseInt(d3.select(this.parentNode).attr("variant-index")); 
				// var property = trackColumns[i]; 
				// var iM = getIsMissing(vI, property)

				// //give protein variant tracks with missing data a track
				// if (i == 2 || i == 3) {
				// 	if (iM) {
				// 		return 2; 
				// 	}
				// }

				// return 0; 

			});

		//need to simulate appearance of hollow arc for tracks where data is missing
		//can't do with stroke since stroke is what draws space BETWEEN arcs
		//do make the original arc white 
		//and inset a smaller arc that's the color of the background

		//--> could just make original arc smaller?

		// insetArcsForUnknownPVData(trackData);
		function insetArcsForUnknownPVData(trackData) { 

			//take just PV data
			var pvData = $.map(trackData, (d, _) => { 
				return [[d[2], d[3]]]
			});

			//replace empty data
			var insetData = $.map(pvData, (d, vI) => {

				return [
					$.map(d, (e, i) => {

						var property = trackColumns[i + 2]; //since removed chromosome, gnomAD data 
						return getIsMissing(vI, property);

					})
				]

			}); //now indicates which arcs should have inset

			console.log(insetData);

			d3.select(element)
				.selectAll("g.trackInset")
				.data(insetData)
				.enter()
				.append("g")
				.attr("class", "track")
				.attr("variant-index", (_, i) => i)
				.attr("transform", "translate(" + center[0] + "," + center[1] + ")"); 

		}

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
			.attr("transform", (d, i) => "translate(" + center[0] + "," + center[1] + ") rotate(" + gRotationScale(i) + ")")
			.each(function(d, i) {

				if (deleteds[i]) {
					this.classList.add("deleted");
				}

			});

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
				window.variantIndex = vI; 
				updateAncillaryVisualizations(); 

			}).on("mouseout", () => {

				//remove any shapes associated with the pedigree
				d3.select(element)
					.selectAll(".pedigree")
					.remove();

			}).each(function(d, i) {

				if (d == -1) {
					this.classList.add("unknown");
				}

			});

		//apply a mask to "cut out" the crescents——or just make them ring-band type things? //mask could just be arc //actually don't even need mask
		d3.select(element)
			.selectAll("g.crescent")
			.append("path")
			.attr("class","mask")
			.attr("fill","#22262e")
			.attr("variant-index", function() { return d3.select(this.parentNode).attr("variant-index"); })
			.attr("d", function(d, i) {

				var sA = 0; //so the first varinat starts at 12 o'clock

				sA -= (Math.PI / 2); //so the first varinat starts at 12 o'clock

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

			});

	}

	addText(); 
	addSpindles(); 
	addTracks(); 
	addCrescents(); 
	
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

function getWordsForInfo(data, vI) {

	var vD = data[vI];
	var chromosome = vD.core["Chromosome"].value; 
	var position = vD.core["Position"].value; 
	var variationType = vD.core["Variation Type"].value;

	return [[variationType, 0], [" at ", 1], [chromosome, 3], [":", 1], [position, 0]];

}