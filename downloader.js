function downloadButtonClicked() { 

	console.log("downloadButtonClicked called");
	console.log(window.variantData);
	downloadData();

}

function downloadData() {

	var data = window.variantData;

	var wb = { 
		SheetNames : [], 
		Sheets : {} 
	};
	
	var dataAsWorkbook = convertVariantDataToWorkbook(data);

	//prepare for xls, then write with boilerplate
	var cells = dataAsWorkbook[0];
	var columns = dataAsWorkbook[1];

	console.log(columns);
	console.log(cells);

	wb.SheetNames.push("Sheet1");

	var ws = XLSX.utils.json_to_sheet(cells, {header : columns});

	wb["Sheets"]["Sheet1"] = ws; 

	var wopts = { bookType : "xlsx", bookSST : false, type : "binary" };
	var wbout = XLSX.write(wb, wopts);

	//create new file name
	var filename = window.variantFilename; 
	var base = filename.substring(0, filename.indexOf("."));
	var extension = filename.substring(filename.indexOf("."));
	var infix = "-edited";

	// the saveAs call downloads a file on the local machine 
	saveAs(new Blob([s2ab(wbout)], {type : "application/octet-stream"}), base + infix + extension);
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
function convertVariantDataToWorkbook(data) {

	var flags = getFlagset(data);
	console.log(flags);

	var arr = []; 

	for (var i in data) {

		var row = {}; 

		for (var col in data[i].core) {
			row[col] = data[i].core[col].originalValue;
		}

		//notes
		row.notes = data[i].metadata.notes; 

		//flags
		$.each(flags, (_, flag) => {

			row[flag] = data[i].metadata.flags.indexOf(flag) > -1 ? "Y" : "N";
			console.log(row);

		});

		//TODO find a way to gray out deleted rows
		if (data[i].metadata.deleted) {

			row.curationStatus = "deleted";

		} else {

			row.curationStatus = "not deleted";
		}
		
		arr.push(row);
	}

	var columns = []; 

	for (i in arr[0]) {
		columns.push(i); 
	}

	return [arr, columns];
}

function getFlagset(data) {

	return $.map(data, (d, _) => { //get tags all variants have

		return d.metadata.flags;

	}).filter((f, i, list) => { //remove duplicates

		return list.indexOf(f) == i; 

	}); 

}
