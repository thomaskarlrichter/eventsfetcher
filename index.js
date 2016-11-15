var commandLineArgs = require("command-line-args");
var jsdom = require("jsdom");
var moment = require("moment");
var fs = require("fs");
var ernteLib = require("./ernte-lib");
var ernte = new ernteLib();

var options = commandLineArgs([
  {name: "tage", alias: "t", type: Number},
  {name: "datum", alias: "d", type: String},
  {name: "cats", alias: "c", type: String},
  {name: "url", alias: "u", type: String}
]);
console.log(JSON.stringify(options));

var myday = options.datum?moment(options.datum.split('/').join('-')):moment();
var eventsList = [];
var object = {};
var allCats = "(partys|kinder|konzerte|bar-sounds|theater|tanz|kleinkunst|kunst|literatur|schwul-lesbisch|diverses|maerkte)";
var startCAT = "kinder";
var catsOnDay = [];
var includedCat = options.cats ? new RegExp(options.cats) : new RegExp(allCats);



var fetchDatePage = function(counter, url, CAT, date) {
	if(counter === 0){
		console.log("alltogether "+eventsList.length+" events recorded");
		fs.writeFile(
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
      url + (CAT==="start"?"konzerte":CAT) + date.format("/YYYY/MM/DD/"),
      ["http://code.jquery.com/jquery.js"],
      function (err, window) {
        var category;
        if(CAT !== "start"){
          // einlesen der events in die eventsList
          var root = window.$(".tx-srtk-pi1-listrow");
          root.children().map(function(number, item) {
            var cat = item.classList["0"];
            if(cat) {
              if(cat.endsWith("date"))
                object.date=item.textContent;
              else
                object.date=myday.format("DD.MM.YYYY");
              if(cat.endsWith("time")) 
                object.time=item.textContent;
              else if(cat.endsWith("rubric")) 
                object.rubric=item.textContent;
              else if(cat.endsWith("name")) {
                console.log(window.$(item).find("a").attr("href"));
                object.ort_url= window.$(item).find("a").attr("href");
                object.loc_name=item.textContent.slice(0,-2);
              } else if(cat.endsWith("title")) 
                object.title=item.textContent;
              else if(cat.endsWith("text")) {
                object.text=item.textContent;
                object.cheap = ernte.textFilter(object.text, 5);
                eventsList.push(object);
                object = {};
              }
            }
          });
        }
        if(catsOnDay.length > 0){
          category = catsOnDay.shift();
          console.log("fetch on",category);
          fetchDatePage(counter, url, category, date);
        } else {
          window.$(".tx-srtk-pi1-rubricView a").each(function(i, a) {
              var cat = a.href.split("/")[5];
              if(cat.match(includedCat))
                catsOnDay.push(cat);
            });
          console.log(eventsList.length+" events recorded");
          console.log(catsOnDay);
          counter--;
          date.add(1,"day");
          category = catsOnDay.shift();
          console.log("fetch on",category);
          fetchDatePage(counter, url, category, date);
        }
      });
  }
};
fetchDatePage(
	options.tage || 1, 
	options.url || "http://www.stadtrevue.de/tageskalender/tageskalender-results/", 
	"start", 
	myday);

console.log("begin fetching...");
