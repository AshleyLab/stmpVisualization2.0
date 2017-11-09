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
		"Sift",

		"1000 Genomes Frequency", 
		"ExAC Frequency",

		"GNOMADMaxAlleleFreq"
	];

	var nColumns = columns.length;

	console.log(data);

	var staffData = $.map(columns, column => {

		return data[variantIndex].core[column].value;

	});

	console.log(staffData);

	//space between top and bottom of staff and top and bottom of SVG
	var verticalBuffer = 50; 

	var verticalScale = d3.scaleLinear()
		.domain([nColumns - 1, 0])
		.range([verticalBuffer, height - verticalBuffer])

	d3.select(element)
		.selectAll("*")
		.remove(); 

	//draw the staff 
	d3.select(element)
		.append("line")
		.attr("x1", width / 2)
		.attr("y1", verticalScale(0))
		.attr("x2", width / 2)
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
		.attr("cx", width / 2)
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

	var buffer = 20; 

	// add labels to the staff gram
	d3.select(element)
		.append("g")
		.attr("class", "labels")
		.selectAll("text")
		.data(staffData)
		.enter()
		.append("text")
		.text((d, i) => {

			console.log(i);

			var dN = getDisplayName(variantIndex, columns[i]);

			return dN; 

		}).attr("x", width / 2 - buffer)
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

		}).attr("x", width / 2 + buffer)
		.attr("y", (_, i) => verticalScale(i))
		.attr("text-anchor", "start")
		.attr("dominant-baseline", "central") //centers text vertically at this y position
		.attr("fill", "white")
		.attr("font-size", "16px"); 

	addTopText(element, data[variantIndex]); 
	addBottomText(element, data[variantIndex]);
}

function strongSpan(text) {

}

function addTopText(element, data) {

	console.log(data);

	var chromosome = data.core["Chromosome"].value; 
	var position = data.core["Position"].value; 
	var referenceAllele = data.core["Reference Allele"].value;
	var sampleAllele = data.core["Sample Allele"].value;
	var variationType = data.core["Variation Type"].value; 
	var QUAL = data.core["QUAL"].value; 
	var FILTER = data.core["FILTER"].value; 
	var GT = data.core["GT"].value; 

	var top = variationType + " at " + chromosome + ":" + position;
	var middle = "QUAL " + QUAL + ", FILTER " + FILTER; 

	console.log([chromosome, position, referenceAllele, sampleAllele, variationType, QUAL, FILTER, GT].join(",")); 

	d3.select(element)
		.append("text")
		.attr("class","top-top")
		.attr("x", 50)
		.attr("y", 20)
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "central") //centers text vertically at this y position
		.attr("fill", "white")
		.attr("font-size", "16px")
		.text(top);

	d3.select(element)
		.append("text")
		.attr("class","top-top")
		.attr("x", 50)
		.attr("y", 30)
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "central") //centers text vertically at this y position
		.attr("fill", "white")
		.attr("font-size", "16px")
		.text(middle);

	// $("text.top-top")
	// 	.text("A")
	// 	.append(
	// 		$("<tspan></tspan>")
	// 			.text("B")
	// 	);


}

function addBottomText(element, data) {

}
