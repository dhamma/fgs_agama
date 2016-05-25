/* check if any hole in note group, and return number group*/
var fs=require("fs");
var lst=fs.readFileSync("xml/text.lst","utf8").split(/\r?\n/);

var batchcount=0;
var prev=0;
var processfile=function(fn) {
	var content=fs.readFileSync("xml/"+fn,"utf8");

	content.replace(/<note n="(.+?)\.(.+?)"/g,function(m,m1,m2){
		var n=parseInt(m2);
		if (n==1) {
			batchcount++;
		} else if (n!==prev+1) {
			if (n!==2)	console.log("hole in ",fn, " note",n);
		}
		prev=n;

	});
}
lst.forEach(processfile);
console.log("batch ",batchcount);