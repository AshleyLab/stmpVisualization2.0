var element, axisSpace, pathClicks, outerElement, data, variantData, fileName; 

$(function() {

	var element = "#graphics";
	fileName = ""; 

	axisSpace = 15;

	$("#uploadLink").on("click", function(event) { // code run whenever #uploadLink is clicked

		//#uploadLink is basically just a dummy element that we use to activate the hidden #uploadInput element
    	event.preventDefault();
        $("#uploadInput").trigger("click");

    });

    $("#uploadInput").change(function() { //code called by $("#uploadInput").trigger("click");

		var file = $("#uploadInput")[0].files[0]; //the file uploaded by the user
		fileName = file.name; 

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

	if (sheetNames.length > 1) {
		console.log("Not sure which sheet to parse.");
		return;
	} 

	crudeSheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]); 
	parseCrudeSheet(crudeSheet);

}

//parses the "crude json" which is sheetJS's export of an xls row to a json
function parseCrudeSheet(sheet) {

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
		"GT", // "proband|dad|mom"

		//gene info
		"Gene Region",
		"Gene Symbol",
		"Transcript ID",
		"Transcript Variant",
		"Protein Variant",
		"Translation Impact", // < missense, frameshift, stop loss, stop gain, ...

		//models
		"SIFT Function Prediction",
		"PolyPhen-2 Function Prediction",
		"CADD Score",
		"Phylop",
		"MutationTaster",
		"fathmm",
		// "Sift",

		//frequencies:: LOTS OF MISSING CELLS
		"1000 Genomes Frequency", 
		"ExAC Frequency", 
		"ExAC East Asian Frequency",
		"ExAC South Asian Frequency",
		"ExAC African Frequency",
		"ExAC European Frequency",
		"ExAC Latino Frequency",
		"AF_EAS",
		"AF_NFE",
		"AF_SAS",
		"AF_AMR",
		"AF_AFR",

		"AN_EAS",
		"AN_NFE",
		"AN_SAS",
		"AN_AMR",
		"AN_AFR",

		"GNOMADMaxAlleleFreq",
		"GNOMAD_Max_Allele_Freq_POP"
		
		// "TIER" Tier
	];

	for (i in sheet) {

		// if (i > 12) {
		// 	break;
		// }

		var row = sheet[i];

		var variant = {
			"core" : {}, 
			"metadata" : {
				"metrics": {
					"nClicks" : 0
				}, "workflow": { 
					"curationMode" : "sheetname", 
					"notes" : "",
					"deleted": false,
					"deletionReason": ""
				}
			}
		}; 

		function fillTemplate(originalValue, column) {

			var pVData = parseValue(originalValue, column);
			var value = pVData[0]; 
			var displayName = pVData[1]; 
			var isMissing = pVData[2]; 

			return {
				"value" : value, 
				"originalValue" : originalValue, 
				"displayName" : displayName, 
				"isMissing" : isMissing
			}; 

		}

		$.each(columns, (_, column) => {

			//make variant.core a dictionary where the keys are the column names and the values are the template returned by filledTemplate
			variant.core[column] = fillTemplate(row[column], column);

		}); 

		visualizationData.push(variant);
	}
	
	variantData = visualizationData; 
	data = renderVisualization(false, "#graphics", visualizationData); //render the visualization
	hideSpinner(); 
	scrollToElement("#graphics");

}



//given the original value and the column returns a drawing value
function parseValue(originalValue, column) { 

	//returns [(final) value, displayName (for annotation), isMissing]; 

	//model scores
	//all normalized to [0, 1], where 0 is least pathogenic and 1 is most pathogenic (that can be given on that scale)
	//scaled later
	
	var modelScores = ["SIFT Function Prediction","PolyPhen-2 Function Prediction","CADD Score","Phylop","MutationTaster","fathmm","Sift"];

	if (column == "SIFT Function Prediction") { 

		var displayName = "SIFT Function Prediction";
		var lookup = {"Tolerated" : 0, "Activating": .5, "Damaging" : 1};

		if (!(originalValue in lookup)) {
			return [0, displayName, true];
		}

		var value = stringToNumber(originalValue, lookup, column);

		return [scaleValue(value, column), displayName, false];

	} else if (column == "PolyPhen-2 Function Prediction") {

		var displayName = "PolyPhen-2 Function Prediction";
		var lookup = {"Benign" : 0, "Probably Damaging" : 1};

		if (!(originalValue in lookup)) {
			return [0, displayName, true];
		}

		var value = stringToNumber(originalValue, lookup, column);
		
		return [scaleValue(value, column), displayName, false];

	} else if (column == "CADD Score") { //TODO

		var displayName = "CADD Score";

		//info: The last column of the provided files is the PHRED-like (-10*log10(rank/total)) scaled C-score ranking a variant relative to all possible substitutions of the human genome (8.6x10^9). Like explained above, a scaled C-score of greater of equal 10 indicates that these are predicted to be the 10% most deleterious substitutions that you can do to the human genome, a score of greater or equal 20 indicates the 1% most deleterious and so on.  http://cadd.gs.washington.edu/info
		var originalDomain = [1, 99]; 

		if (isNaN(originalValue)) { 
			return [0, displayName, true]; 
		} 

		var parsedValue = parseFloat(originalValue);

		if (parsedValue < originalDomain[0] || parsedValue > originalDomain[1]) { 
			return [0, displayName, true];
		}

		//but really we only see scores in [1,28]

		//clip to [1, 28]
		if (parsedValue > 28) {
			parsedValue = 28; 
		}

		var normalizedValue = zeroOneNormalizeValue(parsedValue, [1, 28], column, false);

		return [scaleValue(normalizedValue, column), displayName, false];

	} else if (column == "Phylop") {

		//we use the mammalian phylop rankscore
		//a rank score is always between 0 and 1 and a score of 0.9 means it is more likely to be damaging than 90% of all potential nsSNVs predicted by that method   https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4752381/

		var displayName = "phyloP";
		var originalDomain = [0, 1];

		if (isNaN(originalValue)) { 
			return [0, displayName, true]; 
		} 

		var parsedValue = parseFloat(originalValue);

		if (parsedValue < originalDomain[0] || parsedValue > originalDomain[1]) { 
			return [0, displayName, true];
		}

		var normalizedValue = zeroOneNormalizeValue(parsedValue, originalDomain, column, false);

		return [scaleValue(normalizedValue, column), displayName, false];

	} else if (column == "MutationTaster") {

		//we use mutation taster converted rankscore: 1 is more damaging, 0 is less damaging—see phyloP above for more details
		
		var displayName = "MutationTaster"; 
		var originalDomain = [0, 1];

		if (isNaN(originalValue)) { 
			return [0, displayName, true]; 
		} 

		var parsedValue = parseFloat(originalValue);

		if (parsedValue < originalDomain[0] || parsedValue > originalDomain[1]) { 
			return [0, displayName, true];
		}

		var normalizedValue = zeroOneNormalizeValue(parsedValue, originalDomain, column, false);

		return [scaleValue(normalizedValue, column), displayName, false];

	} else if (column == "fathmm") {

		var displayName = "fathmm"; 
		var originalDomain = [-16.13, 10.64]; 

		if (isNaN(originalValue)) { 
			return [0, displayName, true]; 
		} 

		var parsedValue = parseFloat(originalValue);

		if (parsedValue < originalDomain[0] || parsedValue > originalDomain[1]) { 
			return [0, displayName, true];
		}

		//Positive FATHMM scores predict a tolerance to the variation while negative FATHMM scores predict intolerance to the variation, and is subsequently considered to be pathogenic. Following proof of concept analysis it was determined that the best possible cut-off value for the FATHMM score is 1.0  https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4929716/
		var normalizedValue = zeroOneNormalizeValue(parsedValue, originalDomain, column, true);

		return [scaleValue(normalizedValue, column), displayName, false];

	}
	// } else if (column == "Sift") {

	// 	var displayName = "Sift";
	// 	var originalDomain = [0, 1];

	// 	if (isNaN(originalValue)) { 
	// 		return [0, displayName, true]; 
	// 	} 

	// 	var parsedValue = parseFloat(originalValue);

	// 	if (parsedValue < originalDomain[0] || parsedValue > originalDomain[1]) { 
	// 		return [0, displayName, true];
	// 	}

	// 	//Range 0 to 1 with values less than 0.05 usually considered intolerant. 40% of the values in this database are below 0.01.
	// 	var normalizedValue = zeroOneNormalizeValue(parsedValue, originalDomain, column, true);

	// 	return [scaleValue(normalizedValue), displayName, false];
	// }

	//frequencies
	//should all be in [0, 1]
	//primary: ExAC Frequency
	//GNOMADMaxAlleleFreq
	//population: ExAC East Asian Frequency, ExAC South Asian Frequency, ExAC African Frequency, ExAC European Frequency, ExAC Latino Frequency
	//AF_EAS, AF_NFE, AF_SAS, AF_AMR, AF_AFR

	var frequencies = ["1000 Genomes Frequency","ExAC Frequency","GNOMADMaxAlleleFreq","ExAC East Asian Frequency","ExAC South Asian Frequency","ExAC African Frequency","ExAC European Frequency","ExAC Latino Frequency","AF_EAS","AF_NFE","AF_SAS","AF_AMR","AF_AFR"];
	var frequenciesDisplayNames = {
		"1000 Genomes Frequency" : "1000 Genomes Frequency", 
		"ExAC Frequency" : "ExAC Frequency",
		"GNOMADMaxAlleleFreq" : "gnomAD Max Frequency",
		"ExAC East Asian Frequency" : "ExAC East Asian Frequency",
		"ExAC South Asian Frequency" : "ExAC South Asian Frequency",
		"ExAC African Frequency" : "ExAC African Frequency",
		"ExAC European Frequency" : "ExAC European Frequency",
		"ExAC Latino Frequency" : "ExAC Latino Frequency",
		"AF_EAS" : "gnomAD East Asian Frequency",
		"AF_NFE" : "gnomAD European (non-Finnish) Frequency",
		"AF_SAS" : "gnomAD South Asian Frequency",
		"AF_AMR" : "gnomAD Latino Frequency",
		"AF_AFR" : "gnomAD African Frequency"
	}; 

	if ($.inArray(column, frequencies) !== -1) { 

		var displayName = frequenciesDisplayNames[column];

		var originalDomain = [0, 1];

		if (isNaN(originalValue)) { 
			return [0, displayName, true]; 
		} 

		var parsedValue = parseFloat(originalValue);

		if (parsedValue < originalDomain[0] || parsedValue > originalDomain[1]) { 
			return [0, displayName, true];
		}

		parsedValue = 1 - parsedValue; //for frequencies, 0 is more interesting (for model scores, 1 is more interesting)

		return [scaleValue(parsedValue, column), displayName, false];

	}

	//miscellaneous strings
	var strings = ["Chromosome","Reference Allele","Sample Allele","Variation Type","FILTER","GT","GNOMAD_Max_Allele_Freq_POP"];
	var stringsDisplayNames = {	
		"Chromosome" : "Chromosome",
		"Reference Allele" : "Reference Allele",
		"Sample Allele" : "Sample Allele",
		"Variation Type" : "Variant Type",
		"FILTER" : "Filter",
		"GT" : "Genotype",
		"GNOMAD_Max_Allele_Freq_POP" : "gnomAD Max Frequency Population"
	};

	if ($.inArray(column, strings) !== -1) {

		if (originalValue) {
			
			return [originalValue, stringsDisplayNames[column], false];

		} else { 

			return ["", stringsDisplayNames[column], true];

		}

	}

	var ints = ["Position","QUAL","Gene Region","Gene Symbol","Transcript ID","Transcript Variant","Protein Variant","Translation Impact","AN_EAS","AN_NFE","AN_SAS","AN_AMR","AN_AFR"];
	var intsDisplayNames = {
		"Position" : "Position",
		"QUAL" : "Quality",
		"Gene Region" : "Gene Region",
		"Gene Symbol" : "Gene Symbol",
		"Transcript ID" : "Transcript ID",
		"Transcript Variant" : "Transcript Variant",
		"Protein Variant" : "Protein Variant",
		"Translation Impact" : "Translation Impact",
		"AN_EAS" : "gnomAD East Asian n",
		"AN_NFE" : "gnomAD European (non-Finnish) n",
		"AN_SAS" : "gnomAD South Asian n",
		"AN_AMR" : "gnomAD Latino n",
		"AN_AFR" : "gnomAD African n"
	};

	if ($.inArray(column, ints) !== -1) {

		if (originalValue) {
			
			return [originalValue, intsDisplayNames[column], false];

		} else { 

			return [0, intsDisplayNames[column], true];

		}

	}

	console.log("Not sure how to parse " + column);

}

//normalizes a value in the range 0-1
//takes as parameters: value, min possible value, max possible value, name or the value (for error reporting), boolean invert scale for when we want to flip the high and low values
//we want 1 to represent values that are of interest to us (pathogenic, rare etc).  If a value of 1 means not pathogenic and zero means pathogenic, we invert scale.  Similarly we invert the scale for frequencies so rare variants are most visualized
function zeroOneNormalizeValue(value, domain, column, shouldInvert) {

	if (shouldInvert) {
		var distanceFromBottom = Math.abs(value - domain[0]); 
		value = domain[1] - distanceFromBottom;
	}

	var normalizer = d3.scaleLinear()
		.domain(domain)
		.range([0, 1]);

	return normalizer(value); 

}

function stringToNumber(value, lookup, column) {

	return lookup[value];

}

function scaleValue(value, column) {

	if (value < 0 || value > 1) {
		console.log("error normalizing: " + value);
	}

	var exponent = 1; 

	if (column == "GNOMADMaxAlleleFreq") {
		exponent = 5000; 
	} else if (column == "ExAC Frequency") { 
		exponent = 100; 
	}

	var scale = d3.scalePow()
		.exponent(exponent) //************
		.domain([0, 1])
		.range([0, 1]);

	return scale(value); 

}

function getValue(variantIndex, property) {
	return variantData[variantIndex].core[property].value;
}

function getOriginalValue(variantIndex, property) {
	return variantData[variantIndex].core[property].originalValue; 
}

function getDisplayName(variantIndex, property) {
	return variantData[variantIndex].core[property].displayName; 
}

function getIsMissing(variantIndex, property) {
	return variantData[variantIndex].core[property].isMissing;
}

function isChromosome(t) {
	return parseInt(d3.select(t).attr("data-isChromosome")); 
}