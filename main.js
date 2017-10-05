var element, axisSpace, pathClicks, outerElement, data; 

$(function() {

	var element = "#graphics";

	axisSpace = 15; 

	/*var sampleData = [
		
		{"key" : "key1", "xyz" : {"A" : 3,"B" : 2, "C" : 4, "D" : 5, "E" : 2, "F": 4}},
		{"key" : "key2", "xyz" : {"A" : 2,"B" : 4, "C" : 3, "D" : 1, "E" : 3, "F": 1}},
        {"key" : "key3", "xyz" : {"A" : 4,"B" : 3, "C" : 1, "D" : 4, "E" : 4, "F": 3}},
        {"key" : "key4", "xyz" : {"A" : 1,"B" : 5, "C" : 2, "D" : 3, "E" : 1, "F": 4}},
        {"key" : "key5", "xyz" : {"A" : 5,"B" : 4, "C" : 3, "D" : 2, "E" : 4, "F": 2}},
        {"key" : "key6", "xyz" : {"A" : 1,"B" : 2, "C" : 2, "D" : 5, "E" : 3, "F": 2}},
		{"key" : "key7", "xyz" : {"A" : 2,"B" : 3, "C" : 4, "D" : 3, "E" : 2, "F": 1}},
        {"key" : "key8", "xyz" : {"A" : 4,"B" : 1, "C" : 5, "D" : 2, "E" : 5, "F": 3}},
        {"key" : "key9", "xyz" : {"A" : 3,"B" : 3, "C" : 1, "D" : 4, "E" : 1, "F": 2}},
        {"key" : "key10", "xyz" : {"A" : 3,"B" : 2, "C" : 4, "D" : 5, "E" : 2, "F": 4}},
		{"key" : "key11", "xyz" : {"A" : 2,"B" : 4, "C" : 3, "D" : 1, "E" : 3, "F": 1}},
        {"key" : "key12", "xyz" : {"A" : 4,"B" : 3, "C" : 1, "D" : 4, "E" : 4, "F": 3}},
        {"key" : "key13", "xyz" : {"A" : 1,"B" : 5, "C" : 2, "D" : 3, "E" : 1, "F": 4}},
        {"key" : "key14", "xyz" : {"A" : 5,"B" : 4, "C" : 3, "D" : 2, "E" : 4, "F": 2}},
        {"key" : "key15", "xyz" : {"A" : 1,"B" : 2, "C" : 2, "D" : 5, "E" : 3, "F": 2}},
		{"key" : "key16", "xyz" : {"A" : 2,"B" : 3, "C" : 4, "D" : 3, "E" : 2, "F": 1}},
        {"key" : "key17", "xyz" : {"A" : 4,"B" : 1, "C" : 5, "D" : 2, "E" : 5, "F": 3}},
        {"key" : "key18", "xyz" : {"A" : 3,"B" : 3, "C" : 1, "D" : 4, "E" : 1, "F": 2}},
        {"key" : "key19", "xyz" : {"A" : 3,"B" : 2, "C" : 4, "D" : 5, "E" : 2, "F": 4}},
		{"key" : "key20", "xyz" : {"A" : 2,"B" : 4, "C" : 3, "D" : 1, "E" : 3, "F": 1}},
        {"key" : "key21", "xyz" : {"A" : 4,"B" : 3, "C" : 1, "D" : 4, "E" : 4, "F": 3}},
        {"key" : "key22", "xyz" : {"A" : 1,"B" : 5, "C" : 2, "D" : 3, "E" : 1, "F": 4}},
        {"key" : "key23", "xyz" : {"A" : 5,"B" : 4, "C" : 3, "D" : 2, "E" : 4, "F": 2}},
        {"key" : "key24", "xyz" : {"A" : 1,"B" : 2, "C" : 2, "D" : 5, "E" : 3, "F": 2}},
		{"key" : "key25", "xyz" : {"A" : 2,"B" : 3, "C" : 4, "D" : 3, "E" : 2, "F": 1}},
        {"key" : "key26", "xyz" : {"A" : 4,"B" : 1, "C" : 5, "D" : 2, "E" : 5, "F": 3}},
        {"key" : "key27", "xyz" : {"A" : 3,"B" : 3, "C" : 1, "D" : 4, "E" : 1, "F": 2}},
        {"key" : "key28", "xyz" : {"A" : 3,"B" : 2, "C" : 4, "D" : 5, "E" : 2, "F": 4}},
		{"key" : "key29", "xyz" : {"A" : 2,"B" : 4, "C" : 3, "D" : 1, "E" : 3, "F": 1}},
        {"key" : "key30", "xyz" : {"A" : 4,"B" : 3, "C" : 1, "D" : 4, "E" : 4, "F": 3}},
        {"key" : "key31", "xyz" : {"A" : 1,"B" : 5, "C" : 2, "D" : 3, "E" : 1, "F": 4}},
        {"key" : "key32", "xyz" : {"A" : 5,"B" : 4, "C" : 3, "D" : 2, "E" : 4, "F": 2}},
        {"key" : "key33", "xyz" : {"A" : 1,"B" : 2, "C" : 2, "D" : 5, "E" : 3, "F": 2}},
		{"key" : "key34", "xyz" : {"A" : 2,"B" : 3, "C" : 4, "D" : 3, "E" : 2, "F": 1}},
        {"key" : "key35", "xyz" : {"A" : 4,"B" : 1, "C" : 5, "D" : 2, "E" : 5, "F": 3}},
        {"key" : "key36", "xyz" : {"A" : 3,"B" : 3, "C" : 1, "D" : 4, "E" : 1, "F": 2}}

	];

	// console.log(sampleData);

	data = sampleData; */
	outerElement = "#graphics";

	// var features = Object.keys(sampleData[0].xyz).length; 

	// pathClicks = Array.apply(null, Array(features)).map(Number.prototype.valueOf,0); 
	//keep track of how many times a layer is clicked so know how to sort it

	// data = renderVisualization(true, element, data); //weird things happen if renderVisualization doesn't return... ??
	$("#uploadLink").on("click", function(event){

    	event.preventDefault();
        $("#uploadInput").trigger("click");

    });

    $("#uploadInput").change(function() { 

		var file = $("#uploadInput")[0].files[0]; 

		if (validateXLSX(file)) {

			showSpinner(); 
			parseXLS(file); 

		} else { 

			console.log("invalid input");
			// showError(); 

		}

	});

	$("input[type=radio]").change(function() { 

		data = renderVisualization(this.value == "stream", element, data)

	});

});

function validateXLSX(file) {

	console.log(file.name);

	var extension = file.name.split(".").slice(-1)[0]; 

	return extension == "xlsx" || extension == "xls"; 

}

function parseXLS(XLS) {

	var reader = new FileReader();

	reader.onload = function(e) { 

		var data = e.target.result;
		var rABS = false; //actually determine this instead of just setting it statically
		var workbook;

		if (rABS) {

		    // if binary string, read with type "binary"
		    workbook = XLSX.read(data, {type: "binary"});

		} else {

		    // if array buffer, convert to base64 
		    var arr = fixdata(data);
		    workbook = XLSX.read(btoa(arr), {type: "base64"});

		}
		    
		readWorkbook(workbook);

	};

	reader.readAsArrayBuffer(XLS);
}

function readWorkbook(workbook){

	var sheetNames = workbook.SheetNames;

	console.log(workbook); 
	console.log(sheetNames);

	for (i in sheetNames) {

		var sheet = sheetNames[i];

		if (sheet == "Column Descriptions") {
			console.log("skipping " + sheet);
			continue; 
		}
	
		crudeSheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]); 
		parsedSheet = parseCrude(crudeSheet);

	}
}

//parses the "crude json" which is sheetJS's export of an xls row to a json
function parseCrude(sheet) {

	//we're going to be rendering each different field specifically
	//i.e., we'll define a way to render the chromosome, and we'll be defining a way to render the clinvar data
	//so is it really necessary to separate the different kinds of fields?

	var visualizationData = []; 

	var columns = [
		"CHROM", "POS", "REF", "ALT", "QUAL", "GT", //basic information
		"NE" /*Polyphen*/, "CADD?" /*CADD*/, "NC" /*SIFT*/, "RVIS?" /*RVIS*/, "NI" /*MutationTaster*/, "FATHMM?" /*FATHMM*/, //model scores
		"GNOMAD_Max_Allele_Freq" /*gnomAD*/, "KG_AF_POPMAX" /*1000G*/, //frequencies
		"TIER" /*Tier*/
	]

	for (i in sheet) {

		var row = sheet[i];

		var variant = {
			"core" : {}, 
			"extra" : {}, 
			"metadata" : {
				"metrics": {
					"nClicks" : 0
				}, "workflow": { 
					"curationMode" : "sheetname", 
					"notes" : "notes"
				}
			}
		}; 

		function fillTemplate(value, column) {

			if (!value) {
				console.log("missing value for " + column);

				if ($.inArray(value, ["NE", "CADD?", "NC", "RVIS?", "NI", "FATHMM?", "GNOMAD_Max_Allele_Freq", "KG_AF_POPMAX"] != -1)) {
					var newValue = Math.random(); 
					console.log("set it to " + newValue);
					value = newValue; 
				}
			}

			return {
				"value": value, //if value is null, just assign empty string 
				"drawingValue" : "", 
				"associatedValues" : []
			}
		}

		$.each(columns, (_, column) => {

			variant.core[column] = fillTemplate(row[column], column);

		}); 

		visualizationData.push(variant);
	}
	
	console.log(visualizationData);
	renderVisualization(false, "#graphics", visualizationData); 
}

function generateKey(variant) {

	var chromosome = variant.core.chromosome.value; 
	var position = variant.core.pos.value; 

	if (!chromosome || !position) { //if either chromosome or position is undefined, return 0
		return 0; 
	}

	var key = chromosome + ":" + position; 
	return key; 

}

function removeSVGs(element) {

	d3.select(element)
		.selectAll("svg")
		.remove(); 

}

function renderVisualization(isStreamgraph, element, data) {

	// var localData = deepClone(lD);
	// var sD = getSpiralData(10, 10);

	if (isStreamgraph) {

		removeSVGs(element);

		streamData = prepareDataForStreamgraph(localData);
		renderStreamgraph("#graphics", streamData); 
		renderTracks("#masterSVG", data);
		renderRadar();

	} else { //spiral

		d3.select(element)
			.append("div")
			.attr("id", "spiralLayoutContainer"); 

		d3.select("#spiralLayoutContainer")
			.append("div")
			.attr("id", "innerSpiralLayoutContainer");

		d3.select("#innerSpiralLayoutContainer")
			.append("div")
			.attr("id", "spiralContainer")
			.append("svg")
			.attr("id", "spiralElement"); 

		d3.select("#innerSpiralLayoutContainer")
			.append("div")
			.attr("id", "staffContainer")
			.append("svg")
			.attr("id", "staffElement");

		renderSpiralgram(data, "#spiralElement");
		renderStaff(data[0], "#staffElement");

	}

}

var lastStaffData = []; 

function renderStaff(rawData, element) {

	lastStaffData = rawData; 

	var width = $(element).width(); 
	var height = $(element).height();

	var columns = ["NE", "CADD?", "NC", "RVIS?", "NI", "FATHMM?", "GNOMAD_Max_Allele_Freq", "KG_AF_POPMAX"];
	var nColumns = columns.length;

	var data = $.map(columns, column => {
		var v = rawData.core[column].value; 
		if (isNaN(v)) {
			console.log(v + " is NaN");
			v = 0; 
		} 
		return parseFloat(v);
	});

	console.log(data);

	var verticalBuffer = 20; 

	var verticalScale = d3.scaleLinear()
		.domain([nColumns - 1, 0])
		.range([verticalBuffer, height - verticalBuffer])

	d3.select(element)
		.selectAll("*")
		.remove(); 

	d3.select(element)
		.append("line")
		.attr("x1", width / 2)
		.attr("y1", verticalScale(0))
		.attr("x2", width / 2)
		.attr("y2", verticalScale(data.length - 1))
		.attr("stroke", colorForSpindle); 

	var spiralElement = "#spiralElement";

	d3.select(element)
		.append("g")
		.attr("class", "circles")
		.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", width / 2)
		.attr("cy", (_, i) => verticalScale(i))
		.attr("r", (d, i) => d * 10)
		.attr("data-index", (_, i) => i)
		.attr("fill", (d, i) => { console.log(i); console.log(nColumns); return colorForAnnotation(d, i, nColumns); })
		.on("mouseenter", function(d, i) {

			d3.select(this)	
				.attr("fill", highlightForCircle); 

			d3.select(spiralElement)
				.selectAll("circle[data-index=\"" + i + "\"]") 
				.attr("fill", highlightForCircle);
				
		}).on("mouseout", function(d, i) {

			d3.select(this)	
				.attr("fill", colorForAnnotation(d, i, nColumns)); 

			d3.select(spiralElement)
				.selectAll("circle[data-index=\"" + i + "\"]") 
				.attr("fill", colorForAnnotation(d, i, nColumns))
		
		}); 

	d3.select(element)
		.append("g")
		.attr("class", "labels")
		.selectAll("text")
		.data(data)
		.enter()
		.append("text")
		.text((d, i) => i + ": " + d.toFixed(3))
		.attr("x", width / 4)
		.attr("y", (_, i) => verticalScale(i))
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "central") //centers text vertically at this y position
		.attr("fill", "white")
		.attr("font-size", "16px")
}

function colorForChromosome(d) {

	console.log("d color for " + d); 

	if (d.toLowerCase() == "x" || d.toLowerCase() == "y") { 
		return "#ff8026"
	}

	var colorScale = d3.interpolateRgb("#fff", "#000"); 
	var ratio = parseFloat(d) / 22; 
	var chromColor = colorScale(ratio); 

	console.log(ratio);
	console.log(chromColor);

	return chromColor; 

}

function colorForNucleotide(d) {

	console.log("n color for " + d);

	var colors = {"A" : "red", "G" : "green", "T" : "yellow", "U" : "yellow", "C" : "blue"}; 

	var c = d in colors ? colors[d] : "darkgrey";

	console.log(c);

	return c;

}

function renderSpiralgram(data, element) {

	var nVariants = data.length; 

	var spindleColumns = ["NE", "CADD?", "NC", "RVIS?", "NI", "FATHMM?", "GNOMAD_Max_Allele_Freq", "KG_AF_POPMAX"];
	var nSpindleColumns = spindleColumns.length; 

	var trackColumns = ["REF", "ALT", "CHROM"];
	var nTrackColumns = trackColumns.length; 

	var width = $(element).width(); 
	var height = $(element).height();

	var center = [width / 2, height / 2];

	var outerBuffer = 10; 
	var tracksWidth = 70; 
	var spindlesToTracksBuffer = 30; 
	var innerBuffer = 100; 

	var rotationScale = d3.scaleLinear()
		.domain([0, nVariants])
		.range([0, 360])

	function addText() {

		d3.select(element)
			.append("text")
			.attr("id", "info")
			.attr("x", center[0])
			.attr("y", center[1])
			.attr("text-anchor", "middle")
			.attr("font-family", "sans-serif")
			.attr("font-size", "20px")
			.attr("fill", "white")
			.attr("dominant-baseline","central");

	}

	function addSpindles() {

		var maxRadius = Math.min(width, height) / 2 - outerBuffer - tracksWidth; 

		var tailLength = 0; //part of spindle there's no circles on

		var radiusStep = (maxRadius - innerBuffer - tailLength) / (nSpindleColumns - 1);

		var spindleData = $.map(data, variant => 

			[$.map(spindleColumns, column => {

				var p = variant.core[column].value; 
				var v = parseFloat(p); 

				if (v !== v) { v = 0; } //weird way to test for NaN

				return v;
			})]
	
		);

		console.log(spindleData);

		d3.select(element)
			.selectAll("g")
			.data(spindleData)
			.enter()
			.append("g")
			.attr("transform", (_, i) => "translate(" + center[0] + "," + center[1] + ") rotate(" + rotationScale(i) + ")");

		var staffElement = "#staffElement";

		d3.select(element)
			.selectAll("g")
			.append("line")
			.attr("x1", innerBuffer)
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

				renderStaff(data[i], "#staffElement"); 

			}).on("mouseout", function(d, i) {

				if (parseInt(d3.select(this).attr("data-clicked"))) {
					return; 
				}

				d3.select(this)
					.attr("stroke", colorForSpindle);

				//find a way to go back to data staff was showing before
				renderStaff(lastStaffData, "$staffElement"); 

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

				renderStaff(data[i], "#staffElement", data.length);

			}); 

		d3.select(element)
			.selectAll("g")
			.selectAll("circle")
			.data(d => d)
			.enter()
			.append("circle")
			.attr("cx", (_, i) => innerBuffer + tailLength + i * radiusStep + radiusStep / 2)
			.attr("cy", 0)
			.attr("r", d => d == -1 ? 0 : d * 5)
			.attr("fill", (d, i) => colorForAnnotation(d, i, nSpindleColumns))
			.attr("data-index", (_, i) => i)
			.on("mouseover", function(d, i) { 

				d3.select(element)
					.selectAll("g")
					.selectAll("circle")
					.filter((_, index) => i == index)
					.attr("fill", highlightForCircle); 

				d3.select("#info")
					.text(i);

				d3.select(staffElement)
					.select("circle[data-index=\"" + i + "\"")
					.attr("fill", highlightForSpindle);

			}).on("mouseout", function(d, i) {

				d3.select(element)
					.selectAll("g")
					.selectAll("circle")
					.filter((_, index) => i == index)
					.attr("fill", colorForAnnotation(d, i, nSpindleColumns)); 

				d3.select("#info")
					.text(""); 

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
			.attr("d", function(d, index) {

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

					console.log("chromosome " + d + ", " + i);
					return colorForChromosome(d)

				} else { 

					console.log("nucleotide " + d + ", " + i);
					return colorForNucleotide(d);

				}

			})
			.on("mouseover", function(d, i) {

				d3.select(this)
					.attr("fill", highlightForTrack)

				var lastText = d3.select("#info").text(); 

				d3.select("#info").text(d);

			}).on("mouseout", function(d, i) {

				if (isChromosome(this)) {

					console.log("chromosome " + d + ", " + i);

					d3.select(this)
						.attr("fill", colorForChromosome)

				} else { 

					console.log("nucleotide " + d + ", " + i);

					d3.select(this)
						.attr("fill", colorForNucleotide);

				}

				d3.select("#info").text(lastText);

			});

		// d3.select(element)
		// 	.selectAll("g.track")
		// 	.selectAll("text")
		// 	.data(d => d)
		// 	.enter()
		// 	.append("text")
		// 	.text(d => d)
		// 	.attr("transform", function(d, index) {

		// 		var i = parseInt(d3.select(this.parentNode).attr("data-index")); 

		// 		var iR = innerRadiusScale(index); 
		// 		var oR = innerRadiusScale(index) + trackWidth; 	

		// 		var sA = rotationScale(i);
		// 		var eA = rotationScale(i) + angularWidth;

		// 		var theta = (sA + eA) / 2; 
		// 		var r = (iR + oR) / 2; 

		// 		return "translate(" + Math.sin(theta) * r + "," + Math.cos(theta) * r + ")"; //+ "rotate(" + (theta - Math.PI / 2) * (180 / Math.PI)  + ")" ; 

		// 	}).attr("text-anchor", "middle")
		// 	.attr("fill", "white")

	}

	addText(); 
	addSpindles(); 
	addTracks(); 
	
}

function isChromosome(t) {

	return parseInt(d3.select(t).attr("data-isChromosome")); 

}

function highlightForTrack() {

	return "white"; 

}

function renderTracks(element, data) {

	var keysForTracks = ["C", "D"];

	var widthStep = $(element).width() / (data.length + 1); 

	$.each(keysForTracks, (index, key) => { //it drives me insane that the parameters are passed in different orders in $.each() and $.map()

		var trackData = $.map(data, (datum, index) => datum.xyz[key] );

		d3.select(element)
			.append("g")
			.attr("class", key)
			.selectAll("rect")
			.data(trackData)
			.enter()
			.append("rect")
			.attr("x", (d, i) => (i + 0.5) * widthStep)
			.attr("y", 150 + index * 10)
			.attr("width", widthStep)
			.attr("height", 10)
			.attr("fill", (d, i) => fillForTrackDatum(d))

		d3.select(element)
			.append("g")
			.attr("class", key + "text")
			.selectAll("text")
			.data(trackData)
			.enter()
			.append("text")
			.attr("x",(d, i) => (i + 1) * widthStep)
			.attr("y", 150 + index * 10 + 5 + 1)
			.style("font-size", 9)
			.style("alignment-baseline", "middle")
			.text(d => d)
			.style("text-anchor", "middle")

	}); 

}

function fillForTrackDatum(d) {
	return getRandomColor(); 
}

function renderGlyphplot(element, data) { 

	console.log("rendering glyphplot"); 

	var forKey = {"key" : "keyX", "xyz" : {"A" : 0, "B" : 0, "C": 0, "D": 0, "E" : 0, "F" : 0}};
	data.unshift(forKey);

	var margin = {
	 	top: 20,
	  	right: 20,
	 	bottom: 20,
	  	left: 20
	};

	var width = 120 - margin.left - margin.right;
	var height = 120 - margin.top - margin.bottom;

	var scale = d3.scaleLinear()
		.domain([0, 6])
		.range([0, 150]);

	var star = d3.starPlot()
      	.width(width)
      	.accessors([
	        function(d) { return scale(d.A); },
	        function(d) { return scale(d.B); },
	        function(d) { return scale(d.C); },
	        function(d) { return scale(d.D); }, 
	        function(d) { return scale(d.E); },
	        function(d) { return scale(d.F); }
      	])
      	.labels([
	        "A",
	        "B",
	        "C",
	        "D", 
	        "E", 
	        "F"
      	])
	    .margin(margin)
		.labelMargin(4);

    data.forEach(function(datum, index) {

    d3.select("#graphics").append("svg")
        .attr("class", "starplot")
        .attr("width", width + margin.left + margin.right)
        .attr("height", width + margin.top + margin.bottom)
        .append("g")
          .datum(datum.xyz)
          .call(star)
          .classed("legend", index == 0);

    });

}

function deepClone(thing) {

	return JSON.parse(JSON.stringify(thing));

}

function getColor(index, total, highlight) {

	if (!highlight) {

		return d3.interpolateSpectral(index / (total - 1));

	} else {

		var rgb = d3.interpolateSpectral(index / (total - 1)).replace(/ /g, ""); 
		var rgbValues = rgb.substring(rgb.indexOf("(") + 1, rgb.length - 2); 
		
		var r = parseInt(rgbValues.split(",")[0]); 
		var g = parseInt(rgbValues.split(",")[1]); 
		var b = parseInt(rgbValues.split(",")[2]); 

		var hsvOriginal = RGBtoHSV(r, g, b); 
		var h = hsvOriginal.h; 
		var s = hsvOriginal.s; 
		var v = hsvOriginal.v; 

		var finalRGB = HSVtoRGB(h / 360, 0 / 100, 100 / 100); //white (for now)

		return "rgb(" + finalRGB.r + "," + finalRGB.g + "," + finalRGB.b + ")";

	}

}

function prepareDataForStreamgraph(d) {

	data = deepClone(d);

	//add baseline data so no variants are on the egde of the graph 
	data.unshift({"key" : "keyX", "xyz" : {"A" : 0, "B" : 0, "C" : 0, "D" : 0, "E" : 0, "F" : 0}}); 
	data.push({"key" : "keyX", "xyz" : {"A" : 0, "B" : 0, "C" : 0, "D" : 0, "E" : 0, "F" : 0}});

	return data; 
}

function renderStreamgraph(outerElement, data) {

	var features = Object.keys(data[2].xyz); //get keys from nondummy elements (there for now)
	var nFeatures = features.length; 
	var nVariants = data.length - 2; //subtract dummy elements (there for now) 

	var element = "masterSVG";

	d3.select("#" + element)
		.selectAll("*").remove();

	d3.select(outerElement)
		.append("svg")
		.attr("id", element);

	element = "#" + element; 

	var h = $(element).height(); 
   	var w = $(element).width(); 

	var flattened = $.map(data, d => d.xyz); 
	var stacked = d3.stack().keys(features).offset(d3.stackOffsetNone)(flattened);
	var tops = $.map(stacked[stacked.length - 1], d => d[1]); 

	var xScale = d3.scaleLinear() 
   		.domain([0, flattened.length - 1])
   		.range([0, w])

	var yScale = d3.scaleLinear() //gives the height one layer should be 
   		.domain([
   			d3.min(stacked, function(layer) { return d3.min(layer, function(d) { return d[0]; }); }), 
   			d3.max(stacked, function(layer) { return d3.max(layer, function(d) { return d[1]; }); })
   		]).range([h - axisSpace, 40]); //leave space for axis //leave space at top?

   	var lastHTML = ""; 

   	var area = d3.area()
		.curve(d3.curveCardinal)
		.x(function(datum, index) {

			var pos = xScale(index);

			// if (index == 0) { 
			// 	pos = pos + (xScale(1) - pos) / 2; 
			// } else if (index == nVariants - 1) {
			// 	pos = pos - (pos - xScale(nVariants - 2)) / 2; 
			// }

			return pos;

		}).y0( d => yScale(d[0]) )
		.y1( d => yScale(d[1]) );

	d3.select(element)
		.selectAll("path")
		.data(stacked)
		.enter()
		.append("path")
		.attr("d", area)
		.attr("fill", (d, i) => getColor(i, nFeatures, false) )
		.on("click", function(datum, index) {

			pathClicks[index]++; 
			var increasing = pathClicks[index] % 2 == 0; 

			data = data.slice(1, data.length - 1); //remove empty post values
			newData = sortOnKeys(data, ["xyz", datum.key], increasing);

			var info = "<span id=\"sortInfo\">" + (increasing ? "increasing" : "decreasing") + "</span>";
			var finalHTML = datum.key + info; 

			$("span#masterText").html(finalHTML); 

			renderStreamgraph(element, newData);

		}).on("mouseover", function(datum, index) {

			d3.select(this)
				.attr("fill", getColor(index, nFeatures, true));

			lastHTML = $("span#masterText").html(); 
			var info = pathClicks[index] == 0 ? "<span id=\"sortInfo\">click to sort</span>" : ""; 
			$("span#masterText").html(datum.key + info);

		}).on("mouseout", function(datum, index) {

			d3.select(this)
				.attr("fill", getColor(index, nFeatures, false));

			$("span#masterText").html(lastHTML);

		});

	d3.select(element)
		.append("g")
		.attr("class", "xAxis")
		.attr("transform", "translate(0," + (h - axisSpace) + ")"); 

	d3.select(".xAxis")
		.call(xAxis(xScale, data, element));

    // resizeTicks(tops, yScale, h - axisSpace);
    setTicks(); 
    raiseText(tops, yScale, h - axisSpace); 

    addButtons(); 
    drawLinesBetween(data, element, xScale, h - axisSpace);

    // haze(element, nVariants + 2); //account for dummy elements with haze

}

function addButtons(height) { 
	
	var topMargin = 12; 

	d3.selectAll(".tick")
		.append("circle")
		.attr("fill", "white")
		.attr("r", function(datum, index) {

			return index == 0 || index == data.length - 1 ? "" : 3; 

		}).attr("cx", 0)
		.attr("cy", 0 + topMargin)
		.on("click", function(datum, index) {

			var siblingLine = d3.select(this.parentNode).select("line"); //set the class on the line (that's what has the id that gives the datum)
    		siblingLine.classed("selectedForRadar", !siblingLine.classed("selectedForRadar")); //toggle the class

    		renderRadar(); 

    	}).on("mouseover", function(element, index) {

    		d3.select(this).attr("fill", "orange");

    	}).on("mouseout", function(element, index) {

    		d3.select(this).attr("fill", "white");

    	});

}

function drawLinesBetween(data, element, xScale, realHeight) { //NEW

	//Where before vertical lines were being drawn to indicate where a variant was centered, 
	//effectively covering the important information, 
	//now draw vertical lines between the variants, focusing attention on the data. 

	var paths = d3.select(element)
		.selectAll("path"); 

	var features = Object.keys(data[2].xyz); //get keys from nondummy elements (there for now)
	var nFeatures = features.length; 

	//find how high the lines should reach
	var highestPath = paths.nodes()[nFeatures - 1]; 

	var midPoints = []; 

	for (var i = 0; i < data.length - 1; i++) { 

		j = i + 1; 

		var midX = (xScale(i) + xScale(j)) / 2; 
		var midY = getHeightAtPointOnPath(midX, highestPath, element, realHeight);

		midPoints.push([midX, midY]);

	}

	d3.select(element)
		.selectAll("line.divider")
		.data(midPoints)
		.enter()
		.append("line")
		.attr("class", "divider")
		.attr("x1", d => d[0])
		.attr("x2", d => d[0])
		.attr("y1", realHeight)
		.attr("y2", d => d[1])
		.attr("stroke", "white")
		.attr("stroke-width", 1);

}

function getHeightAtPointOnPath(x, path) {

	var endLength = path.getTotalLength();

	var testLength = 0; 
	var lengthStep = 5; 

	var interval = []; 

	while (true) {

		var testPoint = path.getPointAtLength(testLength);
		var nextPoint = path.getPointAtLength(testLength + lengthStep);  

		if (testPoint.x <= x && nextPoint.x >= x) {

			interval = [testLength, testLength + lengthStep];
			break; 

		} else { 

			testLength += lengthStep; 

		}
	}

	//binary search in interval for point with x that matches x
	var counter = 0; 
	var length = binarySearch(interval[0], interval[1], x, .01, 100);

	var midPoint = path.getPointAtLength(length);

	function binarySearch(startLength, endLength, targetX, precision, bailAfter) {

		counter++; 

		var midLength = (startLength + endLength) / 2; 
		var midX = path.getPointAtLength(midLength).x; 

		if (counter > bailAfter) {
			return midLength;
		}

		if (Math.abs(midX - targetX) <= precision) {
			return midLength; 
		} else if (midX < targetX) {
			return binarySearch(midLength, endLength, targetX, precision)
		} else { 
			return binarySearch(startLength, midLength, targetX, precision);
		}

	}

	return path.getPointAtLength(length).y;

}

function setTicks() { 

    d3.selectAll(".tick line")
    	.attr("id", function(datum, index) {

    		return "axisLine" + index; 

    	});

}

function xAxis(xScale, data, element) {	

	return d3.axisTop(xScale)
		.tickSize(0) //custom resize later
		.ticks(data.length)
		.tickFormat(function(datum, index) {

			return index == 0 || index == data.length - 1 ? "" : data[index].key;

		}); 

}

function resizeTicks(tops, yScale, drawingHeight) { 

	d3.selectAll("g.xAxis g.tick line")
		.attr("y2", function(datum, index) {

			if (index == 0 || index == data.length - 1) {
				return 0; 
			}

			return -(drawingHeight - yScale(tops[index])); 

		});


}

function raiseText(tops, yScale, drawingHeight) { 

	d3.selectAll("g.tick text")
		.attr("transform", function(datum, index) {

			var textLengthOffset = 25; 
			var textWidthOffset = 6; 

			var bar = d3.min(tops, function(item) { return yScale(item); }); 
			console.log(bar)

			var dist = (drawingHeight - bar) + textLengthOffset;
			// var dist = (drawingHeight - yScale(tops[index])) + textLengthOffset; //to position the text dynamically

			if (index == 0 || index == data.length - 1) {
				dist = 0; 
			}

			return "rotate(-90) translate(" + dist + "," + textWidthOffset + ")";

		}) //rotating also rotates the coordiante system

}
 
function haze(element, nVariants) { 

	var buffer = 1;

	var h = $(element).height() - axisSpace; 
	var w = $(element).width() / (nVariants - 1);

	var startXs = [...Array(nVariants - 1).keys()];
	startXs = $.map(startXs, e => e * w + buffer);

	d3.select(element)
		.append("g")
		.attr("class", "hazeContainer")
		.selectAll("rect.haze")
		.data(startXs)
		.enter()
		.append("rect")
		.attr("class", "haze")
		.attr("x", d => d)
		.attr("y", 0)
		.attr("width", w - (buffer * 2))
		.attr("height", h)
		.attr("opacity", .3)
		.attr("stroke", "black");

}

function renderRadar() { 

	var element = "detailSVG";

	if (d3.select("#" + element).size() == 0) { 

		d3.select(outerElement)
			.append("svg")
			.attr("id", element); 

	}


	element = "#" + element;

	var radarData = getRadarData(); 

	if (radarData.length == 0) {
		return d3.select(element).selectAll("*").remove(); 
	}
	
	var formatted = $.map(radarData, function(variant, index) {
		var toPlot = []; 
		for (var key in variant.xyz) {
			toPlot.push({
				"axis" : key, 
				"value" : variant.xyz[key]
			}); 
		}

		return [toPlot]; 
	}); 

	var color = d3.scaleLinear()
				.range(["#EDC951","#CC333F","#00A0B0"]);

	var margin = {top: 50, right: 100, bottom: 100, left: 50};

	var radarChartOptions = {
		w: 200,
		h: 200,
		margin: margin,
	  	levels: 5,
	  	roundStrokes: true,
	  	color: color
	};

	RadarChart(element, formatted, radarChartOptions);

}

var lastRadarData = []; 

function getRadarData() { 

	var keys = [];

	d3.selectAll(".selectedForRadar").each(function(element, index){

		var id = d3.select(this).attr("id");
		keys.push(parseInt(id.substring(id.indexOf("e") + 1)) - 1); //TODO: actually get key

	});

	var selectedData = $.map(keys, key => data[key]); //the data actually selected by the user
	var indexOfLatestItem; 

	//make sure latest add is last in array
	var finalData = [];

	$.grep(lastRadarData, function(element) {
        if ($.inArray(element, selectedData) != -1) { 
        	finalData.push(element);
        } 
	});

	$.grep(selectedData, function(element) {
		if ($.inArray(element, lastRadarData) == -1) { //put this new element at the end
			finalData.push(element);
		};
	});

	lastRadarData = finalData; 
	return finalData;

}

function sortOnKeys(data, keys, increasing) { 

	var sorted = data.sort(function(a, b) {

		var aEl = a; 
		var bEl = b; 

		for (i = 0; i < keys.length; i++) {
			aEl = aEl[keys[i]]; 
			bEl = bEl[keys[i]];
		}

		return increasing ? d3.ascending(aEl, bEl) : d3.descending(aEl, bEl);

	}); 

	sorted.unshift({"key" : "keyX", "xyz" : {"A" : 0, "B" : 0, "C" : 0, "D" : 0, "E" : 0, "F" : 0}}); 
	sorted.push({"key" : "keyX", "xyz" : {"A" : 0, "B" : 0, "C" : 0, "D" : 0, "E" : 0, "F" : 0}});

	return sorted; 
}

function getRandomColor() {

	return "#" + Math.floor(Math.random() * 16777215).toString(16);
	
}

function showSpinner() { 

	$("#spinnerContainer").show()
	$("#inputContainer").hide()

}

function hideSpinner() {

	$("#spinnerContainer").hide()
	$("#inputContainer").show()

}

function scrollToElement(element) {

	$("html, body").animate({
        scrollTop: $(element).offset().top
    }, 2000);

}

function HSVtoRGB(h, s, v) {

    var r, g, b, i, f, p, q, t;

    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }

    i = Math.floor(h * 6);

    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function RGBtoHSV() {

    var rr, gg, bb,
        r = arguments[0] / 255,
        g = arguments[1] / 255,
        b = arguments[2] / 255,
        h, s, 
        v = Math.max(r, g, b),
        diff = v - Math.min(r, g, b),
        diffc = function(c) {
            return (v - c) / 6 / diff + 1 / 2;
        };

    if (diff == 0) {

        h = s = 0;

    } else {

        s = diff / v;
        rr = diffc(r);
        gg = diffc(g);
        bb = diffc(b);

        if (r === v) {
            h = bb - gg;
        } else if (g === v) {
            h = (1 / 3) + rr - bb;
        } else if (b === v) {
            h = (2 / 3) + gg - rr;
        }
        
        if (h < 0) {
            h += 1;
        } else if (h > 1) {
            h -= 1;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}

function highlightForSpindle() { 

	return "white";

}

function colorForSpindle() { 

	return "darkgrey";

}

function highlightForCircle() { 

	return "white";

}

function colorForAnnotation(datum, index, nSpiralAnnotations) { 

	// console.log(datum + " : " + index + " : " + nSpiralAnnotations);

	return "#" + Math.floor((index + 1) / (nSpiralAnnotations + 1) * 16777215).toString(16);

}

function getSpiralData(nVariants, nSpiralAnnotations) {

	var emptyProbability = .25;

	return $.map(new Array(nVariants), function(index, element) {

		return [$.map(new Array(nSpiralAnnotations), function(i, e) {

			return Math.random() > emptyProbability ? parseFloat(Math.random().toFixed(3)) : -1; 

		})];

	});

}

function fixdata(data) { //copied from?
	var o = "", l = 0, w = 10240;
	for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
	o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
	return o;
}
