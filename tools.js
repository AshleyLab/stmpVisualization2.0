//for editing the data while it is being visualized (delete variant, add notes etc)
function renderTools(data, index) {

	console.log(arguments);

	// //text box
	renderTextBox(data, index);
	$("#notesTextBox").on("input", function() { 

		var text = $(this).val();
		variantData[index].metadata.workfow.notes = text; 
		renderTextBox(data, index);

	});

	//delete button
	renderDeleteButton(index, false);

	//download button
	$("#tools")
		.append("<a id='downloadLink' class='btn btn-primary'>DOWNLOAD SHEET</a>"); 

	$("#downloadLink").on("click", function() { 
		console.log("button clicked");
		downloadButtonClicked();
	});

}


function deleteVariant(index) {

	var isDeleted = variantData[index].metadata.workflow.deleted; 

	variantData[index].metadata.workflow.deleted = !isDeleted;

	renderDeleteButton(index, !isDeleted);
}

function renderDeleteButton(index, isDeleted) {

	var text = isDeleted ? "UNDELETE THIS VARIANT" : "DELETE THIS VARIANT";

	if ($("#deleteLink").length == 0) {  //doesn't exist

		$("#tools")
			.append("<a id='deleteLink' class='btn btn-primary'>" + text + "</button>");
		$("#deleteLink").on("click", () => { console.log("clicked"); deleteVariant(index)}); 

	} else { //exists, just update

		$("#deleteLink").text(text);

	}

}

function renderTextBox(data, index) {

	var text = data[index].metadata.workflow.notes; 

	var element = ""; 

	if (!text) { //"" is falsy--no notes
		element = "<form><input type='text' placeholder='Enter notes...' id='notesTextBox'></form>"; 
	} else { 
		element = "<form><input type='text' id='notesTextBox'>" + text + "</form>"; 
	}

	$("#notesTextBox").remove(); 
	$("#tools")
		.append(element); 

}