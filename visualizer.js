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

		renderSpiralgram(data, "#spiralElement");
		renderStaff(data[0], "#staffElement");

	}

}

function colorForChromosome(d) {

	if (d.toLowerCase() == "x" || d.toLowerCase() == "y") { 
		return "#ff8026"
	}

	var colorScale = d3.interpolateRgb("#fff", "#000"); 
	var ratio = parseFloat(d) / 22; 
	var chromColor = colorScale(ratio); 

	return chromColor; 

}

function colorForNucleotide(d) {

	var colors = {"A" : "red", "G" : "green", "T" : "yellow", "U" : "yellow", "C" : "blue"}; 
	var c = d in colors ? colors[d] : "darkgrey";

	return c;

}

function displayInfo(value, kind) {

	console.log(value);
	console.log(kind);

	d3.select("#valueInfo")
		.text(value);

	d3.select("#kindInfo")
		.text(kind);
}

console.log(visualizeProteinVariantColumn('p.E343G; p.E401G; p.E357G; p.E413G'))

//given a position and protein variant returns the full names of the proteins
function parseProteinVariantData(proteinVariantData){
	var aminoAAs = proteinVariantData.replace('p.', '').split(";"); //strip the 'p.', then split the amino acids
	var aaSub = aminoAAs[0]; //take the first ones for now
	var aaS = aaSub.replace(/\d+/, ''); //strip out the positions
	var refAA = aaS[0];
	var altAA = aaS[1];
	return [refAA, altAA]
}

//given the three letter code for an amino acid, returns the correct color for it by first getting its group, and then the color associated with the group
function getColorForAminoAcid(aminoAcid){
	aminoAcidGroups = {'Aliphatic': ['Ala', 'Gly', 'Ile', 'Leu', 'Pro', 'Val'], 'Aromatic': ['Phe', 'Trp', 'Tyr'], 'Acidic': ['Asp', 'Glu'], 'Basic': ['Arg', 'His', 'Lys'], 'Hydroxylic': ['Ser', 'Thr'], 'Sulfur-Containing': ['Cys', 'Met'], 'Amidic': ['Asn', 'Gln']};
	//TODO fix the amino acid colors and make them better
	aminoAcidColors = {'Aliphatic': ['#20A39E', '#20A39E', '#20A39E', '#20A39E', '#20A39E', '#20A39E'], 'Aromatic': ['#98CE00', '#98CE00', '#98CE00'], 'Acidic': ['#FF715B', '#FF715B'], 'Basic': ['#F0386B', '#F0386B', '#F0386B'], 'Hydroxylic': ['#93E5AB', '#93E5AB'], 'Sulfur-Containing': ['#FB8B24', '#FB8B24'], 'Amidic': ['#FB8B24', '#FB8B24']};
	for (var key in aminoAcidGroups) {
		var aminoAcids = aminoAcidGroups[key];
		var cntr = 0; //find the correct amino acid match and the index we find it at
		for (idx in aminoAcids){
			var curAA = aminoAcids[idx];
			if (curAA == aminoAcid){
				return aminoAcidColors[key][cntr]
			}
			cntr += 1;
		}
	}
}

//parse the column protein variant data and returns a list with the following form [colorRefAA, colorAltAA, refAA, altAA]
function visualizeProteinVariantColumn(proteinVariantData) {
	//define how amino acid abbreviations work
	var aminoAcidAbbreviations = { 'A':'Ala', 'R':'Arg', 'N':'Asn', 'D':'Asp', 'C':'Cys', 'E':'Glu', 'Q':'Gln', 'G':'Gly', 'H':'His', 'I':'Ile', 'L':'Leu', 'K':'Lys', 'M':'Met', 'F':'Phe', 'P': 'Pro', 'S': 'Ser', 'T':'Thr', 'W':'Trp', 'Y':'Tyr', 'V': 'Val' };
	var aaS = parseProteinVariantData(proteinVariantData);
	var refAALong = aminoAcidAbbreviations[aaS[0]];
	var altAALong = aminoAcidAbbreviations[aaS[1]];
	//console.log(refAALong);
	return [getColorForAminoAcid(refAALong), getColorForAminoAcid(altAALong), refAALong, altAALong];
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

function getColor(index, total, highlight) {

	if (!highlight) {

		return d3.interpolateSpectral(index / (total - 1));

	} else {

		var rgb = d3.interpolateSpectral(index / (total - 1)).replace(/ /g, ""); 
		var rgbValues = rgb.substring(rgb.indexOf("(") + 1, rgb.length - 2); 
		
		var r = parseInt(rgbValues.split(",")[0]); 
		var g = parseInt(rgbValues.split(",")[1]); 
		var b = parseInt(rgbValues.split(",")[2]); 

		var hsvOriginal = RGBtoHSV(r, g, b); 
		var h = hsvOriginal.h; 
		var s = hsvOriginal.s; 
		var v = hsvOriginal.v; 

		var finalRGB = HSVtoRGB(h / 360, 0 / 100, 100 / 100); //white (for now)

		return "rgb(" + finalRGB.r + "," + finalRGB.g + "," + finalRGB.b + ")";

	}

}

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


	console.log("hiding spinner");

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

function colorForAnnotation(datum, index, nSpiralAnnotations) { 

	return "#" + Math.floor((index + 1) / (nSpiralAnnotations + 1) * 16777215).toString(16);

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
