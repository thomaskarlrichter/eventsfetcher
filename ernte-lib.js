/*
 * stellt die funtionen von ernte als module zur verfügung
 * gintoki added to nitrous
 */

function ernte() {
  var NEUEORTE = ""; //gefundene neue orte
  var ERROR_MESSAGE = ": Fehler! \r\n";
  var HALT = false; //soll das skript beendet werden?

  var CALENDAR_DATE = new Array(3); //YYYY-MM-DD
  var CATS_NAME = []; //die Veranstaltungs-Kategorien
  var CATS_ID = [];//die zugeordneter rubrikid
  var CATS_CONTENT =[]; //der gelesene inhalt der rubrik
  var CATS_DB_NAME = []; //der name der zugehörigen rubrik in der datenbank

  var logdata = "";

  function initCats(){
    var i = -1;

    CATS_NAME[++i] = "Partys";
    CATS_ID[i] = 28;
    CATS_DB_NAME[i] = "Parties/Disco";

    CATS_NAME[++i] = "Kinder";
    CATS_ID[i] = 2;
    CATS_DB_NAME[i] = "Kinder";

    CATS_NAME[++i] = "Konzerte";
    CATS_ID[i] = 5;
    CATS_DB_NAME[i] = "Konzert";

    CATS_NAME[++i] = "bar-sounds";
    CATS_ID[i] = 100;
    CATS_DB_NAME[i] = "Bar Sounds";

    // CATS_NAME[++i] = "Radio";
    // CATS_ID[i] = 100;
    // CATS_DB_NAME[i] = "Radio";

    CATS_NAME[++i] = "Theater";
    CATS_ID[i] = 11;
    CATS_DB_NAME[i] = "Theater";

    // CATS_NAME[++i] = "Film";
    // CATS_ID[i] = 10;
    // CATS_DB_NAME[i] = "Film";

    CATS_NAME[++i] = "Tanz";
    CATS_ID[i] = 7;
    CATS_DB_NAME[i] = "Tanz";

    CATS_NAME[++i] = "Kleinkunst";
    CATS_ID[i] = 1;
    CATS_DB_NAME[i] = "Kleinkunst";

    CATS_NAME[++i] = "Kunst";
    CATS_ID[i] = 8;
    CATS_DB_NAME[i] = "Kunst";

    CATS_NAME[++i] = "Literatur";
    CATS_ID[i] = 9;
    CATS_DB_NAME[i] = "Literatur";

    CATS_NAME[++i] = "SchwulLesbisch";
    CATS_ID[i] = 16;
    CATS_DB_NAME[i] = "Schwul-lesbisch";

    // CATS_NAME[++i] = "Sport";
    // CATS_ID[i] = 100;
    // CATS_DB_NAME[i] = "Sport";

    CATS_NAME[++i] = "Diverses";
    CATS_ID[i] = 6;
    CATS_DB_NAME[i] = "Diverses";

    CATS_NAME[++i] = "Maerkte";
    CATS_ID[i] = 6;
    CATS_DB_NAME[i] = "Diverses";

  }

  function start(){
    initCats();
    //--- benutzer nach start-datum fragen
    var date=new Date() ;
    var mm=date.getMonth() + 2;
    var yyyy=date.getFullYear();
    if (mm>12)
    {        mm-=12;
      yyyy++;
    }
    var cdate = prompt("Start-Datum eingeben: (YYYY-MM-DD)", yyyy+"-"+toLength2(mm)+"-01");
    // Datum wird in Array mit 3 Feldern ueberfuehrt (1=Jahr,2=Monat,3=Tag)
    CALENDAR_DATE = cdate.split("-");
    // Die Felder im Datumsarray werden von String zu Integer geparsed, dabei fallen
    // fuehrende Nullen weg (bspw. 08=>8), da die URL der Stadtrevue sonst falsch ist
    // bei parseINT ist das ,10 wichtig, da sonst 0x Zahlen dem Oktalzahlensystem
    // zugeordnet werden, die 10 erzwingt immer die Verwendung des Dezimalzahlsystems
    var i;
    for (i=0;i<=2;++i)
    {
      CALENDAR_DATE[i]=parseInt(CALENDAR_DATE[i],10);
    }
    cdate = CALENDAR_DATE.join("/");
    //---
    var days = [];
    var daycount = 0;
    while(!HALT){
      days[daycount++] = new Array(toLength2(CALENDAR_DATE[2])+"."+toLength2(CALENDAR_DATE[1])+"."+CALENDAR_DATE[0],browseCats(cdate));
      // Array days[1,2]: [1]:"01.08.2011/",[2]:"Kategorie"
      cdate = nextDay();
      if(CALENDAR_DATE[2] > 31){
        HALT = true;
      }
    }
    makeText(days);
  }

  // Das Datum im days Array braucht wieder die fuehrende 0 fuer die korrekte Verarbeitung spaeter
  // daher macht diese Funktion aus einem uebergebenen Integer wieder einen String
  // anschliessend wird geprueft, ob der String einstellig ist
  // falls ja, wird dieser eine 0 vorangestellt (deshalb auch toString,
  // weil das mit Integer nicht geht und ausserdem spaeter sowieso wieder
  // ein String daraus zusammengesetzt wird)
  // der Rueckgabewert ist dann in jedem Fall ein String!
  this.toLength2 = function toLength2(x){
    var tL2AddZero = "0";
    var xtoString = "";
    xtoString = x.toString();
    if(xtoString.length == 1){
      x = tL2AddZero.concat(xtoString);
    }
    return (x);
  };

  //zählt den tag hoch und liefert den neuen datums-string
  this.nextDay = function nextDay(){
    CALENDAR_DATE[2]++; //YYYY-MM-DD
    var string = CALENDAR_DATE.join("/");
    return string;
  };

  //führt ein makro aus und liefert ggf. den extrahierten inhalt
  function macro(code){
    var ret = iimPlay("CODE:"+code);
    //alert("ret macro iimplay ist: "+ret);
    switch(ret){
      case 1: //kein Fehler
      case -802: // Firefox Page Timeout

        if(code.match(/(EXTRACT)/)){
          return iimGetLastExtract();
        }
        break;
      case -933: // 404 Page not found!
        return "ERROR404";
      default: //irgendein anderer Fehler oder TIMEOUT beendet das Script

        error_message("Das Script wird beendet. Code: "+ret);
        HALT = true;
    }
    return "";
  }

  //durchpflügt die kategorien zu einem bestimmten datum (film, theater...)
  this.browseCats = function browseCats(cdate){
    var cat;
    var page;
    var pages = []; //result array
    var korrektur;
    for(var i = -1;++i != CATS_NAME.length && !HALT;){
      var extraseiten = 0;
      //evtl. existiert eine 2. oder 3. Seite
      //http://www.stadtrevue.de/tageskalender/tageskalender-results/konzerte/2016/10/15/?tx_srtk_pi1%5Bpointer%5D=2
      //target="_self">Seite 2          ist dann in PageDescription enthalten
      if(!browse(cdate,CATS_NAME[i],-1)){
        page = new Array(1);
        page[0] = CATS_DB_NAME[i];
        pages.push(page);
        continue;
      }
      cat = macro("TAG POS=1 TYPE=DIV ATTR=CLASS:tx-srtk-pi1-rubricAndDateView EXTRACT=TXT");
      message(cdate+" "+CATS_NAME[i]);
      if(cat !== ""){
        //                 alert("in CAT IF: "+cat);
        //                         if(cat != CATS_NAME[i]){ //ggf. hat kategorie falsche ID?
        //                          error_message(cat + " != "+CATS_NAME[i]);
        //                         }else{
        //erst gesamte seite laden
        var script = "TAG POS=1 TYPE=BODY ATTR=* EXTRACT=HTM";
        var text = macro(script);
        //schauen ob extra seiten vorkommen (mehr als 10 Veranstaltungen)
        if(extraseiten === 0 && text.search("target=\"_self\">Seite 2") != -1){
          extraseiten = 1;
          if(text.search("target=\"_self\">Seite 3") != -1){
            extraseiten = 2;//maximal 2 Extraseiten
          }
        }
        //relevante teile der seite filtern
        page = readPage(text);
        page[0] = CATS_DB_NAME[i];
        pages.push(page);
        //                         }
        //seiten 2 und 3 durchgehen falls vorhanden.
        for(var j = 0; j < extraseiten;j++){
          browse(cdate,CATS_NAME[i],j);
          script = "TAG POS=1 TYPE=BODY ATTR=* EXTRACT=HTM";
          text = macro(script);
          page = readPage(text);
          page[0] = CATS_DB_NAME[i];
          pages.push(page);
        }
      }
    }
    return pages;
  };

  //ruft eine kalender seite der stadtrevue auf, die durch datum und kategorie spezifiziert ist
  function browse(cdate,cat,j){
    var url;
    var browseerror;
    if(cdate === ""){
      cdate = nextDay();
    }
    // Beispielurl mit Kategorie und Datum:
    // http://www.stadtrevue.de/tageskalender/theater/2011/8/1/
    url = "http://www.stadtrevue.de/tageskalender/tageskalender-results/"+cat+"/"+cdate;
    if(j != -1){
      url = "http://www.stadtrevue.de/tageskalender/tageskalender-results/"+cat+"/"+cdate+"?tx_srtk_pi1%5Bpointer%5D="+(j+1);
    }
    browseerror = macro("URL GOTO="+url);
    //         alert("browser error? "+browseerror);
    if (browseerror == "ERROR404" )
    {
      error_message(cdate+"\r\n404 Error\r\nSeite nicht gefunden!\r\nFehlerhafte Kategorie?\r\n"+cat);
      return false;
    }
    else { return true; }
    //  return true;
  }

  //liest den inhalt einer seite
  this.readPage = function readPage(text){
    var pd = createPageDescription(text); //seitenbeschreibungs-array
    var tkvort;
    var tkuhrzeit;
    var tktitel;
    var tkbesch;
    var block = 1;
    var result = new Array("#CATS_DB_NAME#");
    var fresult;
    var pusher;
    for(var i = 0;++i != pd.length;){ //durchlaufen der locations (ab 1)
      tkvort = macro("TAG POS="+i+" TYPE=DIV ATTR=CLASS:tx-srtk-pi1-listrowField-name EXTRACT=TXT");
      // entferne ' >' am Schluss
      var k=tkvort.length-1;
      while (k>0 && (tkvort[k]=='>' || tkvort[k]==' ') )
        --k;
      tkvort=tkvort.substr(0,k+1);

      for(j = 0;++j <= pd[i];){ //durchlaufen der termine einer location
        tkbesch = macro("TAG POS="+block+" TYPE=DIV ATTR=CLASS:tx-srtk-pi1-listrowField-text EXTRACT=TXT");
        fresult = filterPreis(tkbesch);
        if(fresult == "gratis"){
          fresult = 0;
        }else{
          if(fresult === false){
            ++block;
            continue;
          }
        }
        tkuhrzeit = macro("TAG POS="+block+" TYPE=DIV ATTR=CLASS:tx-srtk-pi1-listrowField-time EXTRACT=TXT");
        tktitel = macro("TAG POS="+block+" TYPE=DIV ATTR=CLASS:tx-srtk-pi1-listrowField-title EXTRACT=TXT");
        ++block;
        // Da seit August 2011 nicht mehr nur "22:00" als Zeit im Uhrzeit-Extrakt steht, sondern "22:00 Uhr"
        // wird nach " Uhr" gesucht und dieses einfach abgeschnitten. Anschliessend wird die Variable zur
        // Sicherheit noch einmal in einen String konvertiert, falls noetig.
        tkuhrzeit = tkuhrzeit.replace(/\sUhr/,"");
        tkuhrzeit = tkuhrzeit.toString();
        pusher = new Array(trim(tkvort),trim(tkuhrzeit),trim(tktitel),trim(tkbesch),fresult);
        // alert("Push: "+trim(tkvort)+" | "+trim(tkuhrzeit)+" | "+trim(tktitel)+" | "+trim(tkbesch)+" | "+fresult);
        result.push(pusher);
      }
    }
    return result;
  };

  //erzeugt eine beschreibung der seite: [LOCATION ID] -> Anzahl der Termine
  this.createPageDescription = function createPageDescription(text){
    var tkvort = text.split("class=\"tx-srtk-pi1-listrowField-name\"");
    for(var i = -1;++i != tkvort.length;){
      tkvort[i] = tkvort[i].split("class=\"tx-srtk-pi1-listrowField-title\"");
      tkvort[i] = tkvort[i].length - 1;
    }
    return tkvort;
  };

  //nachricht ausgeben
  function message(mess){
    iimDisplay(mess + "\r\n\r\n" + (ERROR_MESSAGE.length > 14 ? ERROR_MESSAGE : ""),1);
  }

  //fehlernachricht
  function error_message(mess){
    // ERROR_MESSAGE = ERROR_MESSAGE+"| "+mess+"\r\n";
    message("ERROR:\r\n"+mess+"\r\n");
  }

  this.makeText = function makeText(days){
    var ctext = "";
    var datum = "";
    var kategorie = "";
    var prev_ort = "";
    var ort = "";
    var uhrzeit = "";
    var titel = "";
    var beschreibung = "";
    var debug;
    for(var i = -1;++i != days.length;){ //tage durchlaufen
      if(datum != days[i][0]){
        datum = days[i][0]; //z.B. 05.03.2010
        ctext += "\r\n\r\n" + datum.substring(0,6)+datum.substring(8,10) + "\r\n";
        kategorie = "";
      }
      for(var j = -1;++j != days[i][1].length;){ //kategorien durchlaufen
        if(kategorie != days[i][1][j][0]){
          kategorie = days[i][1][j][0];
          ctext += "\r\n\r\n" + kategorie;
        }
        for(var k = 0; ++k != days[i][1][j].length;){ //orte durchlaufen
          ort = days[i][1][j][k][0];
          if(prev_ort != ort){
            prev_ort = ort;
            ctext += "\r\n " + ort;
          }
          uhrzeit = days[i][1][j][k][1].replace(/\s+/,' ');
          titel = days[i][1][j][k][2].replace(/\s+/,' ');
          beschreibung = filterOrt(days[i][1][j][k][3],ort + " (" + titel + ")");
          beschreibung = rebuildPrice(beschreibung,days[i][1][j][k][4]);
          ctext += "\r\n    " + uhrzeit + "  " + titel + "\r\n    " + beschreibung+"\r\n";
        }
      }
    }
    printTextToPage((NEUEORTE ? NEUEORTE+"\r\n\r\n\r\n---------------------\r\n\r\n\r\n" : '')+ctext);
    // printTextToPage((NEUEORTE ? NEUEORTE+"\r\n\r\n\r\n---------------------\r\n\r\n\r\n" : '')+ctext+"\n\n\n\n--------------\nLOGDATEN:\n"+logdata);
  };

  //baut die struktur der beschreibung so um, dass der preis am ANFANG steht
  this.rebuildPrice = function rebuildPrice(text,preis){
    var r;
    var remove = [
      "Eintritt",
      "Kinder",
      "Ak",
      "VVK",
      "MVZ"
    ];
    text = text.replace(/Eintritt frei/i,'');
    text = text.replace(/gratis und nicht umsonst/i,'');
    for(var i = -1;++i != remove.length;){
      r = new RegExp(remove[i]+"\\s*\\d+,-","i");
      text = text.replace(r,'');
      r = new RegExp(remove[i]+"\\s*\\d+,\\d+,-","i");
      text = text.replace(r,'');
      r = new RegExp(remove[i]+"\\s*\\d+,\\d+","i");
      text = text.replace(r,'');
      r = new RegExp(remove[i]+"\\s*\\d+,\\d+\s+Euro","i");
      text = text.replace(r,'');
      r = new RegExp(remove[i]+"\\s*\\d+,\\d+.EUR","i");
      text = text.replace(r,'');
      r = new RegExp(remove[i]+"\\s*\\d+,\\d+\s+€","i");
      text = text.replace(r,'');
    }

    // text = text.replace(/\s\w\.+\W/g,'.*');
    text = text.replace(/\s+u\.,/g,' und');
    text = text.replace(/\.,/g,'.');
    text = text.replace(/\s+/g,' ');
    text = text.replace(/\s+\./g,'.');
    text = text.replace(/\.\s*$/g,'');
    text = text.replace(/,\s*$/g,'');

    return (preis > 0 || text === "" ? " Ak "+(preis+"").replace(/\./,',') : "") + " " + text;
  };

  //sucht nach ortsangaben
  this.filterOrt = function filterOrt(text,ortsname){
    var ex = /[^\w]Ort:.*/;
    var orte = text.match(ex);
    if(orte !== null && orte.length !== 0){
      NEUEORTE += "\r\n"+ortsname+" = "+orte[0];
      return text.replace(ex,'');
    }else{
      return text;
    }
  };
  this.textFilter = function(text, limit) {
    var checkCheap = /(eintritt\s+frei|gratis|umsonst|\W([Vv]v|[Aa])k\s+(\d+)|Eintritt\s+(\d+)\,(\d+)|(\d+),-)/;
    var m;
    if(m=text.match(checkCheap)){
      if(m[3]) {
        if(+m[3]<limit) {
          return +m[3];
        } else return 100;
      } else return 0;
    } else
      return 100;
  };

  //filtert inhalte / beschreibungen anhand von preisangaben
  this.filterPreis = function filterPreis(text){
    //Alles > maxPreis € wird ignoriert. (> und nicht >=)
    var maxPreis = 5;
    var positivliste =[ 
      /eintritt\s+frei/i,
      /gratis/i,
      /umsonst/i,
      /Eintritt\s+\d+\,\d+/i,
      /Eintritt\s+\d+/i,
      /\Wak\s+(:?ab\s+)?\d+\,\d+/i,
      /\Wak\s+(:?ab\s+)?\d+/i,
      /\Wvvk\s+\d+\,\d+/i,
      /\Wvvk\s+\d+/i,
      /\Wmvz\s+\d+\,\d+/i,
      /\Wmvz\s+\d+/i,
      /\WKinder\s+\d+/,
      /\d+,-/
    ];
    var negativliste = [];
    var preis;
    var preisarray;
    var teuerst;
    logdata = logdata+"\n"+text+"\n";
    for(var i = -1;++i!=negativliste.length;){
      if(text.search(negativliste[i]) != -1){
        logdata = logdata+"\n"+"negativliste: "+negativliste[i];
        return false;
      }
    }
    for(i = -1;++i!==positivliste.length;){
      if(text.search(positivliste[i]) != -1){
        preisarray = text.match(positivliste[i]);
        teuerst = -1;
        for(var p = -1;++p !== preisarray.length;)
          if (preisarray[p]!==undefined) { //einträge positivliste durchlaufen
            //                        alert("preisarray.length="+preisarray.length+", p="+p+", preisarray[p]="+preisarray[p]);
            preis = numOf(preisarray[p]);
            if(preis !== false){
              if(preis > teuerst){
                teuerst = preis;
              }
              if(preis > maxPreis){
                logdata = logdata+"\n"+preis+">"+maxPreis;
                return false;
              }
            }else if(teuerst == -1){
              teuerst = "gratis"; //gratis, umsonst
            }
          }
        logdata = logdata+"\n"+teuerst+ "Euro";
        return teuerst; //suchergebnis statt true
      }
    }
    logdata = logdata+"\n"+"nichts gefunden...";
    return false;
  };

  //schneidet überstehende spaces ab und entfernt zeilenumbrüche
  this.trim = function trim(text){
    return text.replace(/^\s*/,'').replace(/\s*$/,'').split("\r\n").join(" ").split("\n").join(" ");
  };

  function printTextToPage(text){
    //alert(text);
    macro("URL GOTO=file:///K:/K%C3%B6ln-Action/TestDatenbank/harvest.htm");
    macro("TAG POS=1 TYPE=TEXTAREA ATTR=* CONTENT="+codedText(text));
  }

  this.codedText = function codedText(text){
    var res="";
    for(i = -1; ++i != text.length;){
      res = res + "/" + text.charCodeAt(i);
    }
    return res;
  };

  //liefert den zahlenwert eines strings
  this.numOf = function numOf(sText) {
    var ValidChars = "0123456789,";
    var Char;
    var start = -1;
    var end = -1;

    for (var i = 0; i < sText.length; i++){
      Char = sText.charAt(i);
      if (ValidChars.indexOf(Char) == -1){
        if(start != -1){
          break;
        }
      }else if(start != -1){
        if(Char == ","){ //end-punkt-setzen überspringen
          continue;
        }
      }else{
        start = i;
      }
      if(start != -1){
        end = i;
      }
    }
    if(start == -1 || end == -1){
      return false;
    }
    return sText.substring(start,end+1).replace(/\,/,'.') * 1;
  };
}
module.exports = ernte;
