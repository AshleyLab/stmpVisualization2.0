function drawPedigree(gt, element, isSpiral) { 

	var parsed = parseGenotype(gt); 
	console.log(parsed);

	var probandColor = colorForGenotype(parsed[0]); 
	var fatherColor = colorForGenotype(parsed[1]);
	var motherColor = colorForGenotype(parsed[2]);

	var strokeWidthForUnknownGenotype = 1; //thickness of the outline of the shape be when we don't the genotype

	var radius = 10; 

	//this should be the halfway point of the vertical line that connects the proband and the parents line
	var centerX = $(element).width() / 2; 
	var centerY = $(element).height() / 2; 

	if (!isSpiral) {
		centerX = 350; 
		centerY = 50; 
	}

	//draw a square for the father
	var squareCenterX = centerX - radius * 2; 
	var squareCenterY = centerY - radius;  

	d3.select(element)
		.append("rect")
		.attr("class", "pedigree")
		.attr("x", squareCenterX - radius)
		.attr("y", squareCenterY - radius)
		.attr("width", radius * 2)
		.attr("height", radius * 2)
		.attr("fill", fatherColor)
		.attr("stroke", "white")
		.attr("stroke-width", parsed[1] == -1 || parsed[1] == null ? strokeWidthForUnknownGenotype : 0);

	//draw a circle for the mother
	var circleCenterX = centerX + radius * 2; 
	var circleCenterY = centerY - radius; 

	d3.select(element)
		.append("circle")
		.attr("class", "pedigree")
		.attr("cx", circleCenterX)
		.attr("cy", circleCenterY)
		.attr("r", radius)
		.attr("fill", motherColor)
		.attr("stroke", "white")
		.attr("stroke-width", parsed[2] == -1 || parsed[2] == null ? strokeWidthForUnknownGenotype : 0);

	//draw a diamond for the proband 
	var diamondCenterX = centerX; 
	var diamondCenterY = centerY + radius * 2; 

	d3.select(element)
		.append("path")
		.attr("class", "pedigree")
		.attr("d", () => {

			var d = "M " + diamondCenterX + " " + (diamondCenterY - radius) + " "; 
				d += "l " + radius + " " + radius + " "; 
				d += "l " + -radius + " " + radius + " "; 
				d += "l " + -radius + " " + -radius + " "; 
				d += "Z";

			return d;	

		}).attr("fill", probandColor)
		.attr("stroke", "white")
		.attr("stroke-width", parsed[0] == -1 ? strokeWidthForUnknownGenotype : 0);

	//draw a line connecting the mother and the father
	d3.select(element)
		.append("line")
		.attr("class", "pedigree")
		.attr("x1", squareCenterX + radius)
		.attr("y1", squareCenterY)
		.attr("x2", circleCenterX - radius)
		.attr("y2", squareCenterY)
		.attr("stroke", "white")
		.attr("stroke-radius", 5);

	//draw a line connecting the proband to the line between the mother and the father
	d3.select(element)
		.append("line")
		.attr("class", "pedigree")
		.attr("x1", (squareCenterX + circleCenterX) / 2)
		.attr("y1", squareCenterY)
		.attr("x2", (squareCenterX + circleCenterX) / 2)
		.attr("y2", diamondCenterY - radius)
		.attr("stroke", "white")
		.attr("stroke-radius", 5);
}