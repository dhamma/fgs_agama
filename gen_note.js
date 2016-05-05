var iconv=require("iconv-lite");
var fs=require("fs");
var lst=fs.readFileSync("note.lst","utf8").split(/\r?\n/);
var count=0;
var max=0; //set to 0 for all files
var writeToDisk=true;

var replaceEntity=function(str) {
	return str.replace(/&#(\d+);/g,function(m,m1){
		var n=parseInt(m1);
		if (isNaN(n)) {
			throw "cannot parse "+m1;
		}
		return String.fromCharCode(parseInt(m1));
	})
}

var replaces=[
	[/&ntilde;/g,"ñ"],
	[/&quot;/g,'"'],
	[/&icirc;/g,"î"],
	[/&Ntilde/g,"Ñ"],
	[/&acirc;/g,"â"],
	[/&lt;1&gt;/g,"1."],
	[/&lt;2&gt;/g,"2."],
	[/&lt;3&gt;/g,"3."],
  [/\nmso-bidi-language:AR-SA">j<\/span>/g,'>\nṃ']
];
var getBody=function(str,fn){

	var at=str.indexOf('<p style="line-height: 150%">'); 
	if (at<0) {
		console.error("cannot find start",fn);
		throw fn;
	}
	str=str.substr(at+29);	

	var at=str.lastIndexOf('</p>');


	if (at<0) {
		console.error("cannot find end",fn);
		throw fn;
	}

	str=str.substring(0,at);
	return str;
}


var fixHoles_2016_5_5=function(content,fn){ //found by checknote.js
	var files=["1a016r","1a032r","1d009r"]
	if (files.indexOf(fn)==-1) return content;

	if (fn==="1a016r") {
		content=content.replace(/\((10\d)\)/g,function(m,m1){
			return '\n<ndef n="'+m1+'"/>';
		});
	} else if (fn==="1a032r") {
		content=content.replace("(100)",function(m){
			return '\n<ndef n="100"/>';
		});
	} else if (fn==="1d009r") {
		content=content.replace("(115)",function(m,m1){
			return '\n<ndef n="115"/>';
		});
	}
	return content;
}

var processfile=function(fn){
	if (max && count>max) return;
	count++;

	var out="",filename=fn.substr(0,fn.length-4);
	var content=fs.readFileSync("html/"+fn);
	var str=iconv.decode(content,'big5').replace(/\r?\n/g,"\n");
	var targetfn=fn.toLowerCase();

	targetfn=filename+".xml";

	str=getBody(str,filename);
	str=replaceEntity(str);

	for (var i in replaces) {
		str=str.replace(replaces[i][0],replaces[i][1]);
	}

	str=str.replace(/\(<A NAME=\d+>(\d+)<\/A>\)/g,function(m,m1){

		return '{{ndef n="'+m1+'"/}}';
	});

	str=str.replace(/\n/g,"");
	str=str.replace(/<.+?>/g,"");
	str=str.replace(/&nbsp;/g," ");
	str=str.replace(/ +/g," ");

	str=str.replace(/\{\{(.+?)\}\}/g,function(m,m1){
		return "\n<"+m1+">";
	})

	str=str.replace(/\*\n<ndef n="(.+?)"/g,function(m,m1){
		return '\n<ndef n="'+m1+'" star="1"';
	});
	str=str.trim();
	out=fixHoles_2016_5_5(str,filename);
	console.log(targetfn)
	if (writeToDisk) fs.writeFileSync("xml_note/"+targetfn,out,"utf8");
}

lst.forEach(processfile);
console.log("total files",lst.length)