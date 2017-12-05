function removeSVGs(element) { //clean the SVG so previous visualizations aren't still there

	d3.select(element)
		.selectAll("svg")
		.remove(); 

}

function renderVisualization(isStreamgraph, element, data) {

	// var localData = deepClone(lD);
	// var sD = getSpiralData(10, 10);


	if (isStreamgraph) {

		removeSVGs(element);

		streamData = prepareDataForStreamgraph(localData);
		renderStreamgraph("#graphics", streamData); 
		renderTracks("#masterSVG", data);
		renderRadar();

	} else { //spiral

		//setup work to get the right configuration of divs and svg for the spiralgram and staffgram 
		//the positioning of these elements is set in main.css
		d3.select(element)
			.append("div")
			.attr("id", "spiralLayoutContainer"); 

		d3.select("#spiralLayoutContainer")
			.append("div")
			.attr("id", "innerSpiralLayoutContainer");

		d3.select("#innerSpiralLayoutContainer")
			.append("div")
			.attr("id", "spiralContainer")
			.append("svg")
			.attr("id", "spiralElement"); 

		d3.select("#innerSpiralLayoutContainer")
			.append("div")
			.attr("id", "staffContainer")
			.append("svg")
			.attr("id", "staffElement");

		//setup for karyotype and barchart and analysis toosl

		var bottomRow = d3.select(element)
			.append("div")
			.attr("id", "bottomRow");

		bottomRow.append("svg")
			.attr("id","karyotypeElement"); 

		bottomRow.append("div")
			.attr("id","tools"); 

		bottomRow.append("svg")
			.attr("id", "barchartElement");

		//

		renderKaryotype(data, "#karyotypeElement");
		// renderBarchart(data, "#barchartElement", 3)		
		renderSpiralgram(data, "#spiralElement");
		renderStaff(data, 0, "#staffElement", "#spiralElement");

		renderTools(data, 0); 

	}

}

function colorForChromosomeStaff(chromosome) {

	return isNaN(chromosome) ? "#ff8026" : "white";

}

function colorForChromosomeBinary(chromosome) {

	return isNaN(chromosome) ? "#ff8026" : "#22262e"; 

}

function colorForChromosome(d) {

	if (isNaN(d)) { 
		return "#ff8026"
	}

	var colorScale = d3.interpolateRgb("#fff", "#000"); 
	var ratio = parseFloat(d) / 22; 
	var chromColor = colorScale(ratio); 

	return chromColor; 

}

function colorForNucleotide(d) {

	var colors = {"A" : "red", "G" : "green", "T" : "orange", "U" : "orange", "C" : "blue"}; 
	var c = d in colors ? colors[d] : "darkgrey";

	return c;

}

function displayInfo(value, kind, isFrequency, isMissing, proteinVariant, isLine) {

	var valueInfo = "#valueInfo";
	var element = "#spiralElement";
	var colorsID = "valueInfoColors";

	var diameter = 80; 

	if (isFrequency) { //change to isNumeric to round frequencies and numerical model scores

		value = formatFrequency(parseFloat(value));
	}

	d3.select(element).select(valueInfo).selectAll("*").remove(); 

	if (proteinVariant) { //false if not, otherwise "ref" or "alt"

		//just display the first tag

		console.log(value);

		var tags = value.split(";");
		if (tags.length > 1) {
			value = tags[0] + "...";
		}

		var parsedPV = parseVariantTag(value, true);
		var specialRectOffset = 8; 

		d3.select(element).select("#" + colorsID).remove(); 
		// d3.select(element).select(valueInfo).selectAll("*").remove(); 

		renderWords(element, parsedPV, valueInfo, 0, 0, specialRectOffset, false); 

	} else if (isLine) { 

		renderWords(element, value, valueInfo, 0, 0, specialRectOffset, false); 

	} else {

		d3.select(element).select("#" + colorsID).remove(); 
		// d3.select(element).select(valueInfo).selectAll("*").remove(); 

		d3.select(valueInfo)
			.text(isMissing ? "" : value)

	}

	//fix inconsistent font resizing 
	d3.select(valueInfo)
		// .each(function() {

 	// 		var currentFontSize = d3.select(this).attr("font-size");
 	// 		console.log("original size: " + currentFontSize);

 	// 		var cTL = this.getComputedTextLength(); 
 	// 		console.log("original length: " + cTL);

 	// 		if (cTL > diameter) {

	 // 				var newSize = (diameter) / (cTL / 20) + "px"; 
	 // 				console.log("changing size to " + newSize);

	 // 				d3.select(this).attr("font-size", newSize);

 	// 		} else { 
 	// 			console.log("not changing")
 	// 		}

		// });
 		.style("font-size", function() { 

 			//maybe don't do this if just clearing?

 			var currentFontSize = d3.select(this).attr("font-size");
 			console.log("fs currentFontSize: " + currentFontSize);

 			var cFSasFloat = parseFloat(currentFontSize.substring(0, currentFontSize.indexOf("px")));
 			console.log("fs cFSasFloat: " + cFSasFloat);

 			var currentFontSize2 = parseFloat(window.getComputedStyle(this, null).getPropertyValue("font-size")); 
 			console.log("fs currentFontSize2: " + currentFontSize2);

 			var computedTextLength = this.getComputedTextLength(); 
 			console.log("fs computedTextLength: " + computedTextLength);

 			var newSize = currentFontSize2; 

 			if (computedTextLength > diameter) {

 				console.log("fs too big"); 
 				newSize = (diameter) / (computedTextLength / currentFontSize2); 
 				console.log("fs newSize: " + newSize);

 			} else if (computedTextLength < diameter) { //currently identical

 				console.log("fs too small");
 				newSize = (diameter) / (computedTextLength / currentFontSize2); 
 				console.log("fs newSize: " + newSize);

 			}

 			var limits = [4, 25]; //max and min size

 			console.log("fs newSize before clipping: " + newSize);

 			newSize = Math.min(Math.max(newSize, limits[0]), limits[1]); 
 			console.log("fs newSize clipped to: " + newSize);

 			return newSize; //+ "px";

 		});

 	if (proteinVariant) {
		
		colorVariantTag(element, valueInfo, colorForAcidSymbol, specialRectOffset * .65, colorsID, proteinVariant == "alt", proteinVariant == "ref"); 

 	}


	d3.select("#kindInfo")
		.text(kind);

}

function formatFrequency(frequency) { 

	// console.log("formatting " + frequency); 

	//only show three digits right of zero, unless that would mean presenting a nonzero frequency as zero

	var rounded = 0; 

	if (frequency == 0) { 
		return 0; 
	}

	if (frequency >= .0005) { //anything that will become a one or more after Math.round(frequency * 1000)
		//round to three decimal places
		var rounded = Math.round(frequency * 1000) / 1000; 
		// console.log("rounding to three decimal places --> " + rounded);
	} else { 
		var rounded = parseFloat(frequency.toPrecision(1));
		// console.log("rounding to one sig fig --> " + rounded); 
	}

	return rounded; 

}

function highlightForTrack() {

	return "white"; 

}

function renderTracks(element, data) {

	var keysForTracks = ["C", "D"];

	var widthStep = $(element).width() / (data.length + 1); 

	$.each(keysForTracks, (index, key) => { //it drives me insane that the parameters are passed in different orders in $.each() and $.map()

		var trackData = $.map(data, (datum, index) => datum.xyz[key] );

		d3.select(element)
			.append("g")
			.attr("class", key)
			.selectAll("rect")
			.data(trackData)
			.enter()
			.append("rect")
			.attr("x", (d, i) => (i + 0.5) * widthStep)
			.attr("y", 150 + index * 10)
			.attr("width", widthStep)
			.attr("height", 10)
			.attr("fill", (d, i) => fillForTrackDatum(d))

		d3.select(element)
			.append("g")
			.attr("class", key + "text")
			.selectAll("text")
			.data(trackData)
			.enter()
			.append("text")
			.attr("x",(d, i) => (i + 1) * widthStep)
			.attr("y", 150 + index * 10 + 5 + 1)
			.style("font-size", 9)
			.style("alignment-baseline", "middle")
			.text(d => d)
			.style("text-anchor", "middle")

	}); 

}

function fillForTrackDatum(d) {

	return getRandomColor(); 

}

function deepClone(thing) {

	return JSON.parse(JSON.stringify(thing));

}

// function getColor(index, total, highlight) {

// 	if (!highlight) {

// 		return d3.interpolateSpectral(index / (total - 1));

// 	} else {

// 		var rgb = d3.interpolateSpectral(index / (total - 1)).replace(/ /g, ""); 
// 		var rgbValues = rgb.substring(rgb.indexOf("(") + 1, rgb.length - 2); 
		
// 		var r = parseInt(rgbValues.split(",")[0]); 
// 		var g = parseInt(rgbValues.split(",")[1]); 
// 		var b = parseInt(rgbValues.split(",")[2]); 

// 		var hsvOriginal = RGBtoHSV(r, g, b); 
// 		var h = hsvOriginal.h; 
// 		var s = hsvOriginal.s; 
// 		var v = hsvOriginal.v; 

// 		var finalRGB = HSVtoRGB(h / 360, 0 / 100, 100 / 100); //white (for now)

// 		return "rgb(" + finalRGB.r + "," + finalRGB.g + "," + finalRGB.b + ")";

// 	}

// }

function sortOnKeys(data, keys, increasing) { 

	var sorted = data.sort(function(a, b) {

		var aEl = a; 
		var bEl = b; 

		for (i = 0; i < keys.length; i++) {
			aEl = aEl[keys[i]]; 
			bEl = bEl[keys[i]];
		}

		return increasing ? d3.ascending(aEl, bEl) : d3.descending(aEl, bEl);

	}); 

	sorted.unshift({"key" : "keyX", "xyz" : {"A" : 0, "B" : 0, "C" : 0, "D" : 0, "E" : 0, "F" : 0}}); 
	sorted.push({"key" : "keyX", "xyz" : {"A" : 0, "B" : 0, "C" : 0, "D" : 0, "E" : 0, "F" : 0}});

	return sorted; 
}

function getRandomColor() {

	return "#" + Math.floor(Math.random() * 16777215).toString(16);
	
}

function showSpinner() { 

	$("#spinnerContainer").show()
	$("#inputContainer").hide()

}

function hideSpinner() {

	$("#spinnerContainer").hide()
	$("#inputContainer").show()

}

function scrollToElement(element) {

	$("html, body").animate({
        scrollTop: $(element).offset().top
    }, 2000);

}

function HSVtoRGB(h, s, v) {

    var r, g, b, i, f, p, q, t;

    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }

    i = Math.floor(h * 6);

    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function RGBtoHSV() {

    var rr, gg, bb,
        r = arguments[0] / 255,
        g = arguments[1] / 255,
        b = arguments[2] / 255,
        h, s, 
        v = Math.max(r, g, b),
        diff = v - Math.min(r, g, b),
        diffc = function(c) {
            return (v - c) / 6 / diff + 1 / 2;
        };

    if (diff == 0) {

        h = s = 0;

    } else {

        s = diff / v;
        rr = diffc(r);
        gg = diffc(g);
        bb = diffc(b);

        if (r === v) {
            h = bb - gg;
        } else if (g === v) {
            h = (1 / 3) + rr - bb;
        } else if (b === v) {
            h = (2 / 3) + gg - rr;
        }
        
        if (h < 0) {
            h += 1;
        } else if (h > 1) {
            h -= 1;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}

function highlightForSpindle() { 

	return "white";

}

function colorForSpindle() { 

	return "darkgrey";

}

function highlightForCircle() { 

	return "white";

}

function colorForPopulation(populationColumnHeader) {

	/*"AF_EAS", 		"ExAC East Asian Frequency",
	"AF_NFE",		"ExAC European Frequency",
	"AF_SAS",		"ExAC South Asian Frequency",
	"AF_AMR",		"ExAC Latino Frequency",
	"AF_AFR",		"ExAC African Frequency"*/

	var populationCode = -1; 

	switch(populationColumnHeader){
		case "AF_EAS": 
		case "ExAC East Asian Frequency": 
		case "EAS": 
			populationCode = 0; 
			break; 
		case "AF_NFE":
		case "ExAC European Frequency":
		case "NFE":
			populationCode = 1; 
			break; 
		case "AF_SAS":
		case "ExAC South Asian Frequency": 
		case "SAS":
			populationCode = 2; 
			break; 
		case "AF_AMR": 
		case "ExAC Latino Frequency":
		case "AMR":
		case "MR": //is that what MR means?
			populationCode = 3; 
			break; 
		case "AF_AFR": 
		case "ExAC African Frequency":
		case "AFR":
			populationCode = 4; 
			break; 
		default: 
			console.log("don't know what to do with population: " + populationColumnHeader);
	}

	// var populationCodeColors = ["#967D69","#B9D2B1","#C7D66D","#2D4739","#61C3C"]; 
	var palette = ["#98CE00","#16E0BD","#EE6352","#EAC435","#89A6FB"];

	return palette[populationCode];

}

function shortNameForPopulation(populationColumnHeader) { 

	switch(populationColumnHeader){
		case "AF_EAS": 
		case "ExAC East Asian Frequency": 
			return "EAS";
		case "AF_NFE":
		case "ExAC European Frequency":
			return "NFE";
		case "AF_SAS":
		case "ExAC South Asian Frequency": 
			return "SAS"; 
		case "AF_AMR": 
		case "ExAC Latino Frequency":
			return "AMR";
		case "AF_AFR": 
		case "ExAC African Frequency":
			return "AFR";
		default: 
			console.log("don't know what to do with population: " + populationColumnHeader);
			return "???";
	}

}

function colorForAnnotation(index, nSpiralAnnotations) { 

	var presets = ["#20A39E","#98CE00","#FF715B","#F0386B","#93E5AB","#FB8B24","#0CCE6B","#3FA7D6","#FF1B1C","#26F0F1","#5F4BB6"]; 

	if (index > presets.length - 1) {
		return "#" + Math.floor((index + 1) / (nSpiralAnnotations + 1 ) * 16777215).toString(16);
	}

	return presets[index]; 

}

function getSpiralData(nVariants, nSpiralAnnotations) {

	var emptyProbability = .25;

	return $.map(new Array(nVariants), function(index, element) {

		return [$.map(new Array(nSpiralAnnotations), function(i, e) {

			return Math.random() > emptyProbability ? parseFloat(Math.random().toFixed(3)) : -1; 

		})];

	});

}

function fixdata(data) { //copied from?
	var o = "", l = 0, w = 10240;
	for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
	o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
	return o;
}
