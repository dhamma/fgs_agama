/* check if any hole in note group, and return number group*/
var fs=require("fs");
var lst=fs.readFileSync("xml_note/note.lst","utf8").split(/\r?\n/);

var batchcount=0;
var prev=0;
var processfile=function(fn) {
	var content=fs.readFileSync("xml_note/"+fn,"utf8");

	content.replace(/<ndef n="(.+?)"/g,function(m,m1){
		var n=parseInt(m1);
		if (n==1) {
			batchcount++;
		} else if (n!==prev+1) {
			console.log("hole in ",fn, " note",n);
		}
		prev=n;

	});
}
lst.forEach(processfile);
console.log("batch ",batchcount);
/*
hole in  1a016r.xml  note 103
hole in  1a016r.xml  note 105
hole in  1a032r.xml  note 101
hole in  1d009r.xml  note 116

wrong markup in html, fixed with gen_note.js fixHoles_2016_5_5
*