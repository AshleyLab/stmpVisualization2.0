var element, axisSpace, pathClicks, outerElement, data; 

$(function() {

	var element = "#graphics";

	axisSpace = 15; 

	$("#uploadLink").on("click", function(event) { // code run whenever #uploadLink is clicked

		//#uploadLink is basically just a dummy element that we use to activate the hidden #uploadInput element
    	event.preventDefault();
        $("#uploadInput").trigger("click");

    });

    $("#uploadInput").change(function() { //code called by $("#uploadInput").trigger("click");

		var file = $("#uploadInput")[0].files[0]; //the file uploaded by the user

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

		if (sheet == "Column Descriptions") { //what sheets are we actually parsing? how will they be named? 
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

		//basic information
		"Chromosome", 
		"Position", 
		"Reference Allele", 
		"Sample Allele", 
		"Variation Type",
		"QUAL", 
		"FILTER",
		"GT",

		//gene info
		"Gene Region",
		"Gene Symbol",
		"Transcript ID",
		"Transcript Variant",
		"Protein Variant",
		"Translation Impact", // < missense, frameshift, stop loss, stop gain, ...

		//analytic overview
		"Classification", // < Uncertain Signifi

		//models
		"SIFT Function Prediction",
		"PolyPhen-2 Function Prediction",
		"CADD Score",
		"Phylop",
		"MutationTaster",
		"fathmm",
		"Sift",

		//frequencies:: LOTS OF MISSING CELLS
		"1000 Genomes Frequency", 
		"ExAC Frequency", 
		"ExAC East Asian Frequency",
		"ExAC South Asian Frequency",
		"ExAC African Frequency",
		"ExAC European Frequency",
		"ExAC Latino Frequency",
		"ExAC Homozygous Count",
		"AN_AFR",
		"AN_AMR",
		"AN_ASJ",
		"AN_EAS",
		"AN_FIN",
		"AN_NFE",
		"AN_OTH",
		"AN_SAS",
		"GNOMADMaxAlleleFreq",
		"GNOMAD_Max_Allele_Freq_POP"
		
		// "TIER" Tier
	]

	for (i in sheet) {

		var row = sheet[i];

		var variant = {
			"core" : {}, 
			"metadata" : {
				"metrics": {
					"nClicks" : 0
				}, "workflow": { 
					"curationMode" : "sheetname", 
					"notes" : "notes"
				}
			}
		}; 

		function fillTemplate(originalValue, column) {

			var value = parseValue(originalValue, column);

			console.log(column + ": " + originalValue + " - " + value);

			return {
				"value" : value, //if value is null, just assign empty string 
				"originalValue" : originalValue, 
				"associatedValues" : []
			}

		}

		$.each(columns, (_, column) => {

			//make variant.core a dictionary where the keys are the column names and the values are the template returned by filledTemplate
			variant.core[column] = fillTemplate(row[column], column);

		}); 

		visualizationData.push(variant);
	}
	
	console.log(visualizationData);
	renderVisualization(false, "#graphics", visualizationData); //render the visualization
	hideSpinner(); 
}

function parseValue(originalValue, column) { 

	//TODO: empty cells

	//implement universal way to check if originalValue not in dict
	//pass originalValue and dict to some function?

	var value = originalValue; 
	var dict; 

	//model scores
	//should all be scaled to [0, 1], where 0 is least pathogenic and 1 is most pathogenic (that can be given on that scale)
	//Sift Function Prediction, PolyPhen-2 Function Prediction, CADD Score, Phylop, MutationTaster, fathmm, Sift
	
	var modelScores = [
		"SIFT Function Prediction","PolyPhen-2 Function Prediction","CADD Score",
		"Phylop","MutationTaster","fathmm","Sift"
	];

	if (column == "SIFT Function Prediction") { 

		dict = {"Tolerated" : 0, "Damaging" : 1};
		value = dict[originalValue];

	} else if (column == "PolyPhen-2 Function Prediction") {

		dict = {"Benign" : 0, "Probably Damaging" : 1};
		value = dict[originalValue];

	} else if (column == "CADD Score") { 

		//range?? 1 to 99?
		value = (parseFloat(originalValue) - 1) / 98; 

	} else if (column == "Phylop") {

		//range?? try 0 to 1

		value = parseFloat(originalValue)

	} else if (column == "MutationTaster") {

		//range?? 0 to 1
		value = parseFloat(originalValue);

	} else if (column == "fathmm") {

		//range: [-16.13, 10.64]

		value = (parseFloat(originalValue) + 16.13) / 26.77; 

	} else if (column == "Sift") {

		//goes from 0 to 1, where 0 is most deletrious and 1 is most tolerated??
		value = 1 - parseFloat(originalValue);

	}

	//frequencies
	//should all be in [0, 1]
	//primary: ExAC Frequency
	//GNOMADMaxAlleleFreq
	//population: ExAC East Asian Frequency, ExAC South Asian Frequency, ExAC African Frequency, ExAC European Frequency, ExAC Latino Frequency
	//AF_EAS, AF_NFE, AF_SAS, AF_AMR, AF_AFR
	//AN_AFR, AN_AMR, AN_ASJ, AN_EAS, AN_FIN, AN_NFE, AN_OTH, AN_SAS

	var frequencies = ["1000 Genomes Frequency","ExAC Frequency","GNOMADMaxAlleleFreq",
		"ExAC East Asian Frequency","ExAC South Asian Frequency","ExAC African Frequency","ExAC European Frequency","ExAC Latino Frequency",
		"AF_EAS","AF_NFE","AF_SAS","AF_AMR","AF_AFR"
	];

	if ($.inArray(column, frequencies) !== -1) { 
		value = parseFloat(originalValue);
	}

	//scale model scores and frequencies
	if ($.inArray(column, modelScores.concat(frequencies)) !== -1) { 
		console.log("scaling")
		return scaleValue(value);
	}

	return value; 

}


function scaleValue(value) {

	var scale = d3.scalePow()
		.exponent(3)
		.clamp(true) //always return value inside the range, even if input is outside domain
		.domain([0, 1])
		.range([0, 1]);

	return scale(value); 

}

function zeroOneNormalize(val, minVal, maxVal){
	//do normalization  do different distributions??
	return .3;
}

function isChromosome(t) {

	return parseInt(d3.select(t).attr("data-isChromosome")); 

}