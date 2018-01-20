$(function() { 

	$("#uploadLink").on("click", function(event){

    	event.preventDefault();
        $("#uploadInput").trigger("click");

    });

    $("#uploadInput").change(function() { 

		var file = $("#uploadInput")[0].files[0]; 

		if (validateTSV(file)) {

			showSpinner(); 
			parseTSV(file); 

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

function parseTSV(TSV) {

	console.log("parsing", TSV);

	var infoColumnCorrespondenceDict = {
		"chromosome" : ["CHROM", "Chromosome"],
		"ref" : ["REF", "Reference Allele", "Reference Nucleotide"],
		"alt" : ["ALT", "Sample Allele", "Variant Nucleotide"]
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

	function readTsv(tsv) { 

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

		for (column in ?) { 

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
			"otherFields" ; ""
		}

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