var books=["sa1","sa2","sa3","sa4","ma1","ma2","ma3","ma4","da1","da2","ea1","ea2","ea3","ea4"];
var fs=require("fs");
var diff=function(note,ndef){
	var out=[];
	for (var i=0;i<note.length;i++) {
		if (ndef.indexOf(note[i])==-1) {
			out.push(note[i]);
		}
	}
	return out;
}
var processfile=function(fn){
	var book=fs.readFileSync(fn+".xml","utf8");
	var note=fs.readFileSync(fn+"r.xml","utf8");
	var notes=[],ndef=[];

	book.replace(/<note n="(.+?)"/g,function(m,m1){
		notes.push(m1);
	})
	note.replace(/<ndef n="(.+?)"/g,function(m,m1){
		ndef.push(m1);
	})

	if (notes.length!==ndef.length){
		console.log("note count not match",fn,notes.length,ndef.length);
		var dd=diff(notes,ndef);
		fs.writeFileSync(fn+"-missnote.txt",dd.join("\n"),"utf8");
	}

}

books.forEach(processfile);