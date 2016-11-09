var commandLineArgs = require("command-line-args");
var options = commandLineArgs([
  {name: "tage", alias: "t", type: Number},
  {name: "datum", alias: "d", type: String},
  {name: "cats", alias: "c", type: String},
  {name: "url", alias: "u", type: String}
]);
console.log(JSON.stringify(options));
var jsdom = require("jsdom");
var moment = require("moment");
var myday = moment(options.datum);
var eventsList = [];
var startCAT = "kinder";
var l = [];
var object = {};
var includedCat = options.cats ? new RegExp(options.cats) : new RegExp("(kinder|konzerte)");

var fetchDatePage = function(counter, url, CAT, date) {
	if(counter === 0){
		console.log("on "+date.format("/YYYY/MM/DD/")+" "+eventsList.length+" events recorded");
		console.log(JSON.stringify(eventsList, null, 1));
		require('fs').writeFile(
			'./events.json',
			JSON.stringify(eventsList, null, 2),
			function (err) {
				if (err) {
					console.error('Fehler beim Schreiben der events-JSON-Datei');
				}
			}
		);
		return;
	} else {
  jsdom.env(
    url + CAT + date.format("/YYYY/MM/DD/"),
    ["http://code.jquery.com/jquery.js"],
    function (err, window) {
      var root = window.$(".tx-srtk-pi1-listrow");
      root.children().map(function(number, item) {
        var cat = item.classList["0"];
        console.log("--->",cat);
        if(cat) {
          if(cat.endsWith("date"))
            object.date=item.textContent;
          else
            object.date=myday.format("DD.MM.YYYY");
          if(cat.endsWith("time")) 
            object.time=item.textContent;
          else if(cat.endsWith("rubric")) 
            object.rubric=item.textContent;
          else if(cat.endsWith("name")) 
            object.name=item.textContent;
          else if(cat.endsWith("title")) 
            object.title=item.textContent;
          else if(cat.endsWith("text")) {
            object.text=item.textContent;
            eventsList.push(object);
            object = {};
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
        fetchDatePage(counter, url, l.shift(), date);
      } else {
          console.log("on "+date.format("/YYYY/MM/DD/")+" "+eventsList.length+" events recorded");
          counter--;
          date.add(1,"day");
          fetchDatePage(counter, url, CAT, date);
      }
    });
  }
};
fetchDatePage(
	options.tage || 1, 
	options.url || "http://www.stadtrevue.de/tageskalender/tageskalender-results/", 
	startCAT, 
	myday);

console.log("begin fetching...");
