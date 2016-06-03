var iconv=require("iconv-lite");
var fs=require("fs");
var content=fs.readFileSync("html/1a000.htm");
var s=iconv.decode(content,'big5');
console.log(s)