$(function() {

	var nVariants = 40;
	var nSpiralAnnotations = 10; 

	var data = getSpiralData(nVariants, nSpiralAnnotations);

	renderSpiralgram(data, "#spiral");
	renderStaff(data[0], "#staff");

});

function renderStaff(data, element) {

	console.log(data);

	var width = $(element).width(); 
	var height = $(element).height();

	console.log(height);

	var verticalBuffer = 20; 

	var circleScale = d3.scaleLinear()
		.domain([0, data.length - 1])
		.range([verticalBuffer, height - verticalBuffer])

	d3.select(element)
		.append("line")
		.attr("x1", width / 2)
		.attr("y1", verticalBuffer)
		.attr("x2", width / 2)
		.attr("y2", height - verticalBuffer)
		.attr("stroke", colorForSpindle)

	d3.select(element)
		.append("g")
		.attr("class", "circles")
		.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", width / 2)
		.attr("cy", (_, i) => circleScale(i))
		.attr("r", (d, i) => d * 10)
		.attr("fill", "blue")

}

function renderSpiralgram(data, element) {

	var nVariants = data.length; 
	var nSpiralAnnotations = data[0].length; 

	var width = $(element).width(); 
	var height = $(element).height(); 

	var center = [width / 2, height / 2];

	var buffer = 10; 

	var maxRadius = Math.min(width, height) / 2 - buffer; 
	var minRadius = 25; 

	var radiusStep = (maxRadius - minRadius) / (nSpiralAnnotations - 1); 

	var rotationScale = d3.scaleLinear()
		.domain([0, nVariants])
		.range([0, 360])

	d3.select(element)
		.selectAll("g")
		.data(data)
		.enter()
		.append("g")
		.attr("transform", (_, i) => "translate(" + center[0] + "," + center[1] + ") rotate(" + rotationScale(i) + ")");

	d3.select(element)
		.selectAll("g")
		.append("line")
		.attr("x1", minRadius)
		.attr("y1", 0)
		.attr("x2", maxRadius)
		.attr("y2", 0)
		.attr("class", "spindle")
		.attr("stroke", colorForSpindle);

	d3.select(element)
		.selectAll("g")
		.selectAll("circle")
		.data(d => d)
		.enter()
		.append("circle")
		.attr("cx", (_, i) => minRadius + i * radiusStep)
		.attr("cy", 0)
		.attr("r", d => d == -1 ? 0 : d * 4)
		.attr("fill", (d, i) => colorForAnnotation(d, i, nSpiralAnnotations));

}

function colorForSpindle() { 

	return "darkgrey";

}

function colorForAnnotation(datum, index, nSpiralAnnotations) { 

	return "#" + Math.floor(index / (nSpiralAnnotations + 1) * 16777215).toString(16);

}

function getRandomColor() { 

	return "#" + Math.floor(Math.random()*16777215).toString(16);

}

function getSpiralData(nVariants, nSpiralAnnotations) {

	var emptyProbability = .25;

	return $.map(new Array(nVariants), function(index, element) {

		return [$.map(new Array(nSpiralAnnotations), function(i, e) {

			return Math.random() > emptyProbability ? parseFloat(Math.random().toFixed(3)) : -1; 

		})];

	});

}