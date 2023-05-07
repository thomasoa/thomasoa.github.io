// A crude way to create scrambled deal strategies
import { modular_inverse, safe_mod } from "./modinverse";
var MultiplierScrambler = /** @class */ (function () {
    function MultiplierScrambler(pages, multiplier, translate) {
        var inverse = modular_inverse(pages, multiplier);
        this.scramble = function (pageNo) { return safe_mod(pageNo * multiplier + translate, pages); };
        this.unscramble = function (pageNo) { return safe_mod((pageNo - translate) * inverse, pages); };
    }
    return MultiplierScrambler;
}());
var ScrambleStrategy = /** @class */ (function () {
    function ScrambleStrategy(baseStrategy, scrambler) {
        this.base = baseStrategy;
        this.scrambler = scrambler;
    }
    Object.defineProperty(ScrambleStrategy.prototype, "signature", {
        get: function () { return this.base.signature; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScrambleStrategy.prototype, "pages", {
        get: function () { return this.base.pages; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ScrambleStrategy.prototype, "lastPage", {
        get: function () { return this.base.lastPage; },
        enumerable: false,
        configurable: true
    });
    ScrambleStrategy.prototype.computePageContent = function (pageNo) {
        var basePage = this.scrambler.scramble(pageNo);
        return this.base.computePageContent(basePage);
    };
    ScrambleStrategy.prototype.computePageNumber = function (deal) {
        var basePage = this.base.computePageNumber(deal);
        return this.scrambler.unscramble(basePage);
    };
    return ScrambleStrategy;
}());
function scramble_book(base, multiplier, translate) {
    var scrambler = new MultiplierScrambler(base.signature.pages, multiplier, translate);
    return new ScrambleStrategy(base, scrambler);
}
export { MultiplierScrambler, ScrambleStrategy, scramble_book };
