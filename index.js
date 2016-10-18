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
var moment = require("moment");
var myday = moment();
var eventList = [];
var object = {};
var CAT = "konzerte";
var dayOfMonth = 32;
    //"http://www.stadtrevue.de/tageskalender/tageskalender-results/",
var fetchPage = function(counter, url) {
  jsdom.env(
    url+CAT+myday.format("/YYYY/MM/DD/"),
    ["http://code.jquery.com/jquery.js"],
    function (err, window) {
      var root = window.$(".tx-srtk-pi1-listrow");
      root.children().map(function(number, item) {
        var cat = item.classList["0"];
        /*              if(cat && (cat.endsWith("name")
          || cat.endsWith("rubric")
            || cat.endsWith("date")
              || cat.endsWith("time")
                || cat.endsWith("title")
                  || cat.endsWith("text")) ){
                  console.log(number, item.textContent);
                  if(cat.endsWith("text")) console.log("\n");
                  }
                  */
        if(cat) {
          if(cat.endsWith("date")) object.date=item.textContent;
          if(cat.endsWith("time")) object.time=item.textContent;
          if(cat.endsWith("rubric")) object.rubric=item.textContent;
          if(cat.endsWith("name")) object.name=item.textContent;
          if(cat.endsWith("title")) object.title=item.textContent;
          if(cat.endsWith("text")) {
            object.text=item.textContent;
            eventList.push(object);
            object = {};
          }
        }
      });
        if(counter === 0){
          console.log("on "+myday.format("/YYYY/MM/DD/")+" "+eventList.length+" events recorded");
        } else {
          console.log("on "+myday.format("/YYYY/MM/DD/")+" "+eventList.length+" events recorded");
          counter--;
          myday.add(1,"day");
          fetchPage(counter, url);
          }
    });
}
//http://www.stadtrevue.de/tageskalender/tageskalender-results/konzerte/2016/10/5/
fetchPage(dayOfMonth, "http://www.stadtrevue.de/tageskalender/tageskalender-results/");
console.log("ready");
