var element, axisSpace, pathClicks, outerElement, data; 

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

	data = sampleData; 
	outerElement = "#graphics";

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
			parseXls(file); 

		} else { 

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

	// return extension == ".xlsx" || extension == ".xls"; 

	return true; 

}

function fixdata(data) {
	  var o = "", l = 0, w = 10240;
	  for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
	  o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
	  return o;
}

function readXls(xls) { 
		var reader = new FileReader();
		reader.onload = function(e) { 
			var data = e.target.result;
			var rABS = false;
			var workbook;
			if(rABS) {
			    /* if binary string, read with type 'binary' */
			    workbook = XLSX.read(data, {type: 'binary'});
			}
			else {
			    /* if array buffer, convert to base64 */
			    var arr = fixdata(data);
			    workbook = XLSX.read(btoa(arr), {type: 'base64'});
			    turn_workbook_into_json(workbook);
			}
		};
		reader.readAsArrayBuffer(xls);
		//reader.readAsBinaryString(xls);	
}

function turn_workbook_into_json(workbook){
	console.log("turn_workbook")
	var sheetNames = workbook.SheetNames;
	console.log(sheetNames);
	for(i in sheetNames){
		var sheet = sheetNames[i];
		crudeJson = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]); //this function gives us a crude json object that we then parse further
		parsedSheetJson = parse_crude_json(crudeJson);
		//do visualizations with each individual parsed sheet json, maybe different depending on the type of curation
	}
}

//parses the "crude json" which is sheetJS's export of an xls row to a json
//returns a json
function parse_crude_json(crudeJson){

	//Essential maps over values
	var infoColumnCorrespondences = {
		"chromosome" : ["CHROM", "Chromosome"],
		"ref" : ["REF", "Reference Allele", "Reference Nucleotide"],
		"alt" : ["ALT", "Sample Allele", "Variant Nucleotide"],
		"pos" : ["POS", "Position", "Start"]
	};

	var numericColumnCorrespondences = {
		"fullExac" : ["hg19_popfreq_all_20150413_exac_all", "ExAC (AF%)", "ExAC (%)", "ExAC"],
		"europeExac": ["ExAC European", "hg19_popfreq_all_20150413_exac_nfe"],
		"1kgenomes": ["1000 Genomes", "hg19_popfreq_all_20150413_1000g_all"]
	};

	var stringColumnCorrespondences = {
		"clinvar" : ["clinvar_clinical_significance"]
	};

	visualizationJson = {};
	for(i in crudeJson){
		var row = crudeJson[i];
		var variantJson = initialize_variant_json_struct(); //initialize the structure of the json for a single variant
		var includedSpreadsheetColumns = [];
		//get the correct key to access the proper part of the json
		//we repeat this three times to make sure we put the proper values in the proper places
		//////////////////////////info fields
		for(var infoColName in infoColumnCorrespondences){
			var spreadsheetColNames = infoColumnCorrespondences[infoColName];
			for(var spreadsheetColName in spreadsheetColNames){ 
				var spreadsheetKey = spreadsheetColNames[spreadsheetColName];
				var value = row[spreadsheetKey];
				if(value != null){
					//variantJson.coreAnnotationFields.infoFields.val = value;
					variantJson.coreAnnotation.infoFields[infoColName] = init_info_field(value);
					includedSpreadsheetColumns.push(spreadsheetColNames[spreadsheetColName]);
				}
			}
		}
		////////////////////////////////numeric fields
		for(var numericColName in numericColumnCorrespondences){
			var spreadsheetColNames = numericColumnCorrespondences[numericColName];
			for(var spreadsheetColName in spreadsheetColNames){ 
				var spreadsheetKey = spreadsheetColNames[spreadsheetColName];
				var value = row[spreadsheetKey];
				if(value != null){
					//variantJson.coreAnnotationFields.infoFields.val = value;
					variantJson.coreAnnotation.numericFields[numericColName] = init_numeric_field(value);
					includedSpreadsheetColumns.push(spreadsheetColNames[spreadsheetColName]);
				}
			}
		}
		//////////////////////////////////string fields
		for(var stringColName in stringColumnCorrespondences){
			var spreadsheetColNames = stringColumnCorrespondences[stringColName];
			for(var spreadsheetColName in spreadsheetColNames){ 
				var spreadsheetKey = spreadsheetColNames[spreadsheetColName];
				var value = row[spreadsheetKey];
				if(value != null){
					//variantJson.coreAnnotationFields.infoFields.val = value;
					variantJson.coreAnnotation.stringFields[stringColName] = init_string_field(value);
					includedSpreadsheetColumns.push(spreadsheetColNames[spreadsheetColName]);
				}
			}
		}
		///////////////////////////////////other fields: iterate over every spreadsheet column and add values in that werent already included elsewhere
		for(var colName in row){
			var val = row[colName];
			if($.inArray(colName, includedSpreadsheetColumns) == -1){
				variantJson.coreAnnotation.otherFields[colName] = init_other_field(val);
			}
		}
		//alert we should change to a system based on indexing variants on a unique key
		if(includedSpreadsheetColumns.length > 0){
			visualizationJson[i] = variantJson;
			console.log("marsielles");
		}
		else{
			console.log("paris");
		}
	}

	console.log("at end of parse_crude_json");
	
	console.log(visualizationJson);
}

function initialize_variant_json_struct(){
	var variantJson = {};
	var coreAnnotationFieldTemplate = {
		"infoFields" : {},
		"numericFields" : {}, 
		"stringFields" : {}, 
		"otherFields" : {}
	};
	variantJson.coreAnnotation = coreAnnotationFieldTemplate;
	variantJson.metadata = initalizeVariantMetadata("Alert add proper sheet name processing")
	return variantJson;
}

//functions for initializing the different types of fields for variant annotation
function init_info_field(val){
	var infoFieldTemplate = { 
		"val" : val, 
		"includeInDrawing" : false
	};
	return infoFieldTemplate;
}

function init_numeric_field(val){
	var numericFieldTemplate = {
		"val": val, 
		"drawingValue": "", 
		"includeInDrawing": false, 
		"associatedValues": []
	};
	return numericFieldTemplate;
}

function init_string_field(val){
	var stringAnnotationTemplate = {
		"val": val, 
		"drawingValue": "", 
		"includeInDrawing": false, 
		"associatedValues": []
	};
	return stringAnnotationTemplate;
}

function init_other_field(val){
	var otherFieldTemplate = {
		"val": val, 
		"drawingValue": "", 
		"includeInDrawing": false, 
		"associatedValues": []
	};
	return otherFieldTemplate;
}

function initalizeVariantMetadata(sheetName) {
		variantMetadataStruct = {};
		metricsDict = {"numTimesClicked" : ""};
		workflowDict = {"curationMode" : sheetName, "freeTextNotes" : "enter any notes here"}
		variantMetadataStruct.metrics = metricsDict
		variantMetadataStruct.workflow = workflowDict 
		return variantMetadataStruct; 
}

function parseXls(XLS) {

	console.log("parsing", XLS);
	readXls(XLS);
	//var json = XLSX.utils.sheet_to_json(workbook.Sheets);


	function getVariantInfo(variantLine, idxDict, variantRecord) { 

		//this function is deprecated I think
		for (column in placeholder) { 

			value = variantLine[idxDict[column]] || "na";

			if (column == "Gene_Summar") {
				choices = ["OR2T35", "BRCA1", "AFF3", "MYO7B", "ZNF806", "NEB", "SP100", "SYN2"];
				value = choices[Math.floor(Math.random() * choices.length)]; 
			}

		}

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

function removeSVGs(element) {

	d3.select(element)
		.selectAll("svg")
		.remove(); 

}

function renderVisualization(isStreamgraph, element, lD) {

	var localData = deepClone(lD);

	if (isStreamgraph) {

		removeSVGs(element);

		streamData = prepareDataForStreamgraph(localData);
		renderStreamgraph("#graphics", streamData); 
		renderRadar();

	} else { 

		removeSVGs(element);
		renderGlyphplot(element, localData); 

	}

	return lD;

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
		var v = hsvOriginal.v; 

		var finalRGB = HSVtoRGB(h / 360, 100 / 100, v / 100);

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

var counter = 0; 

function renderStreamgraph(outerElement, data) {

	counter++; 


	// console.log(data);

	var features = Object.keys(data[2].xyz); //get keys from nondummy elements (there for now)
	var nVariants = data.length - 2; //subtract dummy elements (there for now) 

	var element = "masterSVG";

	d3.select("#" + element)
		.selectAll("*").remove();

	// console.log(d3.select("#" + element).selectAll("*").size());

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
   		]).range([h - axisSpace, 10]); //leave space for axis //leave space at top?

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
		.attr("fill", (d, i) => getColor(i, nVariants, false) )
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
				.attr("fill", getColor(index, nVariants, true));

			lastHTML = $("span#masterText").html(); 
			var info = pathClicks[index] == 0 ? "<span id=\"sortInfo\">click to sort</span>" : ""; 
			$("span#masterText").html(datum.key + info);

		}).on("mouseout", function(datum, index) {

			d3.select(this)
				.attr("fill", getColor(index, nVariants, false));

			$("span#masterText").html(lastHTML);

		});

	// console.log(data);

	d3.select(element)
		.append("g")
		.attr("class", "xAxis")
		.attr("transform", "translate(0," + (h - axisSpace) + ")"); 

	// console.log(d3.selectAll(".tick").size());

	d3.select(".xAxis")
		.call(xAxis(xScale, data));

	// console.log(d3.selectAll(".tick").size());

    resizeTicks(tops, yScale, h - axisSpace);
    // setTicks(); 

    // haze(element); 

}

function setTicks() { 

    d3.selectAll(".tick line")
    	.attr("id", function(datum, index) {

    		return "axisLine" + index; 

    	}).on("click", function(datum, index) {

    		d3.select(this).classed("selectedForRadar", !d3.select(this).classed("selectedForRadar")); //toggle the class
    		renderRadar(); 

    	});

}

function xAxis(xScale, data) {	

	// console.log(d3.selectAll(".tick").size());

	return d3.axisBottom(xScale)
		.tickSize(0) //custom resize later
		.ticks(data.length)
		.tickFormat(function(datum, index) {

			console.log(d3.selectAll(".tick").size());
			return index == 0 || index == data.length - 1 ? "" : data[index].key;

		}); 

	// console.log(d3.selectAll(".tick").size());

}

function resizeTicks(tops, yScale, drawingHeight) { 

	// console.log(tops);

	// console.log(d3.selectAll("g.xAxis g.tick line").size());

	d3.selectAll("g.xAxis g.tick line")
		.attr("y2", function(datum, index) {

			// console.log(datum); 
			// console.log(index);

			if (index == 0 || index == data.length - 1) {
				return 0; 
			}

			return -(drawingHeight - yScale(tops[index])); 

		});

	d3.selectAll("g.tick text")
		.attr("transform","rotate(90)");

	console.log(d3.selectAll("g.xAxis text").size());

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

	// console.log(formatted);

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

function renderJSON(JSON) {


}

function showSpinner() { 

	// console.log("showing");

	$("#spinnerContainer").show()
	$("#inputContainer").hide()

}

function hideSpinner() {

	// console.log("hiding");

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

function RGBtoHSV () {
    var rr, gg, bb,
        r = arguments[0] / 255,
        g = arguments[1] / 255,
        b = arguments[2] / 255,
        h, s,
        v = Math.max(r, g, b),
        diff = v - Math.min(r, g, b),
        diffc = function(c){
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
        }else if (g === v) {
            h = (1 / 3) + rr - bb;
        }else if (b === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}
