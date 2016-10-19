var chai = require("chai");
var expect = chai.expect;
var ernte = require("../ernte-lib");
var myErnteLib = new ernte();

describe("ernte lib", function() {
  describe("trim ", function() {
    it("should remove emty spaces in front and back", function() {
      expect(myErnteLib.trim("  xxx  ")).to.equal("xxx");
    });
  });
  describe("to something", function() {
    it("do it", function() {
      expect(myErnteLib.do).to.exist;
    });
  });
});
