/* note id reset by page number*/
var fs=require("fs");
var sourcepath="xml_lb/";
var targetpath="out/";
var lst=fs.readFileSync(sourcepath+"file.lst","utf8").split(/\r?\n/);
var getnotefn=function(fn){
	var notefn=fn.replace(".txt","r.xml");
	return notefn;
}
var loadnote=function(fn){
	var notefn=getnotefn(fn);
	var content=fs.readFileSync(sourcepath+notefn,"utf8");
	var out={};
	content=content.replace(/<ndef n="(.*?)" star="1"\/>/g,function(m,m1){
		return "#"+m1+"*";
	});

	content=content.replace(/<ndef n="(.*?)"\/>/g,function(m,m1){
		return "#"+m1;
	});

	var previd="",previdx,prevstar;
	content.replace(/(#[demps.0-9]+)(\*?)/g,function(m,id,star,idx){
		if (previd) {
			out[previd]={note:content.substring(previdx,idx).trim()};
			if (prevstar) out[previd].star=true;
		}
		star=star||"";
		prevstar=star;
		previdx=idx+id.length+star.length;
		previd= id.substr(1);
	})
	out[previd]={note:content.substr(previd)};
	if (prevstar) out[previd].star=true;

	return out;
}
var processfile=function(fn){
//	var note=loadnote(fn);

	var content=fs.readFileSync(sourcepath+fn,"utf8");
	var agama=fn.substr(0,1);
	var page="",seq=0,notecount=0,prevgroup;
	content=content.replace(/([~#])([demps.0-9]+)/g,function(m,type,id){
		if (type=="#") {
			seq++;
			notecount++;
			var at=id.indexOf(".");
			var group=id.substr(1,at-1);
			var first=parseInt(id.substr(at+1));

			if (group!=prevgroup && first!==1){
				console.log(fn,"note not start from 1,group",group)
			}
			prevgroup=group;
			var newid=page+"."+seq;
			return type+newid;
		} else {
			page=agama+id;
			seq=0;
			return type+agama+id;
		}
	});
	if (agama=="s"){
		content=content.replace(/\^(\d)/g,function(m,m1){
			return "^"+agama+m1;
		});		
	}
	console.log("write to "+targetpath+fn,"note count",notecount);
	fs.writeFileSync(targetpath+fn,content,"utf8");

/*
	var notefn=getnotefn(fn);
	fs.writeFileSync(targetpath+notefn.replace(".xml",".json")
		,JSON.stringify(note,""," "),"utf8");	
*/
}
lst.forEach(processfile);