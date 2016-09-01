/* note id reset by page number*/
var fs=require("fs");
var sourcepath="xml_lb/";
var notepath="bybook/";
var targetpath="out/";
var lst=fs.readFileSync(sourcepath+"file.lst","utf8").split(/\r?\n/);
var totalnotecount=0;
var getnotefn=function(fn){
	var notefn=fn.replace(".txt","r.xml");
	return notefn;
}
var loadnote=function(fn){
	var notefn=getnotefn(fn);
	var content=fs.readFileSync(notepath+notefn,"utf8");
	var out=[];
	content=content.replace(/<ndef n="(.*?)" star="1"\/>/g,function(m,m1){
		return "#"+m1+"*";
	});

	content=content.replace(/<ndef n="(.*?)"\/>/g,function(m,m1){
		return "#"+m1;
	});

	var previd="",previdx,prevstar;
	content.replace(/(#[demps.0-9]+)(\*?)/g,function(m,id,star,idx){
		if (previd) {
			out.push(["",content.substring(previdx,idx).trim(),prevstar?"*":""]);
		}
		star=star||"";
		prevstar=star;
		previdx=idx+id.length+star.length;
		previd= id.substr(1);
	})
	out.push(["",content.substring(previdx).trim(),prevstar?"*":""]);

	return out;
}
var d1workaround=function(page,notecount){
	if (notecount==0){
		return "d1p";
	} else if (notecount==6) {
		return "d2p";
	}
	else return page;
}
var processfile=function(fn){
	var note=loadnote(fn);

	var content=fs.readFileSync(sourcepath+fn,"utf8");
	var agama=fn.substr(0,1);
	var pbid=0,prevpage=0,seq=0,prevoldseq=0,notecount=0,prevgroup;
	content=content.replace(/([~#%])([ademps.0-9]+)/g,function(m,type,id){
		if (type=="#") {
			var at=id.indexOf(".");
			var group=id.substr(1,at-1);
			var oldseq=parseInt(id.substr(at+1));

			if (group!=prevgroup && (oldseq!==1 && oldseq!==prevoldseq+1)){ //GAP CROSSING GROUP
				console.log(fn,id,"note seq problem,group",group,"previous group",prevgroup,"prev seq",prevoldseq,"seq",oldseq);
			}
			if (group==prevgroup && oldseq<prevoldseq){ //GAP IN SAME GROUP
				console.log(fn,id,"note seq problem,group",group,"previous group",prevgroup,"prev seq",prevoldseq,"seq",oldseq);
			}
			if (group==prevgroup && oldseq!==prevoldseq+1){ //GAP IN SAME GROUP
				console.log(fn,id,"note seq problem,group",group,"previous group",prevgroup,"prev seq",prevoldseq,"seq",oldseq);
			}			
			prevgroup=group;
			prevoldseq=oldseq;
			seq++;
			var newid=pbid+"."+seq;
			if (!note[notecount]){
				console.log("too many note",notecount,fn)
			} else {
				note[notecount][0]=type+newid;	
			}
			
			notecount++;totalnotecount++;

			return type+newid;
		} else if (type=="%") {//juan
			//a new juan start, 
			if (seq) {

			}
			seq=0;
			return type+id;
		} else if (type=="~"){//pb
			id=parseInt(id);
			pbid=agama+id;
			if (prevpage!==id && (id%2==0)){//even page reset footnote seq
				seq=0;
			}
			prevpage=id;
			/*TODO workaround for DA1 preface*/
			if (fn=="da1.txt") {
				pbid=d1workaround(pbid,notecount);
				prevpbid=pbid;
			}
			return type+pbid;
		}
	});
	if (agama=="s"){
		content=content.replace(/\^(\d)/g,function(m,m1){
			return "^"+agama+m1;
		});		
	}

	if (notecount!=note.length) {
		console.log("Remaining",note.length-notecount,"foot note",fn)
	}
	console.log("write to "+targetpath+fn,"note count",notecount);
	fs.writeFileSync(targetpath+fn,content,"utf8");


	var notefn=getnotefn(fn);
	note=note.map(function(n){return n.join("\t")})
	fs.writeFileSync(targetpath+notefn.replace(".xml",".json")
		,JSON.stringify(note,""," "),"utf8");	
}
lst.forEach(processfile);
console.log("notecount",totalnotecount);