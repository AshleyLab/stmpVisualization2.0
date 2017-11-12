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

	var staffX = (width) * (3 / 5); 
	//since text on left is longer than text on right, and to create a greater visual distinction between the staffgram and spiralgram

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
}

function strongSpan(text) {

}

function addTopText(element, data) {

	var chromosome = data.core["Chromosome"].value; 
	var position = data.core["Position"].value; 
	var referenceAllele = data.core["Reference Allele"].value;
	var sampleAllele = data.core["Sample Allele"].value;
	var variationType = data.core["Variation Type"].value; 
	var QUAL = data.core["QUAL"].value; 
	var FILTER = data.core["FILTER"].value; 
	var GT = data.core["GT"].value; 

	var translationImpact = data.core["Translation Impact"].value; //missense, nonsense, etc. 

	var geneRegion = data.core["Gene Region"].value; 
	var geneSymbol = data.core["Gene Symbol"].value; 

	var transcriptVariant = data.core["Transcript Variant"].value; 
	var proteinVariant = data.core["Protein Variant"].value; 

	//[words (or symbol), whether it should be bold or not]
	var words1 = [[variationType, true], [" at ", false], [chromosome + ":" + position, true]];
	var words2 = [["QUAL ", false], [QUAL, true], [", FILTER ", false], [FILTER, true]]; 
	var words3 = [[translationImpact, true]]; 
	var words4 = [[geneSymbol, true], [", ", false], [geneRegion, true]];
	var words5 = [[transcriptVariant, true]];
	var words6 = [[proteinVariant, true]];

	renderWords(words1, "1", 100, 0);
	renderWords(words2, "2", 100, 20); 
	renderWords(words3, "3", 100, 40);
	renderWords(words4, "4", 100, 60); 	
	renderWords(words5, "5", 100, 80); 
	renderWords(words6, "6", 100, 100);

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

}

//render visualizations of other features (genotypes, nucleotides? amino acid change?, ...) that are available in the spiralgram in the staffgram
function renderStaffNucleotides() {

}

function renderStaffPedigree() {

}

function addBottomText(element, data) {

}
