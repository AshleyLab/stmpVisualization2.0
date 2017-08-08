$(function() { 
	$("#uploadLink").on("click", function(event){

    	event.preventDefault();
        $("#uploadInput").trigger("click");

    });

    $("#uploadInput").change(function() { 

		var file = $("#uploadInput")[0].files[0]; 

		if (validateTSV(file)) {

			showSpinner(); 
			parseXls(file); 

		} else { 



		}

	});

});

function validateTSV(file) {

	console.log(file);
	console.log(file.name);

	var extension = file.name.split(".").slice(-1)[0]; 

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
		}
	}
	return visualizationJson;
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

		var placeholder = []; 

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