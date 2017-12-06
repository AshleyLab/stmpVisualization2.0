//for editing the data while it is being visualized (delete variant, add notes etc)
function renderTools(data, index) {

	console.log(arguments);

	// //text box
	renderTextBox(data, index);

	//delete button
	renderDeleteButton(data, index, data[index].metadata.workflow.deleted);

	//download button
	$("#tools")
		.append("<a id='downloadLink' class='btn btn-primary'>DOWNLOAD SHEET</a>"); 

	$("#downloadLink").on("click", function() { 
		console.log("button clicked");
		downloadButtonClicked();
	});

}


function deleteVariant(data, index) {

	var isDeleted = variantData[index].metadata.workflow.deleted; 

	variantData[index].metadata.workflow.deleted = !isDeleted;

	renderComponents(data, index);
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

	var text = data[index].metadata.workflow.notes; 
	var includePlaceholder = !text; //"" is falsy—-placedholder appears if no notes

	console.log("text: " + text);
	console.log("includePlaceholder: " + includePlaceholder);

	if ($("#notesTextBox").length == 0) { //elements doesn't exist

		console.log("doesn't exist");

		var placeholder = includePlaceholder ? "placeholder='Enter notes...' " : ""; 

		$("#tools")
			.append("<form><input type='text' " + placeholder + "id='notesTextBox'></form>");

		$("#notesTextBox").val(text);

	} else { 

		console.log("exists");

		//stackoverflow.com/questions/1318076/jquery-hasattr-checking-to-see-if-there-is-an-attribute-on-an-element
		var placeholderAttribute = $("#notesTextBox").attr("placeholder");
		var hasPlaceholder = typeof placeholderAttribute !== typeof undefined && placeholderAttribute !== false; 

		console.log("hasPlaceholder: " + hasPlaceholder);

		if (!hasPlaceholder && includePlaceholder) {
			console.log("adding placeholder");
			$("#notesTextBox")	
				.attr("placeholder", "Enter notes...");
		} else if (hasPlaceholder && !includePlaceholder) {
			console.log("removing placeholder");
			$("#notesTextBox")
				.removeAttr("placeholder"); 

			$("#notesTextBox")
				.val(text);

			console.log("setting notesTextBox to " + text);
		}

	}

	$("#notesTextBox").off(); //remove old event bindings

	$("#notesTextBox").on("input", function() { 

		console.log("input");

		var text = $(this).val();
		variantData[index].metadata.workflow.notes = text; 
		renderTextBox(data, index);

	});

}