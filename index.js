var jsdom = require("jsdom");
var moment = require("moment");
var myday = moment();
var eventList = [];
var object = {};
var CAT = "konzerte";
var l = [];
var dayOfMonth = 3;
var fetchDatePage = function(counter, url) {
  jsdom.env(
    url+CAT+myday.format("/YYYY/MM/DD/"),
    ["http://code.jquery.com/jquery.js"],
    function (err, window) {
      var links = window.$(".tx-srtk-pi1-rubricView a")
      .each(function(i, a) { l.push(a.href); });
      if(l.length > 0){
        console.log("on xxx"+myday.format("/YYYY/MM/DD/")+" "+eventList.length+" events recorded");
        fetchPage(counter,l.shift());
      } else {
        if(counter === 0){
          console.log("on "+myday.format("/YYYY/MM/DD/")+" "+eventList.length+" events recorded");
          require('fs').writeFile(
            './events.json',
            JSON.stringify(eventList),
            function (err) {
              if (err) {
                console.error('Crap happens');
              }
            }
          );
        } else {
          console.log("on "+myday.format("/YYYY/MM/DD/")+" "+eventList.length+" events recorded");
          counter--;
          myday.add(1,"day");
          fetchDatePage(counter, url);
          }
      }
    });
}
var fetchPage = function(counter, url) {
  jsdom.env(
    url,
    ["http://code.jquery.com/jquery.js"],
    function (err, window) {
      var root = window.$(".tx-srtk-pi1-listrow");
      root.children().map(function(number, item) {
        var cat = item.classList["0"];
        if(cat) {
          if(cat.endsWith("date"))
            object.date=item.textContent;
          else
            object.date=myday.format("DD.MM.YYYY");
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
      if(l.length > 0){
        console.log("on xxx"+myday.format("/YYYY/MM/DD/")+" "+eventList.length+" events recorded");
        fetchPage(counter,l.pop());
      } else {
        if(counter === 0){
          console.log("on "+myday.format("/YYYY/MM/DD/")+" "+eventList.length+" events recorded");
          require('fs').writeFile(
            './events.json',
            JSON.stringify(eventList),
            function (err) {
              if (err) {
                console.error('Crap happens');
              }
            }
          );
        } else {
          console.log("on "+myday.format("/YYYY/MM/DD/")+" "+eventList.length+" events recorded");
          counter--;
          myday.add(1,"day");
          var url = "http://www.stadtrevue.de/tageskalender/tageskalender-results/";
          fetchDatePage(counter, url);
        }
      }
    });
}
//http://www.stadtrevue.de/tageskalender/tageskalender-results/konzerte/2016/10/5/
fetchDatePage(dayOfMonth, "http://www.stadtrevue.de/tageskalender/tageskalender-results/");
console.log("begin fetching...");
