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
	var verticalBuffer = 20; 

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
		.attr("y2", verticalScale(data.length - 1))
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
		.attr("r", (d, i) => 10)
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

			//unhiglight the cirlce when unmoused over
			d3.select(this)	
				.attr("fill", colorForAnnotation(d, i, nColumns)); 

			d3.select(spiralElement)
				.selectAll("circle[data-index=\"" + i + "\"]") 
				.attr("fill", colorForAnnotation(d, i, nColumns))
		
		}); 

	//add labels to the staff gram
	// d3.select(element)
	// 	.append("g")
	// 	.attr("class", "labels")
	// 	.selectAll("text")
	// 	.data(data)
	// 	.enter()
	// 	.append("text")
	// 	.text((d, i) => i + ": " + d.toFixed(3))
	// 	.attr("x", width / 4)
	// 	.attr("y", (_, i) => verticalScale(i))
	// 	.attr("text-anchor", "middle")
	// 	.attr("dominant-baseline", "central") //centers text vertically at this y position
	// 	.attr("fill", "white")
	// 	.attr("font-size", "16px")
}
