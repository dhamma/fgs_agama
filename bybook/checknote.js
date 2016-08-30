/*
	SA, DA 腳注已對齊，這個檔會產生 有ndef 但無對應note 的檔案，
	如果要產生有note無ndef (情況較少) ，只要對調傳入 diff 的參數即可。

	本文轉換時漏轉了 經題(某經某卷某譯) 內的 note 標記

	EA, MA 腳注號對不上(本文和腳注分法不同)，必頁分完頁碼後再處理。
	

	先找出 ma , ea 中 note 的跳號 (ndef 不太可以跳號)
	將跳號補齊，再將注號 以頁分群。
*/

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
		var dd=diff(ndef,notes);
		if (dd.length) fs.writeFileSync(fn+"-missnote.txt",dd.join("\n"),"utf8");
		//fs.writeFileSync(fn+'-ndef.txt',ndef.join("\n"),'utf8');
		//fs.writeFileSync(fn+'-note.txt',notes.join("\n"),'utf8');
	}

}

books.forEach(processfile);