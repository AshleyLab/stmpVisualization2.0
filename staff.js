function renderStaff(element, spiralElement) {

	var data = window.variantData; 
	var variantIndex = window.variantIndex;

	var width = $(element).width(); 
	var height = $(element).height();

	var columns = [
		"SIFT Function Prediction",
		"PolyPhen-2 Function Prediction",
		"MutationTaster",
		"CADD Score",
		"phyloP",
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

	var deleted = data[variantIndex].metadata.deleted; 

	//draw the circles on the staff
	d3.select(element)
		.append("g")
		.attr("class", "circles")
		.classed("deleted", deleted)
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

	var lowlightMissingData = true; 
	var lowlightTextColor = "#a0a0a0";

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
		.attr("fill", (_, i) => { 

			var iM = getIsMissing(variantIndex, columns[i]); 
			return lowlightMissingData && iM ? lowlightTextColor : "white";

		}).attr("font-size", "16px"); 

	d3.select(element)
		.append("g")
		.attr("class", "labels")
		.selectAll("text")
		.data(staffData)
		.enter()
		.append("text")
		.text((d, i) => {

			var oV = getOriginalValue(variantIndex, columns[i]);
			var iM = getIsMissing(variantIndex, columns[i]); 

			return iM ? "n/a" : oV; 

		}).attr("x", staffX + textBuffer)
		.attr("y", (_, i) => verticalScale(i))
		.attr("text-anchor", "start")
		.attr("dominant-baseline", "central") //centers text vertically at this y position
		.attr("fill", (_, i) => {

			var iM = getIsMissing(variantIndex, columns[i]); 
			return lowlightMissingData && iM ? lowlightTextColor : "white";

		}).attr("font-size", "16px"); 

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

	//get data to rendered

	var chromosome = data.core["Chromosome"].value; 
	var position = data.core["Position"].value; 
	var variationType = data.core["Variation Type"].value; 
	var QUAL = data.core["QUAL"].value; 
	var FILTER = data.core["FILTER"].value; 
	var GT = data.core["GT"].value; 
	var translationImpact = data.core["Translation Impact"].value; 
	var geneRegion = data.core["Gene Region"].value; 
	var geneSymbol = data.core["Gene Symbol"].value; 
	var transcriptVariant = data.core["Transcript Variant"].value; 
	var proteinVariant = data.core["Protein Variant"].value; 

	if (data.core["Protein Variant"].isMissing) {
		proteinVariant = ""; 
	} else if (data.core["Translation Impact"].isMissing) {
		transcriptVariant = "";
	}

	proteinVariant = simplifyVariantTag(proteinVariant, true);
	transcriptVariant = simplifyVariantTag(transcriptVariant, false);

	//[words, id (what kind of string it is)]

	//0: regular (not junk or special--positions in tag) (bolded)
	//1: junk (not bolded)
	//2: special char (nucleotide or amino acid abbreviation) (given background)
	//3: chromosome (color according to colorForChromosomeStaff())

	var words1 = [[variationType, 0], [" at ", 1], [chromosome, 3], [":", 1], [position, 0]];
	var words2 = [["QUAL ", 1], [QUAL, 0], [", FILTER ", 1], [FILTER, 0]]; 
	var words3 = [[translationImpact, 0]]; 

	var words4 = parseGeneSymbol(geneSymbol); 
		words4.push([", ", 1]);
		words4.push([geneRegion, 0]);
	
	var parsedTV = parseVariantTag(transcriptVariant, false); 
	var parsedPV = parseVariantTag(proteinVariant, true);

	var leftX = $(element).width() / 4; 

	var specialRectOffset = 8; 

	renderWords(element, words1, "words1", x, startY, specialRectOffset, true);
	renderWords(element, words2, "words2", x, startY + 1 * yStep, specialRectOffset, true); 
	renderWords(element, words3, "words3", x, startY + 2 * yStep, specialRectOffset, true);
	renderWords(element, words4, "words4", x, startY + 3 * yStep, specialRectOffset, true); 

	//break for ref and alt
	renderWords(element, parsedTV, "words5", x, startY + 6.5 * yStep, specialRectOffset, true); 
	renderWords(element, parsedPV, "words6", x, startY + 7.75 * yStep, specialRectOffset, true);

	//add the colored circles behind nucleotide and amino acid abbreviations
	colorVariantTag(element, "#words5", colorForNucleotide, specialRectOffset * .65, "#words5Colors", false, false);
	colorVariantTag(element, "#words6", colorForAcidSymbol, specialRectOffset * .65, "#words6Colors", false, false); 	

}

function simplifyVariantTag(text, isProtein) { 
	
	var separator = ",";

	//p.S981P; p.S997P --> 
	//p.S981,997P
	//if same amino acid change

	//c.2989T>C; c.2941T>C --> 
	//c.2989,2941T>C
	//if same nucleotide

	String.prototype.replaceAll = function(search, replacement) { //https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
	    var target = this;
	    return target.split(search).join(replacement);
	};

	var tags = text.replace(/\s/g, "") //remove all whitespace
				   .split(";") //split on semicolons
				   .map((d, i) => d.split("")); //split each tag into an array of characters

	//***
	//without this, "c.1insT; c.2insT; c.3dupT" --> "c.1,2ins,3dupT" happens
	//which is not the best, since it's unclear what goes with the first tag

	//rule: if something has been gapped from a tag because it was merged with another tag, 
	//other tags can only merge with the resultant tag if they share the thing that was merged

	//easiest solution: keep track of how many letters from the start and end have been merged so far
	//and if a tag wants to merge with an earlier tag but shares fewer letters, don't merge
	//so "c.1insT; c.2insT; c.3dupT" would be "c.1,2insT; c.3dupT"

	//***
	var startLettersMerged = 0; 
	var endLettersMerged = 0; 

	for (var i = 1; i < tags.length; i++) { 

		var tag = tags[i];
		var previousTag = tags[i - 1];

		//starting at the beginning, see what the tags have in common
		var commonLettersFromStart = ""; 
		for (var j = 0; j < tag.length; j++) {

			//don't match numbers (we don't want to condense the positions)
			if (!isNaN(tag[j]) || tag[j] == "-") { //if the other tag letter is NaN, we'll break anyway
				//"-" could be start of negative number
				break; 
			}

			//for transcript variant, just try to match "c."s
			if (!isProtein && j >= 2) {
				break; 
			}

			if (tag[j] == previousTag[j]) {
				commonLettersFromStart += tag[j];
			} else { 
				break;
			}
		}

		//starting at the end, see what the tags have in common
		//but don't match numbers UNLESS we haven't seen a nonnumber yet 
			//some frame shifts end in numbers, e.g., p.G1309fs*11
		var haveSeenNonNumber = false; 
		var commonLettersFromEnd = ""; 
		for (var k = tag.length - 1; k >= 0; k--) {

			var dk = (tag.length - 1) - k; 
			var kPT = (previousTag.length - 1) - dk; 

			if (!isNaN(tag[k])) {

				if (haveSeenNonNumber) {
					break; 
				}

			} else if (isNaN(tag[k])) {
				haveSeenNonNumber = true; 
			}

			if (tag[k] == previousTag[kPT]) {
				commonLettersFromEnd += tag[k];
			} else { 
				break;
			}
		}
		commonLettersFromEnd = commonLettersFromEnd.split("").reverse().join(""); //invert the string (so the letters in proper order)

		if (
				(commonLettersFromStart.length > 2 && isProtein) ||  /*the tags share more than "p."*/
				(commonLettersFromStart.length >= 2 && !isProtein) && /* transcript variants just need to match "c."s*/

			commonLettersFromEnd.length > 0) { /*the tags share a final amino acid or other thing (like "fs") */

 
			if (!(commonLettersFromStart.length >= startLettersMerged && commonLettersFromEnd.length >= endLettersMerged)) {
				break; //see explanation by declaration of startLetters merged and commonLettersMerged
			}

			startLettersMerged = commonLettersFromStart.length; 
			endLettersMerged = commonLettersFromEnd.length;

			//merge the tags

			//this is where the tags differ
			var tagInterior = tag.slice(j, k + 1).join("");
			var previousTagInterior = previousTag.slice(j, kPT + 1).join("");

			var mergedTag = (commonLettersFromStart + previousTagInterior + separator + tagInterior + commonLettersFromEnd).split("");

			//replace the current tag with the merged tag, 
			tags[i] = mergedTag; 
			//and remove previousTag
			tags.splice(i - 1, 1); 

			//decrement i to account for the smaller tags array
			i--;

		}

	}

	var condensedText = $.map(tags, (tag, i) => {
		return tag.join("");
	}).join("; ");

	return condensedText; 
}

function colorVariantTag(element, textElement, colorer, offset, id, greyRef, greyAlt) {

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

		}).attr("fill", (d, _) => {

			if (d[1] == 3) {
				return colorForChromosomeStaff(d[0]);
			}

		});

}

//render ref and alt amino acids
function renderBlocks(left, right, element, y, colorer) {

	var width = $(element).width(); 
	var height = 20; 

	var refStartX = $(element).width() / 2 - separation / 2 - width; 
	var altStartX = $(element).width() / 2 + separation / 2; 

	//add letters
	var text = d3.select(element)
		.append("text")
		.attr("class","nucleotides")
		.attr("x", width / 2)
		.attr("y", y + height / 2)
		.attr("dominant-baseline", "central") //centers text vertically at this y position
		.attr("fill", "white")
		.attr("font-size", "16px")
		.attr("font-weight", "bold")

	var separation = 10; 
	var labelSeparation = separation - 4;

	var xs = [width / 2 - separation, width / 2 + separation];
	var labelsXs = [width / 2 - labelSeparation, width / 2 + labelSeparation];
	var anchors = ["end", "start"]; 

	var nucleotideData = [[left, 2], [right, 2]]; 

	text.selectAll("tspan")
		.data(nucleotideData)
		.enter()
		.append("tspan")
		.text(d => d[0])
		.attr("x", (_, i) => xs[i])
		.attr("text-anchor", (_, i) => anchors[i]); 

	//add labels
	var labels = ["ref", "alt"];

	var labelsText = d3.select(element)
		.append("text")
		.attr("class","nucleotideLabels")
		.attr("x", width / 2)
		.attr("y", y - height / 2)
		.attr("dominant-baseline", "central") //centers text vertically at this y position
		.attr("fill", "white")
		.attr("font-size", "16px");

	labelsText.selectAll("tspan")
		.data(labels)
		.enter()
		.append("tspan")
		.text(d => d)
		.attr("x", (_, i) => labelsXs[i])
		.attr("text-anchor", (_, i) => anchors[i]);

	colorVariantTag(element, ".nucleotides", colorForNucleotide, 10 * .65, "#nucleotidesColors", false, false);

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

	$(element).prepend(varsomeVariantA); 
	$(element).prepend(varsomeGeneA);

	function makeA(link, text) {

		var assignedClass = "staffBottom";

		return "<a class=\"" + assignedClass + "\" href=\"" + link + "\">" + text + "</a>";

	}


}
