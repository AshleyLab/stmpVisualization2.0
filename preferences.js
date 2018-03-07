/* SORTING THE VARIANTS IN THE SPIRALGRAM */

var sortPreferences = { 
	"SIFT Function Prediction" : 0,
	"PolyPhen-2 Function Prediction" : 0,
	"MutationTaster" : 0,
	"CADD Score" : 0,
	"phyloP" : 0,
	"fathmm" : 0,
	"1000 Genomes Frequency" : 0, 
	"ExAC Frequency" : 0,
	"GNOMADMaxAlleleFreq" : 0
}; 

function computeSortPreferences() { 

	var total = 100; 
	var share = total / Object.keys(sortPreferences).length; 

	for (var criterion in sortPreferences) { 
		sortPreferences[criterion] = share; 
	}

}
computeSortPreferences(); 

function sortData() { 

	console.log("sorting");
	console.log(sortPreferences);

	var original = window.variantData; 

	function comparator(a, b) {

		function getSortValue(d) {

			var sortValue = 0; 

			for (var criterion in sortPreferences) { 

				var weight = sortPreferences[criterion];
				sortValue += weight * d.core[criterion].value; //add option for dealing with missingdata (maybe substituting value)

			}

			return sortValue; 

		}

		var aSV = getSortValue(a); 
		var bSV = getSortValue(b);
		return bSV - aSV; 
	}


	var sorted = window.variantData.sort(comparator); 
	window.variantData = sorted; 

}

var preferencesIsVisible = false; 
function setGear() { 

	$("#gear").on("click", function() { 
		preferencesIsVisible = !preferencesIsVisible;

		//remove old preferences pane 
		d3.select("#preferences").remove(); 

		//add preferences pane and gradient div
		var element = "#graphics"; 
		d3.select(element)
			.select(".rightSplit")
			.append("div")
				.attr("id", "preferences")
				.style("visibility", preferencesIsVisible ? "visible" : "hidden")
			.append("div")
				.attr("id", "gradient"); 

		//append sliders pane
		d3.select("#preferences")
			.append("div")
				.attr("id", "sliders")

		//add arrow to preferences pane
		d3.select("#preferences")
			.append("div")
			.attr("id", "preferencesArrow");

		showSort("#sliders", "#gradient"); 

	}); 

}
setGear(); 

function showSort(slidersElement, gradientElement) { 

	console.log("showing sort");
	console.log(sortPreferences);

	var colorer = function(i) {
		return colorForAnnotation(i, 9); //9 is nSpindleColumns (same as nSortColumns)
	}

	function showSliders(slidersElement) { 

		var criteria = $.map(sortPreferences, (weight, criterion) => criterion);
		console.log(criteria);

		var width = 100 / criteria.length; 
		console.log(width);

		d3.select(slidersElement)
			.selectAll("div")
			.data(criteria)
			.enter()
			.append("div")
			.attr("class", "sliderDiv")
			.attr("id", (_, i) => "sliderDiv" + i)
			.style("width", width + "%");

		d3.selectAll(".sliderDiv")
			.each(function(d, i) { 

				var id = "sliderSpan" + i;

				console.log(d3.select(this));

				d3.select(this)
					.append("span")
					.attr("class", "sliderSpan")
					.attr("id", id); 

				var weight = sortPreferences[d];
				console.log("slider " + i + " has weight " + weight);

				//activate the jQuery UI slider
				$("#" + id).slider({
					"orientation" : "vertical",
					"min" : 0, 
					"max" : 100, 
					"value" : weight, 
					"slide" : function() {
						setSortPreferences(); 
						showGradient(gradientElement);
						renderVisualization(); //renderVisualiation() --> renderComponents() --> sortData(); 
						// sortData(); 
					}
				});

				//set the color of the slider handle
				$("#" + id + " span").css({
					"background-color" : colorer(i) //this is unreliable since indices may not always be consistent
				});

			});

		function setSortPreferences() {

			var newPreferences = {}; 

			$(".sliderSpan").each(function(_, element) {

				var weight = $(this).slider("value"); 
				var criterion = d3.select(this.parentNode).datum(); 

				newPreferences[criterion] = weight; 

			});

			//normalize so sum of all weights add up to 100
			var scale = 100; 
			var total = 0; 
			for (var c in newPreferences) {
				total += newPreferences[c];
			}

			var normalizedPreferences = {}; 
			$.map(newPreferences, (value, key) => {
				normalizedPreferences[key] = value / total * scale; 
			});

			console.log(newPreferences);
			console.log(total);
			console.log(normalizedPreferences);

			sortPreferences = normalizedPreferences; 

		}

	}

	function showGradient(gradientElement) { //https://stackoverflow.com/a/12355923/2809263

		console.log(sortPreferences);

		var total = 0; 
		var gradientStops = $.map(sortPreferences, (d, i) => { 
			total += d; 
			return total - d; 
		});

		//trim off the last one (sliders go BETWEEN ranges)
		// gradientStops.pop(); 
		gradientStops.shift(); 

		console.log(gradientStops);

		var colorstops = "left, " + colorer(0) + ","

		for (var i = 0; i < gradientStops.length; i++) {

            colorstops += colorer(i) + " " + gradientStops[i] + "%,";
           	colorstops += colorer(i + 1) + " " + gradientStops[i] + "%,";

        }

        colorstops += colorer(gradientStops.length) 

        var webkitGradient = "-webkit-linear-gradient(" + colorstops + ")";
        console.log(webkitGradient);

        $("#gradient").css({
        	"height" : "8px",
        	"background-image" : webkitGradient
        });

	}

	showSliders(slidersElement); 
	showGradient(gradientElement); 

}