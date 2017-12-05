//for editing the data while it is being visualized (delete variant, add notes etc)
function renderTools(data, index) {

	//text box
	renderTextBox(data, index);
	$("#notesTetBox").on("input", function() { 

		var text = $(this).val();
		variantData[index].metadata.workfow.notes = text; 
		renderTextBox(data, index);

	});


	//delete button
	renderDeleteButton(false);

	//download button
	$("#tools")
		.append("<a id='downloadLink' class='btn btn-primary'>DOWNLOAD SHEET</a>"); 

}


function deleteVariant(index) {

	var isDeleted = variantData[index].metadata.workflow.deleted; 

	variantData[index].metadata.workflow.deleted = !isDeleted;

	renderDeleteButton(!isDeleted);
}

function renderDeleteButton(isDeleted) {

	var text = isDeleted ? "UNDELTE THIS VARIANT" : "DELETE THIS VARIANT";

	$("#tools").remove(); 
	$("#tools")
		.append("<a id='deleteLink' class='btn btn-primary'>" + text + "</button>");

	$("#deleteLink").on("click", () => deleteVariant(index)); 

}

function renderTextBox(data, index) {

	var text = data[index].metadata.workflow.notes; 

	var element = ""; 

	if (!text) { //"" is falsy--no notes
		element = "<form><input type='text' placeholder='Enter notes...' id='notesTextBox'></form>"; 
	} else { 
		element = "<form><input type='text' id='notesTextBox'>" + text + "</form>"; 
	}

	$("#tools").remove(); 
	$("#tools")
		.append(element); 

}