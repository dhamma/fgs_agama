/* check if any hole in note group, and return number group*/
var fs=require("fs");
var lst=fs.readFileSync("xml_lb/file.lst","utf8").split(/\r?\n/);

var batchcount=0,totalnotecount=0,totalndefcount=0;
var prev=0;
var processfile=function(fn) {
	var notefn=fn.replace(".txt","r.xml");

	var notecount=0,ndefcount=0;
	
	var content=fs.readFileSync("xml_lb/"+fn,"utf8");
	content.replace(/#[aepsmnd0-9.]+/g,function(m,m1){
		notecount++;totalnotecount++;
	});

	notecontent=fs.readFileSync("bybook/"+notefn,"utf8");
	notecontent.replace(/<ndef n="(.+?)"/g,function(m,m1){
		ndefcount++;totalndefcount++;
	});

	console.log(fn,"footnote",notecount,"ndef",ndefcount,ndefcount-notecount);

}
lst.forEach(processfile);
console.log("total note",totalnotecount,"total ndef",totalndefcount);
/*
hole in  1a016r.xml  note 103
hole in  1a016r.xml  note 105
hole in  1a032r.xml  note 101
hole in  1d009r.xml  note 116

wrong markup in html, fixed with gen_note.js fixHoles_2016_5_5
*/