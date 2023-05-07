import { BridgeBook, SimpleBijection, Seats } from "../bridge/index.js";
import { AndrewsDealStrategy, PavlicekDealStrategy, MultiplierScrambler, bridgeSignature, ScrambleStrategy } from "../numeric/index.js";
function common_scrambler() {
    var multiplier = BigInt("13109994191499930367061460371");
    var translation = BigInt("34563463456363563565356345634");
    return new MultiplierScrambler(bridgeSignature.pages, multiplier, translation);
}
function edition(book, scrambler) {
    var scrambledStrat = new ScrambleStrategy(book.strategy, scrambler);
    var scrambled = new BridgeBook(scrambledStrat, book.seatBijection, book.cardBijection);
    return { normal: book, scrambled: scrambled };
}
function pavlicekBook() {
    var strategy = new PavlicekDealStrategy();
    return new BridgeBook(strategy);
}
function andrewsBook() {
    // We use a seat map to match the original book
    var strategy = new AndrewsDealStrategy();
    var seatBijection = new SimpleBijection(Seats.all, function (seatNumber) { return 3 - seatNumber; });
    return new BridgeBook(strategy, seatBijection);
}
function build_editions(scrambler) {
    var editions = new Map();
    editions.set("Pavlicek", edition(pavlicekBook(), scrambler));
    editions.set("Andrews", edition(andrewsBook(), scrambler));
    return editions;
}
var BookSet = /** @class */ (function () {
    function BookSet() {
        this.scrambler = common_scrambler();
        this.editions = build_editions(this.scrambler);
    }
    BookSet.prototype.names = function () {
        return Array.from(this.editions.keys());
    };
    BookSet.prototype.edition = function (name) {
        var edition = this.editions.get(name);
        if (edition)
            return edition;
        throw new Error('Invalid edition name: ' + name);
    };
    BookSet.prototype.book = function (name, scrambled) {
        if (scrambled === void 0) { scrambled = false; }
        var edition = this.edition(name);
        if (scrambled) {
            return edition.scrambled;
        }
        else {
            return edition.normal;
        }
    };
    BookSet.prototype.unscramble = function (pageNo) {
        // Scrambler uses page numbers strting at zero
        var one = BigInt(1);
        return this.scrambler.unscramble(pageNo - one) + one;
    };
    BookSet.prototype.pageNumbers = function (deal) {
        var _this = this;
        var pages = new Array();
        this.editions.forEach(function (edition, name) {
            var normalPage = edition.normal.getPageNumber(deal);
            var scramblePage = _this.unscramble(normalPage);
            pages.push({ name: name, normal: normalPage, scrambled: scramblePage });
        });
        return pages;
    };
    Object.defineProperty(BookSet.prototype, "lastPage", {
        get: function () {
            return bridgeSignature.pages;
        },
        enumerable: false,
        configurable: true
    });
    return BookSet;
}());
export { BookSet };
