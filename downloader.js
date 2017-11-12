function downloadButtonClicked() { 

	console.log("downloadButtonClicked called");

}

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

function downloadDataAsXls(workbook){
	console.log('gendarme');
	var wopts = { bookType:'xlsx', bookSST:false, type:'binary' };

	var wbout = XLSX.write(workbook,wopts);
	/* the saveAs call downloads a file on the local machine */
	saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), "noahTest.xlsx");
}