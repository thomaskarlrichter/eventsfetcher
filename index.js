var commandLineArgs = require("command-line-args");
var options = commandLineArgs([
  {name: "tage", alias: "t", type: Number},
  {name: "datum", alias: "d", type: String}
])
console.log(JSON.stringify(options));
var jsdom = require("jsdom");
var moment = require("moment");
var myday = moment(options.datum);
var eventsList = [];
var startCAT = "konzerte";
var l = [];
var includedCat = /(kinder|konzerte)/;

var fetchDatePage = function(counter, url, CAT, date) {
  jsdom.env(
    url+CAT+date.format("/YYYY/MM/DD/"),
    ["http://code.jquery.com/jquery.js"],
    function (err, window) {
      var root = window.$(".tx-srtk-pi1-listrow");
      root.children().map(function(number, item) {
        var object = {};
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
            eventsList.push(object);
          }
        }
      });
      if(!l){
        var links = window.$(".tx-srtk-pi1-rubricView a")
          .each(function(i, a) {
            var cat = a.href.split("/")[5];
            if(cat.match(includedCat))
              l.push(cat);
          });
        console.log(l);
      }
      if(l.length > 0){
        //console.log("on "+CAT.split("/")[5]+ " "+myday.format("/YYYY/MM/DD/")+" "+eventList.length+" events recorded");
        fetchDatePage(counter, url, l.shift(), date);
      } else {
        if(counter === 0){
          console.log("on "+date.format("/YYYY/MM/DD/")+" "+eventsList.length+" events recorded");
          console.log(JSON.stringify(eventsList));
          require('fs').writeFile(
            './events.json',
            JSON.stringify(eventsList, null, 2),
            function (err) {
              if (err) {
                console.error('Crap happens');
              }
            }
          );
        } else {
          console.log("on "+date.format("/YYYY/MM/DD/")+" "+eventsList.length+" events recorded");
          counter--;
          date.add(1,"day");
          fetchDatePage(counter, url, CAT, date);
          }
      }
    });
}
//http://www.stadtrevue.de/tageskalender/tageskalender-results/konzerte/2016/10/5/
fetchDatePage(options.tage, "http://www.stadtrevue.de/tageskalender/tageskalender-results/", startCAT, myday);
console.log("begin fetching...");
