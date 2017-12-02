var lastStaffData = []; 

function renderStaff(data, variantIndex, element, spiralElement) {

	var width = $(element).width(); 
	var height = $(element).height();

	var columns = [
		"SIFT Function Prediction",
		"PolyPhen-2 Function Prediction",
		"CADD Score",
		"Phylop",
		"MutationTaster",
		"fathmm",
		"1000 Genomes Frequency", 
		"ExAC Frequency",
		"GNOMADMaxAlleleFreq"
	];

	var nColumns = columns.length;

	var staffData = $.map(columns, column => {

		return data[variantIndex].core[column].value;

	});

	//space between top and bottom of staff and top and bottom of SVG
	var bottomBuffer = 100; 
	var topBuffer = 200; 

	var verticalScale = d3.scaleLinear()
		.domain([nColumns - 1, 0])
		.range([topBuffer, height - bottomBuffer])

	d3.select(element)
		.selectAll("*")
		.remove(); 

	//since text on left is longer than text on right, and to create a greater visual distinction between the staffgram and spiralgram
	var staffX = (width) * (3 / 5); 

	//draw the staff 
	d3.select(element)
		.append("line")
		.attr("x1", staffX)
		.attr("y1", verticalScale(0))
		.attr("x2", staffX)
		.attr("y2", verticalScale(staffData.length - 1))
		.attr("stroke", highlightForSpindle); 

	var minKnownRadius = 3;
	var maxRadius = 10;  

	//draw the circles on the staff
	d3.select(element)
		.append("g")
		.attr("class", "circles")
		.selectAll("circle")
		.data(staffData)
		.enter()
		.append("circle")
		.attr("cx", staffX)
		.attr("cy", (_, i) => verticalScale(i))
		.attr("r", (d, i) => {

			var iM = getIsMissing(variantIndex, columns[i]); 

			if (iM) {
				return 0; 
			}

			return Math.max(d * maxRadius, minKnownRadius); 

		}).attr("data-index", (_, i) => i) //the index that each datum is (can get lost in d3 selection)
		.attr("fill", (d, i) => colorForAnnotation(i, nColumns))
		.on("mouseenter", function(d, i) {

			//highlight the circle when moused over
			d3.select(this)	
				.attr("fill", highlightForCircle); 

			d3.select(spiralElement)
				.selectAll("circle[data-index=\"" + i + "\"]") 
				.attr("fill", highlightForCircle);
				
		}).on("mouseout", function(d, i) {

			//unhighlight the circle when unmoused over
			d3.select(this)	
				.attr("fill", colorForAnnotation(i, nColumns)); 

			d3.select(spiralElement)
				.selectAll("circle[data-index=\"" + i + "\"]") 
				.attr("fill", colorForAnnotation(i, nColumns))
		
		}); 

	var textBuffer = 20; 

	// add labels to the staff gram
	d3.select(element)
		.append("g")
		.attr("class", "labels")
		.selectAll("text")
		.data(staffData)
		.enter()
		.append("text")
		.text((d, i) => {

			return getDisplayName(variantIndex, columns[i]);

		}).attr("x", staffX - textBuffer)
		.attr("y", (_, i) => verticalScale(i))
		.attr("text-anchor", "end")
		.attr("dominant-baseline", "central") //centers text vertically at this y position
		.attr("fill", "white")
		.attr("font-size", "16px"); 

	d3.select(element)
		.append("g")
		.attr("class", "labels")
		.selectAll("text")
		.data(staffData)
		.enter()
		.append("text")
		.text((d, i) => {

			var oV = getOriginalValue(variantIndex, columns[i]);
			var iM = getIsMissing(variantIndex, columns[i])

			return iM ? "n/a" : oV; 

		}).attr("x", staffX + textBuffer)
		.attr("y", (_, i) => verticalScale(i))
		.attr("text-anchor", "start")
		.attr("dominant-baseline", "central") //centers text vertically at this y position
		.attr("fill", "white")
		.attr("font-size", "16px"); 

	//show to the right of actual value (maybe in grey) rank of value in this set of variants? 
	//e.g., phyloP |STAFF| .786 1 <-- indicating its the most pathogenic score in the xlsx uploaded

	addTopText(element, data[variantIndex]); 
	addBottomText(element, data[variantIndex]);

	var ref = data[variantIndex].core["Reference Allele"].value; 
	var alt = data[variantIndex].core["Sample Allele"].value; 
	renderBlocks(ref, alt, element, 110, colorForNucleotide); 

	// var proteinVariant = data[variantIndex].core["Protein Variant"].value; 
	// var refProtein = getAcidSymbolFromProteinVariantData(proteinVariant, true);
	// var altProtein = getAcidSymbolFromProteinVariantData(proteinVariant, false);
	// renderBlocks(refProtein, altProtein, element, 175, colorForAcidSymbol)

	renderStaffPedigree(data, variantIndex, element);

}

function addTopText(element, data) {

	var x = $(element).width() / 2; 
	var startY = 20; 
	var yStep = 20; 

	var chromosome = data.core["Chromosome"].value; 
	var position = data.core["Position"].value; 
	var variationType = data.core["Variation Type"].value; 
	var QUAL = data.core["QUAL"].value; 
	var FILTER = data.core["FILTER"].value; 
	var GT = data.core["GT"].value; 

	var translationImpact = data.core["Translation Impact"].value; //missense, nonsense, etc. 

	var geneRegion = data.core["Gene Region"].value; 
	var geneSymbol = data.core["Gene Symbol"].value; 

	var transcriptVariant = data.core["Transcript Variant"].value; 
	var proteinVariant = data.core["Protein Variant"].value; 

	//[words, id (what kind of string it is)]

	//0: regular (not junk or special--positions in tag) (bolded)
	//1: junk (not bolded)
	//2: special char (nucleotide or amino acid abbreviation) (given background)

	var words1 = [[variationType, 0], [" at ", 1], [chromosome, 0], [":", 1], [position, 0]];
	var words2 = [["QUAL ", 1], [QUAL, 0], [", FILTER ", 1], [FILTER, 0]]; 
	var words3 = [[translationImpact, 0]]; 

	var parsedGeneSymbol = parseGeneSymbol(geneSymbol); 
		parsedGeneSymbol.push([", ", 1]);
		parsedGeneSymbol.push([geneRegion, 0]);

	var words4 = parsedGeneSymbol; 
	
	var parsedTV = parseVariantTag(transcriptVariant, false); 
	var parsedPV = parseVariantTag(proteinVariant, true);


	

	var leftX = $(element).width() / 4; 

	var specialRectOffset = 8; 

	renderWords(element, words1, "words1", x, startY, specialRectOffset);
	renderWords(element, words2, "words2", x, startY + 1 * yStep, specialRectOffset, true); 
	renderWords(element, words3, "words3", x, startY + 2 * yStep, specialRectOffset, true);
	renderWords(element, words4, "words4", x, startY + 3 * yStep, specialRectOffset, true); 

	//break for ref and alt
	renderWords(element, parsedTV, "words5", x, startY + 6.5 * yStep, specialRectOffset, true); 
	renderWords(element, parsedPV, "words6", x, startY + 7.75 * yStep, specialRectOffset, true);

	//add the colored circles behind nucleotide and amino acid abbreviations
	colorVariantTag(element, transcriptVariant, "#words5", colorForNucleotide, specialRectOffset * .65, "#words5Colors", false, false);
	colorVariantTag(element, proteinVariant, "#words6", colorForAcidSymbol, specialRectOffset * .65, "#words6Colors", false, false); 	

}

function colorVariantTag(element, textData, textElement, colorer, offset, id, greyRef, greyAlt) {

	var rects = []; 

	d3.select(textElement)
		.selectAll("tspan")
		.each(function(d, i) { 

			if (d[1] != 2) { 
				return; 
			}

			var firstCharExtent = this.getExtentOfChar(0);
			var width = this.getComputedTextLength(); 

			var rect = { 
				x : firstCharExtent.x - offset,
				y : firstCharExtent.y, 
				width : width + offset * 2, 
				height: firstCharExtent.height
			};

			rects.push([rect, d[0]]); 

		}); 

	var roundingRadius = 10; 

	d3.select(element)
		.insert("g", textElement) //so rects will be *behind* text
		.attr("id", id)
		.selectAll("rects")
		.data(rects)
		.enter()
		.append("rect")
		.attr("x", (d, i) => d[0].x)
		.attr("y", (d, i) => d[0].y)
		.attr("width", (d, i) => d[0].width)
		.attr("height", (d, i) => d[0].height)
		.attr("fill", (d, i) => {

			console.log(i);

			if (i % 2 == 0 /*ref*/ && greyRef) {
				return "grey";
			} else if (i % 2 == 1 /*alt*/ && greyAlt) {
				return "grey";
			}

			return colorer(d[1]);

		}).attr("rx", roundingRadius)
		.attr("ry", roundingRadius);

}

function renderWords(element, words, id, x, y, offset, appendText) {

	if (appendText) {

		d3.select(element)
			.append("text")
			.attr("id", id)
			.attr("x", x)
			.attr("y", y)
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "central") //centers text vertically at this y position
			.attr("fill", "white")
			.attr("font-size", "16px")
			.attr("xml:space", "preserve");

		id = "#" + id;

	}

	d3.select(element)
		.select(id)
		.selectAll("tspan")
		.data(words)
		.enter()
		.append("tspan")
		.text((d, _) => d[0])
		.each(function(d, i) { 

			if (d[1] == 0) { 
				this.classList.add("regular");
			} else if (d[1] == 1) {
				this.classList.add("junk");
			} else {
				this.classList.add("special");
			}

		}, true).attr("xml:space", "preserve")
		.attr("dx", (d, i) => {

			//offset the text horizontally if this is a special string 
			var isThis = d[1] == 2; 

			//or if the string before was a special string
			var wasLast = i > 0 ? (d3.select(id).selectAll("tspan").data()[i - 1][1] == 2) : false; 

			return isThis || wasLast ? offset : 0;

		});

}

//render ref and alt amino acids
function renderBlocks(left, right, element, y, colorer) {

	var width = 40; 
	var height = 20; 
	var separation = 20; 
	var roundingRadius = 10; 

	var refStartX = $(element).width() / 2 - separation / 2 - width; 
	var altStartX = $(element).width() / 2 + separation / 2; 

	//add blocks
	d3.select(element)
		.append("rect")
		.attr("x", refStartX)
		.attr("y", y)
		.attr("width", width)
		.attr("height", height)
		.attr("rx", roundingRadius)
		.attr("ry", roundingRadius)
		.attr("fill", colorer(left));

	d3.select(element)
		.append("rect")
		.attr("x", altStartX)
		.attr("y", y)
		.attr("width", width)
		.attr("height", height)
		.attr("rx", roundingRadius)
		.attr("ry", roundingRadius)
		.attr("fill", colorer(right));

	//add letters
	d3.select(element)
		.append("text")
		.attr("class","ref")
		.attr("x", refStartX + width / 2)
		.attr("y", y + height / 2)
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "central") //centers text vertically at this y position
		.attr("fill", "white")
		.attr("font-size", "16px")
		.attr("font-weight", "bold")
		.text(left);

	d3.select(element)
		.append("text")
		.attr("class","alt")
		.attr("x", altStartX + width / 2) 
		.attr("y", y + height / 2)
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "central") //centers text vertically at this y position
		.attr("fill", "white")
		.attr("font-size", "16px")
		.attr("font-weight", "bold")
		.text(right);

	var textBuffer = 4; 

	//add text
	d3.select(element)
		.append("text")
		.attr("class","nucleotideDescriptions")
		.attr("x", refStartX + width / 2)
		.attr("y", y - textBuffer)
		.attr("text-anchor", "middle")
		.attr("fill", "white")
		.attr("font-size", "16px")
		.text("ref");

	d3.select(element)
		.append("text")
		.attr("class","nucleotideDescriptions")
		.attr("x", altStartX + width / 2)
		.attr("y", y - textBuffer)
		.attr("text-anchor", "middle")
		.attr("fill", "white")
		.attr("font-size", "16px")
		.text("alt");


}

function parseGeneSymbol(text) { 

	//assumes there will only be one set of parenthese
	var getTextInParentheses = /\(([^)]+)\)/;

	var tiP = getTextInParentheses.exec(text); 

	if (tiP == null) { 
		return [[text, 0]]
	}

	tiP = tiP[0];

	var textBeforeParentheses = text.substring(0, text.indexOf(tiP));
	var textAfterParentheses = text.substring(text.indexOf(tiP) + tiP.length);

	return [[textBeforeParentheses, 0], [tiP, 1], [textAfterParentheses, 0]];

}

function parseVariantTag(text, isProteinVariant) {

	var specialChars = ["A","T","C","G","U"]; 

	if (isProteinVariant) {
		specialChars = ["A","I","L","G","P","V","F","W","Y","D","E","K","H","R","S","T","C","M","N","Q"];
	}

	var junkChars = [".",">",";",":",","," "]; //don't bold these
	var junkIfBeforePeriod = ["c","p"]; //don't bold these if they come before a period

	var chars = text.split("");
	var parsed = []; //should become an array of [[chars], id]

	$.each(chars, (i, c) => {

		var kind = getKind(chars, i, junkChars, junkIfBeforePeriod, specialChars);

		if (i == 0) { //always a p or c

			parsed.push([[c], kind]);

		} else { 

			var lastKind = getKind(chars, i - 1, junkChars, junkIfBeforePeriod, specialChars);

			if (kind == lastKind) {
				parsed[parsed.length - 1][0].push(c);
			} else { 
				parsed.push([[c], kind])
			}

		}

	}); 

	return $.map(parsed, (d, i) => { //merge [[chars], id] into [string, id]

		return [[ d[0].join(""), d[1] ]];

	}); 

	function getKind(chars, i, junk, junkIfBeforePeriod, special) {
		
		var c = chars[i];

		if (i < chars.length - 1) {
			var nextChar = chars[i + 1];

			if ($.inArray(c, junkIfBeforePeriod) !== -1 && nextChar == ".") {
				return 1; 
			}

		}

		if ($.inArray(c, junk) !== -1) {
			return 1; 
		}

		if ($.inArray(c, special) !== -1) {
			return 2; 
		}

		return 0; 

	}
}

function renderStaffPedigree(data, variantIndex, element) {

	var gt = getOriginalValue(variantIndex, "GT");

	// drawPedigree(gt, element, false);

}

function addBottomText(element, data) {

	var chromosome = data.core["Chromosome"].value; 
	var position = data.core["Position"].value; 
	var ref = data.core["Reference Allele"].value; 
	var alt = data.core["Sample Allele"].value; 

	var gene = data.core["Gene Symbol"].value; 

	//add links to stuff
	var varsomeVariant = "https://varsome.com/variant/hg19/" + chromosome + "-" + position + "-" + ref + "-" + alt; 
	var varsomeGene = "https://varsome.com/gene/" + gene; 

	var varsomeVariantA = makeA(varsomeVariant, "Variant");
	var varsomeGeneA = makeA(varsomeGene, "Gene");

	console.log("appending to " + element); 
	console.log(varsomeVariantA);
	console.log(varsomeGeneA)

	$(element).prepend(varsomeVariantA); 
	$(element).prepend(varsomeGeneA);

	function makeA(link, text) {

		var assignedClass = "staffBottom";

		return "<a class=\"" + assignedClass + "\" href=\"" + link + "\">" + text + "</a>";

	}


}
