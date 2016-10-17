//var fetch = require("fetch");
//var select = require('soupselect').select;
//// dom provided by htmlparser...
//// select(dom, "#main a.article").forEach(function(element) {//...});
//var parse = require("query-dom").parse;
//var dom;
//fetch.fetchUrl("http://www.stadtrevue.de/tageskalender/tageskalender-results/", function(error, meta,body) {
   //dom = parse(body.toString());
   //console.log(dom);
   //console.log(select(dom,"a"));//.forEach(function(element){ console.log(element.toString());});
//});

var jsdom = require("jsdom");
jsdom.env(
  "http://www.stadtrevue.de/tageskalender/tksuche/",
    //"http://www.stadtrevue.de/tageskalender/tageskalender-results/",
   ["http://code.jquery.com/jquery.js"],
    function (err, window) {
            window.$(".tx-srtk-pi1-listrow > .tx-srtk-pi1-listrowField-text").map(function(e, a){
              console.log(a.textContent);
            })
       });
console.log("ready");
