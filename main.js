$(function() {

	var streamElement = "#streamSVG"; 
	var radarElement = "#radarSVG";

	var sampleData = [
		
		{"key" : 1, "xyz" : {"A" : 3,"B" : 2, "C" : 4, "D" : 5}},
		{"key" : 2, "xyz" : {"A" : 2,"B" : 4, "C" : 3, "D" : 1}},
        {"key" : 3, "xyz" : {"A" : 4,"B" : 3, "C" : 1, "D" : 4}},
        {"key" : 4, "xyz" : {"A" : 1,"B" : 5, "C" : 2, "D" : 3}},
        {"key" : 5, "xyz" : {"A" : 5,"B" : 4, "C" : 3, "D" : 2}},
        {"key" : 6, "xyz" : {"A" : 1,"B" : 2, "C" : 2, "D" : 5}},
		{"key" : 7, "xyz" : {"A" : 2,"B" : 3, "C" : 4, "D" : 3}},
        {"key" : 8, "xyz" : {"A" : 4,"B" : 1, "C" : 5, "D" : 2}},
        {"key" : 9, "xyz" : {"A" : 3,"B" : 3, "C" : 1, "D" : 4}}
	];

	renderStreamgraph(streamElement, sampleData); 
	renderRadar(radarElement, sampleData); 

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



		}

	});

});

function validateXLSX(file) {

	console.log(file);
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

		for (line in lines) { 

				data.append(line.split("\t"));

		}

		console.log(columns)
		console.log(data)

		return [columns, data];

	}

	function getVariantInfo(variantLine, idxDict, variantRecord) { 

		var placeholder = []; 

		for (column in placeholder) { 

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

		for (column in columnames) { 
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

function renderStreamgraph(element, data) {

	console.log("rendering streamgraph...");

	data = sortOnKeys(data, ["xyz", "C"], false);

	var flattened = $.map(data, function(element, index) {
		return element.xyz; 
	}); 

	var stacker = d3.stack().keys(["A", "B", "C", "D"]).offset(d3.stackOffsetNone);

	var stacked = stacker(flattened);

	var area = d3.area()
			.curve(d3.curveCardinal)
			.x(function(d, i) { 
				return xScale(i); 
			}).y0(function(d, i) { 
				return yScale(d[0]); 
			}).y1(function(d, i) { 
				return yScale(d[1]); }
			);

	var h = $(element).height(); 
   	var w = $(element).width(); 

	var yScale = d3.scaleLinear()
   		.domain([
   			d3.min(stacked, function(layer) { return d3.min(layer, function(d) { return d[0]; }); }), 
   			d3.max(stacked, function(layer) { return d3.max(layer, function(d) { return d[1]; }); })
   		]).range([h, 0]);


   	var xScale = d3.scaleLinear() 
   		.domain([0, flattened.length - 1])
   		.range([0, w])

	d3.select(element)
		.selectAll("path")
		.data(stacked)
		.enter()
		.append("path")
		.attr("d", area)
		.attr("fill", getRandomColor);

}

function renderRadar(element, data) { 

	var data = [
		
		{"key" : 1, "xyz" : {"A" : 3,"B" : 2, "C" : 4, "D" : 5}},
		{"key" : 2, "xyz" : {"A" : 2,"B" : 4, "C" : 3, "D" : 1}}

	];

	console.log("rendering radar...");

	var flattened = $.map(data, function(variant, index) {
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
		maxValue: .5,
	  	levels: 5,
	  	roundStrokes: true,
	  	color: color
	};

	// console.log(radarData);
	// console.log(flattened);

	RadarChart(element, flattened, radarChartOptions);

}

function sortOnKeys(data, keys, increasing) { 

	return data.sort(function(a, b) {

		for (i = 0; i < keys.length; i++) {
			a = a[keys[i]]; 
			b = b[keys[i]];
		}

		return increasing ? d3.ascending(a, b) : d3.descending(a, b);

	}); 

}

function getRandomColor() {

	return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function renderJSON(JSON) {

	var element = "svg";

	var data = [13, 9, 17];

	d3.select(element)
		.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("r", function(datum, index) { return datum; })
		.attr("cx", function(datum, index) { return index * 40 + 40; })
		.attr("cy", 40);

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
