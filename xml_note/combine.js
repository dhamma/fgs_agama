/* combine byjuan xml to bybook xml*/
var fs=require("fs");
var lst=fs.readFileSync("./file.lst","utf8").split(/\r?\n/);

var lastoutputfn="";
var out="";
var processfile=function(fn) {
	if (fn[0]=="#") {
		if (lastoutputfn) {
			console.log("writing",lastoutputfn);
			fs.writeFileSync(lastoutputfn,out,"utf8");
			out="";
		}
		lastoutputfn=fn.substr(1);
		return;
	}

	var content=fs.readFileSync(fn,"utf8").replace(/\r?\n/g,"\n");
	var prefix=fn.substr(2).replace("r.xml","");
	prefix=lastoutputfn[0]+prefix.replace(/^0+/g,"")+".";
	content=content.replace(/ndef n="(.+)"/g,function(m,m1){
		return 'ndef n="'+m1.replace(/^0+/,"")+'"';//remove leading 0
	});
	content=content.replace(/ndef n="/g,'ndef n="'+prefix);

	if (content[content.length-1]!=="\n") content+="\n";

	out+=content;
}
lst.forEach(processfile);
console.log("writing",lastoutputfn);

fs.writeFileSync(lastoutputfn,out,"utf8");
