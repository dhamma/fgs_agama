var iconv=require("iconv-lite");
var fs=require("fs");
var lst=fs.readFileSync("text.lst","utf8").split(/\r?\n/);
var count=0;
var max=0; //set to 0 for all files
var writeToDisk=false;

var getBody=function(str,fn){

	if (fn==="1b042") {
		var at=str.indexOf('0" bordercolordark="#800000">'); 
	} else {
		var at=str.indexOf('<p style="line-height: 150%">');
	}
	if (at<0) {
		console.error("cannot find start",fn);
		throw fn;
	}
	str=str.substr(at+29);	

	if (fn==="1b042" || fn==="1d008") {
		var at=str.lastIndexOf('</td>');
	} else {
		var at=str.lastIndexOf('</p>');	
	}
	

	if (at<0) {
		console.error("cannot find end",fn);
		throw fn;
	}

	str=str.substring(0,at);
	return str;
}

var cleanups=[
/<p style="line-height: 150%">/g,
/mso-font-kerning:1.0pt;mso-ansi-language:EN-US;mso-fareast-language:ZH-TW;\n?/g,
/mso-hansi-font-family:&quot;Times New Roman&quot;;mso-bidi-font-family:&quot;Times New Roman&quot;;\n?/g,
/<span style="font-size:12\.0pt;font-family:新細明體\n?/g
]

var regex_nonbig5= /<span style="font-size: 12.0pt; font-family: 新細明體; mso-hansi-font-family: Foreign1; mso-bidi-font-family: Times New Roman; mso-font-kerning: 1.0pt; mso-ansi-language: EN-US; mso-fareast-language: ZH-TW; mso-bidi-language: AR-SA">&#(\d+);<\/span>/g ;
var regex_nonbig52=/<span style="font-size: 12.0pt; font-family: 新細明體; mso-hansi-font-family: Times New Roman; mso-bidi-font-family: Times New Roman; mso-font-kerning: 1.0pt; mso-ansi-language: EN-US; mso-fareast-language: ZH-TW; mso-bidi-language: AR-SA; background-color: #FFFFFF">&#(\d+);<\/span>/g ;
var regex_nonbig53=/<span style="font-size: 12.0pt; font-family: 新細明體; mso-hansi-font-family: Times New Roman; mso-bidi-font-family: Times New Roman; mso-font-kerning: 1.0pt; mso-ansi-language: EN-US; mso-fareast-language: ZH-TW; mso-bidi-language: AR-SA">&#(\d+);<\/span>/g ;
var regex_nonbig54=/<span style="font-size: 12.0pt; font-family: 新細明體; mso-hansi-font-family: Foreign1; mso-bidi-font-family: Times New Roman; mso-font-kerning: 1.0pt; mso-ansi-language: EN-US; mso-fareast-language: ZH-TW; mso-bidi-language: AR-SA; background-color: #FFFFFF">&#(\d+);<\/span>/g ;
var regex_nonbig55=/mso-bidi-language:AR-SA">&#(\d+);<\/span>/g;
var doNonBig5=function(str){
	return str.replace(regex_nonbig5,function(m,m1){
		//console.log(m1,String.fromCharCode(parseInt(m1)));
		return String.fromCharCode(parseInt(m1));
	}).replace(regex_nonbig52,function(m,m1){
		return String.fromCharCode(parseInt(m1));
	}).replace(regex_nonbig53,function(m,m1){
		return String.fromCharCode(parseInt(m1));
	}).replace(regex_nonbig54,function(m,m1){
		return String.fromCharCode(parseInt(m1));
	}).replace(regex_nonbig55,function(m,m1){
		return String.fromCharCode(parseInt(m1));
	});

}

var regex_note='\\(<A HREF=http://dblink.ncl.edu.tw/buddha/^folder/^filenamer_(\\d+)\\.htm#(\\d+) TARGET=_blank>(\\d+)\\)</A>';
var doNote=function(str,regex,prefix){
	return str.replace(regex,function(m,m1,m2,m3){
		if (m1!==m2||m2!==m3) {
			throw "invalid note";
		}
		return '<note n="'+prefix+"."+m1+'"/>';1
	});
}

var parseSid=function(sid) {
	return parseInt(sid.replace(/一/g,"1").replace(/二/g,"2")
		.replace(/三/g,"3").replace(/四/g,"4").replace(/五/g,"5").replace(/六/g,"6")
		.replace(/七/g,"7").replace(/八/g,"8").replace(/九/g,"9").replace(/○/g,"0"));
}
var regex_sutraid=/<b><font color="#800000">([一二三四五六七八九○].+)（([一二三四五六七八九○]+)）<\/font><\/b>/g
var regex_sutraid2=/<font color="#800000"><b>([一二三四五六七八九○]+)（([一二三四五六七八九○]+)）<\/b><\/font>/g
var regex_sutraid3=/<font color="#800000">([一二三四五六七八九○]+)（([一二三四五六七八九○]+)）<\/font>/g

var doSutraId=function(str){
	str=str.replace(regex_sutraid,function(m,m1,m2){
		return '<sid fgs="'+parseSid(m1)+'">'+m1+'</sid><sid taisho="'+parseSid(m2)+'">'+m2+'</sid>';
	}).replace(regex_sutraid2,function(m,m1,m2){
		return '<sid fgs="'+parseSid(m1)+'">'+m1+'</sid><sid taisho="'+parseSid(m2)+'">'+m2+'</sid>';
	}).replace(regex_sutraid3,function(m,m1,m2){
		return '<sid fgs="'+parseSid(m1)+'">'+m1+'</sid><sid taisho="'+parseSid(m2)+'">'+m2+'</sid>';
	});

	str=str.replace(/<b><sid/g,"<sid").replace(/<\/sid><\/b>/g,"</sid>");
	return str;
}
var Agama={a:"s",b:"m",c:"d",d:"e"};
var invalidnotefilecount=0;
var getNoteFilename=function(fn){
	var notefn=fn.replace(/-\d/,"");
	var folder=fn.substr(0,2);
	if (folder=="1d" || folder=="1b") {
		notefn=folder+"\\d\\d\\d";
	}
	return notefn;
}

var processfile=function(fn){
	if (max && count>max) return;
	count++;


	var out="",filename=fn.substr(0,fn.length-4);
	var content=fs.readFileSync("html/"+fn);
	var str=iconv.decode(content,'big5').replace(/\r?\n/g,"\n");
	var targetfn=fn.toLowerCase();
	var juan=parseInt(filename.substr(2));
	var agama=Agama[filename[1]];

	targetfn=filename+".xml";

	str=getBody(str,filename);
	str=doNonBig5(str);

	var notefn=getNoteFilename(filename);
	var reg=regex_note.replace("^folder",fn.substr(0,2)).replace("^filename",notefn);

	str=doNote(str,new RegExp(reg,"g"),agama+juan);

	if (agama=="s") {
		str=doSutraId(str);
	}
	for (var i=0;i<cleanups.length;i++) {
		str=str.replace(cleanups[i],"");
	}

	str=str.replace(/&nbsp;/g," ");
	str=str.replace(/ +/g," ").replace(/\n/g,"");
	str=str.replace(/<br>/g,"\n");
	str=str.replace(/\n +/g,"\n");
	str=str.replace(/\n　+/g,"\n");

	out=str;
	if (str.indexOf("<A HREF=")>-1) {
		console.log(targetfn, "has invalid note");
		invalidnotefilecount++;
	} else {
		//console.log("writing",targetfn);	
	}
	
	if (writeToDisk) fs.writeFileSync("xml/"+targetfn,out,"utf8");
};
lst.forEach(processfile);
console.log("total files",lst.length)
console.log(invalidnotefilecount," files has invalid note");