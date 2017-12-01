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
		// "Sift",

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

			var iM = getIsMissing(variantIndex, columns[i])
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
	var words4 = [[geneSymbol, 0], [", ", 1], [geneRegion, 0]];
	
	//parse transcript variant and protein variant data
	var tVSpecialChars = ["A","T","C","G","U"]; 	
	var pVSpecialChars = ["A","I","L","G","P","V","F","W","Y","D","E","K","H","R","S","T","C","M","N","Q"]

	var parsedTV = parseVariantTag(transcriptVariant, tVSpecialChars); 
	var parsedPV = parseVariantTag(proteinVariant, pVSpecialChars);

	console.log(parsedTV);
	console.log(parsedPV);

	

	var leftX = $(element).width() / 4; 

	var specialRectOffset = 5; 

	renderWords(words1, "1", x, startY, specialRectOffset);
	renderWords(words2, "2", x, startY + 1 * yStep, specialRectOffset); 
	renderWords(words3, "3", x, startY + 2 * yStep, specialRectOffset);
	renderWords(words4, "4", x, startY + 3 * yStep, specialRectOffset); 

	//break for ref and alt
	renderWords(parsedTV, "5", x, startY + 6.5 * yStep, specialRectOffset); 
	renderWords(parsedPV, "6", x, startY + 7.75 * yStep, specialRectOffset);



	colorVariantTag(transcriptVariant, ".words5", "5", colorForNucleotide, specialRectOffset);
	colorVariantTag(proteinVariant, ".words6", "6", colorForAcidSymbol, specialRectOffset); 
	
	//rerender words, so they're on top of shapes
	renderWords(parsedTV, "5-2", x, startY + 6.5 * yStep, specialRectOffset); 
	renderWords(parsedPV, "6-2", x, startY + 7.75 * yStep, specialRectOffset);


	function colorVariantTag(textData, textElement, id, colorer, offset) {

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

				console.log(rect);

				rects.push([rect, d[0]]); 

			}); 

		console.log(rects); 

		var roundingRadius = 10; 

		d3.select(element)
			.append("g")
			.attr("class","wordsHighlight" + id)
			.selectAll("text")
			.data(rects)
			.enter()
			.append("rect")
			.attr("x", (d, i) => d[0].x)
			.attr("y", (d, i) => d[0].y)
			.attr("width", (d, i) => d[0].width)
			.attr("height", (d, i) => d[0].height)
			.attr("fill", (d, i) => colorer(d[1]))
			.attr("rx", roundingRadius)
			.attr("ry", roundingRadius);

	}


	function renderWords(words, id, x, y, offset) {

		d3.select(element)
			.append("text")
			.attr("class","words" + id)
			.attr("x", x)
			.attr("y", y)
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "central") //centers text vertically at this y position
			.attr("fill", "white")
			.attr("font-size", "16px")
			.attr("xml:space", "preserve");

		d3.select(element)
			.select(".words" + id)
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
				var wasLast = i > 0 ? (d3.select(".words" + id).selectAll("tspan").data()[i - 1][1] == 2) : false; 

				return isThis || wasLast ? offset : 0;

			});

	}

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

function parseVariantTag(text, specialChars) {

	var junkChars = [".",">",";",":",",","c","p"," "]; //don't bold these

	var chars = text.split("");
	var parsed = []; //should become an array of [[chars], id]

	$.each(chars, (i, c) => {

		var kind = getKind(c, junkChars, specialChars);

		if (i == 0) { //always a p or c

			parsed.push([[c], kind]);

		} else { 

			var lastKind = getKind(chars[i - 1], junkChars, specialChars);

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

	function getKind(c, junk, special) {

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

}
