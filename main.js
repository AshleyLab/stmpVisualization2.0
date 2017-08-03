var element, axisSpace, pathClicks; 

$(function() {

	var element = "#graphics";

	axisSpace = 15; 

	var sampleData = [
		
		{"key" : "key1", "xyz" : {"A" : 3,"B" : 2, "C" : 4, "D" : 5, "E" : 2, "F": 4}},
		{"key" : "key2", "xyz" : {"A" : 2,"B" : 4, "C" : 3, "D" : 1, "E" : 3, "F": 1}},
        {"key" : "key3", "xyz" : {"A" : 4,"B" : 3, "C" : 1, "D" : 4, "E" : 4, "F": 3}},
        {"key" : "key4", "xyz" : {"A" : 1,"B" : 5, "C" : 2, "D" : 3, "E" : 1, "F": 4}},
        {"key" : "key5", "xyz" : {"A" : 5,"B" : 4, "C" : 3, "D" : 2, "E" : 4, "F": 2}},
        {"key" : "key6", "xyz" : {"A" : 1,"B" : 2, "C" : 2, "D" : 5, "E" : 3, "F": 2}},
		{"key" : "key7", "xyz" : {"A" : 2,"B" : 3, "C" : 4, "D" : 3, "E" : 2, "F": 1}},
        {"key" : "key8", "xyz" : {"A" : 4,"B" : 1, "C" : 5, "D" : 2, "E" : 5, "F": 3}},
        {"key" : "key9", "xyz" : {"A" : 3,"B" : 3, "C" : 1, "D" : 4, "E" : 1, "F": 2}}

	];

	data = sampleData; 

	var features = Object.keys(sampleData[0].xyz).length; 

	pathClicks = Array.apply(null, Array(features)).map(Number.prototype.valueOf,0); 
	//keep track of how many times a layer is clicked so know how to sort it

	data = renderVisualization(true, element, data); //weird things happen if renderVisualization doesn't return... ??

	$("#uploadLink").on("click", function(event){

    	event.preventDefault();
        $("#uploadInput").trigger("click");

    });

    $("#uploadInput").change(function() { 

		var file = $("#uploadInput")[0].files[0]; 

		if (validateXLSX(file)) {

			showSpinner(); 
			parseXLSX(file); 

		} else { 

			showError(); 

		}

	});

	$("input[type=radio]").change(function() { 

		data = renderVisualization(this.value == "stream", element, data)

	});

});

function validateXLSX(file) {

	console.log(file.name);

	var extension = file.name.split(".").slice(-1)[0]; 

	return extension == ".xlsx" || extension == ".xls"; 

}

function parseXLSX(XLSX) {

	console.log("parsing", XLSX);

	var infoColumnCorrespondenceDict = {
		"chromosome" : ["CHROM", "Chromosome"],
		"ref" : ["REF", "Reference Allele", "Reference Nucleotide"],
		"alt" : ["ALT", "Sample Allele", "Variant Nucleotide"],
		"pos" : ["POS", "Position", "Start"]
	};

	var numericColumnCorrespondenceDict = {
		"fullExac" : ["hg19_popfreq_all_20150413_exac_all", "ExAC (AF%)", "ExAC (%)", "ExAC"],
		"europeExac": ["ExAC European", "hg19_popfreq_all_20150413_exac_nfe"],
		"1kgenomes": ["1000 Genomes", "hg19_popfreq_all_20150413_1000g_all"]
	};

	var stringColumnCorrespondenceDict = {
		"clinvar" : ["clinvar_clinical_significance"]
	};

	function readTSV(TSV) { 

		data = []; 
		lines = tsv.split("\n");
		columns = lines[0].split("\t");

		for (var line in lines) { 

			data.append(line.split("\t"));

		}

		console.log(columns)
		console.log(data)

		return [columns, data];

	}

	function getVariantInfo(variantLine, idxDict, variantRecord) { 

		var placeholder = []; 

		for (var column in placeholder) { 

			value = variantLine[idxDict[column]] || "na";

			if (column == "Gene_Summar") {
				choices = ["OR2T35", "BRCA1", "AFF3", "MYO7B", "ZNF806", "NEB", "SP100", "SYN2"];
				value = choices[Math.floor(Math.random() * choices.length)]; 
			}

		}

	}

	function writeFile(columns, lines, pos) {


	}

	var infoFieldTemplate = { 
		"value" : "", 
		"includeInDrawing" : false
	};

	var stringAnnotationTemplate = {
		"value": "", 
		"drawingValue": "", 
		"includeInDrawing": false, 
		"associatedValues": []
	};

	var otherFieldTemplate = {
		"value": "", 
		"drawingValue": "", 
		"includeInDrawing": false, 
		"associatedValues": []
	};

	function rowToJSON(row, curDf) { 

		var variant = {}; 
		var coreAnnotationFields = {
			"infoFields" : "",
			"numericAnnotations" : "", 
			"stringAnnotations" : "", 
			"otherFields" : ""
		};

		variant["coreAnnotationFields"] = coreAnnotationFields;

		var infoFields = {}; 
		var numericAnnotations = {}; 
		var stringAnnotations = {};
		var otherFields = {}; 

		columns = curDf.columns; 

		for (var column in columnames) { 
		}

		variant["coreAnnotationFields"]["infoFields"] = infoFields; 
		variant["coreAnnotationFields"]["numericAnnotations"] = numericAnnotations; 
		variant["coreAnnotationFields"]["stringAnnotations"] = stringAnnotations; 

		return variant; 

	}

	function initalizeVariantMetadata(variant, sheetName) {
		variantMetadataStruct = {"metadata" : "", "workflow" : ""};
		metricsDict = {"numTimesClicked" : ""};
		workflowDict = {"curationMode" : sheetName, "freeTextNotes" : "enter any notes here"}
		variantMetadataStruct["metrics"] = metricsDict
		variantMetadataStruct["workflow"] = workflowDict 

		return variantMetadataStruct; 
	}

	function structToJSON(JSON) {
		parsed = json.loads(jsonFile);
		console.log(json.dumps(parsed))
	}

	function writeJSON(fileName, parsedJSON) {
		jsonFile = open(file, "w+")
		jsonFile.write(json.dumps(parsedJSON));
	}


} 

function renderVisualization(isStreamgraph, element, localData) {

	if (isStreamgraph) {

		streamData = deepClone(localData);

		renderStreamgraph("#masterSVG", streamData); 

	} else { 

		renderGlyphplot(element, localData); 

	}

	return localData;

}

function renderGlyphplot(element, data) { 

	return; 

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

function renderStreamgraph(element, unpaddedData) {

	element = "#graphics";
	id = "masterSVG";
	d3.select(element)
		.append("svg")
		.attr("id", id);

	element = "#" + id;

	data = deepClone(unpaddedData);

	//add baseline data so no variants are on the egde of the graph 
	data.unshift({"key" : "keyX", "xyz" : {"A" : 0, "B" : 0, "C" : 0, "D" : 0, "E" : 0, "F" : 0}}); 
	data.push({"key" : "keyX", "xyz" : {"A" : 0, "B" : 0, "C" : 0, "D" : 0, "E" : 0, "F" : 0}});

	d3.select(element).html("");

	var h = $(element).height(); 
   	var w = $(element).width(); 

	var flattened = $.map(data, function(element, index) {
		return element.xyz; 
	}); 

	var features = Object.keys(data[0].xyz);

	var stacker = d3.stack().keys(features).offset(d3.stackOffsetNone);
	var stacked = stacker(flattened);

	var tops = $.map(stacked[stacked.length - 1], function(element, index) {
		return element[1];
	});

	var xScale = d3.scaleLinear() 
   		.domain([0, flattened.length - 1])
   		.range([0, w])

	var yScale = d3.scaleLinear() //gives the height one layer should be 
   		.domain([
   			d3.min(stacked, function(layer) { return d3.min(layer, function(d) { return d[0]; }); }), 
   			d3.max(stacked, function(layer) { return d3.max(layer, function(d) { return d[1]; }); })
   		]).range([h - axisSpace, 10]); //leave space for axis //leave space at top?

   	var lastHTML = ""; 

	d3.select(element)
		.selectAll("path")
		.data(stacked)
		.enter()
		.append("path")
		.attr("d", function(datum, index) {

			var area = d3.area()
				.curve(d3.curveCardinal)
				.x(function(d, i) { 
					return xScale(i); 
				}).y0(function(d, i) { 

					return yScale(d[0]); 

				}).y1(function(d, i) { 

					return yScale(d[1]); 

				});

			return area(datum, index);

		}).attr("fill", getRandomColor)
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

			lastHTML = $("span#masterText").html(); 
			var info = pathClicks[index] == 0 ? "<span id=\"sortInfo\">click to sort</span>" : ""; 
			$("span#masterText").html(datum.key + info);

		}).on("mouseout", function(datum, index) {

			$("span#masterText").html(lastHTML);

		});

	d3.select(element)
		.append("g")
		.attr("class", "xAxis")
		.attr("transform", "translate(0," + (h - axisSpace) + ")")
		.call(xAxis(xScale, data));

	var clipTicks = true; 

    resizeTicks(tops, yScale, h - axisSpace);

    d3.selectAll(".tick line")
    	.attr("id", function(datum, index) {

    		return "axisLine" + index; 

    	}).on("click", function(datum, index) {

    		d3.select(this).classed("selectedForRadar", !d3.select(this).classed("selectedForRadar")); //toggle the class
    		updateRadar(); 

    	});

    // haze(element); 

    console.log(unpaddedData);

}

function xAxis(xScale, data) {		
	return d3.axisBottom(xScale)
		.tickSize(0) //custom resize later
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
 
function haze(element) { 

	var nVariants = 11;
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
		.attr("opacity", .6)
		.attr("stroke", "black");

}

function updateRadar() { 

	var selectedVariants = []; 

	d3.selectAll(".selectedForRadar").each(function(element, index){

		var id = d3.select(this).attr("id");
		selectedVariants.push(parseInt(id.substring(id.indexOf("e") + 1))); //TODO: actually get key

	});

	var selectedData = $.map(selectedVariants, function(element, index) {
		return data[element];
	});

	// renderRadar(element, selectedData);

}

function renderRadar(element, data) { 

	data = data.slice(0, 3)

	var formatted = $.map(data, function(variant, index) {
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
		maxValue: 6,
	  	levels: 5,
	  	roundStrokes: true,
	  	color: color
	};

	RadarChart(element, formatted, radarChartOptions);

}

function sortOnKeys(data, keys, increasing) { 

	return data.sort(function(a, b) {

		var aEl = a; 
		var bEl = b; 

		for (i = 0; i < keys.length; i++) {
			aEl = aEl[keys[i]]; 
			bEl = bEl[keys[i]];
		}

		return increasing ? d3.ascending(aEl, bEl) : d3.descending(aEl, bEl);

	}); 

}

function getRandomColor() {

	return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function renderJSON(JSON) {


}

function showSpinner() { 

	console.log("showing");

	$("#spinnerContainer").show()
	$("#inputContainer").hide()

}

function hideSpinner() {

	console.log("hiding");

	$("#spinnerContainer").hide()
	$("#inputContainer").show()

}

function scrollToElement(element) {

	$("html, body").animate({
        scrollTop: $(element).offset().top
    }, 2000);

}