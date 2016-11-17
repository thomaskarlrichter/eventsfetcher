var chai = require("chai");
var expect = chai.expect;
var eventsLib = require("../events-lib");



describe("events lib", function() {
  describe("filterText has value 27", function() {
    it("should return value 27 if limit is 30", function() {
      //expect(eventsLib.textFilter("(Vocal, Gitarre, Keyboard, Bass, Drums), Jazz, 10. Bandjubiläum, Vvk 27,90 ",30)).to.be.equal(27.90);
      expect(eventsLib.textFilter("Vvk 27,90",30)).to.be.equal(27.90);
    });
    it("should return value 100 if limit is 5", function() {
      expect(eventsLib.textFilter("(Vocal, Gitarre, Keyboard, Bass, Drums), Jazz, 10. Bandjubiläum, Vvk 27,90",5)).to.be.equal(100);
    });
  });
  describe("filter preis ", function() {
    it("should be 100 if price greater limit", function() {
      expect(eventsLib.textFilter("(Schlagzeug, Abschluss Musikstudium), plus Gesang, 2x Gitarre, Keyboard, Bass, Synthesizer, Percussion, Funk, Soul u.m., Vvk 8,-",5)).to.be.equal(100);
    });
  });
  describe("filter preis ", function() {
    it("should be price if price smaller limit", function() {
      expect(eventsLib.textFilter("(Schlagzeug, Abschluss Musikstudium), plus Gesang, 2x Gitarre, Keyboard, Bass, Synthesizer, Percussion, Funk, Soul u.m., Ak 4,-",5)).to.be.equal(4);
    });
  });
  describe("on text without any price", function() {
    it("should be 100", function() {
      expect(eventsLib.textFilter("mit Opener Band, Funk, Soul, Jazz",5)).to.be.equal(100);
    });
  });
  describe("on text with gratis or umsonst", function() {
    it("should be 0", function() {
      expect(eventsLib.textFilter("mit Opener Band, Funk, Soul, Jazz gratis",5)).to.be.equal(0);
    });
    it("should be 0", function() {
      expect(eventsLib.textFilter("mit Opener Band, Funk, Soul, Jazz umsonst",5)).to.be.equal(0);
    });  });
  //"mit Julia Kiefer (Schauspiel) u. dem Rubin Quartett (2x Violine, Viola, Cello), Werke von Tschaikowsky, Vivaldi u. Mozart, Philharmonie Veedel Mini, Erw.: 6,-, Kinder ab 1 Jahr 4,-"
  //"mit dem Theater Zauberflöckchen, ab 3 J., Tk 7,-/10,-. Ort: Mozartstr. 18/Ecke Engelbertstr."
  //"»Ein Scherz und eine Krone«, Gala-Dinner mit Varieté u. Showprogramm, Vvk ab 138,-. Ort: Spiegelzelt, MesseCity Köln, Deutz-Mülheimer-Str."
  
});
