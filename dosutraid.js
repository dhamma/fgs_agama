var fs=require("fs");
var lst=fs.readFileSync("xml/text.lst","utf8").split(/\r?\n/g);
var parseSid=function(sid) {
	return parseInt(sid.replace(/一/g,"1").replace(/二/g,"2")
		.replace(/三/g,"3").replace(/四/g,"4").replace(/五/g,"5").replace(/六/g,"6")
		.replace(/七/g,"7").replace(/八/g,"8").replace(/九/g,"9").replace(/○/g,"0"));
}

/* replace sutraid in xml*/
var regex_sutraid=/<b><font color="#800000">([一二三四五六七八九○].+)（([一二三四五六七八九○]+)）<\/font><\/b>/g
var regex_sutraid2=/<font color="#800000"><b> +([一二三四五六七八九○]+)（([一二三四五六七八九○]+)）<\/b><\/font>/g
var regex_sutraid3=/<font color="#800000">([一二三四五六七八九○]+)（([一二三四五六七八九○]+)）<\/font>/g

var snum=[];

var doSutraId=function(str){
	str=str.replace(regex_sutraid,function(m,m1,m2){
		var n1=parseSid(m1), n2=parseSid(m2);
		snum.push(n1+"\t"+n2);		
		return '<sid n="'+n1+'"/>';//+m1+'</sid><sid taisho="'+n2+'">'+m2+'</sid>';
	}).replace(regex_sutraid2,function(m,m1,m2){
		var n1=parseSid(m1), n2=parseSid(m2);
		snum.push(n1+"\t"+n2);		
		return '<sid n="'+n1+'"/>';//+m1+'</sid><sid taisho="'+n2+'">'+m2+'</sid>';
	}).replace(regex_sutraid3,function(m,m1,m2){
		var n1=parseSid(m1), n2=parseSid(m2);
		snum.push(n1+"\t"+n2);		
		return '<sid n="'+n1+'"/>';//+m1+'</sid><sid taisho="'+n2+'">'+m2+'</sid>';
	});

	str=str.replace(/<b><sid/g,"<sid").replace(/<\/sid><\/b>/g,"</sid>");
	return str;
}
var processfile=function(fn){
	var str=fs.readFileSync("xml/"+fn,"utf8");
	out=doSutraId(str);
	if (out!==str) {
		console.log(fn);
	}
}
lst.forEach(processfile)