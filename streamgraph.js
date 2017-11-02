function prepareDataForStreamgraph(d) {

	data = deepClone(d);

	//add baseline data so no variants are on the egde of the graph 
	data.unshift({"key" : "keyX", "xyz" : {"A" : 0, "B" : 0, "C" : 0, "D" : 0, "E" : 0, "F" : 0}}); 
	data.push({"key" : "keyX", "xyz" : {"A" : 0, "B" : 0, "C" : 0, "D" : 0, "E" : 0, "F" : 0}});

	return data; 
}

function renderStreamgraph(outerElement, data) {

	var features = Object.keys(data[2].xyz); //get keys from nondummy elements (there for now)
	var nFeatures = features.length; 
	var nVariants = data.length - 2; //subtract dummy elements (there for now) 

	var element = "masterSVG";

	d3.select("#" + element)
		.selectAll("*").remove();

	d3.select(outerElement)
		.append("svg")
		.attr("id", element);

	element = "#" + element; 

	var h = $(element).height(); 
   	var w = $(element).width(); 

	var flattened = $.map(data, d => d.xyz); 
	var stacked = d3.stack().keys(features).offset(d3.stackOffsetNone)(flattened);
	var tops = $.map(stacked[stacked.length - 1], d => d[1]); 

	var xScale = d3.scaleLinear() 
   		.domain([0, flattened.length - 1])
   		.range([0, w])

	var yScale = d3.scaleLinear() //gives the height one layer should be 
   		.domain([
   			d3.min(stacked, function(layer) { return d3.min(layer, function(d) { return d[0]; }); }), 
   			d3.max(stacked, function(layer) { return d3.max(layer, function(d) { return d[1]; }); })
   		]).range([h - axisSpace, 40]); //leave space for axis //leave space at top?

   	var lastHTML = ""; 

   	var area = d3.area()
		.curve(d3.curveCardinal)
		.x(function(datum, index) {

			var pos = xScale(index);

			// if (index == 0) { 
			// 	pos = pos + (xScale(1) - pos) / 2; 
			// } else if (index == nVariants - 1) {
			// 	pos = pos - (pos - xScale(nVariants - 2)) / 2; 
			// }

			return pos;

		}).y0( d => yScale(d[0]) )
		.y1( d => yScale(d[1]) );

	d3.select(element)
		.selectAll("path")
		.data(stacked)
		.enter()
		.append("path")
		.attr("d", area)
		.attr("fill", (d, i) => getColor(i, nFeatures, false) )
		.on("click", function(datum, index) {

			pathClicks[index]++; 
			var increasing = pathClicks[index] % 2 == 0; 

			data = data.slice(1, data.length - 1); //remove empty post values
			newData = sortOnKeys(data, ["xyz", datum.key], increasing);

			var info = "<span id=\"sortInfo\">" + (increasing ? "increasing" : "decreasing") + "</span>";
			var finalHTML = datum.key + info; 

			$("span#masterText").html(finalHTML); 

			renderStreamgraph(element, newData);

		}).on("mouseover", function(datum, index) {

			d3.select(this)
				.attr("fill", getColor(index, nFeatures, true));

			lastHTML = $("span#masterText").html(); 
			var info = pathClicks[index] == 0 ? "<span id=\"sortInfo\">click to sort</span>" : ""; 
			$("span#masterText").html(datum.key + info);

		}).on("mouseout", function(datum, index) {

			d3.select(this)
				.attr("fill", getColor(index, nFeatures, false));

			$("span#masterText").html(lastHTML);

		});

	d3.select(element)
		.append("g")
		.attr("class", "xAxis")
		.attr("transform", "translate(0," + (h - axisSpace) + ")"); 

	d3.select(".xAxis")
		.call(xAxis(xScale, data, element));

    // resizeTicks(tops, yScale, h - axisSpace);
    setTicks(); 
    raiseText(tops, yScale, h - axisSpace); 

    addButtons(); 
    drawLinesBetween(data, element, xScale, h - axisSpace);

    // haze(element, nVariants + 2); //account for dummy elements with haze

}

function addButtons(height) { 
	
	var topMargin = 12; 

	d3.selectAll(".tick")
		.append("circle")
		.attr("fill", "white")
		.attr("r", function(datum, index) {

			return index == 0 || index == data.length - 1 ? "" : 3; 

		}).attr("cx", 0)
		.attr("cy", 0 + topMargin)
		.on("click", function(datum, index) {

			var siblingLine = d3.select(this.parentNode).select("line"); //set the class on the line (that's what has the id that gives the datum)
    		siblingLine.classed("selectedForRadar", !siblingLine.classed("selectedForRadar")); //toggle the class

    		renderRadar(); 

    	}).on("mouseover", function(element, index) {

    		d3.select(this).attr("fill", "orange");

    	}).on("mouseout", function(element, index) {

    		d3.select(this).attr("fill", "white");

    	});

}

function drawLinesBetween(data, element, xScale, realHeight) { //NEW

	//Where before vertical lines were being drawn to indicate where a variant was centered, 
	//effectively covering the important information, 
	//now draw vertical lines between the variants, focusing attention on the data. 

	var paths = d3.select(element)
		.selectAll("path"); 

	var features = Object.keys(data[2].xyz); //get keys from nondummy elements (there for now)
	var nFeatures = features.length; 

	//find how high the lines should reach
	var highestPath = paths.nodes()[nFeatures - 1]; 

	var midPoints = []; 

	for (var i = 0; i < data.length - 1; i++) { 

		j = i + 1; 

		var midX = (xScale(i) + xScale(j)) / 2; 
		var midY = getHeightAtPointOnPath(midX, highestPath, element, realHeight);

		midPoints.push([midX, midY]);

	}

	d3.select(element)
		.selectAll("line.divider")
		.data(midPoints)
		.enter()
		.append("line")
		.attr("class", "divider")
		.attr("x1", d => d[0])
		.attr("x2", d => d[0])
		.attr("y1", realHeight)
		.attr("y2", d => d[1])
		.attr("stroke", "white")
		.attr("stroke-width", 1);

}

function getHeightAtPointOnPath(x, path) {

	var endLength = path.getTotalLength();

	var testLength = 0; 
	var lengthStep = 5; 

	var interval = []; 

	while (true) {

		var testPoint = path.getPointAtLength(testLength);
		var nextPoint = path.getPointAtLength(testLength + lengthStep);  

		if (testPoint.x <= x && nextPoint.x >= x) {

			interval = [testLength, testLength + lengthStep];
			break; 

		} else { 

			testLength += lengthStep; 

		}
	}

	//binary search in interval for point with x that matches x
	var counter = 0; 
	var length = binarySearch(interval[0], interval[1], x, .01, 100);

	var midPoint = path.getPointAtLength(length);

	function binarySearch(startLength, endLength, targetX, precision, bailAfter) {

		counter++; 

		var midLength = (startLength + endLength) / 2; 
		var midX = path.getPointAtLength(midLength).x; 

		if (counter > bailAfter) {
			return midLength;
		}

		if (Math.abs(midX - targetX) <= precision) {
			return midLength; 
		} else if (midX < targetX) {
			return binarySearch(midLength, endLength, targetX, precision)
		} else { 
			return binarySearch(startLength, midLength, targetX, precision);
		}

	}

	return path.getPointAtLength(length).y;

}

function setTicks() { 

    d3.selectAll(".tick line")
    	.attr("id", function(datum, index) {

    		return "axisLine" + index; 

    	});

}

function xAxis(xScale, data, element) {	

	return d3.axisTop(xScale)
		.tickSize(0) //custom resize later
		.ticks(data.length)
		.tickFormat(function(datum, index) {

			return index == 0 || index == data.length - 1 ? "" : data[index].key;

		}); 

}

function resizeTicks(tops, yScale, drawingHeight) { 

	d3.selectAll("g.xAxis g.tick line")
		.attr("y2", function(datum, index) {

			if (index == 0 || index == data.length - 1) {
				return 0; 
			}

			return -(drawingHeight - yScale(tops[index])); 

		});


}

function raiseText(tops, yScale, drawingHeight) { 

	d3.selectAll("g.tick text")
		.attr("transform", function(datum, index) {

			var textLengthOffset = 25; 
			var textWidthOffset = 6; 

			var bar = d3.min(tops, function(item) { return yScale(item); }); 
			console.log(bar)

			var dist = (drawingHeight - bar) + textLengthOffset;
			// var dist = (drawingHeight - yScale(tops[index])) + textLengthOffset; //to position the text dynamically

			if (index == 0 || index == data.length - 1) {
				dist = 0; 
			}

			return "rotate(-90) translate(" + dist + "," + textWidthOffset + ")";

		}) //rotating also rotates the coordiante system

}
 
function haze(element, nVariants) { 

	var buffer = 1;

	var h = $(element).height() - axisSpace; 
	var w = $(element).width() / (nVariants - 1);

	var startXs = [...Array(nVariants - 1).keys()];
	startXs = $.map(startXs, e => e * w + buffer);

	d3.select(element)
		.append("g")
		.attr("class", "hazeContainer")
		.selectAll("rect.haze")
		.data(startXs)
		.enter()
		.append("rect")
		.attr("class", "haze")
		.attr("x", d => d)
		.attr("y", 0)
		.attr("width", w - (buffer * 2))
		.attr("height", h)
		.attr("opacity", .3)
		.attr("stroke", "black");

}