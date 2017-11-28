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
	var bottomBuffer = 50; 
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
		.attr("stroke", colorForSpindle); 

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
		.attr("r", (d, i) => d * 10)
		.attr("data-index", (_, i) => i) //the index that each datum is (can get lost in d3 selection)
		.attr("fill", (d, i) => colorForAnnotation(d, i, nColumns))
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
				.attr("fill", colorForAnnotation(d, i, nColumns)); 

			d3.select(spiralElement)
				.selectAll("circle[data-index=\"" + i + "\"]") 
				.attr("fill", colorForAnnotation(d, i, nColumns))
		
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
	renderBlocks(ref, alt, element, 150, colorForNucleotide); 

	var proteinVariant = data[variantIndex].core["Protein Variant"].value; 
	var refProtein = getAcidSymbolFromProteinVariantData(proteinVariant, true);
	var altProtein = getAcidSymbolFromProteinVariantData(proteinVariant, false);
	renderBlocks(refProtein, altProtein, element, 175, colorForAcidSymbol)

}

function addTopText(element, data) {

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

	var tVChars = ["A","T","C","G","U"]; 
	transcriptVariant = spaceify(transcriptVariant, tVChars);
	console.log(transcriptVariant);

	var pVChars = ["A","I","L","G","P","V","F","W","Y","D","E","K","H","R","S","T","C","M","N","Q"]
	proteinVariant = spaceify(proteinVariant, pVChars);
	console.log(pVChars);


	//[words (or symbol), whether it should be bold or not]
	var words1 = [[variationType, true], [" at ", false], [chromosome, true], [":", false], [position, true]];
	var words2 = [["QUAL ", false], [QUAL, true], [", FILTER ", false], [FILTER, true]]; 
	var words3 = [[translationImpact, true]]; 
	var words4 = [[geneSymbol, true], [", ", false], [geneRegion, true]];
	var words5 = parseItem(transcriptVariant); 
	var words6 = parseItem(proteinVariant); 

	var x = $(element).width() / 2; 
	var startY = 20; 
	var yStep = 20; 

	function spaceify(text, chars) {
		//add spaces around any occurences of specified chars in given text

		return $.map(text.split(""), (c, _) => {

			if ($.inArray(c, chars) === -1) { 
				return c; 
			} 

			return [" ", c, " "];

		}).join("")
	}
	renderWords(words1, "1", x, startY);
	renderWords(words2, "2", x, startY + 1 * yStep); 
	renderWords(words3, "3", x, startY + 2 * yStep);
	renderWords(words4, "4", x, startY + 3 * yStep); 	
	renderWords(words5, "5", x, startY + 4 * yStep); 
	renderWords(words6, "6", x, startY + 5 * yStep);

	function colorVariantTag(element, textData, textElement, id, colorer, toHighlight) {

		var indices = textData.split("")
							  .map((c, i) => $.inArray(c, toHighlight) !== -1 ? [c, i] : [c, -1])
							  .filter((d, _) => d[1] >= 0); 

		var tE = document.getElementsByClassName(textElement)[0];

		var rects = $.map(indices, (d, _) => {

			var svgRect = tE.getExtentOfChar(d[1]); 
			return [[svgRect.x, svgRect.y, svgRect.width, svgRect.height, d[0]]];

		});

		d3.select(element)
			.append("g")
			.attr("class","wordsHighlight" + id)
			.selectAll("text")
			.data(rects)
			.enter()
			.append("rect")
			.attr("x", (d, i) => d[0])
			.attr("y", (d, i) => d[1])
			.attr("width", (d, i) => d[2])
			.attr("height", (d, i) => d[3])
			.attr("fill", (d, i) => colorer(d[4]));

	}

	colorVariantTag(element, transcriptVariant, "words5", "5", colorForNucleotide, tVChars);
	renderWords(words5, "5-2", x, startY + 4 * yStep); //so text is on top

	colorVariantTag(element, proteinVariant, "words6", "6", colorForAcidSymbol, pVChars); 
	renderWords(words6, "6-2", x, startY + 5 * yStep);

	function renderWords(words, id, x, y) {

		d3.select(element)
			.append("text")
			.attr("class","words" + id)
			.attr("x", x)
			.attr("y", y)
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "central") //centers text vertically at this y position
			.attr("fill", "white")
			.attr("font-size", "16px"); 

		d3.select(element)
			.select(".words" + id)
			.selectAll("tspan")
			.data(words)
			.enter()
			.append("tspan")
			.text((d, _) => d[0])
			.attr("font-weight", (d, _) => d[1] ? "bold" : "normal"); 

	}

	function parseItem(item) { //returns [[realText, true], [notRealText, false]]
		//don't bold "c.", ">", or ";"

		var chars = item.split(""); 
		var junkChars = [".",">",";",":",",", "c", "p"];

		return $.map(chars, (c, i) => {
			return [[c, $.inArray(c, junkChars) === -1]]
		}); 

	}

}

//render visualizations of other features (genotypes, nucleotides? amino acid change?, ...) that are available in the spiralgram in the staffgram
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
		.text(right);

	var arrow = "➞";

	//add arrow
	d3.select(element)
		.append("text")
		.attr("class","arrow")
		.attr("x", $(element).width() / 2)
		.attr("y", y + height / 2)
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "central") //centers text vertically at this y position
		.attr("fill", "white")
		.attr("font-size", "16px")
		.text(arrow);

}

function renderStaffPedigree() {

}

function addBottomText(element, data) {

}
