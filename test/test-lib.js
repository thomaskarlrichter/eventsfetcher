var chai = require("chai");
var expect = chai.expect;
var ernte = require("../ernte-lib");
var myErnteLib = new ernte();


describe("ernte lib", function() {
  describe("filter preis ", function() {
    it("should be 100 if price greater limit", function() {
      expect(myErnteLib.textFilter("(Schlagzeug, Abschluss Musikstudium), plus Gesang, 2x Gitarre, Keyboard, Bass, Synthesizer, Percussion, Funk, Soul u.m., Vvk 8,-",5)).to.be.equal(100);
    });
  });
  describe("filter preis ", function() {
    it("should be price if price smaller limit", function() {
      expect(myErnteLib.textFilter("(Schlagzeug, Abschluss Musikstudium), plus Gesang, 2x Gitarre, Keyboard, Bass, Synthesizer, Percussion, Funk, Soul u.m., Ak 4,-",5)).to.be.equal(4);
    });
  });
  describe("filter out", function() {
    it("should be 100 if no price", function() {
      expect(myErnteLib.textFilter("mit Opener Band, Funk, Soul, Jazz",5)).to.be.equal(100);
    });
  });
    describe("filter out", function() {
    it("should be 0 if gratis", function() {
      expect(myErnteLib.textFilter("mit Opener Band, Funk, Soul, Jazz gratis",5)).to.be.equal(0);
    });
  });
});
