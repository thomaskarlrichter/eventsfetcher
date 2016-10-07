var fetch = require("fetch");
var parse = require("query-dom").parse;
fetch.fetchUrl("http://www.stadtrevue.de/tageskalender/tageskalender-results/", function(error, meta,body) {
  var dom = parse(body.toString());
  var footer = dom.getElementsByTagName("p")[0];
  console.log(footer);
});
console.log("ready");
