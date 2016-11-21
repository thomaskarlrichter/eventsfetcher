var parsePrice = function(str) {
  return +str.replace(",",".").replace("-","00");
};

exports.parsePrice = parsePrice;

exports.textFilter = function(text, limit) {
  var checkGratis = new RegExp("(eintritt\s+frei"+
                              "|gratis|umsonst)");

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

exports.makeText = function(eventList) {
  var out="";
  eventList.map(function(element){
    out = out + element.date+"\n\n\n";
    out = out + element.rubric + "\n";
    out = out + " "+ element.loc_name + "\n    ";
    out = out + element.time.split(" ")[0] + " " + element.title + "\n     ";
    out = out + element.pretext + element.text + "\n\n\n";
  });
  return out;
};
