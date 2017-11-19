function downloadButtonClicked() { 

	console.log("downloadButtonClicked called");

}

function s2ab(s) {

	var buf = new ArrayBuffer(s.length);
  	var view = new Uint8Array(buf);

  	for (var i=0; i!=s.length; ++i) {
  		view[i] = s.charCodeAt(i) & 0xFF;
 	}

 	return buf;
}

//parses our variant data construct and returns a set of headers and cell data
function convertVariantDataToWorkbook(vData) {

	if (typeof vData[0] == "undefined"){ //in case we call this function to early return
		console.log("issues");
		return; 
	}

	arr = []; 
	for(var i in vData) {

		row = {}; 

		for (var col in vData[i]["core"]) {
			row[col] = vData[i]["core"][col]["originalValue"] //should it be the variable original value
		}

		arr.push(row); 
	}

	var cols = []; //get the columns for the spreadsheet
	for (i in arr[0]) {
		cols.push(i); 
	}

	return [arr, cols];
}

function downloadDataAsXls(vData) {

	var wb = { 
		SheetNames : [], 
		Sheets : {} 
	};
	
	var dataForXls = convertVariantDataToWorkbook(vData);
	if (typeof dataForXls == "undefined") {
		console.log("unable to download");
		return;
	}

	//prepare for xls, then write with boilerplate
	var cells = dataForXls[0];
	var cols = dataForXls[1];

	console.log(cells);

	wb.SheetNames.push("Sheet1");

	var ws = XLSX.utils.json_to_sheet(cells, {header : cols});

	wb["Sheets"]["Sheet1"] = ws; 

	var wopts = { bookType : "xlsx", bookSST : false, type : "binary" };
	var wbout = XLSX.write(wb,wopts);
	
	// the saveAs call downloads a file on the local machine 
	saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), "noahTest.xlsx");
}