var commandLineArgs = require("command-line-args");
var jsdom = require("jsdom");
var moment = require("moment");
var fs = require("fs");
var eventsLib = require("./events-lib");
var Iconv  = require('iconv').Iconv;
// convert from UTF-8 to ISO-8859-1
var iconv = new Iconv('UTF-8', 'ISO-8859-1');

var options = commandLineArgs([
  {name: "tage", alias: "t", type: Number},
  {name: "datum", alias: "d", type: String},
  {name: "cats", alias: "c", type: String},
  {name: "max", alias: "m", type: Number},
  {name: "url", alias: "u", type: String}
]);
console.log(JSON.stringify(options));

var myday = options.datum?moment(options.datum.split('/').join('-')):moment();
var eventsList = [];
var object = {};
var allCats = "(partys|kinder|konzerte|bar-sounds|theater|tanz|kleinkunst|kunst|literatur|schwul-lesbisch|diverses|maerkte)";
var max = options.max || 5;
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
		fs.writeFile(
		  "./events.txt",
		  iconv.convert(eventsLib.makeText(eventsList)),
		  function (err) {
		    if(err){
		      console.log("Fehler beim Schreiben der Datei events.txt im Format  ISO-8859-1");
		    }
		  });
		return;
  } else {
    console.log(url + (CAT==="start"?"konzerte":CAT) + date.format("/YYYY/MM/DD/"));
    jsdom.env(
      url + (CAT==="start"?"konzerte":CAT) + date.format("/YYYY/MM/D/"),
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
                object.time=item.textContent.split(" ").join(" ");
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
                var preis = eventsLib.textFilter(object.text, max);
                console.log(preis,object.text);
                if(preis !== 100){
                  object.preis = preis;
                  object.pretext = "Ak "+preis+" ";
                  eventsList.push(object);
                }
                object = {};
              }
            }
          });
        }
        if(catsOnDay.length > 0){
          category = catsOnDay.shift();
          fetchDatePage(counter, url, category, date);
        } else {
          console.log(window.$(".tx-srtk-pi1-rubricView a").length, " Elemente");
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
