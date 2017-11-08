function renderSpiralgram(data, element) {

	var nVariants = data.length; 

	var spindleColumns = [

		"SIFT Function Prediction",
		"PolyPhen-2 Function Prediction",
		"CADD Score",
		"Phylop",
		"MutationTaster",
		"fathmm",
		"Sift",

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

	var rotationScale = d3.scaleLinear()
		.domain([0, nVariants])
		.range([0, 360])

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

		var maxRadius = Math.min(width, height) / 2 - outerBuffer - tracksWidth; 

		var tailLength = 0; //part of spindle there's no circles on

		//the angular distance between consecutive spindles
		var radiusStep = (maxRadius - innerBuffer - tailLength) / (nSpindleColumns - 1);

		//flatten the data into an array (easier to visualize with d3)
		var spindleData = $.map(data, variant => 

			[$.map(spindleColumns, column => {

				var p = variant.core[column].value; 
				return parseFloat(p); 

			})]
	
		);

		console.log(spindleData);

		var angularWidth = 2 * Math.PI / nVariants; 

		console.log(angularWidth);

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
			.attr("x1", innerBuffer) //since the spindles' parents gs are tilted, we can just draw a straight line
			.attr("y1", 0)
			.attr("x2", maxRadius)
			.attr("y2", 0)
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

		var cxScale = d3.scaleLinear()
			.domain([0, spindleData[0].length - 1])
			.range([innerBuffer, maxRadius]);

		var spiralgramFrequenciesDisplayNames = [
			"1000 Genomes Frequency", 
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
			.attr("variant-index", function() { return d3.select(this.parentNode).attr("variant-index") })
			.attr("data-index", (_, i) => i)
			.attr("cx", (_, i) => cxScale(i))
			.attr("cy", 0)
			.attr("r", (d, i) => d * 5)
			.attr("fill", (d, i) => colorForAnnotation(d, i, nSpindleColumns))
			.on("mouseover", function(d, i) { 

				var variantIndex = d3.select(this).attr("variant-index"); 
				var dataIndex = d3.select(this).attr("data-index");

				var property = spindleColumns[dataIndex];

				var originalValue = getOriginalValue(variantIndex, property);
				var displayName = getDisplayName(variantIndex, property);
				var isMissing = getIsMissing(variantIndex, property);

				var isFrequency = $.inArray(displayName, spiralgramFrequenciesDisplayNames) !== -1; 

				displayInfo(originalValue, displayName, isFrequency);

				d3.select(element)
					.selectAll("g")
					.selectAll("circle")
					.filter((_, index) => i == index)
					.attr("fill", highlightForCircle); 

				d3.select(staffElement)
					.select("circle[data-index=\"" + i + "\"")
					.attr("fill", highlightForSpindle);

			}).on("mouseout", function(d, i) {

				d3.select(element)
					.selectAll("g")
					.selectAll("circle")
					.filter((_, index) => i == index)
					.attr("fill", colorForAnnotation(d, i, nSpindleColumns)); 

				displayInfo("","", false);

				d3.select(staffElement)
					.select("circle[data-index=\"" + i + "\"")
					.attr("fill", colorForAnnotation(d, i, nSpindleColumns));

			});

	}

	function addTracks() { 

		var innerRadius = Math.min(width, height) / 2 - outerBuffer - tracksWidth + spindlesToTracksBuffer; 
		var outerRadius = Math.min(width, height) / 2 - outerBuffer;    

		var nTracks = 3; 

		var trackWidth = (outerRadius - innerRadius) / nTracks; 

		var innerRadiusScale = d3.scaleLinear()
			.domain([0, nTracks])
			.range([innerRadius, outerRadius]);

		console.log(trackColumns);
		console.log(data);

		var trackData = $.map(data, variant => 

			[$.map(trackColumns, column => variant.core[column].value)]

		); 

		console.log(trackData);

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
			.attr("data-index", (_, i) => i)
			.attr("transform", "translate(" + center[0] + "," + center[1] + ")"); 

		var lastText = ""; 

		d3.select(element)
			.selectAll("g.track")
			.selectAll("path") 
			.data(d => d)
			.enter()
			.append("path")
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

				if (isChromosome(this)) {

					return colorForChromosome(d)

				} else { 

					return colorForNucleotide(d);

				}

			}).on("mouseover", function(d, i) {

				//highlight on mouseover
				d3.select(this)
					.attr("fill", highlightForTrack)

				displayInfo(d, trackColumns[i]);

			}).on("mouseout", function(d, i) {

				if (isChromosome(this)) {

					d3.select(this)
						.attr("fill", colorForChromosome)

				} else { 

					d3.select(this)
						.attr("fill", colorForNucleotide);

				}

				displayInfo("","")

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
		//switch thtem to be [[dad, proband, mom], [dad, proband, mom], ...]

		var genotypes = $.map(rawGenotypes, (g, i) => [[g[1], g[0], g[2]]])

		console.log(genotypes);

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

				console.log(gt);

				drawPedigree(gt, element);

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

	console.log(parsed);

	var probandColor = colorForGenotype(parsed[0]); 
	var fatherColor = colorForGenotype(parsed[1]);
	var motherColor = colorForGenotype(parsed[2]);

	//draw a square for the father
	var squareCenterX = 100; 
	var squareCenterY = 100; 
	var squareRadius = 10; 

	d3.select(element)
		.append("rect")
		.attr("x", squareCenterX - squareRadius)
		.attr("y", squareCenterY - squareRadius)
		.attr("width", squareRadius * 2)
		.attr("height", squareRadius * 2)
		.attr("fill", fatherColor); 

	//draw a circle for the mother
	var circleCenterX = 140; 
	var circleCenterY = 100; 
	var circleRadius = 10; 

	d3.select(element)
		.append("circle")
		.attr("cx", circleCenterX)
		.attr("cy", circleCenterY)
		.attr("r", circleRadius)
		.attr("fill", motherColor);

	//draw a diamond for the proband 
	var diamondCenterX = (squareCenterX + circleCenterX) / 2; 
	var diamondCenterY = squareCenterX + 30;  
	var diamondRadius = 10;

	d3.select(element)
		.append("path")
		.attr("d", () => {

			var d = "M " + diamondCenterX + " " + (diamondCenterY - diamondRadius) + " "; 

				d += "l " + diamondRadius + " " + diamondRadius + " "; 

				d += "l " + -diamondRadius + " " + diamondRadius + " "; 

				d += "l " + -diamondRadius + " " + -diamondRadius + " "; 

				d += "Z";

			return d;	

		}).attr("fill", probandColor);

	//draw a line connecting the mother and the father
	d3.select(element)
		.append("line")
		.attr("x1", squareCenterX + squareRadius)
		.attr("y1", squareCenterY)
		.attr("x2", circleCenterX - circleRadius)
		.attr("y2", squareCenterY)
		.attr("stroke", "white")
		.attr("stroke-radius", 5);

	//draw a line connecting the proband to the line between the mother and the father
	d3.select(element)
		.append("line")
		.attr("x1", (squareCenterX + circleCenterX) / 2)
		.attr("y1", squareCenterY)
		.attr("x2", (squareCenterX + circleCenterX) / 2)
		.attr("y2", diamondCenterY - diamondRadius)
		.attr("stroke", "white")
		.attr("stroke-radius", 5);
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

	console.log(variantData);

	var gData = $.map(variantData, (variant, index) => {

		return [parseGenotype(variant.core["GT"].value)];

	}); 

	console.log(gData);
	return gData; 

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