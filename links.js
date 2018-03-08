function addLinks(element) {

	console.log("adding links");

	var data = window.variantData; 
	var nVariants = data.length; 
	var center = [$(element).width() / 2, $(element).height() / 2];

	var allGenes = $.map(data, (d, _) => {
		return getGenesForVariant(d);
	});

	//only keep genes that appeared MORE THAN ONCE
	var genesWithMultipleVariants = $.grep(allGenes, (gene, i) => {

		//check if the gene appears again after this occurence (already removes some duplicate duplicte genes (e.g., if 3 variants in same gene) since last variant won't pass this test)
		return allGenes.indexOf(gene, i + 1) > -1; 
	}); 

	var finalGenes = $.unique(genesWithMultipleVariants); //since we only want one occurence of each gene in which a variant appears more than once

	console.log(allGenes);
	console.log(genesWithMultipleVariants)
	console.log(finalGenes);

	$.each(finalGenes, (i, gene) => {
		console.log("gene: " + gene);

		//find index of all variants variants in this gene; 
		var indices = []; 
		$.each(data, (i, d) => {

			var thisGenes = getGenesForVariant(d); 
			if (thisGenes.includes(gene)) { 
				indices.push(i);
			}

		}); 

		console.log(indices);
		linkGenesWithIndices(gene, indices); 
	}); 

	function linkGenesWithIndices(gene, indices) {

		//(for now at least) we'll draw a line between each pair
		//so compute each pair (subset of 2 items) from indices

		function getPairs(array) { https://stackoverflow.com/a/22566654
			var pairs = []; 
		    for (var i = 0; i < array.length - 1; i++) {
		        for (var j = i; j < array.length - 1; j++) {
		            pairs.push([array[i], array[j + 1]]);
		        }
    		}
		    return pairs;
		}

		var pairs = getPairs(indices);
		console.log(pairs);

		d3.select(element)
			.append("g")
				.attr("id", "links" + gene)
				.attr("class", "links")
				.attr("transform", "translate(" +  center[0] + "," + center[1] + ")")
			.selectAll("path")
			.data(pairs)
			.enter()
			.append("path")
			.attr("d", (datum, i) => {

				console.log(datum);

				var start = linkPositionForVariantAtIndex(datum[0]);
				var destination = linkPositionForVariantAtIndex(datum[1]); 

				var controlPoint = controlPointForVariantsAtIndices(datum[0], datum[1]); 

				var d = ""; 
					d += "M " + start[0] + " " + start[1] + " ";
					// d += "L " + destination[0] + " " + destination[1] + " ";
					d += "Q " + controlPoint[0] + " " + controlPoint[1] + " " + destination[0] + " " + destination[1]; 

				// var d = "M 0 0 ";
				// 	d += "L 100 0 ";
				// 	d += "L 0 100 ";
				// 	d += "Z";

				// console.log(d);

				// var d="M10 10 H 90 V 90 H 10 L 10 10"

				return d;

			});

		function angleForVariantAtIndex(i) {

			var rotationScale = d3.scaleLinear()
				.domain([0, nVariants])
				.range([0, Math.PI * 2]); 

			return rotationScale(i);
		}

		function controlPointForVariantsAtIndices(iOne, iTwo) {

			var aOne = angleForVariantAtIndex(iOne);
			var aTwo = angleForVariantAtIndex(iTwo);

			var angle = (aOne + aTwo) / 2; 

			// var radius = 20; 
			// var apothem = Math.min(width, height) / 2; 
			var radius = 0.25 * Math.min(center[0], center[1]);

			return [radius * Math.cos(angle), radius * Math.sin(angle)]; 

		}

		function linkPositionForVariantAtIndex(i) {

			// var radius = 20; 
			// var apothem = Math.min(width, height) / 2; 
			var radius = 0.25 * Math.min(center[0], center[1]);

			var angle = angleForVariantAtIndex(i);

			return [radius * Math.cos(angle), radius * Math.sin(angle)];
		}

	}

	function getGenesForVariant(v) {

		if (v.core["Gene Symbol"].isMissing) {
			return []; 
		}

		//0. remove whitespace
		var val = v.core["Gene Symbol"].value; 
		var raw = val.replace(/\s/g, '');

		var noParentheticalText = ""; 
		//1. Get rid of "(includes others)" or any other text in parentheses
		var getTextInParentheses = /\(([^)]+)\)/;
		var tiP = getTextInParentheses.exec(raw); 

		if (tiP == null) { 
			noParentheticalText = raw; 
		} else { 
			tiP = tiP[0];

			var textBeforeParentheses = raw.substring(0, raw.indexOf(tiP));
			var textAfterParentheses = raw.substring(raw.indexOf(tiP) + tiP.length);
			noParentheticalText = textBeforeParentheses + textAfterParentheses; 
		}


		var split = ""; 
		var splitOn = ";"
		//2. Split
		split = noParentheticalText.split(splitOn);
		return split; 
	}

}