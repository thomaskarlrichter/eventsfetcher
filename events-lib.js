var _ = require("lodash");

var parsePrice = function(str) {
  var price = +str.trim().replace(",",".").replace("-","00");
  return price;
};

var parsePricePrint = function(str) {
  return str.replace(".",",").replace("-","00");
};


exports.parsePrice = parsePrice;

exports.textFilter = function(text, limit) {
  var checkGratis = /(eintritt\s+frei|gratis|umsonst)/i;
  // spende? |eintritt\:\s+spende
  var checkPrice = new RegExp("(vvk|ak|tk|eintritt|erw\\.\\:)\\s+(ab\\s+)?(\\d+\\,\\d+|\\d+\\,\\-)","i");

  var gratis=text.match(checkGratis);
  var price=text.match(checkPrice);
  if(gratis){
    return 0;
  } else if(price) {
    if(parsePrice(price[price.length-1]) <= limit){
      return parsePrice(price[price.length-1]);
    } else {
      return 100;
    }
  } else {
    return 100;
  }
};

exports.getPriceToFrontAndFilter = function(text, limit) {
  var checkGratis = /(eintritt\s+frei|gratis|umsonst)/i;
  // spende? |eintritt\:\s+spende
  var checkPrice = new RegExp("(vvk|ak|tk|eintritt|erw\\.\\:)\\s+(ab\\s+)?(\\d+\\,\\d+|\\d+\\,\\-)","i");

  var gratis=text.match(checkGratis);
  var price=text.match(checkPrice);
  if(gratis){
    return ("Gratis "+ text.substr(0,gratis.index)).trim();
  } else if(price) {
    //console.log("---------------"+price);
    if(parsePrice(price[price.length-1]) <= limit){
      //console.log(price);
      return (price[0] + " " + text.substr(0, price.index)+text.substr(price.index+price[0].length)).trim();
    } else {
      return "tooExpensive";
    }
  } else {
    return "tooExpensive";
  }
};

exports.makeText = function(eventList) {
  var out="";
  var filteredList = _.filter(eventList, function(o) {
    if(o.title === "" | o.title === "undefined" | o.loc_name === "undefined" | o.loc_name === ""| o.loc_name === undefined| o.title === undefined) return false;
    return true;
  });
  var orderedList = _.orderBy(filteredList, ["date", "rubric"], ["asc", "asc"]);
  var datum, rubric;
  orderedList.map(function(element){
    if (element.date !== datum){
      if (datum !== undefined) out = out + "\r\n\r\n";
      datum = element.date;
      rubric = undefined;
      out = out + element.date+"\r\n\r\n";
    }
    if (element.rubric !== rubric){
      rubric = element.rubric;
      out = out + "\r\n" + element.rubric + "\r\n";
    } else {
      out = out + "\r\n";
    }

    out = out + " "+ element.loc_name + "\r\n";
    out = out + "    " + element.time.split(" ")[0] + " " + element.title + "\r\n";
    out = out + "     " + element.pretext + element.text + "\r\n";
  });
  return out;
};
