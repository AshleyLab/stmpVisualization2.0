function renderSpiralgram(data, element) {

	var nVariants = data.length; 

	var spindleColumns = [

		"SIFT Function Prediction",
		"PolyPhen-2 Function Prediction",
		"CADD Score",
		"Phylop",
		"MutationTaster",
		"fathmm",
		"Sift",

		"1000 Genomes Frequency", 
		"ExAC Frequency", 
		"ExAC East Asian Frequency",
		"ExAC South Asian Frequency",
		"ExAC African Frequency",
		"ExAC European Frequency",
		"ExAC Latino Frequency",

		"GNOMADMaxAlleleFreq"
	];
	// ["NE", "CADD?", "NC", "RVIS?", "NI", "FATHMM?", "GNOMAD_Max_Allele_Freq", "KG_AF_POPMAX"];


	var nSpindleColumns = spindleColumns.length; 

	var trackColumns = ["Reference Allele", "Sample Allele", "Chromosome"];
	var nTrackColumns = trackColumns.length; 

	var width = $(element).width(); 
	var height = $(element).height();

	var center = [width / 2, height / 2];

	var outerBuffer = 10; 
	var tracksWidth = 70; 
	var spindlesToTracksBuffer = 30; 
	var innerBuffer = 100; 

	var rotationScale = d3.scaleLinear()
		.domain([0, nVariants])
		.range([0, 360])

	function addText() {

		d3.select(element)
			.append("text")
			.attr("id", "valueInfo")
			.attr("x", center[0])
			.attr("y", center[1] - 10)
			.attr("text-anchor", "middle")
			.attr("font-family", "sans-serif")
			.attr("font-size", "20px")
			.attr("fill", "white")
			.attr("dominant-baseline","central");

		d3.select(element)
			.append("text")
			.attr("id", "kindInfo")
			.attr("x", center[0])
			.attr("y", center[1] + 10)
			.attr("text-anchor", "middle")
			.attr("font-family", "sans-serif")
			.attr("font-size", "10px")
			.attr("fill", "grey")
			.attr("dominant-baseline","central");

	}

	function addSpindles() {

		var maxRadius = Math.min(width, height) / 2 - outerBuffer - tracksWidth; 

		var tailLength = 0; //part of spindle there's no circles on

		//the angular distance between consecutive spindles
		var radiusStep = (maxRadius - innerBuffer - tailLength) / (nSpindleColumns - 1);

		//flatten the data into an array (easier to visualize with d3)
		var spindleData = $.map(data, variant => 

			[$.map(spindleColumns, column => {

				var p = variant.core[column].value; 
				var v = parseFloat(p); 

				if (v !== v) { v = 0; } //weird way to test for NaN

				return v;

			})]
	
		);

		console.log(spindleData);

		//create container elements for the spindles with the right rotation 
		d3.select(element)
			.selectAll("g")
			.data(spindleData)
			.enter()
			.append("g")
			.attr("transform", (_, i) => "translate(" + center[0] + "," + center[1] + ") rotate(" + rotationScale(i) + ")");

		var staffElement = "#staffElement";

		//render the spindles
		d3.select(element)
			.selectAll("g")
			.append("line")
			.attr("x1", innerBuffer) //since the spindles' parents gs are tilted, we can just draw a straight line
			.attr("y1", 0)
			.attr("x2", maxRadius)
			.attr("y2", 0)
			.attr("class", "spindle")
			.attr("stroke", colorForSpindle)
			.attr("stroke-width", 2)
			.attr("data-clicked", 0) //0 is falsey
			.on("mouseover", function(d, i) {

				d3.select(this)
					.attr("stroke", highlightForSpindle);

				renderStaff(data[i], "#staffElement"); 

			}).on("mouseout", function(d, i) {

				if (parseInt(d3.select(this).attr("data-clicked"))) {
					return; 
				}

				d3.select(this)
					.attr("stroke", colorForSpindle);

				//find a way to go back to data staff was showing before
				renderStaff(lastStaffData, "#staffElement"); 

			}).on("click", function(d, i) {

				var clicked = parseInt(d3.select(this).attr("data-clicked"));

				d3.select(this)
					.attr("stroke", clicked ? colorForSpindle : highlightForSpindle); 

				d3.select(element)
					.selectAll("line")
					.filter((_, index) => index != i)
					.attr("data-clicked", 0)
					.attr("stroke", colorForSpindle);

				d3.select(this).attr("data-clicked", 1 - clicked)

				renderStaff(data[i], "#staffElement", data.length);

			}); 

		var cxScale = d3.scaleLinear()
			.domain([0, spindleData[0].length - 1])
			.range([innerBuffer, maxRadius]);

		//render the circles on the spindles
		d3.select(element)
			.selectAll("g")
			.selectAll("circle")
			.data(d => d)
			.enter()
			.append("circle")
			.attr("cx", (_, i) =>  cxScale(i))
			.attr("cy", 0)
			.attr("r", d => d == -1 ? 0 : d * 5)
			.attr("fill", (d, i) => colorForAnnotation(d, i, nSpindleColumns))
			.attr("data-index", (_, i) => i)
			.on("mouseover", function(d, i) { 

				d3.select(element)
					.selectAll("g")
					.selectAll("circle")
					.filter((_, index) => i == index)
					.attr("fill", highlightForCircle); 

				displayInfo(d, spindleColumns[i]);

				d3.select(staffElement)
					.select("circle[data-index=\"" + i + "\"")
					.attr("fill", highlightForSpindle);

			}).on("mouseout", function(d, i) {

				d3.select(element)
					.selectAll("g")
					.selectAll("circle")
					.filter((_, index) => i == index)
					.attr("fill", colorForAnnotation(d, i, nSpindleColumns)); 

				displayInfo("","");

				d3.select(staffElement)
					.select("circle[data-index=\"" + i + "\"")
					.attr("fill", colorForAnnotation(d, i, nSpindleColumns));

			});

	}

	function addTracks() { 

		var innerRadius = Math.min(width, height) / 2 - outerBuffer - tracksWidth + spindlesToTracksBuffer; 
		var outerRadius = Math.min(width, height) / 2 - outerBuffer;    

		var nTracks = 3; 

		var trackWidth = (outerRadius - innerRadius) / nTracks; 

		var innerRadiusScale = d3.scaleLinear()
			.domain([0, nTracks])
			.range([innerRadius, outerRadius]);

		console.log(trackColumns);
		console.log(data);

		var trackData = $.map(data, variant => 

			[$.map(trackColumns, column => variant.core[column].value)]

		); 

		console.log(trackData);

		var rotationScale = d3.scaleLinear()
			.domain([0, nVariants])
			.range([0, Math.PI * 2]);

		var angularWidth = Math.PI * 2 / nVariants; 

		d3.select(element)
			.selectAll("g.track")
			.data(trackData)
			.enter()
			.append("g")
			.attr("class", "track")
			.attr("data-index", (_, i) => i)
			.attr("transform", "translate(" + center[0] + "," + center[1] + ")"); 

		var lastText = ""; 

		d3.select(element)
			.selectAll("g.track")
			.selectAll("path") 
			.data(d => d)
			.enter()
			.append("path")
			.attr("data-isChromosome", (_, i) => i == 2 ? "1" : "0")
			.attr("d", function(d, index) { //manually specify the shape of the path

				var i = parseInt(d3.select(this.parentNode).attr("data-index")); 

				var iR = innerRadiusScale(index); 
				var oR = innerRadiusScale(index) + trackWidth; 

				var sA = rotationScale(i);
				var eA = rotationScale(i) + angularWidth;

				var arc = d3.arc()
					.innerRadius(iR)
					.outerRadius(oR)
					.startAngle(sA)
					.endAngle(eA);

				return arc(); 

			}).attr("fill", function(d, i) {

				if (isChromosome(this)) {

					return colorForChromosome(d)

				} else { 

					return colorForNucleotide(d);

				}

			}).on("mouseover", function(d, i) {

				//highlight on mouseover
				d3.select(this)
					.attr("fill", highlightForTrack)

				displayInfo(d, trackColumns[i]);

			}).on("mouseout", function(d, i) {

				if (isChromosome(this)) {

					console.log("chromosome " + d + ", " + i);

					d3.select(this)
						.attr("fill", colorForChromosome)

				} else { 

					console.log("nucleotide " + d + ", " + i);

					d3.select(this)
						.attr("fill", colorForNucleotide);

				}

				displayInfo("","")

			});

	}

	addText(); 
	addSpindles(); 
	addTracks(); 
	
}