function renderTools(element) {

	//for editing the data while it is being visualized (delete variant, add notes etc)
	var data = window.variantData; 
	var index = window.variantIndex; 

	console.log(arguments);

	//delete all old stuff
	$("#tools").empty();

	//checkboxes for flags
	var flags = ["GUS","Check RNAseq","MOSC"];
	renderCheckboxes(flags, true);

	//text box
	renderTextBox(data, index);

	//delete button
	renderDeleteButton(data, index, data[index].metadata.deleted);

	//download button
	$("#tools")
		.append("<a id='downloadLink' class='btn btn-primary'>DOWNLOAD SHEET</a>"); 

	$("#downloadLink").on("click", function() { 
		console.log("button clicked");
		downloadButtonClicked();
	});


}

function renderCheckboxes(flags, includeCustom) {

	var hasFlags = window.variantData[window.variantIndex].metadata.flags;
	console.log(hasFlags); 
	var name = "flags";

	var checkboxes = $.each(flags, (i, flag) => {

		var checked = $.inArray(flag, hasFlags) !== -1 ? "checked " : ""

		var checkbox = "<input class='flag' type='checkbox' name='" + name + "' value='" + flag + "' " + checked + "/> " + flag + " ";
		$("#tools").append(checkbox);

	}); 

	$("input.flag").on("click", function() { 

		var flag = $(this).val(); 
		toggleFlag(flag);

	});

	if (includeCustom) {

		var placeholder = "FlagD,FlagE,FlagF";
		var customInput = "<input type='text' id='customFlag' placeholder='" + placeholder + "' />"; 

		$("#tools").append(customInput);
	}

	// $("#tools").append()
}

function toggleFlag(flag) {

	var flags = window.variantData[window.variantIndex].metadata.flags;

	var hasFlag = $.inArray(flag, flags) !== -1; 

	if (hasFlag) { //remove flag

		var index = flags.indexOf(flag);
		window.variantData[window.variantIndex].metadata.flags.splice(index, 1);

	} else { //add it

		window.variantData[window.variantIndex].metadata.flags.push(flag);

	}

	console.log(window.variantData);

}

function deleteVariant(data, index) {

	console.log("deleting variant at " + index); 
	console.log(data); 

	var isDeleted = variantData[index].metadata.deleted; 

	variantData[index].metadata.deleted = !isDeleted;

	//if rerender spiralgram, hover events will be trigger in loop

	if (!isDeleted) {
		d3.select("g[variant-index='" + index +"']")
			.classed("deleted", true);
	} else { 
		d3.select("g[variant-index='" + index +"']")
			.classed("deleted", false);
	}


	// renderComponents(variantData, index);
}

function renderDeleteButton(data, index, isDeleted) {

	var text = isDeleted ? "UNDELETE THIS VARIANT" : "DELETE THIS VARIANT";

	if ($("#deleteLink").length == 0) {  //doesn't exist

		$("#tools")
			.append("<a id='deleteLink' class='btn btn-primary'>" + text + "</button>");
		$("#deleteLink").on("click", () => deleteVariant(data, index)); 

	} else { //exists, just update

		$("#deleteLink").text(text);

	}

}

function renderTextBox(data, index) {

	var text = data[index].metadata.notes; 
	var includePlaceholder = !text; //"" is falsy—-placedholder appears if no notes

	// console.log("text: " + text);
	// console.log("includePlaceholder: " + includePlaceholder);

	if ($("#notesTextBox").length == 0) { //elements doesn't exist

		// console.log("doesn't exist");

		var placeholder = includePlaceholder ? "placeholder='Enter notes...' " : ""; 

		$("#tools")
			.append("<form><textarea " + placeholder + "id='notesTextBox'></textarea></form>");

		$("#notesTextBox").val(text);

	} else { 

		// console.log("exists");

		//stackoverflow.com/questions/1318076/jquery-hasattr-checking-to-see-if-there-is-an-attribute-on-an-element
		var placeholderAttribute = $("#notesTextBox").attr("placeholder");
		var hasPlaceholder = typeof placeholderAttribute !== typeof undefined && placeholderAttribute !== false; 

		// console.log("hasPlaceholder: " + hasPlaceholder);

		if (!hasPlaceholder && includePlaceholder) {

			// console.log("adding placeholder");
			$("#notesTextBox")	
				.attr("placeholder", "Enter notes...");

		} else if (hasPlaceholder && !includePlaceholder) {

			console.log("removing placeholder");
			$("#notesTextBox")
				.removeAttr("placeholder"); 

			$("#notesTextBox")
				.val(text);

			// console.log("setting notesTextBox to " + text);
		}

	}

	$("#notesTextBox").off(); //remove old event bindings

	$("#notesTextBox").on("input", function() { 

		console.log("input");

		var text = $(this).val();
		variantData[index].metadata.notes = text; 
		renderTextBox(data, index);

	});

}