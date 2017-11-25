//for editing the data while it is being visualized (delete variant, add notes etc)

$('#deleteVariant').on('click',function(e){
	deleteVariant()
})

function deleteVariant(){
	if(variantData[currentVariantIdx]['metadata']['workflow']["deleted"] == true){
		variantData[currentVariantIdx]['metadata']['workflow']["deleted"] = false
		renderDeleteButton(currentVariantIdx)
	}
	else{
		variantData[currentVariantIdx]['metadata']['workflow']["deleted"] = true
		renderDeleteButton(currentVariantIdx)
	}
	//TODO!! set this up to work with the delete variant button
}

$('#interactivePanel').on('input',function(e){
	//add error catching for undefined plz
    variantData[currentVariantIdx]['metadata']['workflow']['notes'] = document.getElementById("notesTextBox").value
});

var currentVariantIdx; //we define a global variable that keeps track of the variant idx we are on

function renderTextBox(idx){
	currentVariantIdx = idx; //update the global variable
	if(variantData[currentVariantIdx]['metadata']['workflow']['notes'] != 'notes'){
		document.getElementById("notesTextBox").value = variantData[currentVariantIdx]['metadata']['workflow']['notes']
	}
	else{
		document.getElementById("notesTextBox").value = "Please enter notes here"
	}
	//render the texbox appropriately to make the proper text appear
}

function renderDeleteButton(idx){
	currentVariantIdx = idx;
	console.log(idx)
	if(variantData[currentVariantIdx]['metadata']['workflow']["deleted"] == true){
		document.getElementById("deleteVariant").innerHTML = "undo delete variant"
	}
	else{
		document.getElementById("deleteVariant").innerHTML = "delete variant"
	}
}


